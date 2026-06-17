'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3, RefreshCw, Search, Award, Target, TrendingUp,
  CheckCircle2, XCircle, Clock, BookOpen, FileCheck, Trophy, User,
  Phone, Mail, MapPin, Calendar, Briefcase, Users as UsersIcon, Star,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'

interface Employee {
  id: string
  fullName: string | null
  email: string
  employeeId: string | null
  designation: string | null
  department: { name: string } | null
  aiReadinessScore: number
  currentLevel: string | null
  fieldReady: boolean
  inboundReady: boolean
  isActive: boolean
}

interface Summary {
  totalExams: number; passedExams: number; examPassRate: number; avgExamScore: number
  totalAssessments: number; passedAssessments: number; avgAssessmentScore: number
  totalScorecards: number; passedScorecards: number; avgScorecardScore: number
  totalMocks: number; avgMockScore: number
  totalEnrollments: number; completedEnrollments: number; trainingCompletion: number
  totalCerts: number; approvedCerts: number
  badgesEarned: number
}

interface ScorecardItem {
  id: string; examName: string; date: string; totalQuestions: number
  correctAnswers: number; wrongAnswers: number; scorePercentage: number
  passStatus: boolean; certificationStatus: string | null; rank: number | null
  improvementSuggestions: string | null; managerFeedback: string | null; aiFeedback: string | null
}

interface ExamAttemptItem {
  id: string; title: string; examType: string; stage: string; score: number
  correct: number; wrong: number; total: number; passed: boolean; adminApproved: boolean
  date: string; completedAt: string | null; passingScore: number
}

interface MockItem {
  id: string; title: string; type: string | null; score: number
  communicationScore: number; technicalScore: number; productKnowledgeScore: number
  salesScore: number; feedback: string | null; aiFeedback: string | null; date: string
}

interface CertItem {
  id: string; name: string; status: string; score: number; requiredScore: number
  date: string; issuedAt: string | null; expiresAt: string | null
}

interface EnrollmentItem {
  id: string; title: string; moduleType: string; progress: number; status: string
  enrolledAt: string; completedAt: string | null
}

interface ActivityItem {
  id: string; type: string; description: string; createdAt: string
}

interface ScorecardData {
  user: any
  summary: Summary
  scorecards: ScorecardItem[]
  examAttempts: ExamAttemptItem[]
  assessmentAttempts: any[]
  mockAttempts: MockItem[]
  certifications: CertItem[]
  enrollments: EnrollmentItem[]
  activities: ActivityItem[]
  badges: any[]
  trend: { name: string; score: number; passed: boolean; date: string }[]
}

const STAGE_LABELS: Record<string, string> = {
  PRE: 'Pre Exam', MID: 'Mid Exam', HARD: 'Hard Exam', EXTRA_HARD: 'Extra Hard',
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  INBOUND_SALES: 'Inbound Sales', FIELD_SALES: 'Field Sales',
}

const CERT_COLORS: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  needs_training: 'bg-blue-100 text-blue-700',
  needs_review: 'bg-purple-100 text-purple-700',
}

const ACTIVITY_ICONS: Record<string, any> = {
  login: User, course_start: BookOpen, course_complete: CheckCircle2,
  assessment_taken: FileCheck, certification_earned: Award,
  exam_taken: Target, mock_completed: Trophy,
}

export function EmployeeScorecard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [data, setData] = useState<ScorecardData | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/employee-scorecard', { cache: 'no-store' })
      const json = await res.json()
      if (res.ok) {
        startTransition(() => {
          setEmployees(json.employees || [])
          setLoadingList(false)
        })
      } else {
        startTransition(() => { setError(json.error || 'Failed to load employees'); setLoadingList(false) })
      }
    } catch {
      startTransition(() => { setError('Network error'); setLoadingList(false) })
    }
  }, [startTransition])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    const load = async () => {
      setLoadingData(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/employee-scorecard?userId=${selectedId}`, { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (res.ok) {
          startTransition(() => { setData(json); setLoadingData(false) })
        } else {
          startTransition(() => { setError(json.error || 'Failed to load scorecard'); setLoadingData(false) })
        }
      } catch {
        if (cancelled) return
        startTransition(() => { setError('Network error'); setLoadingData(false) })
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedId, startTransition])

  const filteredEmployees = employees.filter(e => {
    if (!search) return true
    const s = search.toLowerCase()
    return (e.fullName || '').toLowerCase().includes(s) ||
           e.email.toLowerCase().includes(s) ||
           (e.employeeId || '').toLowerCase().includes(s) ||
           (e.designation || '').toLowerCase().includes(s)
  })


  // Radar chart data for mock simulation skills
  const radarData = data && data.mockAttempts.length > 0 ? [
    { skill: 'Communication', value: Math.round(data.mockAttempts.reduce((a, m) => a + m.communicationScore, 0) / data.mockAttempts.length) },
    { skill: 'Technical', value: Math.round(data.mockAttempts.reduce((a, m) => a + m.technicalScore, 0) / data.mockAttempts.length) },
    { skill: 'Product Knowledge', value: Math.round(data.mockAttempts.reduce((a, m) => a + m.productKnowledgeScore, 0) / data.mockAttempts.length) },
    { skill: 'Sales', value: Math.round(data.mockAttempts.reduce((a, m) => a + m.salesScore, 0) / data.mockAttempts.length) },
  ] : []

  if (loadingList) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Award className="w-5 h-5 text-emerald-600" /></div>
          Employee Scorecard
        </h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchEmployees} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Award className="w-5 h-5 text-emerald-600" /></div>
          Employee Scorecard
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Select an employee to view their complete performance overview</p>
      </div>

      {/* Employee Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-sm">Select Employee:</span>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search by name, email, ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-[280px]"><SelectValue placeholder="Choose an employee..." /></SelectTrigger>
              <SelectContent className="max-h-72">
                {filteredEmployees.length === 0 ? (
                  <SelectItem value="_none" disabled>No employees found</SelectItem>
                ) : filteredEmployees.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    <span className="font-medium">{e.fullName || e.email}</span>
                    {e.employeeId && <span className="text-muted-foreground ml-1">({e.employeeId})</span>}
                    {!e.isActive && <Badge variant="secondary" className="ml-2 text-[10px]">Inactive</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedId && (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Employee Selected</h3>
            <p className="text-gray-400 max-w-md mx-auto">Choose an employee from the dropdown above to view their complete performance scorecard.</p>
          </CardContent>
        </Card>
      )}

      {selectedId && loadingData && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        </div>
      )}

      {selectedId && data && !loadingData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Employee Profile Header */}
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                  {(data.user.fullName || data.user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">{data.user.fullName || 'Unknown'}</h2>
                    {data.user.fieldReady && <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Field Ready</Badge>}
                    {data.user.inboundReady && <Badge className="bg-teal-100 text-teal-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Inbound Ready</Badge>}
                    {!data.user.isActive && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {data.user.email}</span>
                    {data.user.employeeId && <span className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {data.user.employeeId}</span>}
                    {data.user.designation && <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400" /> {data.user.designation}</span>}
                    {data.user.department && <span className="flex items-center gap-2"><UsersIcon className="w-4 h-4 text-gray-400" /> {data.user.department.name}</span>}
                    {data.user.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {data.user.location}</span>}
                    {data.user.mobileNumber && <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {data.user.mobileNumber}</span>}
                    {data.user.joiningDate && <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> Joined {new Date(data.user.joiningDate).toLocaleDateString()}</span>}
                    {data.user.reportingManager && <span className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> Reports to {data.user.reportingManager.fullName}</span>}
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{Math.round(data.user.aiReadinessScore)}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Readiness</p>
                    </div>
                  </div>
                  <Badge className="mt-2 bg-emerald-100 text-emerald-700">{data.user.currentLevel || 'Beginner'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            {[
              { label: 'Exams Taken', value: data.summary.totalExams, sub: `${data.summary.passedExams} passed`, icon: FileCheck, color: 'bg-emerald-600', subColor: 'text-emerald-600' },
              { label: 'Exam Pass Rate', value: `${data.summary.examPassRate}%`, sub: `Avg ${data.summary.avgExamScore}%`, icon: Target, color: 'bg-teal-600', subColor: 'text-teal-600' },
              { label: 'Assessments', value: data.summary.totalAssessments, sub: `${data.summary.passedAssessments} passed`, icon: CheckCircle2, color: 'bg-emerald-500', subColor: 'text-emerald-600' },
              { label: 'Avg Assessment', value: `${data.summary.avgAssessmentScore}%`, sub: `${data.summary.passedAssessments}/${data.summary.totalAssessments}`, icon: BarChart3, color: 'bg-amber-500', subColor: 'text-amber-600' },
              { label: 'Mock Simulations', value: data.summary.totalMocks, sub: `Avg ${data.summary.avgMockScore}%`, icon: Trophy, color: 'bg-purple-500', subColor: 'text-purple-600' },
              { label: 'Training Done', value: `${data.summary.trainingCompletion}%`, sub: `${data.summary.completedEnrollments}/${data.summary.totalEnrollments}`, icon: BookOpen, color: 'bg-blue-500', subColor: 'text-blue-600' },
              { label: 'Certifications', value: `${data.summary.approvedCerts}/${data.summary.totalCerts}`, sub: data.summary.approvedCerts > 0 ? 'Certified' : 'Pending', icon: Award, color: 'bg-emerald-600', subColor: 'text-emerald-600' },
              { label: 'Badges Earned', value: data.summary.badgesEarned, sub: 'Achievements', icon: Star, color: 'bg-amber-400', subColor: 'text-amber-600' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card><CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-3.5 h-3.5 text-white" /></div>
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className={`text-xs ${s.subColor}`}>{s.sub}</p>
                </CardContent></Card>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Trend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" /> Score Trend (Recent Exams)</CardTitle>
              </CardHeader>
              <CardContent>
                {data.trend.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={50} />
                        <YAxis domain={[0, 100]} fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No exam data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Mock Simulation Skills Radar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-emerald-600" /> Simulation Skills Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {radarData.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="skill" fontSize={11} />
                        <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                        <Radar name="Score" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.3} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No simulation data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Exam Attempts Table */}
          {data.examAttempts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><FileCheck className="w-4 h-4 text-emerald-600" /> Exam History ({data.examAttempts.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="text-left p-3">Exam</th>
                        <th className="text-left p-3 hidden md:table-cell">Type</th>
                        <th className="text-left p-3 hidden md:table-cell">Stage</th>
                        <th className="text-center p-3">Score</th>
                        <th className="text-center p-3">Result</th>
                        <th className="text-left p-3 hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.examAttempts.slice(0, 10).map(e => (
                        <tr key={e.id} className="border-t hover:bg-gray-50/50">
                          <td className="p-3 font-medium max-w-[200px]"><p className="line-clamp-1">{e.title}</p></td>
                          <td className="p-3 hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{EXAM_TYPE_LABELS[e.examType] || e.examType}</Badge></td>
                          <td className="p-3 hidden md:table-cell text-xs">{STAGE_LABELS[e.stage] || e.stage}</td>
                          <td className="p-3 text-center"><span className={`font-bold ${e.score >= e.passingScore ? 'text-emerald-600' : 'text-red-500'}`}>{Math.round(e.score)}%</span></td>
                          <td className="p-3 text-center"><Badge className={e.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>{e.passed ? 'Pass' : 'Fail'}</Badge></td>
                          <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mock Simulations + Certifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.mockAttempts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-emerald-600" /> Mock Simulations ({data.mockAttempts.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-72 overflow-y-auto">
                  {data.mockAttempts.slice(0, 8).map(m => (
                    <div key={m.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium line-clamp-1">{m.title}</p>
                        <Badge className={m.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{Math.round(m.score)}%</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Comm: {Math.round(m.communicationScore)}</span>
                        <span>Tech: {Math.round(m.technicalScore)}</span>
                        <span>Product: {Math.round(m.productKnowledgeScore)}</span>
                        <span>Sales: {Math.round(m.salesScore)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {data.certifications.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" /> Certifications ({data.certifications.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-72 overflow-y-auto">
                  {data.certifications.map(c => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium line-clamp-1">{c.name}</p>
                        <Badge className={CERT_COLORS[c.status] || 'bg-gray-100 text-gray-700'}>{c.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Score: {Math.round(c.score)}% (need {c.requiredScore}%)</span>
                        <span>{new Date(c.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Training Progress */}
          {data.enrollments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-600" /> Training Progress ({data.enrollments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {data.enrollments.map(e => (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{e.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${e.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{e.progress}%</span>
                      </div>
                    </div>
                    <Badge className={e.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : e.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}>
                      {e.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {data.activities.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-600" /> Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {data.activities.map(a => {
                  const Icon = ACTIVITY_ICONS[a.type] || Clock
                  return (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{a.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Badges */}
          {data.badges.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4 text-emerald-600" /> Badges Earned ({data.badges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {data.badges.map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">{b.name}</p>
                        {b.description && <p className="text-xs text-muted-foreground">{b.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
