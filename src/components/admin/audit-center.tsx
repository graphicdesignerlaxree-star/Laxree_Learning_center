'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  ShieldCheck, Search, User, ClipboardCheck, Award, Settings, FileText,
  BookOpen, TrendingUp, Clock, AlertCircle, CheckCircle2, XCircle,
  Eye,
} from 'lucide-react'

interface AuditLog {
  id: string
  userId: string
  action: string
  targetType: string | null
  targetId: string | null
  details: string | null
  createdAt: string
  user: { fullName: string | null; email: string; role: string } | null
}

const ACTION_COLORS: Record<string, string> = {
  CREATE_USER: 'bg-emerald-100 text-emerald-700',
  UPDATE_USER: 'bg-teal-100 text-teal-700',
  DELETE_USER: 'bg-red-100 text-red-700',
  LOGIN: 'bg-blue-100 text-blue-700',
  ASSESSMENT_TAKEN: 'bg-amber-100 text-amber-700',
  CERTIFICATION_APPROVE: 'bg-emerald-100 text-emerald-700',
  CERTIFICATION_REJECT: 'bg-red-100 text-red-700',
  UPDATE_SETTING: 'bg-gray-100 text-gray-700',
  APPROVAL_APPROVE: 'bg-emerald-100 text-emerald-700',
  APPROVAL_REJECT: 'bg-red-100 text-red-700',
  COURSE_UPDATE: 'bg-teal-100 text-teal-700',
  DOCUMENT_UPLOAD: 'bg-purple-100 text-purple-700',
  SCORE_CHANGE: 'bg-amber-100 text-amber-700',
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  CREATE_USER: User,
  UPDATE_USER: Settings,
  DELETE_USER: XCircle,
  LOGIN: User,
  ASSESSMENT_TAKEN: ClipboardCheck,
  CERTIFICATION_APPROVE: Award,
  CERTIFICATION_REJECT: XCircle,
  UPDATE_SETTING: Settings,
  APPROVAL_APPROVE: CheckCircle2,
  APPROVAL_REJECT: XCircle,
  COURSE_UPDATE: BookOpen,
  DOCUMENT_UPLOAD: FileText,
  SCORE_CHANGE: TrendingUp,
}

export function AuditCenter() {
  const user = useAuthStore((s) => s.user)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams({ limit: '100' })
    if (actionFilter !== 'all') params.set('action', actionFilter)
    if (typeFilter !== 'all') params.set('targetType', typeFilter)
    try {
      const res = await fetch(`/api/audit?${params.toString()}`)
      const data = await res.json()
      if (data.logs) {
        startTransition(() => {
          setLogs(data.logs)
          setLoading(false)
        })
      }
    } catch { /* ignore */ }
  }, [actionFilter, typeFilter, startTransition])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filteredLogs = logs.filter(l => {
    if (!search) return true
    const s = search.toLowerCase()
    return (l.user?.fullName || '').toLowerCase().includes(s) ||
      (l.user?.email || '').toLowerCase().includes(s) ||
      (l.action || '').toLowerCase().includes(s) ||
      (l.details || '').toLowerCase().includes(s)
  })

  const getActionLabel = (action: string) => action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          Audit & Security Center
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Track all platform activities and security events</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Events', value: logs.length, icon: ShieldCheck, color: 'bg-emerald-600' },
          { label: 'User Actions', value: logs.filter(l => l.targetType === 'user').length, icon: User, color: 'bg-teal-600' },
          { label: 'Assessments', value: logs.filter(l => l.action?.includes('ASSESSMENT')).length, icon: ClipboardCheck, color: 'bg-amber-500' },
          { label: 'Certifications', value: logs.filter(l => l.action?.includes('CERTIFICATION')).length, icon: Award, color: 'bg-emerald-500' },
          { label: 'Settings', value: logs.filter(l => l.action?.includes('SETTING')).length, icon: Settings, color: 'bg-gray-600' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE_USER">Create User</SelectItem>
                <SelectItem value="UPDATE_USER">Update User</SelectItem>
                <SelectItem value="DELETE_USER">Delete User</SelectItem>
                <SelectItem value="CERTIFICATION_APPROVE">Cert. Approved</SelectItem>
                <SelectItem value="CERTIFICATION_REJECT">Cert. Rejected</SelectItem>
                <SelectItem value="UPDATE_SETTING">Settings Changed</SelectItem>
                <SelectItem value="APPROVAL_APPROVE">Approval Granted</SelectItem>
                <SelectItem value="APPROVAL_REJECT">Approval Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="setting">Setting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">Target</TableHead>
                    <TableHead className="hidden lg:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs found</TableCell>
                    </TableRow>
                  ) : filteredLogs.map(log => {
                    const Icon = ACTION_ICONS[log.action] || AlertCircle
                    const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'
                    return (
                      <TableRow key={log.id} className="hover:bg-gray-50/50">
                        <TableCell className="text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{log.user?.fullName || 'System'}</p>
                            <p className="text-xs text-muted-foreground">{log.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={colorClass} variant="secondary">
                            <Icon className="w-3 h-3 mr-1" />
                            {getActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {log.targetType ? `${log.targetType}${log.targetId ? ` #${log.targetId.slice(0, 8)}` : ''}` : '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[250px] truncate">
                          {log.details || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6 max-h-64 overflow-y-auto custom-scrollbar">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-emerald-200" />
            {filteredLogs.slice(0, 15).map((log, i) => (
              <div key={log.id} className="relative mb-4 last:mb-0">
                <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-white ${
                  log.action.includes('DELETE') || log.action.includes('REJECT') ? 'bg-red-400' :
                  log.action.includes('CREATE') || log.action.includes('APPROVE') ? 'bg-emerald-400' : 'bg-teal-400'
                }`} />
                <div className="ml-2">
                  <p className="text-sm font-medium">{getActionLabel(log.action)}</p>
                  <p className="text-xs text-muted-foreground">
                    by {log.user?.fullName || 'System'} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                  {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
