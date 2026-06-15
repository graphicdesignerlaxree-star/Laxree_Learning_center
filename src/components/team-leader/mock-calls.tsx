'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PhoneCall, Star, MessageSquare } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface TeamMember {
  id: string
  fullName: string | null
  designation: string | null
  aiReadinessScore: number
}

interface MockAttempt {
  id: string
  userId: string
  mockSimulationId: string
  score: number
  communicationScore: number
  technicalScore: number
  productKnowledgeScore: number
  salesScore: number
  feedback: string | null
  aiFeedback: string | null
  completedAt: string
  simulation: { title: string; type: string | null }
}

export function MockCalls() {
  const user = useAuthStore((s) => s.user)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [mockAttempts, setMockAttempts] = useState<MockAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=TEAM_LEADER`)
        if (res.ok) {
          const json = await res.json()
          const members = json.teamMembers || []
          setTeamMembers(members)

          // Fetch mock simulation data for each member
          const allAttempts: MockAttempt[] = []
          for (const m of members) {
            try {
              const empRes = await fetch(`/api/dashboard?userId=${m.id}&role=EMPLOYEE`)
              if (empRes.ok) {
                const empData = await empRes.json()
                allAttempts.push(...(empData.mockSimulations || []))
              }
            } catch {}
          }
          setMockAttempts(allAttempts)
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
        <Skeleton className="h-80" />
      </div>
    )
  }

  // Average scores by category
  const avgScores = mockAttempts.length > 0 ? {
    communication: Math.round(mockAttempts.reduce((a, m) => a + m.communicationScore, 0) / mockAttempts.length),
    technical: Math.round(mockAttempts.reduce((a, m) => a + m.technicalScore, 0) / mockAttempts.length),
    productKnowledge: Math.round(mockAttempts.reduce((a, m) => a + m.productKnowledgeScore, 0) / mockAttempts.length),
    sales: Math.round(mockAttempts.reduce((a, m) => a + m.salesScore, 0) / mockAttempts.length),
  } : { communication: 0, technical: 0, productKnowledge: 0, sales: 0 }

  const radarData = [
    { skill: 'Communication', score: avgScores.communication },
    { skill: 'Technical', score: avgScores.technical },
    { skill: 'Product Knowledge', score: avgScores.productKnowledge },
    { skill: 'Sales', score: avgScores.sales },
  ]

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
            <PhoneCall className="w-5 h-5 text-emerald-600" />
          </div>
          Mock Calls
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Review mock call simulation results and feedback</p>
      </div>

      {mockAttempts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <PhoneCall className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Mock Call Results</h3>
            <p className="text-gray-400 text-center max-w-md">Mock call simulation results will appear here when team members complete them.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Skills Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Team Mock Call Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Team Average" dataKey="score" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Scores */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Average Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(avgScores).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className={`text-2xl font-bold ${value >= 70 ? 'text-emerald-600' : value >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {value}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attempts Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Simulation</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Communication</TableHead>
                      <TableHead className="text-center">Technical</TableHead>
                      <TableHead className="text-center">Product</TableHead>
                      <TableHead className="text-center">Sales</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAttempts.slice(0, 20).map(attempt => {
                      const member = teamMembers.find(m => m.id === attempt.userId)
                      return (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium text-gray-900">{member?.fullName || 'Unknown'}</TableCell>
                          <TableCell className="text-sm text-gray-600">{attempt.simulation?.title || 'N/A'}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${attempt.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{attempt.score}%</span>
                          </TableCell>
                          <TableCell className="text-center text-sm">{attempt.communicationScore}%</TableCell>
                          <TableCell className="text-center text-sm">{attempt.technicalScore}%</TableCell>
                          <TableCell className="text-center text-sm">{attempt.productKnowledgeScore}%</TableCell>
                          <TableCell className="text-center text-sm">{attempt.salesScore}%</TableCell>
                          <TableCell className="text-xs text-gray-400">{new Date(attempt.completedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  )
}
