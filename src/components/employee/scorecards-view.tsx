'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Target, Trophy, Medal, ChevronDown, Award, Sparkles,
  MessageSquare, CheckCircle2, XCircle, TrendingUp, BarChart3
} from 'lucide-react'

interface ScorecardData {
  id: string
  examName: string
  date: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  scorePercentage: number
  rank: number | null
  departmentRank: number | null
  companyRank: number | null
  passStatus: boolean
  certificationStatus: string | null
  improvementSuggestions: string | null
  managerFeedback: string | null
  aiFeedback: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
}

function getMedalIcon(rank: number | null) {
  if (rank === 1) return <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><Trophy className="w-4 h-4 text-yellow-500" /></div>
  if (rank === 2) return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><Medal className="w-4 h-4 text-gray-400" /></div>
  if (rank === 3) return <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center"><Medal className="w-4 h-4 text-amber-600" /></div>
  return null
}

const DEMO_SCORECARDS: ScorecardData[] = [
  {
    id: 'demo1',
    examName: 'Product Knowledge Assessment',
    date: new Date().toISOString(),
    totalQuestions: 25,
    correctAnswers: 20,
    wrongAnswers: 5,
    scorePercentage: 80,
    rank: 3,
    departmentRank: 2,
    companyRank: 8,
    passStatus: true,
    certificationStatus: 'pending_approval',
    improvementSuggestions: 'Focus on advanced product features and competitive comparison. Review Module 7-9 for deeper understanding.',
    managerFeedback: 'Great improvement from last attempt! Keep building on product knowledge depth.',
    aiFeedback: 'Strong performance overall. Your product knowledge is above average. Consider exploring the Competitive Intelligence Academy to strengthen your comparative analysis skills.',
  },
  {
    id: 'demo2',
    examName: 'Sales Methodology Test',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalQuestions: 30,
    correctAnswers: 18,
    wrongAnswers: 12,
    scorePercentage: 60,
    rank: 12,
    departmentRank: 5,
    companyRank: 28,
    passStatus: false,
    certificationStatus: 'failed',
    improvementSuggestions: 'Need to strengthen understanding of sales frameworks. Review the Sales Academy modules, especially objection handling and closing techniques.',
    managerFeedback: null,
    aiFeedback: 'Your sales methodology foundation needs reinforcement. Recommended: Complete the Negotiation Academy and practice mock sales scenarios before re-attempting.',
  },
]

export function ScorecardsView() {
  const [scorecards, setScorecards] = useState<ScorecardData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=EMPLOYEE`)
        if (res.ok) {
          const json = await res.json()
          const fetchedScorecards = json.scorecards || []
          // If no real scorecards, use demo data
          if (fetchedScorecards.length === 0) {
            setScorecards(DEMO_SCORECARDS)
          } else {
            setScorecards(fetchedScorecards)
          }
        } else {
          // API failed, use demo data
          setScorecards(DEMO_SCORECARDS)
        }
      } catch (err) {
        console.error('Failed to fetch scorecards:', err)
        setScorecards(DEMO_SCORECARDS)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    )
  }

  const passedCount = scorecards.filter(s => s.passStatus).length
  const failedCount = scorecards.filter(s => !s.passStatus).length

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Scorecards</h2>
          <p className="text-sm text-gray-500 mt-0.5">Detailed results from all your assessments</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> {passedCount} Passed
          </Badge>
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" /> {failedCount} Failed
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{passedCount}</p>
              <p className="text-xs text-gray-500">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{failedCount}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {scorecards.length > 0 ? Math.round(scorecards.reduce((a, s) => a + s.scorePercentage, 0) / scorecards.length) : 0}%
              </p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                #{scorecards[0]?.rank || '—'}
              </p>
              <p className="text-xs text-gray-500">Best Rank</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scorecard Cards */}
      {scorecards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">No Scorecards Yet</h3>
            <p className="text-gray-400 mt-1">Complete an assessment to see your scorecard here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scorecards.map((sc) => (
            <motion.div key={sc.id} variants={itemVariants}>
              <Card className={`overflow-hidden shadow-sm ${sc.passStatus ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'}`}>
                {/* Header with color coding */}
                <div className={`px-6 py-4 ${
                  sc.passStatus
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50'
                    : 'bg-gradient-to-r from-red-50 to-orange-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getMedalIcon(sc.rank)}
                      <div>
                        <h3 className="font-bold text-gray-900">{sc.examName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(sc.date).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        sc.passStatus
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }>
                        {sc.passStatus ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Pass</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Fail</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Score Stats */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-gray-900">{sc.scorePercentage}%</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-emerald-600">{sc.correctAnswers}</p>
                      <p className="text-xs text-gray-500">Correct</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-red-500">{sc.wrongAnswers}</p>
                      <p className="text-xs text-gray-500">Wrong</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-gray-900">{sc.totalQuestions}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-gray-900">#{sc.rank || '—'}</p>
                      <p className="text-xs text-gray-500">Rank</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-gray-900">#{sc.companyRank || '—'}</p>
                      <p className="text-xs text-gray-500">Company</p>
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Score</span>
                      <span>Pass threshold: 70%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          sc.passStatus ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${Math.min(sc.scorePercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Certification Status */}
                  {sc.certificationStatus && (
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-gray-600">Certification Status:</span>
                      <Badge className={
                        sc.certificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        sc.certificationStatus === 'pending_approval' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        sc.certificationStatus === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {sc.certificationStatus.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  )}

                  {/* Expandable Sections */}
                  <div className="space-y-2">
                    {sc.improvementSuggestions && (
                      <Collapsible
                        open={expandedId === sc.id + '_improvement'}
                        onOpenChange={(open) => setExpandedId(open ? sc.id + '_improvement' : null)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                            <span className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-amber-500" />
                              Improvement Suggestions
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === sc.id + '_improvement' ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mt-1">
                            <p className="text-sm text-gray-700">{sc.improvementSuggestions}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {sc.managerFeedback && (
                      <Collapsible
                        open={expandedId === sc.id + '_manager'}
                        onOpenChange={(open) => setExpandedId(open ? sc.id + '_manager' : null)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                            <span className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-teal-500" />
                              Manager Feedback
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === sc.id + '_manager' ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-3 bg-teal-50 rounded-lg border border-teal-100 mt-1">
                            <p className="text-sm text-gray-700">{sc.managerFeedback}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {sc.aiFeedback && (
                      <Collapsible
                        open={expandedId === sc.id + '_ai'}
                        onOpenChange={(open) => setExpandedId(open ? sc.id + '_ai' : null)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-500" />
                              AI Feedback
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === sc.id + '_ai' ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mt-1">
                            <p className="text-sm text-gray-700">{sc.aiFeedback}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
