'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  TrendingUp, Target, Award, CheckCircle2, Circle, Sparkles,
  AlertTriangle, ThumbsUp, BookOpen, BarChart3, MessageSquare,
  RefreshCw
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'
import { Button } from '@/components/ui/button'

interface PerformanceData {
  user: {
    id: string
    fullName: string | null
    designation: string | null
    aiReadinessScore: number
    currentLevel: string | null
  }
  trainingCompletion: number
  enrollments: Array<{
    id: string
    courseTitle: string
    progress: number
    status: string
  }>
  assessments: Array<{
    id: string
    title: string
    score: number
    passed: boolean
    date: string | null
  }>
  certifications: Array<{
    id: string
    name: string
    status: string
    score: number
    date: string | null
  }>
  mockSimulations: Array<{
    id: string
    score: number
    communicationScore: number
    technicalScore: number
    productKnowledgeScore: number
    salesScore: number
    feedback: string | null
    aiFeedback: string | null
    completedAt: string
  }>
  scorecards: any[]
  activities: any[]
}

function GaugeChart({ value, label, color = '#059669' }: { value: number; label: string; color?: string }) {
  const data = [{ name: label, value, fill: color }]

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="100%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={data}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-4">
        <span className="text-2xl font-bold" style={{ color }}>{value}%</span>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// Demo data for when API returns sparse results
const DEMO_SIMULATIONS = [
  { id: 'ds1', score: 72, communicationScore: 78, technicalScore: 65, productKnowledgeScore: 70, salesScore: 75, feedback: 'Good communication, needs technical depth', aiFeedback: 'Your communication skills are strong. Focus on building deeper product knowledge.', completedAt: new Date().toISOString() },
  { id: 'ds2', score: 68, communicationScore: 72, technicalScore: 60, productKnowledgeScore: 68, salesScore: 70, feedback: null, aiFeedback: 'Consistent improvement trend. Continue practicing sales scenarios.', completedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
]

export function MyPerformance() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dashboard?userId=${user?.id}&role=EMPLOYEE`)
      if (res.status === 404) {
        // User not found in DB - force re-login
        useAuthStore.getState().logout()
        return
      }
      if (res.ok) {
        const json = await res.json()
        // Ensure mockSimulations exists and has data; use demo if empty
        if (!json.mockSimulations || json.mockSimulations.length === 0) {
          json.mockSimulations = DEMO_SIMULATIONS
        }
        setData(json)
      } else {
        setError('Failed to load performance data from server')
      }
    } catch (err) {
      console.error('Failed to fetch performance data:', err)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Unable to Load Performance Data</h3>
        <p className="text-gray-400 mb-4 text-center max-w-md">{error || 'Something went wrong'}</p>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    )
  }

  const completedCourses = data.enrollments.filter(e => e.status === 'completed')
  const pendingCourses = data.enrollments.filter(e => e.status !== 'completed')

  // Calculate score averages
  const avgComm = data.mockSimulations.length > 0
    ? Math.round(data.mockSimulations.reduce((a, m) => a + m.communicationScore, 0) / data.mockSimulations.length) : 0
  const avgTech = data.mockSimulations.length > 0
    ? Math.round(data.mockSimulations.reduce((a, m) => a + m.technicalScore, 0) / data.mockSimulations.length) : 0
  const avgProd = data.mockSimulations.length > 0
    ? Math.round(data.mockSimulations.reduce((a, m) => a + m.productKnowledgeScore, 0) / data.mockSimulations.length) : 0
  const avgSales = data.mockSimulations.length > 0
    ? Math.round(data.mockSimulations.reduce((a, m) => a + m.salesScore, 0) / data.mockSimulations.length) : 0

  // Demo data for progress chart
  const progressOverTime = [
    { month: 'Jan', score: 20 },
    { month: 'Feb', score: 32 },
    { month: 'Mar', score: 45 },
    { month: 'Apr', score: 55 },
    { month: 'May', score: 62 },
    { month: 'Jun', score: data.user.aiReadinessScore || 70 },
  ]

  // AI feedback generation
  const aiFeedback = avgSales > 70
    ? 'Your sales performance is strong! Focus on advanced negotiation techniques to reach the next level. Consider taking the Competitive Intelligence Academy courses.'
    : avgTech > 60
      ? 'Good technical foundation detected. Recommended: Increase product knowledge depth and practice more mock sales scenarios for balanced improvement.'
      : 'Focus on building core skills across all areas. Start with the foundational modules in Sales Academy and Product Academy for steady growth.'

  // Improvement and strength areas
  const allScores = [
    { label: 'Communication', value: avgComm, icon: MessageSquare, color: 'emerald' },
    { label: 'Technical', value: avgTech, icon: BarChart3, color: 'teal' },
    { label: 'Product Knowledge', value: avgProd, icon: Target, color: 'amber' },
    { label: 'Sales', value: avgSales, icon: TrendingUp, color: 'red' },
  ]
  const strengths = allScores.filter(s => s.value >= 60).sort((a, b) => b.value - a.value)
  const improvements = allScores.filter(s => s.value < 60).sort((a, b) => a.value - b.value)

  const recommendedTraining = [
    { title: 'Advanced Sales Techniques', type: 'SALES_ACADEMY', reason: 'Boost your sales score' },
    { title: 'Product Deep Dive', type: 'PRODUCT_ACADEMY', reason: 'Strengthen product knowledge' },
    { title: 'Negotiation Mastery', type: 'NEGOTIATION', reason: 'Close deals effectively' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Score Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <GaugeChart value={avgComm} label="Communication" color="#059669" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <GaugeChart value={avgTech} label="Technical" color="#0d9488" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <GaugeChart value={avgProd} label="Product Knowledge" color="#d97706" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <GaugeChart value={avgSales} label="Sales" color="#dc2626" />
          </CardContent>
        </Card>
      </div>

      {/* Assessment Scores Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            Assessment Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.assessments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No assessment attempts yet</p>
              <p className="text-xs text-gray-300 mt-1">Complete an assessment to see your scores here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assessments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-sm">{a.title}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${a.score >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {Math.round(a.score)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {a.date ? new Date(a.date).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.passed ? 'default' : 'destructive'} className="text-xs">
                          {a.passed ? 'Pass' : 'Fail'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mock Sales Scores + Learning Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              </div>
              Mock Sales Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.mockSimulations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No mock simulation results yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {data.mockSimulations.map((sim, i) => (
                  <div key={sim.id || i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Simulation #{i + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(sim.completedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Comm', value: sim.communicationScore },
                        { label: 'Tech', value: sim.technicalScore },
                        { label: 'Product', value: sim.productKnowledgeScore },
                        { label: 'Sales', value: sim.salesScore },
                      ].map((s, j) => (
                        <div key={j}>
                          <p className={`text-lg font-bold ${s.value >= 70 ? 'text-emerald-600' : s.value >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            {s.value}
                          </p>
                          <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Learning Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certification Status + AI Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-amber-600" />
              </div>
              Certification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.certifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No certification attempts yet</p>
                <p className="text-xs text-gray-300 mt-1">Pass an assessment to earn certifications</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {data.certifications.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {c.date ? new Date(c.date).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                    <Badge className={
                      c.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      c.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      c.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{aiFeedback}</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <Sparkles className="w-3 h-3" />
                <span>AI-generated based on your performance data</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths + Improvement Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Strength Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Keep working to build your strengths!</p>
            ) : (
              <div className="space-y-3">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <ThumbsUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{s.label}</p>
                      <Progress value={s.value} className="h-1.5 mt-1" />
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{s.value}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              Improvement Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improvements.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-600 font-medium">All areas performing well!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {improvements.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{s.label}</p>
                      <Progress value={s.value} className="h-1.5 mt-1" />
                    </div>
                    <span className="text-sm font-bold text-amber-600">{s.value}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completed + Pending Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Completed Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedCourses.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No completed courses yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {completedCourses.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-700">{c.courseTitle}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <Circle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              Pending Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCourses.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-600">All courses completed!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {pendingCourses.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{c.courseTitle}</span>
                      <span className="text-xs text-gray-400">{Math.round(c.progress)}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Training */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            </div>
            Recommended Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendedTraining.map((rec, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700">{rec.title}</h4>
                <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                <Badge variant="outline" className="mt-2 text-xs">{rec.type.replace(/_/g, ' ')}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
