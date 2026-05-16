import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, BookOpen, Users, BarChart2, Star, Tag, Settings, DollarSign, LogOut, ScrollText, Wallet } from 'lucide-react'
import Grain from '../ui/Grain'

const navItems = [
  { section: 'Overview', items: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  ]},
  { section: 'Commerce', items: [
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/products', label: 'Products', icon: BookOpen },
    { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  ]},
  { section: 'Community', items: [
    { to: '/admin/users', label: 'Users & Authors', icon: Users },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
  ]},
  { section: 'Finance', items: [
    { to: '/admin/payment-accounts', label: 'Payment Accounts', icon: Wallet },
    { to: '/admin/royalties', label: 'Royalties', icon: DollarSign },
    { to: '/admin/audit', label: 'Audit Log', icon: ScrollText },
  ]},
  { section: 'System', items: [
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ]},
]

export default function AdminLayout() {
  const navigate = useNavigate()
  return (
    <>
      <Grain />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">
            ABADAL<span>Admin Panel</span>
          </div>
          <nav className="admin-nav">
            {navItems.map(section => (
              <div key={section.section}>
                <div className="admin-nav-section">{section.section}</div>
                {section.items.map(item => (
                  <NavLink key={item.to} to={item.to} end={item.exact}
                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                    <item.icon size={14} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
            <div style={{ marginTop: 'auto', padding: '20px 0 8px' }}>
              <button className="admin-nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                onClick={() => navigate('/')}>
                <LogOut size={14} /> Back to Site
              </button>
            </div>
          </nav>
        </aside>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </>
  )
}
