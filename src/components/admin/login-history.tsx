'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  History, Search, Users, UserCheck, Calendar, TrendingUp, Clock,
  Globe, Monitor, ChevronLeft, ChevronRight,
} from 'lucide-react'

interface LoginLog {
  id: string
  userId: string
  ipAddress: string | null
  userAgent: string | null
  loginAt: string
  user: {
    id: string
    fullName: string | null
    email: string
    employeeId: string | null
    role: string
    department: { name: string } | null
    profilePhoto: string | null
  } | null
}

interface Summary {
  todayLogins: number
  weekLogins: number
  uniqueUsersToday: number
  uniqueUsersWeek: number
  total: number
}

const PAGE_SIZE = 15

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function parseDevice(ua: string | null): { icon: any; label: string } {
  if (!ua) return { icon: Globe, label: 'Unknown' }
  const lower = ua.toLowerCase()
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
    return { icon: Monitor, label: 'Mobile' }
  }
  if (lower.includes('windows')) return { icon: Monitor, label: 'Windows' }
  if (lower.includes('mac')) return { icon: Monitor, label: 'macOS' }
  if (lower.includes('linux')) return { icon: Monitor, label: 'Linux' }
  return { icon: Globe, label: 'Desktop' }
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-emerald-100 text-emerald-700',
  EMPLOYEE: 'bg-gray-100 text-gray-700',
}

export function LoginHistoryView() {
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [, startTransition] = useTransition()

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('_t', String(Date.now()))
    try {
      const res = await fetch(`/api/admin/login-history?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.logs) {
        startTransition(() => {
          setLogs(data.logs)
          setSummary(data.summary)
          setLoading(false)
        })
      }
    } catch { /* ignore */ }
  }, [search, startTransition])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(logs.length / PAGE_SIZE)
  const paginatedLogs = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <History className="w-5 h-5 text-white" />
            </div>
            Login History
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Track every employee login — who logged in, when, and from which device</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Logins Today', value: summary?.todayLogins ?? 0, icon: Clock, color: 'emerald', sub: 'Last 24 hours' },
          { label: 'Unique Users Today', value: summary?.uniqueUsersToday ?? 0, icon: UserCheck, color: 'teal', sub: 'Distinct employees' },
          { label: 'Logins This Week', value: summary?.weekLogins ?? 0, icon: Calendar, color: 'cyan', sub: 'Last 7 days' },
          { label: 'Unique Users Week', value: summary?.uniqueUsersWeek ?? 0, icon: Users, color: 'amber', sub: 'Active this week' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Login Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Recent Logins
            <Badge variant="secondary" className="ml-auto">{logs.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No login records found</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role / Dept</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Login Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => {
                      const device = parseDevice(log.userAgent)
                      const initials = (log.user?.fullName || log.user?.email || '?')[0].toUpperCase()
                      return (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {log.user?.fullName || 'Deleted User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{log.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={`w-fit ${ROLE_COLORS[log.user?.role || 'EMPLOYEE'] || 'bg-gray-100 text-gray-700'}`} variant="secondary">
                                {(log.user?.role || 'EMPLOYEE').replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-gray-500">{log.user?.department?.name || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <device.icon className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-600">{device.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500 font-mono">{log.ipAddress || '—'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-900">{timeAgo(log.loginAt)}</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(log.loginAt).toLocaleString('en-IN', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, logs.length)} of {logs.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 rounded-lg border disabled:opacity-30 hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-600">Page {page + 1} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-lg border disabled:opacity-30 hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
