'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Award, Clock, CheckCircle2, XCircle, AlertCircle, Shield, Users } from 'lucide-react'

interface CertAttemptData {
  id: string
  userId: string
  certificationId: string
  status: string
  score: number
  attemptedAt: string
  issuedAt: string | null
  user: { fullName: string | null; designation: string | null; department: { name: string } | null }
  certification: { name: string; moduleType: string | null; requiredScore: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  needs_training: { label: 'Needs Training', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  needs_review: { label: 'Needs Review', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  needs_sales_coaching: { label: 'Sales Coaching', color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
  needs_technical_coaching: { label: 'Tech Coaching', color: 'bg-teal-100 text-teal-700', icon: AlertCircle },
}

export function CertificationsView() {
  const [attempts, setAttempts] = useState<CertAttemptData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/certifications')
      .then(r => r.json())
      .then(data => {
        if (data.attempts) setAttempts(data.attempts)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statusCounts = {
    total: attempts.length,
    approved: attempts.filter(a => a.status === 'approved').length,
    pending: attempts.filter(a => a.status === 'pending').length,
    rejected: attempts.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          Certifications
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Manage certification programs and approvals</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Attempts', value: statusCounts.total, icon: Award, color: 'bg-emerald-600' },
          { label: 'Approved', value: statusCounts.approved, icon: CheckCircle2, color: 'bg-teal-600' },
          { label: 'Pending', value: statusCounts.pending, icon: Clock, color: 'bg-amber-500' },
          { label: 'Rejected', value: statusCounts.rejected, icon: XCircle, color: 'bg-red-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4 text-white" /></div>
              </div>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No certification attempts yet</TableCell></TableRow>
                  ) : attempts.map(a => {
                    const sc = STATUS_CONFIG[a.status] || { label: a.status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
                    return (
                      <TableRow key={a.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{a.user?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{a.user?.department?.name || '-'} · {a.user?.designation || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{a.certification?.name}</p>
                            <p className="text-xs text-muted-foreground">{(a.certification?.moduleType || '').replace(/_/g, ' ')}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{Math.round(a.score)}%</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.certification?.requiredScore}%</TableCell>
                        <TableCell><Badge className={sc.color} variant="secondary"><sc.icon className="w-3 h-3 mr-1" />{sc.label}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(a.attemptedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
