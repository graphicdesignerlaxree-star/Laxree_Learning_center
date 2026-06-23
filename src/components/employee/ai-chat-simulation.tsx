'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare, Send, Bot, User, Sparkles, ChevronRight,
  Building2, ShieldCheck, Hotel, Star, Trophy, Target,
  BookOpen, Handshake, Briefcase, ArrowLeft, RotateCcw,
  CheckCircle2, TrendingUp, AlertCircle, X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  icon: React.ElementType
  clientName: string
  clientRole: string
  tags: string[]
  color: string
  bgGradient: string
  iconBg: string
}

interface ScoreResult {
  scores: {
    responseQuality: number
    productKnowledge: number
    salesTechnique: number
    closingAbility: number
    professionalism: number
  }
  overallScore: number
  strengths: string[]
  improvements: string[]
  feedback: string
  clientName: string
  clientRole: string
  messageCount: number
}

type Phase = 'select' | 'chat' | 'scoring'

// ─── Scenario Data ───────────────────────────────────────────────────────────

// AMENITIES scenarios (hospitality — minibars, safes, RFID locks, kettles)
const AMENITIES_CHAT_SCENARIOS: Scenario[] = [
  {
    id: 'hotel-minibar',
    title: 'Hotel Mini Bar Inquiry',
    description: 'A hotel owner is outfitting a new 150-room property and needs mini bars for every room. Navigate pricing, product selection, and close the deal.',
    difficulty: 'Beginner',
    icon: Building2,
    clientName: 'Rajesh Mehta',
    clientRole: 'Hotel Owner',
    tags: ['Mini Bars', 'New Property', 'Pricing'],
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 'bulk-safes',
    title: 'Bulk Safe Box Order',
    description: 'A procurement manager needs 2,000 safe boxes across 12 hotel properties. Demonstrate deep product knowledge, compliance expertise, and enterprise selling.',
    difficulty: 'Intermediate',
    icon: ShieldCheck,
    clientName: 'Sarah Chen',
    clientRole: 'Procurement Manager',
    tags: ['Safe Boxes', 'Bulk Order', 'Compliance'],
    color: 'text-teal-600',
    bgGradient: 'from-teal-50 to-teal-100/50',
    iconBg: 'bg-teal-100',
  },
  {
    id: 'resort-complete',
    title: 'Complete Room Solution',
    description: 'A luxury resort GM wants a single-vendor solution for locks, minibars, safes, and kettles across 300 rooms. Showcase full product portfolio and consultative selling.',
    difficulty: 'Advanced',
    icon: Hotel,
    clientName: 'David Okafor',
    clientRole: 'Resort General Manager',
    tags: ['Full Solution', 'Luxury', 'Integration'],
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-amber-100/50',
    iconBg: 'bg-amber-100',
  },
]

// ROOFING scenarios (premium roofing — stone-coated, thatch, asphalt shingle tiles)
const ROOFING_CHAT_SCENARIOS: Scenario[] = [
  {
    id: 'roofing-villa-homeowner',
    title: 'Homeowner Villa Roofing',
    description: 'A homeowner is building a premium 5,000 sq ft villa in Pune and needs a long-lasting, elegant roof. Pitch Laxree stone-coated tiles, navigate profiles vs clay, and close the deal.',
    difficulty: 'Beginner',
    icon: Building2,
    clientName: 'Vikram Mehta',
    clientRole: 'Homeowner, Pune',
    tags: ['Stone Coated Tiles', 'New Villa', 'Premium Roofing'],
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-orange-100/50',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'roofing-builder-bulk',
    title: 'Builder Bulk Roofing Order',
    description: 'A project director is constructing a 50-villa township in Bangalore and needs roofing for all villas. Demonstrate profile depth, weather performance, and bulk-order value engineering.',
    difficulty: 'Intermediate',
    icon: Handshake,
    clientName: 'Rajiv Khanna',
    clientRole: 'Project Director, Skyline Builders',
    tags: ['Stone Coated Tiles', '50-Villa Project', 'Bulk Order'],
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-amber-100/50',
    iconBg: 'bg-orange-100',
  },
  {
    id: 'roofing-resort-package',
    title: 'Resort Roofing Package',
    description: 'A resort architect in Kerala wants a complete roofing package across main buildings, gazebos and poolside cabanas. Showcase stone-coated + thatch + shingle portfolio and consultative design.',
    difficulty: 'Advanced',
    icon: Hotel,
    clientName: 'Priya Nair',
    clientRole: 'Resort Architect, Kerala',
    tags: ['Multi-Product', 'Stone Coated + Thatch', 'Resort'],
    color: 'text-red-600',
    bgGradient: 'from-rose-50 to-amber-100/50',
    iconBg: 'bg-rose-100',
  },
  {
    id: 'roofing-thatch-cross-sell',
    title: 'Thatch Tile Cross-Sell',
    description: 'A resort owner in Goa called about stone-coated tiles for the main roof — pitch artificial thatch tiles for the gazebos, tiki bar and poolside cabanas as a complementary product line.',
    difficulty: 'Intermediate',
    icon: Sparkles,
    clientName: 'Arjun Reddy',
    clientRole: 'Resort Owner, Goa',
    tags: ['Artificial Thatch', 'Gazebos & Cabanas', 'Cross-Sell'],
    color: 'text-yellow-700',
    bgGradient: 'from-yellow-50 to-amber-100/50',
    iconBg: 'bg-yellow-100',
  },
]

// Lookup for explicit Tailwind button classes per scenario id (keeps Tailwind's
// purger happy — dynamic class strings would otherwise be stripped out).
const SCENARIO_BUTTON_BG: Record<string, string> = {
  'hotel-minibar': 'bg-emerald-600 hover:bg-emerald-700',
  'bulk-safes': 'bg-teal-600 hover:bg-teal-700',
  'resort-complete': 'bg-amber-600 hover:bg-amber-700',
  'roofing-villa-homeowner': 'bg-amber-600 hover:bg-amber-700',
  'roofing-builder-bulk': 'bg-orange-600 hover:bg-orange-700',
  'roofing-resort-package': 'bg-rose-600 hover:bg-rose-700',
  'roofing-thatch-cross-sell': 'bg-yellow-600 hover:bg-yellow-700',
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
  Advanced: 'bg-red-100 text-red-700 border-red-200',
}

const SCORE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  responseQuality: { label: 'Response Quality', icon: MessageSquare },
  productKnowledge: { label: 'Product Knowledge', icon: BookOpen },
  salesTechnique: { label: 'Sales Technique', icon: Target },
  closingAbility: { label: 'Closing Ability', icon: Handshake },
  professionalism: { label: 'Professionalism', icon: Briefcase },
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

function getProgressColor(score: number): string {
  if (score >= 80) return '[&>div]:bg-emerald-500'
  if (score >= 60) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-red-500'
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AIChatSimulation() {
  const [phase, setPhase] = useState<Phase>('select')
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((s) => s.user)
  const isRoofing = user?.company === 'ROOFING'
  const SCENARIOS = isRoofing ? ROOFING_CHAT_SCENARIOS : AMENITIES_CHAT_SCENARIOS
  // Theme tokens — amber/orange for Roofing, emerald/teal for Amenities
  const accentBg = isRoofing ? 'bg-amber-100' : 'bg-emerald-100'
  const accentText = isRoofing ? 'text-amber-600' : 'text-emerald-600'
  const accentTextStrong = isRoofing ? 'text-amber-700' : 'text-emerald-700'
  const accentBtn = isRoofing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
  const accentBtnBorder = isRoofing
    ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 hover:border-amber-700'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700'
  const accentInputFocus = isRoofing
    ? 'focus:ring-amber-300 focus:border-amber-400'
    : 'focus:ring-emerald-300 focus:border-emerald-400'
  const accentUserBubble = isRoofing ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
  const accentGradient = isRoofing
    ? 'from-amber-50 to-orange-50 border-amber-100'
    : 'from-emerald-50 to-teal-50 border-emerald-100'

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when chat phase starts
  useEffect(() => {
    if (phase === 'chat' && !isTyping) {
      inputRef.current?.focus()
    }
  }, [phase, isTyping])

  // ─── Start Chat ──────────────────────────────────────────────────────────

  const startChat = useCallback(async (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setMessages([])
    setError(null)
    setPhase('chat')
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai-chat-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenario.id,
          messages: [],
        }),
      })

      if (!res.ok) throw new Error('Failed to start chat')

      const data = await res.json()

      const openingMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.message || data.openingMessage || `Hello, I'm ${scenario.clientName}. I'm interested in your products.`,
        timestamp: new Date(),
      }

      setMessages([openingMessage])
    } catch (err) {
      console.error('Failed to start chat:', err)
      // Fallback opening message
      const fallbackOpenings: Record<string, string> = {
        'hotel-minibar': "Hi, I'm Rajesh Mehta. We're setting up a new 150-room hotel in Mumbai and I need mini bars for all rooms. What does LAXREE offer?",
        'bulk-safes': "Hello, this is Sarah Chen from Pacific Hotels Group. We need approximately 2,000 safe boxes across our 12 properties. Can you tell me about your product range and certifications?",
        'resort-complete': "Good day. I'm David Okafor, GM of Sunset Beach Resort in Dubai. We're opening a 300-room luxury property and I'm looking for a single vendor who can handle all our in-room amenities — locks, minibars, safes, and kettles. Does LAXREE do complete packages?",
        'roofing-villa-homeowner': "Hi, I'm Vikram Mehta. We're building a 5,000 sq ft villa in Pune and our architect suggested premium roofing. I've only ever used clay tiles. What is this stone-coated tile you're offering?",
        'roofing-builder-bulk': "Hello, this is Rajiv Khanna from Skyline Builders. We're constructing a 50-villa township in Bangalore and need roofing for every villa. I have quotes from two competitors — one clay, one concrete. What's your best price on stone-coated tiles at this volume?",
        'roofing-resort-package': "Good day. I'm Priya Nair, the architect for a resort project in Kerala. We need a complete roofing package — stone-coated tiles for the 20 main buildings, plus something aesthetic for the gazebos and poolside cabanas. Can Laxree handle the full scope?",
        'roofing-thatch-cross-sell': "Hi, I'm Arjun Reddy, owner of a beachside resort in Goa. We were planning to use stone-coated tiles for the main roofs. Someone mentioned you also do artificial thatch — is that something worth looking at for our tiki bar and cabanas?",
      }
      const fallback: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: fallbackOpenings[scenario.id] || `Hello, I'm ${scenario.clientName}. I'm interested in your products.`,
        timestamp: new Date(),
      }
      setMessages([fallback])
    } finally {
      setIsTyping(false)
    }
  }, [])

  // ─── Send Message ────────────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || !selectedScenario) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)
    setError(null)

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai-chat-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario.id,
          messages: apiMessages,
        }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to get a response. Please try again.')

      // Fallback AI response
      const fallbacks = [
        "That's an interesting point. Can you elaborate on how that would work for our specific situation?",
        "I see. And what about warranty and support? That's crucial for our operations.",
        "OK, noted. How does that compare to other options in the market?",
        "Thanks for the info. What would be the next steps if we decide to move forward?",
      ]
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, selectedScenario, messages])

  // ─── End Chat & Get Score ────────────────────────────────────────────────

  const endChat = useCallback(async () => {
    if (!selectedScenario || messages.length < 2) return

    setIsScoring(true)
    setPhase('scoring')

    try {
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai-chat-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario.id,
          messages: apiMessages,
          endChat: true,
        }),
      })

      if (!res.ok) throw new Error('Failed to get scores')

      const data = await res.json()
      setScoreResult(data)
    } catch (err) {
      console.error('Failed to get scores:', err)
      // Fallback scoring
      const userMsgCount = messages.filter((m) => m.role === 'user').length
      setScoreResult({
        scores: {
          responseQuality: Math.min(85, 50 + userMsgCount * 3),
          productKnowledge: Math.min(80, 45 + userMsgCount * 2),
          salesTechnique: Math.min(70, 40 + userMsgCount * 2),
          closingAbility: Math.min(65, 35 + userMsgCount * 2),
          professionalism: Math.min(88, 55 + userMsgCount * 2),
        },
        overallScore: Math.min(78, 45 + userMsgCount * 3),
        strengths: [
          'Good engagement with the client throughout the conversation',
          'Professional and respectful communication style',
          'Showed willingness to address client concerns',
        ],
        improvements: [
          'Deepen product knowledge to provide more specific, confident answers',
          'Practice consultative selling — ask more questions before pitching',
          'Work on closing techniques and proposing clear next steps',
        ],
        feedback: 'You demonstrated solid engagement and professionalism. Focus on deepening your LAXREE product knowledge so you can provide specific, confident recommendations. Practice asking probing questions before presenting solutions, and work on naturally guiding the conversation toward a close.',
        clientName: selectedScenario.clientName,
        clientRole: selectedScenario.clientRole,
        messageCount: messages.length,
      })
    } finally {
      setIsScoring(false)
    }
  }, [selectedScenario, messages])

  // ─── Reset ───────────────────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    setPhase('select')
    setSelectedScenario(null)
    setMessages([])
    setInput('')
    setIsTyping(false)
    setScoreResult(null)
    setIsScoring(false)
    setError(null)
  }, [])

  // ─── Render: Scenario Selection ──────────────────────────────────────────

  if (phase === 'select') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center`}>
              <MessageSquare className={`w-5 h-5 ${accentText}`} />
            </div>
            AI Chat Simulation
          </h1>
          <p className="text-gray-500 mt-1 ml-13">
            {isRoofing
              ? 'Practice roofing sales conversations via text chat with AI-powered homeowners, builders and architects'
              : 'Practice sales conversations via text chat with AI-powered hotel clients'}
          </p>
        </div>

        {/* Info Card */}
        <Card className={`bg-gradient-to-r ${accentGradient}`}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
              <Sparkles className={`w-5 h-5 ${accentText}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${accentTextStrong}`}>How It Works</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {isRoofing ? (
                  <>Pick a scenario below, and you&apos;ll be connected to an AI simulating a potential roofing client — a homeowner, builder or architect — via business chat. Respond naturally — the AI will ask questions about project details, roof area, budget, timeline, and specific tile preferences. When you&apos;re done, end the chat to get a detailed performance score with AI-generated feedback.</>
                ) : (
                  <>Pick a scenario below, and you&apos;ll be connected to an AI simulating a potential hotel client via business chat. Respond naturally — the AI will ask questions about property details, budget, timeline, and specific needs. When you&apos;re done, end the chat to get a detailed performance score with AI-generated feedback.</>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SCENARIOS.map((scenario, index) => {
            const Icon = scenario.icon
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="h-full"
              >
                <Card
                  className={`relative cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${scenario.bgGradient} group h-full overflow-hidden`}
                  onClick={() => startChat(scenario)}
                >
                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                    scenario.id === 'hotel-minibar' ? 'from-emerald-500 to-teal-500'
                    : scenario.id === 'bulk-safes' ? 'from-teal-500 to-cyan-500'
                    : scenario.id === 'resort-complete' ? 'from-amber-500 to-orange-500'
                    : scenario.id === 'roofing-villa-homeowner' ? 'from-amber-500 to-orange-500'
                    : scenario.id === 'roofing-builder-bulk' ? 'from-orange-500 to-red-500'
                    : scenario.id === 'roofing-resort-package' ? 'from-rose-500 to-amber-500'
                    : 'from-yellow-500 to-amber-500'
                  }`} />
                  <CardContent className="p-6 pt-7 flex flex-col h-full">
                    {/* Icon + Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${scenario.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-6 h-6 ${scenario.color}`} />
                      </div>
                      <Badge className={`${DIFFICULTY_STYLES[scenario.difficulty]} rounded-full px-2.5 py-0.5`} variant="outline">
                        {scenario.difficulty}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-800 mb-2">{scenario.title}</h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
                      {scenario.description}
                    </p>

                    {/* Client Info */}
                    <div className="flex items-center gap-2 mb-4 p-2 bg-white/60 rounded-lg">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className={`${scenario.iconBg} text-xs ${scenario.color} font-medium`}>
                          {scenario.clientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{scenario.clientName}</p>
                        <p className="text-[10px] text-gray-400">{scenario.clientRole}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {scenario.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/70 text-gray-500 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Start Button */}
                    <Button
                      className={`w-full ${SCENARIO_BUTTON_BG[scenario.id] || accentBtn} text-white`}
                      size="sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Start Chat
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // ─── Render: Chat Phase ──────────────────────────────────────────────────

  if (phase === 'chat') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
        <Card className="flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
          {/* Chat Header */}
          <CardHeader className={`pb-3 border-b bg-gradient-to-r ${accentGradient} shrink-0`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAll}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9">
                  <AvatarFallback className={`${accentBg} ${accentTextStrong} text-xs font-semibold`}>
                    {selectedScenario?.clientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-800">
                    {selectedScenario?.clientName}
                  </CardTitle>
                  <p className="text-[10px] text-gray-400">{selectedScenario?.clientRole} • {selectedScenario?.title}</p>
                </div>
                <Badge variant="outline" className="text-[10px] ml-1">
                  <Bot className={`w-2.5 h-2.5 mr-1 ${accentText}`} />
                  AI Client
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {messages.filter(m => m.role === 'user').length} messages
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={endChat}
                  disabled={messages.filter(m => m.role === 'user').length < 2}
                  className={`text-xs ${accentBtnBorder} h-7`}
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  End Chat & Get Score
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {msg.role === 'assistant' ? (
                    <Avatar className="w-7 h-7 shrink-0 mb-5">
                      <AvatarFallback className={`${accentBg} ${accentTextStrong} text-[10px] font-semibold`}>
                        {selectedScenario?.clientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="w-7 h-7 shrink-0 mb-5">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px] font-semibold">
                        <User className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Bubble */}
                  <div>
                    {msg.role === 'assistant' && (
                      <p className="text-[10px] text-gray-400 mb-1 ml-1">{selectedScenario?.clientName}</p>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? `${accentUserBubble} rounded-br-sm`
                        : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-end gap-2"
              >
                <Avatar className="w-7 h-7 shrink-0">
                  <AvatarFallback className={`${accentBg} ${accentTextStrong} text-[10px] font-semibold`}>
                    {selectedScenario?.clientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1 ml-1">{selectedScenario?.clientName}</p>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Toast */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${accentInputFocus} bg-white`}
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className={`${accentBtn} text-white rounded-xl px-4 h-10`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Respond as a {isRoofing ? 'Laxree Roofing' : 'LAXREE'} sales representative • End the chat when you feel the conversation is complete
            </p>
          </div>
        </Card>
      </motion.div>
    )
  }

  // ─── Render: Scoring Phase ───────────────────────────────────────────────

  if (phase === 'scoring') {
    // Loading state
    if (isScoring) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <div className={`w-16 h-16 border-4 ${isRoofing ? 'border-amber-200 border-t-amber-600' : 'border-emerald-200 border-t-emerald-600'} rounded-full`} />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Analyzing Your Performance</h3>
              <p className="text-sm text-gray-400">AI is reviewing your conversation and preparing detailed feedback...</p>
            </CardContent>
          </Card>
        </motion.div>
      )
    }

    // Score display
    if (scoreResult) {
      const overallGrade = scoreResult.overallScore >= 80 ? 'Excellent' : scoreResult.overallScore >= 60 ? 'Good' : scoreResult.overallScore >= 40 ? 'Fair' : 'Needs Work'
      const gradeEmoji = scoreResult.overallScore >= 80 ? '🏆' : scoreResult.overallScore >= 60 ? '👍' : scoreResult.overallScore >= 40 ? '📚' : '💪'

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center`}>
                  <Trophy className={`w-5 h-5 ${accentText}`} />
                </div>
                Chat Simulation Results
              </h1>
              <p className="text-gray-500 mt-1 ml-13">
                {selectedScenario?.title} • Client: {scoreResult.clientName}
              </p>
            </div>
            <Button variant="outline" onClick={resetAll} className="text-sm">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </Button>
          </div>

          {/* Overall Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${isRoofing ? 'from-amber-50 via-white to-orange-50 border-amber-100' : 'from-emerald-50 via-white to-teal-50 border-emerald-100'} overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Score Circle */}
                  <div className="relative">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke={scoreResult.overallScore >= 80 ? '#059669' : scoreResult.overallScore >= 60 ? '#d97706' : '#dc2626'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - scoreResult.overallScore / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(scoreResult.overallScore)}`}>
                        {scoreResult.overallScore}
                      </span>
                      <span className="text-[10px] text-gray-400">out of 100</span>
                    </div>
                  </div>

                  {/* Grade + Stats */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className="text-2xl">{gradeEmoji}</span>
                      <h2 className={`text-xl font-bold ${getScoreColor(scoreResult.overallScore)}`}>
                        {overallGrade}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Conversation with {scoreResult.clientName} ({scoreResult.clientRole})
                    </p>
                    <div className="flex items-center gap-4 justify-center sm:justify-start">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-700">{scoreResult.messageCount}</p>
                        <p className="text-[10px] text-gray-400">Messages</p>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-700">
                          {messages.filter(m => m.role === 'user').length}
                        </p>
                        <p className="text-[10px] text-gray-400">Your Replies</p>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="text-center">
                        <p className={`text-lg font-bold ${getScoreColor(scoreResult.overallScore)}`}>
                          {overallGrade}
                        </p>
                        <p className="text-[10px] text-gray-400">Grade</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(scoreResult.scores).map(([key, value], index) => {
              const config = SCORE_LABELS[key]
              if (!config) return null
              const Icon = config.icon
              const score = value as number

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${score >= 80 ? 'bg-emerald-100' : score >= 60 ? 'bg-amber-100' : 'bg-red-100'}`}>
                          <Icon className={`w-4 h-4 ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-500 leading-tight">{config.label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${getScoreColor(score)} mb-2`}>{score}</p>
                      <Progress value={score} className={`h-2 ${getProgressColor(score)}`} />
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full border-emerald-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {scoreResult.strengths.map((strength, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-lg">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-600">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Improvements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full border-amber-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
                    <AlertCircle className="w-4 h-4" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {scoreResult.improvements.map((improvement, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-50 rounded-lg">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Star className="w-3 h-3 text-amber-600" />
                        </div>
                        <p className="text-sm text-gray-600">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className={`bg-gradient-to-r ${accentGradient}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Sparkles className={`w-5 h-5 ${accentText}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${accentTextStrong} mb-2`}>AI Coach Feedback</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{scoreResult.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-3"
          >
            <Button onClick={resetAll} className={`${accentBtn} text-white`}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Another Scenario
            </Button>
          </motion.div>
        </motion.div>
      )
    }

    return null
  }

  return null
}
