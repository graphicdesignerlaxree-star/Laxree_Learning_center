'use client'

import { useAuthStore } from '@/stores/auth-store'
import { LoginPage } from '@/components/login/login-page'
import { AppShell } from '@/components/shared/app-shell'
import { FirstLoginFlow } from '@/components/employee/first-login'

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  // REMOVED: Auto-seed on page load was causing deleted users to reappear.
  // Seeding should only be done explicitly via /api/reseed (admin-only).
  // The previous implementation relied on localStorage which could be cleared
  // (new browser, incognito, clear data), triggering /api/seed on every visit
  // and potentially recreating deleted users.

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Employee first login - show onboarding
  if (user?.isFirstLogin && user?.role === 'EMPLOYEE') {
    return <FirstLoginFlow />
  }

  // Authenticated - show app shell
  return <AppShell />
}
