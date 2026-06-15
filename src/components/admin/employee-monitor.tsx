'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  UserCheck, Search, RefreshCw, Trophy, Award, TrendingUp, Clock,
  Shield, Phone, Activity, Eye, MapPin, Brain, Sparkles,
  ChevronDown, Users, Target, BookOpen, Send, AlertTriangle,
  CheckCircle2, ArrowRight, Filter, BarChart3, Zap, User,
  GraduationCap, PhoneCall, AlertCircle, X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

interface EmployeeBatchData {
  id: string
  fullName: string
  employeeId: string | null
  department: string | null
  aiReadinessScore: number
  currentLevel: string
  fieldReady: boolean
  inboundReady: boolean
  avgQuizScore: number
  avgSimScore: number
  trainingProgress: number
  recommendation: string
  reasoning: string[]
  confidence: number
}

interface BatchSummary {
  total: number
  fieldReady: number
  inboundReady: number
  needsTraining: number
  transition: number
}

interface EmployeeDetail {
  employee: {
    id: string
    fullName: string | null
    email: string
    employeeId: string | null
    department: string | null
    designation: string | null
    currentLevel: string | null
    aiReadinessScore: number
    fieldReady: boolean
    inboundReady: boolean
  }
  metrics: {
    avgQuizScore: number
    avgSimScore: number
    avgCommunication: number
    avgTechnical: number
    avgProductKnowledge: number
    avgSales: number
    trainingProgress: number
    completedModules: number
    totalModules: number
    totalEnrollments: number
    quizAttempts: number
    simAttempts: number
  }
  recommendation: {
    recommendation: string
    verdict: string
    reasoning: string[]
    confidence: number
    suggestedModules: string[]
    strengths: string[]
    weaknesses: string[]
    deploymentReadiness: {
      field: { ready: boolean; score: number }
      inbound: { ready: boolean; score: number }
    }
  } | null
}

const STATUS_CONFIG = {
  field_ready: { label: 'Field Ready', icon: MapPin, color: 'emerald', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inbound_ready: { label: 'Inbound Ready', icon: Phone, color: 'teal', bgClass: 'bg-teal-100', textClass: 'text-teal-700', badgeClass: 'bg-teal-100 text-teal-700 border-teal-200' },
  in_training: { label: 'In Training', icon: BookOpen, color: 'amber', bgClass: 'bg-amber-100', textClass: 'text-amber-700', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  needs_attention: { label: 'Needs Attention', icon: AlertTriangle, color: 'red', bgClass: 'bg-red-100', textClass: 'text-red-700', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
}

type StatusKey = keyof typeof STATUS_CONFIG

function getEmployeeStatus(emp: EmployeeBatchData): StatusKey {
  if (emp.fieldReady) return 'field_ready'
  if (emp.inboundReady) return 'inbound_ready'
  if (emp.aiReadinessScore >= 40) return 'in_training'
  return 'needs_attention'
}

function getAIRecommendationTag(emp: EmployeeBatchData): { label: string; color: string } {
  const rec = emp.recommendation || ''
  if (rec.includes('Ready for Field')) return { label: 'Ready for Field', color: 'emerald' }
  if (rec.includes('Ready for Inbound')) return { label: 'Inbound Ready', color: 'teal' }
  if (rec.includes('Start with Inbound')) return { label: 'Inbound → Field', color: 'amber' }
  if (rec.includes('Needs More Training')) return { label: 'Needs Training', color: 'red' }
  return { label: 'Evaluating', color: 'gray' }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function EmployeeMonitor() {
  const user = useAuthStore((s) => s.user)
  const [employees, setEmployees] = useState<EmployeeBatchData[]>([])
  const [summary, setSummary] = useState<BatchSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeBatchData | null>(null)
  const [detailData, setDetailData] = useState<EmployeeDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('grid')

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ai-deployment?batch=true')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees || [])
        setSummary(data.summary || null)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const fetchEmployeeDetail = useCallback(async (empId: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/ai-deployment?employeeId=${empId}`)
      if (res.ok) {
        const data = await res.json()
        setDetailData(data)
      }
    } catch { /* ignore */ }
    setDetailLoading(false)
  }, [])

  const handlePromoteToField = async (empId: string) => {
    try {
      const res = await fetch('/api/admin/ai-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, fieldReady: true }),
      })
      if (res.ok) {
        toast.success('Employee promoted to field-ready')
        fetchEmployees()
      }
    } catch { toast.error('Failed to update') }
  }

  const handlePromoteToInbound = async (empId: string) => {
    try {
      const res = await fetch('/api/admin/ai-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, inboundReady: true }),
      })
      if (res.ok) {
        toast.success('Employee promoted to inbound-ready')
        fetchEmployees()
      }
    } catch { toast.error('Failed to update') }
  }

  const handleAssignTraining = async (empId: string) => {
    try {
      const res = await fetch('/api/admin/ai-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: empId,
          assignedTraining: [{
            title: 'Additional Product Training',
            description: 'Assigned based on AI readiness analysis',
            type: 'retraining',
          }],
        }),
      })
      if (res.ok) {
        toast.success('Training assigned')
        fetchEmployees()
      }
    } catch { toast.error('Failed to assign training') }
  }

  // Filtered employees
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))] as string[]
  const filtered = employees.filter(emp => {
    const matchSearch = !searchTerm || emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchDept = departmentFilter === 'all' || emp.department === departmentFilter
    let matchStatus = true
    if (statusFilter !== 'all') {
      const status = getEmployeeStatus(emp)
      matchStatus = status === statusFilter
    }
    return matchSearch && matchDept && matchStatus
  })

  const groupedByDepartment = departments.reduce((acc, dept) => {
    acc[dept] = filtered.filter(e => e.department === dept)
    return acc
  }, {} as Record<string, EmployeeBatchData[]>)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              Employee Monitor
            </h1>
            <p className="text-gray-500 mt-1 ml-13">Track readiness, AI recommendations & performance</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchEmployees} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      {summary && (
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: summary.total, icon: Users, color: 'bg-gray-100 text-gray-700' },
              { label: 'Field Ready', value: summary.fieldReady, icon: MapPin, color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Inbound Ready', value: summary.inboundReady, icon: Phone, color: 'bg-teal-100 text-teal-700' },
              { label: 'Transition', value: summary.transition, icon: ArrowRight, color: 'bg-amber-100 text-amber-700' },
              { label: 'Needs Training', value: summary.needsTraining, icon: BookOpen, color: 'bg-red-100 text-red-700' },
            ].map(s => (
              <Card key={s.label} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="field_ready">Field Ready</SelectItem>
              <SelectItem value="inbound_ready">Inbound Ready</SelectItem>
              <SelectItem value="in_training">In Training</SelectItem>
              <SelectItem value="needs_attention">Needs Attention</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Tabs: Grid / Department / Table */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="grid" className="gap-1.5"><Users className="w-3.5 h-3.5" /> Grid</TabsTrigger>
            <TabsTrigger value="department" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Department</TabsTrigger>
            <TabsTrigger value="table" className="gap-1.5"><Activity className="w-3.5 h-3.5" /> Table</TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No employees found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <AnimatePresence>
                  {filtered.map((emp, i) => {
                    const status = getEmployeeStatus(emp)
                    const config = STATUS_CONFIG[status]
                    const aiTag = getAIRecommendationTag(emp)
                    return (
                      <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Card className="hover:shadow-md transition-all group">
                          <CardContent className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-10 h-10 rounded-full ${config.bgClass} flex items-center justify-center`}>
                                  <config.icon className={`w-5 h-5 ${config.textClass}`} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{emp.fullName}</p>
                                  <p className="text-xs text-muted-foreground">{emp.employeeId || emp.department || '—'}</p>
                                </div>
                              </div>
                              <Badge className={`text-[10px] ${config.badgeClass} border`}>
                                {config.label}
                              </Badge>
                            </div>

                            {/* Readiness Score */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">AI Readiness</span>
                                <span className="font-semibold">{emp.aiReadinessScore}%</span>
                              </div>
                              <Progress value={emp.aiReadinessScore} className="h-1.5" />
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="text-center p-1.5 rounded-lg bg-gray-50">
                                <p className="text-xs font-semibold">{emp.avgQuizScore}%</p>
                                <p className="text-[10px] text-muted-foreground">Quiz</p>
                              </div>
                              <div className="text-center p-1.5 rounded-lg bg-gray-50">
                                <p className="text-xs font-semibold">{emp.avgSimScore}%</p>
                                <p className="text-[10px] text-muted-foreground">Sim</p>
                              </div>
                              <div className="text-center p-1.5 rounded-lg bg-gray-50">
                                <p className="text-xs font-semibold">{emp.trainingProgress}%</p>
                                <p className="text-[10px] text-muted-foreground">Training</p>
                              </div>
                            </div>

                            {/* AI Recommendation Tag */}
                            <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg mb-3 text-xs bg-${aiTag.color}-50 text-${aiTag.color}-700`}>
                              <Sparkles className="w-3 h-3" />
                              <span className="font-medium">{aiTag.label}</span>
                              <span className="ml-auto text-[10px] opacity-70">{emp.confidence}% conf.</span>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip><TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={() => { setSelectedEmployee(emp); fetchEmployeeDetail(emp.id) }}>
                                    <Eye className="w-3 h-3" /> Detail
                                  </Button>
                                </TooltipTrigger><TooltipContent>View Details</TooltipContent></Tooltip>

                                {!emp.fieldReady && <Tooltip><TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={() => handlePromoteToField(emp.id)}>
                                    <MapPin className="w-3 h-3" /> Field
                                  </Button>
                                </TooltipTrigger><TooltipContent>Promote to Field</TooltipContent></Tooltip>}

                                {!emp.inboundReady && <Tooltip><TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={() => handlePromoteToInbound(emp.id)}>
                                    <Phone className="w-3 h-3" /> Inbound
                                  </Button>
                                </TooltipTrigger><TooltipContent>Promote to Inbound</TooltipContent></Tooltip>}

                                <Tooltip><TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={() => handleAssignTraining(emp.id)}>
                                    <BookOpen className="w-3 h-3" /> Train
                                  </Button>
                                </TooltipTrigger><TooltipContent>Assign Training</TooltipContent></Tooltip>
                              </TooltipProvider>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Department View */}
          <TabsContent value="department">
            {loading ? (
              <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedByDepartment).map(([dept, emps]) => (
                  <Card key={dept}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-emerald-600" />
                          {dept}
                          <Badge variant="secondary" className="text-[10px]">{emps.length} employees</Badge>
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-xs">
                          {emps.filter(e => e.fieldReady).length > 0 && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{emps.filter(e => e.fieldReady).length} Field</Badge>}
                          {emps.filter(e => e.inboundReady && !e.fieldReady).length > 0 && <Badge className="bg-teal-100 text-teal-700 text-[10px]">{emps.filter(e => e.inboundReady && !e.fieldReady).length} Inbound</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {emps.map(emp => {
                          const status = getEmployeeStatus(emp)
                          const config = STATUS_CONFIG[status]
                          return (
                            <div key={emp.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setSelectedEmployee(emp); fetchEmployeeDetail(emp.id) }}>
                              <div className={`w-8 h-8 rounded-full ${config.bgClass} flex items-center justify-center`}>
                                <User className={`w-4 h-4 ${config.textClass}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{emp.fullName}</p>
                                <p className="text-[10px] text-muted-foreground">{emp.aiReadinessScore}% ready</p>
                              </div>
                              <Progress value={emp.aiReadinessScore} className="w-12 h-1.5" />
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {Object.keys(groupedByDepartment).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No departments found</div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table">
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50/50">
                          <th className="text-left text-xs font-medium text-muted-foreground p-3">Employee</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden md:table-cell">Department</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3">AI Readiness</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden sm:table-cell">Quiz</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3 hidden sm:table-cell">Sim</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3">AI Suggestion</th>
                          <th className="text-left text-xs font-medium text-muted-foreground p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(emp => {
                          const status = getEmployeeStatus(emp)
                          const config = STATUS_CONFIG[status]
                          const aiTag = getAIRecommendationTag(emp)
                          return (
                            <tr key={emp.id} className="border-b hover:bg-gray-50/50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-full ${config.bgClass} flex items-center justify-center`}>
                                    <User className={`w-3.5 h-3.5 ${config.textClass}`} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{emp.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{emp.employeeId || '—'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-sm hidden md:table-cell">{emp.department || '—'}</td>
                              <td className="p-3"><Badge className={`text-[10px] ${config.badgeClass} border`}>{config.label}</Badge></td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Progress value={emp.aiReadinessScore} className="w-16 h-1.5" />
                                  <span className="text-xs font-medium">{emp.aiReadinessScore}%</span>
                                </div>
                              </td>
                              <td className="p-3 text-sm hidden sm:table-cell">{emp.avgQuizScore}%</td>
                              <td className="p-3 text-sm hidden sm:table-cell">{emp.avgSimScore}%</td>
                              <td className="p-3">
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-${aiTag.color}-50 text-${aiTag.color}-700`}>
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {aiTag.label}
                                </div>
                              </td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setSelectedEmployee(emp); fetchEmployeeDetail(emp.id) }}>
                                  <Eye className="w-3 h-3" /> View
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={(open) => { if (!open) { setSelectedEmployee(null); setDetailData(null) } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              {selectedEmployee?.fullName || 'Employee Detail'}
            </DialogTitle>
            <DialogDescription>AI readiness analysis and recommendations</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : detailData ? (
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium">{detailData.employee.department || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-muted-foreground">Current Level</p>
                  <p className="text-sm font-medium">{detailData.employee.currentLevel || 'Beginner'}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Quiz Score', value: `${detailData.metrics.avgQuizScore}%`, icon: Target, color: 'emerald' },
                  { label: 'Sim Score', value: `${detailData.metrics.avgSimScore}%`, icon: Zap, color: 'teal' },
                  { label: 'Training', value: `${detailData.metrics.trainingProgress}%`, icon: GraduationCap, color: 'amber' },
                  { label: 'Communication', value: `${detailData.metrics.avgCommunication}%`, icon: PhoneCall, color: 'blue' },
                  { label: 'Technical', value: `${detailData.metrics.avgTechnical}%`, icon: Shield, color: 'violet' },
                  { label: 'Sales', value: `${detailData.metrics.avgSales}%`, icon: TrendingUp, color: 'orange' },
                ].map(m => (
                  <div key={m.label} className="text-center p-2 rounded-lg bg-gray-50">
                    <m.icon className={`w-4 h-4 mx-auto text-${m.color}-500 mb-1`} />
                    <p className="text-sm font-bold">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* AI Recommendation */}
              {detailData.recommendation && (
                <div className="p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold">AI Recommendation</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto">{detailData.recommendation.confidence}% confidence</Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">{detailData.recommendation.verdict}</p>

                  {detailData.recommendation.reasoning.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning</p>
                      <ul className="space-y-1">
                        {detailData.recommendation.reasoning.map((r, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {detailData.recommendation.strengths.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-emerald-700 mb-1">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {detailData.recommendation.strengths.map((s, i) => (
                          <Badge key={i} className="bg-emerald-100 text-emerald-700 text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailData.recommendation.weaknesses.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-red-700 mb-1">Areas to Improve</p>
                      <div className="flex flex-wrap gap-1">
                        {detailData.recommendation.weaknesses.map((w, i) => (
                          <Badge key={i} className="bg-red-100 text-red-700 text-[10px]">{w}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailData.recommendation.suggestedModules.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-700 mb-1">Suggested Modules</p>
                      <div className="flex flex-wrap gap-1">
                        {detailData.recommendation.suggestedModules.map((m, i) => (
                          <Badge key={i} className="bg-amber-100 text-amber-700 text-[10px]">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailData.recommendation.deploymentReadiness && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded-lg ${detailData.recommendation.deploymentReadiness.field.ready ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <p className="text-xs font-medium">Field Readiness</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Progress value={detailData.recommendation.deploymentReadiness.field.score} className="h-1.5 flex-1" />
                          <span className="text-xs font-bold">{detailData.recommendation.deploymentReadiness.field.score}%</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg ${detailData.recommendation.deploymentReadiness.inbound.ready ? 'bg-teal-100' : 'bg-gray-100'}`}>
                        <p className="text-xs font-medium">Inbound Readiness</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Progress value={detailData.recommendation.deploymentReadiness.inbound.score} className="h-1.5 flex-1" />
                          <span className="text-xs font-bold">{detailData.recommendation.deploymentReadiness.inbound.score}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!selectedEmployee?.fieldReady && (
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => { handlePromoteToField(selectedEmployee!.id); setSelectedEmployee(null) }}>
                    <MapPin className="w-3.5 h-3.5" /> Promote to Field
                  </Button>
                )}
                {!selectedEmployee?.inboundReady && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { handlePromoteToInbound(selectedEmployee!.id); setSelectedEmployee(null) }}>
                    <Phone className="w-3.5 h-3.5" /> Promote to Inbound
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { handleAssignTraining(selectedEmployee!.id); setSelectedEmployee(null) }}>
                  <BookOpen className="w-3.5 h-3.5" /> Assign Training
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
