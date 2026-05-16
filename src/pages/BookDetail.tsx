import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProduct, useReviews } from '../hooks/useProducts'
import { PageLoading, PageError } from '../components/ui/LoadingState'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import ScrollReveal from '../components/ui/ScrollReveal'
import { useCartStore } from '../store/cartStore'
import { trackEvent } from '../hooks/useAnalytics'
import WhatsAppModal from '../components/ui/WhatsAppModal'
import toast from 'react-hot-toast'

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function BookDetail() {
  const { slug } = useParams()
  const { data: book, isLoading, isError } = useProduct(slug)
  const { data: reviews = [] } = useReviews(book?.id)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [priceType, setPriceType] = useState<'retail'|'wholesale'|'student'>('retail')
  const addToCart = useCartStore(s => s.add)
  const [wishlisted, setWishlisted] = useState(false)
  const [waModalOpen, setWaModalOpen] = useState(false)

  useEffect(() => {
    if (book?.id) trackEvent({ eventType: 'BOOK_CLICK', productId: book.id })
  }, [book?.id])

  if (isLoading) return <PageLoading />
  if (isError || !book) return <PageError message="Book not found." />

  const variant = book.variants?.[selectedVariant]
  const isAmazonOnly = variant?.amazonOnly
  const priceMap: any = { retail: 'retailPrice', wholesale: 'wholesalePrice', student: 'studentPrice' }
  const price = Number(variant?.[priceMap[priceType]] || 0)
  const relatedBooks = book.related || []

  const handleAddToCart = () => {
    if (!variant || (variant.stock === 0 && !variant.amazonOnly)) return
    addToCart({
      variantId: variant.id,
      quantity: 1,
      priceType: priceType.toUpperCase() as any,
      savedPrice: price,
      product: { id: book.id, title: book.title, slug: book.slug, coverImage: book.coverImage, author: book.author },
      variant: { type: variant.type, stock: variant.stock },
    })
    trackEvent({ eventType: 'ADD_TO_CART', productId: book.id })
    toast.success(`${book.title} (${variant.type}) added to cart`)
  }

  const toggleWishlist = () => setWishlisted(v => !v)

  return (
    <>
      {/* ── HERO ── */}
      <div className="book-hero">
        {/* Left: Cover */}
        <div className="book-hero-cover-col">
          <img className="book-hero-cover-img" src={book.coverImage} alt={book.title} />
        </div>

        {/* Right: Info */}
        <div className="book-hero-info-col">
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 1, background: 'var(--dim)', display: 'inline-block' }} />
            {book.type}&nbsp;&nbsp;·&nbsp;&nbsp;{book.category?.name || 'Literature'}&nbsp;&nbsp;·&nbsp;&nbsp;NOW IN PRINT
          </div>

          <h1 className="book-hero-title">
            {book.title.includes(':')
              ? <>{book.title.split(':')[0]}: <em>{book.title.split(':').slice(1).join(':')}</em></>
              : book.title}
          </h1>

          <div className="book-hero-author">
            By <Link to={`/authors/${book.author?.slug}`} style={{ color: 'var(--silver)', textDecoration: 'none' }}>
              {book.author?.penName}
            </Link>
          </div>

          {book.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= Math.round(book.rating) ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
              <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--dim)', letterSpacing: '.1em' }}>{book.rating} ({book.reviewCount})</span>
            </div>
          )}

          <p className="book-hero-desc">{book.description}</p>

          {/* CTA Buttons */}
          <div className="book-hero-actions">
            {book.amazonUrl && (
              <a
                href={book.amazonUrl}
                target="_blank"
                rel="noopener"
                className="hero-btn-amazon"
                onClick={() => trackEvent({ eventType: 'AMAZON_CLICK', productId: book.id })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShoppingBag size={16} />
                  <span>BUY ON AMAZON</span>
                </div>
                <span className="hero-btn-sub">International</span>
              </a>
            )}

            {book.whatsappEnabled && (
              <button
                className="hero-btn-whatsapp"
                onClick={() => setWaModalOpen(true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <WhatsAppIcon />
                  <span>ORDER VIA WHATSAPP</span>
                </div>
                <span className="hero-btn-sub">Pakistan</span>
              </button>
            )}

            <button className="hero-btn-wish" onClick={toggleWishlist} aria-label="Wishlist">
              <Heart size={18} fill={wishlisted ? 'var(--bone)' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* ── PURCHASE / VARIANTS (for direct store purchases) ── */}
      {book.variants?.some((v: any) => !v.amazonOnly) && (
        <section style={{ borderTop: '1px solid var(--hair)', padding: '64px 52px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="eyebrow" style={{ marginBottom: 32 }}>— Order Direct from Abadal —</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Edition</div>
                <div className="variant-selector" style={{ marginBottom: 28 }}>
                  {book.variants.filter((v: any) => !v.amazonOnly).map((v: any, i: number) => (
                    <button
                      key={v.id}
                      className={`variant-btn ${selectedVariant === i ? 'selected' : ''}`}
                      onClick={() => setSelectedVariant(i)}
                      disabled={v.stock === 0}
                    >
                      {v.type}{v.stock === 0 ? ' — Out of Stock' : ''}
                    </button>
                  ))}
                </div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Price Type</div>
                <div className="price-type-selector" style={{ marginBottom: 24 }}>
                  {(['retail','wholesale','student'] as const).map(pt => (
                    <button key={pt} className={`price-type-btn ${priceType === pt ? 'selected' : ''}`} onClick={() => setPriceType(pt)}>{pt}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="product-info-price" style={{ marginBottom: 20 }}>
                  <div className="price-type">{{ retail: 'Retail Price', wholesale: 'Wholesale', student: 'Student Price' }[priceType]}</div>
                  Rs. {price.toLocaleString()}
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', opacity: variant?.stock === 0 ? .4 : 1, cursor: variant?.stock === 0 ? 'not-allowed' : 'pointer' }}
                  disabled={!variant || variant.stock === 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={16} />
                  {!variant || variant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                {variant?.stock > 0 && variant.stock < 10 && (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: '#c75353', marginTop: 10, letterSpacing: '.1em' }}>
                    Only {variant.stock} left in stock
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── META + EDITORIAL ── */}
      <section style={{ borderTop: '1px solid var(--hair)', padding: '64px 52px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Book Details</div>
            <div className="product-meta-list">
              {book.publisher && <div className="product-meta-item"><span className="product-meta-key">Publisher</span><span className="product-meta-val">{book.publisher}</span></div>}
              {book.publishedDate && <div className="product-meta-item"><span className="product-meta-key">Published</span><span className="product-meta-val">{book.publishedDate}</span></div>}
              {book.pages && <div className="product-meta-item"><span className="product-meta-key">Pages</span><span className="product-meta-val">{book.pages}</span></div>}
              {book.language && <div className="product-meta-item"><span className="product-meta-key">Language</span><span className="product-meta-val">{book.language}</span></div>}
              {variant?.isbn && <div className="product-meta-item"><span className="product-meta-key">ISBN</span><span className="product-meta-val">{variant.isbn}</span></div>}
              {book.category?.name && <div className="product-meta-item"><span className="product-meta-key">Category</span><span className="product-meta-val">{book.category.name}</span></div>}
            </div>
            {book.tags?.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {book.tags.map((tag: string) => (
                    <span key={tag} style={{ fontFamily: 'var(--sans)', fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--dim)', border: '1px solid var(--hair)', padding: '3px 8px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>About this work</div>
            <p className="product-desc" style={{ marginBottom: 32 }}>{book.description}</p>

            {book.editorialNote && (
              <div style={{ borderLeft: '1px solid var(--hair-md)', paddingLeft: 24, marginBottom: 32 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Editorial Note</div>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--silver)', lineHeight: 1.65 }}>{book.editorialNote}</p>
              </div>
            )}

            {book.pullQuote && (
              <div style={{ padding: '36px 0', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)' }}>
                <p style={{ fontFamily: 'var(--sf)', fontWeight: 300, fontSize: 18, lineHeight: 1.55, color: 'var(--bone)', fontStyle: 'italic' }}>
                  {book.pullQuote}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section" style={{ borderTop: '1px solid var(--hair)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>— Reader Reviews —</div>
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 400, fontVariationSettings: "'opsz' 36" }}>
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </h2>
            </div>
          </div>
          {reviews.length === 0
            ? <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--dim)', fontSize: 16 }}>No reviews yet. Be the first.</p>
            : reviews.map((r: any) => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                    </div>
                    <div className="review-title">{r.title}</div>
                  </div>
                  {r.orderId && <span className="verified-badge">Verified Purchase</span>}
                </div>
                <p className="review-body">{r.body}</p>
                <div className="review-meta">{r.user?.firstName} {r.user?.lastName?.[0]}. · {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
        </div>
      </section>

      {/* ── RELATED ── */}
      {relatedBooks.length > 0 && (
        <ScrollReveal>
          <section className="section" style={{ borderTop: '1px solid var(--hair)' }}>
            <div className="container">
              <div className="eyebrow" style={{ marginBottom: 40 }}>— You May Also Like —</div>
              <div className="books-grid">
                {relatedBooks.map((b: any) => (
                  <Link key={b.id} to={`/books/${b.slug}`} className="book-card">
                    {b.coverImage ? <img className="book-card-cover" src={b.coverImage} alt={b.title} /> : <div className="book-card-cover-placeholder" />}
                    <div className="book-card-meta">
                      <div className="book-card-type">{b.type}</div>
                      <div className="book-card-title">{b.title}</div>
                      <div className="book-card-author">By {b.author?.penName}</div>
                      <div className="book-card-price">
                        {b.variants?.some((v: any) => !v.amazonOnly && Number(v.retailPrice) > 0)
                          ? `From Rs. ${Math.min(...b.variants.filter((v: any) => !v.amazonOnly && Number(v.retailPrice) > 0).map((v: any) => Number(v.retailPrice))).toLocaleString()}`
                          : 'Amazon Kindle'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      <div className="wordmark-end">ABADAL</div>

      {waModalOpen && (
        <WhatsAppModal
          book={{ id: book.id, title: book.title, variants: book.variants }}
          onClose={() => setWaModalOpen(false)}
        />
      )}
    </>
  )
}
