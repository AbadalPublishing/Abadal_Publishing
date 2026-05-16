import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { addressesApi, ordersApi, paymentAccountsApi } from '../services/api'
import { useSettings } from '../hooks/useSettings'
import LoginModal from '../components/ui/LoginModal'
import toast from 'react-hot-toast'
import { trackEvent } from '../hooks/useAnalytics'

const couriers = [
  { id: 'TRAX', name: 'Trax', sub: 'Est. 2–3 business days' },
  { id: 'LEOPARDS', name: 'Leopards (M&P)', sub: 'Est. 2–4 business days' },
]
const paymentMethods = [
  { id: 'COD', name: 'Cash on Delivery', sub: 'Pay when your order arrives' },
  { id: 'JAZZCASH', name: 'JazzCash', sub: 'Pay via JazzCash mobile wallet' },
  { id: 'EASYPAISA', name: 'EasyPaisa', sub: 'Pay via EasyPaisa' },
  { id: 'BANK_TRANSFER', name: 'Bank Transfer', sub: 'Transfer to our account' },
  { id: 'CARD', name: 'Credit / Debit Card', sub: 'Visa, Mastercard, AMEX' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clear)
  const { isLoggedIn, user } = useAuthStore()
  const { data: settings } = useSettings()

  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [newAddress, setNewAddress] = useState({ label: 'Home', firstName: '', lastName: '', phone: '', addressLine1: '', city: '', state: 'KPK', country: 'Pakistan', postalCode: '' })
  const [courier, setCourier] = useState('TRAX')
  const [payment, setPayment] = useState('COD')
  const [customerPhone, setCustomerPhone] = useState('')
  const [adminAccounts, setAdminAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    if (isLoggedIn) addressesApi.list().then(setAddresses).catch(() => {})
    paymentAccountsApi.customerFacing().then(setAdminAccounts).catch(() => {})
  }, [isLoggedIn])

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses.find(a => a.isDefault)?.id || addresses[0].id)
    }
  }, [addresses, selectedAddress])

  useEffect(() => { if (user) setNewAddress(a => ({ ...a, firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '', city: user.city || '' })) }, [user])

  const subtotal = items.reduce((s, i) => s + i.savedPrice * i.quantity, 0)
  const shippingRate = Number(settings?.shippingRate) || 200
  const freeAbove = Number(settings?.freeShippingAbove) || 2000
  const shipping = subtotal >= freeAbove ? 0 : shippingRate
  const total = subtotal + shipping

  const setAddr = (k: keyof typeof newAddress) => (e: React.ChangeEvent<HTMLInputElement>) => setNewAddress({ ...newAddress, [k]: e.target.value })

  const placeOrder = async () => {
    if (!isLoggedIn) { setLoginOpen(true); return }
    if (items.length === 0) { toast.error('Your cart is empty'); return }

    setLoading(true)
    try {
      // 1. Ensure address exists
      let addressId = selectedAddress
      if (!addressId || addresses.length === 0) {
        if (!newAddress.firstName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city) {
          toast.error('Please fill in the delivery address')
          setLoading(false); return
        }
        const created = await addressesApi.create(newAddress)
        addressId = created.id
      }

      // 2. Create order
      const order = await ordersApi.create({
        addressId,
        courier,
        paymentMethod: payment,
        customerPhone: payment === 'JAZZCASH' || payment === 'EASYPAISA' ? customerPhone : undefined,
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity, priceType: i.priceType })),
      })

      trackEvent({ eventType: 'ORDER_PLACED', metadata: { orderId: order.id, total } })
      await clearCart()
      toast.success(`Order ${order.orderNumber} placed`)
      navigate(`/account/orders`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, paddingTop: 100 }}>
      <p style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 400, fontVariationSettings: "'opsz' 36" }}>Your cart is <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>empty.</em></p>
      <a href="/catalogue" className="btn btn-outline">Browse Catalogue</a>
    </div>
  )

  return (
    <div style={{ paddingTop: 100 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 52px' }}>
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>— Checkout —</div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 48, fontWeight: 400, fontVariationSettings: "'opsz' 72" }}>Complete your <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>order.</em></h1>
        </div>

        <div className="checkout-layout">
          <div>
            <div className="checkout-section-title">Delivery Address</div>
            {!isLoggedIn && (
              <div style={{ padding: '20px 24px', border: '1px solid var(--hair)', background: 'rgba(244,242,237,.015)', marginBottom: 24, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--silver)', lineHeight: 1.6 }}>
                Continue as a guest — we'll only ask you to sign in at the very last step to confirm your order.
              </div>
            )}

            {isLoggedIn && addresses.length > 0 ? (
              <div className="addresses-grid" style={{ marginBottom: 24 }}>
                {addresses.map(addr => (
                  <div key={addr.id} className={`address-card ${selectedAddress === addr.id ? 'selected' : ''}`} onClick={() => setSelectedAddress(addr.id)}>
                    <div className="address-label-badge">{addr.label}{addr.isDefault && ' · Default'}</div>
                    <div className="address-name">{addr.firstName} {addr.lastName}</div>
                    <div className="address-text">{addr.addressLine1}<br />{addr.city}, {addr.state}<br />{addr.phone}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
                <div className="form-row">
                  <div className="field"><label>First Name <span className="req">*</span></label><input value={newAddress.firstName} onChange={setAddr('firstName')} /></div>
                  <div className="field"><label>Last Name <span className="req">*</span></label><input value={newAddress.lastName} onChange={setAddr('lastName')} /></div>
                </div>
                <div className="field"><label>Phone <span className="req">*</span></label><input type="tel" placeholder="+92 3xx xxxxxxx" value={newAddress.phone} onChange={setAddr('phone')} /></div>
                <div className="field"><label>Street Address <span className="req">*</span></label><input placeholder="House, street, area, landmark" value={newAddress.addressLine1} onChange={setAddr('addressLine1')} /></div>
                <div className="form-row">
                  <div className="field"><label>City <span className="req">*</span></label><input value={newAddress.city} onChange={setAddr('city')} placeholder="Peshawar" /></div>
                  <div className="field"><label>Province</label><input value={newAddress.state} onChange={setAddr('state')} placeholder="KPK" /></div>
                </div>
              </div>
            )}

            <div className="checkout-section-title" style={{ marginTop: 40 }}>Shipping Courier</div>
            <div className="radio-cards" style={{ marginBottom: 8 }}>
              {couriers.map(c => (
                <label key={c.id} className={`radio-card ${courier === c.id ? 'selected' : ''}`} onClick={() => setCourier(c.id)}>
                  <input type="radio" name="courier" value={c.id} checked={courier === c.id} onChange={() => setCourier(c.id)} />
                  <div className="radio-dot" />
                  <div style={{ flex: 1 }}>
                    <div className="radio-label">{c.name}</div>
                    <div className="radio-sub">{c.sub}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500 }}>Rs. {shippingRate}</div>
                </label>
              ))}
            </div>

            <div className="checkout-section-title" style={{ marginTop: 40 }}>Payment Method</div>
            <div className="radio-cards">
              {paymentMethods.map(p => (
                <label key={p.id} className={`radio-card ${payment === p.id ? 'selected' : ''}`} onClick={() => setPayment(p.id)}>
                  <input type="radio" name="payment" value={p.id} checked={payment === p.id} onChange={() => setPayment(p.id)} />
                  <div className="radio-dot" />
                  <div>
                    <div className="radio-label">{p.name}</div>
                    <div className="radio-sub">{p.sub}</div>
                  </div>
                </label>
              ))}
            </div>

            {(payment === 'JAZZCASH' || payment === 'EASYPAISA') && (
              <div style={{ marginTop: 20, padding: '20px', border: '1px solid var(--hair)' }}>
                <div className="field"><label>{payment === 'JAZZCASH' ? 'JazzCash' : 'EasyPaisa'} Number <span className="req">*</span></label><input type="tel" placeholder="+92 3xx xxxxxxx" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></div>
              </div>
            )}

            {payment === 'BANK_TRANSFER' && adminAccounts.length > 0 && (
              <div style={{ marginTop: 20, padding: '20px', border: '1px solid var(--accent)', background: 'rgba(139,105,20,.05)' }}>
                <div className="eyebrow" style={{ marginBottom: 12, color: 'var(--accent)' }}>Transfer to one of these accounts</div>
                {adminAccounts.map((a: any) => (
                  <div key={a.id} style={{ paddingTop: 12, borderTop: '1px solid var(--hair)', marginTop: 12 }}>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', color: 'var(--dim)' }}>{a.type}</div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 16, marginTop: 4 }}>{a.accountTitle}</div>
                    {a.bankName && <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--silver)' }}>{a.bankName}</div>}
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--silver)' }}>{a.accountNumber}</div>
                  </div>
                ))}
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginTop: 16 }}>
                  Send proof of transfer to <a href="https://wa.me/923039555966" target="_blank" style={{ color: 'var(--silver)' }}>WhatsApp</a> after placing the order.
                </p>
              </div>
            )}

            {payment === 'CARD' && (
              <div style={{ marginTop: 20, padding: '20px', border: '1px solid var(--hair)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="field"><label>Card Number <span className="req">*</span></label><input placeholder="1234 5678 9012 3456" /></div>
                <div className="form-row">
                  <div className="field"><label>Expiry <span className="req">*</span></label><input placeholder="MM / YY" /></div>
                  <div className="field"><label>CVV <span className="req">*</span></label><input placeholder="•••" /></div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 40 }} onClick={placeOrder} disabled={loading}>
              {loading ? 'Placing order…' : `Place Order — Rs. ${total.toLocaleString()}`}
            </button>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', textAlign: 'center', marginTop: 16 }}>
              By placing your order you agree to our terms and conditions.
            </p>
          </div>

          <div className="order-summary-card">
            <div className="order-summary-title">Your Order</div>
            {items.map(item => (
              <div key={item.variantId} style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'start', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--hair)' }}>
                {item.product?.coverImage
                  ? <img src={item.product.coverImage} alt="" style={{ width: 48, height: 62, objectFit: 'cover' }} />
                  : <div style={{ width: 48, height: 62, background: '#1a1a1a' }} />}
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontVariationSettings: "'opsz' 24", lineHeight: 1.2 }}>{item.product?.title}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.15em', color: 'var(--dim)', marginTop: 4 }}>{item.variant?.type} × {item.quantity}</div>
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500 }}>Rs. {(item.savedPrice * item.quantity).toLocaleString()}</div>
              </div>
            ))}
            <div className="summary-line"><span className="summary-line-label">Subtotal</span><span className="summary-line-value">Rs. {subtotal.toLocaleString()}</span></div>
            <div className="summary-line"><span className="summary-line-label">Shipping</span><span className="summary-line-value">{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
            <div className="summary-total">
              <div className="summary-line"><span className="summary-line-label">Total</span><span className="summary-line-value">Rs. {total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={() => { setLoginOpen(false); placeOrder() }} />
    </div>
  )
}
