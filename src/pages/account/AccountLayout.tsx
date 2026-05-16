import { Outlet, NavLink, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const customerLinks = [
  { to: '/account/orders', label: 'My Orders' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/wishlist', label: 'Wishlist' },
  { to: '/account/profile', label: 'Profile' },
]

const authorLinks = [
  { to: '/account/my-books', label: 'My Books' },
  { to: '/account/sales', label: 'Sales & Royalties' },
  { to: '/account/payments', label: 'Payouts' },
]

export default function AccountLayout() {
  const { isLoggedIn, user } = useAuthStore()

  if (!isLoggedIn) return <Navigate to="/login" replace />

  const isAuthor = user?.role === 'AUTHOR'
  const firstName = user?.firstName || 'There'

  return (
    <div style={{ paddingTop: 100 }}>
      <div className="page-header">
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            {isAuthor ? '— Author Dashboard —' : '— My Account —'}
          </div>
          <h1 className="page-header-title" style={{ fontSize: 'clamp(40px,5vw,72px)' }}>
            Hello, <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>{firstName}.</em>
          </h1>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="account-layout">
            <nav className="account-nav">
              {isAuthor && (
                <>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)', padding: '4px 16px 12px', borderBottom: '1px solid var(--hair)', marginBottom: 12 }}>
                    Author
                  </div>
                  {authorLinks.map(l => (
                    <NavLink key={l.to} to={l.to} className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}>
                      {l.label}
                    </NavLink>
                  ))}
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--dim)', padding: '20px 16px 12px', borderTop: '1px solid var(--hair)', marginTop: 16, marginBottom: 12 }}>
                    Account
                  </div>
                </>
              )}
              {customerLinks.map(l => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div><Outlet /></div>
          </div>
        </div>
      </section>
    </div>
  )
}
