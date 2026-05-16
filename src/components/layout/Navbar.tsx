import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

const links = [
  { to: '/', label: 'House', exact: true },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/authors', label: 'Authors' },
  { to: '/submissions', label: 'Submissions' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cartCount = useCartStore(s => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const { isLoggedIn, user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleAccount = () => {
    if (!isLoggedIn) navigate('/login')
    else if (user?.role === 'AUTHOR') navigate('/account/my-books')
    else navigate('/account/orders')
  }

  return (
    <nav className={`main-nav ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-logo" aria-label="Abadal Publishing">
        <img src="/assets/logo.png" alt="Abadal Publishing" />
      </Link>

      <ul className="nav-links">
        {links.map(l => (
          <li key={l.to}>
            <NavLink to={l.to} end={l.exact} className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <button className="nav-icon-btn" onClick={() => isLoggedIn ? navigate('/account/wishlist') : navigate('/login')} aria-label="Wishlist">
          <Heart size={18} />
        </button>
        <button className="nav-icon-btn" onClick={() => navigate('/cart')} aria-label="Cart">
          <ShoppingBag size={18} />
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
        <div style={{ position: 'relative' }}>
          <button className="nav-icon-btn" onClick={() => isLoggedIn ? setMenuOpen(!menuOpen) : handleAccount()} aria-label="Account">
            <User size={18} />
          </button>
          {isLoggedIn && menuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200, background: '#0d0d0d', border: '1px solid var(--hair-md)', padding: '8px 0', zIndex: 300 }}
              onMouseLeave={() => setMenuOpen(false)}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--hair)', marginBottom: 6 }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontVariationSettings: "'opsz' 24" }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: 2 }}>{user?.role.replace('_', ' ')}</div>
              </div>
              {user?.role === 'AUTHOR' && (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/account/my-books') }} className="nav-menu-item">My Books</button>
                  <button onClick={() => { setMenuOpen(false); navigate('/account/sales') }} className="nav-menu-item">Sales</button>
                  <button onClick={() => { setMenuOpen(false); navigate('/account/payments') }} className="nav-menu-item">Payouts</button>
                  <div style={{ height: 1, background: 'var(--hair)', margin: '6px 0' }} />
                </>
              )}
              {user?.role === 'SUPER_ADMIN' && (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate('/admin') }} className="nav-menu-item" style={{ color: 'var(--accent)' }}>Control Room</button>
                  <div style={{ height: 1, background: 'var(--hair)', margin: '6px 0' }} />
                </>
              )}
              <button onClick={() => { setMenuOpen(false); navigate('/account/orders') }} className="nav-menu-item">My Orders</button>
              <button onClick={() => { setMenuOpen(false); navigate('/account/profile') }} className="nav-menu-item">Profile</button>
              <div style={{ height: 1, background: 'var(--hair)', margin: '6px 0' }} />
              <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }} className="nav-menu-item" style={{ color: '#c75353', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LogOut size={11} /> Sign Out
              </button>
            </div>
          )}
        </div>
        {!isLoggedIn && (
          <Link to="/login" className="nav-btn" style={{ marginLeft: 8 }}>Sign In</Link>
        )}
      </div>
    </nav>
  )
}
