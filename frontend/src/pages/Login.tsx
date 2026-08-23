import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { SplitAuthLayout } from '../components/ui/SplitAuthLayout'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      if (response.ok) {
        const user = await response.json()
        login(user)
        navigate('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  return (
    <SplitAuthLayout>
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-muted text-foreground hover:bg-border transition-colors shadow-sm focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          <Sun className="hidden dark:block w-6 h-6" />
          <Moon className="block dark:hidden w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-md p-6">
        <h1 className="text-4xl font-heading text-brand-void mb-8 tracking-widest uppercase">Sign In</h1>
      
      <form onSubmit={handleLogin} className="w-full bg-card p-8 rounded-2xl shadow-sm border border-border flex flex-col gap-5">
        {error && <p className="text-brand-flame font-bold text-sm bg-brand-flame/10 p-3 rounded-lg border border-brand-flame/30">{error}</p>}
        
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground font-bold">Username</label>
          <input 
            type="text"
            className="p-3 rounded-lg bg-background border border-border focus:outline-none focus:border-brand-core focus:ring-1 focus:ring-brand-core transition-all text-foreground"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground font-bold">Password</label>
          <input 
            type="password"
            className="p-3 rounded-lg bg-background border border-border focus:outline-none focus:border-brand-core focus:ring-1 focus:ring-brand-core transition-all text-foreground"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 p-3 rounded-lg bg-brand-void text-white font-bold hover:bg-brand-void/80 hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'AUTHENTICATING...' : 'LOGIN'}
        </button>
        
        <p className="text-center text-sm text-muted-foreground mt-2">
          Don't have an account? <Link to="/signup" className="text-brand-core hover:underline">Sign up</Link>
        </p>
      </form>
      </div>
    </SplitAuthLayout>
  )
}
