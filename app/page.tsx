import { CraterAnalyzer } from "@/components/crater-analyzer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">🌙 Lunar Surface Analyser</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Advanced AI-powered crater detection system for lunar surface analysis. Upload your lunar images to identify
            and analyze crater formations.
          </p>
        </div>

        <CraterAnalyzer />
      </div>
    </main>
  )
}
