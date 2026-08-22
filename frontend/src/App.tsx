import { useEffect, useState } from 'react'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  const [message, setMessage] = useState<string | null>(null)
  
  const { lastMessage } = useWebSocket()

  useEffect(() => {
    if (lastMessage) {
      setMessage(lastMessage)
    }
  }, [lastMessage])

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 md:p-12">
      
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-muted text-foreground hover:bg-border transition-colors shadow-sm focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          {/* Sun Icon (Visible in Dark Mode) */}
          <svg className="hidden dark:block w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          </svg>
          
          {/* Moon Icon (Visible in Light Mode) */}
          <svg className="block dark:hidden w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          </svg>
        </button>
      </div>

      <section className="flex flex-col items-center w-full max-w-4xl text-center mb-10 mt-8">
        <img src="/logo.png" alt="StokedFleet Logo" className="w-32 h-32 mb-6 drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} />
        
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-flame via-brand-ember to-brand-void mb-8 tracking-tight">
          Core Functionalities
        </h1>
        
        {message && (
          <div className="flex items-start w-full max-w-2xl p-4 my-2 bg-brand-flame/10 border border-brand-flame/30 text-brand-flame rounded-lg shadow-sm text-left">
            <span className="shrink-0 w-3 h-3 rounded-full bg-brand-flame mr-3 mt-1.5 animate-pulse" />
            <span className="font-medium flex-1 min-w-0 break-words overflow-hidden break-all">{message}</span>
          </div>
        )}
      </section>

      <div className="w-full max-w-4xl h-px bg-border my-8 transition-colors duration-300"></div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="group bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg hover:border-brand-void/50 transition-all duration-300">
          <h2 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-brand-void transition-colors">Periodic Polling</h2>
          <p className="text-muted-foreground leading-relaxed">
            Structured aggregated/derived content such as averages/totals for a time window.
          </p>
        </div>
        <div className="group bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg hover:border-brand-core/50 transition-all duration-300">
          <h2 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-brand-core transition-colors">Live Dummy Data Generator</h2>
          <p className="text-muted-foreground leading-relaxed">
            Realtime updates via WebSocket.
          </p>
        </div>
      </section>

      <div className="w-full max-w-4xl h-px bg-border my-8 transition-colors duration-300"></div>
    </main>
  )
}

export default App
