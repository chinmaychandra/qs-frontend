import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/scan', label: 'New Scan', icon: '◎' },
  { to: '/inventory', label: 'Inventory', icon: '▦' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-void/80 overflow-hidden grid-bg">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 flex-shrink-0 bg-surface/80 backdrop-blur-xl border-r border-border/60 flex flex-col"
        style={{ boxShadow: '4px 0 40px rgba(0, 212, 255, 0.14)' }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-lg animate-pulse-glow">
              ⬡
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm leading-none">QuantumShield</div>
              <div className="text-muted text-xs mt-0.5 font-mono">PQC Scanner v1.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-body transition-all duration-200 group
                ${isActive
                  ? 'bg-accent/10 text-accent border border-accent/20 shadow-[0_0_15px_#00d4ff15]'
                  : 'text-muted hover:text-slate-300 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <span className="font-mono text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-subtle">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-muted text-xs truncate">{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="text-muted hover:text-danger transition-colors text-sm" title="Logout">✕</button>
          </div>
          <div className="mt-2 px-3 py-1.5 rounded bg-quantum/5 border border-quantum/20 text-center">
            <span className="text-quantum text-xs font-mono">● SYSTEM ONLINE</span>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-void/30 backdrop-blur-sm">
        <Outlet />
      </main>
    </div>
  )
}
