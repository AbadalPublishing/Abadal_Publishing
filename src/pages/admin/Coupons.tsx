import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsApi } from '../../services/api'
import { Plus, Trash2 } from 'lucide-react'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

export default function AdminCoupons() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: () => couponsApi.list() })
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'PERCENTAGE', value: 10,
    maxUses: '', onePerCustomer: true,
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30*24*3600*1000).toISOString().slice(0, 10),
    minOrderValue: '',
  })

  const create = useMutation({
    mutationFn: () => couponsApi.create({
      code: form.code.toUpperCase(),
      type: form.type, value: Number(form.value),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      onePerCustomer: form.onePerCustomer,
      validFrom: form.validFrom, validUntil: form.validUntil,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon created'); setShow(false) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Create failed'),
  })
  const remove = useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Removed') },
  })

  if (isLoading) return <PageLoading />
  const coupons = Array.isArray(data) ? data : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="admin-page-title">Coupons</div>
          <div className="admin-page-subtitle">{coupons.length} coupon{coupons.length === 1 ? '' : 's'}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={14} /> New Coupon</button>
      </div>

      {coupons.length === 0 ? <EmptyState title="No coupons yet." /> : (
        <table className="data-table">
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Uses</th><th>Min Order</th><th>Valid</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c: any) => (
              <tr key={c.id}>
                <td><div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24", letterSpacing: '.05em' }}>{c.code}</div></td>
                <td><span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', color: 'var(--dim)' }}>{c.type}</span></td>
                <td style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariationSettings: "'opsz' 24" }}>
                  {c.type === 'PERCENTAGE' ? `${Number(c.value)}%` : `Rs. ${Number(c.value).toLocaleString()}`}
                </td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--silver)' }}>{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>{c.minOrderValue ? `Rs. ${Number(c.minOrderValue).toLocaleString()}` : '—'}</td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)' }}>{new Date(c.validUntil).toLocaleDateString()}</td>
                <td><button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px', color: '#c75353' }} onClick={() => confirm('Delete?') && remove.mutate(c.id)}><Trash2 size={11} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {show && (
        <div className="modal-backdrop open" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShow(false)}>×</button>
            <div className="eyebrow" style={{ marginBottom: 12 }}>— New Coupon —</div>
            <div className="modal-title">Create <em>discount.</em></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
              <div className="field"><label>Code <span className="req">*</span></label><input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="LAUNCH10" /></div>
              <div className="form-row">
                <div className="field"><label>Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>PERCENTAGE</option><option>FIXED</option></select></div>
                <div className="field"><label>Value</label><input type="number" value={form.value} onChange={e => setForm({...form, value: +e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Valid From</label><input type="date" value={form.validFrom} onChange={e => setForm({...form, validFrom: e.target.value})} /></div>
                <div className="field"><label>Valid Until</label><input type="date" value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Max Uses (blank = unlimited)</label><input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} /></div>
                <div className="field"><label>Min Order Value (Rs.)</label><input type="number" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} /></div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.onePerCustomer} onChange={e => setForm({...form, onePerCustomer: e.target.checked})} style={{ width: 16, height: 16 }} />
                <span style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>One use per customer</span>
              </label>
              <button className="btn btn-primary btn-full" onClick={() => create.mutate()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
