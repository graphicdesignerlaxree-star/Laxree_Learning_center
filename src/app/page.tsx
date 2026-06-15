'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { LoginPage } from '@/components/login/login-page'
import { AppShell } from '@/components/shared/app-shell'
import { FirstLoginFlow } from '@/components/employee/first-login'

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  // One-time seed check - only runs once per browser, never re-runs after initial setup
  // This prevents deleted users from being re-created on page refresh
  useEffect(() => {
    const hasSeeded = localStorage.getItem('laxree-seeded')
    if (!hasSeeded) {
      fetch('/api/seed', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.message?.includes('already seeded') || data.userCount) {
            localStorage.setItem('laxree-seeded', 'true')
          } else if (data.users) {
            localStorage.setItem('laxree-seeded', 'true')
          }
        })
        .catch(() => {})
    }
  }, [])

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
