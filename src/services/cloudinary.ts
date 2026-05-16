import { api } from './api'

/**
 * Direct-to-Cloudinary signed upload.
 * The file never touches our backend — saves Railway bandwidth.
 *
 * Flow:
 *   1. Backend signs an upload manifest (timestamp + folder + sha1)
 *   2. Browser posts the file directly to https://api.cloudinary.com/...
 *   3. Cloudinary returns the secure URL we store in our DB
 */
export async function uploadToCloudinary(file: File, folder = 'abadal'): Promise<{ url: string; publicId: string }> {
  // 1. Get a signature
  const sig = await api.get('/media/upload-signature', { params: { folder } }).then(r => r.data)

  // 2. POST file directly to Cloudinary
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', String(sig.timestamp))
  form.append('folder', sig.folder)
  form.append('signature', sig.signature)

  const res = await fetch(sig.uploadUrl, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Cloudinary upload failed')
  const json = await res.json()
  return { url: json.secure_url, publicId: json.public_id }
}

/**
 * Transform a Cloudinary URL with optimization params.
 *
 * cldUrl(url, { w: 400, h: 600 })
 *   → "...res.cloudinary.com/.../upload/f_auto,q_auto,w_400,h_600,c_fill/..."
 *
 * f_auto  — best format per browser (AVIF/WebP/JPEG)
 * q_auto  — automatic quality
 * c_fill  — crop to exact dimensions
 *
 * If the URL is not a Cloudinary URL (e.g. local /assets/), returns as-is.
 */
export interface CldOpts {
  w?: number
  h?: number
  q?: 'auto' | number
  blur?: number
  crop?: 'fill' | 'fit' | 'limit'
}
export function cldUrl(src: string | null | undefined, opts: CldOpts = {}): string {
  if (!src) return ''
  if (!src.includes('res.cloudinary.com')) return src

  const params: string[] = ['f_auto', `q_${opts.q ?? 'auto'}`]
  if (opts.w) params.push(`w_${opts.w}`)
  if (opts.h) params.push(`h_${opts.h}`)
  if (opts.w || opts.h) params.push(`c_${opts.crop ?? 'fill'}`)
  if (opts.blur) params.push(`e_blur:${opts.blur}`)

  // Inject after /upload/
  return src.replace('/upload/', `/upload/${params.join(',')}/`)
}

/**
 * Build a srcSet for responsive <img> tags.
 *   srcSet={cldSrcSet(url, [400, 800, 1200])}
 */
export function cldSrcSet(src: string | null | undefined, widths: number[]): string {
  if (!src) return ''
  return widths.map(w => `${cldUrl(src, { w })} ${w}w`).join(', ')
}
