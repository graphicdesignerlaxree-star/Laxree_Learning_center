'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  MonitorPlay, Users, Target, TrendingUp, PhoneCall, MessageSquare, Shield,
  Calendar, Download, Search, BarChart3, Award, CheckCircle2, XCircle,
  Clock, ChevronDown, ChevronUp, Filter
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'

interface EmployeeSimScore {
  id: string
  fullName: string | null
  email: string
  employeeId: string | null
  designation: string | null
  department: string | null
  currentLevel: string | null
  simulationAttempts: Array<{
    id: string
    simulationTitle: string
    simulationType: string | null
    score: number
    communicationScore: number
    technicalScore: number
    productKnowledgeScore: number
    salesScore: number
    feedback: string | null
    aiFeedback: string | null
    completedAt: string
  }>
}

interface SimulationInfo {
  id: string
  title: string
  type: string | null
}

export function MockSimulationsView() {
  const [employees, setEmployees] = useState<EmployeeSimScore[]>([])
  const [simulations, setSimulations] = useState<SimulationInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin-scores?viewType=simulation-scores')
        if (res.ok) {
          const json = await res.json()
          setEmployees(json.employees || [])
          setSimulations(json.simulations || [])
        }
      } catch (err) {
        console.error('Failed to fetch simulation scores:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Compute stats
  const allAttempts = employees.flatMap(e => e.simulationAttempts)
  const avgScore = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((a, s) => a + s.score, 0) / allAttempts.length)
    : 0
  const avgComm = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((a, s) => a + s.communicationScore, 0) / allAttempts.length)
    : 0
  const avgTech = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((a, s) => a + s.technicalScore, 0) / allAttempts.length)
    : 0
  const avgProd = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((a, s) => a + s.productKnowledgeScore, 0) / allAttempts.length)
    : 0
  const avgSales = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((a, s) => a + s.salesScore, 0) / allAttempts.length)
    : 0

  // Chart data
  const chartData = simulations.map(sim => {
    const simAttempts = allAttempts.filter(a => a.simulationTitle === sim.title)
    return {
      name: sim.title.length > 15 ? sim.title.substring(0, 15) + '...' : sim.title,
      'Avg Score': simAttempts.length > 0 ? Math.round(simAttempts.reduce((a, s) => a + s.score, 0) / simAttempts.length) : 0,
      'Attempts': simAttempts.length,
    }
  })

  // Filter employees
  const filteredEmployees = employees.filter(e =>
    !searchQuery ||
    e.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const typeColors: Record<string, string> = {
    field_sales: 'bg-emerald-100 text-emerald-700',
    inbound_sales: 'bg-teal-100 text-teal-700',
    negotiation: 'bg-amber-100 text-amber-700',
    customer_discovery: 'bg-purple-100 text-purple-700',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <MonitorPlay className="w-5 h-5 text-emerald-600" />
          </div>
          Mock Simulations - Scorecard
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Monitor employee simulation performance and scores</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Avg Score', value: `${avgScore}%`, icon: Target, color: 'bg-emerald-600' },
          { label: 'Communication', value: `${avgComm}%`, icon: MessageSquare, color: 'bg-teal-600' },
          { label: 'Technical', value: `${avgTech}%`, icon: Shield, color: 'bg-amber-500' },
          { label: 'Product', value: `${avgProd}%`, icon: Package2, color: 'bg-rose-500' },
          { label: 'Sales', value: `${avgSales}%`, icon: TrendingUp, color: 'bg-purple-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="employees" className="flex-1">Employee Scores</TabsTrigger>
          <TabsTrigger value="daily" className="flex-1">Daily Scores</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Simulation Performance Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" /> Simulation Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Bar dataKey="Avg Score" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Simulation Cards */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 text-teal-500" /> Available Simulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {simulations.map((sim) => {
                    const attempts = allAttempts.filter(a => a.simulationTitle === sim.title)
                    const avg = attempts.length > 0
                      ? Math.round(attempts.reduce((a, s) => a + s.score, 0) / attempts.length)
                      : 0

                    return (
                      <div key={sim.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-700">{sim.title}</h4>
                          <Badge className={typeColors[sim.type || ''] || 'bg-gray-100 text-gray-700'}>
                            {(sim.type || 'general').replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{attempts.length} attempts</span>
                          <span>Avg: {avg}%</span>
                        </div>
                        <Progress value={avg} className="h-1.5 mt-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> Score Breakdown by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Communication', score: avgComm, icon: MessageSquare, color: 'text-emerald-600' },
                  { label: 'Technical Knowledge', score: avgTech, icon: Shield, color: 'text-teal-600' },
                  { label: 'Product Knowledge', score: avgProd, icon: Target, color: 'text-amber-600' },
                  { label: 'Sales Skills', score: avgSales, icon: TrendingUp, color: 'text-purple-600' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="text-sm font-bold">{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Scores Tab */}
        <TabsContent value="employees" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
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
          </div>

          {filteredEmployees.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No employee simulation data found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.filter(e => e.simulationAttempts.length > 0).map((emp) => {
                const isExpanded = expandedEmployee === emp.id
                const bestScore = emp.simulationAttempts.length > 0
                  ? Math.max(...emp.simulationAttempts.map(a => a.score))
                  : 0

                return (
                  <Card key={emp.id} className="overflow-hidden">
                    <CardContent
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          bestScore >= 70 ? 'bg-emerald-100' : bestScore >= 50 ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-sm font-bold ${
                            bestScore >= 70 ? 'text-emerald-600' : bestScore >= 50 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {bestScore}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{emp.fullName || 'Unknown'}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{emp.employeeId}</span>
                            <span>·</span>
                            <span>{emp.department || 'No dept'}</span>
                            <span>·</span>
                            <span>{emp.simulationAttempts.length} attempts</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Best: {bestScore}%
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </CardContent>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t">
                        <div className="space-y-3 mt-3 max-h-80 overflow-y-auto custom-scrollbar">
                          {emp.simulationAttempts.map((attempt, i) => (
                            <div key={attempt.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {attempt.simulationTitle}
                                  </span>
                                  <Badge className={typeColors[attempt.simulationType || ''] || 'bg-gray-100 text-gray-700'}>
                                    {(attempt.simulationType || 'general').replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                <span className={`text-lg font-bold ${
                                  attempt.score >= 70 ? 'text-emerald-600' : attempt.score >= 50 ? 'text-amber-600' : 'text-red-500'
                                }`}>
                                  {attempt.score}%
                                </span>
                              </div>

                              <div className="grid grid-cols-4 gap-3 mb-2">
                                {[
                                  { label: 'Comm', value: attempt.communicationScore },
                                  { label: 'Tech', value: attempt.technicalScore },
                                  { label: 'Product', value: attempt.productKnowledgeScore },
                                  { label: 'Sales', value: attempt.salesScore },
                                ].map((s, j) => (
                                  <div key={j} className="text-center">
                                    <p className={`text-sm font-bold ${
                                      s.value >= 70 ? 'text-emerald-600' : s.value >= 50 ? 'text-amber-600' : 'text-red-500'
                                    }`}>
                                      {s.value}
                                    </p>
                                    <p className="text-xs text-gray-400">{s.label}</p>
                                    <Progress value={s.value} className="h-1 mt-1" />
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>{new Date(attempt.completedAt).toLocaleDateString()} {new Date(attempt.completedAt).toLocaleTimeString()}</span>
                              </div>

                              {attempt.aiFeedback && (
                                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 mt-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Sparkles2 className="w-3 h-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">AI Feedback</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{attempt.aiFeedback}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Daily Scores Tab */}
        <TabsContent value="daily" className="mt-4">
          <DailyScoresView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DailyScoresView() {
  const [dailyData, setDailyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await fetch('/api/admin-scores?viewType=daily-scores')
        if (res.ok) {
          const json = await res.json()
          setDailyData(json)
        }
      } catch (err) {
        console.error('Failed to fetch daily scores:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDaily()
  }, [])

  if (loading) return <Skeleton className="h-48 rounded-xl" />

  const quizAttempts = dailyData?.quizAttempts || []
  const simAttempts = dailyData?.simulationAttempts || []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Today&apos;s Scores - {new Date().toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizAttempts.length === 0 && simAttempts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No scores recorded today</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quiz Scores */}
              {quizAttempts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" /> Module Quiz Scores
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {quizAttempts.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          a.passed ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          {a.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{a.employeeName}</p>
                          <p className="text-xs text-gray-400">{a.assessmentTitle}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{a.department}</Badge>
                        <span className={`text-sm font-bold ${a.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                          {a.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulation Scores */}
              {simAttempts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-teal-500" /> Simulation Scores
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {simAttempts.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          s.score >= 70 ? 'bg-emerald-100' : s.score >= 50 ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-xs font-bold ${
                            s.score >= 70 ? 'text-emerald-600' : s.score >= 50 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {s.score}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{s.employeeName}</p>
                          <p className="text-xs text-gray-400">{s.simulationTitle}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{s.department}</Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>C:{s.communicationScore}</span>
                          <span>T:{s.technicalScore}</span>
                          <span>P:{s.productKnowledgeScore}</span>
                          <span>S:{s.salesScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Package2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  )
}

function Sparkles2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  )
}
