import { NextResponse, type NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { teamPromptBlock } from '@/lib/team'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Convert section array to TipTap JSON
function toTipTap(sections: Array<{ heading?: string; level?: number; content?: string; items?: string[] }>) {
  const nodes: object[] = []
  for (const section of sections) {
    if (section.heading) {
      nodes.push({
        type: 'heading',
        attrs: { level: section.level ?? 2 },
        content: [{ type: 'text', text: section.heading }],
      })
    }
    if (section.content) {
      nodes.push({
        type: 'paragraph',
        content: [{ type: 'text', text: section.content }],
      })
    }
    if (section.items && section.items.length > 0) {
      nodes.push({
        type: 'bulletList',
        content: section.items.map(item => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
        })),
      })
    }
  }
  return { type: 'doc', content: nodes }
}

/**
 * Robustly extract the JSON object from Claude's response.
 * Tracks brace depth to find the exact end of the top-level object,
 * avoiding false matches from any trailing text that contains '}'.
 */
function extractJSON(text: string): string {
  const start = text.indexOf('{')
  if (start === -1) return text.trim()

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape)          { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"')      { inString = !inString; continue }
    if (inString)        continue
    if (ch === '{')      depth++
    if (ch === '}') {
      depth--
      if (depth === 0)   return text.slice(start, i + 1)
    }
  }
  return text.slice(start).trim()
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to your Vercel environment variables.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { clientName, projectType, scopeDescription, amount, currency, timeline, tone, senderCompany, senderName } = body

    if (!clientName || !projectType || !scopeDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, projectType, scopeDescription' },
        { status: 400 }
      )
    }

    const toneMap: Record<string, string> = {
      formal:       'formal and authoritative (for government, UN agencies, WHO, World Bank)',
      professional: 'professional and confident (for corporate clients and international NGOs)',
      friendly:     'warm and collaborative (for startups, community organizations, NGO partners)',
    }
    const toneDesc = toneMap[tone ?? 'formal'] ?? toneMap.formal

    // Describe the structure in plain words — NOT as an embedded JSON example
    // (embedded JSON examples confuse smaller models like Haiku)
    const systemPrompt = `You are an expert proposal writer for a pan-African digital consultancy. Write in a ${toneDesc} tone.

Output ONLY a raw JSON object — no markdown fences, no preamble, no explanation.

The JSON must have:
- "title": a specific, descriptive proposal title (string)
- "sections": an array of section objects, each with:
    - "heading": the section name (string)
    - "level": 2 for main sections, 3 for sub-sections (number)
    - "content": a paragraph of prose (string) — use this for main sections
    - "items": an array of bullet strings — use this for sub-sections

Include these 15 sections in this exact order:
1.  heading "Executive Summary",              level 2, content  (2-3 sentences: what, for whom, total value, timeline)
2.  heading "Problem Statement & Context",    level 2, content  (specific challenge grounded in local evidence)
3.  heading "Core Challenges Identified",     level 3, items    (4 bullet points)
4.  heading "Proposed Solution",              level 2, content  (the approach and why it works)
5.  heading "Solution Features",              level 3, items    (4-5 bullet points)
6.  heading "Implementation Approach",        level 2, content  (phased delivery overview, 1-2 sentences)
7.  heading "Phased Delivery",               level 3, items    (3 phases with timeframes)
8.  heading "Key Milestones",                level 3, items    (4 milestones: Kickoff, Design, Build, Go-Live)
9.  heading "Our Team",                       level 2, content  (1-2 sentences introducing the team's expertise and track record — mention the sender name and company)
10. heading "Team Composition",              level 3, items    (4 bullet points — use exactly these team members, tailor each description slightly to the project type:
${teamPromptBlock()}
    )
11. heading "Budget & Investment",            level 2, content  (total cost and what it covers)
12. heading "Investment Breakdown",           level 3, items    (3-4 line items)
13. heading "Payment Schedule",              level 3, items    (3 tranches: 40% deposit, 40% milestone, 20% final)
14. heading "Terms & Conditions",             level 2, content  (validity 30 days, IP, termination — keep to 2 sentences)
15. heading "Next Steps",                    level 2, content  (how to proceed, deposit, kickoff timing)`

    const userPrompt = `Write a proposal for this engagement:
Client name: ${clientName}
Sender: ${senderName} at ${senderCompany}
Project type: ${projectType.replace(/_/g, ' ')}
Scope: ${scopeDescription}
Budget: ${amount ? `${currency} ${Number(amount).toLocaleString()}` : 'To be confirmed'}
Timeline: ${timeline || 'To be confirmed'}

Be specific and substantive. Reference African/Sierra Leone context where relevant.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonText = extractJSON(rawText)

    let parsed: { title?: string; sections?: unknown[] }
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      console.error('[generate] JSON parse failed. Raw (first 600 chars):', rawText.slice(0, 600))
      return NextResponse.json(
        { error: 'AI returned an invalid response. Please try again.' },
        { status: 500 }
      )
    }

    const content = toTipTap(
      (parsed.sections ?? []) as Array<{ heading?: string; level?: number; content?: string; items?: string[] }>
    )
    return NextResponse.json({ title: parsed.title ?? 'Untitled Proposal', content })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[generate] Error:', msg)
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 })
  }
}
