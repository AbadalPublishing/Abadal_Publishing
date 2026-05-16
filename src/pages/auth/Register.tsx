import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', dateOfBirth: '', password: '' })
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore(s => s.setAuth)
  const mergeCart = useCartStore(s => s.mergeWithServer)
  const navigate = useNavigate()
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, [k]: e.target.value})

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, accessToken } = await authApi.register(form)
      setAuth(user, accessToken)
      await mergeCart()
      toast.success('Account created')
      navigate('/account/orders')
    } catch (err: any) {
      toast.error(err.response?.data?.message?.[0] || err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '120px 24px 80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link to="/" style={{ fontFamily: 'var(--display)', fontSize: 28, color: 'var(--bone)', textDecoration: 'none', fontVariationSettings: "'opsz' 36" }}>ABADAL</Link>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, fontWeight: 400, fontVariationSettings: "'opsz' 72", marginTop: 28, marginBottom: 8 }}>Create an <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>Account.</em></h1>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--dim)', fontSize: 15 }}>Join to order and track your books</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-row">
            <div className="field"><label>First Name <span className="req">*</span></label><input required placeholder="Waqar" value={form.firstName} onChange={set('firstName')} /></div>
            <div className="field"><label>Last Name <span className="req">*</span></label><input required placeholder="Khan" value={form.lastName} onChange={set('lastName')} /></div>
          </div>
          <div className="field"><label>Email Address <span className="req">*</span></label><input type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} /></div>
          <div className="form-row">
            <div className="field"><label>Phone <span className="req">*</span></label><input type="tel" required placeholder="+92 3xx xxxxxxx" value={form.phone} onChange={set('phone')} /></div>
            <div className="field"><label>City <span className="req">*</span></label><input required placeholder="Peshawar" value={form.city} onChange={set('city')} /></div>
          </div>
          <div className="field"><label>Date of Birth <span className="req">*</span></label><input type="date" required value={form.dateOfBirth} onChange={set('dateOfBirth')} /></div>
          <div className="field"><label>Password <span className="req">*</span></label><input type="password" required placeholder="Min. 8 characters" value={form.password} onChange={set('password')} /></div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <div style={{ textAlign: 'center', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--dim)' }}>
            Already have an account?{' '}<Link to="/login" style={{ color: 'var(--bone)', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
