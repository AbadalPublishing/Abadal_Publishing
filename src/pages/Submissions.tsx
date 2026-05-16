import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { productsApi, categoriesApi } from '../services/api'
import { Upload, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const BLANK: any = {
  title: '',
  language: 'English',
  type: 'BOOK',
  categoryId: '',
  description: '',
  pullQuote: '',
  editorialNote: '',
  pages: '',
  publishedDate: '',
  coverImage: '',
  amazonUrl: '',
  whatsappEnabled: true,
  tags: '',
}

const TYPES = [
  { value: 'BOOK', label: 'Print Book' },
  { value: 'EBOOK', label: 'eBook / Digital' },
  { value: 'MAGAZINE', label: 'Magazine / Journal' },
  { value: 'COURSE', label: 'Course / Curriculum' },
]

const LANGUAGES = ['English', 'Pashto', 'Urdu', 'Persian', 'Arabic', 'Other']

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
        {label}
        {required && <span className="req">*</span>}
        {hint && <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)', fontWeight: 400, letterSpacing: '.05em', textTransform: 'none', marginLeft: 4 }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function SectionHead({ n, title, open, onToggle }: { n: string; title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 20, background: 'none', border: 'none', cursor: 'pointer', padding: '24px 0', borderTop: '1px solid var(--hair)', textAlign: 'left' }}>
      <span style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', minWidth: 28, fontVariationSettings: "'opsz' 24" }}>{n}</span>
      <span style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 400, fontVariationSettings: "'opsz' 36", color: 'var(--bone)', flex: 1 }}>{title}</span>
      {open ? <ChevronUp size={14} color="var(--dim)" /> : <ChevronDown size={14} color="var(--dim)" />}
    </button>
  )
}

export default function Submissions() {
  const { isLoggedIn, user } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isAuthor = user?.role === 'AUTHOR'

  const [form, setForm] = useState<any>(BLANK)
  const [sections, setSections] = useState({ book: true, content: true, publish: false, dist: false })
  const [submitted, setSubmitted] = useState(false)

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const toggleSection = (k: keyof typeof sections) => setSections(s => ({ ...s, [k]: !s[k] }))

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const submit = useMutation({
    mutationFn: (data: any) => productsApi.submit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-submissions'] })
      setSubmitted(true)
      setForm(BLANK)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Submission failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required')
      return
    }
    const payload: any = {
      title: form.title.trim(),
      type: form.type,
      language: form.language,
      description: form.description.trim(),
      whatsappEnabled: form.whatsappEnabled,
    }
    if (form.categoryId)          payload.categoryId    = form.categoryId
    if (form.pullQuote.trim())    payload.pullQuote     = form.pullQuote.trim()
    if (form.editorialNote.trim()) payload.editorialNote = form.editorialNote.trim()
    if (form.pages)               payload.pages         = Number(form.pages)
    if (form.publishedDate)       payload.publishedDate = form.publishedDate
    if (form.coverImage.trim())   payload.coverImage    = form.coverImage.trim()
    if (form.amazonUrl.trim())    payload.amazonUrl     = form.amazonUrl.trim()
    if (form.tags.trim())         payload.tags          = form.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    submit.mutate(payload)
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="page-header">
        <div className="container">
          <div className="page-header-eyebrow eyebrow">— Submissions Open —</div>
          <h1 className="page-header-title">Submit a <em>Manuscript.</em></h1>
        </div>
      </div>

      <section className="section">
        <div className="container-sm">

          {/* ── Editorial Intro ── */}
          <p style={{ fontFamily: 'var(--sf)', fontWeight: 300, fontSize: 18, lineHeight: 1.75, color: 'var(--bone)', opacity: .85, marginBottom: 56 }}>
            We publish works of scholarship, literary non-fiction, and translation from the Pashto and Persianate worlds. If your manuscript fits one of these categories and you believe it belongs in print, we would like to read it.
          </p>

          <div style={{ borderTop: '1px solid var(--hair)', paddingTop: 48, marginBottom: 56 }}>
            <div className="eyebrow" style={{ marginBottom: 24 }}>What We Publish</div>
            {['Scholarship & Historical Inquiry', 'Literary Non-Fiction & Memoir', 'Translation from the Pashto & Persianate Worlds'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'baseline', padding: '20px 0', borderBottom: '1px solid var(--hair)' }}>
                <span style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', minWidth: 32, fontVariationSettings: "'opsz' 24" }}>{['I.','II.','III.'][i]}</span>
                <span style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 400, fontVariationSettings: "'opsz' 36" }}>{s}</span>
              </div>
            ))}
          </div>

          {/* ── Success State ── */}
          {submitted && (
            <div style={{ border: '1px solid #6b9e6b44', background: 'rgba(107,158,107,.06)', padding: '32px 40px', marginBottom: 48, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <Check size={20} color="#6b9e6b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36", marginBottom: 8 }}>Submission Received.</div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--silver)', lineHeight: 1.7 }}>
                  Thank you. We will review your manuscript and respond by email. You can track the status in{' '}
                  <Link to="/account/my-books" style={{ color: 'var(--bone)', textDecoration: 'underline' }}>My Books</Link>.
                </p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 20 }} onClick={() => setSubmitted(false)}>Submit Another</button>
              </div>
            </div>
          )}

          {/* ── Not Logged In ── */}
          {!isLoggedIn && !submitted && (
            <div style={{ border: '1px solid var(--hair-md)', padding: '40px', textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 26, fontVariationSettings: "'opsz' 36", marginBottom: 12 }}>Ready to Submit?</div>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--silver)', lineHeight: 1.7, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
                You need an author account to submit a manuscript. Sign in if you already have one, or create an account to get started.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>Sign In</button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')}>Create Account</button>
              </div>
            </div>
          )}

          {/* ── Logged in but not author ── */}
          {isLoggedIn && !isAuthor && !submitted && (
            <div style={{ border: '1px solid var(--hair-md)', padding: '40px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36", marginBottom: 8 }}>Author Account Required</div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--silver)', lineHeight: 1.7 }}>
                  Your current account is a reader account. To submit a manuscript, please contact us at{' '}
                  <a href="mailto:submissions@abadalpublishing.com" style={{ color: 'var(--bone)' }}>submissions@abadalpublishing.com</a>{' '}
                  and we'll upgrade your account to an author profile.
                </p>
              </div>
            </div>
          )}

          {/* ── Full Submission Form (authors only) ── */}
          {isLoggedIn && isAuthor && !submitted && (
            <form onSubmit={handleSubmit}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 400, fontVariationSettings: "'opsz' 48", marginBottom: 8 }}>
                Your Manuscript
              </div>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--dim)', marginBottom: 40, lineHeight: 1.6 }}>
                Fill in as much as you can. Pricing and formats will be set by the editorial team once your submission is approved.
              </p>

              {/* ── Section I: Book Details ── */}
              <SectionHead n="I." title="Book Details" open={sections.book} onToggle={() => toggleSection('book')} />
              {sections.book && (
                <div style={{ paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Field label="Title" required>
                    <input
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                      placeholder="Full title of your book"
                      required
                    />
                  </Field>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                    <Field label="Type">
                      <select value={form.type} onChange={e => set('type', e.target.value)}>
                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Language">
                      <select value={form.language} onChange={e => set('language', e.target.value)}>
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </Field>
                    <Field label="Category" hint="optional">
                      <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                        <option value="">— Select —</option>
                        {(Array.isArray(categories) ? categories : []).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field label="Number of Pages" hint="approximate">
                      <input
                        type="number"
                        value={form.pages}
                        onChange={e => set('pages', e.target.value)}
                        placeholder="e.g. 320"
                        min={1}
                      />
                    </Field>
                    <Field label="Year of Writing / Completion" hint="optional">
                      <input
                        value={form.publishedDate}
                        onChange={e => set('publishedDate', e.target.value)}
                        placeholder="e.g. 2025"
                        maxLength={4}
                      />
                    </Field>
                  </div>

                  <Field label="Keywords / Tags" hint="comma-separated, optional">
                    <input
                      value={form.tags}
                      onChange={e => set('tags', e.target.value)}
                      placeholder="e.g. History, Pashtunwali, Colonial Studies"
                    />
                  </Field>
                </div>
              )}

              {/* ── Section II: Content ── */}
              <SectionHead n="II." title="Content & Pitch" open={sections.content} onToggle={() => toggleSection('content')} />
              {sections.content && (
                <div style={{ paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Field label="Book Description" required hint="300–800 words recommended">
                    <textarea
                      rows={7}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="A full description of the book — its argument, scope, and significance. This will be used on the book's page if approved."
                      required
                    />
                  </Field>

                  <Field label="Pull Quote" hint="optional — one powerful sentence from the book">
                    <textarea
                      rows={3}
                      value={form.pullQuote}
                      onChange={e => set('pullQuote', e.target.value)}
                      placeholder='"A single sentence that captures the essence of the book."'
                    />
                  </Field>

                  <Field label="Cover Letter / Note to Editor" hint="optional — why this book, why now, why Abadal">
                    <textarea
                      rows={5}
                      value={form.editorialNote}
                      onChange={e => set('editorialNote', e.target.value)}
                      placeholder="Context for the editorial team — your background, the book's place in existing scholarship, why it fits our list…"
                    />
                  </Field>
                </div>
              )}

              {/* ── Section III: Cover ── */}
              <SectionHead n="III." title="Cover Image" open={sections.publish} onToggle={() => toggleSection('publish')} />
              {sections.publish && (
                <div style={{ paddingBottom: 32 }}>
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, marginBottom: 20 }}>
                    If you have a cover design or a proposed image, paste a public URL below. This is not required — the editorial team will work with you on the cover after approval.
                  </p>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Field label="Cover Image URL" hint="optional">
                        <input
                          value={form.coverImage}
                          onChange={e => set('coverImage', e.target.value)}
                          placeholder="https://…"
                        />
                      </Field>
                    </div>
                    {form.coverImage && (
                      <img
                        src={form.coverImage}
                        alt="Cover preview"
                        style={{ width: 80, height: 104, objectFit: 'cover', border: '1px solid var(--hair)', flexShrink: 0, marginTop: 28 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ── Section IV: Distribution ── */}
              <SectionHead n="IV." title="Distribution" open={sections.dist} onToggle={() => toggleSection('dist')} />
              {sections.dist && (
                <div style={{ paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Field label="Amazon / Kindle URL" hint="if already listed or self-published digitally">
                    <input
                      value={form.amazonUrl}
                      onChange={e => set('amazonUrl', e.target.value)}
                      placeholder="https://www.amazon.com/dp/…"
                    />
                  </Field>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderTop: '1px solid var(--hair)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '.04em' }}>
                      <input
                        type="checkbox"
                        checked={form.whatsappEnabled}
                        onChange={e => set('whatsappEnabled', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                      />
                      Enable WhatsApp ordering for this book
                    </label>
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)' }}>
                      Customers can order directly via WhatsApp — common in Pakistan
                    </span>
                  </div>
                </div>
              )}

              {/* ── Submit ── */}
              <div style={{ borderTop: '1px solid var(--hair)', paddingTop: 40, marginTop: 8 }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', lineHeight: 1.7, marginBottom: 28, maxWidth: 560 }}>
                  By submitting, you confirm this is your original work and you hold the rights to publish it. Abadal Publishing will review and respond within 4–6 weeks.
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={!form.title.trim() || !form.description.trim() || submit.isPending}
                  >
                    <Upload size={14} />
                    {submit.isPending ? 'Submitting…' : 'Submit Manuscript'}
                  </button>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)', letterSpacing: '.05em' }}>
                    or email us directly at{' '}
                    <a href="mailto:submissions@abadalpublishing.com" style={{ color: 'var(--silver)' }}>
                      submissions@abadalpublishing.com
                    </a>
                  </span>
                </div>
              </div>
            </form>
          )}

        </div>
      </section>
      <div className="wordmark-end">ABADAL</div>
    </>
  )
}
