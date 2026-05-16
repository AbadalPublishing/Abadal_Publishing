import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useSettings } from '../hooks/useSettings'
import { couponsApi } from '../services/api'
import toast from 'react-hot-toast'

export default function Cart() {
  const items = useCartStore(s => s.items)
  const update = useCartStore(s => s.update)
  const remove = useCartStore(s => s.remove)
  const hydrate = useCartStore(s => s.hydrate)
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const navigate = useNavigate()
  const { data: settings } = useSettings()

  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [applying, setApplying] = useState(false)

  useEffect(() => { if (isLoggedIn) hydrate() }, [isLoggedIn, hydrate])

  const subtotal = items.reduce((s, i) => s + i.savedPrice * i.quantity, 0)
  const shippingRate = Number(settings?.shippingRate) || 200
  const freeAbove = Number(settings?.freeShippingAbove) || 2000
  const shipping = subtotal >= freeAbove ? 0 : (items.length > 0 ? shippingRate : 0)
  const total = Math.max(0, subtotal + shipping - discount)

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    setApplying(true)
    try {
      const res = await couponsApi.validate(coupon.trim(), subtotal)
      if (res.valid) {
        setDiscount(Number(res.discountAmount))
        toast.success(`Coupon applied: Rs. ${res.discountAmount} off`)
      } else {
        toast.error(res.message || 'Invalid coupon')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not validate coupon')
    } finally {
      setApplying(false)
    }
  }

  if (items.length === 0) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, paddingTop: 100 }}>
      <ShoppingBag size={48} color="var(--dim)" />
      <p style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 400, fontVariationSettings: "'opsz' 36" }}>
        Your cart is <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>empty.</em>
      </p>
      <Link to="/catalogue" className="btn btn-outline">Browse Catalogue</Link>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 16 }}>— Your Cart —</div>
          <h1 className="page-header-title">{items.length} {items.length === 1 ? 'Item' : 'Items'}</h1>
        </div>
      </div>
      <section className="section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 60 }}>
            <div>
              {items.map(item => (
                <div key={item.variantId} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 24, alignItems: 'start', paddingBottom: 32, marginBottom: 32, borderBottom: '1px solid var(--hair)' }}>
                  {item.product?.coverImage
                    ? <img src={item.product.coverImage} alt={item.product?.title} style={{ width: 80, height: 104, objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: 80, height: 104, background: '#1a1a1a', border: '1px solid var(--hair)' }} />}
                  <div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 400, fontVariationSettings: "'opsz' 36", marginBottom: 4 }}>{item.product?.title || 'Item'}</div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 16 }}>
                      {item.variant?.type} {item.product?.author && `· By ${item.product.author.penName}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <button className="qty-btn" onClick={() => update(item.variantId, item.quantity - 1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => update(item.variantId, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
                    <button onClick={() => remove(item.variantId)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36" }}>
                      Rs. {(item.savedPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <div className="field" style={{ flex: 1 }}>
                  <input placeholder="Coupon code…" value={coupon} onChange={e => setCoupon(e.target.value)} style={{ fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '.05em' }} />
                </div>
                <button className="btn btn-outline btn-sm" onClick={applyCoupon} disabled={applying || !isLoggedIn} title={!isLoggedIn ? 'Sign in to apply coupons' : ''}>
                  {applying ? 'Checking…' : 'Apply'}
                </button>
              </div>
            </div>

            <div className="order-summary-card">
              <div className="order-summary-title">Order Summary</div>
              <div className="summary-line"><span className="summary-line-label">Subtotal</span><span className="summary-line-value">Rs. {subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="summary-line"><span className="summary-line-label">Discount</span><span className="summary-line-value" style={{ color: 'var(--accent)' }}>−Rs. {discount.toLocaleString()}</span></div>}
              <div className="summary-line"><span className="summary-line-label">Shipping</span><span className="summary-line-value">{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
              {shipping > 0 && <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)', marginBottom: 12, letterSpacing: '.08em' }}>Free shipping on orders above Rs. {freeAbove.toLocaleString()}</div>}
              <div className="summary-total">
                <div className="summary-line">
                  <span className="summary-line-label">Total</span>
                  <span className="summary-line-value">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 24 }} onClick={() => navigate('/checkout')}>
                Proceed to Checkout →
              </button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/catalogue" style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.15em', color: 'var(--dim)', textDecoration: 'none' }}>Continue Shopping</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
