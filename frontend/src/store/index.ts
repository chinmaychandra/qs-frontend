import { create } from 'zustand'

export interface User {
  id: string
  email: string
  role: 'admin' | 'analyst'
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Hardcoded credentials for demo
const DEMO_CREDENTIALS = [
  { email: 'admin@pnb', password: 'admin@2026', user: { id: '1', email: 'admin@pnb', role: 'admin' as const, name: 'System Admin' } },
  { email: 'analyst@pnb', password: 'analyst@2026', user: { id: '2', email: 'analyst@pnb', role: 'analyst' as const, name: 'Security Analyst' } },
]

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: async (email, password) => {
    await new Promise(r => setTimeout(r, 1200)) // simulate API call
    const match = DEMO_CREDENTIALS.find(c => c.email === email && c.password === password)
    if (match) {
      const token = `jwt.${btoa(JSON.stringify({ sub: match.user.id, exp: Date.now() + 86400000 }))}.sig`
      set({ user: match.user, token })
      return true
    }
    return false
  },
  logout: () => set({ user: null, token: null }),
}))

// ─── Scan Store ─────────────────────────────────────────────────────────────

export type RiskTier = 'CRITICAL' | 'QUANTUM_VULNERABLE' | 'TRANSITIONING' | 'QUANTUM_SAFE'

export interface Asset {
  id: string
  host: string
  type: 'API' | 'Web' | 'VPN' | 'System'
  tlsVersion: string
  keyExchange: string
  cipher: string
  certAlgorithm: string
  certExpiry: string
  riskScore: number
  tier: RiskTier
  lastScanned: string
  subdomains: string[]
  remediation: string[]
}

interface ScanState {
  assets: Asset[]
  activeScanId: string | null
  scanProgress: number
  scanPhase: string
  scanTarget: string
  isScanRunning: boolean
  drawerAsset: Asset | null
  setDrawerAsset: (a: Asset | null) => void
  startScan: (host: string) => void
}

const MOCK_ASSETS: Asset[] = [
  {
    id: '1', host: 'api.pnb.co.in', type: 'API', tlsVersion: '1.2',
    keyExchange: 'ECDHE-RSA', cipher: 'AES-128-CBC', certAlgorithm: 'RSA-2048',
    certExpiry: '47 days', riskScore: 87, tier: 'QUANTUM_VULNERABLE',
    lastScanned: '2 hours ago', subdomains: ['api.pnb.co.in', 'api-v2.pnb.co.in'],
    remediation: ['Upgrade TLS to 1.3', 'Replace RSA with ML-KEM-768', 'Replace cert signature with ML-DSA-65']
  },
  {
    id: '2', host: 'netbanking.pnb.co.in', type: 'Web', tlsVersion: '1.2',
    keyExchange: 'RSA', cipher: 'AES-256-CBC', certAlgorithm: 'RSA-4096',
    certExpiry: '12 days', riskScore: 91, tier: 'CRITICAL',
    lastScanned: '1 hour ago', subdomains: ['netbanking.pnb.co.in', 'mobilebanking.pnb.co.in', 'ibanking.pnb.co.in'],
    remediation: ['URGENT: Renew certificate (12 days left)', 'Migrate to TLS 1.3', 'Deploy ML-KEM-768 key exchange', 'Replace RSA-4096 with SLH-DSA-128s']
  },
  {
    id: '3', host: 'vpn.pnb.co.in', type: 'VPN', tlsVersion: '1.3',
    keyExchange: 'X25519', cipher: 'AES-256-GCM', certAlgorithm: 'ECDSA-P384',
    certExpiry: '183 days', riskScore: 54, tier: 'TRANSITIONING',
    lastScanned: '3 hours ago', subdomains: ['vpn.pnb.co.in'],
    remediation: ['Replace ECDSA-P384 with ML-DSA-65', 'Upgrade X25519 to ML-KEM-768 hybrid']
  },
  {
    id: '4', host: 'pqc-pilot.pnb.co.in', type: 'API', tlsVersion: '1.3',
    keyExchange: 'ML-KEM-768', cipher: 'AES-256-GCM', certAlgorithm: 'ML-DSA-65',
    certExpiry: '365 days', riskScore: 8, tier: 'QUANTUM_SAFE',
    lastScanned: '5 minutes ago', subdomains: ['pqc-pilot.pnb.co.in'],
    remediation: []
  },
  {
    id: '5', host: 'payments.pnb.co.in', type: 'API', tlsVersion: '1.2',
    keyExchange: 'DHE-RSA', cipher: 'RC4-128', certAlgorithm: 'RSA-1024',
    certExpiry: '3 days', riskScore: 98, tier: 'CRITICAL',
    lastScanned: '30 minutes ago', subdomains: ['payments.pnb.co.in', 'upi.pnb.co.in'],
    remediation: ['CRITICAL: Cert expires in 3 days', 'Disable RC4 immediately', 'Disable DHE-RSA', 'Upgrade to TLS 1.3 + ML-KEM-768', 'Replace RSA-1024 with ML-DSA-87']
  },
  {
    id: '6', host: 'cdn.pnb.co.in', type: 'Web', tlsVersion: '1.3',
    keyExchange: 'ECDHE', cipher: 'CHACHA20-POLY1305', certAlgorithm: 'ECDSA-P256',
    certExpiry: '298 days', riskScore: 34, tier: 'TRANSITIONING',
    lastScanned: '6 hours ago', subdomains: ['cdn.pnb.co.in', 'static.pnb.co.in'],
    remediation: ['Migrate ECDSA-P256 to ML-DSA-44', 'Plan ECDHE → ML-KEM-512 migration']
  },
]

const SCAN_PHASES = [
  { phase: 'Asset Discovery', pct: 15 },
  { phase: 'TLS Interrogation', pct: 35 },
  { phase: 'Certificate Analysis', pct: 55 },
  { phase: 'PQC Classification', pct: 75 },
  { phase: 'Building CBOM', pct: 90 },
  { phase: 'Complete', pct: 100 },
]

export const useScanStore = create<ScanState>((set, get) => ({
  assets: MOCK_ASSETS,
  activeScanId: null,
  scanProgress: 0,
  scanPhase: '',
  scanTarget: '',
  isScanRunning: false,
  drawerAsset: null,
  setDrawerAsset: (a) => set({ drawerAsset: a }),
  startScan: (host) => {
    if (get().isScanRunning) return
    const scanId = `scan_${Date.now()}`
    set({ activeScanId: scanId, scanProgress: 0, scanPhase: 'Initializing...', scanTarget: host, isScanRunning: true })

    let step = 0
    const interval = setInterval(() => {
      if (step >= SCAN_PHASES.length) {
        clearInterval(interval)
        // add new asset
        const newAsset: Asset = {
          id: Date.now().toString(),
          host,
          type: 'API',
          tlsVersion: Math.random() > 0.5 ? '1.3' : '1.2',
          keyExchange: Math.random() > 0.5 ? 'ECDHE-RSA' : 'ML-KEM-768',
          cipher: 'AES-256-GCM',
          certAlgorithm: Math.random() > 0.6 ? 'RSA-2048' : 'ML-DSA-65',
          certExpiry: `${Math.floor(Math.random() * 365 + 10)} days`,
          riskScore: Math.floor(Math.random() * 60 + 20),
          tier: Math.random() > 0.5 ? 'QUANTUM_VULNERABLE' : 'TRANSITIONING',
          lastScanned: 'just now',
          subdomains: [host],
          remediation: ['Upgrade TLS version', 'Replace with NIST PQC algorithms'],
        }
        set(s => ({ assets: [newAsset, ...s.assets], isScanRunning: false, scanProgress: 100 }))
        return
      }
      const { phase, pct } = SCAN_PHASES[step]
      set({ scanPhase: phase, scanProgress: pct })
      step++
    }, 1400)
  },
}))
