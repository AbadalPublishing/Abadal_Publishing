import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'

import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import BookDetail from './pages/BookDetail'
import Authors from './pages/Authors'
import AuthorProfile from './pages/AuthorProfile'
import Submissions from './pages/Submissions'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLogin from './pages/auth/AdminLogin'

import AccountLayout from './pages/account/AccountLayout'
import Orders from './pages/account/Orders'
import Addresses from './pages/account/Addresses'
import Wishlist from './pages/account/Wishlist'
import Profile from './pages/account/Profile'
import Payments from './pages/account/Payments'
import MyBooks from './pages/account/MyBooks'
import SalesStats from './pages/account/SalesStats'

import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminProducts from './pages/admin/Products'
import AdminProductEdit from './pages/admin/ProductEdit'
import AdminUsers from './pages/admin/Users'
import AdminAnalytics from './pages/admin/Analytics'
import AdminSettings from './pages/admin/Settings'
import AdminPaymentAccounts from './pages/admin/PaymentAccounts'
import AdminReviews from './pages/admin/Reviews'
import AdminCoupons from './pages/admin/Coupons'
import AdminRoyalties from './pages/admin/Royalties'
import AdminAuditLog from './pages/admin/AuditLog'

export default function App() {
  return (
    <QueryProvider>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#0d0d0d', color: '#f4f2ed',
          border: '1px solid rgba(244,242,237,0.15)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 13, letterSpacing: '.04em',
          borderRadius: 0,
        }
      }} />
      <BrowserRouter>
        <Routes>
        {/* PUBLIC SITE */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/books/:slug" element={<BookDetail />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/:slug" element={<AuthorProfile />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* ACCOUNT (customer + author) */}
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<Orders />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="my-books" element={<MyBooks />} />
            <Route path="sales" element={<SalesStats />} />
            <Route path="payments" element={<Payments />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* AUTH ROUTES (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/abadal-control-room" element={<AdminLogin />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductEdit />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="payment-accounts" element={<AdminPaymentAccounts />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="royalties" element={<AdminRoyalties />} />
          <Route path="audit" element={<AdminAuditLog />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  )
}
