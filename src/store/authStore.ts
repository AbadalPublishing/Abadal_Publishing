import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'SUPER_ADMIN' | 'AUTHOR' | 'CUSTOMER'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  city?: string
  author?: { id: string; slug: string; penName: string } | null
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoggedIn: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setAuth: (user, token) => {
        localStorage.setItem('abadal_token', token)
        set({ user, token, isLoggedIn: true })
      },
      logout: () => {
        localStorage.removeItem('abadal_token')
        localStorage.removeItem('abadal_user')
        set({ user: null, token: null, isLoggedIn: false })
      },
      updateUser: (u) => {
        const cur = get().user
        if (cur) set({ user: { ...cur, ...u } })
      },
    }),
    { name: 'abadal_user' }
  )
)

export const useIsAdmin = () => useAuthStore(s => s.user?.role === 'SUPER_ADMIN')
export const useIsAuthor = () => useAuthStore(s => s.user?.role === 'AUTHOR')
