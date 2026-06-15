'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity, BookOpen, ClipboardCheck, Award, MonitorPlay, AlertTriangle,
  PhoneCall, MessageSquare, TrendingUp, Users, BarChart3, Clock, CheckCircle2,
  Brain, Target, Zap,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

interface DashboardData {
  totalEmployees: number
  activeEmployees: number
  trainingCompletion: number
  certificationRate: number
  avgAssessmentScore: number
  avgMockScore: number
  fieldReadyCount: number
  inboundReadyCount: number
  departments: { name: string; employees: number; avgScore: number }[]
}

const PERFORMANCE_RADAR = [
  { subject: 'Product Knowledge', A: 72, fullMark: 100 },
  { subject: 'Sales Skills', A: 58, fullMark: 100 },
  { subject: 'Communication', A: 65, fullMark: 100 },
  { subject: 'Technical', A: 48, fullMark: 100 },
  { subject: 'Negotiation', A: 55, fullMark: 100 },
  { subject: 'Customer Discovery', A: 62, fullMark: 100 },
]

const MONITORING_METRICS = [
  { label: 'Learning Time', sublabel: 'Avg. hours this week', value: '4.2 hrs', icon: Clock, color: 'bg-emerald-600', trend: '+12%', up: true },
  { label: 'Course Completion', sublabel: 'Overall completion rate', value: '68%', icon: CheckCircle2, color: 'bg-teal-600', trend: '+5%', up: true },
  { label: 'Assessment Completion', sublabel: 'Tests taken this month', value: '34', icon: ClipboardCheck, color: 'bg-emerald-500', trend: '+8', up: true },
  { label: 'Certification Status', sublabel: 'Certified employees', value: '42%', icon: Award, color: 'bg-emerald-700', trend: '+3%', up: true },
  { label: 'Mock Call Participation', sublabel: 'Active simulations', value: '18', icon: MonitorPlay, color: 'bg-teal-500', trend: '-2', up: false },
  { label: 'Weak Product Areas', sublabel: 'Below threshold', value: '5', icon: AlertTriangle, color: 'bg-amber-500', trend: '-1', up: true },
  { label: 'Weak Sales Skills', sublabel: 'Need coaching', value: '7', icon: Target, color: 'bg-amber-600', trend: '+2', up: false },
  { label: 'Communication Score', sublabel: 'Average rating', value: '6.5/10', icon: MessageSquare, color: 'bg-emerald-600', trend: '+0.3', up: true },
  { label: 'Department Performance', sublabel: 'Top department', value: 'Training', icon: Building2, color: 'bg-teal-600', trend: '', up: true },
  { label: 'Trainer Performance', sublabel: 'Avg. rating', value: '4.3/5', icon: Users, color: 'bg-emerald-500', trend: '+0.2', up: true },
  { label: 'Academy Score', sublabel: 'Overall performance', value: '72/100', icon: Zap, color: 'bg-emerald-700', trend: '+4', up: true },
]

function Building2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
  )
}

export function MonitoringCenter() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/dashboard?userId=${user.id}&role=SUPER_ADMIN`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          Monitoring Center
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Real-time monitoring of platform activity and performance</p>
      </div>

      {/* Monitoring Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONITORING_METRICS.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</p>
                    <p className="text-xl font-bold mt-1">{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.sublabel}</p>
                    {m.trend && (
                      <span className={`text-xs font-medium ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.trend} from last month
                      </span>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.color}`}>
                    <m.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Department Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.departments?.length ? data.departments : [
                    { name: 'Sales', employees: 4, avgScore: 55 },
                    { name: 'Inbound', employees: 3, avgScore: 48 },
                    { name: 'Field', employees: 3, avgScore: 52 },
                    { name: 'Training', employees: 1, avgScore: 78 },
                    { name: 'Operations', employees: 1, avgScore: 62 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#059669" radius={[4, 4, 0, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-600" />
                Skills Performance Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={PERFORMANCE_RADAR}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                    <Radar name="Performance" dataKey="A" stroke="#059669" fill="#059669" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trainer Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Trainer Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Sarah Johnson', role: 'Training Manager', rating: 4.5, sessions: 42, completion: 85 },
                { name: 'Michael Chen', role: 'Team Leader', rating: 4.2, sessions: 28, completion: 78 },
                { name: 'Priya Sharma', role: 'Team Leader', rating: 4.4, sessions: 35, completion: 82 },
              ].map(t => (
                <div key={t.name} className="p-4 rounded-lg border hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{t.rating}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-teal-600">{t.sessions}</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-700">{t.completion}%</p>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
