import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface SplitAuthLayoutProps {
  children: ReactNode;
}

const CAROUSEL_ITEMS = [
  {
    icon: <Activity className="w-7 h-7 text-brand-core" />,
    title: "Live Fleet Data",
    desc: "See every vehicle's speed, location, and engine health — updated in real time.",
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-brand-flame" />,
    title: "Early Warnings",
    desc: "Get alerts before breakdowns happen, not after.",
  },
  {
    icon: <Zap className="w-7 h-7 text-brand-ember" />,
    title: "Clear Insights",
    desc: "Charts and trends that help you act, not just read numbers.",
  }
];

export function SplitAuthLayout({ children }: SplitAuthLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 relative bg-background text-foreground overflow-hidden flex-col justify-between p-12 border-r border-border">
        {/* Subtle grid that respects theme */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px' 
          }} 
        />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-linear-to-b from-background/60 via-transparent to-background/80" />

        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 drop-shadow-sm" />
            <h2 className="text-3xl font-heading text-brand-flame tracking-widest mt-1">
              STOKED<span className="text-brand-core">FLEET</span>
            </h2>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <h1 className="text-5xl font-heading leading-tight mb-3 text-foreground">
              Energy + Data
            </h1>
            <p className="text-lg text-muted-foreground font-body mb-12">
              Fleet telemetry that keeps you in control — not buried in dashboards.
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="h-40 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
                  <div className="mb-3">
                    {CAROUSEL_ITEMS[currentIndex].icon}
                  </div>
                  <h3 className="font-heading text-2xl mb-1.5 text-foreground">
                    {CAROUSEL_ITEMS[currentIndex].title}
                  </h3>
                  <p className="text-muted-foreground font-body text-base leading-relaxed">
                    {CAROUSEL_ITEMS[currentIndex].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex gap-2 mt-6">
            {CAROUSEL_ITEMS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'w-8 bg-brand-core' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          className="relative z-10 text-muted-foreground/50 text-sm font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          &copy; {new Date().getFullYear()} StokedFleet
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative bg-background">
        {/* Mobile Branding (left panel is hidden on mobile) */}
        <div className="md:hidden flex flex-col items-center text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 mb-3 drop-shadow-sm" />
          <h2 className="text-3xl font-heading text-brand-flame tracking-widest mt-1">
            STOKED<span className="text-brand-core">FLEET</span>
          </h2>
          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider font-bold mt-1.5">
            Real-Time Fleet Telemetry
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
