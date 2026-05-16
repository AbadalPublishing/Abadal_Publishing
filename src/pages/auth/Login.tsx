import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore(s => s.setAuth)
  const mergeCart = useCartStore(s => s.mergeWithServer)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, accessToken } = await authApi.login(form)
      setAuth(user, accessToken)
      await mergeCart()
      toast.success('Welcome back')
      if (user.role === 'SUPER_ADMIN') navigate('/admin')
      else if (user.role === 'AUTHOR') navigate('/account/my-books')
      else navigate('/account/orders')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link to="/" style={{ fontFamily: 'var(--display)', fontSize: 28, color: 'var(--bone)', textDecoration: 'none', fontVariationSettings: "'opsz' 36" }}>ABADAL</Link>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, fontWeight: 400, fontVariationSettings: "'opsz' 72", marginTop: 28, marginBottom: 8 }}>Welcome <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>back.</em></h1>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--dim)', fontSize: 15 }}>Sign in to your account</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="field">
            <label>Email Address <span className="req">*</span></label>
            <input type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="field">
            <label>Password <span className="req">*</span></label>
            <input type="password" required autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.1em', color: 'var(--dim)', textDecoration: 'none' }}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <div className="divider-text">or</div>
          <div style={{ textAlign: 'center', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--dim)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--bone)', textDecoration: 'none' }}>Create one</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
