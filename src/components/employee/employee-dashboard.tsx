'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sun, BookOpen, Award, TrendingUp, Target, Calendar, Clock,
  Trophy, CheckCircle2, Circle, ArrowRight, Star, Zap,
  GraduationCap, BarChart3, Activity, Timer, Sparkles,
  ChevronRight, Play, Flame, Users, ArrowUpRight, ArrowDownRight,
  Brain, Shield, Rocket, FileCheck, ClipboardList, MessageSquare,
  Lightbulb, Globe, Layers, Gem, Eye, MoveRight, Loader2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line
} from 'recharts'

interface DashboardData {
  user: {
    id: string
    fullName: string | null
    email: string
    designation: string | null
    department: string | null
    profilePhoto: string | null
    aiReadinessScore: number
    currentLevel: string | null
    fieldReady: boolean
    inboundReady: boolean
    employeeId: string | null
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
  scorecards: any[]
  mockSimulations: any[]
  activities: Array<{
    id: string
    type: string
    description: string
    createdAt: string
  }>
  badges: any[]
  notifications: any[]
  improvementPlans: any[]
  leaderboardPosition: number
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3, ease: 'easeOut' } }
}

// Circular Progress with glow
function CircularProgress({ value, size = 120, strokeWidth = 8, color = '#059669', label }: {
  value: number; size?: number; strokeWidth?: number; color?: string; label?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id={`glow-${color.replace('#', '')}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-bold tracking-tight" style={{ color, fontSize: size * 0.2 }}>
          {value}%
        </span>
        {label && (
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

// Mini sparkline component
function Sparkline({ data, color = '#059669', width = 80, height = 32 }: {
  data: number[]; color?: string; width?: number; height?: number
}) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
    </svg>
  )
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-xl px-4 py-3 shadow-xl shadow-black/5">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900">
        {payload[0].value}%
      </p>
    </div>
  )
}

// Activity icon mapper
function getActivityIcon(type: string) {
  const map: Record<string, { icon: any; color: string; bg: string }> = {
    enrollment: { icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    assessment: { icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
    certification: { icon: Award, color: 'text-teal-600', bg: 'bg-teal-50' },
    completion: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    badge: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    default: { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-50' },
  }
  return map[type] || map.default
}

// Get greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', icon: Sun, emoji: '☀️' }
  if (hour < 17) return { text: 'Good Afternoon', icon: Sun, emoji: '🌤️' }
  return { text: 'Good Evening', icon: Moon, emoji: '🌙' }
}

function Moon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  )
}

// Premium skeleton loader
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-1">
      <div className="rounded-2xl overflow-hidden">
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}

export function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const setCurrentView = useAuthStore((s) => s.setCurrentView)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=EMPLOYEE`)
        if (res.status === 404) {
          // User not found in DB - force re-login
          useAuthStore.getState().logout()
          return
        }
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  if (loading) return <DashboardSkeleton />
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Activity className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-sm font-medium">Unable to load dashboard data</p>
      <p className="text-xs mt-1">Please refresh the page to try again</p>
    </div>
  )

  const readinessScore = Math.round(data.user.aiReadinessScore || 0)
  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  const levelConfig: Record<string, { color: string; bg: string; border: string; gradient: string }> = {
    Advanced: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      gradient: 'from-emerald-500 to-teal-500'
    },
    Intermediate: {
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      gradient: 'from-teal-500 to-cyan-500'
    },
    Beginner: {
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      gradient: 'from-amber-500 to-orange-500'
    },
  }
  const currentLevel = data.user.currentLevel || 'Beginner'
  const levelStyle = levelConfig[currentLevel] || levelConfig.Beginner

  // Demo data
  const todayPlan = [
    { task: 'Complete Module 5: Product Features', time: '9:00 AM', status: 'pending', type: 'learning' },
    { task: 'Practice Mock Sales Call', time: '11:00 AM', status: 'completed', type: 'practice' },
    { task: 'Review Competitive Analysis', time: '2:00 PM', status: 'pending', type: 'learning' },
    { task: 'Take Assessment: Product Knowledge', time: '4:00 PM', status: 'pending', type: 'assessment' },
  ]

  const progressData = [
    { week: 'Week 1', progress: 10, baseline: 8 },
    { week: 'Week 2', progress: 22, baseline: 18 },
    { week: 'Week 3', progress: 35, baseline: 28 },
    { week: 'Week 4', progress: data.trainingCompletion || 42, baseline: 38 },
  ]

  const upcomingAssessments = data.assessments.filter(a => !a.passed).slice(0, 3)
  const pendingCertifications = data.certifications.filter(c => c.status === 'pending').slice(0, 3)
  const pendingModules = data.enrollments.filter(e => e.status !== 'completed').slice(0, 4)
  const completedModules = data.enrollments.filter(e => e.status === 'completed')

  const totalCourses = data.enrollments.length
  const completedCourseCount = completedModules.length
  const assessmentPassRate = data.assessments.length > 0
    ? Math.round((data.assessments.filter(a => a.passed).length / data.assessments.length) * 100)
    : 0

  const readinessTrend = [readinessScore - 15, readinessScore - 10, readinessScore - 5, readinessScore]
  const trainingTrend = [Math.max(0, data.trainingCompletion - 18), Math.max(0, data.trainingCompletion - 12), Math.max(0, data.trainingCompletion - 5), data.trainingCompletion]

  const firstName = data.user.fullName?.split(' ')[0] || 'Employee'

  // Quick actions
  const quickActions = [
    { label: 'Continue Learning', icon: Play, color: 'from-emerald-500 to-teal-600', view: 'learning-center', description: 'Resume your courses' },
    { label: 'Take Assessment', icon: Target, color: 'from-amber-500 to-orange-600', view: 'my-performance', description: 'Test your knowledge' },
    { label: 'View Scorecard', icon: BarChart3, color: 'from-teal-500 to-cyan-600', view: 'scorecards', description: 'Check performance' },
    { label: 'Certifications', icon: Award, color: 'from-rose-500 to-pink-600', view: 'certifications', description: 'View certificates' },
  ]

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-1"
      >
        {/* ═══════════════════════════════════════════
            PREMIUM HERO WELCOME SECTION
        ═══════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800" />
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-[0.07]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            {/* Glow accent */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl" />

            <div className="relative px-6 py-8 sm:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar with status ring */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-50 blur-sm" />
                  <Avatar className="w-18 h-18 border-3 border-white/25 shadow-2xl relative" style={{ width: 72, height: 72 }}>
                    <AvatarImage src={data.user.profilePhoto || undefined} />
                    <AvatarFallback className="bg-white/20 text-white text-2xl font-bold backdrop-blur-sm">
                      {data.user.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-400 rounded-full border-2 border-emerald-800 shadow-lg">
                    <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-40" />
                  </div>
                </div>

                {/* Greeting & info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{greeting.emoji}</span>
                    <p className="text-emerald-200 text-sm font-medium tracking-wide">{greeting.text}</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Welcome back, {firstName}!
                  </h1>
                  <p className="text-emerald-200/80 mt-1 text-sm">
                    {data.user.designation || 'Team Member'} · {data.user.department || 'Department'}
                    {data.user.employeeId && (
                      <span className="ml-2 text-emerald-300/50">|</span>
                    )}
                    {data.user.employeeId && (
                      <span className="ml-2 text-emerald-200/60 font-mono text-xs">ID: {data.user.employeeId}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {data.user.fieldReady && (
                      <Badge className="bg-emerald-400/20 text-emerald-100 border border-emerald-400/30 backdrop-blur-sm text-xs px-3 py-0.5 hover:bg-emerald-400/30 transition-colors">
                        <Shield className="w-3 h-3 mr-1.5" /> Field Ready
                      </Badge>
                    )}
                    {data.user.inboundReady && (
                      <Badge className="bg-teal-400/20 text-teal-100 border border-teal-400/30 backdrop-blur-sm text-xs px-3 py-0.5 hover:bg-teal-400/30 transition-colors">
                        <MessageSquare className="w-3 h-3 mr-1.5" /> Inbound Ready
                      </Badge>
                    )}
                    <Badge className="bg-amber-400/15 text-amber-100 border border-amber-400/25 backdrop-blur-sm text-xs px-3 py-0.5">
                      <Brain className="w-3 h-3 mr-1.5" /> AI Score: {readinessScore}
                    </Badge>
                  </div>
                </div>

                {/* Right side stats */}
                <div className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 p-1">
                  <div className="text-center px-5 py-2 rounded-lg hover:bg-white/10 transition-colors">
                    <p className="text-2xl font-bold text-white">{completedCourseCount}</p>
                    <p className="text-[10px] text-emerald-200/70 uppercase tracking-widest font-semibold">Completed</p>
                  </div>
                  <Separator orientation="vertical" className="h-10 bg-white/10" />
                  <div className="text-center px-5 py-2 rounded-lg hover:bg-white/10 transition-colors">
                    <p className="text-2xl font-bold text-white">{totalCourses - completedCourseCount}</p>
                    <p className="text-[10px] text-emerald-200/70 uppercase tracking-widest font-semibold">In Progress</p>
                  </div>
                  <Separator orientation="vertical" className="h-10 bg-white/10" />
                  <div className="text-center px-5 py-2 rounded-lg hover:bg-white/10 transition-colors">
                    <p className="text-2xl font-bold text-white">#{data.leaderboardPosition || '—'}</p>
                    <p className="text-[10px] text-emerald-200/70 uppercase tracking-widest font-semibold">Rank</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            KPI STATS CARDS ROW
        ═══════════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Training Completion */}
          <motion.div variants={cardHover} initial="rest" whileHover="hover">
            <Card
              className="border-0 shadow-md shadow-emerald-600/5 hover:shadow-xl hover:shadow-emerald-600/10 transition-shadow duration-300 cursor-pointer group overflow-hidden rounded-2xl"
              onClick={() => setCurrentView('learning-center')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-[11px] font-semibold">+8%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Training</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">{data.trainingCompletion}%</p>
                <div className="mt-3">
                  <Progress value={data.trainingCompletion} className="h-1.5 bg-gray-100" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Readiness */}
          <motion.div variants={cardHover} initial="rest" whileHover="hover">
            <Card
              className="border-0 shadow-md shadow-teal-600/5 hover:shadow-xl hover:shadow-teal-600/10 transition-shadow duration-300 cursor-pointer group overflow-hidden rounded-2xl"
              onClick={() => setCurrentView('my-performance')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-[11px] font-semibold">+12</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">AI Readiness</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">{readinessScore}<span className="text-sm text-gray-400 font-normal">/100</span></p>
                <div className="mt-3 flex items-end gap-1 h-8">
                  <Sparkline data={readinessTrend} color="#0d9488" width={80} height={28} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={cardHover} initial="rest" whileHover="hover">
            <Card
              className="border-0 shadow-md shadow-amber-600/5 hover:shadow-xl hover:shadow-amber-600/10 transition-shadow duration-300 cursor-pointer group overflow-hidden rounded-2xl"
              onClick={() => setCurrentView('scorecards')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.min(data.badges?.length || 0, 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Leaderboard</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">#{data.leaderboardPosition || '—'}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Gem className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-gray-500 font-medium">{data.badges?.length || 0} badges earned</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Certifications */}
          <motion.div variants={cardHover} initial="rest" whileHover="hover">
            <Card
              className="border-0 shadow-md shadow-rose-600/5 hover:shadow-xl hover:shadow-rose-600/10 transition-shadow duration-300 cursor-pointer group overflow-hidden rounded-2xl"
              onClick={() => setCurrentView('certifications')}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/40 transition-shadow">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  {pendingCertifications.length > 0 && (
                    <Badge className="bg-rose-50 text-rose-600 border-0 text-[11px] font-semibold px-2">
                      {pendingCertifications.length} pending
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Certifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5 tracking-tight">
                  {data.certifications.filter(c => c.status === 'approved').length}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-xs text-gray-500 font-medium">{assessmentPassRate}% pass rate</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            QUICK ACTIONS BAR
        ═══════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentView(action.view)}
                className="relative group overflow-hidden rounded-xl p-4 text-left transition-shadow hover:shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-100`} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{action.label}</p>
                    <p className="text-[11px] text-white/70 truncate">{action.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT GRID - 3 COLUMNS
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Learning Progress Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 px-5 pb-6">
                <CircularProgress
                  value={data.trainingCompletion}
                  size={140}
                  strokeWidth={10}
                  color="#059669"
                  label="Complete"
                />
                <div className={`px-5 py-2 rounded-full border ${levelStyle.bg} ${levelStyle.border}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${levelStyle.gradient}`} />
                    <span className={`text-sm font-semibold ${levelStyle.color}`}>
                      {currentLevel}
                    </span>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Monthly Goal: 80%</span>
                    <span className="font-bold text-emerald-600">{data.trainingCompletion}%</span>
                  </div>
                  <Progress value={data.trainingCompletion} className="h-2 bg-gray-100" />
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-400">{completedCourseCount} of {totalCourses} courses</span>
                    <span className="text-emerald-600 font-medium">{totalCourses > 0 ? Math.round((completedCourseCount / totalCourses) * 100) : 0}% done</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Readiness Gauge */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  AI Readiness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center px-5 pb-6">
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%" cy="50%"
                      innerRadius="65%" outerRadius="95%"
                      data={[{ value: readinessScore, fill: 'url(#readinessGradient)' }]}
                      startAngle={180} endAngle={0}
                    >
                      <defs>
                        <linearGradient id="readinessGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#0d9488" />
                        </linearGradient>
                      </defs>
                      <RadialBar
                        dataKey="value"
                        cornerRadius={8}
                        background={{ fill: '#f3f4f6' }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center -mt-8">
                  <span className="text-4xl font-bold text-gray-900 tracking-tight">{readinessScore}</span>
                  <span className="text-sm text-gray-400 font-normal">/100</span>
                </div>
                <Badge
                  variant="outline"
                  className="mt-3 px-4 py-1 text-xs font-semibold border-0"
                  style={{
                    background: readinessScore >= 70 ? '#ecfdf5' : readinessScore >= 40 ? '#f0fdfa' : '#fffbeb',
                    color: readinessScore >= 70 ? '#059669' : readinessScore >= 40 ? '#0d9488' : '#d97706'
                  }}
                >
                  {readinessScore >= 70 ? (
                    <><Rocket className="w-3 h-3 mr-1.5" /> Ready for Field</>
                  ) : readinessScore >= 40 ? (
                    <><TrendingUp className="w-3 h-3 mr-1.5" /> Developing</>
                  ) : (
                    <><BookOpen className="w-3 h-3 mr-1.5" /> Needs Training</>
                  )}
                </Badge>
                <div className="flex items-center gap-4 mt-4 w-full justify-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium">Assessments</p>
                    <p className="text-sm font-bold text-gray-700">{data.assessments.length}</p>
                  </div>
                  <Separator orientation="vertical" className="h-6 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium">Pass Rate</p>
                    <p className="text-sm font-bold text-emerald-600">{assessmentPassRate}%</p>
                  </div>
                  <Separator orientation="vertical" className="h-6 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium">Certified</p>
                    <p className="text-sm font-bold text-gray-700">{data.certifications.filter(c => c.status === 'approved').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard Position Card - Premium Dark */}
          <motion.div variants={itemVariants}>
            <div className="h-full relative rounded-2xl overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800" />
              <div className="absolute inset-0 opacity-[0.06]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l2 3.5-2 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }} />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-300/15 rounded-full blur-2xl" />

              <div className="relative p-5 h-full flex flex-col">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                    <Trophy className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-100">Your Ranking</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/15">
                      <span className="text-4xl font-bold text-white tracking-tight">#{data.leaderboardPosition || '—'}</span>
                    </div>
                    {data.leaderboardPosition <= 3 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Star className="w-4 h-4 text-amber-900 fill-amber-900" />
                      </div>
                    )}
                  </div>
                  <p className="text-emerald-100/80 text-sm text-center max-w-[200px] leading-relaxed">
                    {data.leaderboardPosition <= 3
                      ? "🌟 Outstanding! You're a top performer!"
                      : data.leaderboardPosition <= 10
                        ? '💪 Great work! Keep pushing forward!'
                        : '📚 Keep learning to climb the ranks!'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Gem className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-xs font-medium text-white/90">{data.badges?.length || 0} Badges</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                    <span className="text-xs font-medium text-white/90">{data.certifications.filter(c => c.status === 'approved').length} Certs</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════
            TRAINING CHART + TODAY'S PLAN
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Training Completion Trend - Premium Area Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    Training Completion Trend
                  </CardTitle>
                  <Badge variant="outline" className="text-[11px] font-medium border-gray-200 text-gray-500">
                    Last 4 weeks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#f3f4f6' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="baseline"
                        stroke="#d1d5db"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        fill="url(#baselineGradient)"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="progress"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fill="url(#progressGradient)"
                        dot={{ fill: '#fff', stroke: '#059669', strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: '#059669', stroke: '#fff', strokeWidth: 2, r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-5 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-emerald-600 rounded-full" />
                    <span className="text-[11px] text-gray-500">Your Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-gray-300 rounded-full border-dashed" style={{ borderTop: '1px dashed #d1d5db' }} />
                    <span className="text-[11px] text-gray-500">Team Average</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Learning Plan */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    Today&apos;s Learning Plan
                  </CardTitle>
                  <Badge className="bg-amber-50 text-amber-700 border-0 text-[11px] font-semibold px-2.5">
                    {todayPlan.filter(t => t.status === 'completed').length}/{todayPlan.length} done
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-2">
                  {todayPlan.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors group ${
                        item.status === 'completed'
                          ? 'bg-emerald-50/50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.status === 'completed'
                          ? 'bg-emerald-100'
                          : item.type === 'assessment'
                            ? 'bg-amber-100'
                            : 'bg-gray-100'
                      }`}>
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : item.type === 'assessment' ? (
                          <Target className="w-4 h-4 text-amber-600" />
                        ) : item.type === 'practice' ? (
                          <Play className="w-4 h-4 text-gray-500" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          item.status === 'completed'
                            ? 'text-emerald-700 line-through decoration-emerald-300'
                            : 'text-gray-700'
                        }`}>
                          {item.task}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 font-medium tabular-nums">{item.time}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════
            UPCOMING ASSESSMENTS + PENDING MODULES + RECENT ACTIVITY
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Assessments */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Timer className="w-4 h-4 text-white" />
                  </div>
                  Upcoming Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {upcomingAssessments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No upcoming assessments</p>
                    <p className="text-xs text-gray-300 mt-1">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {upcomingAssessments.map((a, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                          <Target className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{a.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not scheduled'}
                          </p>
                        </div>
                        <Badge
                          className={`text-[11px] font-semibold border-0 px-2.5 ${
                            a.passed
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {a.passed ? 'Passed' : 'Pending'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Modules */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  Pending Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {pendingModules.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">All modules completed!</p>
                    <p className="text-xs text-gray-300 mt-1">Outstanding work 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                    {pendingModules.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => setCurrentView('learning-center')}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[75%] group-hover:text-emerald-600 transition-colors">
                            {m.courseTitle}
                          </p>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {Math.round(m.progress)}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={m.progress} className="h-2 bg-gray-100" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity - Timeline Style */}
          <motion.div variants={itemVariants}>
            <Card className="h-full border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {data.activities.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No recent activity</p>
                    <p className="text-xs text-gray-300 mt-1">Start learning to see activity here</p>
                  </div>
                ) : (
                  <div className="relative max-h-64 overflow-y-auto custom-scrollbar">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gray-100" />
                    <div className="space-y-4">
                      {data.activities.slice(0, 6).map((act, i) => {
                        const { icon: ActivityIcon, color, bg } = getActivityIcon(act.type)
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-3 relative"
                          >
                            <div className={`w-[30px] h-[30px] ${bg} rounded-lg flex items-center justify-center shrink-0 z-10 border border-white`}>
                              <ActivityIcon className={`w-3.5 h-3.5 ${color}`} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-sm text-gray-700 leading-snug">{act.description}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(act.createdAt).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════
            ENROLLMENT BREAKDOWN - BOTTOM SECTION
        ═══════════════════════════════════════════ */}
        {data.enrollments.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    Course Progress Overview
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setCurrentView('learning-center')}
                  >
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.enrollments.slice(0, 8).map((enrollment, i) => (
                    <motion.div
                      key={enrollment.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer bg-white group"
                      onClick={() => setCurrentView('learning-center')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          enrollment.status === 'completed'
                            ? 'bg-emerald-100'
                            : enrollment.progress >= 50
                              ? 'bg-teal-100'
                              : 'bg-amber-100'
                        }`}>
                          {enrollment.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <BookOpen className={`w-4 h-4 ${
                              enrollment.progress >= 50 ? 'text-teal-600' : 'text-amber-600'
                            }`} />
                          )}
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          enrollment.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : enrollment.progress >= 50
                              ? 'bg-teal-50 text-teal-600'
                              : 'bg-amber-50 text-amber-600'
                        }`}>
                          {Math.round(enrollment.progress)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate group-hover:text-emerald-600 transition-colors">
                        {enrollment.courseTitle}
                      </p>
                      <Progress
                        value={enrollment.progress}
                        className={`h-1.5 mt-2 ${
                          enrollment.status === 'completed'
                            ? '[&>div]:bg-emerald-500'
                            : enrollment.progress >= 50
                              ? '[&>div]:bg-teal-500'
                              : '[&>div]:bg-amber-500'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  )
}
