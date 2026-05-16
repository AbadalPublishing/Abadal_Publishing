import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Download, Globe, MessageCircle, ShoppingBag, Eye, ExternalLink, TrendingUp, AlertTriangle } from 'lucide-react'
import { analyticsApi } from '../../services/api'
import { PageLoading } from '../../components/ui/LoadingState'

const INSIGHT_COLOR: Record<string, string> = {
  'High traffic, low intent — review description or pricing': '#c75353',
  'Low traffic — needs promotion': '#b8860b',
  'WhatsApp is primary channel — promote it': '#6b9e6b',
  'Amazon leads — consider Kindle exclusivity': '#6b9e6b',
  'Strong direct conversion — increase stock': '#6b9e6b',
  'Performing normally': 'var(--dim)',
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: any }) {
  return (
    <div className="stat-card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div className="stat-label">{label}</div>
        <Icon size={13} color="var(--dim)" />
      </div>
      <div className="stat-value" style={{ fontSize: 28 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, color: 'var(--dim)', letterSpacing: '.1em', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function ConvBar({ value, max, color = 'var(--silver)' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--hair)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width .4s' }} />
      </div>
      <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)', minWidth: 28, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function AdminAnalytics() {
  const [range, setRange] = useState<'7d'|'30d'|'90d'>('7d')

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard', range],
    queryFn: () => analyticsApi.dashboard(range),
  })
  const { data: geo } = useQuery({
    queryKey: ['analytics', 'geography'],
    queryFn: () => analyticsApi.geography(),
  })
  const { data: engagement, isLoading: engLoading } = useQuery({
    queryKey: ['analytics', 'book-engagement', range],
    queryFn: () => analyticsApi.bookEngagement(range),
  })

  if (isLoading) return <PageLoading />

  const daily = dashboard?.daily || []
  const ec = dashboard?.eventCounts || {}
  const geoData = Array.isArray(geo) ? geo : []
  const books: any[] = Array.isArray(engagement) ? engagement : []

  const maxViews = books.length ? Math.max(...books.map((b: any) => b.views)) : 1
  const maxWA    = books.length ? Math.max(...books.map((b: any) => b.whatsapp)) : 1
  const maxAZ    = books.length ? Math.max(...books.map((b: any) => b.amazon)) : 1

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="admin-page-title">Analytics</div>
          <div className="admin-page-subtitle">Click tracking · Conversion insights · Per-book breakdown</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="filter-select" value={range} onChange={e => setRange(e.target.value as any)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <a href={analyticsApi.exportUrl('events')} className="btn btn-outline btn-sm" target="_blank"><Download size={12} /> Events CSV</a>
        </div>
      </div>

      {/* ── Overview KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Page Views"      value={(ec['PAGE_VIEW']      || 0).toLocaleString()} icon={Eye}           />
        <StatCard label="Book Clicks"     value={(ec['BOOK_CLICK']     || 0).toLocaleString()} icon={Eye}           />
        <StatCard label="WhatsApp Clicks" value={(ec['WHATSAPP_CLICK'] || 0).toLocaleString()} icon={MessageCircle} />
        <StatCard label="Amazon Clicks"   value={(ec['AMAZON_CLICK']   || 0).toLocaleString()} icon={ExternalLink}  />
        <StatCard label="Add to Cart"     value={(ec['ADD_TO_CART']    || 0).toLocaleString()} icon={ShoppingBag}   />
        <StatCard label="Orders Placed"   value={(dashboard?.totals?.orders || 0).toLocaleString()} icon={TrendingUp} sub={`Rs. ${(dashboard?.totals?.revenue || 0).toLocaleString()}`} />
      </div>

      {/* ── Daily Traffic Chart ── */}
      <div className="chart-wrap" style={{ marginBottom: 20 }}>
        <div className="chart-title">Daily Traffic — {range}</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={daily}>
            <defs>
              <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(244,242,237,0.15)" />
                <stop offset="95%" stopColor="rgba(244,242,237,0)" />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontFamily: 'var(--sans)', fontSize: 10, fill: 'var(--dim)', letterSpacing: 2 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid var(--hair)', fontFamily: 'var(--sans)', fontSize: 11 }} />
            <Area type="monotone" dataKey="pageViews" stroke="var(--bone)" strokeWidth={1.5} fill="url(#vGrad)" name="Page Views" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Per-Book Engagement ── */}
      <div className="chart-wrap" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>Book Performance</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', color: 'var(--dim)', textTransform: 'uppercase' }}>Clicks · WhatsApp · Amazon · Conversions</div>
        </div>

        {engLoading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--dim)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>Loading…</div>
        ) : books.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--dim)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>No engagement data yet — share your books to get started.</div>
        ) : (
          <div>
            {/* Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 1fr 1fr 1.5fr', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--hair)', marginBottom: 4 }}>
              {['Book', 'Views', 'WhatsApp Clicks', 'Amazon Clicks', 'Add to Cart', 'Orders', 'Decision'].map(h => (
                <div key={h} style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--dim)' }}>{h}</div>
              ))}
            </div>

            {books.map((b: any) => (
              <div key={b.product?.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 1fr 1fr 1.5fr', gap: 12, padding: '16px', borderBottom: '1px solid var(--hair)', alignItems: 'center' }}>
                {/* Book */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {b.product?.coverImage
                    ? <img src={b.product.coverImage} alt="" style={{ width: 32, height: 42, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 32, height: 42, background: '#111', flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontVariationSettings: "'opsz' 24", lineHeight: 1.2, marginBottom: 2 }}>{b.product?.title}</div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 9, color: 'var(--dim)', letterSpacing: '.1em' }}>{b.product?.author?.penName}</div>
                  </div>
                </div>

                {/* Views */}
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24", marginBottom: 4 }}>{b.views}</div>
                  <ConvBar value={b.views} max={maxViews} color="rgba(244,242,237,.5)" />
                </div>

                {/* WhatsApp */}
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24", marginBottom: 4, color: b.whatsapp > 0 ? '#6b9e6b' : 'var(--dim)' }}>
                    {b.whatsapp} <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)' }}>{b.whatsappRate}%</span>
                  </div>
                  <ConvBar value={b.whatsapp} max={maxWA} color="#6b9e6b" />
                </div>

                {/* Amazon */}
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24", marginBottom: 4, color: b.amazon > 0 ? 'var(--accent)' : 'var(--dim)' }}>
                    {b.amazon} <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)' }}>{b.amazonRate}%</span>
                  </div>
                  <ConvBar value={b.amazon} max={maxAZ} color="var(--accent)" />
                </div>

                {/* Cart */}
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14 }}>{b.cart}</div>

                {/* Orders */}
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24" }}>{b.orders}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 9, color: 'var(--dim)', marginTop: 2 }}>{b.conversionRate}% conv.</div>
                </div>

                {/* Insight */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  {INSIGHT_COLOR[b.insight] === '#c75353' && <AlertTriangle size={11} color="#c75353" style={{ flexShrink: 0, marginTop: 2 }} />}
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 10, lineHeight: 1.5, color: INSIGHT_COLOR[b.insight] || 'var(--dim)' }}>
                    {b.insight}
                  </span>
                </div>
              </div>
            ))}

            {/* Revenue summary row */}
            {books.some((b: any) => b.revenue > 0) && (
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'flex-end', gap: 32 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)', letterSpacing: '.1em' }}>
                  TOTAL REVENUE THIS PERIOD
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariationSettings: "'opsz' 24", color: 'var(--bone)' }}>
                  Rs. {books.reduce((s: number, b: any) => s + b.revenue, 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Orders by City ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="chart-wrap">
          <div className="chart-title"><Globe size={12} style={{ marginRight: 8, verticalAlign: 'middle' }} />Orders by City</div>
          {geoData.length === 0
            ? <div style={{ padding: 20, color: 'var(--dim)', fontStyle: 'italic', fontFamily: 'var(--serif)', textAlign: 'center' }}>No order data yet</div>
            : (
              <table className="data-table">
                <thead><tr><th>City</th><th>Orders</th><th>Revenue</th><th>Share</th></tr></thead>
                <tbody>
                  {geoData.map((g: any) => {
                    const totalOrders = geoData.reduce((s: number, x: any) => s + x.orders, 0)
                    const pct = totalOrders > 0 ? Math.round((g.orders / totalOrders) * 100) : 0
                    return (
                      <tr key={g.city}>
                        <td style={{ fontFamily: 'var(--display)', fontSize: 15, fontVariationSettings: "'opsz' 24" }}>{g.city}</td>
                        <td style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>{g.orders}</td>
                        <td style={{ fontFamily: 'var(--display)', fontSize: 14, fontVariationSettings: "'opsz' 24" }}>Rs. {Number(g.revenue).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ height: 2, background: 'var(--hair)', flex: 1, borderRadius: 1 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--silver)', borderRadius: 1 }} />
                            </div>
                            <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)', minWidth: 28 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
        </div>

        <div className="chart-wrap">
          <div className="chart-title">Daily Orders</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily} barSize={20}>
              <XAxis dataKey="date" tick={{ fontFamily: 'var(--sans)', fontSize: 10, fill: 'var(--dim)', letterSpacing: 2 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid var(--hair)', fontFamily: 'var(--sans)', fontSize: 11 }} />
              <Bar dataKey="orders" fill="rgba(244,242,237,0.15)" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Exports ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href={analyticsApi.exportUrl('orders')}   className="btn btn-outline btn-sm" target="_blank"><Download size={11} /> Orders CSV</a>
        <a href={analyticsApi.exportUrl('revenue')}  className="btn btn-outline btn-sm" target="_blank"><Download size={11} /> Revenue CSV</a>
        <a href={analyticsApi.exportUrl('customers')} className="btn btn-outline btn-sm" target="_blank"><Download size={11} /> Customers CSV</a>
        <a href={analyticsApi.exportUrl('events')}   className="btn btn-outline btn-sm" target="_blank"><Download size={11} /> Events CSV</a>
      </div>
    </div>
  )
}
