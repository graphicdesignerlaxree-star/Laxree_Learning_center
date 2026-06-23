import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'SUPER_ADMIN' | 'EMPLOYEE'
export type Company = 'AMENITIES' | 'ROOFING'

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: Role
  company: Company
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
  // The segment the user selected on the login screen (persists across reloads)
  selectedCompany: Company | null
  login: (user: AuthUser) => void
  logout: () => void
  updateUser: (updates: Partial<AuthUser>) => void
  setCurrentView: (view: string) => void
  setSelectedCompany: (company: Company | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentView: 'dashboard',
      selectedCompany: null,
      login: (user: AuthUser) => set({ user, isAuthenticated: true, currentView: 'dashboard', selectedCompany: user.company }),
      logout: () => set({ user: null, isAuthenticated: false, currentView: 'dashboard', selectedCompany: null }),
      updateUser: (updates: Partial<AuthUser>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setCurrentView: (currentView: string) => set({ currentView }),
      setSelectedCompany: (selectedCompany: Company | null) => set({ selectedCompany }),
    }),
    {
      name: 'laxree-auth-storage',
    }
  )
)
