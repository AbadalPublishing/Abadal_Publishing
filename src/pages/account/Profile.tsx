import { useState } from 'react'

export default function Profile() {
  const [form, setForm] = useState({ firstName: 'Waqar Ali', lastName: 'Khan', email: 'waqar@example.com', phone: '+92 300 1234567', city: 'Peshawar' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, [k]: e.target.value})

  return (
    <div>
      <div className="account-content-title">Profile Settings</div>
      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div className="form-row">
          <div className="field"><label>First Name</label><input value={form.firstName} onChange={set('firstName')} /></div>
          <div className="field"><label>Last Name</label><input value={form.lastName} onChange={set('lastName')} /></div>
        </div>
        <div className="field"><label>Email Address</label><input type="email" value={form.email} onChange={set('email')} /></div>
        <div className="field"><label>Phone</label><input type="tel" value={form.phone} onChange={set('phone')} /></div>
        <div className="field"><label>City</label><input value={form.city} onChange={set('city')} /></div>
        <div className="divider" />
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 400, fontVariationSettings: "'opsz' 36" }}>Change Password</div>
        <div className="field"><label>Current Password</label><input type="password" placeholder="••••••••" /></div>
        <div className="field"><label>New Password</label><input type="password" placeholder="••••••••" /></div>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  )
}
