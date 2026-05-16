import { Link } from 'react-router-dom'
import { useAuthors } from '../hooks/useProducts'
import { PageLoading, PageError, EmptyState } from '../components/ui/LoadingState'
import ScrollReveal from '../components/ui/ScrollReveal'

export default function Authors() {
  const { data: authors, isLoading, isError } = useAuthors()
  if (isLoading) return <PageLoading />
  if (isError) return <PageError />
  const list = Array.isArray(authors) ? authors : []

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="page-header-eyebrow eyebrow">— The Authors —</div>
          <h1 className="page-header-title">Voices of <em>Consequence.</em></h1>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {list.length === 0
            ? <EmptyState title="No authors yet." message="Check back soon." />
            : (
              <div className="authors-grid">
                {list.map((author: any, i: number) => (
                  <ScrollReveal key={author.id} delay={i as 0|1|2}>
                    <Link to={`/authors/${author.slug}`} className="author-card">
                      {author.photo
                        ? <img className="author-avatar" src={author.photo} alt={author.penName} onError={e => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextSibling as HTMLElement).style.display = 'flex' }} />
                        : null}
                      <div className="author-avatar-placeholder" style={{ display: author.photo ? 'none' : 'flex' }}>{author.penName?.[0]}</div>
                      <div className="author-name">{author.penName}</div>
                      <div className="author-pen-name">{author.nationality}</div>
                      <p className="author-bio-short">{author.bio}</p>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
        </div>
      </section>
      <div className="wordmark-end">ABADAL</div>
    </>
  )
}
