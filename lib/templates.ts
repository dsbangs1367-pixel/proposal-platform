// System proposal templates as TipTap JSON content
// Section structure mirrors the Nexa-Flow HTML proposal template

import { teamBullets } from './team'

export const SYSTEM_TEMPLATES = [
  {
    id: 'digital-health-consulting',
    name: 'Digital Health Consulting Proposal',
    category: 'digital_health',
    description: 'For digital health engagements with governments, NGOs, and health facilities.',
    content: buildTemplate([
      { type: 'heading', level: 2, text: 'Executive Summary' },
      { type: 'paragraph', text: 'This proposal outlines our approach to delivering [Project Name] for [Client Organization]. Our team brings deep expertise in digital health systems implementation across African health contexts, with a track record of deploying proven, interoperable solutions at scale. The total investment is [Currency] [Amount] over a [X]-month engagement.' },

      { type: 'heading', level: 2, text: 'Problem Statement & Context' },
      { type: 'paragraph', text: 'Describe the specific challenge or gap your client is facing. Reference relevant context — e.g. fragmented data systems, poor last-mile visibility, inadequate reporting infrastructure, or lack of interoperability between existing platforms.' },
      { type: 'heading', level: 3, text: 'Core Challenges Identified' },
      { type: 'bulletList', items: [
        'Fragmented health information systems with no unified patient view',
        'Manual, paper-based reporting leading to delays and data quality issues',
        'Limited visibility into commodity stocks across facilities',
        'Insufficient digital capacity among frontline health workers',
      ] },

      { type: 'heading', level: 2, text: 'Proposed Solution' },
      { type: 'paragraph', text: 'Outline the intervention: the platforms, tools, or systems to be deployed, how they address the identified gap, and what success looks like. Reference the technology stack and implementation methodology.' },
      { type: 'heading', level: 3, text: 'Solution Features & Capabilities' },
      { type: 'bulletList', items: [
        'Unified digital health platform with role-based access for all facility staff',
        'Offline-first mobile tools for community health workers in low-connectivity areas',
        'Real-time dashboards and automated reporting aligned to national DHIS2 standards',
        'Interoperability layer connecting existing EMR/EHR systems via FHIR APIs',
        'Integrated training and change management programme for sustainable adoption',
      ] },

      { type: 'heading', level: 2, text: 'Implementation Approach & Timeline' },
      { type: 'paragraph', text: 'Our implementation follows a proven Connect → Intelligence → Act & Automate framework — delivering value incrementally in each phase while building toward full platform intelligence.' },
      { type: 'heading', level: 3, text: 'Phased Delivery' },
      { type: 'bulletList', items: [
        'Phase 1 — Connect (Weeks 1–4): Discovery, system configuration, and baseline data migration',
        'Phase 2 — Integrate & Train (Weeks 5–8): Staff training, pilot deployment, and system integration',
        'Phase 3 — Go-Live & Support (Weeks 9–12): Full rollout, monitoring, and 90-day post-launch support',
      ] },
      { type: 'heading', level: 3, text: 'Key Milestones' },
      { type: 'bulletList', items: [
        'M1 — Project Kickoff: Signed agreement + deposit received',
        'M2 — System Design Approved: Architecture document and UAT plan signed off',
        'M3 — Pilot Complete: System live at pilot site with trained users',
        'M4 — Full Go-Live: All sites onboarded and reporting through the platform',
      ] },

      { type: 'heading', level: 2, text: 'Our Team' },
      { type: 'paragraph', text: 'Nexa-Flow is led by a multidisciplinary founding team combining deep expertise in public health, digital systems architecture, data intelligence, and pan-African programme management. Each team member brings a verified track record of delivery at national and international scale.' },
      { type: 'heading', level: 3, text: 'Team Composition' },
      { type: 'bulletList', items: teamBullets() },

      { type: 'heading', level: 2, text: 'Budget & Investment' },
      { type: 'paragraph', text: 'The total investment for this engagement is [Currency] [Amount]. All costs are inclusive of configuration, training, travel, and 90-day post-launch support. Prices are valid for 30 days from the date of issue.' },
      { type: 'heading', level: 3, text: 'Investment Breakdown' },
      { type: 'bulletList', items: [
        'Discovery & System Design: [Amount] — requirements gathering, architecture, and planning',
        'Platform Configuration & Build: [Amount] — setup, customisation, and integration work',
        'Training & Capacity Building: [Amount] — trainer materials, facilitated sessions, and ToT',
        'Support & Monitoring (90 days): [Amount] — post-launch helpdesk and performance review',
      ] },
      { type: 'heading', level: 3, text: 'Payment Schedule' },
      { type: 'bulletList', items: [
        'Deposit (40%): due upon contract signing',
        'Milestone Payment (40%): due upon Phase 2 completion and pilot sign-off',
        'Final Payment (20%): due upon full go-live and handover documentation',
      ] },

      { type: 'heading', level: 2, text: 'Terms & Conditions' },
      { type: 'paragraph', text: 'This proposal is valid for 30 days from the date of issue. Changes to scope require a written Change Request agreed by both parties and may affect timeline and pricing. Intellectual property transfers in full to the client upon receipt of final payment. Either party may terminate with 14 days written notice; work completed to date will be invoiced accordingly. Governing law: Republic of Sierra Leone.' },

      { type: 'heading', level: 2, text: 'Next Steps' },
      { type: 'paragraph', text: 'To proceed, please review and sign this proposal below. A 40% deposit is required to confirm the engagement and schedule the project kickoff. We will confirm a kickoff meeting within 5 business days of receiving the signed agreement and deposit.' },
    ]),
  },

  {
    id: 'software-implementation',
    name: 'Software Implementation Services',
    category: 'services',
    description: 'For software deployment, integration, and technical delivery projects.',
    content: buildTemplate([
      { type: 'heading', level: 2, text: 'Executive Summary' },
      { type: 'paragraph', text: 'This proposal outlines our approach to implementing [Software/System Name] for [Client Organization]. We will deliver end-to-end implementation including configuration, data migration, integration, user training, and go-live support. Total investment: [Currency] [Amount] over [X] weeks.' },

      { type: 'heading', level: 2, text: 'Problem Statement & Context' },
      { type: 'paragraph', text: 'Describe the current system limitations, manual processes, or integration gaps that this implementation will resolve.' },
      { type: 'heading', level: 3, text: 'Core Challenges Identified' },
      { type: 'bulletList', items: [
        'Legacy system limitations preventing efficient data flow',
        'Manual processes creating bottlenecks and error risk',
        'Lack of integration between existing tools',
        'Insufficient reporting capability for decision-making',
      ] },

      { type: 'heading', level: 2, text: 'Proposed Solution' },
      { type: 'paragraph', text: 'We will implement [Software Name] — a proven platform that addresses each of the challenges above through configuration, integration, and training tailored to your specific context.' },
      { type: 'heading', level: 3, text: 'Technical Scope' },
      { type: 'bulletList', items: [
        'System setup, configuration, and security hardening',
        'Data migration from legacy systems with validation and audit trail',
        'API integrations with existing tools and platforms',
        'User access management and role-based permissions',
        'Admin and end-user training (facilitated sessions + documentation)',
        'Go-live support and 60-day post-deployment monitoring',
      ] },

      { type: 'heading', level: 2, text: 'Implementation Approach & Timeline' },
      { type: 'paragraph', text: 'Implementation follows a structured sprint-based approach ensuring quality at each stage before proceeding to the next.' },
      { type: 'heading', level: 3, text: 'Phased Delivery' },
      { type: 'bulletList', items: [
        'Week 1–2: Discovery, environment setup, and data audit',
        'Week 3–4: Configuration, customisation, and initial data migration',
        'Week 5–6: Integration testing, UAT, and staff training',
        'Week 7: Go-live and hypercare support',
        'Week 8+: Monitoring, optimisation, and handover',
      ] },
      { type: 'heading', level: 3, text: 'Key Milestones' },
      { type: 'bulletList', items: [
        'M1 — Environment Ready: System provisioned and base configuration complete',
        'M2 — UAT Sign-Off: All user acceptance tests passed by client team',
        'M3 — Training Complete: All staff trained and competency-assessed',
        'M4 — Go-Live: System in full production use',
      ] },

      { type: 'heading', level: 2, text: 'Our Team' },
      { type: 'paragraph', text: 'Our implementation team brings together technical architects, digital health specialists, and programme managers with proven experience delivering enterprise software in African contexts.' },
      { type: 'heading', level: 3, text: 'Team Composition' },
      { type: 'bulletList', items: teamBullets({
        'Karim Sawaneh': 'system configuration, integrations, incident management, and go-live support',
        'Amadu Yankay Sesay': 'staff training, curriculum development, capacity building, and sustained adoption',
        'Chanyama': 'analytics setup, data pipeline development, dashboard configuration, and performance monitoring',
      }) },

      { type: 'heading', level: 2, text: 'Budget & Investment' },
      { type: 'paragraph', text: 'One-time implementation fee: [Currency] [Amount]. Optional monthly support retainer: [Amount]/month. All prices are valid for 30 days from date of issue.' },
      { type: 'heading', level: 3, text: 'Payment Schedule' },
      { type: 'bulletList', items: [
        'Deposit (50%): due upon contract signing',
        'Final Payment (50%): due upon go-live sign-off',
      ] },

      { type: 'heading', level: 2, text: 'Terms & Conditions' },
      { type: 'paragraph', text: 'This proposal is valid for 30 days. Scope changes require a written Change Request. IP transfers on full payment. Either party may terminate with 14 days notice.' },

      { type: 'heading', level: 2, text: 'Next Steps' },
      { type: 'paragraph', text: 'Sign below and submit the 50% deposit to confirm this engagement. We will schedule a kickoff call within 3 business days.' },
    ]),
  },

  {
    id: 'grant-concept-note',
    name: 'Grant Concept Note',
    category: 'grant',
    description: 'Structured for WHO, USAID, Gates Foundation, or similar donor submissions.',
    content: buildTemplate([
      { type: 'heading', level: 2, text: 'Executive Summary' },
      { type: 'paragraph', text: 'In 2–3 sentences, state what you will do, who it will benefit, the expected outcome, and the total funding requested.' },

      { type: 'heading', level: 2, text: 'Problem Statement & Context' },
      { type: 'paragraph', text: 'Describe the problem with data. Reference WHO statistics, national health data, or peer-reviewed evidence. Be specific about the population, geography, and scale of the issue.' },
      { type: 'heading', level: 3, text: 'Core Challenges Identified' },
      { type: 'bulletList', items: [
        'Challenge 1 — quantified impact on target population',
        'Challenge 2 — systemic barrier and evidence base',
        'Challenge 3 — gap in existing response or service delivery',
        'Challenge 4 — risk of inaction',
      ] },

      { type: 'heading', level: 2, text: 'Proposed Intervention' },
      { type: 'paragraph', text: 'Describe your approach and why it will work. Reference the evidence base or similar successful interventions in comparable contexts. Explain how this is different from existing approaches.' },
      { type: 'heading', level: 3, text: 'Theory of Change' },
      { type: 'paragraph', text: 'If [inputs are provided] → then [key activities occur] → then [outputs are produced] → which will lead to [short-term outcomes] → contributing to [long-term impact aligned to SDG X].' },

      { type: 'heading', level: 2, text: 'Implementation Approach & Timeline' },
      { type: 'paragraph', text: 'Implementation will follow a phased approach ensuring rigorous monitoring and adaptive management at each stage.' },
      { type: 'heading', level: 3, text: 'Phased Delivery' },
      { type: 'bulletList', items: [
        'Month 1–2: Planning, stakeholder engagement, and baseline assessment',
        'Month 3–8: Core implementation activities and community mobilisation',
        'Month 9–11: Scale-up, monitoring, and adaptive management',
        'Month 12: Final evaluation, documentation, and knowledge sharing',
      ] },
      { type: 'heading', level: 3, text: 'Key Milestones' },
      { type: 'bulletList', items: [
        'M1 — Inception Report: Baseline assessment and work plan approved by donor',
        'M2 — Mid-Term Review: Progress report with M&E data submitted',
        'M3 — Scale-Up Decision: Evidence review and go/no-go for expansion',
        'M4 — Final Report: Evaluation findings and lessons learned documented',
      ] },

      { type: 'heading', level: 2, text: 'Our Team' },
      { type: 'paragraph', text: 'Nexa-Flow brings a multidisciplinary team with a track record of delivering evidence-based digital health programmes in collaboration with WHO, Ministry of Health, AFENET, CDC, and major bilateral donors.' },
      { type: 'heading', level: 3, text: 'Team Composition' },
      { type: 'bulletList', items: teamBullets({
        'Daniel Solomon Bangura': 'strategic leadership, government engagement, donor relations, financial oversight, and programme oversight',
        'Amadu Yankay Sesay': 'government alignment, requirements gathering, curriculum development, and health systems strengthening',
        'Chanyama': 'Theory of Change design, M&E framework development, data pipeline creation, and impact dashboards for donor reporting',
      }) },

      { type: 'heading', level: 2, text: 'Budget & Investment' },
      { type: 'paragraph', text: 'Total funding requested: [Currency] [Amount] over [X] months. Budget is structured to maximise direct programme spend (>70%) while ensuring adequate M&E and overhead.' },
      { type: 'heading', level: 3, text: 'Budget Overview' },
      { type: 'bulletList', items: [
        'Personnel & Consultants: [Amount] — core team salaries and specialist inputs',
        'Programme Activities: [Amount] — direct delivery costs',
        'Monitoring & Evaluation: [Amount] — data collection, analysis, and reporting',
        'Overheads & Administration: [Amount] — project management and indirect costs',
      ] },

      { type: 'heading', level: 2, text: 'SDG Alignment & Impact' },
      { type: 'paragraph', text: 'This project contributes to SDG 3 (Good Health and Wellbeing), SDG 9 (Industry, Innovation and Infrastructure), and SDG 17 (Partnerships for the Goals). Describe the specific targets and indicators this project will contribute to.' },

      { type: 'heading', level: 2, text: 'Next Steps' },
      { type: 'paragraph', text: 'We welcome the opportunity to discuss this concept note and refine the approach in collaboration with [Donor Organization]. Please contact [Name] at [Email] to arrange a scoping call at your earliest convenience.' },
    ]),
  },

  {
    id: 'general-services',
    name: 'General Services Agreement',
    category: 'consulting',
    description: 'Flexible template for any consulting or services engagement.',
    content: buildTemplate([
      { type: 'heading', level: 2, text: 'Executive Summary' },
      { type: 'paragraph', text: 'Thank you for the opportunity to submit this proposal. We are pleased to present our recommended approach for [Project/Service Description] for [Client Organization]. Total investment: [Currency] [Amount]. Estimated duration: [X] weeks.' },

      { type: 'heading', level: 2, text: 'Problem Statement & Context' },
      { type: 'paragraph', text: 'Describe the specific challenge or need your client is facing and the context in which this engagement sits.' },
      { type: 'heading', level: 3, text: 'Core Challenges Identified' },
      { type: 'bulletList', items: ['Challenge 1', 'Challenge 2', 'Challenge 3'] },

      { type: 'heading', level: 2, text: 'Proposed Solution' },
      { type: 'paragraph', text: 'Outline the services to be delivered and how they will address the challenges described above.' },
      { type: 'heading', level: 3, text: 'Services Offered' },
      { type: 'bulletList', items: ['Service 1 — brief description', 'Service 2 — brief description', 'Service 3 — brief description'] },

      { type: 'heading', level: 2, text: 'Implementation Approach & Timeline' },
      { type: 'paragraph', text: 'Describe the delivery approach and overall timeline for this engagement.' },
      { type: 'heading', level: 3, text: 'Phased Delivery' },
      { type: 'bulletList', items: [
        'Phase 1: Discovery and planning',
        'Phase 2: Core delivery',
        'Phase 3: Review and handover',
      ] },

      { type: 'heading', level: 2, text: 'Our Team' },
      { type: 'paragraph', text: 'Our team combines strategic, technical, and operational expertise to deliver this engagement with quality and accountability at every stage.' },
      { type: 'heading', level: 3, text: 'Team Composition' },
      { type: 'bulletList', items: teamBullets() },

      { type: 'heading', level: 2, text: 'Budget & Investment' },
      { type: 'paragraph', text: 'Total investment: [Currency] [Amount] — inclusive of all services listed above. Payment terms: [e.g. 50% upfront, 50% on completion]. Prices valid for 30 days.' },
      { type: 'heading', level: 3, text: 'Payment Schedule' },
      { type: 'bulletList', items: ['Deposit (50%): due on signing', 'Final payment (50%): due on delivery'] },

      { type: 'heading', level: 2, text: 'Terms & Conditions' },
      { type: 'paragraph', text: 'This proposal is valid for 30 days. Scope changes require written agreement. IP transfers on full payment. Either party may terminate with 14 days written notice.' },

      { type: 'heading', level: 2, text: 'Next Steps' },
      { type: 'paragraph', text: 'Sign below to accept this proposal. We will reach out within 24 hours to schedule the project kickoff.' },
    ]),
  },

  {
    id: 'partnership-proposal',
    name: 'Partnership Proposal',
    category: 'partnership',
    description: 'For MOU, joint venture, or strategic partnership initiations.',
    content: buildTemplate([
      { type: 'heading', level: 2, text: 'Executive Summary' },
      { type: 'paragraph', text: 'We write to propose a strategic partnership between [Your Organization] and [Partner Organization]. This partnership would leverage the complementary strengths of both organizations to deliver greater impact in [Domain/Geography].' },

      { type: 'heading', level: 2, text: 'Problem Statement & Context' },
      { type: 'paragraph', text: 'Describe the shared challenge or opportunity that makes this partnership timely and necessary.' },
      { type: 'heading', level: 3, text: 'Core Challenges Addressed' },
      { type: 'bulletList', items: [
        'Challenge that neither organization can address alone',
        'Gap in the current landscape this partnership will fill',
        'Stakeholder need that requires combined expertise',
      ] },

      { type: 'heading', level: 2, text: 'Proposed Partnership Structure' },
      { type: 'paragraph', text: 'Describe how this partnership will function: roles and responsibilities, decision-making, financial arrangement (if applicable), and communication cadence.' },
      { type: 'heading', level: 3, text: 'Roles & Responsibilities' },
      { type: 'bulletList', items: [
        '[Your Organization]: lead on [specific function/geography]',
        '[Partner Organization]: lead on [specific function/geography]',
        'Joint: shared responsibilities and governance',
      ] },

      { type: 'heading', level: 2, text: 'Implementation Approach & Timeline' },
      { type: 'paragraph', text: 'The partnership will proceed in three stages, with a formal review at the midpoint to assess progress and alignment.' },
      { type: 'heading', level: 3, text: 'Phased Delivery' },
      { type: 'bulletList', items: [
        'Phase 1 (Month 1–3): MOU signing, joint workplan development, and initial activities',
        'Phase 2 (Month 4–9): Core partnership activities and co-delivery',
        'Phase 3 (Month 10–12): Review, learning, and decision on renewal/expansion',
      ] },

      { type: 'heading', level: 2, text: 'Expected Outcomes' },
      { type: 'bulletList', items: ['Outcome 1 — measurable target', 'Outcome 2 — measurable target', 'Outcome 3 — measurable target'] },

      { type: 'heading', level: 2, text: 'Our Team' },
      { type: 'paragraph', text: 'Nexa-Flow brings executive leadership, technical depth, and on-the-ground programme experience to this partnership — ensuring credible co-delivery from day one.' },
      { type: 'heading', level: 3, text: 'Team Composition' },
      { type: 'bulletList', items: teamBullets({
        'Karim Sawaneh': 'technical integration, platform interoperability, and joint system design',
        'Amadu Yankay Sesay': 'joint programme design, curriculum development, stakeholder engagement, and capacity building',
        'Chanyama': 'shared monitoring frameworks, data pipeline development, joint reporting, and impact measurement',
      }) },

      { type: 'heading', level: 2, text: 'Terms & Conditions' },
      { type: 'paragraph', text: 'Initial partnership term: [X months], commencing on the date of MOU signing. Either party may withdraw with 30 days written notice. All IP created jointly will be co-owned unless otherwise agreed in the MOU.' },

      { type: 'heading', level: 2, text: 'Next Steps' },
      { type: 'paragraph', text: 'By signing below, both parties confirm their intent to formalize this partnership. An MOU will be drafted and circulated for review within 10 business days of signature.' },
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
