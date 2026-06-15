'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3, Download, FileText, Users, GraduationCap, Award, TrendingUp,
  ClipboardCheck, Target, MonitorPlay, Brain, Building2, Search, Calendar,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Filter, Eye
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const REPORT_TYPES = [
  { id: 'employee', title: 'Employee Performance Report', desc: 'Comprehensive overview of employee scores, certifications, and readiness', icon: Users, color: 'bg-emerald-600' },
  { id: 'training', title: 'Training Completion Report', desc: 'Course enrollment, progress, and completion rates across departments', icon: GraduationCap, color: 'bg-teal-600' },
  { id: 'assessment', title: 'Assessment Results Report', desc: 'Assessment scores, pass rates, and score distribution analysis', icon: ClipboardCheck, color: 'bg-emerald-500' },
  { id: 'certification', title: 'Certification Status Report', desc: 'Certification attempts, approvals, and expiry tracking', icon: Award, color: 'bg-emerald-700' },
  { id: 'department', title: 'Department Analytics Report', desc: 'Department-wise performance comparison and trends', icon: Building2, color: 'bg-teal-500' },
  { id: 'simulation', title: 'Mock Simulation Report', desc: 'Simulation participation, scores, and skill breakdowns', icon: MonitorPlay, color: 'bg-amber-500' },
  { id: 'readiness', title: 'Field Readiness Report', desc: 'Employee readiness status for field and inbound operations', icon: Target, color: 'bg-emerald-600' },
  { id: 'ai', title: 'AI Coaching Impact Report', desc: 'AI coaching session analytics and improvement metrics', icon: Brain, color: 'bg-teal-700' },
]

const SCORE_DISTRIBUTION = [
  { range: '0-20%', count: 2 },
  { range: '21-40%', count: 5 },
  { range: '41-60%', count: 12 },
  { range: '61-80%', count: 18 },
  { range: '81-100%', count: 8 },
]

const CERT_PIE = [
  { name: 'Certified', value: 42, color: '#059669' },
  { name: 'Pending', value: 25, color: '#F59E0B' },
  { name: 'Not Started', value: 33, color: '#D1D5DB' },
]

const MONTHLY_TREND = [
  { month: 'Jan', score: 52 }, { month: 'Feb', score: 55 }, { month: 'Mar', score: 58 },
  { month: 'Apr', score: 62 }, { month: 'May', score: 65 }, { month: 'Jun', score: 68 },
  { month: 'Jul', score: 72 }, { month: 'Aug', score: 74 }, { month: 'Sep', score: 71 },
  { month: 'Oct', score: 76 }, { month: 'Nov', score: 78 }, { month: 'Dec', score: 80 },
]

interface ModuleScoreEmployee {
  id: string
  fullName: string | null
  email: string
  employeeId: string | null
  designation: string | null
  department: string | null
  currentLevel: string | null
  aiReadinessScore: number
  moduleScores: Array<{
    moduleId: string
    moduleTitle: string
    completed: boolean
    score: number | null
    completedAt: string | null
  }>
  quizAttempts: Array<{
    id: string
    assessmentTitle: string
    score: number
    passed: boolean
    completedAt: string | null
  }>
}

export function ReportsView() {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)
  const [moduleScores, setModuleScores] = useState<ModuleScoreEmployee[]>([])
  const [moduleList, setModuleList] = useState<Array<{ id: string; title: string; courseTitle: string; courseType: string; order: number }>>([])
  const [scoresLoading, setScoresLoading] = useState(true)
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  // Fetch module scores
  useEffect(() => {
    const fetchModuleScores = async () => {
      try {
        const res = await fetch('/api/admin-scores?viewType=module-scores')
        if (res.ok) {
          const json = await res.json()
          setModuleScores(json.employees || [])
          setModuleList(json.modules || [])
        }
      } catch (err) {
        console.error('Failed to fetch module scores:', err)
      } finally {
        setScoresLoading(false)
      }
    }
    fetchModuleScores()
  }, [])

  const handleExport = (reportId: string) => {
    setExporting(reportId)
    setTimeout(() => {
      const csvContent = `Report: ${reportId}\nGenerated: ${new Date().toISOString()}\nStatus: Exported successfully`
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laxree-${reportId}-report.csv`
      a.click()
      URL.revokeObjectURL(url)
      setExporting(null)
    }, 1000)
  }

  // Export module scores as CSV
  const exportModuleScores = () => {
    if (moduleScores.length === 0) return
    const headers = ['Employee', 'Employee ID', 'Department', ...moduleList.map(m => m.title)]
    const rows = moduleScores.map(emp => {
      const scoreMap: Record<string, string> = {}
      emp.moduleScores.forEach(ms => {
        scoreMap[ms.moduleId] = ms.completed ? `${ms.score || 0}%` : '-'
      })
      return [
        emp.fullName || 'Unknown',
        emp.employeeId || '-',
        emp.department || '-',
        ...moduleList.map(m => scoreMap[m.id] || '-')
      ]
    })
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laxree-module-scores-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter employees
  const filteredEmployees = moduleScores.filter(e =>
    !searchQuery ||
    e.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          Reports & Module Scores
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Track employee progress, quiz scores, and generate detailed reports</p>
      </div>

      <Tabs defaultValue="module-scores">
        <TabsList className="w-full">
          <TabsTrigger value="module-scores" className="flex-1">
            <ClipboardCheck className="w-4 h-4 mr-1" /> Module Scores
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1">
            <FileText className="w-4 h-4 mr-1" /> Report Generator
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-1" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* Module Scores Tab */}
        <TabsContent value="module-scores" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, employee ID, or department..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={exportModuleScores} disabled={scoresLoading} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>

          {scoresLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No employee data found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((emp) => {
                const isExpanded = expandedEmployee === emp.id
                const completedModules = emp.moduleScores.filter(ms => ms.completed).length
                const totalModules = emp.moduleScores.length
                const avgScore = emp.moduleScores.filter(ms => ms.score !== null).length > 0
                  ? Math.round(emp.moduleScores.filter(ms => ms.score !== null).reduce((a, ms) => a + (ms.score || 0), 0) / emp.moduleScores.filter(ms => ms.score !== null).length)
                  : 0
                const passedQuizzes = emp.quizAttempts.filter(q => q.passed).length

                return (
                  <Card key={emp.id} className="overflow-hidden">
                    <CardContent
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          avgScore >= 70 ? 'bg-emerald-100' : avgScore >= 50 ? 'bg-amber-100' : 'bg-gray-100'
                        }`}>
                          <span className={`text-sm font-bold ${
                            avgScore >= 70 ? 'text-emerald-600' : avgScore >= 50 ? 'text-amber-600' : 'text-gray-500'
                          }`}>
                            {avgScore > 0 ? `${avgScore}%` : '-'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{emp.fullName || 'Unknown'}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{emp.employeeId}</span>
                            <span>·</span>
                            <span>{emp.department || 'No dept'}</span>
                            <span>·</span>
                            <span>{completedModules}/{totalModules} modules</span>
                            <span>·</span>
                            <span>{passedQuizzes} quizzes passed</span>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Level: {emp.currentLevel || 'Beginner'}
                          </Badge>
                          <Badge className={completedModules === totalModules && totalModules > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}>
                            {completedModules}/{totalModules}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </CardContent>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t">
                        <div className="space-y-2 mt-3 max-h-80 overflow-y-auto custom-scrollbar">
                          {emp.moduleScores
                            .sort((a, b) => {
                              // Sort by module list order
                              const aIdx = moduleList.findIndex(m => m.id === a.moduleId)
                              const bIdx = moduleList.findIndex(m => m.id === b.moduleId)
                              return aIdx - bIdx
                            })
                            .map((ms) => (
                            <div key={ms.moduleId} className={`flex items-center gap-3 p-2 rounded-lg ${
                              ms.completed ? 'bg-emerald-50/50' : 'bg-gray-50'
                            }`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                ms.completed ? 'bg-emerald-100' : 'bg-gray-100'
                              }`}>
                                {ms.completed ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">{ms.moduleTitle}</p>
                              </div>
                              {ms.score !== null && ms.score !== undefined && (
                                <Badge className={ms.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                  {ms.score}%
                                </Badge>
                              )}
                              {ms.completedAt && (
                                <span className="text-xs text-gray-400 shrink-0">
                                  {new Date(ms.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Quiz Attempts */}
                        {emp.quizAttempts.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs font-medium text-gray-600 mb-2">Quiz Attempts</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                              {emp.quizAttempts.slice(0, 10).map((qa) => (
                                <div key={qa.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-gray-50">
                                  <span className="flex-1 text-gray-600 truncate">{qa.assessmentTitle}</span>
                                  <span className={qa.passed ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                                    {qa.score}%
                                  </span>
                                  {qa.completedAt && (
                                    <span className="text-gray-400">{new Date(qa.completedAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Report Generator Tab */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_TYPES.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.color}`}>
                        <r.icon className="w-5 h-5 text-white" />
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleExport(r.id)} disabled={exporting === r.id}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{r.title}</h3>
                    <p className="text-xs text-muted-foreground flex-1">{r.desc}</p>
                    <Button size="sm" className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleExport(r.id)} disabled={exporting === r.id}>
                      {exporting === r.id ? 'Exporting...' : <><FileText className="w-3 h-3 mr-1" /> Generate Report</>}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SCORE_DISTRIBUTION}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="range" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} name="Employees" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600" /> Certification Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CERT_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {CERT_PIE.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {CERT_PIE.map(p => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-xs text-muted-foreground">{p.name} ({p.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Average Score Trend (Monthly)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 3 }} name="Avg Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
