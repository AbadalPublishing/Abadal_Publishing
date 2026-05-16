import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../services/api'
import { Plus, Edit2, Trash2, Eye, Star, Check, X } from 'lucide-react'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'all' | 'featured' | 'pending'>('all')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['admin', 'products'], queryFn: () => productsApi.list({ limit: 100 }) })
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'pending-submissions'],
    queryFn: () => productsApi.pendingSubmissions(),
    enabled: tab === 'pending',
  })

  const remove = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success('Product deleted') },
  })
  const setFeatured = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) => productsApi.setFeatured(id, { isFeatured }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success('Updated') },
  })
  const approve = useMutation({
    mutationFn: (id: string) => productsApi.approveSubmission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pending-submissions'] })
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Book approved and live in catalogue')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Approval failed'),
  })
  const reject = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => productsApi.rejectSubmission(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'pending-submissions'] })
      setRejectingId(null)
      setRejectNote('')
      toast.success('Submission rejected')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Rejection failed'),
  })

  const pending: any[] = Array.isArray(pendingData) ? pendingData : []
  let books = (Array.isArray(data) ? data : data?.data) || []
  if (tab === 'featured') books = books.filter((b: any) => b.isFeatured)

  const isListLoading = tab === 'pending' ? pendingLoading : isLoading

  if (isListLoading) return <PageLoading />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="admin-page-title">Products</div>
          <div className="admin-page-subtitle">
            {tab === 'pending'
              ? `${pending.length} awaiting review`
              : `${books.length} ${books.length === 1 ? 'title' : 'titles'} in catalogue`}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}><Plus size={14} /> Add Product</button>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Products</button>
        <button className={`tab-btn ${tab === 'featured' ? 'active' : ''}`} onClick={() => setTab('featured')}>Featured</button>
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')} style={{ position: 'relative' }}>
          Pending Submissions
          {pending.length > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--accent)', color: '#000', borderRadius: 9, padding: '1px 6px', fontSize: 9, fontFamily: 'var(--sans)', letterSpacing: '.05em' }}>
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'pending' ? (
        pending.length === 0
          ? <EmptyState title="No pending submissions." message="Author submissions will appear here for review." />
          : (
            <table className="data-table">
              <thead>
                <tr><th>Cover</th><th>Title</th><th>Author</th><th>Submitted</th><th>Variants</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pending.map((book: any) => (
                  <>
                    <tr key={book.id}>
                      <td>{book.coverImage
                        ? <img src={book.coverImage} alt="" style={{ width: 36, height: 46, objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: 36, height: 46, background: '#1a1a1a', border: '1px solid var(--hair)' }} />}
                      </td>
                      <td>
                        <div className="cell-title" style={{ fontSize: 14 }}>{book.title}</div>
                        <div style={{ fontFamily: 'var(--sans)', fontSize: 9, color: 'var(--dim)', marginTop: 2, letterSpacing: '.1em' }}>{book.category?.name || 'Uncategorised'}</div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--silver)', fontSize: 13 }}>{book.author?.penName}</div>
                        <div style={{ fontFamily: 'var(--sans)', fontSize: 9, color: 'var(--dim)', marginTop: 2 }}>{book.author?.user?.email}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)' }}>
                        {new Date(book.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(book.variants || []).map((v: any) => (
                            <span key={v.id} style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: '.15em', padding: '2px 6px', border: '1px solid var(--hair)', color: 'var(--silver)', textTransform: 'uppercase' }}>{v.type}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', color: '#6b9e6b', border: '1px solid #6b9e6b33' }}
                            onClick={() => approve.mutate(book.id)} disabled={approve.isPending}>
                            <Check size={12} /> Approve
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '5px 10px', color: '#c75353', border: '1px solid #c7535333' }}
                            onClick={() => { setRejectingId(book.id); setRejectNote('') }}>
                            <X size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                    {rejectingId === book.id && (
                      <tr key={`reject-${book.id}`}>
                        <td colSpan={6} style={{ padding: '12px 16px', background: 'rgba(199,83,83,.04)', borderTop: 'none' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                              <label style={{ fontSize: 9 }}>Rejection note (optional — sent to author)</label>
                              <textarea rows={2} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                                placeholder="e.g. Please revise the description and resubmit." />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-primary" style={{ background: '#c75353', borderColor: '#c75353' }}
                                onClick={() => reject.mutate({ id: book.id, note: rejectNote })} disabled={reject.isPending}>
                                Confirm Reject
                              </button>
                              <button className="btn btn-outline" onClick={() => setRejectingId(null)}>Cancel</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )
      ) : (
        books.length === 0
          ? <EmptyState title="No products yet." message="Add your first title to get started." />
          : (
            <table className="data-table">
              <thead>
                <tr><th>Cover</th><th>Title</th><th>Author</th><th>Type</th><th>Variants</th><th>Stock</th><th>Featured</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {books.map((book: any) => (
                  <tr key={book.id}>
                    <td>{book.coverImage ? <img src={book.coverImage} alt="" style={{ width: 36, height: 46, objectFit: 'cover', display: 'block' }} /> : <div style={{ width: 36, height: 46, background: '#1a1a1a' }} />}</td>
                    <td>
                      <div className="cell-title" style={{ fontSize: 14 }}>{book.title}</div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 9, color: 'var(--dim)', marginTop: 2, letterSpacing: '.1em' }}>{book.category?.name}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--silver)', fontSize: 13 }}>{book.author?.penName}</td>
                    <td><span style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--dim)' }}>{book.type}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(book.variants || []).map((v: any) => (
                          <span key={v.id} style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: '.15em', padding: '2px 6px', border: '1px solid var(--hair)', color: v.stock === 0 ? 'var(--dim)' : 'var(--silver)', textTransform: 'uppercase' }}>{v.type}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>
                        {(book.variants || []).reduce((s: number, v: any) => s + v.stock, 0)}
                        {(book.variants || []).some((v: any) => v.stock > 0 && v.stock < 10) && <span style={{ color: '#c75353', marginLeft: 6, fontSize: 9 }}>Low</span>}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => setFeatured.mutate({ id: book.id, isFeatured: !book.isFeatured })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: book.isFeatured ? 'var(--accent)' : 'var(--dim)' }}>
                        <Star size={14} fill={book.isFeatured ? 'var(--accent)' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => window.open(`/books/${book.slug}`, '_blank')}><Eye size={12} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => navigate(`/admin/products/${book.id}/edit`)}><Edit2 size={12} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px', color: '#c75353' }}
                          onClick={() => confirm(`Delete "${book.title}"?`) && remove.mutate(book.id)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}
    </div>
  )
}
