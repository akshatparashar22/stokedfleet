import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'

// Lazy load the pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })))
const Alerts = lazy(() => import('./pages/Alerts').then(m => ({ default: m.Alerts })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })))

// A simple loading fallback to show while the chunk is being downloaded
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center w-full mt-32">
    <div className="w-10 h-10 border-4 border-brand-void border-t-brand-core rounded-full animate-spin"></div>
    <p className="mt-4 font-heading tracking-widest text-muted-foreground animate-pulse">LOADING...</p>
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />
          
          {/* Authenticated Routes wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
