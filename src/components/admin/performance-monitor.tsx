'use client'

import { useEffect, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3, Search, Filter, ChevronDown, ChevronUp, Users, Shield, PhoneCall,
  TrendingUp, Award, Brain, Target, CheckCircle2, AlertCircle, Clock, GraduationCap,
  MonitorPlay, ArrowUpDown,
} from 'lucide-react'

interface EmployeePerformance {
  id: string
  fullName: string | null
  email: string
  employeeId: string | null
  designation: string | null
  department: string | null
  aiReadinessScore: number
  currentLevel: string
  fieldReady: boolean
  inboundReady: boolean
  trainingProgress: number
  avgQuizScore: number
  avgSimScore: number
  avgCommunication: number
  avgTechnical: number
  avgProductKnowledge: number
  avgSales: number
  moduleCompletionRate: number
  totalEnrollments: number
  completedModules: number
  totalModules: number
  lastActive: string | null
  enrollments: { courseTitle: string; moduleType: string; progress: number; status: string }[]
  recentQuizAttempts: { id: string; score: number; passed: boolean; totalMarks: number; completedAt: string | null }[]
  recentSimAttempts: { id: string; score: number; communicationScore: number; technicalScore: number; productKnowledgeScore: number; salesScore: number; completedAt: string | null }[]
}

interface PerformanceSummary {
  totalEmployees: number
  avgReadiness: number
  fieldReadyCount: number
  inboundReadyCount: number
  highReadiness: number
  mediumReadiness: number
  lowReadiness: number
  avgQuizScore: number
  avgSimScore: number
}

function ReadinessBadge({ score }: { score: number }) {
  if (score >= 70) return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">{score}%</Badge>
  if (score >= 40) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">{score}%</Badge>
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">{score}%</Badge>
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: 'bg-gray-100 text-gray-700',
    Intermediate: 'bg-teal-100 text-teal-700',
    Advanced: 'bg-emerald-100 text-emerald-700',
  }
  return <Badge className={colors[level] || 'bg-gray-100 text-gray-700'} variant="secondary">{level}</Badge>
}

function StatusBadge({ fieldReady, inboundReady }: { fieldReady: boolean; inboundReady: boolean }) {
  if (fieldReady && inboundReady) {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">Field + Inbound</Badge>
  }
  if (fieldReady) {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">Field Ready</Badge>
  }
  if (inboundReady) {
    return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-xs">Inbound Ready</Badge>
  }
  return <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-xs">Not Ready</Badge>
}

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

export function PerformanceMonitor() {
  const [employees, setEmployees] = useState<EmployeePerformance[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [readinessFilter, setReadinessFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>('aiReadinessScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [, startTransition] = useTransition()

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (deptFilter !== 'all') params.set('department', deptFilter)
    if (readinessFilter !== 'all') params.set('readiness', readinessFilter)

    fetch(`/api/admin/performance?${params.toString()}&_t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.employees) {
          startTransition(() => {
            setEmployees(data.employees)
            setDepartments(data.departments || [])
            setSummary(data.summary)
            setLoading(false)
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          startTransition(() => setLoading(false))
        }
      })
    return () => { cancelled = true }
  }, [search, deptFilter, readinessFilter, startTransition, refreshKey])

  const handleRefresh = () => setRefreshKey(k => k + 1)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sortedEmployees = [...employees].sort((a, b) => {
    const aVal = (a as any)[sortField] || 0
    const bVal = (b as any)[sortField] || 0
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-4"><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          Employee Performance Monitor
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Comprehensive view of all employee performance and readiness metrics</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Employees</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Avg Readiness</p>
                <p className="text-2xl font-bold text-emerald-800">{summary.avgReadiness}%</p>
                <p className="text-xs text-emerald-600">Across all</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700 uppercase">Field Ready</p>
                </div>
                <p className="text-2xl font-bold text-emerald-800">{summary.fieldReadyCount}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-teal-200 bg-teal-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-teal-600" />
                  <p className="text-xs font-medium text-teal-700 uppercase">Inbound Ready</p>
                </div>
                <p className="text-2xl font-bold text-teal-800">{summary.inboundReadyCount}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Mid Range</p>
                <p className="text-2xl font-bold text-amber-800">{summary.mediumReadiness}</p>
                <p className="text-xs text-amber-600">40-69% score</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-red-700 uppercase tracking-wider">Low</p>
                <p className="text-2xl font-bold text-red-800">{summary.lowReadiness}</p>
                <p className="text-xs text-red-600">&lt;40% score</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={readinessFilter} onValueChange={setReadinessFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Readiness" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Readiness</SelectItem>
                <SelectItem value="high">High (70%+)</SelectItem>
                <SelectItem value="medium">Medium (40-69%)</SelectItem>
                <SelectItem value="low">Low (&lt;40%)</SelectItem>
                <SelectItem value="field_ready">Field Ready</SelectItem>
                <SelectItem value="inbound_ready">Inbound Ready</SelectItem>
                <SelectItem value="not_ready">Not Ready</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <Filter className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-8"></TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort('fullName')}>
                      Employee <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort('aiReadinessScore')}>
                      AI Score <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort('trainingProgress')}>
                      Training <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Quiz Avg</TableHead>
                  <TableHead className="hidden xl:table-cell">Sim Avg</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p>No employees found matching your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedEmployees.map((emp) => (
                  <ExpandableRow
                    key={emp.id}
                    employee={emp}
                    isExpanded={expandedId === emp.id}
                    onToggle={() => toggleExpand(emp.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {sortedEmployees.length} employee{sortedEmployees.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function ExpandableRow({
  employee,
  isExpanded,
  onToggle,
}: {
  employee: EmployeePerformance
  isExpanded: boolean
  onToggle: () => void
}) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return d.toLocaleDateString()
  }

  return (
    <>
      <TableRow
        className={`cursor-pointer hover:bg-gray-50/80 transition-colors ${isExpanded ? 'bg-emerald-50/30' : ''}`}
        onClick={onToggle}
      >
        <TableCell>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              employee.aiReadinessScore >= 70 ? 'bg-emerald-500' :
              employee.aiReadinessScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
            }`}>
              {(employee.fullName || employee.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{employee.fullName || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{employee.employeeId} {employee.department ? `· ${employee.department}` : ''}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden md:table-cell text-sm text-gray-600">{employee.email}</TableCell>
        <TableCell>
          <ReadinessBadge score={employee.aiReadinessScore} />
        </TableCell>
        <TableCell><LevelBadge level={employee.currentLevel} /></TableCell>
        <TableCell className="hidden lg:table-cell">
          <div className="flex items-center gap-2">
            <Progress value={employee.trainingProgress} className="h-2 w-16" />
            <span className="text-xs text-muted-foreground">{employee.trainingProgress}%</span>
          </div>
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          <span className={`text-sm font-medium ${
            employee.avgQuizScore >= 70 ? 'text-emerald-600' :
            employee.avgQuizScore >= 40 ? 'text-amber-600' : 'text-red-500'
          }`}>
            {employee.avgQuizScore}%
          </span>
        </TableCell>
        <TableCell className="hidden xl:table-cell">
          <span className={`text-sm font-medium ${
            employee.avgSimScore >= 70 ? 'text-emerald-600' :
            employee.avgSimScore >= 40 ? 'text-amber-600' : 'text-red-500'
          }`}>
            {employee.avgSimScore}%
          </span>
        </TableCell>
        <TableCell><StatusBadge fieldReady={employee.fieldReady} inboundReady={employee.inboundReady} /></TableCell>
        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(employee.lastActive)}
          </div>
        </TableCell>
      </TableRow>
      {/* Expanded Detail Row */}
      <TableRow>
        <TableCell colSpan={11} className="p-0 border-0">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Score Breakdown */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4 text-emerald-600" /> Score Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ScoreBar value={employee.aiReadinessScore} label="AI Readiness" color="bg-emerald-500" />
                        <ScoreBar value={employee.avgQuizScore} label="Quiz Average" color="bg-teal-500" />
                        <ScoreBar value={employee.avgSimScore} label="Simulation Average" color="bg-emerald-600" />
                        <Separator className="my-2" />
                        <ScoreBar value={employee.avgCommunication} label="Communication" color="bg-amber-500" />
                        <ScoreBar value={employee.avgTechnical} label="Technical" color="bg-teal-500" />
                        <ScoreBar value={employee.avgProductKnowledge} label="Product Knowledge" color="bg-emerald-500" />
                        <ScoreBar value={employee.avgSales} label="Sales Skills" color="bg-emerald-600" />
                      </CardContent>
                    </Card>

                    {/* Training Progress */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-emerald-600" /> Training Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Overall Progress</span>
                          <span className="text-sm font-bold text-emerald-700">{employee.trainingProgress}%</span>
                        </div>
                        <Progress value={employee.trainingProgress} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{employee.completedModules} of {employee.totalModules} modules complete</span>
                          <span>{employee.totalEnrollments} courses</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                          {employee.enrollments.slice(0, 8).map((e, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 truncate max-w-[180px]">{e.courseTitle}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={e.progress} className="h-1.5 w-12" />
                                <span className="text-xs text-muted-foreground w-8 text-right">{e.progress}%</span>
                              </div>
                            </div>
                          ))}
                          {employee.enrollments.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">No enrollments yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <MonitorPlay className="w-4 h-4 text-emerald-600" /> Recent Simulations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {employee.recentSimAttempts.length > 0 ? employee.recentSimAttempts.map((s, i) => (
                          <div key={i} className="p-2 bg-white rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-800">Attempt {i + 1}</span>
                              <Badge variant={s.score >= 70 ? 'default' : 'secondary'} className={`text-xs ${s.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {s.score}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                              <span>Comm: {s.communicationScore}%</span>
                              <span>Tech: {s.technicalScore}%</span>
                              <span>Product: {s.productKnowledgeScore}%</span>
                              <span>Sales: {s.salesScore}%</span>
                            </div>
                          </div>
                        )) : (
                          <div className="flex flex-col items-center py-6 text-muted-foreground">
                            <MonitorPlay className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-xs">No simulations completed</p>
                          </div>
                        )}
                        <Separator className="my-2" />
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 mt-3">
                          <Award className="w-4 h-4 text-emerald-600" /> Recent Quizzes
                        </CardTitle>
                        {employee.recentQuizAttempts.length > 0 ? employee.recentQuizAttempts.slice(0, 3).map((q, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-gray-100">
                            <span className="text-xs text-gray-700">Quiz {i + 1}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{q.score}%</span>
                              {q.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-red-400" />}
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-muted-foreground text-center py-2">No quiz attempts</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TableCell>
      </TableRow>
    </>
  )
}
