import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi, categoriesApi, authorsApi } from '../../services/api'
import { Save, Plus, Trash2, ChevronLeft, Star } from 'lucide-react'
import CloudinaryUploader from '../../components/ui/CloudinaryUploader'
import { PageLoading } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

type VariantType = 'PAPERBACK' | 'HARDCOVER' | 'EBOOK'
const defaultRoyalty: Record<VariantType, number> = { PAPERBACK: 10, HARDCOVER: 12, EBOOK: 20 }

export default function AdminProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isNew = !id

  const { data: book, isLoading } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const list = await productsApi.list({ limit: 100 })
      const arr = Array.isArray(list) ? list : (list?.data || [])
      return arr.find((b: any) => b.id === id)
    },
    enabled: !!id,
  })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() })
  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: () => authorsApi.list() })

  const [tab, setTab] = useState<'details'|'variants'|'media'|'seo'>('details')
  const [form, setForm] = useState<any>({
    title: '', type: 'BOOK', categoryId: '', authorId: '',
    publisher: 'Abadal Publishing', publishedDate: '', pages: 0, language: 'English',
    description: '', pullQuote: '', editorialNote: '', amazonUrl: '', tags: '',
    coverImage: '',
    isFeatured: false, featuredUntil: '',
  })
  const [variants, setVariants] = useState<any[]>([])

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title, type: book.type, categoryId: book.categoryId || '', authorId: book.authorId || '',
        publisher: book.publisher, publishedDate: book.publishedDate || '', pages: book.pages || 0,
        language: book.language, description: book.description,
        pullQuote: book.pullQuote || '', editorialNote: book.editorialNote || '',
        amazonUrl: book.amazonUrl || '', tags: (book.tags || []).join(', '),
        coverImage: book.coverImage || '',
        isFeatured: book.isFeatured, featuredUntil: book.featuredUntil || '',
      })
      setVariants((book.variants || []).map((v: any) => ({
        ...v,
        retailPrice: Number(v.retailPrice), wholesalePrice: Number(v.wholesalePrice),
        studentPrice: Number(v.studentPrice), royaltyPercentage: Number(v.royaltyPercentage),
      })))
    }
  }, [book])

  const createProduct = useMutation({
    mutationFn: () => productsApi.create({
      ...form, pages: Number(form.pages), tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      variants,
    }),
    onSuccess: (b) => { qc.invalidateQueries(); toast.success('Product created'); navigate(`/admin/products/${b.id}/edit`) },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Create failed'),
  })

  const updateProduct = useMutation({
    mutationFn: () => productsApi.update(id!, {
      ...form, pages: Number(form.pages), tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    }),
    onSuccess: () => { qc.invalidateQueries(); toast.success('Saved') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed'),
  })

  const updateVariant = useMutation({
    mutationFn: ({ id, data }: any) => productsApi.updateVariant(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'product'] }); toast.success('Variant saved') },
  })

  const addVariant = (type: VariantType) => {
    const newVariant = {
      type, isbn: '', sku: '', retailPrice: 0, wholesalePrice: 0, studentPrice: 0,
      stock: 0, lowStockThreshold: 10,
      weight: type === 'EBOOK' ? 0 : 400, length: 22, width: 14, height: 2,
      royaltyPercentage: defaultRoyalty[type], isActive: true,
      _new: true,
    }
    if (!isNew && id) {
      productsApi.addVariant(id, newVariant).then(() => qc.invalidateQueries({ queryKey: ['admin', 'product'] }))
    } else {
      setVariants(prev => [...prev, { ...newVariant, id: `tmp-${Date.now()}` }])
    }
  }

  const setVariantField = (vid: string, key: string, val: any) => {
    setVariants(prev => prev.map(v => v.id === vid ? { ...v, [key]: val, _dirty: true } : v))
  }
  const saveVariant = (v: any) => {
    if (v._new) return // handled via product create
    updateVariant.mutate({ id: v.id, data: { retailPrice: v.retailPrice, wholesalePrice: v.wholesalePrice, studentPrice: v.studentPrice, stock: v.stock, royaltyPercentage: v.royaltyPercentage, weight: v.weight, isbn: v.isbn, sku: v.sku } })
  }
  const removeVariant = (vid: string) => {
    if (!isNew && !vid.startsWith('tmp-')) {
      if (!confirm('Delete this variant?')) return
      productsApi.deleteVariant(vid).then(() => qc.invalidateQueries({ queryKey: ['admin', 'product'] }))
    } else {
      setVariants(prev => prev.filter(v => v.id !== vid))
    }
  }

  if (!isNew && isLoading) return <PageLoading />

  const cats = Array.isArray(categories) ? categories : []
  const auths = Array.isArray(authors) ? authors : []

  return (
    <div>
      <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.2em', color: 'var(--dim)', textDecoration: 'none', marginBottom: 24, textTransform: 'uppercase' }}>
        <ChevronLeft size={14} /> Back to Products
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="admin-page-title">{isNew ? 'New Product' : form.title || 'Edit Product'}</div>
          <div className="admin-page-subtitle">{isNew ? 'Create a new title in the catalogue' : `Editing`}</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => isNew ? createProduct.mutate() : updateProduct.mutate()} disabled={createProduct.isPending || updateProduct.isPending}>
            <Save size={14} /> {isNew ? 'Create' : 'Save'} Product
          </button>
        </div>
      </div>

      <div className="tabs">
        {(['details','variants','media','seo'] as const).map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'details' ? 'Details' : t === 'variants' ? `Variants & Royalties (${variants.length})` : t === 'media' ? 'Media' : 'SEO'}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, maxWidth: 1100 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div className="field"><label>Title <span className="req">*</span></label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="form-row">
              <div className="field">
                <label>Type <span className="req">*</span></label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="BOOK">Book</option><option value="EBOOK">eBook</option>
                  <option value="MAGAZINE">Magazine</option><option value="COURSE">Course</option>
                </select>
              </div>
              <div className="field">
                <label>Category</label>
                <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                  <option value="">Select category…</option>
                  {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Author</label>
                <select value={form.authorId} onChange={e => setForm({...form, authorId: e.target.value})}>
                  <option value="">Select author…</option>
                  {auths.map((a: any) => <option key={a.id} value={a.id}>{a.penName}</option>)}
                </select>
              </div>
              <div className="field"><label>Publisher</label><input value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Published Date</label><input value={form.publishedDate} onChange={e => setForm({...form, publishedDate: e.target.value})} placeholder="2026" /></div>
              <div className="field"><label>Pages</label><input type="number" value={form.pages} onChange={e => setForm({...form, pages: +e.target.value})} /></div>
            </div>
            <div className="field"><label>Language</label><input value={form.language} onChange={e => setForm({...form, language: e.target.value})} /></div>
            <div className="field"><label>Tags (comma-separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="History, Pashtunwali, KPK" /></div>
            <div className="field"><label>Description</label><textarea rows={6} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="field"><label>Pull Quote (shown on homepage when featured)</label><textarea rows={3} value={form.pullQuote} onChange={e => setForm({...form, pullQuote: e.target.value})} /></div>
            <div className="field"><label>Editorial Note</label><textarea rows={3} value={form.editorialNote} onChange={e => setForm({...form, editorialNote: e.target.value})} /></div>
            <div className="field"><label>Amazon URL (for eBook redirect)</label><input value={form.amazonUrl} onChange={e => setForm({...form, amazonUrl: e.target.value})} placeholder="https://amazon.com/dp/..." /></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ border: '1px solid var(--hair)', padding: 24 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariationSettings: "'opsz' 36", marginBottom: 16 }}>
                <Star size={14} fill={form.isFeatured ? 'var(--accent)' : 'none'} color="var(--accent)" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Featured Book
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} style={{ width: 16, height: 16, accentColor: 'var(--bone)' }} />
                <span style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.15em' }}>Show on homepage</span>
              </label>
              {form.isFeatured && (
                <div className="field"><label>Featured Until (optional)</label><input type="date" value={form.featuredUntil} onChange={e => setForm({...form, featuredUntil: e.target.value})} /></div>
              )}
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginTop: 12, lineHeight: 1.55 }}>
                If no book is manually featured, the best-selling book of the month auto-displays.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'variants' && (
        <div>
          <div style={{ padding: '20px 24px', border: '1px solid var(--hair)', background: 'rgba(244,242,237,.015)', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--silver)', lineHeight: 1.6 }}>
              Each format (Paperback, Hardcover, eBook) is a separate variant with its own price tiers, stock, and <strong style={{ color: 'var(--bone)' }}>royalty percentage</strong>. The royalty % set here overrides the author's default — calculated when an order is delivered.
            </div>
          </div>

          {variants.map(v => (
            <div key={v.id} style={{ border: '1px solid var(--hair)', marginBottom: 20, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--hair)' }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>Variant</div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontVariationSettings: "'opsz' 36" }}>{v.type}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {v._dirty && !v._new && <button className="btn btn-primary btn-sm" onClick={() => saveVariant(v)}><Save size={11} /> Save</button>}
                  <button onClick={() => removeVariant(v.id)} className="btn btn-ghost btn-sm" style={{ color: '#c75353' }}>
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 24 }}>
                <div className="field"><label>ISBN</label><input value={v.isbn || ''} onChange={e => setVariantField(v.id, 'isbn', e.target.value)} /></div>
                <div className="field"><label>SKU</label><input value={v.sku || ''} onChange={e => setVariantField(v.id, 'sku', e.target.value)} /></div>
              </div>

              <div className="eyebrow" style={{ marginBottom: 14 }}>Price Tiers (Rs.)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 28 }}>
                <div className="field"><label>Retail</label><input type="number" value={v.retailPrice} onChange={e => setVariantField(v.id, 'retailPrice', +e.target.value)} /></div>
                <div className="field"><label>Wholesale</label><input type="number" value={v.wholesalePrice} onChange={e => setVariantField(v.id, 'wholesalePrice', +e.target.value)} /></div>
                <div className="field"><label>Student</label><input type="number" value={v.studentPrice} onChange={e => setVariantField(v.id, 'studentPrice', +e.target.value)} /></div>
              </div>

              {v.type !== 'EBOOK' && (
                <>
                  <div className="eyebrow" style={{ marginBottom: 14 }}>Inventory & Shipping</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 24 }}>
                    <div className="field"><label>Stock Quantity</label><input type="number" value={v.stock} onChange={e => setVariantField(v.id, 'stock', +e.target.value)} /></div>
                    <div className="field"><label>Low Stock Alert</label><input type="number" value={v.lowStockThreshold} onChange={e => setVariantField(v.id, 'lowStockThreshold', +e.target.value)} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 28 }}>
                    <div className="field"><label>Weight (g)</label><input type="number" value={v.weight} onChange={e => setVariantField(v.id, 'weight', +e.target.value)} /></div>
                    <div className="field"><label>Length (cm)</label><input type="number" value={v.length} onChange={e => setVariantField(v.id, 'length', +e.target.value)} /></div>
                    <div className="field"><label>Width (cm)</label><input type="number" value={v.width} onChange={e => setVariantField(v.id, 'width', +e.target.value)} /></div>
                    <div className="field"><label>Height (cm)</label><input type="number" value={v.height} onChange={e => setVariantField(v.id, 'height', +e.target.value)} /></div>
                  </div>
                </>
              )}

              <div style={{ padding: 20, border: '1px solid var(--accent)', background: 'rgba(139,105,20,.05)' }}>
                <div className="eyebrow" style={{ marginBottom: 14, color: 'var(--accent)' }}>Author Royalty</div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20, alignItems: 'end' }}>
                  <div className="field">
                    <label>Percentage</label>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <input type="number" step="0.5" min="0" max="100" value={v.royaltyPercentage}
                        onChange={e => setVariantField(v.id, 'royaltyPercentage', +e.target.value)}
                        style={{ flex: 1 }} />
                      <span style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--accent)' }}>%</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--silver)', lineHeight: 1.6 }}>
                    Author earns <strong style={{ color: 'var(--bone)' }}>Rs. {Math.round(v.retailPrice * v.royaltyPercentage / 100).toLocaleString()}</strong> per {String(v.type).toLowerCase()} sold at retail price.
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {(['PAPERBACK', 'HARDCOVER', 'EBOOK'] as const).filter(t => !variants.some(v => v.type === t)).map(type => (
              <button key={type} className="btn btn-outline" onClick={() => addVariant(type)}>
                <Plus size={12} /> Add {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'media' && (
        <div style={{ maxWidth: 800 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Cover Image</div>
          <CloudinaryUploader
            value={form.coverImage}
            onChange={(url) => setForm({ ...form, coverImage: url })}
            onRemove={() => setForm({ ...form, coverImage: '' })}
            folder="abadal/covers"
            label="Upload book cover"
          />
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginTop: 12 }}>
            Uploaded directly to Cloudinary CDN — no Railway bandwidth used. Click <strong style={{ color: 'var(--bone)' }}>Save Product</strong> when done.
          </p>
        </div>
      )}

      {tab === 'seo' && (
        <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ padding: '16px 20px', border: '1px solid var(--hair)', background: 'rgba(244,242,237,.015)' }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--silver)', lineHeight: 1.6 }}>
              Slug is auto-generated from title: <strong style={{ color: 'var(--bone)' }}>/books/{form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'auto-generated'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
