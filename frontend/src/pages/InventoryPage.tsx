import { useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScanStore, type Asset, type RiskTier } from '../store'

const TIER_COLORS: Record<RiskTier, string> = {
  CRITICAL: '#ff3366',
  QUANTUM_VULNERABLE: '#ff6600',
  TRANSITIONING: '#00d4ff',
  QUANTUM_SAFE: '#00ff88',
}

const TIER_LABELS: Record<RiskTier, string> = {
  CRITICAL: '⚠ Critical',
  QUANTUM_VULNERABLE: '● Vulnerable',
  TRANSITIONING: '◐ Transitioning',
  QUANTUM_SAFE: '● Quantum Safe',
}

function RiskMeter({ score }: { score: number }) {
  const color = score >= 80 ? '#ff3366' : score >= 50 ? '#ffaa00' : '#00ff88'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-void rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      <span className="text-xs font-mono font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

function AssetDrawer({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const downloadCBOM = () => {
    const cbom = {
      bomFormat: 'CycloneDX',
      specVersion: '1.6',
      version: 1,
      metadata: { timestamp: new Date().toISOString(), component: { name: asset.host } },
      components: [{
        type: 'cryptographic-asset',
        name: asset.host,
        properties: [
          { name: 'tls-version', value: asset.tlsVersion },
          { name: 'key-exchange', value: asset.keyExchange },
          { name: 'cipher', value: asset.cipher },
          { name: 'cert-algorithm', value: asset.certAlgorithm },
          { name: 'cert-expiry', value: asset.certExpiry },
          { name: 'risk-score', value: String(asset.riskScore) },
          { name: 'pqc-tier', value: asset.tier },
        ]
      }]
    }
    const blob = new Blob([JSON.stringify(cbom, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cbom-${asset.host.replace(/\./g, '-')}.json`
    a.click()
  }

  const downloadPDF = () => {
    alert(`PDF Report for ${asset.host}\n\nIn production: POST /api/v1/scan/${asset.id}/report\nReturns a signed, audit-ready PDF with CERT-In Annexure-A fields.`)
  }

  const color = TIER_COLORS[asset.tier]

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-96 bg-surface border-l border-border z-50 flex flex-col overflow-hidden"
      style={{ boxShadow: `-20px 0 60px ${color}15` }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-mono text-white font-bold text-sm">{asset.host}</div>
            <div className="text-muted text-xs mt-0.5">Last scanned: {asset.lastScanned}</div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">✕</button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full border font-bold"
            style={{ background: `${color}15`, borderColor: `${color}60`, color }}>
            {TIER_LABELS[asset.tier]}
          </span>
          <span className="text-xs font-mono text-muted">Risk: <span className="text-white font-bold">{asset.riskScore}/100</span></span>
        </div>
        <div className="mt-3">
          <RiskMeter score={asset.riskScore} />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* TLS fields */}
        <div>
          <div className="text-muted text-xs font-mono uppercase tracking-wider mb-3">Cryptographic Details</div>
          <div className="space-y-2">
            {[
              { label: 'TLS Version', value: asset.tlsVersion, warn: asset.tlsVersion !== '1.3' },
              { label: 'Key Exchange', value: asset.keyExchange, warn: !asset.keyExchange.startsWith('ML-KEM') },
              { label: 'Cipher Suite', value: asset.cipher, warn: asset.cipher.includes('CBC') || asset.cipher.includes('RC4') },
              { label: 'Cert Algorithm', value: asset.certAlgorithm, warn: !asset.certAlgorithm.startsWith('ML-') && !asset.certAlgorithm.startsWith('SLH-') },
              { label: 'Cert Expiry', value: asset.certExpiry, warn: parseInt(asset.certExpiry) < 60 },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted text-xs font-mono">{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-xs font-mono">{row.value}</span>
                  {row.warn && <span className="text-warn text-xs">⚠</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subdomains */}
        {asset.subdomains.length > 0 && (
          <div>
            <div className="text-muted text-xs font-mono uppercase tracking-wider mb-3">Discovered Subdomains</div>
            <div className="space-y-1.5">
              {asset.subdomains.map(s => (
                <div key={s} className="bg-void border border-border/50 rounded px-3 py-1.5 text-xs font-mono text-accent">{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Remediation */}
        {asset.remediation.length > 0 && (
          <div>
            <div className="text-muted text-xs font-mono uppercase tracking-wider mb-3">Remediation Steps</div>
            <div className="space-y-2">
              {asset.remediation.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-danger font-mono text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span className="text-slate-300 text-xs font-mono leading-relaxed"
                    style={step.startsWith('URGENT') || step.startsWith('CRITICAL') ? { color: '#ff3366' } : {}}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PQC Badge */}
        <div>
          <div className="text-muted text-xs font-mono uppercase tracking-wider mb-3">PQC Badge</div>
          <div className="bg-void border rounded-lg p-3 text-center"
            style={{ borderColor: `${color}40` }}>
            <div className="font-display font-bold text-sm mb-0.5" style={{ color }}>{asset.tier.replace(/_/g, ' ')}</div>
            <div className="text-muted text-xs font-mono">Ed25519 Signed · CycloneDX 1.6</div>
          </div>
        </div>
      </div>

      {/* Download buttons */}
      <div className="p-4 border-t border-border space-y-2">
        <button onClick={downloadCBOM}
          className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-sm font-mono py-2.5 rounded-lg transition-all">
          ⬇ Download CBOM JSON
        </button>
        <button onClick={downloadPDF}
          className="w-full bg-white/5 hover:bg-white/10 border border-border text-muted hover:text-white text-sm font-mono py-2.5 rounded-lg transition-all">
          ⬇ Download PDF Report
        </button>
      </div>
    </motion.div>
  )
}

export default function InventoryPage() {
  const { assets, drawerAsset, setDrawerAsset } = useScanStore()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterRisk, setFilterRisk] = useState('All')
  const [sortCol, setSortCol] = useState<'host' | 'riskScore' | 'tier'>('riskScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = assets
    .filter(a => {
      const matchSearch = a.host.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'All' || a.type === filterType
      const matchRisk = filterRisk === 'All' || a.tier === filterRisk
      return matchSearch && matchType && matchRisk
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortCol === 'riskScore') return mul * (a.riskScore - b.riskScore)
      if (sortCol === 'host') return mul * a.host.localeCompare(b.host)
      return mul * a.tier.localeCompare(b.tier)
    })

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  return (
    <div className="p-8 relative">
      {/* Drawer overlay */}
      <AnimatePresence>
        {drawerAsset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerAsset(null)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <AssetDrawer asset={drawerAsset} onClose={() => setDrawerAsset(null)} />
          </>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display font-bold text-2xl text-white mb-1">Asset Inventory</h1>
        <p className="text-muted text-sm font-mono mb-6">Cryptographic inventory of all public-facing assets</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hosts..."
            className="w-full bg-surface border border-border rounded-lg pl-8 pr-4 py-2.5 text-white text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent/60 transition-all"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-accent/60 transition-all">
          {['All', 'API', 'Web', 'VPN', 'System'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-accent/60 transition-all">
          {['All', 'CRITICAL', 'QUANTUM_VULNERABLE', 'TRANSITIONING', 'QUANTUM_SAFE'].map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="text-muted text-xs font-mono ml-auto">{filtered.length} assets</div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-surface/60 backdrop-blur-lg border border-border rounded-xl overflow-x-auto">
        {/* Table header */}
        <div className="grid grid-cols-7 min-w-[900px] text-muted text-xs font-mono uppercase tracking-wider px-5 py-3 border-b border-border bg-void/40">
          <button className="col-span-2 text-left hover:text-accent transition-colors flex items-center gap-1"
            onClick={() => handleSort('host')}>
            Host {sortCol === 'host' && (sortDir === 'asc' ? '↑' : '↓')}
          </button>
          <span>Type</span>
          <span>TLS</span>
          <button className="text-left hover:text-accent transition-colors flex items-center gap-1"
            onClick={() => handleSort('tier')}>
            Status {sortCol === 'tier' && (sortDir === 'asc' ? '↑' : '↓')}
          </button>
          <button className="text-left hover:text-accent transition-colors flex items-center gap-1"
            onClick={() => handleSort('riskScore')}>
            Risk {sortCol === 'riskScore' && (sortDir === 'asc' ? '↑' : '↓')}
          </button>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-border/50">
          {filtered.map((asset, i) => {
            const color = TIER_COLORS[asset.tier]
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="tier-row grid grid-cols-7 items-center px-5 py-3.5 hover:bg-white/[0.03] transition-all cursor-pointer group"
                style={{ '--tier-color': color } as CSSProperties}
                onClick={() => setDrawerAsset(asset)}
              >
                <div className="col-span-2">
                  <div className="text-white text-sm font-mono group-hover:text-accent transition-colors">{asset.host}</div>
                  <div className="text-muted text-xs mt-0.5">{asset.lastScanned}</div>
                </div>
                <span className="text-muted text-xs font-mono">{asset.type}</span>
                <span className={`text-xs font-mono font-semibold ${asset.tlsVersion === '1.3' ? 'text-quantum' : 'text-warn'}`}>
                  {asset.tlsVersion}
                </span>
                <span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full border"
                    style={{ background: `${color}15`, borderColor: `${color}50`, color }}>
                    {TIER_LABELS[asset.tier]}
                  </span>
                </span>
                <div className="pr-4">
                  <RiskMeter score={asset.riskScore} />
                </div>
                <div className="text-right">
                  <button
                    onClick={e => { e.stopPropagation(); setDrawerAsset(asset) }}
                    className="text-xs font-mono text-accent/70 hover:text-accent border border-accent/20 hover:border-accent/50 px-3 py-1 rounded transition-all"
                  >
                    [View]
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted font-mono text-sm">
          No assets match your filters
        </div>
      )}
    </div>
  )
}
