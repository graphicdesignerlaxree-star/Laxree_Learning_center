import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'SUPER_ADMIN' | 'EMPLOYEE'

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: Role
  profilePhoto: string | null
  isFirstLogin: boolean
  department: string | null
  designation: string | null
  employeeId: string | null
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  currentView: string
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (updates: Partial<AuthUser>) => void
  setCurrentView: (view: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentView: 'dashboard',
      login: (user: AuthUser) => set({ user, isAuthenticated: true, currentView: 'dashboard' }),
      logout: () => set({ user: null, isAuthenticated: false, currentView: 'dashboard' }),
      updateUser: (updates: Partial<AuthUser>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setCurrentView: (currentView: string) => set({ currentView }),
    }),
    {
      name: 'laxree-auth-storage',
    }
  )
)
