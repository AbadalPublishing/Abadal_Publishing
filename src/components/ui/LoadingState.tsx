export function PageLoading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--dim)' }}>
        Loading…
      </div>
    </div>
  )
}

export function PageError({ message = 'Unable to reach the server. Please try again.' }: { message?: string }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 16, textAlign: 'center', padding: '120px 24px' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontVariationSettings: "'opsz' 36" }}>
        Unable to <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>load.</em>
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--dim)', maxWidth: 400 }}>
        {message}
      </div>
      <button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>Retry</button>
    </div>
  )
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontVariationSettings: "'opsz' 36", marginBottom: 12 }}>{title}</div>
      {message && <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--dim)', fontSize: 16 }}>{message}</p>}
    </div>
  )
}
