import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useProducts'
import { PageLoading, PageError, EmptyState } from '../components/ui/LoadingState'
import { trackEvent } from '../hooks/useAnalytics'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'bestSelling', label: 'Best Selling' },
  { value: 'priceLow', label: 'Price: Low–High' },
  { value: 'mostReviewed', label: 'Most Reviewed' },
]

export default function Catalogue() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')

  const { data: categories } = useCategories()
  const { data: products, isLoading, isError } = useProducts({
    sort,
    search: search || undefined,
    category: activeCategory !== 'all' ? activeCategory : undefined,
  })

  if (isLoading) return <PageLoading />
  if (isError) return <PageError />

  const list = Array.isArray(products) ? products : (products?.data || [])
  const cats = Array.isArray(categories) ? categories : []

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="page-header-eyebrow eyebrow">— The Catalogue —</div>
          <h1 className="page-header-title">All <em>Works.</em></h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <div className="search-bar">
              <Search size={14} color="var(--dim)" />
              <input placeholder="Search by title or author…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
            {cats.map((c: any) => (
              <button key={c.id} className={`filter-btn ${activeCategory === c.slug ? 'active' : ''}`} onClick={() => setActiveCategory(c.slug)}>{c.name}</button>
            ))}
            <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 40 }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '.15em', color: 'var(--dim)' }}>
              {list.length} {list.length === 1 ? 'work' : 'works'}
            </span>
          </div>

          {list.length === 0 ? (
            <EmptyState title="No works yet." message="Check back soon — new titles are added regularly." />
          ) : (
            <div className="books-grid">
              {list.map((book: any) => {
                const physicalVariants = (book.variants || []).filter((v: any) => !v.amazonOnly && Number(v.retailPrice) > 0)
                const minPrice = physicalVariants.length > 0 ? Math.min(...physicalVariants.map((v: any) => Number(v.retailPrice))) : null
                const isOutOfStock = physicalVariants.length > 0 && physicalVariants.every((v: any) => v.stock === 0)
                return (
                  <Link key={book.id} to={`/books/${book.slug}`} className="book-card" onClick={() => trackEvent({ eventType: 'BOOK_CLICK', productId: book.id })}>
                    {isOutOfStock && <span className="out-of-stock-badge">Out of Stock</span>}
                    {book.coverImage
                      ? <img className="book-card-cover" src={book.coverImage} alt={book.title} />
                      : <div className="book-card-cover-placeholder"><span style={{ fontFamily: 'var(--display)', color: 'var(--dim)', fontSize: 48 }}>A</span></div>}
                    <div className="book-card-meta">
                      <div className="book-card-type">{book.type} · {book.category?.name || ''}</div>
                      <div className="book-card-title">{book.title}</div>
                      <div className="book-card-author">By {book.author?.penName}</div>
                      <div className="book-card-price">
                        {minPrice === null
                          ? <span style={{ color: 'var(--accent)' }}>Amazon Kindle</span>
                          : <>From Rs. {minPrice.toLocaleString()}{physicalVariants.length > 1 && <span style={{ color: 'var(--dim)', fontSize: 11 }}> · Multiple editions</span>}</>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <div className="wordmark-end">ABADAL</div>
    </>
  )
}
