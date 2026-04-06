import Link from 'next/link'
import { FileText, Sparkles, PenLine, CreditCard, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">ProposalFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
              Sign In
            </Link>
            <Link href="/sign-up" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4" />
          AI-powered proposal generation
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Create. Send. Close.<br />
          <span className="text-indigo-600">Professional proposals</span><br />
          in minutes.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Generate high-quality proposals with AI, send a unique link to your client,
          collect their e-signature, and receive payment — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-6 py-3.5 text-base transition-colors">
            Start for free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/sign-in" className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl px-6 py-3.5 text-base transition-colors">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything you need to close deals faster
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Built for consultants, agencies, and digital teams — especially those working across Africa and emerging markets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Sparkles className="w-5 h-5" />, title: 'AI Generation', desc: 'Fill in a brief and Claude AI drafts your full proposal in seconds. Tailored to your client and context.', color: 'bg-indigo-50 text-indigo-600' },
              { icon: <PenLine className="w-5 h-5" />, title: 'E-Signatures', desc: 'Clients sign directly on their unique proposal page — no downloads, no printing.', color: 'bg-purple-50 text-purple-600' },
              { icon: <CreditCard className="w-5 h-5" />, title: 'Payments', desc: 'Accept card, bank transfer, and mobile money via Flutterwave. Built for African and global clients.', color: 'bg-green-50 text-green-600' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Status Tracking', desc: 'Know when a client opens, signs, and pays. Real-time dashboard.', color: 'bg-blue-50 text-blue-600' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">Built for every kind of proposal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Digital Health Consulting', desc: 'WHO, MoH, NGO, and clinic engagements' },
            { label: 'Software Implementation', desc: 'EHR, LMIS, data systems delivery' },
            { label: 'Grant Concept Notes', desc: 'USAID, Gates, Tony Elumelu, EU submissions' },
            { label: 'Supply Chain Consulting', desc: 'Last-mile, cold chain, warehouse projects' },
            { label: 'Training & Capacity Building', desc: 'Staff training, CHW programs, workshops' },
            { label: 'Partnership / MOU', desc: 'Strategic partnerships and joint ventures' },
          ].map(u => (
            <div key={u.label} className="flex items-start gap-3 p-4">
              <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{u.label}</p>
                <p className="text-sm text-gray-500">{u.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to send your first proposal?</h2>
          <p className="text-indigo-200 mb-8">Create an account — it takes less than 2 minutes.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold rounded-xl px-6 py-3.5 text-base hover:bg-indigo-50 transition-colors">
            Create your free account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          © 2026 ProposalFlow · Built for consultants and agencies
        </div>
      </footer>
    </div>
  )
}
