import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../../services/api'
import { Save } from 'lucide-react'
import { PageLoading } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get() })
  const [form, setForm] = useState<any>({})

  useEffect(() => { if (data) setForm({
    storeName: data.storeName || '', storeEmail: data.storeEmail || '', storePhone: data.storePhone || '',
    whatsappNumber: data.whatsappNumber || '', address: data.address || '', city: data.city || '', country: data.country || '',
    shippingRate: Number(data.shippingRate) || 200, freeShippingAbove: Number(data.freeShippingAbove) || 2000, lowStockThreshold: data.lowStockThreshold || 10,
    twitter: data.socialLinks?.twitter || '', instagram: data.socialLinks?.instagram || '', amazon: data.amazonAffiliateUrl || '',
  }) }, [data])

  const save = useMutation({
    mutationFn: () => settingsApi.update({
      storeName: form.storeName, storeEmail: form.storeEmail, storePhone: form.storePhone,
      whatsappNumber: form.whatsappNumber, address: form.address, city: form.city, country: form.country,
      shippingRate: Number(form.shippingRate), freeShippingAbove: Number(form.freeShippingAbove), lowStockThreshold: Number(form.lowStockThreshold),
      socialLinks: { twitter: form.twitter, instagram: form.instagram },
      amazonAffiliateUrl: form.amazon,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed'),
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.type === 'number' ? +e.target.value : e.target.value })

  if (isLoading) return <PageLoading />

  return (
    <div>
      <div className="admin-page-title">Site Settings</div>
      <div className="admin-page-subtitle">Configure store-wide settings</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, maxWidth: 900 }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36", marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--hair)' }}>Store Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="field"><label>Store Name</label><input value={form.storeName || ''} onChange={set('storeName')} /></div>
            <div className="field"><label>Store Email</label><input type="email" value={form.storeEmail || ''} onChange={set('storeEmail')} /></div>
            <div className="field"><label>Store Phone</label><input value={form.storePhone || ''} onChange={set('storePhone')} /></div>
            <div className="field"><label>WhatsApp Number (without +)</label><input value={form.whatsappNumber || ''} onChange={set('whatsappNumber')} /></div>
            <div className="field"><label>Address</label><input value={form.address || ''} onChange={set('address')} /></div>
            <div className="form-row">
              <div className="field"><label>City</label><input value={form.city || ''} onChange={set('city')} /></div>
              <div className="field"><label>Country</label><input value={form.country || ''} onChange={set('country')} /></div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36", marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--hair)' }}>Shipping & Inventory</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="field"><label>Flat Shipping Rate (Rs.)</label><input type="number" value={form.shippingRate || ''} onChange={set('shippingRate')} /></div>
            <div className="field"><label>Free Shipping Above (Rs.)</label><input type="number" value={form.freeShippingAbove || ''} onChange={set('freeShippingAbove')} /></div>
            <div className="field"><label>Low Stock Alert Threshold</label><input type="number" value={form.lowStockThreshold || ''} onChange={set('lowStockThreshold')} /></div>
          </div>

          <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36", margin: '36px 0 24px', paddingBottom: 16, borderBottom: '1px solid var(--hair)' }}>Social Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="field"><label>Twitter / X</label><input value={form.twitter || ''} onChange={set('twitter')} /></div>
            <div className="field"><label>Instagram</label><input value={form.instagram || ''} onChange={set('instagram')} /></div>
            <div className="field"><label>Amazon Store URL</label><input value={form.amazon || ''} onChange={set('amazon')} /></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--hair)' }}>
        <button className="btn btn-primary btn-lg" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save size={14} /> {save.isPending ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
