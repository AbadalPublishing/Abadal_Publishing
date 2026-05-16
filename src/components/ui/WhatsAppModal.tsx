import { useState, useEffect, useRef } from 'react'
import { X, MessageCircle, ShoppingBag, Minus, Plus } from 'lucide-react'
import { trackEvent } from '../../hooks/useAnalytics'

const WA_NUMBER = '923039555966'

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

interface Props {
  book: {
    id: string
    title: string
    variants?: Array<{ id: string; type: string; retailPrice: number; amazonOnly?: boolean }>
  }
  onClose: () => void
}

type Step = 'choose' | 'order'

const BLANK_FORM = {
  name: '', phone: '', email: '',
  copies: 1, edition: '',
  address: '', city: '', country: 'Pakistan',
}

export default function WhatsAppModal({ book, onClose }: Props) {
  const [step, setStep] = useState<Step>('choose')
  const [form, setForm] = useState({
    ...BLANK_FORM,
    edition: book.variants?.find(v => !v.amazonOnly)?.type || book.variants?.[0]?.type || 'Paperback',
  })
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const physicalVariants = book.variants?.filter(v => !v.amazonOnly) || []

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleInquiry = () => {
    trackEvent({ eventType: 'WHATSAPP_CLICK', productId: book.id, metadata: { type: 'inquiry' } })
    const msg = `Hi, I have a general inquiry about: *${book.title}*`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    onClose()
  }

  const handleOrder = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) return
    trackEvent({
      eventType: 'WHATSAPP_CLICK',
      productId: book.id,
      metadata: { type: 'order', edition: form.edition, copies: form.copies, city: form.city },
    })

    const lines = [
      `📚 *New Order — ${book.title}*`,
      ``,
      `📖 Edition: ${form.edition}`,
      `📦 Copies: ${form.copies}`,
      ``,
      `👤 Name: ${form.name.trim()}`,
      `📞 Phone: ${form.phone.trim()}`,
      form.email.trim() ? `📧 Email: ${form.email.trim()}` : null,
      ``,
      `📍 Address: ${form.address.trim()}`,
      `🏙️ City: ${form.city.trim()}`,
      `🌍 Country: ${form.country.trim()}`,
    ].filter(l => l !== null).join('\n')

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`, '_blank')
    onClose()
  }

  const canSubmit = form.name.trim() && form.phone.trim() && form.address.trim() && form.city.trim()

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        background: '#0a0a0a', border: '1px solid var(--hair-md)',
        width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20, zIndex: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 4,
          }}
        >
          <X size={18} />
        </button>

        {/* ── Step: Choose ── */}
        {step === 'choose' && (
          <div style={{ padding: '52px 52px 48px' }}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>— WhatsApp —</div>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 400, fontVariationSettings: "'opsz' 48", marginBottom: 10 }}>
              {book.title.includes(':')
                ? <>{book.title.split(':')[0]}: <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>{book.title.split(':').slice(1).join(':')}</em></>
                : book.title}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--dim)', marginBottom: 48 }}>
              How can we help you?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* General Inquiry */}
              <button
                onClick={handleInquiry}
                style={{
                  background: 'transparent', border: '1px solid var(--hair-md)',
                  padding: '32px 28px', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color .2s, background .2s',
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,242,237,.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,242,237,.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hair-md)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <MessageCircle size={22} color="var(--silver)" />
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--bone)', marginBottom: 8 }}>
                    General Inquiry
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', lineHeight: 1.6 }}>
                    Ask about the book, availability, or anything else.
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--accent)', letterSpacing: '.1em', marginTop: 'auto' }}>
                  Opens WhatsApp →
                </div>
              </button>

              {/* Place an Order */}
              <button
                onClick={() => setStep('order')}
                style={{
                  background: 'transparent', border: '1px solid var(--hair-md)',
                  padding: '32px 28px', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color .2s, background .2s',
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,242,237,.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,242,237,.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--hair-md)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <ShoppingBag size={22} color="var(--silver)" />
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--bone)', marginBottom: 8 }}>
                    Place an Order
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', lineHeight: 1.6 }}>
                    Fill your details and we'll send a ready-to-confirm message.
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--accent)', letterSpacing: '.1em', marginTop: 'auto' }}>
                  Fill form →
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Order Form ── */}
        {step === 'order' && (
          <div style={{ padding: '48px 52px 52px', position: 'relative', overflow: 'hidden' }}>
            {/* Feather watermark */}
            <img
              src="/assets/feather.png"
              alt=""
              aria-hidden
              style={{
                position: 'absolute', right: 28, top: 60,
                width: 80, opacity: .07, pointerEvents: 'none',
                transform: 'rotate(12deg)',
              }}
            />

            <div className="eyebrow" style={{ marginBottom: 16 }}>Place an Order</div>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 400, fontVariationSettings: "'opsz' 48", marginBottom: 8 }}>
              {book.title.includes(':')
                ? <>{book.title.split(':')[0]}: <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>{book.title.split(':').slice(1).join(':')}</em></>
                : book.title}
            </h2>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', lineHeight: 1.65, marginBottom: 40, maxWidth: 480 }}>
              Complete the details below. Your order will open in WhatsApp, where our team will confirm shipping and payment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Row 1: Name + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label className="wa-label">FULL NAME <span style={{ color: '#c75353' }}>*</span></label>
                  <input className="wa-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="" />
                </div>
                <div>
                  <label className="wa-label">PHONE <span style={{ color: '#c75353' }}>*</span></label>
                  <input className="wa-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92 300 0000000" type="tel" />
                </div>
              </div>

              {/* Row 2: Email */}
              <div style={{ marginBottom: 28 }}>
                <label className="wa-label">EMAIL <span style={{ color: 'var(--dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>(optional)</span></label>
                <input className="wa-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="" type="email" />
              </div>

              {/* Row 3: Copies + Edition */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <label className="wa-label">COPIES <span style={{ color: '#c75353' }}>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid var(--hair-md)', paddingBottom: 10, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => set('copies', Math.max(1, form.copies - 1))}
                      style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--hair-md)', background: 'transparent', color: 'var(--bone)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--display)', fontSize: 20, fontVariationSettings: "'opsz' 24" }}>{form.copies}</span>
                    <button
                      type="button"
                      onClick={() => set('copies', Math.min(20, form.copies + 1))}
                      style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--hair-md)', background: 'transparent', color: 'var(--bone)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="wa-label">EDITION <span style={{ color: '#c75353' }}>*</span></label>
                  <select
                    className="wa-input wa-select"
                    value={form.edition}
                    onChange={e => set('edition', e.target.value)}
                  >
                    {physicalVariants.length > 0
                      ? physicalVariants.map(v => <option key={v.id} value={v.type}>{v.type.charAt(0) + v.type.slice(1).toLowerCase()}</option>)
                      : <option value="Paperback">Paperback</option>}
                  </select>
                </div>
              </div>

              {/* Row 4: Address */}
              <div style={{ marginBottom: 28 }}>
                <label className="wa-label">SHIPPING ADDRESS <span style={{ color: '#c75353' }}>*</span></label>
                <textarea
                  className="wa-input"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  rows={2}
                  style={{ resize: 'none', paddingTop: 12 }}
                />
              </div>

              {/* Row 5: City + Country */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                <div>
                  <label className="wa-label">CITY <span style={{ color: '#c75353' }}>*</span></label>
                  <input className="wa-input" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div>
                  <label className="wa-label">COUNTRY <span style={{ color: '#c75353' }}>*</span></label>
                  <input className="wa-input" value={form.country} onChange={e => set('country', e.target.value)} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={!canSubmit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '16px 36px', borderRadius: 100,
                    background: canSubmit ? 'var(--bone)' : 'rgba(244,242,237,.15)',
                    color: canSubmit ? 'var(--ink)' : 'var(--dim)',
                    border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '.2em', textTransform: 'uppercase',
                    transition: 'opacity .2s',
                  }}
                >
                  <WhatsAppIcon size={16} />
                  Open WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)', letterSpacing: '.1em' }}
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
