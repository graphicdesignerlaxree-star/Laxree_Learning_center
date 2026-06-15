'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  MonitorPlay, Play, Clock, CheckCircle2, BarChart3,
  MessageSquare, Sparkles, TrendingUp, Mic, Wrench, Package, DollarSign
} from 'lucide-react'
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { SimulationDialog } from './simulation-dialog'

interface SimulationAttempt {
  id: string
  score: number
  communicationScore: number
  technicalScore: number
  productKnowledgeScore: number
  salesScore: number
  feedback: string | null
  aiFeedback: string | null
  completedAt: string
}

const AVAILABLE_SIMULATIONS = [
  {
    id: 'sim1',
    title: 'Hotel GM Meeting',
    description: 'Practice pitching LAXREE mini bars to a 5-star hotel GM. Focus on opening statements, product positioning, and needs discovery.',
    type: 'field_sales',
    difficulty: 'Beginner',
    duration: '15 min',
  },
  {
    id: 'sim2',
    title: 'Product Demo Presentation',
    description: 'Present LAXREE safe box features to a hotel chain procurement team. Handle technical questions and objections.',
    type: 'field_sales',
    difficulty: 'Intermediate',
    duration: '20 min',
  },
  {
    id: 'sim3',
    title: 'Inbound Inquiry Handling',
    description: 'Handle an incoming call about LAXREE RFID locks. Qualify the lead and guide the prospect through the buying process.',
    type: 'inbound_sales',
    difficulty: 'Beginner',
    duration: '12 min',
  },
  {
    id: 'sim4',
    title: 'Negotiation Challenge',
    description: 'Negotiate pricing and contract terms on a bulk order of mini bars, safes, and kettles for a resort group.',
    type: 'negotiation',
    difficulty: 'Advanced',
    duration: '25 min',
  },
  {
    id: 'sim5',
    title: 'Customer Discovery Deep Dive',
    description: 'Conduct thorough needs analysis for a new beachfront resort and align with LAXREE solutions across all product lines.',
    type: 'customer_discovery',
    difficulty: 'Intermediate',
    duration: '18 min',
  },
]

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
}

export function MockSimulationsView() {
  const [simulations, setSimulations] = useState<SimulationAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=EMPLOYEE`)
        if (res.ok) {
          const json = await res.json()
          setSimulations(json.mockSimulations || [])
        }
      } catch (err) {
        console.error('Failed to fetch simulations:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  // Demo data if sparse
  const demoSimulations: SimulationAttempt[] = simulations.length === 0 ? [
    {
      id: 'ds1',
      score: 72,
      communicationScore: 78,
      technicalScore: 65,
      productKnowledgeScore: 70,
      salesScore: 75,
      feedback: 'Good communication skills. Need to work on technical depth.',
      aiFeedback: 'Your communication is strong at 78%. Focus on improving technical knowledge (65%) by reviewing Product Academy modules. Sales closing techniques could benefit from more practice.',
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'ds2',
      score: 65,
      communicationScore: 60,
      technicalScore: 72,
      productKnowledgeScore: 68,
      salesScore: 58,
      feedback: 'Technical knowledge is improving. Sales approach needs refinement.',
      aiFeedback: 'Your technical score improved to 72%. However, your sales approach (58%) needs attention. Practice the SPIN selling methodology and focus on building rapport before pitching.',
      completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  ] : simulations

  // Calculate averages
  const avgScores = demoSimulations.length > 0 ? {
    overall: Math.round(demoSimulations.reduce((a, s) => a + s.score, 0) / demoSimulations.length),
    communication: Math.round(demoSimulations.reduce((a, s) => a + s.communicationScore, 0) / demoSimulations.length),
    technical: Math.round(demoSimulations.reduce((a, s) => a + s.technicalScore, 0) / demoSimulations.length),
    product: Math.round(demoSimulations.reduce((a, s) => a + s.productKnowledgeScore, 0) / demoSimulations.length),
    sales: Math.round(demoSimulations.reduce((a, s) => a + s.salesScore, 0) / demoSimulations.length),
  } : { overall: 0, communication: 0, technical: 0, product: 0, sales: 0 }

  // Radar chart data
  const radarData = [
    { subject: 'Communication', score: avgScores.communication },
    { subject: 'Technical', score: avgScores.technical },
    { subject: 'Product', score: avgScores.product },
    { subject: 'Sales', score: avgScores.sales },
  ]

  // Bar chart data for past simulations
  const barData = demoSimulations.slice(0, 6).map((s, i) => ({
    name: `Sim ${i + 1}`,
    Communication: s.communicationScore,
    Technical: s.technicalScore,
    Product: s.productKnowledgeScore,
    Sales: s.salesScore,
  })).reverse()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{avgScores.overall}%</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{avgScores.communication}%</p>
              <p className="text-xs text-gray-500">Communication</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{avgScores.technical}%</p>
              <p className="text-xs text-gray-500">Technical</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{avgScores.sales}%</p>
              <p className="text-xs text-gray-500">Sales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart + Available Simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Skills Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke="#059669" fill="#059669" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-teal-500" /> Available Simulations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {AVAILABLE_SIMULATIONS.map((sim) => (
                <div key={sim.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-700">{sim.title}</h4>
                    <Badge className={difficultyColors[sim.difficulty] || 'bg-gray-100 text-gray-700'} >
                      {sim.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{sim.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {sim.duration}
                    </span>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                      onClick={() => {
                        setSelectedSimulationId(sim.id)
                        setDialogOpen(true)
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" /> Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Past Simulation Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Past Simulation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {demoSimulations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MonitorPlay className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No simulation results yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {demoSimulations.map((sim, i) => (
                <div key={sim.id} className="p-4 border rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Simulation #{demoSimulations.length - i}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(sim.completedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <span className={`text-lg font-bold ${sim.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {sim.score}%
                    </span>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {[
                      { label: 'Communication', value: sim.communicationScore, icon: Mic },
                      { label: 'Technical', value: sim.technicalScore, icon: Wrench },
                      { label: 'Product', value: sim.productKnowledgeScore, icon: Package },
                      { label: 'Sales', value: sim.salesScore, icon: DollarSign },
                    ].map((s, j) => (
                      <div key={j} className="text-center">
                        <p className={`text-base font-bold ${s.value >= 70 ? 'text-emerald-600' : s.value >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                          {s.value}
                        </p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                        <Progress value={s.value} className="h-1 mt-1" />
                      </div>
                    ))}
                  </div>

                  {/* AI Feedback */}
                  {sim.aiFeedback && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">AI Feedback</span>
                      </div>
                      <p className="text-xs text-gray-600">{sim.aiFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation Dialog */}
      <SimulationDialog
        simulationId={selectedSimulationId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onComplete={(attempt) => {
          setSimulations((prev) => [attempt, ...prev])
        }}
      />

      {/* Score Comparison Chart */}
      {barData.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-500" /> Score Comparison Across Simulations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Bar dataKey="Communication" fill="#059669" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Technical" fill="#0d9488" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Product" fill="#d97706" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Sales" fill="#dc2626" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
