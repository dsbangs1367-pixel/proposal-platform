import { NextResponse, type NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Convert simple section array to TipTap JSON — avoids asking Claude to generate verbose TipTap directly
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

    const systemPrompt = `You are an expert proposal writer for a pan-African digital technology and public health consultancy. ${toneGuide}

Return ONLY a raw JSON object (no markdown, no explanation) with this exact shape. Follow the template's 9-section structure closely:
{
  "title": "Specific proposal title",
  "sections": [
    {
      "heading": "Executive Summary",
      "level": 2,
      "content": "2-3 sentence overview: what you will deliver, for whom, and the key outcome. Mention total value and timeline."
    },
    {
      "heading": "Problem Statement & Context",
      "level": 2,
      "content": "2-3 sentences describing the specific challenge or gap. Ground it in African/local realities with any relevant data or evidence."
    },
    {
      "heading": "Core Challenges Identified",
      "level": 3,
      "items": ["Challenge 1 — brief impact statement", "Challenge 2 — brief impact statement", "Challenge 3 — brief impact statement", "Challenge 4 — brief impact statement"]
    },
    {
      "heading": "Proposed Solution",
      "level": 2,
      "content": "Describe the intervention: platforms, tools, or systems to be deployed, how they address the gap, and why this approach works."
    },
    {
      "heading": "Solution Features & Capabilities",
      "level": 3,
      "items": ["Feature 1: description and benefit", "Feature 2: description and benefit", "Feature 3: description and benefit", "Feature 4: description and benefit"]
    },
    {
      "heading": "Implementation Approach & Timeline",
      "level": 2,
      "content": "Describe the phased delivery approach. Our implementation follows a Connect → Intelligence → Act & Automate framework."
    },
    {
      "heading": "Phased Delivery",
      "level": 3,
      "items": ["Phase 1 (Weeks 1-4): description of activities", "Phase 2 (Weeks 5-8): description of activities", "Phase 3 (Weeks 9-12): description of activities"]
    },
    {
      "heading": "Key Milestones",
      "level": 3,
      "items": ["M1 — Kickoff: deliverable and date", "M2 — Design complete: deliverable and date", "M3 — Build complete: deliverable and date", "M4 — Go-Live: deliverable and date"]
    },
    {
      "heading": "Budget & Investment",
      "level": 2,
      "content": "The total investment for this engagement is [currency + amount]. All prices include the services described above and are valid for the duration stated on the cover."
    },
    {
      "heading": "Investment Breakdown",
      "level": 3,
      "items": ["Discovery & Planning: description", "Design & Development: description", "Training & Capacity Building: description", "Support & Monitoring: description"]
    },
    {
      "heading": "Payment Schedule",
      "level": 3,
      "items": ["Deposit (40%): due on contract signing", "Milestone Payment (40%): due on Phase 2 completion", "Final Payment (20%): due on go-live and handover"]
    },
    {
      "heading": "Terms & Conditions",
      "level": 2,
      "content": "This proposal is valid for 30 days from the date of issue. Any changes to scope require a written Change Request agreed by both parties. Intellectual property transfers in full to the client upon receipt of final payment. Either party may terminate with 14 days written notice."
    },
    {
      "heading": "Next Steps",
      "level": 2,
      "content": "To proceed, please sign this proposal below. A 40% deposit is required to schedule the project kickoff. We will confirm a kickoff meeting within 5 business days of receiving the signed agreement and deposit."
    }
  ]
}`

    const userPrompt = `Write a proposal with these details:
Client: ${clientName}
Sender: ${senderName} from ${senderCompany}
Project: ${projectType.replace(/_/g, ' ')}
Scope: ${scopeDescription}
Budget: ${amount ? `${currency} ${Number(amount).toLocaleString()}` : 'To be confirmed'}
Timeline: ${timeline || 'To be confirmed'}

Follow the 9-section template structure exactly. Keep each section concise but substantive. Ground content in African/Sierra Leone context where relevant.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    let text = message.content[0].type === 'text' ? message.content[0].text : ''
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim()

    const parsed = JSON.parse(text)
    const content = toTipTap(parsed.sections ?? [])

    return NextResponse.json({ title: parsed.title, content })
  } catch (err: unknown) {
    console.error('Generation error:', err)
    return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 })
  }
}
