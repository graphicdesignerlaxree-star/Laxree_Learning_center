'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  Bot, Send, Sparkles, MessageSquare, User, Phone, RefreshCw,
  Building2, Package, Handshake, TrendingUp, ChevronRight, Plus,
  ArrowRight, Lightbulb, X, Loader2, Trash2, Clock, Copy, Check,
  Mic, Paperclip, Smile
} from 'lucide-react'

// ==================== TYPES ====================

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface SimulationScenario {
  id: string
  title: string
  description: string
  icon: any
  systemPrompt: string
  starterMessage: string
  color: string
}

// ==================== SCENARIOS ====================

// AMENITIES scenarios (hospitality)
const AMENITIES_SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'hotel-gm',
    title: 'Hotel GM Meeting',
    description: 'Practice pitching to a hotel General Manager who needs minibars for their 120-room property',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
    systemPrompt: 'You are Rajesh Kapoor, the General Manager of a 4-star hotel in Mumbai with 120 rooms. You are considering upgrading your minibars but are cost-conscious. You have been using old absorption minibars for 8 years. You are skeptical about switching brands but willing to listen. Ask tough questions about pricing, maintenance, energy savings, and warranty. Sometimes express concerns about budget. Be realistic and professional.',
    starterMessage: 'Hello, I\'m Rajesh Kapoor, GM at Grand Horizon Hotel Mumbai. We\'re looking at upgrading our minibars. We currently have old absorption units. What can you offer?'
  },
  {
    id: 'purchase-manager',
    title: 'Purchase Manager Negotiation',
    description: 'Negotiate with a purchase manager who wants the best deal on a bulk order',
    icon: Handshake,
    color: 'from-amber-500 to-orange-600',
    systemPrompt: 'You are Sunita Sharma, Purchase Manager at a luxury hotel chain with 5 properties across India. You are hard-nosed about pricing and always push for maximum discounts. You compare LAXREE with 2 other competitors. You have a budget of ₹15 lakhs but want to spend only ₹12 lakhs. Negotiate firmly but fairly. Ask about bulk discounts, payment terms, and warranty.',
    starterMessage: 'Hi, I\'m Sunita Sharma, heading procurement at LuxStay Hotels. We need minibars and safe boxes for 5 properties — that\'s about 500 rooms total. I\'ve received quotes from your competitors. What\'s your best price?'
  },
  {
    id: 'cross-sell-practice',
    title: 'Cross-Selling Practice',
    description: 'Practice transitioning from one product to cross-sell complementary products',
    icon: RefreshCw,
    color: 'from-violet-500 to-purple-600',
    systemPrompt: 'You are Amit Patel, owner of a 3-star business hotel in Ahmedabad with 80 rooms. You called about minibars but you\'re also interested in other room amenities. You don\'t know much about LAXREE\'s other products. Be curious but cautious. Ask questions about safe boxes, kettles, and RFID locks when they are mentioned. You have a moderate budget and want value for money.',
    starterMessage: 'Hello, I\'m Amit Patel from Regency Inn Ahmedabad. We\'re renovating our 80 rooms and need new minibars. Can you tell me about your range?'
  },
  {
    id: 'objection-handler',
    title: 'Objection Handling Master',
    description: 'Practice handling common sales objections like "too expensive", "we\'re happy with current supplier", etc.',
    icon: TrendingUp,
    color: 'from-rose-500 to-red-600',
    systemPrompt: 'You are a skeptical hotel owner who raises every common objection: 1) "Too expensive" 2) "We\'re happy with our current supplier" 3) "We don\'t need this right now" 4) "Let me think about it" 5) "Your competitor is cheaper". Push back on every selling point. Only become convinced if the salesperson uses proper techniques like Feel-Felt-Found, ROI demonstration, or value bundling. Be challenging but not rude.',
    starterMessage: 'Hi, I got your call. But honestly, we\'ve been working with the same supplier for 10 years. I don\'t see any reason to switch. What\'s so special about LAXREE?'
  },
]

// ROOFING scenarios (premium roofing — stone-coated, thatch, shingle tiles)
const ROOFING_SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'homeowner-villa',
    title: 'Homeowner Villa Meeting',
    description: 'Practice pitching stone-coated tiles to a homeowner building a premium villa in Pune',
    icon: Building2,
    color: 'from-amber-500 to-orange-600',
    systemPrompt: 'You are Vikram Mehta, a homeowner building a premium 5,000 sq ft villa in Pune. You want a roof that looks elegant and lasts decades. You have heard of clay tiles and metal sheets but not stone-coated tiles. You are budget-conscious but willing to spend for quality. Ask about profiles (Classic, Shingle, Tudor Pro), colors, lifespan, weather resistance, and warranty. Be realistic, curious, and slightly skeptical about newer roofing tech.',
    starterMessage: 'Hello, I\'m Vikram Mehta. We\'re building a villa in Pune and the architect suggested we look at premium roofing. I\'ve only used clay tiles before. What is this stone-coated tile you\'re offering?'
  },
  {
    id: 'builder-negotiation',
    title: 'Builder Negotiation',
    description: 'Negotiate a bulk roofing order with a builder working on a 50-villa project',
    icon: Handshake,
    color: 'from-amber-500 to-yellow-600',
    systemPrompt: 'You are Rajiv Khanna, Project Director at Skyline Builders, constructing a 50-villa gated township in Bangalore. You need roofing for all 50 villas. You\'re comparing Laxree Roofing with 2 competitors (one clay tile, one concrete tile supplier). Your budget is ₹1.2 crore but you want to close at ₹1 crore. Push for bulk discounts, extended warranty, free site survey, and flexible payment terms. Negotiate firmly but professionally.',
    starterMessage: 'Hi, I\'m Rajiv Khanna from Skyline Builders. We\'re building 50 premium villas in Bangalore and need roofing for all of them. I\'ve got quotes from two of your competitors. What\'s your best price for stone-coated tiles in this volume?'
  },
  {
    id: 'roofing-cross-sell',
    title: 'Roofing Cross-Sell Practice',
    description: 'Transition from stone-coated tiles to cross-sell artificial thatch or asphalt shingles for other roof sections',
    icon: RefreshCw,
    color: 'from-orange-500 to-red-600',
    systemPrompt: 'You are Priya Nair, an architect designing a resort in Kerala with 30 cottages. You called about stone-coated tiles for the main buildings, but the resort also has gazebos, poolside cabanas, and a spa. You don\'t know that Laxree also sells artificial thatch tiles and asphalt shingles. Be curious when complementary products are mentioned. Ask about lifespan, fire resistance, and design fit. Moderate budget, wants aesthetic value.',
    starterMessage: 'Hello, I\'m Priya Nair, architect for a resort project in Kerala. We need stone-coated tiles for 20 main buildings. Can you tell me about your profiles and colors?'
  },
  {
    id: 'roofing-objection-handler',
    title: 'Roofing Objection Handler',
    description: 'Practice handling roofing objections: "too expensive", "prefer traditional clay", "never heard of stone-coated"',
    icon: TrendingUp,
    color: 'from-rose-500 to-red-600',
    systemPrompt: 'You are a skeptical homeowner/builder who raises every common roofing objection: 1) "Stone-coated tiles are too expensive vs. clay" 2) "I\'ve never heard of stone-coated roofing" 3) "I prefer traditional clay tiles, they\'re proven" 4) "Let me think about it" 5) "Your competitor is cheaper". Push back on every selling point. Only get convinced if the salesperson uses proper techniques: Feel-Felt-Found, ROI/lifespan comparison, value bundling, or warranty demonstration. Be challenging but not rude.',
    starterMessage: 'Hi, I got your call. But honestly, we\'ve always used clay tiles — my father used them, my grandfather used them. I\'ve never even heard of stone-coated tiles. Why should I switch?'
  },
]

const AMENITIES_SUGGESTED_PROMPTS = [
  'How should I handle price objections?',
  'What are the best cross-selling techniques?',
  'Help me practice my elevator pitch',
  'How do I qualify a lead on a cold call?',
  'What questions should I ask a hotel GM?',
  'How to close a deal after a demo?',
]

const ROOFING_SUGGESTED_PROMPTS = [
  'How do I handle price objections for premium roofing?',
  'What are the best cross-selling techniques for roofing tiles?',
  'Help me explain stone-coated tile benefits vs clay tiles',
  'How do I qualify a roofing lead?',
  'What questions should I ask a homeowner about their roof?',
  'How to close a roofing deal after a site visit?',
]

// ==================== MAIN COMPONENT ====================

export function AISimulation() {
  const user = useAuthStore((s) => s.user)
  const isRoofing = user?.company === 'ROOFING'
  const SIMULATION_SCENARIOS = isRoofing ? ROOFING_SIMULATION_SCENARIOS : AMENITIES_SIMULATION_SCENARIOS
  const SUGGESTED_PROMPTS = isRoofing ? ROOFING_SUGGESTED_PROMPTS : AMENITIES_SUGGESTED_PROMPTS
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null)
  const [showScenarioPicker, setShowScenarioPicker] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const startScenario = (scenario: SimulationScenario) => {
    setActiveScenario(scenario)
    setShowScenarioPicker(false)
    setMessages([
      {
        id: 'system-1',
        role: 'system',
        content: `🎭 Simulation: ${scenario.title}`,
        timestamp: new Date()
      },
      {
        id: 'assistant-1',
        role: 'assistant',
        content: scenario.starterMessage,
        timestamp: new Date()
      }
    ])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const chatMessages = [...messages, userMessage]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role,
          content: m.content
        }))

      const systemPrompt = activeScenario
        ? activeScenario.systemPrompt
        : 'You are a helpful AI sales coach for LAXREE Hospitality Solutions, a B2B hospitality products company in India. Help employees practice sales scenarios, learn about products, and improve their selling skills. Be encouraging, professional, and provide specific actionable advice. Keep responses concise and conversational.'

      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          systemPrompt
        })
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'I apologize, I could not generate a response. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const resetChat = () => {
    setMessages([])
    setActiveScenario(null)
    setShowScenarioPicker(true)
    setInputValue('')
  }

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // ==================== RENDER ====================

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pb-4 shrink-0"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
            AI Simulation
          </h1>
          <p className="text-gray-500 mt-1 ml-13">
            Chat with an AI sales simulator to sharpen your skills
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeScenario && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
              <div className={`w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse`} />
              {activeScenario.title}
            </Badge>
          )}
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetChat}
              className="h-8 text-xs border-gray-200 hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              New Chat
            </Button>
          )}
        </div>
      </motion.div>

      {/* Scenario Picker or Chat */}
      {showScenarioPicker ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Welcome */}
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">LAXREE AI Sales Simulator</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Choose a simulation scenario to practice your sales skills, or start a free-form coaching conversation
              </p>
            </div>

            {/* Scenario Cards */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Simulation Scenarios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SIMULATION_SCENARIOS.map((scenario, index) => {
                  const IconComp = scenario.icon
                  return (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card
                        className="group cursor-pointer hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 border-gray-100 hover:border-emerald-200"
                        onClick={() => startScenario(scenario)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${scenario.color} rounded-lg flex items-center justify-center shrink-0 shadow-md`}>
                              <IconComp className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-emerald-700 transition-colors">
                                {scenario.title}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-2">{scenario.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Free Chat */}
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative bg-white px-4">
                  <span className="text-xs text-gray-400">or</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setShowScenarioPicker(false)
                  setMessages([])
                  setTimeout(() => inputRef.current?.focus(), 100)
                }}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Free-Form Chat
              </Button>
            </div>

            {/* Suggested Prompts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Suggested Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-xs border-gray-200 hover:border-emerald-300 hover:text-emerald-700 h-8"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5 text-emerald-400" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Chat Interface */
        <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4 pb-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'system' ? (
                    <div className="text-center">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                        {msg.content}
                      </Badge>
                    </div>
                  ) : (
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-emerald-100'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-100'
                      }`}>
                        {msg.role === 'user'
                          ? <User className="w-4 h-4 text-emerald-700" />
                          : <Bot className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div className={`group relative rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-md'
                          : 'bg-gray-50 text-gray-800 rounded-tl-md border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <button
                            onClick={() => copyMessage(msg.id, msg.content)}
                            className="p-1 rounded hover:bg-black/5 transition-colors"
                          >
                            {copiedId === msg.id
                              ? <Check className="w-3 h-3 text-emerald-400" />
                              : <Copy className="w-3 h-3 text-gray-400" />
                            }
                          </button>
                        </div>
                        <p className={`text-[10px] mt-1 ${
                          msg.role === 'user' ? 'text-emerald-200' : 'text-gray-300'
                        }`}>
                          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-100">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Prompts (when chat is empty) */}
          {messages.length <= 1 && !activeScenario && (
            <div className="px-4 pb-2">
              <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.slice(0, 3).map(prompt => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-xs border-gray-200 hover:border-emerald-300 hover:text-emerald-700 h-7"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder={activeScenario ? "Type your response as a LAXREE salesperson..." : "Ask me anything about sales..."}
                    className="pr-12 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 h-11 rounded-xl"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-1 top-1 h-9 w-9 p-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg shadow-sm disabled:opacity-40"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                AI Sales Simulator powered by LAXREE Academy · Responses are simulated for training purposes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
