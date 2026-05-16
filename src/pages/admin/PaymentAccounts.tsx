import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentAccountsApi } from '../../services/api'
import { Plus, Edit2, Trash2, Star, Eye, EyeOff } from 'lucide-react'
import { PageLoading } from '../../components/ui/LoadingState'
import toast from 'react-hot-toast'

type AccountType = 'BANK' | 'JAZZCASH' | 'EASYPAISA' | 'NAYAPAY' | 'SADAPAY'

const typeMeta: Record<AccountType, { label: string; subtitle: string; numberLabel: string; needsBank: boolean }> = {
  BANK: { label: 'Bank Account', subtitle: 'For wire / bank transfers', numberLabel: 'IBAN / Account Number', needsBank: true },
  JAZZCASH: { label: 'JazzCash', subtitle: 'Mobile wallet', numberLabel: 'Mobile Number', needsBank: false },
  EASYPAISA: { label: 'EasyPaisa', subtitle: 'Mobile wallet', numberLabel: 'Mobile Number', needsBank: false },
  NAYAPAY: { label: 'NayaPay', subtitle: 'Fintech wallet', numberLabel: 'NayaPay ID / Phone', needsBank: false },
  SADAPAY: { label: 'SadaPay', subtitle: 'Fintech wallet', numberLabel: 'SadaPay Number', needsBank: false },
}
const allTypes: AccountType[] = ['BANK', 'JAZZCASH', 'EASYPAISA', 'NAYAPAY', 'SADAPAY']

export default function AdminPaymentAccounts() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['payment-accounts'], queryFn: () => paymentAccountsApi.list() })
  const [editing, setEditing] = useState<any | null>(null)
  const [creatingType, setCreatingType] = useState<AccountType | null>(null)

  const save = useMutation({
    mutationFn: ({ id, data }: any) => id ? paymentAccountsApi.update(id, data) : paymentAccountsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-accounts'] }); toast.success('Saved') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed'),
  })
  const remove = useMutation({
    mutationFn: (id: string) => paymentAccountsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-accounts'] }); toast.success('Removed') },
  })
  const setDefault = useMutation({
    mutationFn: (id: string) => paymentAccountsApi.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-accounts'] }),
  })
  const toggleCustomer = useMutation({
    mutationFn: ({ id, isCustomerFacing }: any) => paymentAccountsApi.update(id, { isCustomerFacing }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-accounts'] }),
  })

  if (isLoading) return <PageLoading />
  const accounts = Array.isArray(data) ? data : []
  const existingTypes = new Set(accounts.map((a: any) => a.type))
  const availableTypes = allTypes.filter(t => !existingTypes.has(t))

  return (
    <div>
      <div className="admin-page-title">Payment Accounts</div>
      <div className="admin-page-subtitle">Where customers send payments & internal collection records</div>

      <div style={{ padding: '20px 24px', border: '1px solid var(--hair)', background: 'rgba(244,242,237,.015)', marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--silver)', lineHeight: 1.6 }}>
          One account per payment type. Toggle "Customer-Facing" to show that account in the checkout for bank-transfer payments. Mark one as Default.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        {accounts.map((acc: any) => (
          <div key={acc.id} style={{ border: `1px solid ${acc.isDefault ? 'var(--bone)' : 'var(--hair)'}`, padding: 28, position: 'relative' }}>
            {acc.isDefault && (
              <div style={{ position: 'absolute', top: -1, right: -1, padding: '4px 12px', background: 'var(--bone)', color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={10} fill="var(--ink)" /> Default
              </div>
            )}
            <div style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>{typeMeta[acc.type as AccountType]?.label}</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontVariationSettings: "'opsz' 36", marginBottom: 4 }}>{acc.accountTitle}</div>
            {acc.bankName && <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--silver)', marginBottom: 10 }}>{acc.bankName}</div>}
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--silver)', letterSpacing: '.05em', marginBottom: 16 }}>{acc.accountNumber}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--hair)' }}>
              <button onClick={() => toggleCustomer.mutate({ id: acc.id, isCustomerFacing: !acc.isCustomerFacing })}
                className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', color: acc.isCustomerFacing ? '#6b9e6b' : 'var(--dim)', letterSpacing: '.15em', fontSize: 9 }}>
                {acc.isCustomerFacing ? <><Eye size={11} /> Customer-Facing</> : <><EyeOff size={11} /> Internal Only</>}
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                {!acc.isDefault && <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => setDefault.mutate(acc.id)}><Star size={11} /></button>}
                <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => setEditing(acc)}><Edit2 size={11} /></button>
                <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px', color: '#c75353' }} onClick={() => confirm('Remove this account?') && remove.mutate(acc.id)}><Trash2 size={11} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {availableTypes.length > 0 && (
        <>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--silver)', marginBottom: 20 }}>— Add New Account —</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {availableTypes.map(type => (
              <button key={type} onClick={() => setCreatingType(type)} style={{ background: 'transparent', border: '1px dashed var(--hair-md)', padding: '24px 16px', cursor: 'pointer', color: 'var(--silver)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Plus size={16} />
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase' }}>{typeMeta[type].label}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {(editing || creatingType) && (
        <Modal existing={editing} type={editing?.type || creatingType!}
          onClose={() => { setEditing(null); setCreatingType(null) }}
          onSave={(data) => {
            save.mutate({ id: editing?.id, data: { ...data, type: editing?.type || creatingType } })
            setEditing(null); setCreatingType(null)
          }} />
      )}
    </div>
  )
}

function Modal({ existing, type, onClose, onSave }: any) {
  const meta = typeMeta[type as AccountType]
  const [form, setForm] = useState({
    accountTitle: existing?.accountTitle || '',
    accountNumber: existing?.accountNumber || '',
    bankName: existing?.bankName || '',
    isCustomerFacing: existing?.isCustomerFacing ?? true,
    isDefault: existing?.isDefault ?? false,
  })
  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="eyebrow" style={{ marginBottom: 12 }}>{existing ? '— Edit —' : '— New Account —'}</div>
        <div className="modal-title">{meta.label}</div>
        <div className="modal-subtitle">{meta.subtitle}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="field"><label>Account Title <span className="req">*</span></label><input value={form.accountTitle} onChange={e => setForm({...form, accountTitle: e.target.value})} /></div>
          {meta.needsBank && <div className="field"><label>Bank Name <span className="req">*</span></label><input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} /></div>}
          <div className="field"><label>{meta.numberLabel} <span className="req">*</span></label><input value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isCustomerFacing} onChange={e => setForm({...form, isCustomerFacing: e.target.checked})} style={{ width: 16, height: 16, accentColor: 'var(--bone)' }} />
            <span style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>Customer-Facing (shown on checkout)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} style={{ width: 16, height: 16, accentColor: 'var(--bone)' }} />
            <span style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>Set as Default</span>
          </label>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="btn btn-outline btn-full" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" onClick={() => onSave(form)}>{existing ? 'Save' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
