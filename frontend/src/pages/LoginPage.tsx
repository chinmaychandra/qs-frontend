import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { motion, AnimatePresence } from 'framer-motion'

// Matrix rain canvas
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()ML-KEM-768-DSA-SLH'
    const fontSize = 14

    let cols = 0
    let drops: number[] = []
    let frameId = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      cols = Math.floor(canvas.width / fontSize)
      drops = Array(cols).fill(1)
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#00d4ff18'
      ctx.font = `${fontSize}px "JetBrains Mono"`
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * fontSize, y * fontSize)
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
    }

    const loop = () => {
      draw()
      frameId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    loop()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreds, setShowCreds] = useState(true)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) navigate('/dashboard')
    else setError('Invalid credentials. Check demo credentials below.')
  }

  return (
    <div className="min-h-screen bg-void/85 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
      <MatrixRain />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #00d4ff08 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl border border-accent/30 bg-accent/5 flex items-center justify-center text-4xl animate-float"
            style={{ boxShadow: '0 0 40px #00d4ff20, inset 0 0 20px #00d4ff08' }}
          >
            ⬡
          </motion.div>
          <h1 className="font-display font-bold text-3xl text-white glow-accent mb-2">QuantumShield</h1>
          <p className="text-muted text-sm font-mono">PNB · Post-Quantum Cryptography Scanner</p>
          <p className="text-muted/60 text-xs mt-1 font-mono">PNB CyberSecurity Hackathon 2026 · IIT Kanpur</p>
        </div>

        {/* Form card */}
        <div className="bg-surface/70 backdrop-blur-xl border border-border rounded-2xl p-8 panel-glow">
          <h2 className="font-display font-semibold text-white text-lg mb-6">System Access</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-muted text-xs font-mono uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@quantumshield.pnb"
                className="w-full bg-void border border-border rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_15px_#00d4ff15] transition-all"
                required
              />
            </div>
            <div>
              <label className="text-muted text-xs font-mono uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-void border border-border rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_15px_#00d4ff15] transition-all"
                required
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-danger text-xs font-mono bg-danger/10 border border-danger/30 rounded-lg px-4 py-2"
                >
                  ✕ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/40 hover:border-accent/70 text-accent font-display font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 relative overflow-hidden group"
              style={{ boxShadow: loading ? 'none' : '0 0 20px #00d4ff15' }}
            >
              {loading ? (
                <span className="font-mono text-sm flex items-center justify-center gap-2">
                  <span className="animate-spin">◎</span> Authenticating...
                </span>
              ) : 'Login →'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <button
            onClick={() => setShowCreds(!showCreds)}
            className="w-full text-center text-xs font-mono text-muted/60 hover:text-accent transition-colors py-2"
          >
            {showCreds ? '▾' : '▸'} Demo Credentials (for testing)
          </button>
          <AnimatePresence>
            {showCreds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-panel border border-border/60 rounded-xl p-4 text-xs font-mono space-y-3"
              >
                <div className="text-warn/80 text-xs mb-2">⚠ DEMO ONLY </div>
                <div>
                  <div className="text-accent mb-1">Admin Account</div>
                  <div className="text-muted">Email: <span className="text-white cursor-pointer" onClick={() => setEmail('admin@pnb')}>admin@pnb</span></div>
                  <div className="text-muted">Pass: <span className="text-white cursor-pointer" onClick={() => setPassword('admin@2026')}>admin@2026  </span></div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="text-quantum mb-1">Analyst Account</div>
                  <div className="text-muted">Email: <span className="text-white cursor-pointer" onClick={() => setEmail('analyst@pnb')}>analyst@pnb</span></div>
                  <div className="text-muted">Pass: <span className="text-white cursor-pointer" onClick={() => setPassword('analyst@2026')}>analyst@2026</span></div>
                </div>
                <div className="text-muted/40 text-xs">Click values to auto-fill</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
