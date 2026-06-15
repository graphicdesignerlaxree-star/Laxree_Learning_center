'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
  enrollmentCount: number
  assessmentCount: number
}

interface DashboardData {
  teamMembers: TeamMember[]
  totalTeam: number
  fieldReady: number
  inboundReady: number
}

export function TeamPerformance() {
  const user = useAuthStore((s) => s.user)
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
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchDashboard()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const members = data?.teamMembers || []

  // Bar chart data - comparing team members
  const barData = members.slice(0, 10).map(m => ({
    name: m.fullName?.split(' ')[0] || 'N/A',
    readiness: Math.round(m.aiReadinessScore || 0),
    courses: m.enrollmentCount || 0,
    assessments: m.assessmentCount || 0,
  }))

  // Trend data (simulated)
  const trendData = [
    { month: 'Jan', avgScore: 42, completions: 12 },
    { month: 'Feb', avgScore: 48, completions: 15 },
    { month: 'Mar', avgScore: 55, completions: 18 },
    { month: 'Apr', avgScore: 60, completions: 22 },
    { month: 'May', avgScore: 65, completions: 25 },
    { month: 'Jun', avgScore: members.length > 0 ? Math.round(members.reduce((a, m) => a + (m.aiReadinessScore || 0), 0) / members.length) : 68, completions: 28 },
  ]

  // Radar data for team skills
  const radarData = [
    { skill: 'Product Knowledge', score: Math.round(members.reduce((a, m) => a + (m.aiReadinessScore || 0) * 0.8, 0) / Math.max(members.length, 1)) },
    { skill: 'Sales Skills', score: Math.round(members.reduce((a, m) => a + (m.aiReadinessScore || 0) * 0.7, 0) / Math.max(members.length, 1)) },
    { skill: 'Communication', score: Math.round(members.reduce((a, m) => a + (m.aiReadinessScore || 0) * 0.85, 0) / Math.max(members.length, 1)) },
    { skill: 'Technical', score: Math.round(members.reduce((a, m) => a + (m.aiReadinessScore || 0) * 0.6, 0) / Math.max(members.length, 1)) },
    { skill: 'Negotiation', score: Math.round(members.reduce((a, m) => a + (m.aiReadinessScore || 0) * 0.65, 0) / Math.max(members.length, 1)) },
    { skill: 'Customer Discovery', score: Math.round(members.reduce((a, m) => a + (m.aiReadinessScore || 0) * 0.75, 0) / Math.max(members.length, 1)) },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'
    if (score >= 60) return '#0d9488'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
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
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          Team Performance
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Comprehensive view of team performance metrics and trends</p>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Member Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="skills">Skill Radar</TabsTrigger>
        </TabsList>

        {/* Bar Chart - Member Comparison */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                AI Readiness Score by Team Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number, name: string) => [
                        name === 'readiness' ? `${value}%` : value,
                        name === 'readiness' ? 'AI Readiness' : name === 'courses' ? 'Courses' : 'Assessments'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="readiness" name="AI Readiness" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.readiness)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Chart - Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Performance Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="avgScore" name="Avg AI Readiness" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669' }} />
                  <Line yAxisId="right" type="monotone" dataKey="completions" name="Course Completions" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar Chart - Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Team Skill Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Team Average"
                    dataKey="score"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Metrics Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Individual Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 text-xs font-medium text-gray-500">Member</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 text-center">AI Readiness</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 text-center">Courses</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 text-center">Assessments</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 text-center">Rank</th>
                </tr>
              </thead>
              <tbody>
                {members
                  .sort((a, b) => (b.aiReadinessScore || 0) - (a.aiReadinessScore || 0))
                  .map((m, idx) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 text-sm font-medium text-gray-900">{m.fullName || 'Unknown'}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-sm font-bold ${(m.aiReadinessScore || 0) >= 70 ? 'text-emerald-600' : (m.aiReadinessScore || 0) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Math.round(m.aiReadinessScore || 0)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-sm text-gray-600">{m.enrollmentCount}</td>
                      <td className="py-2.5 text-center text-sm text-gray-600">{m.assessmentCount}</td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
