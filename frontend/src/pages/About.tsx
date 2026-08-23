import { ShieldCheck, Activity, Map, Zap } from 'lucide-react';
import { FadeIn } from '../components/ui/FadeIn';

export function About() {
  const capabilities = [
    {
      icon: <Activity className="w-6 h-6 text-brand-core" />,
      title: "Live Telemetry",
      description: "Engine health, speed, fuel, and GPS — streamed to your screen as it happens."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-flame" />,
      title: "Early Warnings",
      description: "Alerts fire when something drifts out of range, before it becomes a breakdown."
    },
    {
      icon: <Map className="w-6 h-6 text-brand-ember" />,
      title: "Fleet Map",
      description: "Every vehicle on one map. See where they are, where they've been, and if they're on schedule."
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-void" />,
      title: "Trends & History",
      description: "Charts that show what's improving, what's degrading, and where to focus next."
    }
  ];

  return (
    <div className="w-full flex flex-col items-center pb-24 overflow-hidden">
      {/* Hero */}
      <section className="relative w-full max-w-5xl mx-auto px-6 pt-24 pb-20 flex flex-col items-center text-center">
        <FadeIn direction="down" duration={0.8}>
          <img src="/logo.png" alt="StokedFleet Logo" className="w-28 h-28 mb-8 drop-shadow-xl mx-auto" />
        </FadeIn>
        
        <FadeIn direction="up" duration={0.8} delay={0.2}>
          <h1 className="text-6xl md:text-8xl font-heading tracking-widest mb-4 leading-none uppercase">
            <span className="text-brand-flame">Stoked</span><span className="text-brand-core">Fleet</span>
          </h1>
          <h2 className="text-xl md:text-2xl font-heading text-brand-void uppercase tracking-[0.2em] opacity-90">
            Real-Time Fleet Telemetry
          </h2>
        </FadeIn>

        <FadeIn direction="up" duration={0.8} delay={0.4}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-body mt-8">
            Know what every vehicle in your fleet is doing right now — not what it was doing an hour ago. StokedFleet streams live engine data to your browser so you can spot problems early and keep things moving.
          </p>
        </FadeIn>
      </section>

      {/* Mission Strip */}
      <section className="w-full bg-brand-void text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn direction="none" duration={1}>
            <h3 className="text-3xl md:text-4xl font-heading mb-4 tracking-wide">Energy + Data</h3>
            <p className="text-white/70 font-body text-lg leading-relaxed max-w-2xl mx-auto">
              We built StokedFleet because fleet managers shouldn't need a data science degree to understand their vehicles. Plug in, see what matters, act on it.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Capabilities */}
      <section className="w-full max-w-5xl mx-auto px-6 py-24">
        <FadeIn direction="up">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading text-brand-void uppercase tracking-widest mb-3">
              What It Does
            </h2>
            <p className="text-base text-muted-foreground font-body max-w-xl mx-auto">
              Four things, done well.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap, index) => (
            <FadeIn key={index} direction="up" delay={index * 0.1}>
              <div className="h-full group bg-card p-8 rounded-2xl border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="bg-muted w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {cap.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 font-heading uppercase tracking-wide">
                  {cap.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-body text-sm">
                  {cap.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
      {/* Open Source & Support */}
      <section className="w-full bg-muted/30 py-16 px-6 mt-12 border-t border-border">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <FadeIn direction="up">
            <h3 className="text-2xl font-heading mb-4 tracking-wide text-foreground">Open Source</h3>
            <p className="text-muted-foreground font-body text-base leading-relaxed max-w-xl mx-auto mb-8">
              StokedFleet is built as an open-source project. If you find it useful, consider checking out the source code or supporting the development.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://github.com/akshatparashar22" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-card border border-border rounded-lg text-foreground font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                GitHub Profile
              </a>
              <a 
                href="http://github.com/sponsors/akshatparashar22" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-brand-flame text-white rounded-lg font-medium hover:bg-brand-flame/90 transition-colors flex items-center gap-2 shadow-lg shadow-brand-flame/20"
              >
                Become a Sponsor
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
