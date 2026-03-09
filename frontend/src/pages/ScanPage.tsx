import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useScanStore } from '../store'

const PHASES = [
  { key: 'Asset Discovery', icon: '◎', desc: 'DNS resolution · crt.sh CT log mining' },
  { key: 'TLS Interrogation', icon: '⬡', desc: 'sslyze · 300+ cipher probe sweep' },
  { key: 'Certificate Analysis', icon: '◈', desc: 'X.509 chain · expiry · OID extraction' },
  { key: 'PQC Classification', icon: '▦', desc: 'NIST FIPS 203/204/205 tier matching' },
  { key: 'Building CBOM', icon: '◐', desc: 'CycloneDX 1.6 · 30 CERT-In fields' },
  { key: 'Complete', icon: '✓', desc: 'Scan complete · Results saved' },
]

function ScanLog({ target, phase }: { target: string; phase: string }) {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const entries: Record<string, string[]> = {
      'Asset Discovery': [
        `[DNS] Resolving ${target}...`,
        `[DNS] Found A record: 103.45.67.89`,
        `[CT]  Querying crt.sh for ${target}`,
        `[CT]  Discovered 4 subdomains`,
      ],
      'TLS Interrogation': [
        `[TLS] Connecting to ${target}:443`,
        `[TLS] Probing 300+ cipher suites...`,
        `[TLS] Negotiated: TLS 1.2, AES-128-CBC`,
        `[TLS] Key exchange: ECDHE-RSA`,
      ],
      'Certificate Analysis': [
        `[CERT] Fetching X.509 chain...`,
        `[CERT] Subject: CN=${target}`,
        `[CERT] Algorithm: RSA-2048 (sha256WithRSAEncryption)`,
        `[CERT] Expiry: 47 days remaining`,
      ],
      'PQC Classification': [
        `[PQC]  Checking NIST FIPS 203 (ML-KEM)... NOT FOUND`,
        `[PQC]  Checking NIST FIPS 204 (ML-DSA)... NOT FOUND`,
        `[PQC]  RSA-2048 classified as: QUANTUM_VULNERABLE`,
        `[PQC]  Tier assignment: TIER 3 🔴`,
      ],
      'Building CBOM': [
        `[CBOM] Generating CycloneDX 1.6 structure...`,
        `[CBOM] Populating 30 CERT-In Annexure-A fields`,
        `[CBOM] Risk score: 87/100 (HIGH)`,
        `[CBOM] Signing CBOM with Ed25519...`,
      ],
      'Complete': [
        `[DONE] Scan complete. scan_id: abc-${Date.now().toString(36)}`,
        `[DONE] Results saved to PostgreSQL`,
        `[DONE] PQC Badge: QUANTUM_VULNERABLE issued`,
        `[DONE] → Navigating to Inventory...`,
      ],
    }
    const newLogs = entries[phase] || []
    newLogs.forEach((log, i) => {
      setTimeout(() => setLogs(prev => [...prev, log]), i * 300)
    })
  }, [phase, target])

  return (
    <div className="bg-void border border-border rounded-xl p-5 font-mono text-xs max-h-72 min-h-[220px] overflow-y-auto space-y-1">
      {logs.map((log, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            ${log.startsWith('[DONE]') ? 'text-quantum' :
              log.startsWith('[PQC]') ? 'text-warn' :
              log.startsWith('[CERT]') ? 'text-accent' :
              'text-slate-400'}
          `}
        >
          <span className="text-muted/40 mr-2">{String(i + 1).padStart(2, '0')}</span>{log}
        </motion.div>
      ))}
      {logs.length === 0 && <div className="text-muted/40">Awaiting scan start...</div>}
    </div>
  )
}

export default function ScanPage() {
  const [target, setTarget] = useState('')
  const [port, setPort] = useState('443')
  const [type, setType] = useState('API')
  const [profile, setProfile] = useState('Full')
  const [submitted, setSubmitted] = useState(false)
  const { startScan, scanProgress, scanPhase, scanTarget } = useScanStore()
  const navigate = useNavigate()

  const handleScan = () => {
    if (!target) return
    setSubmitted(true)
    startScan(target)
  }

  const handleCsvScan = () => {
    alert('CSV bulk scan: Upload a CSV with hostnames to queue multiple scans. (Backend integration point: POST /api/v1/scan/bulk)')
  }

  const currentPhaseIdx = PHASES.findIndex(p => p.key === scanPhase)

  useEffect(() => {
    if (scanProgress === 100 && submitted) {
      const t = setTimeout(() => navigate('/inventory'), 2500)
      return () => clearTimeout(t)
    }
  }, [scanProgress, submitted])

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display font-bold text-2xl text-white mb-1">New Scan</h1>
        <p className="text-muted text-sm font-mono mb-8">Submit a target domain for quantum cryptography analysis</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-surface/65 backdrop-blur-xl border border-border rounded-2xl p-8 panel-glow"
          >
            {/* Target input */}
            <div className="mb-6">
              <label className="text-muted text-xs font-mono uppercase tracking-wider block mb-2">Target Host</label>
              <div className="flex gap-2">
                <input
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="api.bank.com"
                  className="flex-1 bg-void border border-border rounded-lg px-4 py-3 text-white text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent/60 transition-all"
                />
                <input
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  placeholder=":443"
                  className="w-20 bg-void border border-border rounded-lg px-3 py-3 text-white text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent/60 transition-all text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="text-muted text-xs font-mono uppercase tracking-wider block mb-2">Asset Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full bg-void border border-border rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-accent/60 transition-all"
                >
                  {['API', 'Web', 'VPN', 'System'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-muted text-xs font-mono uppercase tracking-wider block mb-2">Scan Profile</label>
                <select
                  value={profile}
                  onChange={e => setProfile(e.target.value)}
                  className="w-full bg-void border border-border rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-accent/60 transition-all"
                >
                  {['Full', 'Quick', 'Compliance', 'PQC-Only'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleScan}
                disabled={!target}
                className="flex-1 bg-accent/10 hover:bg-accent/20 border border-accent/40 hover:border-accent/70 text-accent font-display font-semibold py-3.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 0 20px #00d4ff10' }}
              >
                ▶ Start Scan
              </button>
              <button
                onClick={handleCsvScan}
                className="px-5 bg-white/5 hover:bg-white/10 border border-border text-muted hover:text-white font-display font-semibold py-3.5 rounded-xl transition-all text-sm"
              >
                ⬆ Upload CSV
              </button>
            </div>

            {/* Quick targets */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-muted text-xs font-mono mb-3">Quick targets (click to fill):</div>
              <div className="flex flex-wrap gap-2">
                {['api.pnb.co.in', 'netbanking.pnb.co.in', 'payments.pnb.co.in', 'vpn.pnb.co.in'].map(h => (
                  <button key={h} onClick={() => setTarget(h)}
                    className="text-xs font-mono text-muted/70 hover:text-accent border border-border hover:border-accent/40 rounded px-3 py-1 transition-all">
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Target header */}
            <div className="bg-surface/60 backdrop-blur-lg border border-border rounded-xl px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-muted text-xs font-mono mb-1">Scanning target</div>
                <div className="text-white font-mono font-semibold">{scanTarget}</div>
              </div>
              <div className="text-right">
                <div className="text-muted text-xs font-mono mb-1">Progress</div>
                <div className="font-display font-bold text-2xl text-accent">{scanProgress}%</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-surface/60 backdrop-blur-lg border border-border rounded-xl p-6">
              <div className="h-2 bg-void rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #00d4ff, #00ff88)', boxShadow: '0 0 10px #00d4ff' }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Phase list */}
              <div className="space-y-3">
                {PHASES.map((phase, i) => {
                  const isDone = i < currentPhaseIdx || scanProgress === 100
                  const isActive = phase.key === scanPhase
                  return (
                    <div key={phase.key} className={`flex items-center gap-4 transition-all duration-300 ${isDone || isActive ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono transition-all
                        ${isDone ? 'bg-quantum/20 border border-quantum text-quantum' :
                          isActive ? 'bg-accent/20 border border-accent text-accent animate-pulse' :
                          'bg-void border border-border text-muted'}`}>
                        {isDone ? '✓' : phase.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-display font-semibold ${isDone ? 'text-quantum' : isActive ? 'text-white' : 'text-muted'}`}>
                          {phase.key}
                          {isActive && <span className="ml-2 text-xs text-accent animate-pulse">running...</span>}
                        </div>
                        <div className="text-muted text-xs font-mono">{phase.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Live log */}
            <div className="bg-surface/60 backdrop-blur-lg border border-border rounded-xl p-6">
              <div className="text-muted text-xs font-mono mb-3 flex items-center gap-2">
                <span className="text-accent animate-pulse">●</span> Live Output
              </div>
              <ScanLog target={scanTarget} phase={scanPhase} />
            </div>

            {scanProgress === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-quantum/10 border border-quantum/30 rounded-xl p-5 text-center"
              >
                <div className="text-quantum font-display font-bold text-lg mb-1">✓ Scan Complete</div>
                <div className="text-muted text-sm">Navigating to Inventory with results...</div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
