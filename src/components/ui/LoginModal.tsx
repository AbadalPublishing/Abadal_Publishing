import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginModal({ open, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<'login'|'register'>('login')
  const [login, setLogin] = useState({ email: '', password: '' })
  const [register, setRegister] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', dob: '', password: '' })

  if (!open) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSuccess?.()
    onClose()
  }

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="eyebrow" style={{ marginBottom: 12 }}>— Almost There —</div>
        <div className="modal-title">
          Sign in to <em>complete your order.</em>
        </div>
        <div className="modal-subtitle">
          Your cart is saved. Sign in or create an account to place your order and track it.
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--hair)', marginBottom: 32 }}>
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1, padding: '14px 0', background: 'none', border: 'none',
              borderBottom: tab === 'login' ? '1px solid var(--bone)' : '1px solid transparent',
              marginBottom: -1, cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase',
              color: tab === 'login' ? 'var(--bone)' : 'var(--dim)',
              transition: 'all .3s',
            }}>
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1, padding: '14px 0', background: 'none', border: 'none',
              borderBottom: tab === 'register' ? '1px solid var(--bone)' : '1px solid transparent',
              marginBottom: -1, cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase',
              color: tab === 'register' ? 'var(--bone)' : 'var(--dim)',
              transition: 'all .3s',
            }}>
            Create Account
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="field"><label>Email <span className="req">*</span></label><input type="email" required value={login.email} onChange={e => setLogin({...login, email: e.target.value})} placeholder="you@example.com" /></div>
            <div className="field"><label>Password <span className="req">*</span></label><input type="password" required value={login.password} onChange={e => setLogin({...login, password: e.target.value})} placeholder="••••••••" /></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="/forgot-password" style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.1em', color: 'var(--dim)', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg">Sign In & Continue</button>
          </form>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-row">
              <div className="field"><label>First Name <span className="req">*</span></label><input required value={register.firstName} onChange={e => setRegister({...register, firstName: e.target.value})} /></div>
              <div className="field"><label>Last Name <span className="req">*</span></label><input required value={register.lastName} onChange={e => setRegister({...register, lastName: e.target.value})} /></div>
            </div>
            <div className="field"><label>Email <span className="req">*</span></label><input type="email" required value={register.email} onChange={e => setRegister({...register, email: e.target.value})} /></div>
            <div className="form-row">
              <div className="field"><label>Phone <span className="req">*</span></label><input type="tel" required value={register.phone} onChange={e => setRegister({...register, phone: e.target.value})} placeholder="+92 3xx xxxxxxx" /></div>
              <div className="field"><label>City <span className="req">*</span></label><input required value={register.city} onChange={e => setRegister({...register, city: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Date of Birth <span className="req">*</span></label><input type="date" required value={register.dob} onChange={e => setRegister({...register, dob: e.target.value})} /></div>
              <div className="field"><label>Password <span className="req">*</span></label><input type="password" required value={register.password} onChange={e => setRegister({...register, password: e.target.value})} placeholder="Min. 8 chars" /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}>Create Account & Place Order</button>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', textAlign: 'center', lineHeight: 1.5 }}>
              By creating an account, you agree to our terms of service and privacy policy.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
