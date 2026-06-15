'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShieldCheck, ShieldX, Hourglass, Users, RefreshCw,
  CheckCircle2, XCircle, Clock, Search, Filter,
  ChevronDown, ArrowRight, FileCheck, AlertCircle,
  MessageSquare, UserCheck, Trophy,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'

// ==================== TYPES ====================

interface ApprovalRequest {
  id: string
  userId: string
  userName: string
  employeeId: string | null
  designation: string | null
  department: string | null
  examType: string | null
  stage: number
  stageLabel: string | null
  scorePercentage: number
  passStatus: boolean
  date: string
  adminApproved: boolean
  approvalStatus: string
  approvedBy: string | null
  approvedAt: string | null
  approvalComment: string | null
}

interface ApprovalCounts {
  pending: number
  approved: number
  rejected: number
}

// ==================== STAGE & EXAM TYPE CONFIG ====================

const STAGE_INFO: Record<number, { label: string; color: string; bgColor: string }> = {
  1: { label: 'Pre Exam', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  2: { label: 'Mid Exam', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  3: { label: 'Hard Exam', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  4: { label: 'Extra Hard', color: 'text-red-700', bgColor: 'bg-red-100' },
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  inbound_sales_exam: 'Inbound Sales',
  field_sales_exam: 'Field Sales',
}

const EXAM_TYPE_COLORS: Record<string, string> = {
  inbound_sales_exam: 'bg-teal-100 text-teal-700 border-teal-200',
  field_sales_exam: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

// ==================== MAIN COMPONENT ====================

export function StageApproval() {
  const { toast } = useToast()
  const user = useAuthStore((s) => s.user)
  const [, startTransition] = useTransition()

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [counts, setCounts] = useState<ApprovalCounts>({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [filterExamType, setFilterExamType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null)
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState(false)

  const [isPending, startPendingTransition] = useTransition()

  const fetchApprovals = useCallback(async () => {
    try {
      const status = activeTab === 'all' ? 'all' : activeTab
      const params = new URLSearchParams({ status })
      if (filterExamType !== 'all') params.set('examType', filterExamType)

      const res = await fetch(`/api/admin/stage-approval?${params}`)
      const data = await res.json()

      if (res.ok) {
        startPendingTransition(() => {
          setApprovals(data.approvals || [])
          setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 })
          setError(null)
          setLoading(false)
        })
      } else {
        startPendingTransition(() => {
          setError(data.error || 'Failed to load approvals')
          setLoading(false)
        })
      }
    } catch {
      startPendingTransition(() => {
        setError('Network error. Please try again.')
        setLoading(false)
      })
    }
  }, [activeTab, filterExamType, startPendingTransition])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  const handleApprove = async () => {
    if (!selectedApproval) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/stage-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scorecardId: selectedApproval.id,
          action: 'approve',
          comment: comment || undefined,
          adminId: user?.id,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Stage Approved',
          description: `${selectedApproval.userName}'s ${selectedApproval.stageLabel || `Stage ${selectedApproval.stage}`} has been approved.`,
        })
        setShowApproveDialog(false)
        setSelectedApproval(null)
        setComment('')
        fetchApprovals()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to approve', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setProcessing(false)
  }

  const handleReject = async () => {
    if (!selectedApproval) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/stage-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scorecardId: selectedApproval.id,
          action: 'reject',
          comment: comment || undefined,
          adminId: user?.id,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Stage Rejected',
          description: `${selectedApproval.userName}'s ${selectedApproval.stageLabel || `Stage ${selectedApproval.stage}`} progression has been rejected.`,
        })
        setShowRejectDialog(false)
        setSelectedApproval(null)
        setComment('')
        fetchApprovals()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to reject', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setProcessing(false)
  }

  const openApprove = (approval: ApprovalRequest) => {
    setSelectedApproval(approval)
    setComment('')
    setShowApproveDialog(true)
  }

  const openReject = (approval: ApprovalRequest) => {
    setSelectedApproval(approval)
    setComment('')
    setShowRejectDialog(true)
  }

  // Filter approvals by search term
  const filteredApprovals = approvals.filter((a) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      a.userName?.toLowerCase().includes(term) ||
      a.employeeId?.toLowerCase().includes(term) ||
      a.department?.toLowerCase().includes(term) ||
      a.stageLabel?.toLowerCase().includes(term)
    )
  })

  // ==================== RENDER ====================

  if (error && approvals.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          Stage Approvals
        </h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchApprovals} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            Stage Approvals
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Review and approve employee exam stage progressions</p>
        </div>
        <Button onClick={fetchApprovals} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: counts.pending, icon: Hourglass, color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
          { label: 'Approved', value: counts.approved, icon: ShieldCheck, color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
          { label: 'Rejected', value: counts.rejected, icon: ShieldX, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`${s.bgColor} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${s.textColor} font-medium`}>{s.label}</p>
                    <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Hourglass className="w-3.5 h-3.5" /> Pending
            {counts.pending > 0 && (
              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 ml-1">{counts.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <ShieldX className="w-3.5 h-3.5" /> Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterExamType}
                onChange={(e) => setFilterExamType(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Exam Types</option>
                <option value="inbound_sales_exam">Inbound Sales</option>
                <option value="field_sales_exam">Field Sales</option>
              </select>
            </div>
          </div>

          {/* Approval List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'pending' ? (
                    <Hourglass className="w-8 h-8 text-gray-300" />
                  ) : activeTab === 'approved' ? (
                    <ShieldCheck className="w-8 h-8 text-gray-300" />
                  ) : (
                    <ShieldX className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-500">
                  {activeTab === 'pending'
                    ? 'No Pending Approvals'
                    : activeTab === 'approved'
                    ? 'No Approved Records'
                    : 'No Rejected Records'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {activeTab === 'pending'
                    ? 'All stage progressions have been reviewed.'
                    : `No ${activeTab} stage progression records found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredApprovals.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className={`overflow-hidden transition-all hover:shadow-md ${
                      approval.approvalStatus === 'pending'
                        ? 'border-amber-200 bg-amber-50/30'
                        : approval.approvalStatus === 'approved'
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-red-200 bg-red-50/30'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Employee Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              approval.approvalStatus === 'pending'
                                ? 'bg-amber-100'
                                : approval.approvalStatus === 'approved'
                                ? 'bg-emerald-100'
                                : 'bg-red-100'
                            }`}>
                              <Users className={`w-5 h-5 ${
                                approval.approvalStatus === 'pending'
                                  ? 'text-amber-600'
                                  : approval.approvalStatus === 'approved'
                                  ? 'text-emerald-600'
                                  : 'text-red-600'
                              }`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 truncate">
                                {approval.userName}
                              </h4>
                              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                {approval.employeeId && (
                                  <span className="text-xs text-gray-500">ID: {approval.employeeId}</span>
                                )}
                                {approval.designation && (
                                  <span className="text-xs text-gray-400">• {approval.designation}</span>
                                )}
                                {approval.department && (
                                  <span className="text-xs text-gray-400">• {approval.department}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Exam & Stage Info */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {approval.examType && (
                              <Badge variant="outline" className={`text-[10px] ${EXAM_TYPE_COLORS[approval.examType] || ''}`}>
                                {EXAM_TYPE_LABELS[approval.examType] || approval.examType}
                              </Badge>
                            )}
                            {approval.stage > 0 && (
                              <Badge className={`${STAGE_INFO[approval.stage]?.bgColor || 'bg-gray-100'} ${STAGE_INFO[approval.stage]?.color || 'text-gray-600'} text-[10px]`}>
                                {approval.stageLabel || STAGE_INFO[approval.stage]?.label || `Stage ${approval.stage}`}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px]">
                              <Trophy className="w-3 h-3 mr-0.5" /> {approval.scorePercentage}%
                            </Badge>
                            <Badge variant="outline" className="text-[10px] text-gray-500">
                              <Clock className="w-3 h-3 mr-0.5" />
                              {new Date(approval.date).toLocaleDateString()}
                            </Badge>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {approval.approvalStatus === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                                  onClick={() => openApprove(approval)}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 h-8 text-xs"
                                  onClick={() => openReject(approval)}
                                >
                                  <ShieldX className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {approval.approvalStatus === 'approved' && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Approved
                              </Badge>
                            )}
                            {approval.approvalStatus === 'rejected' && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                <ShieldX className="w-3 h-3 mr-1" /> Rejected
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Approved/Rejected details */}
                        {approval.approvalStatus !== 'pending' && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                              {approval.approvedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(approval.approvedAt).toLocaleDateString()} {new Date(approval.approvedAt).toLocaleTimeString()}
                                </span>
                              )}
                              {approval.approvalComment && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {approval.approvalComment}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Approve Stage Progression
            </DialogTitle>
            <DialogDescription>
              Allow this employee to proceed to the next stage
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedApproval.userName}</p>
                    <p className="text-xs text-gray-500">
                      {EXAM_TYPE_LABELS[selectedApproval.examType || ''] || 'Exam'} • {selectedApproval.stageLabel || `Stage ${selectedApproval.stage}`} • Score: {selectedApproval.scorePercentage}%
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Comment (optional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a note for the employee..."
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowApproveDialog(false); setSelectedApproval(null) }}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
              {processing ? 'Approving...' : 'Approve Progression'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldX className="w-5 h-5" /> Reject Stage Progression
            </DialogTitle>
            <DialogDescription>
              The employee will need to retake the exam
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedApproval.userName}</p>
                    <p className="text-xs text-gray-500">
                      {EXAM_TYPE_LABELS[selectedApproval.examType || ''] || 'Exam'} • {selectedApproval.stageLabel || `Stage ${selectedApproval.stage}`} • Score: {selectedApproval.scorePercentage}%
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Reason for rejection (recommended)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain why the progression is not approved..."
                  rows={3}
                />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    The employee will be notified and required to retake the exam before progressing further.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setSelectedApproval(null) }}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={processing} variant="destructive">
              {processing ? 'Rejecting...' : 'Reject Progression'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
