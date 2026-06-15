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
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Brain, Search, Sparkles, Shield, PhoneCall, MapPin, GraduationCap,
  CheckCircle2, AlertTriangle, RotateCcw, Users, Target, TrendingUp,
  Award, MessageSquare, ChevronRight, Loader2, ArrowRight, BarChart3,
  BookOpen, Send, Zap, User, AlertCircle, Clock, Compass,
  Rocket, Phone, Eye,
} from 'lucide-react'
import { toast } from 'sonner'

interface EmployeeOption {
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
  aiRawResponse: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

export function AIDeploymentAdvisor() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [summary, setSummary] = useState<BatchSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [detailData, setDetailData] = useState<EmployeeDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRec, setFilterRec] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [promoting, setPromoting] = useState(false)

  const fetchBatch = useCallback(async () => {
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

  useEffect(() => { fetchBatch() }, [fetchBatch])

  const fetchDetail = useCallback(async (empId: string) => {
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

  const handleAnalyze = () => {
    if (!selectedEmployee) return
    fetchDetail(selectedEmployee)
    setActiveTab('analysis')
  }

  const handlePromote = async (empId: string, fieldReady: boolean, inboundReady: boolean) => {
    setPromoting(true)
    try {
      const res = await fetch('/api/admin/ai-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, fieldReady, inboundReady }),
      })
      if (res.ok) {
        toast.success(fieldReady ? 'Promoted to field-ready' : 'Promoted to inbound-ready')
        fetchBatch()
        if (selectedEmployee === empId) fetchDetail(empId)
      } else {
        toast.error('Failed to update')
      }
    } catch { toast.error('Network error') }
    setPromoting(false)
  }

  const handleAssignTraining = async (empId: string, modules?: string[]) => {
    setPromoting(true)
    try {
      const assignedTraining = (modules || ['Product Knowledge Fundamentals']).map(m => ({
        title: m,
        description: `Assigned based on AI readiness analysis`,
        type: 'retraining',
      }))
      const res = await fetch('/api/admin/ai-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, assignedTraining }),
      })
      if (res.ok) {
        toast.success('Training assigned successfully')
        fetchBatch()
      }
    } catch { toast.error('Failed to assign') }
    setPromoting(false)
  }

  const handleBatchPromote = async (type: 'field' | 'inbound') => {
    const eligible = employees.filter(e =>
      type === 'field'
        ? e.recommendation.includes('Ready for Field') && !e.fieldReady
        : e.recommendation.includes('Ready for Inbound') && !e.inboundReady
    )
    if (eligible.length === 0) { toast.info('No eligible employees'); return }
    setPromoting(true)
    try {
      await Promise.all(eligible.map(e =>
        fetch('/api/admin/ai-deployment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: e.id, fieldReady: type === 'field', inboundReady: type === 'inbound' }),
        })
      ))
      toast.success(`${eligible.length} employees promoted to ${type}-ready`)
      fetchBatch()
    } catch { toast.error('Batch promotion failed') }
    setPromoting(false)
  }

  // Grouped by recommendation
  const fieldReadyGroup = employees.filter(e => e.recommendation.includes('Ready for Field'))
  const inboundReadyGroup = employees.filter(e => e.recommendation.includes('Ready for Inbound') && !e.recommendation.includes('Ready for Field'))
  const transitionGroup = employees.filter(e => e.recommendation.includes('Start with Inbound'))
  const needsTrainingGroup = employees.filter(e => e.recommendation.includes('Needs More Training'))

  // Risk assessment: employees with declining or very low scores
  const atRiskEmployees = employees.filter(e => e.aiReadinessScore < 40 || (e.avgQuizScore < 40 && e.avgSimScore < 40))

  // Filter for search
  const filteredEmployees = employees.filter(e => {
    const matchSearch = !searchTerm || e.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchFilter = filterRec === 'all' || e.recommendation.includes(filterRec)
    return matchSearch && matchFilter
  })

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              AI Deployment Advisor
            </h1>
            <p className="text-gray-500 mt-1 ml-13">AI-powered readiness analysis & deployment recommendations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchBatch} className="gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Refresh Analysis
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1.5"><Brain className="w-3.5 h-3.5" /> Individual Analysis</TabsTrigger>
            <TabsTrigger value="risk" className="gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Risk Assessment</TabsTrigger>
            <TabsTrigger value="training" className="gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Training Recs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-5">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Total Employees', value: summary.total, icon: Users, bg: 'bg-gray-100', text: 'text-gray-700' },
                  { label: 'Field Ready', value: summary.fieldReady, icon: MapPin, bg: 'bg-emerald-100', text: 'text-emerald-700' },
                  { label: 'Inbound Ready', value: summary.inboundReady, icon: Phone, bg: 'bg-teal-100', text: 'text-teal-700' },
                  { label: 'Transition', value: summary.transition, icon: ArrowRight, bg: 'bg-amber-100', text: 'text-amber-700' },
                  { label: 'Needs Training', value: summary.needsTraining, icon: BookOpen, bg: 'bg-red-100', text: 'text-red-700' },
                ].map(s => (
                  <Card key={s.label} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                        <s.icon className={`w-4 h-4 ${s.text}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-bold">{s.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Batch Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Field Ready Group */}
              <Card className="border-emerald-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-emerald-600" /></div>
                      Ready for Field Deployment
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700">{fieldReadyGroup.length}</Badge>
                      {fieldReadyGroup.some(e => !e.fieldReady) && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => handleBatchPromote('field')} disabled={promoting}>
                          <Zap className="w-3 h-3" /> Batch Promote
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {fieldReadyGroup.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No employees ready for field</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {fieldReadyGroup.map(e => (
                        <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer" onClick={() => { setSelectedEmployee(e.id); fetchDetail(e.id); setActiveTab('analysis') }}>
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{e.fullName}</p>
                            <p className="text-[10px] text-muted-foreground">{e.department || '—'} · {e.aiReadinessScore}%</p>
                          </div>
                          {e.fieldReady ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge> : <Badge className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inbound Ready Group */}
              <Card className="border-teal-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 bg-teal-100 rounded-md flex items-center justify-center"><Phone className="w-3.5 h-3.5 text-teal-600" /></div>
                      Ready for Inbound Calls
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-teal-100 text-teal-700">{inboundReadyGroup.length}</Badge>
                      {inboundReadyGroup.some(e => !e.inboundReady) && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => handleBatchPromote('inbound')} disabled={promoting}>
                          <Zap className="w-3 h-3" /> Batch Promote
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {inboundReadyGroup.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No employees ready for inbound</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {inboundReadyGroup.map(e => (
                        <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer" onClick={() => { setSelectedEmployee(e.id); fetchDetail(e.id); setActiveTab('analysis') }}>
                          <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center"><Phone className="w-3 h-3 text-white" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{e.fullName}</p>
                            <p className="text-[10px] text-muted-foreground">{e.department || '—'} · {e.aiReadinessScore}%</p>
                          </div>
                          {e.inboundReady ? <Badge className="bg-teal-100 text-teal-700 text-[10px]">Active</Badge> : <Badge className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transition Group */}
              <Card className="border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center"><ArrowRight className="w-3.5 h-3.5 text-amber-600" /></div>
                    Start Inbound → Transition to Field
                    <Badge className="bg-amber-100 text-amber-700 ml-auto">{transitionGroup.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transitionGroup.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No employees in transition</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {transitionGroup.map(e => (
                        <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer" onClick={() => { setSelectedEmployee(e.id); fetchDetail(e.id); setActiveTab('analysis') }}>
                          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-white" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{e.fullName}</p>
                            <p className="text-[10px] text-muted-foreground">{e.department || '—'} · {e.aiReadinessScore}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Needs Training Group */}
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-red-600" /></div>
                    Needs More Training
                    <Badge className="bg-red-100 text-red-700 ml-auto">{needsTrainingGroup.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {needsTrainingGroup.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">All employees on track</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {needsTrainingGroup.map(e => (
                        <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" onClick={() => { setSelectedEmployee(e.id); fetchDetail(e.id); setActiveTab('analysis') }}>
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"><AlertCircle className="w-3 h-3 text-white" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{e.fullName}</p>
                            <p className="text-[10px] text-muted-foreground">{e.department || '—'} · {e.aiReadinessScore}%</p>
                          </div>
                          <Button size="sm" variant="outline" className="h-5 text-[10px] gap-1" onClick={(ev) => { ev.stopPropagation(); handleAssignTraining(e.id) }}>
                            <BookOpen className="w-2.5 h-2.5" /> Train
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Individual Analysis Tab */}
          <TabsContent value="analysis" className="space-y-5">
            {/* Employee Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee to analyze..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            <span className="flex items-center gap-2">
                              {e.fullName}
                              <span className="text-muted-foreground">({e.aiReadinessScore}%)</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAnalyze} disabled={!selectedEmployee || detailLoading} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    {detailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Analyze with AI
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {detailData && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Employee Info + Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="lg:col-span-1">
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold">{detailData.employee.fullName || 'Unknown'}</h3>
                      <p className="text-xs text-muted-foreground">{detailData.employee.designation || 'Employee'}</p>
                      <p className="text-xs text-muted-foreground">{detailData.employee.department || 'No Department'}</p>
                      <Separator className="my-3" />
                      <div className="flex justify-center gap-2">
                        {detailData.employee.fieldReady && <Badge className="bg-emerald-100 text-emerald-700"><MapPin className="w-3 h-3 mr-1" />Field</Badge>}
                        {detailData.employee.inboundReady && <Badge className="bg-teal-100 text-teal-700"><Phone className="w-3 h-3 mr-1" />Inbound</Badge>}
                        {!detailData.employee.fieldReady && !detailData.employee.inboundReady && <Badge className="bg-amber-100 text-amber-700"><GraduationCap className="w-3 h-3 mr-1" />Training</Badge>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metrics */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-600" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'AI Readiness', value: detailData.employee.aiReadinessScore, color: 'emerald' },
                          { label: 'Quiz Score', value: detailData.metrics.avgQuizScore, color: 'teal' },
                          { label: 'Sim Score', value: detailData.metrics.avgSimScore, color: 'blue' },
                          { label: 'Communication', value: detailData.metrics.avgCommunication, color: 'violet' },
                          { label: 'Technical', value: detailData.metrics.avgTechnical, color: 'amber' },
                          { label: 'Sales', value: detailData.metrics.avgSales, color: 'orange' },
                          { label: 'Product Knowledge', value: detailData.metrics.avgProductKnowledge, color: 'cyan' },
                          { label: 'Training Progress', value: detailData.metrics.trainingProgress, color: 'emerald' },
                          { label: 'Module Completion', value: detailData.metrics.totalModules > 0 ? Math.round((detailData.metrics.completedModules / detailData.metrics.totalModules) * 100) : 0, color: 'teal' },
                        ].map(m => (
                          <div key={m.label} className="p-2 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-muted-foreground">{m.label}</span>
                              <span className="text-xs font-bold">{m.value}%</span>
                            </div>
                            <Progress value={m.value} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Recommendation Card */}
                {detailData.recommendation && (
                  <Card className="border-amber-200 bg-gradient-to-br from-amber-50/30 to-orange-50/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        AI Deployment Recommendation
                        <Badge variant="secondary" className="ml-auto">{detailData.recommendation.confidence}% confidence</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Verdict */}
                      <div className="p-3 rounded-xl bg-white/80 border border-amber-100">
                        <p className="text-base font-semibold">{detailData.recommendation.verdict}</p>
                      </div>

                      {/* Deployment Readiness Bars */}
                      {detailData.recommendation.deploymentReadiness && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-xl ${detailData.recommendation.deploymentReadiness.field.ready ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className={`w-4 h-4 ${detailData.recommendation.deploymentReadiness.field.ready ? 'text-emerald-600' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium">Field Readiness</span>
                              {detailData.recommendation.deploymentReadiness.field.ready && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                            </div>
                            <Progress value={detailData.recommendation.deploymentReadiness.field.score} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{detailData.recommendation.deploymentReadiness.field.score}%</p>
                          </div>
                          <div className={`p-3 rounded-xl ${detailData.recommendation.deploymentReadiness.inbound.ready ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Phone className={`w-4 h-4 ${detailData.recommendation.deploymentReadiness.inbound.ready ? 'text-teal-600' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium">Inbound Readiness</span>
                              {detailData.recommendation.deploymentReadiness.inbound.ready && <CheckCircle2 className="w-4 h-4 text-teal-500 ml-auto" />}
                            </div>
                            <Progress value={detailData.recommendation.deploymentReadiness.inbound.score} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{detailData.recommendation.deploymentReadiness.inbound.score}%</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Reasoning */}
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">Reasoning</p>
                          <ul className="space-y-1">
                            {detailData.recommendation.reasoning.map((r, i) => (
                              <li key={i} className="text-xs flex items-start gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {r}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="space-y-3">
                          {detailData.recommendation.strengths.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-emerald-700 mb-1">Strengths</p>
                              <div className="flex flex-wrap gap-1">
                                {detailData.recommendation.strengths.map((s, i) => (
                                  <Badge key={i} className="bg-emerald-100 text-emerald-700 text-[10px]">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {detailData.recommendation.weaknesses.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-red-700 mb-1">Areas to Improve</p>
                              <div className="flex flex-wrap gap-1">
                                {detailData.recommendation.weaknesses.map((w, i) => (
                                  <Badge key={i} className="bg-red-100 text-red-700 text-[10px]">{w}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Suggested Modules */}
                      {detailData.recommendation.suggestedModules.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-700 mb-2">Recommended Training Modules</p>
                          <div className="flex flex-wrap gap-2">
                            {detailData.recommendation.suggestedModules.map((m, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                                <BookOpen className="w-3 h-3 text-amber-600" />
                                {m}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        {!detailData.employee.fieldReady && (
                          <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePromote(detailData.employee.id, true, detailData.employee.inboundReady)} disabled={promoting}>
                            <MapPin className="w-3.5 h-3.5" /> Promote to Field
                          </Button>
                        )}
                        {!detailData.employee.inboundReady && (
                          <Button size="sm" variant="outline" className="gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50" onClick={() => handlePromote(detailData.employee.id, detailData.employee.fieldReady, true)} disabled={promoting}>
                            <Phone className="w-3.5 h-3.5" /> Promote to Inbound
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleAssignTraining(detailData.employee.id, detailData.recommendation?.suggestedModules)} disabled={promoting}>
                          <GraduationCap className="w-3.5 h-3.5" /> Assign Recommended Training
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {!detailData && !detailLoading && (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-amber-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an Employee</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Choose an employee above and click &quot;Analyze with AI&quot; to get a detailed AI-powered deployment recommendation.
                  </p>
                </CardContent>
              </Card>
            )}

            {detailLoading && (
              <div className="space-y-3">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            )}
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-5">
            <Card className="border-red-200 bg-gradient-to-br from-red-50/30 to-orange-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Risk Assessment
                  <Badge className="bg-red-100 text-red-700 ml-2">{atRiskEmployees.length} at risk</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Employees with AI readiness below 40% or both quiz and simulation scores below 40% may need additional support.
                </p>
                {atRiskEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm text-emerald-600 font-medium">No employees at risk</p>
                    <p className="text-xs text-muted-foreground">All employees are performing above minimum thresholds</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {atRiskEmployees.map(e => (
                      <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-red-100 hover:shadow-sm transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{e.fullName}</p>
                          <p className="text-xs text-muted-foreground">{e.department || 'No Dept'}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-[10px] text-red-600">Readiness: {e.aiReadinessScore}%</span>
                            <span className="text-[10px] text-red-600">Quiz: {e.avgQuizScore}%</span>
                            <span className="text-[10px] text-red-600">Sim: {e.avgSimScore}%</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => { setSelectedEmployee(e.id); fetchDetail(e.id); setActiveTab('analysis') }}>
                            <Eye className="w-3 h-3" /> Analyze
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleAssignTraining(e.id)}>
                            <BookOpen className="w-3 h-3" /> Assign Training
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warnings / Recommendations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Caution Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {employees.filter(e => e.aiReadinessScore >= 40 && e.aiReadinessScore < 60).length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{employees.filter(e => e.aiReadinessScore >= 40 && e.aiReadinessScore < 60).length} employees in the &quot;caution zone&quot; (40-60% readiness)</p>
                    </div>
                  )}
                  {employees.filter(e => e.avgQuizScore < 50).length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{employees.filter(e => e.avgQuizScore < 50).length} employees have quiz scores below 50%</p>
                    </div>
                  )}
                  {employees.filter(e => e.trainingProgress < 50).length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{employees.filter(e => e.trainingProgress < 50).length} employees have less than 50% training completion</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-emerald-600" />
                    Quick Wins
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {transitionGroup.length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{transitionGroup.length} employees could be inbound-ready with minimal coaching</p>
                    </div>
                  )}
                  {employees.filter(e => e.aiReadinessScore >= 60 && e.aiReadinessScore < 70).length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs">{employees.filter(e => e.aiReadinessScore >= 60 && e.aiReadinessScore < 70).length} employees near field-ready threshold (60-70%)</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Training Recommendations Tab */}
          <TabsContent value="training" className="space-y-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  Training Recommendations by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Product Knowledge */}
                  <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center"><Shield className="w-4 h-4 text-teal-600" /></div>
                      <div>
                        <p className="text-sm font-semibold">Product Knowledge</p>
                        <p className="text-[10px] text-muted-foreground">Employees with low product scores</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-teal-700">{employees.filter(e => e.avgQuizScore < 70).length}</p>
                    <p className="text-xs text-muted-foreground mb-2">employees need product training</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                      {employees.filter(e => e.avgQuizScore < 70).slice(0, 5).map(e => (
                        <div key={e.id} className="flex items-center justify-between text-xs p-1 rounded bg-white/60">
                          <span className="truncate">{e.fullName}</span>
                          <span className="text-red-600 font-medium">{e.avgQuizScore}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Practice */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><PhoneCall className="w-4 h-4 text-amber-600" /></div>
                      <div>
                        <p className="text-sm font-semibold">Mock Practice</p>
                        <p className="text-[10px] text-muted-foreground">Employees with low simulation scores</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">{employees.filter(e => e.avgSimScore < 60).length}</p>
                    <p className="text-xs text-muted-foreground mb-2">employees need mock practice</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                      {employees.filter(e => e.avgSimScore < 60).slice(0, 5).map(e => (
                        <div key={e.id} className="flex items-center justify-between text-xs p-1 rounded bg-white/60">
                          <span className="truncate">{e.fullName}</span>
                          <span className="text-red-600 font-medium">{e.avgSimScore}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sales Coaching */}
                  <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-violet-600" /></div>
                      <div>
                        <p className="text-sm font-semibold">Sales Coaching</p>
                        <p className="text-[10px] text-muted-foreground">Employees needing sales skills</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-violet-700">{needsTrainingGroup.length}</p>
                    <p className="text-xs text-muted-foreground mb-2">employees need sales coaching</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                      {needsTrainingGroup.slice(0, 5).map(e => (
                        <div key={e.id} className="flex items-center justify-between text-xs p-1 rounded bg-white/60">
                          <span className="truncate">{e.fullName}</span>
                          <span className="text-red-600 font-medium">{e.aiReadinessScore}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Batch Assign */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Batch Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleBatchPromote('field')} disabled={promoting}>
                    <MapPin className="w-3.5 h-3.5" /> Promote All Field-Ready ({fieldReadyGroup.filter(e => !e.fieldReady).length})
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleBatchPromote('inbound')} disabled={promoting}>
                    <Phone className="w-3.5 h-3.5" /> Promote All Inbound-Ready ({inboundReadyGroup.filter(e => !e.inboundReady).length})
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={async () => {
                    if (needsTrainingGroup.length === 0) { toast.info('No employees need training'); return }
                    setPromoting(true)
                    try {
                      await Promise.all(needsTrainingGroup.map(e => handleAssignTraining(e.id)))
                      toast.success(`Training assigned to ${needsTrainingGroup.length} employees`)
                    } catch { toast.error('Failed') }
                    setPromoting(false)
                  }} disabled={promoting}>
                    <GraduationCap className="w-3.5 h-3.5" /> Assign Training to All ({needsTrainingGroup.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
