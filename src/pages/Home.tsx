import { Link, useNavigate } from 'react-router-dom'
import ScrollReveal from '../components/ui/ScrollReveal'
import { useProducts, useFeaturedProduct, useAuthors } from '../hooks/useProducts'
import { PageLoading } from '../components/ui/LoadingState'
import { ShoppingBag, ExternalLink } from 'lucide-react'
import { trackEvent } from '../hooks/useAnalytics'

const services = [
  { n: 'I.', title: 'Scholarship &', em: 'Historical Inquiry' },
  { n: 'II.', title: 'Literary', em: 'Non‑Fiction & Memoir' },
  { n: 'III.', title: 'Translation from', em: 'the Pashto & Persianate Worlds' },
]

export default function Home() {
  const navigate = useNavigate()
  const { data: featured, isLoading: featuredLoading } = useFeaturedProduct()
  const { data: products } = useProducts({ limit: 3, sort: 'newest' })
  const { data: authors } = useAuthors()

  const newReleases = Array.isArray(products) ? products : (products?.data || [])
  const authorList = Array.isArray(authors) ? authors : []

  return (
    <>
      {/* HERO */}
      <header className="hero" id="house">
        <div className="hero-bg" />
        <div className="hero-bg-image" style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }} />
        <div className="hero-veil" />
        <div className="hero-wordmark">ABADAL</div>
        <div className="hero-sub">Publishing</div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-track" />
        </div>
      </header>

      {/* MANIFESTO */}
      <ScrollReveal>
        <section className="section" style={{ textAlign: 'center' }}>
          <div className="container-sm">
            <p style={{ fontFamily: 'var(--sf)', fontWeight: 300, fontSize: 'clamp(22px,2.8vw,38px)', lineHeight: 1.45, letterSpacing: '-.015em', marginBottom: 44 }}>
              &ldquo;Some books inform. Others rearrange what the reader thought they knew. We publish only the second kind — works of correction, of consequence, of long quiet authority.&rdquo;
            </p>
            <div className="eyebrow">From the Editorial Charter &middot; MMXXVI</div>
          </div>
        </section>
      </ScrollReveal>

      {/* HERITAGE STRIP */}
      <ScrollReveal>
        <div className="strip">
          <div className="strip-img" style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }} />
          <div className="strip-fade" />
          <div className="strip-content">
            <div className="eyebrow" style={{ marginBottom: 28 }}>— A House from the Frontier —</div>
            <h2 className="section-title">
              An independent press, <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>rooted in Pakhtunkhwa.</em>
            </h2>
          </div>
        </div>
      </ScrollReveal>

      {/* SERVICES */}
      <ScrollReveal>
        <section className="section" id="services">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div className="eyebrow" style={{ marginBottom: 28 }}>— The Imprint —</div>
              <h2 className="section-title">Three lines of <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>publication.</em></h2>
            </div>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              {services.map((s, i) => (
                <Link key={i} to="/catalogue" style={{ display: 'grid', gridTemplateColumns: '64px 1fr 36px', gap: 48, alignItems: 'baseline', padding: '44px 0', borderBottom: '1px solid var(--hair)', borderTop: i === 0 ? '1px solid var(--hair)' : undefined, textDecoration: 'none', color: 'var(--bone)', transition: 'padding .5s cubic-bezier(.16,1,.3,1)' }}>
                  <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 14, color: 'var(--silver)', fontVariationSettings: "'opsz' 36" }}>{s.n}</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 'clamp(24px,3vw,44px)', lineHeight: 1.1, letterSpacing: '-.015em', fontVariationSettings: "'opsz' 72" }}>
                    {s.title} <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>{s.em}</em>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 30, fontStyle: 'italic', color: 'var(--dim)' }}>→</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* FEATURED BOOK */}
      {featured && (
        <ScrollReveal>
          <section className="featured-section" id="catalogue" style={{ ['--featured-bg' as any]: 'url(/assets/hero-bg.jpg)' }}>
            <div className="featured-inner">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  className="featured-book-img"
                  src={featured.coverImage}
                  alt={featured.title}
                  onClick={() => navigate(`/books/${featured.slug}`)}
                />
              </div>
              <div>
                <div className="featured-label">Volume I &nbsp;·&nbsp; Now in Print</div>
                <h2 className="featured-title">
                  {featured.title.includes(':')
                    ? <>{featured.title.split(':')[0]}: <em>{featured.title.split(':')[1]}</em></>
                    : featured.title}
                </h2>
                <div className="featured-author">By {featured.author?.penName || featured.author?.firstName}</div>
                <p className="featured-desc">{featured.description}</p>
                <div className="btn-group">
                  {featured.amazonUrl && (
                    <a href={featured.amazonUrl} target="_blank" rel="noopener" className="btn btn-primary"
                      onClick={() => trackEvent({ eventType: 'AMAZON_CLICK', productId: featured.id })}>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.15 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><ExternalLink size={14} /> BUY ON AMAZON</span>
                        <em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, opacity: .65, letterSpacing: 0, textTransform: 'none', marginTop: 2 }}>International</em>
                      </span>
                    </a>
                  )}
                  <a href={`https://wa.me/923039555966?text=${encodeURIComponent(`Hi, I want to order: ${featured.title}`)}`}
                    target="_blank" rel="noopener" className="btn btn-outline"
                    onClick={() => trackEvent({ eventType: 'WHATSAPP_CLICK', productId: featured.id })}>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.15 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><ShoppingBag size={14} /> ORDER VIA WHATSAPP</span>
                      <em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, opacity: .65, letterSpacing: 0, textTransform: 'none', marginTop: 2 }}>Pakistan</em>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* PULL QUOTE */}
      {featured?.pullQuote && (
        <ScrollReveal>
          <section className="quote-section">
            <blockquote>{featured.pullQuote}</blockquote>
            <div className="quote-sig">
              <div className="name">{featured.author?.penName}</div>
              <div className="role">From the Author&rsquo;s Preface &middot; MMXXVI</div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* NEW RELEASES */}
      {newReleases.length > 0 && (
        <ScrollReveal>
          <section className="section" id="new-releases">
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 16 }}>— The Catalogue —</div>
                  <h2 className="section-title">New <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>Releases.</em></h2>
                </div>
                <Link to="/catalogue" className="btn btn-outline btn-sm">View All →</Link>
              </div>
              <div className="books-grid">
                {newReleases.slice(0, 3).map((book: any, i: number) => (
                  <ScrollReveal key={book.id} delay={i as 0|1|2|3|4}>
                    <Link to={`/books/${book.slug}`} className="book-card" onClick={() => trackEvent({ eventType: 'BOOK_CLICK', productId: book.id })}>
                      {book.coverImage
                        ? <img className="book-card-cover" src={book.coverImage} alt={book.title} />
                        : <div className="book-card-cover-placeholder" />}
                      <div className="book-card-meta">
                        <div className="book-card-type">{book.type} · {book.category?.name || ''}</div>
                        <div className="book-card-title">{book.title}</div>
                        <div className="book-card-author">By {book.author?.penName}</div>
                        <div className="book-card-price">
                          From Rs. {Math.min(...(book.variants?.filter((v: any) => !v.amazonOnly && v.retailPrice > 0).map((v: any) => Number(v.retailPrice)) || [0])).toLocaleString()}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* AUTHOR SPOTLIGHT */}
      {authorList.length > 0 && (
        <ScrollReveal>
          <section className="section" style={{ borderTop: '1px solid var(--hair)' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div className="eyebrow" style={{ marginBottom: 20 }}>— The Authors —</div>
                <h2 className="section-title">Voices of <em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>consequence.</em></h2>
              </div>
              <div className="authors-grid">
                {authorList.slice(0, 3).map((author: any, i: number) => (
                  <ScrollReveal key={author.id} delay={i as 0|1|2}>
                    <Link to={`/authors/${author.slug}`} className="author-card">
                      {author.photo
                        ? <img className="author-avatar" src={author.photo} alt={author.penName} onError={e => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextSibling as HTMLElement).style.display = 'flex' }} />
                        : null}
                      <div className="author-avatar-placeholder" style={{ display: author.photo ? 'none' : 'flex' }}>{author.penName?.[0]}</div>
                      <div className="author-name">{author.penName}</div>
                      <div className="author-bio-short">{author.bio}</div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* SUBMISSIONS CTA */}
      <ScrollReveal>
        <section className="section" id="submit" style={{ textAlign: 'center', borderTop: '1px solid var(--hair)' }}>
          <div className="container-sm">
            <div className="eyebrow" style={{ marginBottom: 36 }}>— Submissions Open —</div>
            <h2 className="section-title" style={{ marginBottom: 48 }}>
              If you are writing<br /><em style={{ fontStyle: 'italic', color: 'var(--silver)' }}>a book that matters,</em><br />we should like to read it.
            </h2>
            <Link to="/submissions" className="btn btn-outline btn-lg" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', textTransform: 'none', letterSpacing: '0.02em', fontSize: 20 }}>
              Submit a manuscript &nbsp;→
            </Link>
          </div>
        </section>
      </ScrollReveal>

      <div className="wordmark-end">ABADAL</div>
    </>
  )
}
