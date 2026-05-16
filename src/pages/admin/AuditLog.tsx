import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'

export default function AdminAuditLog() {
  const { data, isLoading } = useQuery({ queryKey: ['audit'], queryFn: () => api.get('/audit').then(r => r.data) })
  if (isLoading) return <PageLoading />
  const list = Array.isArray(data) ? data : (data?.data || [])

  return (
    <div>
      <div className="admin-page-title">Audit Log</div>
      <div className="admin-page-subtitle">All admin actions, time-stamped</div>

      {list.length === 0
        ? <EmptyState title="No audit entries yet." message="Admin actions will be logged here." />
        : (
          <table className="data-table">
            <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Entity</th><th>IP</th></tr></thead>
            <tbody>
              {list.map((a: any) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)' }}>{new Date(a.createdAt).toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>{a.admin?.firstName} {a.admin?.lastName}</td>
                  <td><span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', color: 'var(--silver)' }}>{a.action}</span></td>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--dim)' }}>{a.entityType}:{a.entityId?.slice(0, 8)}</td>
                  <td style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)' }}>{a.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  )
}
