import { useQuery } from '@tanstack/react-query'
import { authorsApi } from '../../services/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, BookOpen, Eye, DollarSign } from 'lucide-react'
import { PageLoading } from '../../components/ui/LoadingState'

export default function SalesStats() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['author', 'me', 'stats'], queryFn: () => authorsApi.myStats() })
  if (isLoading) return <PageLoading />

  const totals = stats?.totals || { totalSold: 0, totalRevenue: 0, totalRoyaltyEarned: 0, totalPageViews: 0 }
  const monthly = stats?.monthly || []
  const perBook = stats?.perBook || []

  return (
    <div>
      <div className="account-content-title">Sales & Royalties</div>
      <div style={{ padding: '20px 24px', border: '1px solid var(--hair)', background: 'rgba(244,242,237,.015)', marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--silver)', lineHeight: 1.6 }}>
          Royalty is calculated when an order is marked Delivered. Configure your payout accounts in <strong style={{ color: 'var(--bone)' }}>Payouts</strong>.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Copies Sold', value: totals.totalSold, icon: BookOpen },
          { label: 'Gross Revenue', value: `Rs. ${Number(totals.totalRevenue).toLocaleString()}`, icon: TrendingUp },
          { label: 'Royalty Earned', value: `Rs. ${Number(totals.totalRoyaltyEarned).toLocaleString()}`, icon: DollarSign },
          { label: 'Page Views', value: Number(totals.totalPageViews).toLocaleString(), icon: Eye },
        ].map(s => (
          <div key={s.label} style={{ padding: 24, border: '1px solid var(--hair)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div className="stat-label">{s.label}</div>
              <s.icon size={14} color="var(--dim)" />
            </div>
            <div className="stat-value" style={{ fontSize: 30 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="chart-wrap" style={{ marginBottom: 32 }}>
        <div className="chart-title">Royalty Earned — This Year</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly}>
            <XAxis dataKey="month" tick={{ fontFamily: 'var(--sans)', fontSize: 10, fill: 'var(--dim)', letterSpacing: 2 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid var(--hair)', fontFamily: 'var(--sans)', fontSize: 11 }} />
            <Line type="monotone" dataKey="royalty" stroke="var(--accent)" strokeWidth={1.5} dot={{ r: 3, fill: 'var(--accent)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="eyebrow" style={{ marginBottom: 18 }}>— Per-Book Breakdown —</div>
      <table className="data-table">
        <thead>
          <tr><th>Book</th><th>Format</th><th>Sold</th><th>Royalty %</th><th>Royalty Earned</th></tr>
        </thead>
        <tbody>
          {perBook.length === 0
            ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--dim)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>No sales yet</td></tr>
            : perBook.map((row: any, i: number) => (
              <tr key={i}>
                <td><div className="cell-title">{row.title}</div></td>
                <td><span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', color: 'var(--silver)' }}>{row.variantType}</span></td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 14 }}>{row.sold}</td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--accent)' }}>{row.royaltyPct}%</td>
                <td style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24" }}>Rs. {Number(row.royaltyEarned).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
