'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Target, TrendingUp, Award } from 'lucide-react'
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
  aiReadinessScore: number
  assessmentCount: number
}

export function Scorecards() {
  const user = useAuthStore((s) => s.user)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=TEAM_LEADER`)
        if (res.ok) {
          const json = await res.json()
          setTeamMembers(json.teamMembers || [])
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

  const chartData = teamMembers
    .sort((a, b) => (b.aiReadinessScore || 0) - (a.aiReadinessScore || 0))
    .map((m, idx) => ({
      name: m.fullName?.split(' ')[0] || 'N/A',
      score: Math.round(m.aiReadinessScore || 0),
      rank: idx + 1,
    }))

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
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          Scorecards
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Team member scorecards and performance rankings</p>
      </div>

      {/* Ranking Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            AI Readiness Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} formatter={(value: number) => [`${value}%`, 'AI Readiness']} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No team data available</div>
          )}
        </CardContent>
      </Card>

      {/* Scorecard Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-center">AI Readiness</TableHead>
                  <TableHead className="text-center">Assessments</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers
                  .sort((a, b) => (b.aiReadinessScore || 0) - (a.aiReadinessScore || 0))
                  .map((member, idx) => (
                    <TableRow key={member.id} className="hover:bg-emerald-50/50">
                      <TableCell>
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{member.fullName || 'Unknown'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{member.designation || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${(member.aiReadinessScore || 0) >= 70 ? 'text-emerald-600' : (member.aiReadinessScore || 0) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Math.round(member.aiReadinessScore || 0)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm">{member.assessmentCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${(member.aiReadinessScore || 0) >= 70 ? 'border-emerald-200 text-emerald-700' : (member.aiReadinessScore || 0) >= 50 ? 'border-amber-200 text-amber-700' : 'border-red-200 text-red-700'}`}>
                          {(member.aiReadinessScore || 0) >= 80 ? 'Excellent' : (member.aiReadinessScore || 0) >= 60 ? 'Good' : (member.aiReadinessScore || 0) >= 40 ? 'Needs Improvement' : 'At Risk'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
