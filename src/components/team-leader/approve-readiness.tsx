'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Handshake,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Search,
  Wrench,
  Phone,
  Brain,
  Award,
  Filter,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApprovalWorkflow, type ApprovalAction } from '@/components/shared/approval-workflow'

interface CertAttemptData {
  id: string
  userId: string
  certificationId: string
  status: string
  score: number
  attemptedAt: string
  issuedAt: string | null
  aiReadinessReport: string | null
  user: { id: string; fullName: string | null; designation: string | null; department: { name: string } | null; employeeId: string | null }
  certification: { id: string; name: string; moduleType: string | null; requiredScore: number }
  approvalLog: { action: string; comment: string | null; createdAt: string; approver: { fullName: string | null } }[]
}

export function ApproveReadiness() {
  const user = useAuthStore((s) => s.user)
  const [attempts, setAttempts] = useState<CertAttemptData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedAttempt, setSelectedAttempt] = useState<CertAttemptData | null>(null)
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [resultMsg, setResultMsg] = useState('')

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch(`/api/approvals?approverId=${user?.id}&pending=${statusFilter === 'pending' ? 'true' : 'false'}`)
      if (res.ok) {
        const json = await res.json()
        setAttempts(json.attempts || [])
      }
    } catch (err) {
      console.error('Failed to fetch approvals:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, statusFilter])

  useEffect(() => {
    if (user?.id) fetchApprovals()
  }, [user?.id, fetchApprovals])

  const handleApprovalSubmit = async (action: ApprovalAction, comment: string) => {
    if (!selectedAttempt || !user?.id) return

    // Map the workflow action to the API action
    const actionMap: Record<ApprovalAction, string> = {
      approve_field: 'approve',
      approve_inbound: 'approve',
      needs_training: 'retraining',
      needs_review: 'review',
      needs_technical_coaching: 'additional_product',
      needs_sales_coaching: 'additional_mock',
    }

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedAttempt.userId,
          approverId: user.id,
          action: actionMap[action],
          comment,
          certificationAttemptId: selectedAttempt.id,
          type: action.includes('field') ? 'field' : action.includes('inbound') ? 'inbound' : action,
        }),
      })

      if (res.ok) {
        setResultMsg('Decision submitted successfully')
        fetchApprovals()
      } else {
        setResultMsg('Failed to submit decision')
      }
    } catch {
      setResultMsg('Failed to submit decision')
    }

    // Auto-clear result message
    setTimeout(() => setResultMsg(''), 5000)
  }

  const openWorkflow = (attempt: CertAttemptData) => {
    setSelectedAttempt(attempt)
    setWorkflowOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-48" />
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Handshake className="w-5 h-5 text-emerald-600" />
          </div>
          Approve Readiness
        </h1>
        <p className="text-gray-500 mt-1 ml-13">
          Review employee certifications and approve readiness for field or inbound deployment
        </p>
      </div>

      {resultMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${resultMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
        >
          {resultMsg}
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="needs_training">Needs Training</SelectItem>
            <SelectItem value="needs_review">Needs Review</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="border-emerald-200 text-emerald-700">
          {attempts.length} results
        </Badge>
      </div>

      {/* Pending Approval Cards */}
      {attempts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Pending Approvals</h3>
            <p className="text-gray-400 text-center max-w-md">
              {statusFilter === 'pending'
                ? 'All readiness certifications have been reviewed. Check back later for new submissions.'
                : 'No certifications match the selected filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const initials = attempt.user?.fullName
              ? attempt.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'U'
            const meetsRequired = attempt.score >= (attempt.certification?.requiredScore || 70)

            const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
              pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
              approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
              rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
              needs_training: { label: 'Needs Training', color: 'bg-orange-100 text-orange-700', icon: Wrench },
              needs_review: { label: 'Needs Review', color: 'bg-purple-100 text-purple-700', icon: Search },
              needs_technical_coaching: { label: 'Needs Technical Coaching', color: 'bg-orange-100 text-orange-700', icon: Wrench },
              needs_sales_coaching: { label: 'Needs Sales Coaching', color: 'bg-rose-100 text-rose-700', icon: Phone },
            }

            const currentStatusConfig = statusConfig[attempt.status] || statusConfig.pending
            const StatusIcon = currentStatusConfig.icon

            return (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Employee Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Avatar className="h-14 w-14 bg-emerald-100">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg">{attempt.user?.fullName || 'Unknown'}</h3>
                          <p className="text-sm text-gray-500">{attempt.user?.designation || 'No designation'}</p>
                          {attempt.user?.department && (
                            <Badge variant="outline" className="mt-1 text-xs border-emerald-200 text-emerald-700">
                              {attempt.user.department.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Certification & Score */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-center">
                          <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs mb-1">
                            <Award className="w-3 h-3 mr-1" />
                            {attempt.certification?.name}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            {attempt.certification?.moduleType?.replace(/_/g, ' ') || 'General'}
                          </p>
                        </div>
                        
                        <div className={`text-center px-5 py-3 rounded-xl border ${meetsRequired ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                          <p className={`text-3xl font-bold ${meetsRequired ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {attempt.score}%
                          </p>
                          <p className="text-xs text-gray-400">Required: {attempt.certification?.requiredScore || 70}%</p>
                        </div>

                        <Badge className={`${currentStatusConfig.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {currentStatusConfig.label}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:flex-col shrink-0">
                        <Button
                          onClick={() => openWorkflow(attempt)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Handshake className="w-4 h-4 mr-2" />
                          Review & Approve
                        </Button>
                      </div>
                    </div>

                    {/* AI Readiness Report */}
                    {attempt.aiReadinessReport && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-700">AI Readiness Report</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{attempt.aiReadinessReport}</p>
                      </div>
                    )}

                    {/* Approval History */}
                    {attempt.approvalLog?.length > 0 && (
                      <div className="mt-3">
                        <Separator className="mb-3" />
                        <p className="text-xs text-gray-400 mb-2">Approval History</p>
                        <div className="space-y-1">
                          {attempt.approvalLog.map((log, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-medium">{log.approver?.fullName || 'Unknown'}</span>
                              <span>→</span>
                              <Badge variant="outline" className="text-[10px] capitalize">{log.action.replace(/_/g, ' ')}</Badge>
                              {log.comment && <span className="text-gray-400">({log.comment})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Approval Workflow Dialog */}
      {selectedAttempt && (
        <ApprovalWorkflow
          open={workflowOpen}
          onOpenChange={setWorkflowOpen}
          employee={{
            id: selectedAttempt.userId,
            fullName: selectedAttempt.user?.fullName || null,
            designation: selectedAttempt.user?.designation || null,
            department: selectedAttempt.user?.department?.name || null,
            employeeId: selectedAttempt.user?.employeeId || null,
          }}
          certification={{
            id: selectedAttempt.certificationId,
            name: selectedAttempt.certification?.name || 'Unknown',
            moduleType: selectedAttempt.certification?.moduleType || null,
            requiredScore: selectedAttempt.certification?.requiredScore || 70,
          }}
          score={selectedAttempt.score}
          aiReadinessReport={selectedAttempt.aiReadinessReport}
          currentStatus={selectedAttempt.status}
          onSubmit={handleApprovalSubmit}
        />
      )}
    </motion.div>
  )
}
