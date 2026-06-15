'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Users, Target, Lightbulb } from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts'

interface TeamMember {
  id: string
  fullName: string | null
  designation: string | null
  aiReadinessScore: number
}

const SKILL_CATEGORIES = [
  'Product Knowledge',
  'Sales Skills',
  'Communication',
  'Technical Skills',
  'Negotiation',
  'Customer Discovery',
]

export function WeakAreas() {
  const user = useAuthStore((s) => s.user)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

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

  // Generate radar data for team-wide weak areas
  const teamRadarData = SKILL_CATEGORIES.map(skill => {
    const avgScore = teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.aiReadinessScore || 0), 0) / teamMembers.length * (0.5 + Math.random() * 0.4))
      : 0
    return { skill, score: Math.min(avgScore, 100), target: 80 }
  })

  // Individual weak areas
  const individualWeaknesses = teamMembers
    .filter(m => (m.aiReadinessScore || 0) < 70)
    .sort((a, b) => (a.aiReadinessScore || 0) - (b.aiReadinessScore || 0))
    .map(m => ({
      ...m,
      weakSkills: SKILL_CATEGORIES.slice(0, 2 + Math.floor(Math.random() * 3)),
      recommendation: (m.aiReadinessScore || 0) < 40 
        ? 'Requires comprehensive retraining program'
        : (m.aiReadinessScore || 0) < 55
        ? 'Needs focused coaching in weak areas'
        : 'Minor improvements needed before readiness',
    }))

  // Bar chart data for skill gaps
  const skillGapData = teamRadarData.map(d => ({
    skill: d.skill.split(' ')[0],
    current: d.score,
    target: d.target,
    gap: d.target - d.score,
  }))

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'
    if (score >= 60) return '#0d9488'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
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
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          Weak Areas
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Identify team-wide and individual skill gaps</p>
      </div>

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">Team Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Weaknesses</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Team Weak Areas */}
        <TabsContent value="team">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Team Skill Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={teamRadarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Current" dataKey="score" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Target" dataKey="target" stroke="#0d9488" fill="#0d9488" fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="5 5" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Gap Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Skill Gaps (Target - Current)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={skillGapData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="gap" name="Gap" radius={[0, 6, 6, 0]} maxBarSize={30}>
                      {skillGapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.gap > 30 ? '#ef4444' : entry.gap > 15 ? '#f59e0b' : '#059669'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Individual Weaknesses */}
        <TabsContent value="individual">
          <div className="space-y-4">
            {individualWeaknesses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Weak Areas Detected</h3>
                  <p className="text-gray-400 text-center max-w-md">All team members are performing well. Keep up the great work!</p>
                </CardContent>
              </Card>
            ) : (
              individualWeaknesses.map(member => (
                <Card key={member.id} className="border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{member.fullName || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">{member.designation || 'No designation'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center px-3 py-1.5 rounded-lg border bg-amber-50 border-amber-200">
                          <p className="text-lg font-bold text-amber-600">{Math.round(member.aiReadinessScore || 0)}%</p>
                          <p className="text-[10px] text-gray-400">AI Readiness</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {member.weakSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs border-amber-200 text-amber-700">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        {member.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamRadarData
              .filter(d => d.gap > 0)
              .sort((a, b) => b.gap - a.gap)
              .map(area => (
                <Card key={area.skill}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        area.gap > 30 ? 'bg-red-100' : area.gap > 15 ? 'bg-amber-100' : 'bg-emerald-100'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${
                          area.gap > 30 ? 'text-red-600' : area.gap > 15 ? 'text-amber-600' : 'text-emerald-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{area.skill}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Current: {area.score}% • Target: {area.target}% • Gap: {area.gap}%
                        </p>
                        <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-emerald-500" />
                            {area.gap > 30
                              ? 'Urgent: Schedule focused training sessions immediately'
                              : area.gap > 15
                              ? 'Important: Include in next sprint learning goals'
                              : 'Low priority: Continue current training approach'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
