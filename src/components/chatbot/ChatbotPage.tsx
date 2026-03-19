import { Send } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

export const ChatbotPage = () => {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Chatbot" />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        {/* Pulsing badge */}
        <span className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-full animate-pulse">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Coming soon
        </span>

        {/* Static disabled chat UI */}
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm opacity-50 pointer-events-none select-none">
          {/* Messages area */}
          <div className="h-72 p-4 space-y-4 overflow-hidden">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 shrink-0" />
              <div className="bg-slate-100 rounded-xl rounded-tl-none px-4 py-2 text-sm text-slate-500 max-w-xs">
                Ciao! Come posso aiutarti?
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="bg-indigo-600 rounded-xl rounded-tr-none px-4 py-2 text-sm text-white max-w-xs">
                Vorrei sapere lo stato delle richieste pendenti.
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 shrink-0" />
              <div className="bg-slate-100 rounded-xl rounded-tl-none px-4 py-2 text-sm text-slate-500 max-w-xs">
                Al momento hai 3 email in attesa di approvazione.
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-slate-100 p-3 flex gap-2">
            <input
              disabled
              placeholder="Scrivi un messaggio..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
            />
            <button
              disabled
              className="bg-indigo-600/40 text-white px-3 py-2 rounded-lg cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">Questa funzionalità sarà disponibile prossimamente.</p>
      </div>
    </div>
  )
}
