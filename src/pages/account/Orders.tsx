import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../../services/api'
import { ChevronRight } from 'lucide-react'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'

export default function Orders() {
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders', 'mine'], queryFn: () => ordersApi.list() })

  if (isLoading) return <PageLoading />
  const list = Array.isArray(orders) ? orders : []

  return (
    <div>
      <div className="account-content-title">Order History</div>
      {list.length === 0
        ? <EmptyState title="No orders yet." message="When you place your first order, it'll appear here." />
        : list.map((order: any) => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div>
                <div className="order-number">{order.orderNumber}</div>
                <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })} · {order.paymentMethod}</div>
              </div>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>
            {order.items?.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'var(--sans)', fontSize: 13 }}>
                <span style={{ color: 'var(--silver)' }}>{item.title} <span style={{ color: 'var(--dim)', fontSize: 10, letterSpacing: '.15em' }}>({item.variantType}) × {item.quantity}</span></span>
                <span>Rs. {Number(item.total).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--hair)' }}>
              <div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', color: 'var(--dim)', marginBottom: 4 }}>TOTAL</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36" }}>Rs. {Number(order.totalAmount).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {order.shipment?.trackingNumber && (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.1em', color: 'var(--dim)' }}>
                    {order.shipment.courier} · {order.shipment.trackingNumber}
                  </div>
                )}
                <button className="btn btn-outline btn-sm">
                  Track <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
