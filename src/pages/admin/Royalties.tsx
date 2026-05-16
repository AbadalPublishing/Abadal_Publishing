import { useQuery } from '@tanstack/react-query'
import { royaltyApi } from '../../services/api'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'

export default function AdminRoyalties() {
  const { data, isLoading } = useQuery({ queryKey: ['royalty-payouts'], queryFn: () => royaltyApi.list() })
  if (isLoading) return <PageLoading />
  const list = Array.isArray(data) ? data : []

  return (
    <div>
      <div className="admin-page-title">Royalty Payouts</div>
      <div className="admin-page-subtitle">Track payments to authors</div>

      {list.length === 0
        ? <EmptyState title="No payouts yet." message="Royalty payouts will appear here as you record them." />
        : (
          <table className="data-table">
            <thead><tr><th>Author</th><th>Period</th><th>Amount</th><th>Status</th><th>Bank Ref</th><th>Paid At</th></tr></thead>
            <tbody>
              {list.map((p: any) => (
                <tr key={p.id}>
                  <td><div className="cell-title">{p.author?.penName}</div></td>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>{p.period}</td>
                  <td style={{ fontFamily: 'var(--display)', fontSize: 18, fontVariationSettings: "'opsz' 24" }}>Rs. {Number(p.amount).toLocaleString()}</td>
                  <td><span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: p.status === 'PAID' ? '#6b9e6b' : 'var(--accent)' }}>{p.status}</span></td>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--dim)' }}>{p.bankRef || '—'}</td>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)' }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  )
}
