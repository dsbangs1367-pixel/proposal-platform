// Single source of truth for Nexa-Flow core team profiles.
// Imported by both lib/templates.ts and app/api/proposals/generate/route.ts.

export const TEAM_MEMBERS = [
  {
    name: 'Daniel Solomon Bangura',
    title: 'CEO / Country Team Lead',
    expertise: 'executive leadership, donor & government relations, financial oversight, risk management',
  },
  {
    name: 'Karim Sawaneh',
    title: 'Technical Architect / Systems Implementation Advisor',
    expertise: 'system customization, incident management, offline-first design for low-connectivity environments',
  },
  {
    name: 'Amadu Yankay Sesay',
    title: 'Senior Digital Health Specialist',
    expertise: 'requirements gathering, curriculum development, capacity building, government alignment',
  },
  {
    name: 'Chanyama',
    title: 'M&E Manager / Data Systems Specialist',
    expertise: 'M&E framework design, data pipeline development, dashboarding and reporting for decision-making',
  },
] as const

/** Formats team members as bullet-point strings for TipTap templates. */
export function teamBullets(overrides?: Partial<Record<string, string>>): string[] {
  return TEAM_MEMBERS.map(m => {
    const expertise = overrides?.[m.name] ?? m.expertise
    return `${m.name} — ${m.title}: ${expertise}.`
  })
}

/** Returns the team composition block for the AI system prompt. */
export function teamPromptBlock(): string {
  return TEAM_MEMBERS.map(
    m => `    - ${m.name} — ${m.title}: ${m.expertise}`
  ).join('\n')
}
