import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react'
import { analyticsApi } from '../../services/api'
import { PageLoading } from '../../components/ui/LoadingState'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid var(--hair)', padding: '12px 16px' }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.15em', color: 'var(--dim)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontFamily: 'var(--display)', fontSize: 20, fontVariationSettings: "'opsz' 24", color: 'var(--bone)' }}>
          {p.dataKey === 'revenue' ? `Rs. ${Number(p.value).toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  )
}

const COLORS = ['#f4f2ed', '#c0c0c0', '#686868']

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useQuery({ queryKey: ['analytics', 'dashboard', '7d'], queryFn: () => analyticsApi.dashboard('7d') })
  const { data: live } = useQuery({ queryKey: ['analytics', 'live'], queryFn: () => analyticsApi.liveVisitors(), refetchInterval: 30_000 })
  const { data: top } = useQuery({ queryKey: ['analytics', 'top', '7d'], queryFn: () => analyticsApi.topProducts('7d') })

  if (isLoading) return <PageLoading />

  const totals = dashboard?.totals || { revenue: 0, orders: 0, customers: 0, pending: 0 }
  const daily = dashboard?.daily || []
  const byType = dashboard?.byType || []
  const topProducts = top || []
  const liveCount = live?.count ?? 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="admin-page-title">Dashboard</div>
          <div className="admin-page-subtitle">ABADAL PUBLISHING · {new Date().toLocaleString('en-PK', { month: 'long', year: 'numeric' }).toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', border: '1px solid var(--hair)', background: 'rgba(107,158,107,.08)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b9e6b' }} />
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6b9e6b' }}>{liveCount} Live Visitor{liveCount === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Revenue', value: `Rs. ${Number(totals.revenue).toLocaleString()}`, icon: TrendingUp },
          { label: 'Total Orders', value: totals.orders, icon: ShoppingBag },
          { label: 'Customers', value: Number(totals.customers).toLocaleString(), icon: Users },
          { label: 'Pending Orders', value: totals.pending, icon: AlertTriangle },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div className="stat-label">{stat.label}</div>
              <stat.icon size={16} color="var(--dim)" />
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-wrap">
          <div className="chart-title">Revenue — Last 7 Days</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily}>
              <XAxis dataKey="date" tick={{ fontFamily: 'var(--sans)', fontSize: 10, fill: 'var(--dim)', letterSpacing: 2 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="var(--bone)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {byType.length > 0 && (
          <div className="chart-wrap">
            <div className="chart-title">Sales by Type</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                  {byType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: '#0d0d0d', border: '1px solid var(--hair)', fontFamily: 'var(--sans)', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
              {byType.map((d: any, i: number) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.1em', color: 'var(--dim)' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }} className="chart-wrap">
        <div className="chart-title">Daily Visitors</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={daily} barSize={24}>
            <XAxis dataKey="date" tick={{ fontFamily: 'var(--sans)', fontSize: 10, fill: 'var(--dim)', letterSpacing: 2 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="visitors" fill="rgba(244,242,237,0.12)" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {topProducts.length > 0 && (
        <div style={{ marginTop: 20 }} className="chart-wrap">
          <div className="chart-title">Top Products by Revenue</div>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Author</th><th>Type</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              {topProducts.map((b: any) => (
                <tr key={b.id}>
                  <td><div className="cell-title">{b.title}</div></td>
                  <td style={{ color: 'var(--silver)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>{b.author?.penName}</td>
                  <td><span style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--dim)' }}>{b.type}</span></td>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 14 }}>{b.ordersCount}</td>
                  <td style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariationSettings: "'opsz' 24" }}>Rs. {Number(b.revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
