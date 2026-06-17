'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  Phone, PhoneCall, PhoneOff, Mic, MicOff, Clock, Target, Lightbulb,
  MessageSquare, Star, CheckCircle2, AlertCircle, ChevronRight,
  Play, Volume2, Users, Building2, Package, Wrench, TrendingUp,
  Handshake, Award, Brain, Zap, BarChart3, RefreshCw, X, ArrowRight,
  Timer, Sparkles, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react'

// ==================== TYPES ====================

interface CallScenario {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  academy: string
  tips: string[]
  objectives: string[]
  icon: any
}

interface CallHistory {
  id: string
  scenario: string
  date: string
  score: number
  duration: string
  feedback: string
}

// ==================== DATA ====================

const CALL_SCENARIOS: CallScenario[] = [
  {
    id: 'minibar-pitch',
    title: 'Mini Bar Product Pitch',
    description: 'Pitch LAXREE minibar solutions to a hotel General Manager who is looking to upgrade their room amenities',
    difficulty: 'Intermediate',
    duration: '8-10 min',
    academy: 'PRODUCT_ACADEMY',
    tips: [
      'Start by understanding their current minibar setup',
      'Ask about their guest demographics and star rating',
      'Highlight energy efficiency and maintenance savings',
      'Mention competitor hotels that have upgraded',
      'Close with a site visit proposal'
    ],
    objectives: [
      'Identify client needs and pain points',
      'Present minibar features that match requirements',
      'Handle at least 2 objections confidently',
      'Propose next steps with timeline'
    ],
    icon: Package
  },
  {
    id: 'safe-box-cross-sell',
    title: 'Safe Box Cross-Sell Call',
    description: 'While discussing minibar orders, pitch safe boxes as a complementary product for hotel rooms',
    difficulty: 'Advanced',
    duration: '10-12 min',
    academy: 'CROSS_SELLING',
    tips: [
      'Wait for the right moment after minibar discussion',
      'Connect both products as in-room essentials',
      'Highlight bundle pricing savings of 30%',
      'Reference other hotels that bought both together',
      'Emphasize same installation timeline convenience'
    ],
    objectives: [
      'Smoothly transition from minibar to safe box pitch',
      'Quantify the bundle savings',
      'Address concerns about budget',
      'Get commitment for both products'
    ],
    icon: RefreshCw
  },
  {
    id: 'rfid-objection',
    title: 'RFID Lock Objection Handling',
    description: 'Handle objections from a cost-conscious hotel owner who thinks RFID locks are too expensive',
    difficulty: 'Advanced',
    duration: '10-15 min',
    academy: 'SALES_ACADEMY',
    tips: [
      'Acknowledge their budget concern first',
      'Show ROI calculation over 3 years',
      'Compare cost per room vs. traditional lock maintenance',
      'Mention security benefits and guest satisfaction',
      'Offer phased installation option'
    ],
    objectives: [
      'Empathize with cost concern without being defensive',
      'Present at least 3 value propositions beyond price',
      'Use specific numbers and calculations',
      'Offer a compromise solution'
    ],
    icon: Handshake
  },
  {
    id: 'inbound-hospitality',
    title: 'Inbound Inquiry Response',
    description: 'Handle an incoming call from a hotel chain interested in bulk orders for their new property',
    difficulty: 'Beginner',
    duration: '5-8 min',
    academy: 'INBOUND_SALES',
    tips: [
      'Greet professionally with company name',
      'Ask qualifying questions early',
      'Note down their requirements carefully',
      'Offer to send catalog and schedule a meeting',
      'Get their contact details and timeline'
    ],
    objectives: [
      'Answer initial questions confidently',
      'Qualify the lead properly',
      'Collect complete contact information',
      'Schedule a follow-up action'
    ],
    icon: PhoneCall
  },
  {
    id: 'kettle-demo-followup',
    title: 'Kettle Demo Follow-Up',
    description: 'Follow up after a product demo of LAXREE kettles, address remaining concerns and close the deal',
    difficulty: 'Intermediate',
    duration: '8-10 min',
    academy: 'FIELD_SALES',
    tips: [
      'Reference specific points from the demo',
      'Ask if they have any new questions',
      'Remind them of the features they liked',
      'Create urgency with limited-time offer',
      'Propose clear next steps'
    ],
    objectives: [
      'Recap demo highlights',
      'Address all remaining objections',
      'Create a sense of urgency',
      'Get verbal commitment or PO'
    ],
    icon: Phone
  },
  {
    id: 'negotiation-bulk',
    title: 'Bulk Order Negotiation',
    description: 'Negotiate pricing for a 200+ room hotel order with a purchase manager who wants maximum discount',
    difficulty: 'Advanced',
    duration: '12-15 min',
    academy: 'NEGOTIATION',
    tips: [
      'Never lead with your best price',
      'Bundle products for better margin flexibility',
      'Use value-based pricing, not cost-plus',
      'Offer value-adds instead of discounts (warranty, installation)',
      'Know your walk-away number'
    ],
    objectives: [
      'Maintain margin above minimum threshold',
      'Close the deal without excessive discounting',
      'Add at least one cross-sell product',
      'Set payment terms favorable to LAXREE'
    ],
    icon: TrendingUp
  },
]

const CALL_HISTORY: CallHistory[] = [
  {
    id: '1',
    scenario: 'Mini Bar Product Pitch',
    date: '2025-12-28',
    score: 82,
    duration: '9:34',
    feedback: 'Good product knowledge. Improve objection handling on pricing.'
  },
  {
    id: '2',
    scenario: 'Inbound Inquiry Response',
    date: '2025-12-25',
    score: 91,
    duration: '6:12',
    feedback: 'Excellent qualifying questions and professional tone.'
  },
  {
    id: '3',
    scenario: 'RFID Lock Objection Handling',
    date: '2025-12-22',
    score: 68,
    duration: '11:45',
    feedback: 'Need more confidence in ROI calculations. Practice the 3-year savings pitch.'
  },
]

const BEST_PRACTICES = [
  {
    title: 'The 30-Second Opening',
    description: 'Start every call with a clear, confident introduction. State your name, company, and purpose within 30 seconds.',
    icon: Zap,
    color: 'from-amber-500 to-orange-500'
  },
  {
    title: 'Ask Before You Pitch',
    description: 'Ask 2-3 qualifying questions before presenting your product. Understanding needs beats any script.',
    icon: Target,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'The Feel-Felt-Found Method',
    description: 'When handling objections: "I understand how you feel. Other clients felt the same. What they found was..."',
    icon: Lightbulb,
    color: 'from-violet-500 to-purple-500'
  },
  {
    title: 'Close with Next Steps',
    description: 'Never end a call without clear next steps. Always propose a specific date, time, and action.',
    icon: CheckCircle2,
    color: 'from-cyan-500 to-blue-500'
  },
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-100 text-green-700 border-green-200'
    case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Advanced': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getAcademyLabel(type: string) {
  const map: Record<string, string> = {
    'PRODUCT_ACADEMY': 'Product Academy',
    'CROSS_SELLING': 'Cross Selling',
    'SALES_ACADEMY': 'Sales Academy',
    'INBOUND_SALES': 'Inbound Sales',
    'FIELD_SALES': 'Field Sales',
    'NEGOTIATION': 'Negotiation',
  }
  return map[type] || type
}

// ==================== PRACTICE SESSION COMPONENT ====================

function PracticeSession({
  scenario,
  onEnd,
}: {
  scenario: CallScenario
  onEnd: (result: { duration: number; objectivesCompleted: boolean[]; ratings: { communication: number; productKnowledge: number; objectionHandling: number } }) => void
}) {
  const [elapsed, setElapsed] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [tipsOpen, setTipsOpen] = useState(false)
  const [callActive, setCallActive] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [objectivesChecked, setObjectivesChecked] = useState<boolean[]>(
    scenario.objectives.map(() => false)
  )
  const [ratings, setRatings] = useState({
    communication: 3,
    productKnowledge: 3,
    objectionHandling: 3,
  })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCallActive(false)
    setShowSummary(true)
  }

  const handleSubmitSummary = () => {
    onEnd({
      duration: elapsed,
      objectivesCompleted: objectivesChecked,
      ratings,
    })
  }

  const totalScore = Math.round(
    ((ratings.communication + ratings.productKnowledge + ratings.objectionHandling) / 15) * 100
  )
  const objectivesPercent = Math.round(
    (objectivesChecked.filter(Boolean).length / scenario.objectives.length) * 100
  )

  const IconComp = scenario.icon

  // ==================== SUMMARY VIEW ====================
  if (showSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Summary Header */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-8" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Practice Complete!</h2>
                <p className="text-white/80 text-sm">{scenario.title}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            {/* Time & Score */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-emerald-700">{formatTime(elapsed)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Time Spent</p>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-xl">
                <Target className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-teal-700">{objectivesPercent}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Objectives</p>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-xl">
                <Star className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-cyan-700">{totalScore}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Overall Score</p>
              </div>
            </div>

            {/* Objectives Self-Assessment */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Objectives Completed (Self-Assessment)
              </h3>
              <div className="space-y-2">
                {scenario.objectives.map((obj, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setObjectivesChecked(prev => {
                        const next = [...prev]
                        next[i] = !next[i]
                        return next
                      })
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      objectivesChecked[i]
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      objectivesChecked[i]
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300'
                    }`}>
                      {objectivesChecked[i] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${objectivesChecked[i] ? 'text-emerald-700 font-medium' : 'text-gray-600'}`}>
                      {obj}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Self-Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Rate Your Performance
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'communication' as const, label: 'Communication Skills', desc: 'Clarity, tone, and professional language' },
                  { key: 'productKnowledge' as const, label: 'Product Knowledge', desc: 'Accuracy and depth of product information' },
                  { key: 'objectionHandling' as const, label: 'Objection Handling', desc: 'Confidence and effectiveness in addressing concerns' },
                ].map(item => (
                  <div key={item.key} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <span className="text-lg font-bold text-emerald-600">{ratings[item.key]}/5</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRatings(prev => ({ ...prev, [item.key]: star }))}
                          className="flex-1 h-8 rounded-lg transition-all"
                        >
                          <Star className={`w-5 h-5 mx-auto transition-all ${
                            star <= ratings[item.key]
                              ? 'text-amber-400 fill-amber-400 scale-110'
                              : 'text-gray-300'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Score</span>
                <span className="text-lg font-bold text-emerald-700">{totalScore}%</span>
              </div>
              <Progress value={totalScore} className="h-2.5 mb-3" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Communication: {Math.round((ratings.communication / 5) * 100)}%</span>
                <span>Knowledge: {Math.round((ratings.productKnowledge / 5) * 100)}%</span>
                <span>Objections: {Math.round((ratings.objectionHandling / 5) * 100)}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
                onClick={handleSubmitSummary}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={handleSubmitSummary}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Scenarios
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ==================== ACTIVE CALL VIEW ====================
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Call Interface */}
      <Card className="border-0 shadow-xl overflow-hidden">
        {/* Active Call Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold uppercase tracking-wider">Live Call</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-mono font-bold">{formatTime(elapsed)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <IconComp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{scenario.title}</h2>
                <p className="text-white/70 text-sm">{scenario.description}</p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Main Call Area */}
            <div className="flex-1 p-5">
              {/* Simulated Phone Interface */}
              <div className="bg-gray-900 rounded-2xl p-6 text-center mb-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.15),transparent_70%)]" />
                <div className="relative">
                  {/* Caller Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">LAXREE Sales Call</p>
                  <p className="text-gray-400 text-sm mb-4">{scenario.title}</p>

                  {/* Call Timer */}
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 font-mono text-2xl font-bold">{formatTime(elapsed)}</span>
                  </div>

                  {/* Call Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setMicOn(!micOn)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        micOn
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {micOn ? (
                        <Mic className="w-6 h-6 text-white" />
                      ) : (
                        <MicOff className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <button
                      onClick={handleEndCall}
                      className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                    >
                      <PhoneOff className="w-7 h-7 text-white" />
                    </button>
                    <button
                      onClick={() => setTipsOpen(!tipsOpen)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        tipsOpen
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <Lightbulb className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Objectives Checklist */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Practice Objectives
                </h3>
                <div className="space-y-2">
                  {scenario.objectives.map((obj, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips Sidebar (collapsible on mobile, always visible on desktop when open) */}
            <AnimatePresence>
              {tipsOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 bg-amber-50/30"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Quick Tips
                    </h3>
                    <ScrollArea className="max-h-80">
                      <div className="space-y-2">
                        {scenario.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                            <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-amber-700">{i + 1}</span>
                            </div>
                            <p className="text-xs text-gray-600">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTipsOpen(false)}
                      className="w-full mt-3 text-gray-500 hover:text-gray-700"
                    >
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Hide Tips
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* End Call Button (Bottom) */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200/50"
              onClick={handleEndCall}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Practice Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== MAIN COMPONENT ====================

export function CallPractice() {
  const [selectedScenario, setSelectedScenario] = useState<CallScenario | null>(null)
  const [tipsDialogOpen, setTipsDialogOpen] = useState(false)
  const [activePractice, setActivePractice] = useState<CallScenario | null>(null)
  const [activeTab, setActiveTab] = useState<'scenarios' | 'history' | 'tips'>('scenarios')
  const [filterAcademy, setFilterAcademy] = useState<string>('ALL')

  const handleStartPractice = useCallback(() => {
    if (selectedScenario) {
      setActivePractice(selectedScenario)
      setTipsDialogOpen(false)
    }
  }, [selectedScenario])

  const handleEndPractice = useCallback(() => {
    setActivePractice(null)
    setSelectedScenario(null)
  }, [])

  const filteredScenarios = filterAcademy === 'ALL'
    ? CALL_SCENARIOS
    : CALL_SCENARIOS.filter(s => s.academy === filterAcademy)

  const academies = ['ALL', ...new Set(CALL_SCENARIOS.map(s => s.academy))]

  // If active practice, show the practice session
  if (activePractice) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndPractice}
            className="text-gray-500 hover:text-gray-700 -ml-2"
          >
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
            Exit Practice
          </Button>
        </motion.div>
        <PracticeSession
          scenario={activePractice}
          onEnd={handleEndPractice}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            Call Practice
          </h1>
          <p className="text-gray-500 mt-1 ml-13">
            Practice sales calls with realistic scenarios and get better every day
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
            <Volume2 className="w-3.5 h-3.5 mr-1.5" />
            {CALL_SCENARIOS.length} Scenarios
          </Badge>
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 px-3 py-1">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Avg: 80%
          </Badge>
        </div>
      </motion.div>

      {/* Call Recording AI — prominent CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shrink-0">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  Want AI to analyze your real sales calls?
                  <Badge className="bg-emerald-500 text-white text-[10px] border-0">NEW</Badge>
                </h3>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Upload a recording of your actual sales call and our Expert AI Sales Assistant will analyze your pitch, identify the client&apos;s hotel profile (ARR, property type, stage, location), give you a short &amp; sweet recommended pitch, and guide you on building interest.
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md font-semibold text-sm gap-2 shrink-0"
                onClick={() => useAuthStore.getState().setCurrentView('call-analysis')}
              >
                <Mic className="w-4 h-4" />
                Open Call Recording AI
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: 'scenarios', label: 'Scenarios', icon: PhoneCall },
            { key: 'history', label: 'Recent Calls', icon: Clock },
            { key: 'tips', label: 'Best Practices', icon: Lightbulb },
          ].map(tab => (
            <Button
              key={tab.key}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 h-9 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'scenarios' && (
          <motion.div
            key="scenarios"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Academy Filter */}
            <div className="flex gap-2 flex-wrap">
              {academies.map(academy => (
                <Button
                  key={academy}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterAcademy(academy)}
                  className={`h-8 text-xs ${
                    filterAcademy === academy
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {academy === 'ALL' ? 'All Academies' : getAcademyLabel(academy)}
                </Button>
              ))}
            </div>

            {/* Scenario Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScenarios.map((scenario, index) => {
                const IconComp = scenario.icon
                return (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 border-gray-100 hover:border-emerald-200 h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                            <IconComp className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">{scenario.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{scenario.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-100">
                            <Timer className="w-3 h-3 mr-1" />
                            {scenario.duration}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-100">
                            {getAcademyLabel(scenario.academy)}
                          </Badge>
                        </div>

                        {/* Objectives Preview */}
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Objectives</p>
                          <div className="space-y-1">
                            {scenario.objectives.slice(0, 2).map((obj, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-xs text-gray-600">{obj}</span>
                              </div>
                            ))}
                            {scenario.objectives.length > 2 && (
                              <span className="text-xs text-emerald-600 ml-5">+{scenario.objectives.length - 2} more</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200 h-9 text-xs"
                            onClick={() => {
                              setSelectedScenario(scenario)
                              setTipsDialogOpen(true)
                            }}
                          >
                            <Play className="w-3.5 h-3.5 mr-1.5" />
                            Start Practice
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                            onClick={() => {
                              setSelectedScenario(scenario)
                              setTipsDialogOpen(true)
                            }}
                          >
                            <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
                            Tips
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card className="border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Recent Call History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
                  <div className="divide-y divide-gray-50">
                    {CALL_HISTORY.map((call, index) => (
                      <motion.div
                        key={call.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 hover:bg-emerald-50/30 transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          call.score >= 80 ? 'bg-emerald-100' : call.score >= 60 ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-lg font-bold ${
                            call.score >= 80 ? 'text-emerald-700' : call.score >= 60 ? 'text-amber-700' : 'text-red-700'
                          }`}>{call.score}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 text-sm">{call.scenario}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{call.feedback}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-500">{new Date(call.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {call.duration}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'tips' && (
          <motion.div
            key="tips"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BEST_PRACTICES.map((practice, index) => {
                const IconComp = practice.icon
                return (
                  <motion.div
                    key={practice.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="group hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 border-gray-100 hover:border-emerald-200 h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 bg-gradient-to-br ${practice.color} rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
                            <IconComp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm mb-2">{practice.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{practice.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Stats */}
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Your Call Practice Stats
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700">{CALL_HISTORY.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Calls</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-700">
                      {CALL_HISTORY.length > 0 ? Math.round(CALL_HISTORY.reduce((a, c) => a + c.score, 0) / CALL_HISTORY.length) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700">{CALL_SCENARIOS.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Available Scenarios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-700">3</p>
                    <p className="text-xs text-gray-500 mt-1">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Practice Tips Dialog */}
      <Dialog open={tipsDialogOpen} onOpenChange={setTipsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedScenario && (
                <>
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <selectedScenario.icon className="w-4 h-4 text-white" />
                  </div>
                  {selectedScenario.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Review these tips before starting your practice call
            </DialogDescription>
          </DialogHeader>
          {selectedScenario && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(selectedScenario.difficulty)}`}>
                  {selectedScenario.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-100">
                  <Timer className="w-3 h-3 mr-1" />
                  {selectedScenario.duration}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Call Tips
                </h4>
                <div className="space-y-2">
                  {selectedScenario.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-amber-50/50 rounded-lg">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-amber-700">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gray-600">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Practice Objectives
                </h4>
                <div className="space-y-1.5">
                  {selectedScenario.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
                  onClick={handleStartPractice}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Practice Call
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTipsDialogOpen(false)}
                  className="border-gray-200"
                >
                  Later
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
