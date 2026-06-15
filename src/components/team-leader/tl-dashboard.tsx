'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  ShieldCheck,
  Award,
  GraduationCap,
  Handshake,
  PhoneCall,
  TrendingUp,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface TeamMember {
  id: string
  fullName: string | null
  designation: string | null
  department: string | null
  aiReadinessScore: number
  currentLevel: string | null
  fieldReady: boolean
  inboundReady: boolean
  enrollmentCount: number
  assessmentCount: number
}

interface DashboardData {
  teamMembers: TeamMember[]
  totalTeam: number
  fieldReady: number
  inboundReady: number
  pendingCerts: number
}

export function TlDashboard() {
  const user = useAuthStore((s) => s.user)
  const setCurrentView = useAuthStore((s) => s.setCurrentView)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=TEAM_LEADER`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchDashboard()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const chartData = (data?.teamMembers || []).slice(0, 8).map(m => ({
    name: m.fullName?.split(' ')[0] || 'N/A',
    score: Math.round(m.aiReadinessScore || 0),
  }))

  const statCards = [
    { title: 'Total Team Members', value: data?.totalTeam || 0, icon: Users, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { title: 'Field Ready', value: data?.fieldReady || 0, icon: ShieldCheck, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    { title: 'Inbound Ready', value: data?.inboundReady || 0, icon: PhoneCall, bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
    { title: 'Pending Certifications', value: data?.pendingCerts || 0, icon: Award, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
  ]

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#059669'
    if (score >= 60) return '#0d9488'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const getReadinessLabel = (member: TeamMember) => {
    if (member.fieldReady) return { label: 'Field Ready', color: 'bg-green-100 text-green-700' }
    if (member.inboundReady) return { label: 'Inbound Ready', color: 'bg-teal-100 text-teal-700' }
    if (member.aiReadinessScore >= 60) return { label: 'In Training', color: 'bg-amber-100 text-amber-700' }
    return { label: 'Beginner', color: 'bg-gray-100 text-gray-600' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Leader Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor your team&apos;s readiness and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCurrentView('approve-readiness')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Handshake className="w-4 h-4 mr-2" />
            Approve Readiness
          </Button>
          <Button onClick={() => setCurrentView('improvement-plans')} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <GraduationCap className="w-4 h-4 mr-2" />
            Improvement Plan
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`w-11 h-11 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Team Performance Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Team AI Readiness Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [`${value}%`, 'AI Readiness']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getReadinessColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No team data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Team Member Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.teamMembers || []).map((member, idx) => {
            const readiness = getReadinessLabel(member)
            const initials = member.fullName
              ? member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'U'

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 bg-emerald-100">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">{member.fullName || 'Unknown'}</p>
                          <Badge className={`text-[10px] ${readiness.color}`}>{readiness.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{member.designation || 'No designation'}</p>
                      </div>
                    </div>

                    {/* AI Readiness Mini Gauge */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">AI Readiness</span>
                        <span className={`font-medium ${member.aiReadinessScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {Math.round(member.aiReadinessScore || 0)}%
                        </span>
                      </div>
                      <Progress value={member.aiReadinessScore || 0} className="h-2" />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {member.enrollmentCount} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {member.assessmentCount} tests
                      </span>
                    </div>

                    {/* Certification Badges */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {member.fieldReady && (
                        <Badge className="bg-green-100 text-green-700 text-[10px] hover:bg-green-100">
                          <ShieldCheck className="w-3 h-3 mr-0.5" />
                          Field
                        </Badge>
                      )}
                      {member.inboundReady && (
                        <Badge className="bg-teal-100 text-teal-700 text-[10px] hover:bg-teal-100">
                          <PhoneCall className="w-3 h-3 mr-0.5" />
                          Inbound
                        </Badge>
                      )}
                      {member.currentLevel && (
                        <Badge variant="outline" className="text-[10px]">
                          {member.currentLevel}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {(!data?.teamMembers || data.teamMembers.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Team Members</h3>
            <p className="text-gray-400 text-center max-w-md">You don&apos;t have any team members assigned yet. Contact your administrator.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
