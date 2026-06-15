'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserCheck,
  Award,
  BookOpen,
  SendToBack,
  ClipboardCheck,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface DashboardData {
  totalEmployees: number
  activeEmployees: number
  trainingCompletion: number
  pendingCerts: number
  courses: { id: string; title: string; _count: { enrollments: number } }[]
  assessments: { id: string; title: string; _count: { attempts: number } }[]
  certifications: { id: string; name: string }[]
  recentActivities: { id: string; type: string; description: string; createdAt: string; user: { fullName: string | null } }[]
}

export function TmDashboard() {
  const user = useAuthStore((s) => s.user)
  const setCurrentView = useAuthStore((s) => s.setCurrentView)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=TRAINING_MANAGER`)
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
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const completionData = [
    { name: 'Completed', value: data?.trainingCompletion || 0, color: '#059669' },
    { name: 'Remaining', value: 100 - (data?.trainingCompletion || 0), color: '#e5e7eb' },
  ]

  const statCards = [
    { title: 'Total Employees', value: data?.totalEmployees || 0, icon: Users, color: 'emerald', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { title: 'Active Employees', value: data?.activeEmployees || 0, icon: UserCheck, color: 'teal', bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
    { title: 'Training Completion', value: `${data?.trainingCompletion || 0}%`, icon: TrendingUp, color: 'emerald', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { title: 'Pending Certifications', value: data?.pendingCerts || 0, icon: Award, color: 'amber', bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
  ]

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
          <h1 className="text-2xl font-bold text-gray-900">Training Manager Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of training programs and employee progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentView('assign-courses')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <SendToBack className="w-4 h-4 mr-2" />
            Assign Course
          </Button>
          <Button
            onClick={() => setCurrentView('assign-tests')}
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Completion Gauge */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Training Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-4">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600">{data?.trainingCompletion || 0}%</p>
                  <p className="text-xs text-gray-400">Complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Course Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-3">
              {data?.courses?.length ? data.courses.slice(0, 8).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {course._count.enrollments} enrolled
                  </Badge>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-8">No courses available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
            {data?.recentActivities?.length ? data.recentActivities.map((activity, idx) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {activity.type === 'course_complete' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{activity.user?.fullName || 'Unknown'}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-8">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
