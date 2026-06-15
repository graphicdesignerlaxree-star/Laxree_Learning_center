'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ThumbsUp, XCircle, RotateCcw, MessageSquare, Loader2, CheckCircle2, Award } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

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

export function ApproveCertifications() {
  const user = useAuthStore((s) => s.user)
  const [attempts, setAttempts] = useState<CertAttemptData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState<CertAttemptData | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'retraining' | ''>('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resultMsg, setResultMsg] = useState('')

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/certifications?status=pending')
      if (res.ok) {
        const json = await res.json()
        setAttempts(json.attempts || [])
      }
    } catch (err) {
      console.error('Failed to fetch certifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const handleAction = (attempt: CertAttemptData, action: 'approve' | 'reject' | 'retraining') => {
    setSelectedAttempt(attempt)
    setActionType(action)
    setComment('')
    setActionDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedAttempt || !actionType || !user?.id) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/certifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAttempt.id,
          action: actionType,
          approverId: user.id,
          comment,
        }),
      })
      if (res.ok) {
        setResultMsg(`Certification ${actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'marked for retraining'} successfully`)
        fetchPending()
      } else {
        setResultMsg('Failed to update certification status')
      }
    } catch {
      setResultMsg('Failed to update certification status')
    } finally {
      setSubmitting(false)
      setActionDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
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
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
          </div>
          Approve Certifications
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Review and approve pending certification requests</p>
      </div>

      {resultMsg && (
        <div className={`p-3 rounded-lg text-sm ${resultMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {resultMsg}
        </div>
      )}

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">All Caught Up!</h3>
            <p className="text-gray-400 text-center max-w-md">No pending certification requests to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const initials = attempt.user?.fullName
              ? attempt.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'U'
            const meetsRequired = attempt.score >= (attempt.certification?.requiredScore || 70)

            return (
              <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Employee Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-11 w-11 bg-emerald-100">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{attempt.user?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{attempt.user?.designation} • {attempt.user?.department?.name || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Certification Details */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-center">
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {attempt.certification?.name}
                        </Badge>
                      </div>
                      <div className="text-center px-3 py-1.5 rounded-lg border bg-gray-50">
                        <p className={`text-lg font-bold ${meetsRequired ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {attempt.score}%
                        </p>
                        <p className="text-[10px] text-gray-400">Required: {attempt.certification?.requiredScore || 70}%</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(attempt.attemptedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAction(attempt, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(attempt, 'retraining')}
                        className="border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Retrain
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(attempt, 'reject')}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {/* AI Readiness Report Preview */}
                  {attempt.aiReadinessReport && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                      <p className="text-xs font-medium text-emerald-700 mb-1">AI Readiness Report</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{attempt.aiReadinessReport}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Certification' : actionType === 'reject' ? 'Reject Certification' : 'Request Retraining'}
            </DialogTitle>
            <DialogDescription>
              {selectedAttempt?.user?.fullName} - {selectedAttempt?.certification?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Score</span>
                <span className={`text-lg font-bold ${(selectedAttempt?.score || 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedAttempt?.score}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                Comment
              </Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Add a comment about this ${actionType}...`}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className={
                actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' :
                'bg-amber-600 hover:bg-amber-700 text-white'
              }
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm {actionType === 'approve' ? 'Approval' : actionType === 'reject' ? 'Rejection' : 'Retraining'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
