// System proposal templates as TipTap JSON content

export const SYSTEM_TEMPLATES = [
  {
    id: 'digital-health-consulting',
    name: 'Digital Health Consulting Proposal',
    category: 'digital_health',
    description: 'For digital health engagements with governments, NGOs, and health facilities.',
    content: buildTemplate([
      { type: 'heading', level: 1, text: 'Digital Health Consulting Proposal' },
      { type: 'heading', level: 2, text: 'Executive Summary' },
      { type: 'paragraph', text: 'This proposal outlines our approach to delivering [Project Name] for [Client Organization]. Our team brings deep expertise in digital health systems implementation across African health contexts, with a track record of deploying proven, interoperable solutions at scale.' },
      { type: 'heading', level: 2, text: 'Problem Statement' },
      { type: 'paragraph', text: 'Describe the specific challenge or gap your client is facing. Reference relevant context — e.g. fragmented data systems, poor last-mile visibility, inadequate reporting infrastructure, etc.' },
      { type: 'heading', level: 2, text: 'Proposed Solution' },
      { type: 'paragraph', text: 'Outline the intervention: the platforms, tools, or systems to be deployed, how they address the identified gap, and what success looks like.' },
      { type: 'heading', level: 2, text: 'Scope of Work' },
      { type: 'bulletList', items: ['Phase 1: Assessment & System Design', 'Phase 2: Implementation & Training', 'Phase 3: Monitoring, Evaluation & Handover'] },
      { type: 'heading', level: 2, text: 'Deliverables' },
      { type: 'bulletList', items: ['System architecture document', 'Deployed and configured platform', 'Training materials and facilitated sessions', 'Post-implementation support for 3 months', 'Final evaluation report'] },
      { type: 'heading', level: 2, text: 'Timeline' },
      { type: 'paragraph', text: 'Total duration: [X months] | Start Date: [Date] | End Date: [Date]' },
      { type: 'heading', level: 2, text: 'Budget' },
      { type: 'paragraph', text: 'Total investment: [Currency] [Amount]. A detailed budget breakdown is available upon request.' },
      { type: 'heading', level: 2, text: 'About Our Team' },
      { type: 'paragraph', text: 'We are a team of experienced digital health professionals with backgrounds in public health, systems implementation, data management, and supply chain. Our work spans Sierra Leone, West Africa, and beyond.' },
      { type: 'heading', level: 2, text: 'Next Steps' },
      { type: 'paragraph', text: 'We invite you to review this proposal and sign below to confirm your intent to proceed. Upon signing, we will schedule a project kickoff meeting within 5 business days.' },
    ]),
  },
  {
    id: 'software-implementation',
    name: 'Software Implementation Services',
    category: 'services',
    description: 'For software deployment, integration, and technical delivery projects.',
    content: buildTemplate([
      { type: 'heading', level: 1, text: 'Software Implementation Proposal' },
      { type: 'heading', level: 2, text: 'Overview' },
      { type: 'paragraph', text: 'This document outlines our proposal to implement [Software/System Name] for [Client]. We will deliver end-to-end implementation including configuration, data migration, integration, user training, and go-live support.' },
      { type: 'heading', level: 2, text: 'Technical Scope' },
      { type: 'bulletList', items: ['System setup and configuration', 'Data migration from legacy systems', 'API integrations with existing tools', 'User access management and security setup', 'Staff training (admin and end-user levels)', 'Go-live support and post-deployment monitoring'] },
      { type: 'heading', level: 2, text: 'Technical Requirements' },
      { type: 'paragraph', text: 'List any prerequisites, infrastructure requirements, or client-side responsibilities.' },
      { type: 'heading', level: 2, text: 'Timeline & Milestones' },
      { type: 'paragraph', text: 'Week 1-2: Discovery & setup | Week 3-4: Configuration | Week 5-6: Testing & Training | Week 7: Go-live | Week 8+: Support' },
      { type: 'heading', level: 2, text: 'Pricing' },
      { type: 'paragraph', text: 'One-time implementation fee: [Amount] | Optional monthly retainer: [Amount]/month' },
      { type: 'heading', level: 2, text: 'Terms' },
      { type: 'paragraph', text: '50% due upon signing. 50% due upon go-live.' },
    ]),
  },
  {
    id: 'grant-concept-note',
    name: 'Grant Concept Note',
    category: 'grant',
    description: 'Structured for WHO, USAID, Gates Foundation, or similar donor submissions.',
    content: buildTemplate([
      { type: 'heading', level: 1, text: 'Concept Note: [Project Title]' },
      { type: 'heading', level: 2, text: 'Applicant Organization' },
      { type: 'paragraph', text: '[Organization Name] | [Country] | [Contact Email]' },
      { type: 'heading', level: 2, text: 'Project Summary' },
      { type: 'paragraph', text: 'In 2-3 sentences, state: what you will do, who it will benefit, and the expected outcome.' },
      { type: 'heading', level: 2, text: 'Problem Statement & Context' },
      { type: 'paragraph', text: 'Describe the problem with data. Reference WHO statistics, national health data, or peer-reviewed evidence. Be specific about the population, geography, and scale of the issue.' },
      { type: 'heading', level: 2, text: 'Proposed Intervention' },
      { type: 'paragraph', text: 'Describe your approach and why it will work. Reference evidence base or similar successful interventions.' },
      { type: 'heading', level: 2, text: 'Theory of Change' },
      { type: 'paragraph', text: 'If [inputs] → then [activities] → then [outputs] → which will lead to [outcomes] → contributing to [long-term impact].' },
      { type: 'heading', level: 2, text: 'Target Beneficiaries' },
      { type: 'paragraph', text: 'Who will benefit directly and indirectly? Provide numbers and demographics.' },
      { type: 'heading', level: 2, text: 'Key Activities & Timeline' },
      { type: 'bulletList', items: ['Month 1-2: Planning and stakeholder engagement', 'Month 3-6: Implementation', 'Month 7-11: Monitoring and adaptation', 'Month 12: Evaluation and reporting'] },
      { type: 'heading', level: 2, text: 'Budget Overview' },
      { type: 'paragraph', text: 'Total funding requested: [Currency] [Amount] | Duration: [X months]' },
      { type: 'heading', level: 2, text: 'SDG Alignment' },
      { type: 'paragraph', text: 'This project contributes to SDG 3 (Good Health and Wellbeing), SDG 9 (Industry, Innovation and Infrastructure), and SDG 17 (Partnerships for the Goals).' },
      { type: 'heading', level: 2, text: 'Organizational Capacity' },
      { type: 'paragraph', text: 'Brief overview of your organization\'s relevant experience, staff capacity, and past results.' },
    ]),
  },
  {
    id: 'general-services',
    name: 'General Services Agreement',
    category: 'consulting',
    description: 'Flexible template for any consulting or services engagement.',
    content: buildTemplate([
      { type: 'heading', level: 1, text: 'Services Proposal' },
      { type: 'heading', level: 2, text: 'Introduction' },
      { type: 'paragraph', text: 'Thank you for the opportunity to submit this proposal. We are pleased to present our recommended approach for [Project/Service Description].' },
      { type: 'heading', level: 2, text: 'Services Offered' },
      { type: 'bulletList', items: ['Service 1', 'Service 2', 'Service 3'] },
      { type: 'heading', level: 2, text: 'Investment' },
      { type: 'paragraph', text: '[Currency] [Amount] — includes all services listed above. Payment terms: [e.g. 50% upfront, 50% on completion].' },
      { type: 'heading', level: 2, text: 'Timeline' },
      { type: 'paragraph', text: 'Estimated duration: [X weeks/months] from signed acceptance.' },
      { type: 'heading', level: 2, text: 'Why Us' },
      { type: 'paragraph', text: 'Describe your unique expertise, credentials, and relevant experience.' },
      { type: 'heading', level: 2, text: 'Next Steps' },
      { type: 'paragraph', text: 'Sign below to accept this proposal. We will reach out within 24 hours to schedule onboarding.' },
    ]),
  },
  {
    id: 'partnership-proposal',
    name: 'Partnership Proposal',
    category: 'partnership',
    description: 'For MOU, joint venture, or strategic partnership initiations.',
    content: buildTemplate([
      { type: 'heading', level: 1, text: 'Partnership Proposal' },
      { type: 'heading', level: 2, text: 'Introduction' },
      { type: 'paragraph', text: 'We write to propose a strategic partnership between [Your Organization] and [Partner Organization]. This partnership would leverage the complementary strengths of both organizations to deliver greater impact in [Domain/Geography].' },
      { type: 'heading', level: 2, text: 'About [Your Organization]' },
      { type: 'paragraph', text: 'Brief overview: mission, track record, capabilities, and geographic reach.' },
      { type: 'heading', level: 2, text: 'Partnership Rationale' },
      { type: 'paragraph', text: 'Why this partnership makes sense. What complementary capabilities does each party bring?' },
      { type: 'heading', level: 2, text: 'Proposed Structure' },
      { type: 'bulletList', items: ['Roles & responsibilities of each party', 'Decision-making process', 'Financial arrangement (if applicable)', 'Communication and reporting cadence'] },
      { type: 'heading', level: 2, text: 'Expected Outcomes' },
      { type: 'bulletList', items: ['Outcome 1', 'Outcome 2', 'Outcome 3'] },
      { type: 'heading', level: 2, text: 'Duration & Review' },
      { type: 'paragraph', text: 'Initial partnership term: [X months/years], with a joint review at [midpoint].' },
      { type: 'heading', level: 2, text: 'Agreement' },
      { type: 'paragraph', text: 'By signing below, both parties agree to explore and formalize this partnership in good faith, subject to a mutually agreed Memorandum of Understanding (MOU).' },
    ]),
  },
]

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }

function buildTemplate(blocks: Block[]) {
  return {
    type: 'doc',
    content: blocks.map(block => {
      if (block.type === 'heading') {
        return {
          type: 'heading',
          attrs: { level: block.level },
          content: [{ type: 'text', text: block.text }],
        }
      }
      if (block.type === 'bulletList') {
        return {
          type: 'bulletList',
          content: block.items.map(item => ({
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
          })),
        }
      }
      return {
        type: 'paragraph',
        content: block.text ? [{ type: 'text', text: block.text }] : [],
      }
    }),
  }
}
