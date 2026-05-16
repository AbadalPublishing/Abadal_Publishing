import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, authorsApi, categoriesApi, reviewsApi } from '../services/api'

export function useProducts(params?: any) {
  return useQuery({ queryKey: ['products', params], queryFn: () => productsApi.list(params) })
}
export function useFeaturedProduct() {
  return useQuery({ queryKey: ['product', 'featured'], queryFn: () => productsApi.featured() })
}
export function useProduct(slug?: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.bySlug(slug!),
    enabled: !!slug,
  })
}
export function useAuthors() {
  return useQuery({ queryKey: ['authors'], queryFn: () => authorsApi.list() })
}
export function useAuthor(slug?: string) {
  return useQuery({
    queryKey: ['author', slug],
    queryFn: () => authorsApi.bySlug(slug!),
    enabled: !!slug,
  })
}
export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() })
}
export function useReviews(productId?: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.list(productId!),
    enabled: !!productId,
  })
}

// Mutations
export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
