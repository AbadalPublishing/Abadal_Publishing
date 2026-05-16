import { useState, useRef } from 'react'
import { Upload, Check, AlertCircle, X } from 'lucide-react'
import { uploadToCloudinary } from '../../services/cloudinary'
import { cldUrl } from '../../services/cloudinary'

interface Props {
  value?: string | null
  onChange: (url: string, publicId: string) => void
  onRemove?: () => void
  folder?: string
  label?: string
  aspectRatio?: string
  maxSizeMB?: number
}

export default function CloudinaryUploader({
  value, onChange, onRemove, folder = 'abadal', label = 'Upload image',
  aspectRatio = '3/4', maxSizeMB = 5,
}: Props) {
  const [state, setState] = useState<'idle'|'uploading'|'error'>('idle')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only images allowed'); setState('error'); return }
    if (file.size > maxSizeMB * 1024 * 1024) { setError(`Max ${maxSizeMB}MB`); setState('error'); return }
    setState('uploading'); setError('')
    try {
      const { url, publicId } = await uploadToCloudinary(file, folder)
      onChange(url, publicId)
      setState('idle')
    } catch (e: any) {
      setError(e.message || 'Upload failed'); setState('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0] || null)
  }

  return (
    <div>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={cldUrl(value, { w: 400 })}
            alt=""
            style={{ width: '100%', maxWidth: 240, aspectRatio, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => inputRef.current?.click()} className="btn btn-outline btn-sm" type="button">Replace</button>
            {onRemove && (
              <button onClick={onRemove} className="btn btn-ghost btn-sm" type="button" style={{ color: '#c75353' }}>
                <X size={11} /> Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: '1px dashed var(--hair-md)',
            padding: 60, textAlign: 'center', cursor: 'pointer',
            transition: 'border-color .3s, background .3s',
            background: state === 'uploading' ? 'rgba(244,242,237,.04)' : 'transparent',
          }}
        >
          {state === 'uploading'
            ? <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--silver)' }}>Uploading…</div>
            : state === 'error'
              ? <div style={{ color: '#c75353', fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <AlertCircle size={13} /> {error}
                </div>
              : <>
                  <Upload size={24} color="var(--dim)" style={{ marginBottom: 12 }} />
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '.15em', color: 'var(--dim)' }}>{label.toUpperCase()}</p>
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginTop: 8 }}>
                    Click or drag · JPG, PNG, WebP · max {maxSizeMB}MB
                  </p>
                </>}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files?.[0] || null)} />
    </div>
  )
}
