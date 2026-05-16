import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, shippingApi } from '../../services/api'
import { Search, Download, Truck } from 'lucide-react'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

const statuses = ['All', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrders() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [courierFilter, setCourierFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', filter, search, courierFilter, paymentFilter],
    queryFn: () => ordersApi.list({
      status: filter !== 'All' ? filter : undefined,
      search: search || undefined,
      courier: courierFilter || undefined,
      paymentMethod: paymentFilter || undefined,
    }),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'orders'] }); toast.success('Status updated') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  })
  const bookShipment = useMutation({
    mutationFn: (orderId: string) => shippingApi.book(orderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'orders'] }); toast.success('Shipment booked') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Booking failed'),
  })

  if (isLoading) return <PageLoading />
  const orders = (Array.isArray(data) ? data : data?.data) || []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div className="admin-page-title">Orders</div>
          <div className="admin-page-subtitle">{orders.length} {orders.length === 1 ? 'order' : 'orders'} matching filter</div>
        </div>
        <a className="btn btn-outline btn-sm" href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/analytics/export?type=orders`} target="_blank"><Download size={13} /> Export CSV</a>
      </div>

      <div className="tabs">
        {statuses.map(s => (
          <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={13} color="var(--dim)" />
          <input placeholder="Search by order number or customer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={courierFilter} onChange={e => setCourierFilter(e.target.value)}>
          <option value="">All Couriers</option><option value="TRAX">TRAX</option><option value="LEOPARDS">LEOPARDS</option>
        </select>
        <select className="filter-select" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">All Payments</option>
          <option value="COD">COD</option><option value="JAZZCASH">JazzCash</option>
          <option value="EASYPAISA">EasyPaisa</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank Transfer</option>
        </select>
      </div>

      {orders.length === 0 ? <EmptyState title="No orders yet." message="Orders will appear here as they come in." /> : (
        <table className="data-table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Courier</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id}>
                <td>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontVariationSettings: "'opsz' 24" }}>{order.orderNumber}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>{order.user?.firstName} {order.user?.lastName}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--dim)' }}>{order.address?.city}</div>
                </td>
                <td style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>{order.items?.length || 0}</td>
                <td><span style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24" }}>Rs. {Number(order.totalAmount).toLocaleString()}</span></td>
                <td><span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--dim)' }}>{order.paymentMethod}</span></td>
                <td><span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--silver)' }}>{order.courier || '—'}</span></td>
                <td>
                  <select value={order.status} onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value })}
                    style={{ background: 'transparent', border: '1px solid var(--hair)', color: 'var(--bone)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', padding: '4px 6px', textTransform: 'uppercase' }}>
                    {statuses.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {order.status === 'CONFIRMED' && !order.shipment && (
                      <button className="btn btn-outline btn-sm" style={{ padding: '6px 10px' }}
                        onClick={() => bookShipment.mutate(order.id)}><Truck size={11} /> Ship</button>
                    )}
                    <a href={`/admin/orders/${order.id}`} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>View</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
