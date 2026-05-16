import { useState } from 'react'
import { Plus, Edit2, Trash2, Star, Shield } from 'lucide-react'

type AccountType = 'BANK' | 'JAZZCASH' | 'EASYPAISA' | 'NAYAPAY' | 'SADAPAY'

interface PayoutAccount {
  id: string
  type: AccountType
  accountTitle: string
  accountNumber: string
  bankName?: string
  isDefault: boolean
}

const initial: PayoutAccount[] = [
  { id: '1', type: 'BANK', accountTitle: 'Waqar Ali Khan', accountNumber: 'PK36HABB0000001123456702', bankName: 'Habib Bank Limited', isDefault: true },
  { id: '2', type: 'JAZZCASH', accountTitle: 'Waqar Ali Khan', accountNumber: '03001234567', isDefault: false },
]

const typeMeta: Record<AccountType, { label: string; numberLabel: string; needsBank: boolean }> = {
  BANK: { label: 'Bank Account', numberLabel: 'IBAN / Account Number', needsBank: true },
  JAZZCASH: { label: 'JazzCash', numberLabel: 'Mobile Number', needsBank: false },
  EASYPAISA: { label: 'EasyPaisa', numberLabel: 'Mobile Number', needsBank: false },
  NAYAPAY: { label: 'NayaPay', numberLabel: 'NayaPay ID / Phone', needsBank: false },
  SADAPAY: { label: 'SadaPay', numberLabel: 'SadaPay Number', needsBank: false },
}

export default function Payments() {
  const [accounts, setAccounts] = useState(initial)
  const [editing, setEditing] = useState<PayoutAccount | null>(null)
  const [creatingType, setCreatingType] = useState<AccountType | null>(null)

  const setDefault = (id: string) => setAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
  const remove = (id: string) => setAccounts(prev => prev.filter(a => a.id !== id))
  const existingTypes = new Set(accounts.map(a => a.type))
  const availableTypes = (Object.keys(typeMeta) as AccountType[]).filter(t => !existingTypes.has(t))

  return (
    <div>
      <div className="account-content-title">Payout Accounts</div>

      <div style={{ padding: '20px 24px', border: '1px solid var(--accent)', background: 'rgba(139,105,20,.05)', marginBottom: 32, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Shield size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontVariationSettings: "'opsz' 24", marginBottom: 6, color: 'var(--accent)' }}>Where should we pay your royalties?</div>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--silver)', lineHeight: 1.6 }}>
            Add the accounts where you'd like to receive royalty payments. Mark one as default — that's where we'll send your earnings each payout cycle. Account details are encrypted at rest.
          </p>
        </div>
      </div>

      {accounts.length === 0
        ? <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--dim)', fontSize: 16, marginBottom: 32 }}>No payout accounts added yet.</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ border: `1px solid ${acc.isDefault ? 'var(--bone)' : 'var(--hair)'}`, padding: 24, position: 'relative' }}>
                {acc.isDefault && (
                  <div style={{ position: 'absolute', top: -1, right: -1, padding: '4px 12px', background: 'var(--bone)', color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Star size={10} fill="var(--ink)" /> Default
                  </div>
                )}
                <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>{typeMeta[acc.type].label}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontVariationSettings: "'opsz' 36", marginBottom: 4 }}>{acc.accountTitle}</div>
                {acc.bankName && <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--silver)', marginBottom: 8 }}>{acc.bankName}</div>}
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--silver)', letterSpacing: '.05em', marginBottom: 16 }}>{acc.accountNumber}</div>
                <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid var(--hair)' }}>
                  {!acc.isDefault && <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => setDefault(acc.id)}><Star size={11} /> Make Default</button>}
                  <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => setEditing(acc)}><Edit2 size={11} /></button>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px', color: '#c75353', marginLeft: 'auto' }} onClick={() => remove(acc.id)}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      {availableTypes.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginBottom: 16 }}>— Add Payout Method —</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {availableTypes.map(type => (
              <button key={type} onClick={() => setCreatingType(type)}
                style={{ background: 'transparent', border: '1px dashed var(--hair-md)', padding: '20px 16px', cursor: 'pointer', color: 'var(--silver)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Plus size={14} />
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase' }}>{typeMeta[type].label}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ROYALTY SUMMARY */}
      <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid var(--hair)' }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>— This Year's Royalty Summary —</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ padding: 24, border: '1px solid var(--hair)' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.25em', color: 'var(--dim)', marginBottom: 12 }}>EARNED YTD</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontVariationSettings: "'opsz' 36" }}>Rs. 47,200</div>
          </div>
          <div style={{ padding: 24, border: '1px solid var(--hair)' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.25em', color: 'var(--dim)', marginBottom: 12 }}>PAID OUT</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontVariationSettings: "'opsz' 36" }}>Rs. 28,400</div>
          </div>
          <div style={{ padding: 24, border: '1px solid var(--accent)', background: 'rgba(139,105,20,.05)' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.25em', color: 'var(--accent)', marginBottom: 12 }}>PENDING</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontVariationSettings: "'opsz' 36", color: 'var(--accent)' }}>Rs. 18,800</div>
          </div>
        </div>
      </div>

      {(editing || creatingType) && (
        <AccountModal
          existing={editing} type={editing?.type || creatingType!}
          onClose={() => { setEditing(null); setCreatingType(null) }}
          onSave={data => {
            if (editing) setAccounts(prev => prev.map(a => a.id === editing.id ? { ...a, ...data } : a))
            else setAccounts(prev => [...prev, { id: String(Date.now()), type: creatingType!, ...data, isDefault: data.isDefault ?? prev.length === 0 }])
            setEditing(null); setCreatingType(null)
          }}
        />
      )}
    </div>
  )
}

function AccountModal({ existing, type, onClose, onSave }: { existing: PayoutAccount | null; type: AccountType; onClose: () => void; onSave: (data: Omit<PayoutAccount, 'id' | 'type'>) => void }) {
  const meta = typeMeta[type]
  const [form, setForm] = useState({
    accountTitle: existing?.accountTitle || '',
    accountNumber: existing?.accountNumber || '',
    bankName: existing?.bankName || '',
    isDefault: existing?.isDefault ?? false,
  })

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="eyebrow" style={{ marginBottom: 12 }}>{existing ? '— Edit —' : '— Add Payout —'}</div>
        <div className="modal-title">{meta.label}</div>
        <div className="modal-subtitle">We'll send your royalty payments here</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="field"><label>Account Title <span className="req">*</span></label><input value={form.accountTitle} onChange={e => setForm({...form, accountTitle: e.target.value})} placeholder="Name on the account" /></div>
          {meta.needsBank && <div className="field"><label>Bank Name <span className="req">*</span></label><input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} placeholder="e.g. HBL, Meezan, UBL" /></div>}
          <div className="field"><label>{meta.numberLabel} <span className="req">*</span></label><input value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} /></div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="btn btn-outline btn-full" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" onClick={() => onSave(form)}>{existing ? 'Save' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
