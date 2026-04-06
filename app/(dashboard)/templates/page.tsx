import { createClient } from '@/lib/supabase/server'
import { SYSTEM_TEMPLATES } from '@/lib/templates'
import Link from 'next/link'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's custom templates
  const { data: userTemplates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user!.id)

  const categoryLabel: Record<string, string> = {
    digital_health: 'Digital Health',
    services: 'Services',
    grant: 'Grant',
    consulting: 'Consulting',
    partnership: 'Partnership',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-500 mt-0.5">Start a proposal instantly from a pre-built structure</p>
      </div>

      <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">System Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {SYSTEM_TEMPLATES.map(template => (
          <Link
            key={template.id}
            href={`/proposals/new?template=${template.id}`}
            className="bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-5 text-left transition-all hover:shadow-md group block"
          >
            <div className="mb-3">
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {categoryLabel[template.category] ?? template.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{template.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
          </Link>
        ))}
      </div>

      {userTemplates && userTemplates.length > 0 && (
        <>
          <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wider">My Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTemplates.map(t => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                <p className="text-xs text-gray-400 mt-1 capitalize">{t.category.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
