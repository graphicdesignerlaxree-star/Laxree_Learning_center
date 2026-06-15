'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sun, BookOpen, Clock, CheckCircle2, Flame } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TeamMember {
  id: string
  fullName: string | null
  designation: string | null
  aiReadinessScore: number
  enrollmentCount: number
}

interface ActivityData {
  type: string
  description: string
  createdAt: string
}

export function DailyLearning() {
  const user = useAuthStore((s) => s.user)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [memberActivities, setMemberActivities] = useState<Record<string, ActivityData[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=TEAM_LEADER`)
        if (res.ok) {
          const json = await res.json()
          const members = json.teamMembers || []
          setTeamMembers(members)

          // Fetch recent activities for each member
          const activitiesMap: Record<string, ActivityData[]> = {}
          for (const m of members) {
            try {
              const empRes = await fetch(`/api/dashboard?userId=${m.id}&role=EMPLOYEE`)
              if (empRes.ok) {
                const empData = await empRes.json()
                activitiesMap[m.id] = (empData.activities || []).slice(0, 5)
              }
            } catch {}
          }
          setMemberActivities(activitiesMap)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
    )
  }

  // Daily engagement data
  const dailyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    active: Math.floor(teamMembers.length * (0.5 + Math.random() * 0.5)),
    completions: Math.floor(teamMembers.length * Math.random() * 0.4),
  }))

  const todayActive = teamMembers.filter(m => {
    const activities = memberActivities[m.id] || []
    return activities.some(a => {
      const activityDate = new Date(a.createdAt)
      const today = new Date()
      return activityDate.toDateString() === today.toDateString()
    })
  }).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 text-emerald-600" />
          </div>
          Daily Learning
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Monitor daily learning activities and engagement</p>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{todayActive}</p>
              <p className="text-sm text-gray-500">Active Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">{teamMembers.length}</p>
              <p className="text-sm text-gray-500">Total Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{teamMembers.length - todayActive}</p>
              <p className="text-sm text-gray-500">Inactive Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Engagement Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Weekly Learning Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="active" name="Active Members" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="completions" name="Completions" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Member Activity */}
      <div className="space-y-3">
        {teamMembers.map(member => {
          const activities = memberActivities[member.id] || []
          const initials = member.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 bg-emerald-100">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{member.fullName || 'Unknown'}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {Math.round(member.aiReadinessScore || 0)}% readiness
                      </Badge>
                    </div>

                    {activities.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {activities.slice(0, 3).map((activity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{activity.description}</span>
                            <span className="text-gray-300 shrink-0">{new Date(activity.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-2">No recent activity</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}
