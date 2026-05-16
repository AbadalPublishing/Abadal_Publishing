import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '../../services/api'
import { PageLoading, EmptyState } from '../../components/ui/LoadingState'
import { Heart, X } from 'lucide-react'

export default function Wishlist() {
  const qc = useQueryClient()
  const { data: items, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: () => wishlistApi.list() })
  const remove = useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  })

  if (isLoading) return <PageLoading />
  const list = Array.isArray(items) ? items : []

  return (
    <div>
      <div className="account-content-title">Wishlist</div>
      {list.length === 0
        ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Heart size={40} color="var(--dim)" style={{ marginBottom: 16 }} />
            <EmptyState title="Your wishlist is empty." message="Save books to come back to them later." />
          </div>
        )
        : (
          <div className="books-grid">
            {list.map((item: any) => {
              const book = item.product || item
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => remove.mutate(book.id)}
                    style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'rgba(8,8,8,0.7)', border: '1px solid var(--hair-md)', color: 'var(--silver)', padding: 6, cursor: 'pointer' }}
                  ><X size={14} /></button>
                  <Link to={`/books/${book.slug}`} className="book-card">
                    {book.coverImage ? <img className="book-card-cover" src={book.coverImage} alt={book.title} /> : <div className="book-card-cover-placeholder" />}
                    <div className="book-card-meta">
                      <div className="book-card-type">{book.type}</div>
                      <div className="book-card-title">{book.title}</div>
                      <div className="book-card-author">By {book.author?.penName}</div>
                      <div className="book-card-price">From Rs. {Math.min(...(book.variants?.filter((v: any) => !v.amazonOnly && Number(v.retailPrice) > 0).map((v: any) => Number(v.retailPrice)) || [0])).toLocaleString()}</div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
