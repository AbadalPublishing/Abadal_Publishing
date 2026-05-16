import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { productsApi } from '../../services/api'
import { Edit2, Save, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

const SUBMISSION_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: 'Under Review', color: '#b8860b' },
  APPROVED:       { label: 'Live',          color: '#6b9e6b' },
  REJECTED:       { label: 'Rejected',      color: '#c75353' },
  DRAFT:          { label: 'Draft',         color: 'var(--dim)' },
}

const BLANK_SUBMISSION = {
  title: '', type: 'BOOK', description: '', coverImage: '', amazonUrl: '', pages: '',
}

export default function MyBooks() {
  const user = useAuthStore(s => s.user)
  const authorSlug = user?.author?.slug
  const qc = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ['my-books', authorSlug],
    queryFn: () => productsApi.list({ author: authorSlug }),
    enabled: !!authorSlug,
  })

  const { data: submissions, isLoading: subsLoading } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: () => productsApi.mySubmissions(),
    enabled: !!authorSlug,
  })

  const updateVariant = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.updateVariant(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-books'] }); toast.success('Updated') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  })

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-books'] }); toast.success('Saved') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed'),
  })

  const submitBook = useMutation({
    mutationFn: (data: any) => productsApi.submit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-submissions'] })
      setShowSubmitForm(false)
      setSubmissionDraft(BLANK_SUBMISSION)
      toast.success('Submitted for review! You\'ll be notified once approved.')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Submission failed'),
  })

  const [editingVariant, setEditingVariant] = useState<string | null>(null)
  const [editingBook, setEditingBook] = useState<string | null>(null)
  const [variantDraft, setVariantDraft] = useState<any>({})
  const [bookDraft, setBookDraft] = useState<any>({})
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submissionDraft, setSubmissionDraft] = useState<any>(BLANK_SUBMISSION)
  const [showSubmissions, setShowSubmissions] = useState(true)

  if (isLoading || subsLoading) return <PageLoading />
  const books = (Array.isArray(products) ? products : products?.data) || []
  const subs: any[] = Array.isArray(submissions) ? submissions : []

  return (
    <div>
      <div className="account-content-title">My Books</div>

      {/* ── Submit New Book ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--dim)' }}>Submit a New Book</div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowSubmitForm(v => !v)}>
            {showSubmitForm ? <><X size={11} /> Cancel</> : <><Plus size={11} /> Submit New Book</>}
          </button>
        </div>

        {showSubmitForm && (
          <div style={{ border: '1px solid var(--hair)', padding: 28, background: 'rgba(244,242,237,.015)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="field">
                <label>Title *</label>
                <input value={submissionDraft.title} onChange={e => setSubmissionDraft({ ...submissionDraft, title: e.target.value })} placeholder="Book title" />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={submissionDraft.type} onChange={e => setSubmissionDraft({ ...submissionDraft, type: e.target.value })}>
                  <option value="BOOK">Book</option>
                  <option value="EBOOK">eBook</option>
                  <option value="MAGAZINE">Magazine</option>
                  <option value="COURSE">Course</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Description *</label>
              <textarea rows={4} value={submissionDraft.description} onChange={e => setSubmissionDraft({ ...submissionDraft, description: e.target.value })} placeholder="Brief description of your book..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="field">
                <label>Cover Image URL</label>
                <input value={submissionDraft.coverImage} onChange={e => setSubmissionDraft({ ...submissionDraft, coverImage: e.target.value })} placeholder="https://... (upload via Cloudinary)" />
              </div>
              <div className="field">
                <label>Pages</label>
                <input type="number" value={submissionDraft.pages} onChange={e => setSubmissionDraft({ ...submissionDraft, pages: e.target.value })} placeholder="e.g. 320" />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 24 }}>
              <label>Amazon URL (if eBook / digital only)</label>
              <input value={submissionDraft.amazonUrl} onChange={e => setSubmissionDraft({ ...submissionDraft, amazonUrl: e.target.value })} placeholder="https://amazon.com/dp/..." />
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginBottom: 20, lineHeight: 1.6 }}>
              After submission, the Super Admin will review and approve your book. Pricing and variants will be set by the admin once approved.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary"
                disabled={!submissionDraft.title || !submissionDraft.description || submitBook.isPending}
                onClick={() => submitBook.mutate({ ...submissionDraft, pages: submissionDraft.pages ? Number(submissionDraft.pages) : undefined })}>
                <Save size={12} /> {submitBook.isPending ? 'Submitting…' : 'Submit for Review'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowSubmitForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Past Submissions ── */}
      {subs.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16, color: 'var(--bone)' }}
            onClick={() => setShowSubmissions(v => !v)}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--dim)' }}>Submissions in Review</div>
            {showSubmissions ? <ChevronUp size={12} color="var(--dim)" /> : <ChevronDown size={12} color="var(--dim)" />}
          </button>

          {showSubmissions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {subs.map((s: any) => {
                const st = SUBMISSION_STATUS_LABEL[s.submissionStatus] || SUBMISSION_STATUS_LABEL.DRAFT
                return (
                  <div key={s.id} style={{ border: '1px solid var(--hair)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                    {s.coverImage
                      ? <img src={s.coverImage} alt={s.title} style={{ width: 44, height: 58, objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 44, height: 58, background: '#111', flexShrink: 0, border: '1px solid var(--hair)' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 400, fontVariationSettings: "'opsz' 24", marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.1em', color: 'var(--dim)', textTransform: 'uppercase' }}>
                        Submitted {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: st.color, border: `1px solid ${st.color}44`, padding: '3px 8px' }}>
                        {st.label}
                      </span>
                      {s.submissionStatus === 'REJECTED' && s.submissionNote && (
                        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginTop: 8, maxWidth: 300 }}>
                          "{s.submissionNote}"
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Live Books ── */}
      <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 16 }}>Live Books</div>
      <div style={{ padding: '14px 20px', border: '1px solid var(--hair)', background: 'rgba(244,242,237,.015)', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--silver)', lineHeight: 1.6 }}>
          You can edit pricing, stock, and marketing copy for your books here. Title and cover changes require Super Admin approval.
        </div>
      </div>

      {books.length === 0
        ? <EmptyState title="No live books yet." message="Submit a new book above. Once approved it will appear here." />
        : books.map((book: any) => (
          <div key={book.id} style={{ border: '1px solid var(--hair)', padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--hair)' }}>
              <img src={book.coverImage} alt={book.title} style={{ width: 100, height: 130, objectFit: 'cover' }} />
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>{book.type} · {book.category?.name}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 400, fontVariationSettings: "'opsz' 36", marginBottom: 6 }}>{book.title}</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--silver)' }}>
                  {book.publishedDate} · {book.pages} pages
                </div>
              </div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 18 }}>Variants & Pricing</div>
            <table className="data-table" style={{ marginBottom: 32 }}>
              <thead>
                <tr><th>Format</th><th>Retail</th><th>Wholesale</th><th>Student</th><th>Stock</th><th>Royalty</th><th></th></tr>
              </thead>
              <tbody>
                {book.variants.map((v: any) => {
                  const isEditing = editingVariant === v.id
                  const draft = isEditing ? variantDraft : v
                  return (
                    <tr key={v.id}>
                      <td>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24" }}>{v.type}</div>
                        {v.amazonOnly && <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.15em', color: 'var(--accent)', marginTop: 2 }}>AMAZON KINDLE</div>}
                      </td>
                      <td>{isEditing
                        ? <input type="number" value={draft.retailPrice} onChange={e => setVariantDraft({ ...draft, retailPrice: +e.target.value })} style={{ width: 80, fontFamily: 'var(--sans)', fontSize: 13, background: 'transparent', border: '1px solid var(--hair-md)', padding: '4px 8px', color: 'var(--bone)' }} />
                        : <span style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24" }}>{v.amazonOnly ? '—' : `Rs. ${Number(v.retailPrice).toLocaleString()}`}</span>}</td>
                      <td>{isEditing
                        ? <input type="number" value={draft.wholesalePrice} onChange={e => setVariantDraft({ ...draft, wholesalePrice: +e.target.value })} style={{ width: 80, fontFamily: 'var(--sans)', fontSize: 13, background: 'transparent', border: '1px solid var(--hair-md)', padding: '4px 8px', color: 'var(--bone)' }} />
                        : <span style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>{v.amazonOnly ? '—' : `Rs. ${Number(v.wholesalePrice).toLocaleString()}`}</span>}</td>
                      <td>{isEditing
                        ? <input type="number" value={draft.studentPrice} onChange={e => setVariantDraft({ ...draft, studentPrice: +e.target.value })} style={{ width: 80, fontFamily: 'var(--sans)', fontSize: 13, background: 'transparent', border: '1px solid var(--hair-md)', padding: '4px 8px', color: 'var(--bone)' }} />
                        : <span style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>{v.amazonOnly ? '—' : `Rs. ${Number(v.studentPrice).toLocaleString()}`}</span>}</td>
                      <td>{isEditing && !v.amazonOnly
                        ? <input type="number" value={draft.stock} onChange={e => setVariantDraft({ ...draft, stock: +e.target.value })} style={{ width: 60, fontFamily: 'var(--sans)', fontSize: 13, background: 'transparent', border: '1px solid var(--hair-md)', padding: '4px 8px', color: 'var(--bone)' }} />
                        : <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: v.stock < 10 ? '#c75353' : 'var(--bone)' }}>{v.amazonOnly ? '∞' : v.stock}</span>}</td>
                      <td><span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--accent)' }}>{Number(v.royaltyPercentage)}%</span></td>
                      <td>
                        {isEditing
                          ? <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: '#6b9e6b' }}
                                onClick={() => { updateVariant.mutate({ id: v.id, data: variantDraft }); setEditingVariant(null) }}>
                                <Save size={11} />
                              </button>
                              <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => setEditingVariant(null)}><X size={11} /></button>
                            </div>
                          : <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => { setEditingVariant(v.id); setVariantDraft({ ...v, retailPrice: Number(v.retailPrice), wholesalePrice: Number(v.wholesalePrice), studentPrice: Number(v.studentPrice) }) }} disabled={v.amazonOnly}>
                              <Edit2 size={11} />
                            </button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="eyebrow" style={{ marginBottom: 18 }}>Marketing Copy</div>
            {editingBook === book.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="field"><label>Description</label><textarea rows={5} value={bookDraft.description} onChange={e => setBookDraft({ ...bookDraft, description: e.target.value })} /></div>
                <div className="field"><label>Pull Quote</label><textarea rows={3} value={bookDraft.pullQuote || ''} onChange={e => setBookDraft({ ...bookDraft, pullQuote: e.target.value })} /></div>
                <div className="field"><label>Editorial Note</label><textarea rows={2} value={bookDraft.editorialNote || ''} onChange={e => setBookDraft({ ...bookDraft, editorialNote: e.target.value })} /></div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => { updateProduct.mutate({ id: book.id, data: bookDraft }); setEditingBook(null) }}><Save size={12} /> Save Changes</button>
                  <button className="btn btn-outline" onClick={() => setEditingBook(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.25em', color: 'var(--dim)', marginBottom: 8, textTransform: 'uppercase' }}>Description</div>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--silver)', lineHeight: 1.65 }}>{book.description}</p>
                </div>
                {book.pullQuote && (
                  <div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.25em', color: 'var(--dim)', marginBottom: 8, textTransform: 'uppercase' }}>Pull Quote</div>
                    <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--silver)', lineHeight: 1.65 }}>{book.pullQuote}</p>
                  </div>
                )}
                <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}
                  onClick={() => { setEditingBook(book.id); setBookDraft({ description: book.description, pullQuote: book.pullQuote, editorialNote: book.editorialNote }) }}>
                  <Edit2 size={12} /> Edit Copy
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
