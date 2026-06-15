'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { LoginPage } from '@/components/login/login-page'
import { AppShell } from '@/components/shared/app-shell'
import { FirstLoginFlow } from '@/components/employee/first-login'

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  // One-time seed check in background - only seeds if DB is empty
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {})
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
