'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Brain, Send, Sparkles, MessageSquare, Lightbulb,
  Target, TrendingUp, BookOpen, ChevronRight, Clock,
  Mic, Award, Zap
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'coach'
  content: string
  timestamp: Date
}

const COACHING_TOPICS = [
  { id: 'sales', title: 'Sales Improvement', icon: TrendingUp, description: 'Get tips on closing deals and improving conversion rates' },
  { id: 'product', title: 'Product Knowledge', icon: BookOpen, description: 'Deepen your understanding of LAXREE products' },
  { id: 'communication', title: 'Communication Skills', icon: Mic, description: 'Improve your verbal and written communication' },
  { id: 'career', title: 'Career Growth', icon: Award, description: 'Plan your career path and skill development' },
  { id: 'negotiation', title: 'Negotiation Tactics', icon: Target, description: 'Learn advanced negotiation strategies' },
  { id: 'time', title: 'Time Management', icon: Clock, description: 'Optimize your daily schedule and productivity' },
]

const COACH_RESPONSES: Record<string, string[]> = {
  sales: [
    "To improve your sales performance, focus on the SPIN selling methodology: Situation, Problem, Implication, Need-Payoff. This helps you uncover client needs more effectively.",
    "Your mock simulation scores show potential in sales. I recommend practicing objection handling 15 minutes daily. Try the 'Feel-Felt-Found' technique for common objections.",
    "Top performers in our data spend 30% more time on needs discovery. Before presenting solutions, ensure you've fully understood the client's pain points. Ask open-ended questions.",
    "Consider tracking your conversion rate at each stage of the sales funnel. This will help identify where deals stall and allow targeted improvement.",
  ],
  product: [
    "LAXREE's product portfolio is designed for the hospitality sector. Focus on understanding how each product solves specific hotel operations challenges.",
    "I recommend reviewing Module 5-8 in the Product Academy. These cover advanced features that most clients ask about during demos.",
    "Your product knowledge score is developing well. To reach the next level, practice explaining product features in terms of client benefits rather than technical specifications.",
    "Create comparison matrices between LAXREE products and competitors. This will help you articulate our unique value proposition more confidently.",
  ],
  communication: [
    "Effective sales communication follows the 70-30 rule: listen 70% and speak 30%. Practice active listening techniques in your next client interaction.",
    "Your communication scores are solid. To improve further, focus on mirroring the client's language style and pace. This builds rapport subconsciously.",
    "Record your practice calls and review them. Pay attention to filler words, pacing, and tonal variety. Small adjustments can make a big difference.",
    "When presenting, use the 'Rule of Three' - group your points into sets of three for better retention and impact.",
  ],
  career: [
    "Based on your current trajectory, you're on track for the Intermediate level. Focus on completing your Field Sales Certification to unlock the next career milestone.",
    "The most successful career paths at LAXREE combine both Field and Inbound sales expertise. Consider cross-training after your primary certification.",
    "Set SMART goals for your career development: Specific, Measurable, Achievable, Relevant, Time-bound. This gives you clear milestones to work toward.",
    "Network with senior team members who have progressed through the ranks. Their insights on career navigation are invaluable.",
  ],
  negotiation: [
    "The BATNA (Best Alternative to a Negotiated Agreement) framework is essential. Always know your walk-away point before entering any negotiation.",
    "Practice the 'anchoring' technique: make the first offer to set the reference point. Research shows this gives you a strategic advantage.",
    "During negotiations, separate the people from the problem. Focus on interests, not positions. This leads to more creative and mutually beneficial outcomes.",
    "Your negotiation scores can improve by 15-20% with targeted practice. I recommend the Negotiation Academy modules and weekly mock scenarios.",
  ],
  time: [
    "Use the Eisenhower Matrix to prioritize tasks: Urgent/Important, Important/Not Urgent, Urgent/Not Important, Neither. Focus on the Important/Not Urgent quadrant for career growth.",
    "Block 90-minute deep work sessions for learning modules. Research shows this is the optimal duration for focused learning before diminishing returns.",
    "Start each day with your most important learning task. This 'eat the frog' approach ensures consistent progress even on busy days.",
    "Track your learning time for a week to identify patterns. You might find that you learn better at specific times of day.",
  ],
}

const TIPS = [
  "Practice active listening in every client interaction — it builds trust and uncovers hidden needs.",
  "Spend 15 minutes daily reviewing product features to build long-term retention.",
  "Record and review your sales calls to identify areas for improvement.",
  "Set weekly micro-goals to maintain momentum in your learning journey.",
  "Use the 'teach back' method: explain concepts to colleagues to solidify your understanding.",
  "Take breaks during long study sessions — the brain consolidates information during rest.",
]

export function AICoachView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'coach',
      content: "Hello! I'm your AI Sales Coach. I can help you improve your sales skills, product knowledge, communication, and more. Choose a topic below or ask me anything!",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionHistory, setSessionHistory] = useState<Array<{ topic: string; date: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateCoachResponse = (topicId: string): string => {
    const responses = COACH_RESPONSES[topicId]
    if (responses && responses.length > 0) {
      return responses[Math.floor(Math.random() * responses.length)]
    }
    return "That's a great topic to explore! Let me think about the best approach for you. Based on your current performance data, I'd recommend focusing on building a strong foundation first, then advancing to more complex strategies."
  }

  const handleTopicClick = (topicId: string) => {
    const topic = COACHING_TOPICS.find(t => t.id === topicId)
    if (!topic) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `I'd like coaching on ${topic.title}`,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: 'coach',
        content: generateCoachResponse(topicId),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, coachMessage])
      setIsTyping(false)
      setSessionHistory(prev => [...prev, { topic: topic.title, date: new Date().toLocaleDateString() }])
    }, 1000 + Math.random() * 1000)
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Determine a topic based on keywords
    const lowerInput = input.toLowerCase()
    let topicId = 'sales'
    if (lowerInput.includes('product') || lowerInput.includes('feature')) topicId = 'product'
    else if (lowerInput.includes('communicat') || lowerInput.includes('speak') || lowerInput.includes('listen')) topicId = 'communication'
    else if (lowerInput.includes('career') || lowerInput.includes('promotion') || lowerInput.includes('grow')) topicId = 'career'
    else if (lowerInput.includes('negotiat') || lowerInput.includes('deal') || lowerInput.includes('price')) topicId = 'negotiation'
    else if (lowerInput.includes('time') || lowerInput.includes('schedule') || lowerInput.includes('productiv')) topicId = 'time'

    setTimeout(() => {
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: 'coach',
        content: generateCoachResponse(topicId),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, coachMessage])
      setIsTyping(false)
    }, 1200 + Math.random() * 800)
  }

  const currentTip = TIPS[Math.floor(Date.now() / 60000) % TIPS.length]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Tip of the Day */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-700">Tip of the Day</p>
            <p className="text-sm text-gray-700">{currentTip}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-500" /> AI Sales Coach
                <Badge variant="outline" className="ml-2 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> Powered by AI
                </Badge>
              </CardTitle>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'coach' && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Brain className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-xs text-gray-500">AI Coach</span>
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
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
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Brain className="w-3 h-3 text-emerald-600" />
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
                  type="text"
                  placeholder="Ask your AI Coach anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar: Topics + History */}
        <div className="space-y-4">
          {/* Coaching Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> Coaching Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {COACHING_TOPICS.map((topic) => {
                  const TopicIcon = topic.icon
                  return (
                    <button
                      key={topic.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      onClick={() => handleTopicClick(topic.id)}
                    >
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                        <TopicIcon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">{topic.title}</p>
                        <p className="text-xs text-gray-400 truncate">{topic.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Session History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-500" /> Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionHistory.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No sessions yet. Start a conversation!</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {sessionHistory.slice(-5).reverse().map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-gray-600">{s.topic}</span>
                      <span className="text-gray-400 ml-auto">{s.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TIPS.slice(0, 3).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <Lightbulb className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
