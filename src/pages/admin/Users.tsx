import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../../services/api'
import { Plus, UserCheck, UserX } from 'lucide-react'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

const roleColor: Record<string, string> = { SUPER_ADMIN: 'var(--bone)', AUTHOR: 'var(--accent)', CUSTOMER: 'var(--silver)' }

export default function AdminUsers() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'CUSTOMER'|'AUTHOR'>('CUSTOMER')
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'users', tab], queryFn: () => usersApi.list({ role: tab }) })
  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.update(id, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('Updated') },
  })

  if (isLoading) return <PageLoading />
  const users = (Array.isArray(data) ? data : data?.data) || []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="admin-page-title">Users & Authors</div>
          <div className="admin-page-subtitle">{users.length} {users.length === 1 ? 'account' : 'accounts'}</div>
        </div>
        {tab === 'AUTHOR' && <button className="btn btn-primary"><Plus size={14} /> Create Author</button>}
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'CUSTOMER' ? 'active' : ''}`} onClick={() => setTab('CUSTOMER')}>Customers</button>
        <button className={`tab-btn ${tab === 'AUTHOR' ? 'active' : ''}`} onClick={() => setTab('AUTHOR')}>Authors</button>
      </div>

      {users.length === 0 ? <EmptyState title={`No ${tab.toLowerCase()}s yet.`} /> : (
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>City</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td><div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24" }}>{u.firstName} {u.lastName}</div></td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--dim)' }}>{u.email}</td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--dim)' }}>{u.city || '—'}</td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>{u._count?.orders ?? 0}</td>
                <td style={{ fontFamily: 'var(--display)', fontSize: 15, fontVariationSettings: "'opsz' 24" }}>{Number(u.totalLifetimeSpend) > 0 ? `Rs. ${Number(u.totalLifetimeSpend).toLocaleString()}` : '—'}</td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: u.isActive ? '#6b9e6b' : 'var(--dim)' }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px', color: u.isActive ? '#c75353' : '#6b9e6b' }}
                    onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.isActive })}>
                    {u.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
