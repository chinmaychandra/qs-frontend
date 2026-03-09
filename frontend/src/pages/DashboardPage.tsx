import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useScanStore, type RiskTier } from '../store'

const TIER_COLORS: Record<RiskTier, string> = {
  CRITICAL: '#ff3366',
  QUANTUM_VULNERABLE: '#ff6600',
  TRANSITIONING: '#00d4ff',
  QUANTUM_SAFE: '#00ff88',
}

const TIER_LABELS: Record<RiskTier, string> = {
  CRITICAL: 'Critical',
  QUANTUM_VULNERABLE: 'Vulnerable',
  TRANSITIONING: 'Transitioning',
  QUANTUM_SAFE: 'Quantum Safe',
}

function StatCard({ label, value, sub, color, delay }: any) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let n = 0
    const step = Math.ceil(value / 40)
    const t = setInterval(() => {
      n = Math.min(n + step, value)
      setCount(n)
      if (n >= value) clearInterval(t)
    }, 30)
    return () => clearInterval(t)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group bg-surface border border-border rounded-xl p-5 relative overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: `0 0 20px ${color}10` }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="text-muted text-xs font-mono uppercase tracking-wider mb-3">{label}</div>
      <div className="font-display font-bold text-4xl" style={{ color }}>{count}</div>
      {sub && <div className="text-muted text-xs mt-1.5">{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-panel border border-border rounded-lg px-3 py-2 text-xs font-mono">
      <div className="text-white font-semibold">{payload[0].name}</div>
      <div style={{ color: payload[0].fill }}>{payload[0].value} assets</div>
    </div>
  )
}

export default function DashboardPage() {
  const { assets, setDrawerAsset } = useScanStore()
  const navigate = useNavigate()

  const tierCounts = assets.reduce((acc, a) => {
    acc[a.tier] = (acc[a.tier] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(tierCounts).map(([tier, count]) => ({
    name: TIER_LABELS[tier as RiskTier],
    value: count,
    color: TIER_COLORS[tier as RiskTier],
  }))

  const barData = [
    { name: 'TLS 1.0/1.1', count: 0 },
    { name: 'TLS 1.2', count: assets.filter(a => a.tlsVersion === '1.2').length },
    { name: 'TLS 1.3', count: assets.filter(a => a.tlsVersion === '1.3').length },
  ]

  const criticalCount = assets.filter(a => a.tier === 'CRITICAL').length
  const vulnerableCount = assets.filter(a => a.tier === 'QUANTUM_VULNERABLE').length
  const safeCount = assets.filter(a => a.tier === 'QUANTUM_SAFE').length
  const alerts = assets.filter(a => parseInt(a.certExpiry) < 30).length

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-white mb-1">Cryptographic Health Dashboard</h1>
            <p className="text-muted text-sm font-mono">PNB Public-Facing Asset Overview · Last updated: just now</p>
          </div>
          <button
            onClick={() => navigate('/scan')}
            className="bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent font-display font-semibold px-5 py-2.5 rounded-lg transition-all text-sm"
            style={{ boxShadow: '0 0 15px #00d4ff10' }}
          >
            + New Scan
          </button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Assets" value={assets.length} sub="public-facing endpoints" color="#00d4ff" delay={0.1} />
        <StatCard label="Quantum Vulnerable" value={vulnerableCount + criticalCount} sub={`${criticalCount} critical priority`} color="#ff3366" delay={0.2} />
        <StatCard label="PQC Ready" value={safeCount} sub="NIST FIPS 203/204/205 compliant" color="#00ff88" delay={0.3} />
        <StatCard label="Critical Alerts" value={alerts} sub="cert expiry < 30 days" color="#ffaa00" delay={0.4} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface/60 backdrop-blur-lg border border-border rounded-xl p-6"
        >
          <h3 className="font-display font-semibold text-white text-sm mb-4">Risk Distribution — PQC Tiers</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs font-mono text-muted">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface/60 backdrop-blur-lg border border-border rounded-xl p-6"
        >
          <h3 className="font-display font-semibold text-white text-sm mb-4">TLS Version Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: '#4a6080', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1629', border: '1px solid #1e2d4a', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                cursor={{ fill: '#00d4ff08' }}
              />
              <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent scans feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface/60 backdrop-blur-lg border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-white text-sm">Recent Scans Feed</h3>
          <button onClick={() => navigate('/inventory')} className="text-accent text-xs font-mono hover:underline">View all →</button>
        </div>

        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-6 text-muted text-xs font-mono uppercase tracking-wider px-4 py-2">
            <span className="col-span-2">Host</span>
            <span>Type</span>
            <span>TLS</span>
            <span>Status</span>
            <span className="text-right">Scanned</span>
          </div>

          {assets.slice(0, 6).map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              onClick={() => { setDrawerAsset(asset); navigate('/inventory') }}
              className="grid grid-cols-6 items-center px-4 py-3 rounded-lg cursor-pointer table-row-hover border-l-2 border-transparent transition-all"
            >
              <span className="col-span-2 text-white text-sm font-mono">{asset.host}</span>
              <span className="text-muted text-xs font-mono">{asset.type}</span>
              <span className={`text-xs font-mono ${asset.tlsVersion === '1.3' ? 'text-quantum' : 'text-warn'}`}>{asset.tlsVersion}</span>
              <span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full
                  ${asset.tier === 'QUANTUM_SAFE' ? 'badge-safe' :
                    asset.tier === 'TRANSITIONING' ? 'badge-transit' :
                    asset.tier === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                  {asset.tier === 'QUANTUM_SAFE' ? '● Safe' :
                    asset.tier === 'TRANSITIONING' ? '◐ Trans.' :
                    asset.tier === 'CRITICAL' ? '⚠ Critical' : '● Vuln.'}
                </span>
              </span>
              <span className="text-muted text-xs font-mono text-right">{asset.lastScanned}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
