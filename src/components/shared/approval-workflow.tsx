'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Search,
  Wrench,
  Phone,
  XCircle,
  Send,
  Brain,
  FileText,
} from 'lucide-react'

export type ApprovalAction =
  | 'approve_field'
  | 'approve_inbound'
  | 'needs_training'
  | 'needs_review'
  | 'needs_technical_coaching'
  | 'needs_sales_coaching'

interface ApprovalWorkflowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: {
    id: string
    fullName: string | null
    designation: string | null
    department?: string | null
    employeeId?: string | null
  }
  certification: {
    id: string
    name: string
    moduleType?: string | null
    requiredScore?: number
  }
  score: number
  aiReadinessReport?: string | null
  currentStatus?: string
  onSubmit: (action: ApprovalAction, comment: string) => Promise<void>
}

const ACTION_OPTIONS: {
  value: ApprovalAction
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  description: string
}[] = [
  {
    value: 'approve_field',
    label: 'Approved for Field Sales',
    icon: CheckCircle2,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Employee is ready for field sales deployment',
  },
  {
    value: 'approve_inbound',
    label: 'Approved for Inbound Sales',
    icon: ShieldCheck,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Employee is ready for inbound sales deployment',
  },
  {
    value: 'needs_training',
    label: 'Needs Additional Training',
    icon: AlertTriangle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Employee requires retraining before deployment',
  },
  {
    value: 'needs_review',
    label: 'Needs Manager Review',
    icon: Search,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Requires further review by senior management',
  },
  {
    value: 'needs_technical_coaching',
    label: 'Needs Technical Coaching',
    icon: Wrench,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Employee needs improvement in technical skills',
  },
  {
    value: 'needs_sales_coaching',
    label: 'Needs Sales Coaching',
    icon: Phone,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Employee needs improvement in sales skills',
  },
]

const STATUS_FLOW = [
  { key: 'pending', label: 'Pending Review', color: 'bg-amber-400' },
  { key: 'in_review', label: 'Under Review', color: 'bg-purple-400' },
  { key: 'approved', label: 'Approved', color: 'bg-emerald-500' },
  { key: 'deployed', label: 'Deployed', color: 'bg-teal-500' },
]

export function ApprovalWorkflow({
  open,
  onOpenChange,
  employee,
  certification,
  score,
  aiReadinessReport,
  currentStatus,
  onSubmit,
}: ApprovalWorkflowProps) {
  const [selectedAction, setSelectedAction] = useState<ApprovalAction | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedAction) return
    setSubmitting(true)
    try {
      await onSubmit(selectedAction, comment)
      setSelectedAction(null)
      setComment('')
      onOpenChange(false)
    } catch {
      // error handled by parent
    } finally {
      setSubmitting(false)
    }
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-600'
    if (s >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-emerald-50 border-emerald-200'
    if (s >= 60) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const initials = employee.fullName
    ? employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const getCurrentFlowIndex = () => {
    if (currentStatus === 'approved') return 2
    if (currentStatus === 'needs_review') return 1
    return 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            Readiness Approval Workflow
          </DialogTitle>
          <DialogDescription>
            Review employee certification and approve readiness status
          </DialogDescription>
        </DialogHeader>

        {/* Employee Info Header */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
          <Avatar className="h-12 w-12 bg-emerald-100">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{employee.fullName || 'Unknown'}</h3>
            <p className="text-sm text-gray-500">{employee.designation || 'No designation'}</p>
            {employee.department && (
              <Badge variant="outline" className="mt-1 text-xs border-emerald-200 text-emerald-700">
                {employee.department}
              </Badge>
            )}
          </div>
          <div className={`text-right px-4 py-2 rounded-lg border ${getScoreBg(score)}`}>
            <p className="text-2xl font-bold">{score}%</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
        </div>

        {/* Certification Details */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Certification Details</Label>
          <div className="grid grid-cols-2 gap-3 p-3 bg-white border rounded-lg">
            <div>
              <p className="text-xs text-gray-400">Certification</p>
              <p className="text-sm font-medium text-gray-900">{certification.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Module Type</p>
              <p className="text-sm font-medium text-gray-900">{certification.moduleType?.replace(/_/g, ' ') || 'General'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Required Score</p>
              <p className="text-sm font-medium">{certification.requiredScore ?? 70}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <Badge variant="outline" className="text-xs capitalize">
                {currentStatus?.replace(/_/g, ' ') || 'Pending'}
              </Badge>
            </div>
          </div>
        </div>

        {/* AI Readiness Report */}
        {aiReadinessReport && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-600" />
              AI-Generated Readiness Report
            </Label>
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {aiReadinessReport}
              </p>
            </div>
          </div>
        )}

        {/* Status Flow Visualization */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Approval Status Flow</Label>
          <div className="flex items-center gap-1 p-3 bg-gray-50 rounded-lg">
            {STATUS_FLOW.map((step, idx) => {
              const currentIdx = getCurrentFlowIndex()
              const isActive = idx <= currentIdx
              const isCurrent = idx === currentIdx
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? `${step.color} text-white`
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-2 ring-offset-2 ring-emerald-400' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <p className={`text-[10px] mt-1 text-center ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div className={`h-0.5 w-4 ${idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Action Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Select Action</Label>
          <RadioGroup
            value={selectedAction || ''}
            onValueChange={(v) => setSelectedAction(v as ApprovalAction)}
            className="space-y-2"
          >
            {ACTION_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAction === option.value
                      ? `${option.bgColor} ${option.borderColor}`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${option.color}`} />
                      <span className={`text-sm font-medium ${option.color}`}>{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 ml-6">{option.description}</p>
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Comment (Optional)</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment about your decision..."
            className="min-h-[80px] resize-none"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAction || submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Decision
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
