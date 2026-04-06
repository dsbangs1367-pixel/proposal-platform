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
      formal: 'Formal and authoritative — for government ministries, UN agencies, WHO, World Bank.',
      professional: 'Professional and confident — for corporate clients and international NGOs.',
      friendly: 'Warm and collaborative — for startups, community organizations, and NGO partners.',
    }
    const toneGuide = toneGuides[tone ?? 'formal'] ?? toneGuides.formal

    const systemPrompt = `You are an expert proposal writer for a pan-African digital technology and public health consultancy. ${toneGuide}

Return ONLY a raw JSON object (no markdown, no explanation) with this exact shape:
{
  "title": "Specific proposal title",
  "sections": [
    { "heading": "Executive Summary", "level": 2, "content": "2-3 sentence summary paragraph" },
    { "heading": "Problem Statement", "level": 2, "content": "paragraph" },
    { "heading": "Proposed Solution", "level": 2, "content": "paragraph" },
    { "heading": "Scope of Work", "level": 2, "items": ["item 1", "item 2", "item 3"] },
    { "heading": "Deliverables", "level": 2, "items": ["deliverable 1", "deliverable 2"] },
    { "heading": "Timeline", "level": 2, "content": "paragraph" },
    { "heading": "Investment", "level": 2, "content": "paragraph" },
    { "heading": "About Us", "level": 2, "content": "2-3 sentences" },
    { "heading": "Next Steps", "level": 2, "content": "paragraph" }
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
      max_tokens: 2048,
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
