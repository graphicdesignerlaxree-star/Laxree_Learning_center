'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GraduationCap, Plus, Calendar, Loader2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

interface PlanData {
  id: string
  employeeId: string
  assignedBy: string
  title: string
  description: string | null
  type: string | null
  status: string
  dueDate: string | null
  createdAt: string
  employee: { id: string; fullName: string | null; designation: string | null }
}

export function ImprovementPlans() {
  const user = useAuthStore((s) => s.user)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [resultMsg, setResultMsg] = useState('')

  // Create form state
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [planTitle, setPlanTitle] = useState('')
  const [planType, setPlanType] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [planDueDate, setPlanDueDate] = useState('')

  const [employees, setEmployees] = useState<{ id: string; fullName: string | null; designation: string | null }[]>([])

  const fetchPlans = async () => {
    try {
      // Fetch team members' improvement plans
      const approvalsRes = await fetch(`/api/approvals?approverId=${user?.id}`)
      if (approvalsRes.ok) {
        const json = await approvalsRes.json()
        const teamMemberIds = (json.attempts || []).map((a: any) => a.userId)
        // We'll use a simpler approach - fetch team members from dashboard
      }
      
      const dashRes = await fetch(`/api/dashboard?userId=${user?.id}&role=TEAM_LEADER`)
      if (dashRes.ok) {
        const dashJson = await dashRes.json()
        const teamMembers = dashJson.teamMembers || []
        setEmployees(teamMembers.map((m: any) => ({ id: m.id, fullName: m.fullName, designation: m.designation })))

        // Fetch improvement plans for team members
        // Since there's no dedicated endpoint, we'll simulate from certification attempts
        const planPromises = teamMembers.map(async (m: any) => {
          try {
            const empDashRes = await fetch(`/api/dashboard?userId=${m.id}&role=EMPLOYEE`)
            if (empDashRes.ok) {
              const empData = await empDashRes.json()
              return (empData.improvementPlans || []).map((p: any) => ({
                ...p,
                employee: { id: m.id, fullName: m.fullName, designation: m.designation },
              }))
            }
          } catch {}
          return []
        })
        const allPlans = (await Promise.all(planPromises)).flat()
        setPlans(allPlans)
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) fetchPlans()
  }, [user?.id])

  const handleCreate = async () => {
    if (!selectedEmployee || !planTitle || !planType || !user?.id) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          approverId: user.id,
          action: planType,
          comment: planDescription,
          certificationAttemptId: null,
        }),
      })
      if (res.ok) {
        setResultMsg('Improvement plan created successfully')
        fetchPlans()
        setCreateOpen(false)
        setSelectedEmployee('')
        setPlanTitle('')
        setPlanType('')
        setPlanDescription('')
        setPlanDueDate('')
      } else {
        setResultMsg('Failed to create improvement plan')
      }
    } catch {
      setResultMsg('Failed to create improvement plan')
    } finally {
      setSubmitting(false)
      setTimeout(() => setResultMsg(''), 5000)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 }
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-teal-100 text-teal-700', icon: Clock }
      case 'assigned':
      default:
        return { label: 'Assigned', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle }
    }
  }

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case 'retraining': return 'Retraining'
      case 'additional_mock': return 'Additional Mock Practice'
      case 'additional_product': return 'Additional Product Learning'
      default: return type?.replace(/_/g, ' ') || 'General'
    }
  }

  const filteredPlans = plans.filter(p => statusFilter === 'all' || p.status === statusFilter)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            Improvement Plans
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Create and track improvement plans for team members</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      {resultMsg && (
        <div className={`p-3 rounded-lg text-sm ${resultMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {resultMsg}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="border-emerald-200 text-emerald-700">
          {filteredPlans.length} plans
        </Badge>
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Improvement Plans</h3>
            <p className="text-gray-400 text-center max-w-md">Create improvement plans for team members who need additional training or practice.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPlans.map(plan => {
            const statusConfig = getStatusConfig(plan.status)
            const StatusIcon = statusConfig.icon
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{plan.title}</h3>
                        <Badge className={`text-[10px] ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {plan.employee?.fullName || 'Unknown'} • {getTypeLabel(plan.type)}
                      </p>
                      {plan.description && (
                        <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {plan.dueDate && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Due Date</p>
                          <p className="text-sm font-medium text-gray-700">{new Date(plan.dueDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Created</p>
                        <p className="text-xs text-gray-500">{new Date(plan.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Improvement Plan</DialogTitle>
            <DialogDescription>Assign an improvement plan to a team member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.fullName || 'Unknown'} ({e.designation || 'N/A'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Plan Type</Label>
              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retraining">Retraining</SelectItem>
                  <SelectItem value="additional_mock">Additional Mock Practice</SelectItem>
                  <SelectItem value="additional_product">Additional Product Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} placeholder="e.g., Product Knowledge Retraining" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} placeholder="Describe the improvement plan..." className="min-h-[80px] resize-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Due Date
              </Label>
              <Input type="date" value={planDueDate} onChange={(e) => setPlanDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting || !selectedEmployee || !planType || !planTitle} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
