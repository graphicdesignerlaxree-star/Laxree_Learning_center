'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Phone, PhoneOff, Send, Sparkles, Building2, Hotel, Wrench,
  ChevronRight, Clock, Star, TrendingUp, MessageSquare, Target,
  Award, Zap, CheckCircle2, AlertCircle, ArrowRight, RotateCcw,
  Mic, MicOff, Volume2, Home, Hammer, Compass
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface CallScores {
  communication: number
  salesTechnique: number
  productKnowledge: number
  closingSkills: number
  enthusiasm: number
  overallScore: number
  closingEffectiveness: number
  excitementLevel: number
  keyQuestionsAsked: string[]
  keyQuestionsMissed: string[]
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  nextSteps: string[]
}

interface ScenarioInfo {
  id: string
  name: string
  difficulty: string
  focusAreas: string[]
  openingMessage: string
}

type CallPhase = 'setup' | 'active' | 'ended'

// ─── Scenarios (segment-aware) ───────────────────────────────────────

// AMENITIES scenarios (hospitality / hotel) — original LAXREE Hospitality line
const AMENITIES_SCENARIOS: ScenarioInfo[] = [
  {
    id: 'luxury_resort',
    name: 'Luxury Resort',
    difficulty: 'Advanced',
    focusAreas: ['Premium positioning', 'Quality emphasis', 'Customization options', 'Brand alignment'],
    openingMessage: `Hello, I'm Arjun Mehta, GM at The Royal Palms Resort & Spa in Goa. I received your email about your hospitality product line. We're currently reviewing our in-room amenities — our current mini bar and safe suppliers haven't been meeting our quality standards. What can you tell me about your products?`,
  },
  {
    id: 'business_hotel',
    name: 'Business Hotel',
    difficulty: 'Intermediate',
    focusAreas: ['Value proposition', 'Bulk pricing', 'Durability & warranty', 'Installation support'],
    openingMessage: `Hi, this is Priya Sharma from Metro Heights Business Hotel. We're in the final stages of renovation and I'm looking for in-room amenities — mini bars, safes, and kettles. Our property has 120 rooms and we're targeting corporate clientele. Can you give me a quick overview of what you offer and pricing?`,
  },
  {
    id: 'budget_hotel_renovation',
    name: 'Budget Hotel Renovation',
    difficulty: 'Beginner',
    focusAreas: ['ROI demonstration', 'Budget-friendly options', 'Practical benefits', 'Closing with urgency'],
    openingMessage: `Hello, I'm Ramesh Kulkarni, owner of City Comfort Inn near Pune airport. One of my friends who runs a hotel suggested I talk to you. Honestly, I'm not sure if we need fancy in-room amenities — we're a budget hotel and our guests just want a clean room. But I'm open to hearing your thoughts. What makes you think your products would work for a property like mine?`,
  },
]

// ROOFING scenarios (Laxree Roofing — premium stone-coated, thatch, asphalt shingle roof tiles)
const ROOFING_SCENARIOS: ScenarioInfo[] = [
  {
    id: 'homeowner_villa',
    name: 'Homeowner — Premium Villa',
    difficulty: 'Advanced',
    focusAreas: ['Premium positioning', 'Lifespan & warranty', 'Aesthetics & profiles', 'Weather resistance'],
    openingMessage: `Hello, I'm Vikram Mehta. We're building a 5,000 sq ft villa in Pune and our architect suggested premium roofing instead of regular clay tiles. Honestly, I've only ever used clay tiles on previous homes and I'm not familiar with stone-coated roofing. I want something elegant and long-lasting, but I need to understand why I should pay more. What can you tell me about your Laxree tiles?`,
  },
  {
    id: 'builder_bulk',
    name: 'Builder — 50-Villa Township',
    difficulty: 'Intermediate',
    focusAreas: ['Bulk pricing', 'Competitive differentiation', 'Warranty terms', 'Payment flexibility'],
    openingMessage: `Hi, this is Rajiv Khanna, Project Director at Skyline Builders. We're constructing a 50-villa gated township in Bangalore and we need roofing for every villa. I'm already talking to two of your competitors — one offering clay tiles, one concrete — and I have a budget of around ₹1.2 Cr. I want to close this at ₹1 Cr. If you want this order, you'll need to offer a sharp bulk price, an extended warranty, and flexible payment terms. What's your best offer?`,
  },
  {
    id: 'architect_resort',
    name: 'Architect — Resort Project',
    difficulty: 'Beginner',
    focusAreas: ['Consultative discovery', 'Cross-product solutioning', 'Specification support', 'Site visit proposal'],
    openingMessage: `Good day. I'm Priya Nair, an architect designing a resort in Kerala with 20 cottage-style buildings. I came across the Laxree Roofing website and I'm quite interested. I'm thinking stone-coated tiles for the main cottage roofs and your artificial thatch for the gazebos and poolside cabanas. Can you walk me through how the two product lines work together and what specification support you provide to architects?`,
  },
]

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
}

const scenarioIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Amenities
  luxury_resort: Star,
  business_hotel: Building2,
  budget_hotel_renovation: Wrench,
  // Roofing
  homeowner_villa: Home,
  builder_bulk: Hammer,
  architect_resort: Compass,
}

const scoreColors = (score: number) => {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

const scoreBarColors = (score: number) => {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-400'
}

const progressClass = (score: number) => {
  if (score >= 80) return '[&>div]:bg-emerald-500'
  if (score >= 60) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-red-400'
}

// ─── Component ───────────────────────────────────────────────────────

export function AISalesCall() {
  const user = useAuthStore((s) => s.user)
  const isRoofing = user?.company === 'ROOFING'
  const LOCAL_SCENARIOS_LOCAL = isRoofing ? ROOFING_SCENARIOS : AMENITIES_SCENARIOS
  const brand = isRoofing ? 'Laxree Roofing' : 'LAXREE Hospitality'

  // Theme tokens — amber/orange for Roofing, emerald/teal for Amenities
  const accentBg = isRoofing ? 'bg-amber-100' : 'bg-emerald-100'
  const accentText = isRoofing ? 'text-amber-600' : 'text-emerald-600'
  const accentTextStrong = isRoofing ? 'text-amber-700' : 'text-emerald-700'
  const accentBtn = isRoofing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
  const accentGradientFrom = isRoofing ? 'from-amber-50' : 'from-emerald-50'
  const accentGradientTo = isRoofing ? 'to-orange-50' : 'to-teal-50'
  const accentBorder = isRoofing ? 'border-amber-100' : 'border-emerald-100'
  const accentBorderStrong = isRoofing ? 'border-amber-200' : 'border-emerald-200'
  const accentInputBorder = isRoofing ? 'focus:ring-amber-300 focus:border-amber-400' : 'focus:ring-emerald-300 focus:border-emerald-400'
  const accentUserBubble = isRoofing ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
  const accentLiveDot = isRoofing ? 'bg-amber-500' : 'bg-emerald-500'

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<CallPhase>('setup')
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStartTime, setCallStartTime] = useState<number | null>(null)
  const [scores, setScores] = useState<CallScores | null>(null)
  const [isEnding, setIsEnding] = useState(false)

  // Call timer
  useEffect(() => {
    if (phase !== 'active' || !callStartTime) return
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, callStartTime])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when call starts
  useEffect(() => {
    if (phase === 'active' && !isTyping) {
      inputRef.current?.focus()
    }
  }, [phase, isTyping])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // ── Start Call ───────────────────────────────────────────────────

  const startCall = useCallback((scenarioId: string) => {
    const scenario = LOCAL_SCENARIOS_LOCAL.find(s => s.id === scenarioId)
    if (!scenario) return

    setSelectedScenario(scenarioId)
    setPhase('active')
    setCallStartTime(Date.now())
    setCallDuration(0)
    setMessages([
      {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: scenario.openingMessage,
        timestamp: new Date(),
      },
    ])
    setScores(null)
    setIsEnding(false)
  }, [LOCAL_SCENARIOS_LOCAL])

  // ── Send Message ─────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || phase !== 'active' || !selectedScenario) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: m.content,
      }))

      const res = await fetch('/api/ai-sales-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          scenarioId: selectedScenario,
          segment: isRoofing ? 'ROOFING' : 'AMENITIES',
        }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      // Fallback response — segment-aware tone
      const fallbackText = isRoofing
        ? "I see. Could you tell me more about the specific roofing profiles you'd recommend for our project? I'm particularly interested in understanding how they'd handle our local climate and what kind of warranty you offer."
        : "I see. Could you tell me more about the specific products you'd recommend for our property? I'm particularly interested in understanding how they'd fit our requirements."
      const fallbackMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: fallbackText,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping, phase, selectedScenario, messages, isRoofing])

  // ── End Call ─────────────────────────────────────────────────────

  const endCall = useCallback(async () => {
    if (!selectedScenario || isEnding) return
    setIsEnding(true)

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: m.content,
      }))

      // Add a closing message from user
      const closingMessage = {
        role: 'user' as const,
        content: 'Thank you for your time. Let me summarize what we discussed and outline the next steps for you.',
      }

      const res = await fetch('/api/ai-sales-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, closingMessage],
          scenarioId: selectedScenario,
          endCall: true,
          segment: isRoofing ? 'ROOFING' : 'AMENITIES',
        }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()

      // Add the AI's closing message
      if (data.message) {
        const aiClosing: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: data.message,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiClosing])
      }

      if (data.scores) {
        setScores(data.scores)
      }
    } catch (error) {
      console.error('Failed to end call with scoring:', error)
      // Provide fallback scores — segment-aware key questions
      const missedQuestions = isRoofing
        ? ['Project type', 'Roof area / number of villas', 'Location', 'Timeline']
        : ['Average room rent', 'Number of rooms', 'Property stage', 'Location']
      const fallbackFeedback = isRoofing
        ? 'The conversation showed potential but needs improvement in key areas. Focus on asking project-specific qualifying questions — project type, roof area, location/climate zone, and timeline — and build a stronger value proposition tailored to the customer.'
        : 'The conversation showed potential but needs improvement in key areas. Focus on asking property-specific qualifying questions and building a stronger value proposition tailored to the customer.'
      setScores({
        communication: 60,
        salesTechnique: 55,
        productKnowledge: 58,
        closingSkills: 50,
        enthusiasm: 65,
        overallScore: 58,
        closingEffectiveness: 52,
        excitementLevel: 60,
        keyQuestionsAsked: [],
        keyQuestionsMissed: missedQuestions,
        strengths: ['Completed the conversation', 'Showed interest in customer needs'],
        improvements: ['Ask more qualifying questions', 'Improve closing techniques', 'Practice objection handling'],
        detailedFeedback: fallbackFeedback,
        nextSteps: ['Review the sales call framework', 'Practice qualifying questions', 'Re-attempt this scenario'],
      })
    } finally {
      setPhase('ended')
      setIsEnding(false)
    }
  }, [selectedScenario, messages, isEnding, isRoofing])

  // ── Reset ────────────────────────────────────────────────────────

  const resetCall = useCallback(() => {
    setPhase('setup')
    setSelectedScenario(null)
    setMessages([])
    setInput('')
    setIsTyping(false)
    setCallDuration(0)
    setCallStartTime(null)
    setScores(null)
    setIsEnding(false)
  }, [])

  // ── Render: Setup Phase ──────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center`}>
              <Phone className={`w-5 h-5 ${accentText}`} />
            </div>
            AI Sales Call
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Practice your sales call skills with an AI {isRoofing ? 'roofing' : 'hotel'} customer</p>
        </div>

        {/* How It Works */}
        <Card className={`bg-gradient-to-r ${accentGradientFrom} ${accentGradientTo} ${accentBorder}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shrink-0`}>
                <Sparkles className={`w-5 h-5 ${accentText}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${accentTextStrong}`}>How It Works</p>
                <p className={`text-xs ${accentText}`}>AI plays the customer, you practice selling</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { step: '1', title: 'Pick a Scenario', desc: `Choose your ${isRoofing ? 'customer' : 'hotel'} type` },
                { step: '2', title: 'Have the Call', desc: 'Chat with the AI customer' },
                { step: '3', title: 'Get Scored', desc: 'See your detailed analysis' },
              ].map((item) => (
                <div key={item.step} className="text-center p-2 bg-white/60 rounded-lg">
                  <div className={`w-7 h-7 ${accentBtn} text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1`}>
                    {item.step}
                  </div>
                  <p className="text-xs font-medium text-gray-700">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scenario Cards */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Target className={`w-4 h-4 ${accentText}`} /> Choose a Scenario to Start
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LOCAL_SCENARIOS_LOCAL.map((scenario) => {
              const ScenarioIcon = scenarioIcons[scenario.id] || (isRoofing ? Home : Hotel)
              return (
                <motion.div
                  key={scenario.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm h-full"
                    onClick={() => startCall(scenario.id)}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 ${accentBg} rounded-xl flex items-center justify-center`}>
                          <ScenarioIcon className={`w-6 h-6 ${accentText}`} />
                        </div>
                        <Badge className={difficultyColors[scenario.difficulty]}>
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 mb-1">{scenario.name}</h3>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 flex-1">
                        {scenario.openingMessage.substring(0, 100)}...
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {scenario.focusAreas.map((area) => (
                          <span key={area} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                      <Button className={`w-full ${accentBtn} text-white gap-2`}>
                        <Phone className="w-4 h-4" /> Start Call
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Render: Active Call ──────────────────────────────────────────

  if (phase === 'active') {
    const scenario = LOCAL_SCENARIOS_LOCAL.find(s => s.id === selectedScenario)
    const ScenarioIcon = scenarioIcons[selectedScenario || ''] || (isRoofing ? Home : Hotel)

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Call Header */}
        <Card className={`${accentBorderStrong} bg-gradient-to-r ${accentGradientFrom} to-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center`}>
                  <ScenarioIcon className={`w-5 h-5 ${accentText}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{scenario?.name || 'Sales Call'}</p>
                    <Badge variant="outline" className="text-xs">
                      <div className={`w-2 h-2 ${accentLiveDot} rounded-full mr-1.5 animate-pulse`} />
                      Live
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDuration(callDuration)}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={endCall}
                disabled={isEnding || messages.length < 2}
              >
                <PhoneOff className="w-4 h-4" />
                {isEnding ? 'Ending...' : 'End Call'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col" style={{ height: 'calc(100vh - 240px)', minHeight: '400px' }}>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 ${accentBg} rounded-full flex items-center justify-center`}>
                        <Phone className={`w-3 h-3 ${accentText}`} />
                      </div>
                      <span className="text-xs text-gray-500">Customer</span>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? `${accentUserBubble} rounded-tr-sm`
                      : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className={`w-6 h-6 ${accentBg} rounded-full flex items-center justify-center`}>
                  <Phone className={`w-3 h-3 ${accentText}`} />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${accentInputBorder}`}
                disabled={isTyping || isEnding}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping || isEnding}
                className={`${accentBtn} rounded-xl px-4`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {isRoofing
                ? 'Practice your sales pitch — ask about their project, present Laxree Roofing solutions, and try to close!'
                : 'Practice your sales pitch — ask about their property, present solutions, and try to close!'}
            </p>
          </div>
        </Card>
      </motion.div>
    )
  }

  // ── Render: Call Ended / Results ─────────────────────────────────

  if (phase === 'ended' && scores) {
    const scenario = LOCAL_SCENARIOS_LOCAL.find(s => s.id === selectedScenario)
    const ScenarioIcon = scenarioIcons[selectedScenario || ''] || (isRoofing ? Home : Hotel)

    const scoreCategories = [
      { label: 'Communication', value: scores.communication, icon: MessageSquare },
      { label: 'Sales Technique', value: scores.salesTechnique, icon: Target },
      { label: 'Product Knowledge', value: scores.productKnowledge, icon: Award },
      { label: 'Closing Skills', value: scores.closingSkills, icon: Zap },
      { label: 'Enthusiasm', value: scores.enthusiasm, icon: TrendingUp },
    ]

    const analysisCards = [
      { label: 'Closing Effectiveness', value: scores.closingEffectiveness, icon: CheckCircle2 },
      { label: 'Excitement Level', value: scores.excitementLevel, icon: Zap },
    ]

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Call Summary Header */}
        <Card className={`bg-gradient-to-r ${accentGradientFrom} ${accentGradientTo} ${accentBorder}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${accentBg} rounded-xl flex items-center justify-center`}>
                  <ScenarioIcon className={`w-6 h-6 ${accentText}`} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-800">Call Complete — {scenario?.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Duration: {formatDuration(callDuration)}
                    <span className="text-gray-300">|</span>
                    <MessageSquare className="w-3 h-3" /> {messages.length} messages
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className={`text-3xl font-bold ${scoreColors(scores.overallScore)}`}>
                  {scores.overallScore}
                </p>
                <p className="text-xs text-gray-500">Overall Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Scores */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Star className={`w-4 h-4 ${accentText}`} /> Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoreCategories.map((cat) => {
                  const CatIcon = cat.icon
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <CatIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{cat.label}</span>
                        </div>
                        <span className={`text-sm font-bold ${scoreColors(cat.value)}`}>
                          {cat.value}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.value}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${scoreBarColors(cat.value)}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Cards */}
          <div className="space-y-4">
            {/* Call Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${accentText}`} /> Call Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisCards.map((card) => {
                    const CardIcon = card.icon
                    return (
                      <div key={card.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 ${accentBg} rounded-lg flex items-center justify-center shrink-0`}>
                          <CardIcon className={`w-5 h-5 ${accentText}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">{card.label}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${scoreColors(card.value)}`}>
                              {card.value}%
                            </span>
                            <Progress value={card.value} className={`flex-1 h-2 ${progressClass(card.value)}`} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Key Questions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Qualifying Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scores.keyQuestionsAsked.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-emerald-600 mb-1.5">Asked ✓</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scores.keyQuestionsAsked.map((q, i) => (
                        <Badge key={i} className="bg-emerald-100 text-emerald-700 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {q}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {scores.keyQuestionsMissed.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-1.5">Missed ✗</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scores.keyQuestionsMissed.map((q, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-red-500 border-red-200">
                          <AlertCircle className="w-3 h-3 mr-1" /> {q}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scores.strengths.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{s}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scores.improvements.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{s}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card className={`bg-gradient-to-br ${accentGradientFrom} ${accentGradientTo} ${accentBorder}`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shrink-0`}>
                <Sparkles className={`w-5 h-5 ${accentText}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${accentTextStrong} mb-1`}>AI Feedback</p>
                <p className="text-sm text-gray-700 leading-relaxed">{scores.detailedFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <ArrowRight className={`w-4 h-4 ${accentText}`} /> Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scores.nextSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-7 h-7 ${accentBg} rounded-full flex items-center justify-center text-xs font-bold ${accentText} shrink-0`}>
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={resetCall}
            className={`${accentBtn} gap-2`}
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
          <Button
            variant="outline"
            onClick={resetCall}
            className="gap-2"
          >
            <Phone className="w-4 h-4" /> New Scenario
          </Button>
        </div>
      </motion.div>
    )
  }

  // Fallback: ended phase without scores (shouldn't happen)
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-500 mb-4">Loading results...</p>
      <Button onClick={resetCall} className={`${accentBtn} gap-2`}>
        <RotateCcw className="w-4 h-4" /> Start Over
      </Button>
    </div>
  )
}
