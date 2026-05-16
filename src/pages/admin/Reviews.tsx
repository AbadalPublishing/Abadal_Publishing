import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import { Star, Check, X } from 'lucide-react'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'pending'|'approved'>('pending')
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', tab],
    queryFn: () => api.get(tab === 'pending' ? '/reviews/pending' : '/reviews?status=APPROVED').then(r => r.data),
  })
  const approve = useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/${id}/approve`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast.success('Approved') },
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast.success('Removed') },
  })

  if (isLoading) return <PageLoading />
  const reviews = Array.isArray(data) ? data : []

  return (
    <div>
      <div className="admin-page-title">Reviews</div>
      <div className="admin-page-subtitle">Moderate customer reviews</div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending</button>
        <button className={`tab-btn ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>Approved</button>
      </div>

      {reviews.length === 0
        ? <EmptyState title={`No ${tab} reviews.`} />
        : reviews.map((r: any) => (
          <div key={r.id} style={{ border: '1px solid var(--hair)', padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariationSettings: "'opsz' 36" }}>{r.title}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.1em', color: 'var(--dim)', marginTop: 4 }}>
                  on <strong style={{ color: 'var(--silver)' }}>{r.product?.title}</strong> by {r.user?.firstName} {r.user?.lastName} · {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {tab === 'pending' && <button className="btn btn-outline btn-sm" onClick={() => approve.mutate(r.id)} style={{ color: '#6b9e6b' }}><Check size={11} /> Approve</button>}
                <button className="btn btn-ghost btn-sm" onClick={() => confirm('Delete this review?') && remove.mutate(r.id)} style={{ color: '#c75353' }}><X size={11} /> Reject</button>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--silver)', lineHeight: 1.6 }}>{r.body}</p>
          </div>
        ))}
    </div>
  )
}
