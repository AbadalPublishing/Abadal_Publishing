import { useParams, Link } from 'react-router-dom'
import { useAuthor } from '../hooks/useProducts'
import { PageLoading, PageError } from '../components/ui/LoadingState'
import { ExternalLink, Twitter, Instagram } from 'lucide-react'
import ScrollReveal from '../components/ui/ScrollReveal'

export default function AuthorProfile() {
  const { slug } = useParams()
  const { data: author, isLoading, isError } = useAuthor(slug)

  if (isLoading) return <PageLoading />
  if (isError || !author) return <PageError message="Author not found." />

  const books = author.products || []
  const socials = author.socialLinks || {}

  return (
    <>
      <div style={{ paddingTop: 80 }}>
        <div className="author-profile-header">
          <div style={{ position: 'relative' }}>
            {author.photo
              ? <img className="author-profile-photo" src={author.photo} alt={author.penName} onError={e => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextSibling as HTMLElement).style.display = 'flex' }} />
              : null}
            <div className="author-profile-photo-placeholder" style={{ display: author.photo ? 'none' : 'flex' }}>{author.penName?.[0]}</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>— Author —</div>
            <h1 className="author-profile-name">{author.penName}</h1>
            <div className="author-profile-penname">{author.nationality} {author.languages?.length > 0 ? '· ' + author.languages.join(', ') : ''}</div>
            <p className="author-profile-bio">{author.bio}</p>
            <div className="author-social-links">
              {author.website && (
                <a href={`https://${author.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener" className="social-link">
                  <ExternalLink size={12} /> {author.website}
                </a>
              )}
              {socials.twitter && (
                <a href={`https://twitter.com/${socials.twitter.replace('@', '')}`} target="_blank" rel="noopener" className="social-link">
                  <Twitter size={12} /> {socials.twitter}
                </a>
              )}
              {socials.instagram && (
                <a href={`https://instagram.com/${socials.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="social-link">
                  <Instagram size={12} /> {socials.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 40 }}>— Published Works — {books.length} {books.length === 1 ? 'title' : 'titles'}</div>
          {books.length === 0
            ? <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--dim)', fontSize: 18 }}>No published works yet.</p>
            : (
              <div className="books-grid">
                {books.map((book: any, i: number) => (
                  <ScrollReveal key={book.id} delay={i as 0|1|2|3|4}>
                    <Link to={`/books/${book.slug}`} className="book-card">
                      {book.coverImage ? <img className="book-card-cover" src={book.coverImage} alt={book.title} /> : <div className="book-card-cover-placeholder" />}
                      <div className="book-card-meta">
                        <div className="book-card-type">{book.type}</div>
                        <div className="book-card-title">{book.title}</div>
                        <div className="book-card-price">From Rs. {Math.min(...(book.variants?.filter((v: any) => !v.amazonOnly && Number(v.retailPrice) > 0).map((v: any) => Number(v.retailPrice)) || [0])).toLocaleString()}</div>
                      </div>
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
