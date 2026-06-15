'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BookMarked, Clock, CheckCircle2 } from 'lucide-react'

interface TeamMember {
  id: string
  fullName: string | null
  designation: string | null
  aiReadinessScore: number
  enrollmentCount: number
  fieldReady: boolean
  inboundReady: boolean
}

export function TrainingStatus() {
  const user = useAuthStore((s) => s.user)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [enrollmentData, setEnrollmentData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=TEAM_LEADER`)
        if (res.ok) {
          const json = await res.json()
          setTeamMembers(json.teamMembers || [])

          // Fetch enrollment data for each member
          const enrollmentMap: Record<string, any> = {}
          for (const m of (json.teamMembers || [])) {
            try {
              const empRes = await fetch(`/api/dashboard?userId=${m.id}&role=EMPLOYEE`)
              if (empRes.ok) {
                const empData = await empRes.json()
                enrollmentMap[m.id] = {
                  enrollments: empData.enrollments || [],
                  trainingCompletion: empData.trainingCompletion || 0,
                }
              }
            } catch {}
          }
          setEnrollmentData(enrollmentMap)
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
            <BookMarked className="w-5 h-5 text-emerald-600" />
          </div>
          Training Status
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Track team training completion and progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{teamMembers.filter(m => m.fieldReady || m.inboundReady).length}</p>
            <p className="text-sm text-gray-500">Ready for Deployment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{teamMembers.filter(m => (m.aiReadinessScore || 0) >= 50 && !m.fieldReady && !m.inboundReady).length}</p>
            <p className="text-sm text-gray-500">In Training</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{teamMembers.filter(m => (m.aiReadinessScore || 0) < 50).length}</p>
            <p className="text-sm text-gray-500">Needs Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Training Status */}
      <div className="space-y-4">
        {teamMembers.map(member => {
          const empData = enrollmentData[member.id]
          const completion = empData?.trainingCompletion || 0
          const enrollments = empData?.enrollments || []
          const completed = enrollments.filter((e: any) => e.status === 'completed').length
          const inProgress = enrollments.filter((e: any) => e.status === 'in_progress').length
          const initials = member.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-11 w-11 bg-emerald-100">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{member.fullName || 'Unknown'}</h3>
                        <p className="text-xs text-gray-400">{member.designation || 'No designation'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.fieldReady && <Badge className="bg-green-100 text-green-700 text-[10px]">Field Ready</Badge>}
                        {member.inboundReady && <Badge className="bg-teal-100 text-teal-700 text-[10px]">Inbound Ready</Badge>}
                        {!member.fieldReady && !member.inboundReady && (
                          <Badge variant="outline" className="text-[10px]">In Training</Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Training Progress</span>
                        <span className={`font-medium ${completion >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{completion}%</span>
                      </div>
                      <Progress value={completion} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {completed} completed
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {inProgress} in progress
                      </span>
                      <span className="flex items-center gap-1">
                        AI Readiness: {Math.round(member.aiReadinessScore || 0)}%
                      </span>
                    </div>
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
