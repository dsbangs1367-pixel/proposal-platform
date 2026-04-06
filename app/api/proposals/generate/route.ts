import { NextResponse, type NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Convert simple section array to TipTap JSON
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientName, projectType, scopeDescription, amount, currency,
      timeline, tone, senderCompany, senderName,
    } = body

    const toneGuides: Record<string, string> = {
      formal:       'Formal and authoritative — for government ministries, UN agencies, WHO, World Bank.',
      professional: 'Professional and confident — for corporate clients and international NGOs.',
      friendly:     'Warm and collaborative — for startups, community organizations, and NGO partners.',
    }
    const toneGuide = toneGuides[tone ?? 'formal'] ?? toneGuides.formal

    const systemPrompt = `You are an expert proposal writer for a pan-African digital technology consultancy. ${toneGuide}

Return ONLY a raw JSON object — no markdown fences, no explanation. Use exactly this structure:
{
  "title": "Specific proposal title",
  "sections": [
    { "heading": "Executive Summary", "level": 2, "content": "2-3 sentence overview of the engagement, value, and outcome." },
    { "heading": "Problem Statement & Context", "level": 2, "content": "The specific challenge the client faces, grounded in evidence." },
    { "heading": "Core Challenges Identified", "level": 3, "items": ["Challenge 1", "Challenge 2", "Challenge 3", "Challenge 4"] },
    { "heading": "Proposed Solution", "level": 2, "content": "The intervention: platforms, tools, or approach and why it works." },
    { "heading": "Solution Features & Capabilities", "level": 3, "items": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"] },
    { "heading": "Implementation Approach & Timeline", "level": 2, "content": "Phased delivery approach overview." },
    { "heading": "Phased Delivery", "level": 3, "items": ["Phase 1 (Weeks 1-4): activities", "Phase 2 (Weeks 5-8): activities", "Phase 3 (Weeks 9-12): activities"] },
    { "heading": "Key Milestones", "level": 3, "items": ["M1 — Kickoff: deliverable", "M2 — Design: deliverable", "M3 — Build: deliverable", "M4 — Go-Live: deliverable"] },
    { "heading": "Budget & Investment", "level": 2, "content": "Total investment summary and what it covers." },
    { "heading": "Investment Breakdown", "level": 3, "items": ["Item 1: description and cost", "Item 2: description and cost", "Item 3: description and cost"] },
    { "heading": "Payment Schedule", "level": 3, "items": ["Deposit (40%): due on contract signing", "Milestone (40%): due on Phase 2 completion", "Final (20%): due on go-live"] },
    { "heading": "Terms & Conditions", "level": 2, "content": "This proposal is valid for 30 days. Scope changes require a written Change Request. IP transfers on full payment. Either party may terminate with 14 days written notice." },
    { "heading": "Next Steps", "level": 2, "content": "Sign below to proceed. A 40% deposit confirms the engagement and we will schedule kickoff within 5 business days." }
  ]
}`

    const userPrompt = `Write a proposal with these details:
Client: ${clientName}
Sender: ${senderName} from ${senderCompany}
Project: ${projectType.replace(/_/g, ' ')}
Scope: ${scopeDescription}
Budget: ${amount ? `${currency} ${Number(amount).toLocaleString()}` : 'To be confirmed'}
Timeline: ${timeline || 'To be confirmed'}

Keep each section concise but substantive. Ground content in African/Sierra Leone context where relevant.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3500,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    let text = message.content[0].type === 'text' ? message.content[0].text : ''
    // Strip any accidental markdown fences
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/m, '').trim()

    let parsed: { title?: string; sections?: unknown[] }
    try {
      parsed = JSON.parse(text)
    } catch {
      // If JSON is still broken, return a descriptive error so the UI shows it
      console.error('Claude returned non-JSON:', text.slice(0, 400))
      return NextResponse.json({ error: 'AI returned an invalid response. Please try again.' }, { status: 500 })
    }

    const content = toTipTap((parsed.sections ?? []) as Array<{ heading?: string; level?: number; content?: string; items?: string[] }>)
    return NextResponse.json({ title: parsed.title ?? 'Untitled Proposal', content })

  } catch (err: unknown) {
    console.error('Generation error:', err)
    return NextResponse.json({ error: 'Failed to generate proposal. Please try again.' }, { status: 500 })
  }
}
