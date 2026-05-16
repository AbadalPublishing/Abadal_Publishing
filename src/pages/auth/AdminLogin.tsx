import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, AlertCircle } from 'lucide-react'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [step, setStep] = useState<'creds'|'verifying'|'success'>('creds')
  const [error, setError] = useState('')
  const [lastLogin, setLastLogin] = useState<{ ip: string; timestamp: string } | null>(null)
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('verifying')
    try {
      const { user, accessToken, lastLoginIp, lastLoginAt } = await authApi.adminLogin(form)
      setAuth(user, accessToken)
      setLastLogin({
        ip: lastLoginIp || 'First sign-in',
        timestamp: lastLoginAt ? new Date(lastLoginAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : 'First sign-in',
      })
      setStep('success')
      setTimeout(() => navigate('/admin'), 2400)
    } catch (err: any) {
      setStep('creds')
      setError(err.response?.data?.message || 'Invalid credentials or not authorised.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#020202',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(20,20,20,0.4) 0%, #020202 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        opacity: 0.35, mixBlendMode: 'overlay', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '8px 16px', border: '1px solid rgba(196,53,53,0.3)',
          background: 'rgba(196,53,53,0.04)',
          width: 'fit-content', margin: '0 auto 40px',
        }}>
          <Shield size={12} color="#c75353" />
          <span style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.3em', textTransform: 'uppercase', color: '#c75353' }}>
            Restricted · Staff Only
          </span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            fontFamily: 'var(--display)', fontSize: 36, fontWeight: 400,
            fontVariationSettings: "'opsz' 36", letterSpacing: '.02em',
            color: 'var(--silver)', marginBottom: 12,
          }}>ABADAL</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.45em', textTransform: 'uppercase', color: 'var(--dim)' }}>
            The Control Room
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 400, fontVariationSettings: "'opsz' 72", lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 12 }}>
            The keys to <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>the house.</em>
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--dim)', fontSize: 14, lineHeight: 1.5 }}>
            Authorised personnel only. All access is logged.
          </p>
        </div>

        {step === 'success' && lastLogin ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 24, marginBottom: 24, fontVariationSettings: "'opsz' 36" }}>
              Access <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>granted.</em>
            </div>
            <div style={{ padding: 20, border: '1px solid var(--hair)', background: 'rgba(244,242,237,0.015)', textAlign: 'left', marginTop: 24 }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 12 }}>
                Last Sign-In
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--silver)', marginBottom: 4 }}>{lastLogin.timestamp}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.08em', color: 'var(--dim)' }}>IP: {lastLogin.ip}</div>
            </div>
            <div style={{ marginTop: 24, fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--dim)' }}>
              Redirecting to dashboard…
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="field">
              <label>Administrator Email <span className="req">*</span></label>
              <input type="email" required autoComplete="email" placeholder="admin@abadalpublishing.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                disabled={step === 'verifying'} />
            </div>
            <div className="field">
              <label>Password <span className="req">*</span></label>
              <input type="password" required autoComplete="current-password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                disabled={step === 'verifying'} />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid rgba(196,53,53,0.4)', background: 'rgba(196,53,53,0.06)', fontFamily: 'var(--sans)', fontSize: 12, color: '#c75353' }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={step === 'verifying'}
              style={{ marginTop: 12, opacity: step === 'verifying' ? 0.6 : 1 }}>
              <Lock size={13} /> {step === 'verifying' ? 'Verifying…' : 'Enter Control Room'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, padding: 14, border: '1px solid var(--hair)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11.5, color: 'var(--dim)', lineHeight: 1.6 }}>
              This portal is monitored. Failed sign-in attempts are recorded with timestamp & IP.
              Unauthorised access is prohibited under applicable law.
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a href="/" style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--dim)', textDecoration: 'none' }}>
            ← Return to abadalpublishing.com
          </a>
        </div>
      </div>
    </div>
  )
}
