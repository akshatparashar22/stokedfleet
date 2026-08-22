export function About() {
  return (
    <div className="flex flex-col items-center w-full">
      <section className="flex flex-col items-center w-full max-w-4xl text-center mb-10 mt-8">
        <img src="/logo.png" alt="StokedFleet Logo" className="w-40 h-40 mb-4 drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} />
        
        <h1 className="text-7xl md:text-9xl font-heading tracking-wider mb-2 mt-4 leading-none drop-shadow-sm">
          <span className="text-brand-flame">STOKED</span><span className="text-brand-core">FLEET</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-heading text-brand-void mb-8 uppercase tracking-[0.2em] opacity-90">
          Real-Time Fleet Telemetry
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Experience the power of real-time data streaming with our WebSocket-based solution. Stay updated with live data and insights.
        </p>
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
    </div>
  )
}
