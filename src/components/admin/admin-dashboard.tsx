'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useTransition, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Users, UserCheck, UserPlus, GraduationCap, Award, Target, MonitorPlay,
  PhoneCall, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  Sparkles, BarChart3, Brain, Shield, ArrowUpRight, ArrowDownRight, Activity,
  Upload, FileText, Video, BookOpen, Zap, MapPin, Phone, AlertTriangle,
  ChevronRight, ArrowRight, User, Rocket, Eye, Play, Plus,
} from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

interface DashboardData {
  totalEmployees: number
  activeEmployees: number
  newJoiners: number
  trainingCompletion: number
  certificationRate: number
  avgAssessmentScore: number
  avgMockScore: number
  fieldReadyCount: number
  inboundReadyCount: number
  pendingApprovals: number
  pendingCertifications: number
  departments: { name: string; employees: number; avgScore: number }[]
  topPerformers: { id: string; fullName: string; aiReadinessScore: number; designation: string | null }[]
  lowPerformers: { id: string; fullName: string; aiReadinessScore: number; designation: string | null }[]
  recentActivities: { id: string; type: string; description: string; createdAt: string; user: { fullName: string | null; email: string } }[]
  courses: number
  assessments: number
  certifications: number
  totalDocuments: number
  totalQuestionBanks: number
}

interface EmployeeReadiness {
  id: string
  fullName: string
  aiReadinessScore: number
  fieldReady: boolean
  inboundReady: boolean
  currentLevel: string
  department: string | null
  designation: string | null
}

const STATUS_COLORS = {
  field_ready: { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-400' },
  inbound_ready: { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', ring: 'ring-teal-400' },
  in_training: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-400' },
  needs_attention: { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-400' },
}

function getStatusCategory(emp: EmployeeReadiness) {
  if (emp.fieldReady) return 'field_ready'
  if (emp.inboundReady) return 'inbound_ready'
  if (emp.aiReadinessScore >= 40) return 'in_training'
  return 'needs_attention'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

export function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [employees, setEmployees] = useState<EmployeeReadiness[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard?userId=${user?.id}&role=${user?.role}`)
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch { /* ignore */ }
  }, [user])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ai-deployment?batch=true')
      if (res.ok) {
        const d = await res.json()
        const mapped = (d.employees || []).map((e: any) => ({
          id: e.id,
          fullName: e.fullName || 'Unknown',
          aiReadinessScore: e.aiReadinessScore || 0,
          fieldReady: e.fieldReady || false,
          inboundReady: e.inboundReady || false,
          currentLevel: e.currentLevel || 'Beginner',
          department: e.department || null,
          designation: null,
        }))
        setEmployees(mapped)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchDashboard()
    fetchEmployees()
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [fetchDashboard, fetchEmployees])

  if (loading || !data) return <DashboardSkeleton />

  const readinessDistribution = [
    { name: 'Field Ready', value: data.fieldReadyCount, color: '#10b981' },
    { name: 'Inbound Ready', value: data.inboundReadyCount - data.fieldReadyCount, color: '#14b8a6' },
    { name: 'In Training', value: Math.max(0, data.totalEmployees - data.inboundReadyCount - Math.round(data.totalEmployees * 0.1)), color: '#f59e0b' },
    { name: 'Needs Attention', value: Math.max(0, data.totalEmployees - data.fieldReadyCount - data.inboundReadyCount - Math.max(0, data.totalEmployees - data.inboundReadyCount - Math.round(data.totalEmployees * 0.1))), color: '#ef4444' },
  ].filter(d => d.value > 0)

  const deptChart = data.departments.slice(0, 6).map(d => ({
    name: d.name.length > 10 ? d.name.substring(0, 10) + '…' : d.name,
    score: d.avgScore,
    employees: d.employees,
  }))

  // Compute training-needs count
  const needsTrainingCount = employees.filter(e => !e.fieldReady && !e.inboundReady && e.aiReadinessScore < 40).length
  const inTrainingCount = employees.filter(e => !e.fieldReady && !e.inboundReady && e.aiReadinessScore >= 40).length

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <LayoutDashboardIcon className="w-5 h-5 text-white" />
              </div>
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1 ml-13">Platform overview, employee readiness & AI insights</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchDashboard(); fetchEmployees(); }} className="gap-2 w-fit">
            <Activity className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Quick Actions - Prominent Action Buttons */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-emerald-100 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Add Employee', sublabel: 'Onboard new team member', icon: UserPlus, onClick: () => useAuthStore.getState().setCurrentView('employees') },
                { label: 'Upload Content', sublabel: 'Add videos, PDFs & docs', icon: Upload, onClick: () => useAuthStore.getState().setCurrentView('documents') },
                { label: 'AI Recommendations', sublabel: 'View deployment insights', icon: Brain, onClick: () => useAuthStore.getState().setCurrentView('ai-deployment') },
                { label: 'Manage Courses', sublabel: 'Create & edit courses', icon: BookOpen, onClick: () => useAuthStore.getState().setCurrentView('courses') },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{action.label}</p>
                    <p className="text-[11px] text-emerald-100 truncate">{action.sublabel}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 ml-auto shrink-0 group-hover:text-white/70 transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Stats - Compact */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Employees', value: data.totalEmployees, icon: Users, trend: `${data.activeEmployees} active`, up: true, color: 'emerald' },
            { label: 'Field Ready', value: data.fieldReadyCount, icon: MapPin, trend: `${Math.round((data.fieldReadyCount / Math.max(data.totalEmployees, 1)) * 100)}% of total`, up: true, color: 'teal' },
            { label: 'Inbound Ready', value: data.inboundReadyCount, icon: Phone, trend: `${Math.round((data.inboundReadyCount / Math.max(data.totalEmployees, 1)) * 100)}% of total`, up: true, color: 'cyan' },
            { label: 'Avg Readiness', value: `${data.avgAssessmentScore}%`, icon: Target, trend: `Mock: ${data.avgMockScore}%`, up: data.avgAssessmentScore > 60, color: 'amber' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.up ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                    <span className="text-xs text-muted-foreground">{stat.trend}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content: Readiness Grid + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Employee Readiness Grid */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Employee Readiness Grid
                </CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  {Object.entries(STATUS_COLORS).map(([key, colors]) => (
                    <span key={key} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
                      <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {employees.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No employee data available</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {employees.map((emp, i) => {
                    const status = getStatusCategory(emp)
                    const colors = STATUS_COLORS[status]
                    return (
                      <TooltipProvider key={emp.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`${colors.light} ${colors.border} border rounded-lg p-2.5 cursor-pointer hover:shadow-sm transition-all`}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}>
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <span className={`w-1.5 h-1.5 rounded-full ${colors.bg} ${status === 'needs_attention' ? 'animate-pulse' : ''}`} />
                              </div>
                              <p className="text-[11px] font-semibold truncate">{emp.fullName}</p>
                              <div className="mt-1">
                                <div className="flex items-center justify-between text-[9px] mb-0.5">
                                  <span>Score</span>
                                  <span className="font-medium">{emp.aiReadinessScore}%</span>
                                </div>
                                <Progress value={emp.aiReadinessScore} className="h-1" />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            <p className="font-semibold">{emp.fullName}</p>
                            <p>Score: {emp.aiReadinessScore}% | Level: {emp.currentLevel}</p>
                            <p className="capitalize">{status.replace('_', ' ')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: AI Insights + Distribution */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* AI Insights Card - Enhanced */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-800">{data.fieldReadyCount} employees ready for calls</p>
                  <p className="text-[10px] text-muted-foreground">Cleared for field deployment</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/80">
                <Phone className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-800">{data.inboundReadyCount} cleared for inbound</p>
                  <p className="text-[10px] text-muted-foreground">Ready for phone support</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/80">
                <GraduationCap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-800">{inTrainingCount} in training</p>
                  <p className="text-[10px] text-muted-foreground">Making progress, need more time</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/80">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-800">{needsTrainingCount} need more training</p>
                  <p className="text-[10px] text-muted-foreground">Score below 40%, require intervention</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-white/80">
                <Clock className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-800">{data.pendingCertifications} certs pending</p>
                  <p className="text-[10px] text-muted-foreground">Awaiting approval</p>
                </div>
              </div>
              {/* Key Recommendations */}
              <div className="mt-1 pt-2 border-t border-amber-200/50">
                <p className="text-[10px] font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Key Recommendations
                </p>
                <div className="space-y-1">
                  {needsTrainingCount > 0 && (
                    <p className="text-[10px] text-gray-600 flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                      Assign intensive training to {needsTrainingCount} underperforming employees
                    </p>
                  )}
                  {data.pendingCertifications > 0 && (
                    <p className="text-[10px] text-gray-600 flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                      Review {data.pendingCertifications} pending certification approvals
                    </p>
                  )}
                  {data.avgAssessmentScore < 60 && (
                    <p className="text-[10px] text-gray-600 flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                      Assessment scores are below average — consider content updates
                    </p>
                  )}
                  {data.fieldReadyCount > 0 && (
                    <p className="text-[10px] text-gray-600 flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                      Deploy {data.fieldReadyCount} field-ready employees to active accounts
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 gap-2" onClick={() => useAuthStore.getState().setCurrentView('ai-deployment')}>
                <Brain className="w-3.5 h-3.5" /> View Full AI Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Readiness Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600" />
                Readiness Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={readinessDistribution} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3} dataKey="value">
                      {readinessDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {readinessDistribution.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content Management Quick Access */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Content Management
              </CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {data.courses} Courses</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {data.totalDocuments} Docs</span>
                <span className="flex items-center gap-1"><ClipboardIcon className="w-3 h-3" /> {data.assessments} Assessments</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => useAuthStore.getState().setCurrentView('courses')}
                className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/80 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Manage Courses</p>
                  <p className="text-xs text-muted-foreground">Add videos, modules & content</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
              <button
                onClick={() => useAuthStore.getState().setCurrentView('documents')}
                className="flex items-center gap-3 p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/80 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Upload Documents</p>
                  <p className="text-xs text-muted-foreground">PDFs, SOPs, catalogs & more</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
              <button
                onClick={() => useAuthStore.getState().setCurrentView('assessments')}
                className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/80 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                  <ClipboardIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Assessments</p>
                  <p className="text-xs text-muted-foreground">Quizzes, exams & question banks</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Performance */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Department Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChart} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <RechartsTooltip />
                    <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top & Low Performers */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(data.topPerformers || []).slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-emerald-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.fullName || 'Unknown'}</p>
                    <p className="text-[10px] text-muted-foreground">{p.designation || 'Employee'}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
                    {Math.round(p.aiReadinessScore)}%
                  </Badge>
                </div>
              ))}
              {data.lowPerformers && data.lowPerformers.length > 0 && (
                <>
                  <div className="border-t pt-1.5 mt-1.5">
                    <p className="text-[10px] font-medium text-red-600 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3" /> Needs Attention
                    </p>
                  </div>
                  {data.lowPerformers.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{p.fullName || 'Unknown'}</p>
                        <p className="text-[10px] text-muted-foreground">{p.designation || 'Employee'}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700">
                        {Math.round(p.aiReadinessScore)}%
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Recent Activity
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">{(data.recentActivities || []).length} events</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {(data.recentActivities || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar">
                {data.recentActivities.slice(0, 10).map((activity, i) => {
                  const icon = getActivityIcon(activity.type)
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-lg ${icon.bg} flex items-center justify-center shrink-0`}>
                        <icon.Icon className={`w-3.5 h-3.5 ${icon.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground">{activity.user?.fullName || activity.user?.email}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  )
}

function getActivityIcon(type: string) {
  const map: Record<string, { Icon: React.ElementType; bg: string; color: string }> = {
    login: { Icon: UserCheck, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    course_start: { Icon: Play, bg: 'bg-sky-100', color: 'text-sky-600' },
    course_complete: { Icon: GraduationCap, bg: 'bg-teal-100', color: 'text-teal-600' },
    assessment_taken: { Icon: Target, bg: 'bg-amber-100', color: 'text-amber-600' },
    certification_earned: { Icon: Award, bg: 'bg-violet-100', color: 'text-violet-600' },
    readiness_update: { Icon: Shield, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  }
  return map[type] || { Icon: Activity, bg: 'bg-gray-100', color: 'text-gray-600' }
}

function formatTimeAgo(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32 mt-1" /></div>
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
        <div className="space-y-4"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-44 rounded-xl" /></div>
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  )
}
