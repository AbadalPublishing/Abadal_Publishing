import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartApi } from '../services/api'

export interface CartItem {
  id?: string              // server id (when logged in)
  variantId: string
  quantity: number
  priceType: 'RETAIL' | 'WHOLESALE' | 'STUDENT'
  savedPrice: number
  // hydrated fields (for display)
  product?: {
    id: string
    title: string
    slug: string
    coverImage?: string
    author?: { penName: string }
  }
  variant?: {
    type: string
    stock: number
  }
}

interface CartState {
  items: CartItem[]
  isMerging: boolean
  add: (item: CartItem) => Promise<void>
  update: (variantId: string, quantity: number) => Promise<void>
  remove: (variantId: string) => Promise<void>
  clear: () => Promise<void>
  mergeWithServer: () => Promise<void>
  hydrate: () => Promise<void>
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isMerging: false,

      add: async (item) => {
        const isLoggedIn = !!localStorage.getItem('abadal_token')
        const existing = get().items.find(i => i.variantId === item.variantId)
        if (existing) {
          set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i) })
        } else {
          set({ items: [...get().items, item] })
        }
        if (isLoggedIn) {
          try { await cartApi.add(item.variantId, item.quantity, item.priceType) } catch {}
        }
      },

      update: async (variantId, quantity) => {
        if (quantity < 1) return get().remove(variantId)
        set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) })
        const isLoggedIn = !!localStorage.getItem('abadal_token')
        if (isLoggedIn) {
          const item = get().items.find(i => i.variantId === variantId)
          if (item?.id) try { await cartApi.update(item.id, quantity) } catch {}
        }
      },

      remove: async (variantId) => {
        const item = get().items.find(i => i.variantId === variantId)
        set({ items: get().items.filter(i => i.variantId !== variantId) })
        const isLoggedIn = !!localStorage.getItem('abadal_token')
        if (isLoggedIn && item?.id) {
          try { await cartApi.remove(item.id) } catch {}
        }
      },

      clear: async () => {
        set({ items: [] })
        const isLoggedIn = !!localStorage.getItem('abadal_token')
        if (isLoggedIn) try { await cartApi.clear() } catch {}
      },

      mergeWithServer: async () => {
        const localItems = get().items
        set({ isMerging: true })
        try {
          if (localItems.length > 0) {
            await cartApi.merge(localItems.map(i => ({ variantId: i.variantId, quantity: i.quantity, priceType: i.priceType })))
          }
          const serverCart = await cartApi.get()
          set({ items: serverCart, isMerging: false })
        } catch {
          set({ isMerging: false })
        }
      },

      hydrate: async () => {
        const isLoggedIn = !!localStorage.getItem('abadal_token')
        if (!isLoggedIn) return
        try {
          const serverCart = await cartApi.get()
          set({ items: serverCart })
        } catch {}
      },

      subtotal: () => get().items.reduce((s, i) => s + i.savedPrice * i.quantity, 0),
    }),
    { name: 'abadal_cart' }
  )
)
