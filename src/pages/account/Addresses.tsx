import { useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'

const mockAddresses = [
  { id: '1', label: 'Home', firstName: 'Waqar Ali', lastName: 'Khan', phone: '+92 300 1234567', addressLine1: 'House 12, Street 4, Hayatabad Phase 2', city: 'Peshawar', state: 'KPK', country: 'Pakistan', isDefault: true },
  { id: '2', label: 'Office', firstName: 'Waqar Ali', lastName: 'Khan', phone: '+92 300 1234567', addressLine1: 'University of Peshawar, Main Campus', city: 'Peshawar', state: 'KPK', country: 'Pakistan', isDefault: false },
]

export default function Addresses() {
  const [addresses] = useState(mockAddresses)
  return (
    <div>
      <div className="account-content-title">Saved Addresses</div>
      <div className="addresses-grid" style={{ marginBottom: 24 }}>
        {addresses.map(addr => (
          <div key={addr.id} className="address-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div className="address-label-badge">{addr.label}{addr.isDefault && ' · Default'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 4 }}><Edit2 size={13} /></button>
                <button style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 4 }}><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="address-name">{addr.firstName} {addr.lastName}</div>
            <div className="address-text">{addr.addressLine1}<br />{addr.city}, {addr.state}<br />{addr.phone}</div>
            {!addr.isDefault && <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, padding: '6px 0', letterSpacing: '.15em', fontSize: 9 }}>Set as Default</button>}
          </div>
        ))}
        <div className="address-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', minHeight: 140 }}>
          <Plus size={20} color="var(--dim)" />
          <span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.2em', color: 'var(--dim)', textTransform: 'uppercase' }}>Add New Address</span>
        </div>
      </div>
    </div>
  )
}
