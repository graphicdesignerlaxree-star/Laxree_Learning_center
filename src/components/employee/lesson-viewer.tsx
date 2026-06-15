'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/auth-store'
import { SimulationDialog } from './simulation-dialog'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Download, FileDown,
  BookOpen, Clock, ClipboardCheck, ChevronRight, Sparkles,
  HelpCircle, Target, Lightbulb, GraduationCap, Play,
  Video, Eye,
  MonitorPlay, Star, Zap, Trophy,
  Users, Contact, Building2, Mail, HeadphonesIcon,
  Phone, X,
  Lock, Coffee, Key, Wind,
  Maximize2, Minimize2, Volume2,
  TrendingUp, Package, ArrowUpRight,
} from 'lucide-react'

// ==================== TYPES ====================

interface ModuleData {
  id: string
  title: string
  description?: string
  content?: string
  contentType?: string
  contentUrl?: string
  pdfUrl?: string
  order: number
  duration?: number
  completed?: boolean
  score?: number | null
  productCategoryId?: string | null
}

interface CourseData {
  id: string
  title: string
  description?: string
  moduleType: string
  duration?: number
  modules: ModuleData[]
  enrollment?: {
    courseId: string
    progress: number
    status: string
  } | null
}

interface LessonViewerProps {
  module: ModuleData
  course: CourseData
  academy: { type: string; title: string; emoji: string; gradient: string }
  completions: Record<string, { completed: boolean; score: number | null }>
  onBack: () => void
  onQuiz: (mod: ModuleData) => void
  onComplete: (mod: ModuleData) => void
  onNavigate: (mod: ModuleData) => void
  onDownloadPDF: (mod: ModuleData) => void
}

// ==================== QUIZ THOUGHT GENERATOR ====================

const QUIZ_THOUGHTS: Record<string, string[]> = {
  'mini bar': [
    'Can you name 3 types of mini bar cooling technologies?',
    'What SSP would you highlight for a 5-star hotel GM?',
    'How would you compare compressor vs absorption mini bars for a coastal resort?',
  ],
  'safe': [
    'Can you list the 4 safe box series LAXREE offers?',
    'What is the auto-lockout feature and why does it matter for hotels?',
    'How would you position Orbita vs Essential for different hotel tiers?',
  ],
  'rfid': [
    'What are 3 key selling points of LAXREE RFID locks?',
    'Why is PMS compatibility important for hotel locks?',
    'How would you handle a concern about RFID lock durability in coastal areas?',
  ],
  'kettle': [
    'What makes the Strix controller a key differentiator?',
    'Can you name 3 LAXREE kettle models with their capacities?',
    'Why would a hotel choose a stainless steel kettle over a plastic one?',
  ],
  'sales': [
    'What does each letter in the LACE framework stand for?',
    'Can you identify the 6 buyer types in hospitality?',
    'How would you counter "Your price is too high" using value selling?',
  ],
  'field': [
    'What is the 70/30 rule in architect visits?',
    'Can you list 3 things to research before an architect meeting?',
    'What should you do within 24 hours after a site visit?',
  ],
  'default': [
    'Can you summarize the 3 most important points from this lesson?',
    'How would you explain this concept to a new colleague?',
    'What real-world scenario could you apply this knowledge to?',
  ],
}

function getQuizThought(moduleTitle: string): string {
  const lower = moduleTitle.toLowerCase()
  let category = 'default'
  if (lower.includes('mini bar') || lower.includes('minibar')) category = 'mini bar'
  else if (lower.includes('safe')) category = 'safe'
  else if (lower.includes('rfid') || lower.includes('lock')) category = 'rfid'
  else if (lower.includes('kettle') || lower.includes('tcm')) category = 'kettle'
  else if (lower.includes('sales') || lower.includes('lace') || lower.includes('objection') || lower.includes('follow')) category = 'sales'
  else if (lower.includes('field') || lower.includes('architect') || lower.includes('site') || lower.includes('designer')) category = 'field'

  const thoughts = QUIZ_THOUGHTS[category] || QUIZ_THOUGHTS['default']
  return thoughts[Math.floor(Math.random() * thoughts.length)]
}

// Module emoji mapping
const MODULE_EMOJIS: Record<string, string> = {
  'mini bar': '🍷', 'minibar': '🍷', 'safe': '🔐', 'rfid': '🔑',
  'kettle': '☕', 'hair': '💇', 'dryer': '💇', 'mirror': '🪞',
  'mattress': '🛏️', 'bed': '🛏️', 'housekeeping': '🧹', 'dispenser': '🧴',
  'lock': '🔒', 'sales': '📈', 'hotel': '🏨', 'laxree': '🏢',
  'welcome': '👋', 'orientation': '🎯', 'technical': '🔧',
  'negotiation': '🤝', 'competitive': '👁️', 'customer': '🔍',
  'field': '🗺️', 'inbound': '📞', 'hospitality': '🏨',
}

function getModuleEmoji(title: string): string {
  const lower = title.toLowerCase()
  for (const [key, emoji] of Object.entries(MODULE_EMOJIS)) {
    if (lower.includes(key)) return emoji
  }
  return '📚'
}

// ==================== CROSS-SELL DATA ====================

const CROSS_SELL_MAP: Record<string, { product: string; pitch: string; icon: any }[]> = {
  'mini bar': [
    { product: 'Safe Box', pitch: 'Every guest with a minibar needs a secure place for valuables. Position the Safe as a natural companion — "Complete in-room convenience."', icon: Lock },
    { product: 'Kettle / TCM', pitch: 'Morning tea or coffee is the first thing guests reach for. Bundle minibar + kettle as the "Comfort Suite Package."', icon: Coffee },
    { product: 'RFID Door Lock', pitch: 'Modern guests expect seamless room entry. Upsell RFID locks as part of a "Smart Room Upgrade."', icon: Key },
  ],
  'safe': [
    { product: 'Mini Bar', pitch: 'A guest enjoying the minibar wants to secure valuables. Position as the "In-Room Security + Comfort" bundle.', icon: Coffee },
    { product: 'RFID Door Lock', pitch: 'Digital safe + keyless entry = complete room security. Sell as "Total Room Security Suite."', icon: Key },
    { product: 'Hair Dryer', pitch: 'Business travelers need both security and grooming. Bundle as "Executive Room Essentials."', icon: Wind },
  ],
  'kettle': [
    { product: 'Mini Bar', pitch: 'Cold beverages + hot beverages = complete refreshment. Bundle as the "Beverage Station Package."', icon: Coffee },
    { product: 'Hair Dryer', pitch: 'Morning routine = hot drink + styling. Bundle as "Morning Essentials Kit."', icon: Wind },
    { product: 'Safe Box', pitch: 'Comfort + Security. Position as "Guest Room Essential Bundle."', icon: Lock },
  ],
  'rfid': [
    { product: 'Safe Box', pitch: 'Keyless entry + digital safe = complete security upgrade. Bundle as "Smart Security Suite."', icon: Lock },
    { product: 'Mini Bar', pitch: 'Premium rooms deserve premium access. Bundle RFID + minibar as "Smart Room Package."', icon: Coffee },
    { product: 'Hair Dryer', pitch: 'Modern room = modern access + modern amenities. Bundle as "Next-Gen Room Kit."', icon: Wind },
  ],
  'hair': [
    { product: 'Kettle / TCM', pitch: 'Morning routine: hair styling + hot drink. Bundle as "Morning Essentials."', icon: Coffee },
    { product: 'Safe Box', pitch: 'Grooming + security = executive room essentials. Bundle as "Premium Guest Package."', icon: Lock },
    { product: 'Mini Bar', pitch: 'Relaxation + grooming. Position as "Complete Comfort Suite."', icon: Coffee },
  ],
}

function getCrossSellItems(moduleTitle: string): { product: string; pitch: string; icon: any }[] | null {
  const lower = moduleTitle.toLowerCase()
  for (const [key, items] of Object.entries(CROSS_SELL_MAP)) {
    if (lower.includes(key)) return items
  }
  return null
}

// ==================== PROFESSIONAL CONTENT STYLES ====================

const PROFESSIONAL_CONTENT_STYLES = `
  /* ===== PROFESSIONAL MNC-LEVEL CONTENT STYLING ===== */

  /* Base container */
  .pro-mnc {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.8;
    color: #374151;
    font-size: 15px;
  }

  /* ===== HEADINGS ===== */
  .pro-mnc h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #064e3b;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-left: 4px solid #10b981;
    padding-left: 1rem;
    border-bottom: 1px solid #d1fae5;
    letter-spacing: -0.01em;
  }

  .pro-mnc h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f766e;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    padding-left: 0.75rem;
    border-left: 3px solid #14b8a6;
    letter-spacing: -0.005em;
  }

  .pro-mnc h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .pro-mnc h5 {
    font-size: 1rem;
    font-weight: 600;
    color: #4b5563;
    margin-top: 1rem;
    margin-bottom: 0.4rem;
  }

  /* ===== PARAGRAPHS ===== */
  .pro-mnc p {
    color: #4b5563;
    line-height: 1.8;
    margin-bottom: 1rem;
    font-size: 15px;
  }

  /* ===== STRONG / BOLD ===== */
  .pro-mnc strong, .pro-mnc b {
    color: #065f46;
    font-weight: 600;
  }

  /* ===== LINKS ===== */
  .pro-mnc a {
    color: #059669;
    text-decoration: none;
    border-bottom: 1px dashed #6ee7b7;
    transition: all 0.2s;
  }
  .pro-mnc a:hover {
    color: #047857;
    border-bottom-style: solid;
  }

  /* ===== UNORDERED LISTS ===== */
  .pro-mnc ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 1rem;
    margin-top: 0.5rem;
  }
  .pro-mnc ul li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    color: #4b5563;
    line-height: 1.7;
  }
  .pro-mnc ul li::before {
    content: '';
    position: absolute;
    left: 0.25rem;
    top: 0.6em;
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 50%;
  }

  /* ===== ORDERED LISTS ===== */
  .pro-mnc ol {
    list-style: none;
    counter-reset: pro-counter;
    padding-left: 0;
    margin-bottom: 1rem;
    margin-top: 0.5rem;
  }
  .pro-mnc ol li {
    position: relative;
    padding-left: 2.25rem;
    margin-bottom: 0.5rem;
    color: #4b5563;
    line-height: 1.7;
    counter-increment: pro-counter;
  }
  .pro-mnc ol li::before {
    content: counter(pro-counter);
    position: absolute;
    left: 0;
    top: 0.15em;
    width: 1.5rem;
    height: 1.5rem;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  /* ===== TABLES ===== */
  .pro-mnc table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 1.5rem 0;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #d1fae5;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .pro-mnc thead {
    background: linear-gradient(135deg, #064e3b, #065f46);
  }
  .pro-mnc thead th {
    color: white;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 16px;
    text-align: left;
    border: none;
  }
  .pro-mnc thead th:first-child {
    border-top-left-radius: 12px;
  }
  .pro-mnc thead th:last-child {
    border-top-right-radius: 12px;
  }
  .pro-mnc tbody td {
    padding: 10px 16px;
    border-bottom: 1px solid #ecfdf5;
    font-size: 14px;
    color: #374151;
  }
  .pro-mnc tbody tr:nth-child(even) {
    background-color: #ecfdf5;
  }
  .pro-mnc tbody tr:nth-child(odd) {
    background-color: white;
  }
  .pro-mnc tbody tr:hover {
    background-color: #d1fae5;
  }
  .pro-mnc tbody tr:last-child td:first-child {
    border-bottom-left-radius: 12px;
  }
  .pro-mnc tbody tr:last-child td:last-child {
    border-bottom-right-radius: 12px;
  }

  /* ===== BLOCKQUOTES ===== */
  .pro-mnc blockquote {
    border-left: 4px solid #10b981;
    background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
    margin: 1.25rem 0;
    padding: 1rem 1.25rem;
    border-radius: 0 12px 12px 0;
    font-style: italic;
    color: #065f46;
  }
  .pro-mnc blockquote p {
    color: #065f46;
    margin-bottom: 0;
  }

  /* ===== CODE ===== */
  .pro-mnc code {
    background: #ecfdf5;
    color: #065f46;
    padding: 0.15rem 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    border: 1px solid #d1fae5;
  }
  .pro-mnc pre {
    background: #1e293b;
    border-radius: 12px;
    padding: 1.25rem;
    overflow-x: auto;
    margin: 1.25rem 0;
  }
  .pro-mnc pre code {
    background: transparent;
    color: #e2e8f0;
    border: none;
    padding: 0;
    font-size: 0.85rem;
  }

  /* ===== IMAGES ===== */
  .pro-mnc img {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    margin: 1rem 0;
    max-width: 100%;
  }

  /* ===== HORIZONTAL RULE ===== */
  .pro-mnc hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, #10b981, transparent);
    margin: 2rem 0;
  }

  /* ===== KEY POINT / IMPORTANT BOXES ===== */
  .pro-mnc .key-point,
  .pro-mnc .important,
  .pro-mnc [class*="key-point"],
  .pro-mnc [class*="important"] {
    background: linear-gradient(135deg, #fef3c7, #fffbeb);
    border: 1px solid #f59e0b;
    border-left: 4px solid #f59e0b;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin: 1rem 0;
  }

  .pro-mnc .tip,
  .pro-mnc [class*="tip"] {
    background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
    border: 1px solid #10b981;
    border-left: 4px solid #10b981;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin: 1rem 0;
  }

  .pro-mnc .warning,
  .pro-mnc [class*="warning"] {
    background: linear-gradient(135deg, #fef2f2, #fff1f2);
    border: 1px solid #ef4444;
    border-left: 4px solid #ef4444;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin: 1rem 0;
  }

  /* ===== SUB/SUPER SCRIPT ===== */
  .pro-mnc sub, .pro-mnc sup {
    font-size: 0.75em;
  }
`

// ==================== VIDEO PLAYER COMPONENT ====================

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  if (videoError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 group"
      >
        <div className="w-full aspect-video flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Video Not Available</h3>
          <p className="text-gray-400 text-sm max-w-md mb-4">The video for this lesson is currently being processed. Please study the text content and PDF materials below.</p>
          <div className="flex items-center gap-2 text-amber-400 text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Text content and PDF are still available for this module</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden shadow-2xl bg-black group"
    >
      {/* Red VIDEO LESSON Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-2 bg-red-500/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg">
          <MonitorPlay className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Video Lesson</span>
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      {/* Title Overlay - Top Right */}
      <div className="absolute top-3 right-3 z-10 max-w-[50%]">
        <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg">
          <p className="text-xs font-semibold truncate">{title}</p>
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={url}
        className="w-full aspect-video object-contain bg-black"
        controls
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setVideoError(true)}
      >
        Your browser does not support the video tag.
      </video>

      {/* Play overlay for initial state */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity group-hover:bg-black/50"
          onClick={togglePlay}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 hover:bg-white/30 transition-all hover:scale-105 transform">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <span className="text-white/80 text-sm font-medium">Click to Play</span>
          </div>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </motion.div>
  )
}

// ==================== CONTACTS PANEL COMPONENT ====================

function ContactsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user)

  const contacts = [
    {
      icon: <Building2 className="w-5 h-5" />,
      label: 'Reporting Manager',
      name: user?.department === 'Sales' ? 'Vikram Sharma' : 'Priya Mehta',
      role: 'Regional Sales Director',
      email: user?.department === 'Sales' ? 'vikram.sharma@laxree.com' : 'priya.mehta@laxree.com',
      phone: '+91 98765 43210',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      icon: <HeadphonesIcon className="w-5 h-5" />,
      label: 'LAXREE Support',
      name: 'Support Team',
      role: '24/7 Product & Sales Support',
      email: 'support@laxree.com',
      phone: '+91 1800 123 4567',
      gradient: 'from-teal-500 to-cyan-600',
      bgLight: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: 'Training Coordinator',
      name: 'Anita Kapoor',
      role: 'Learning & Development',
      email: 'training@laxree.com',
      phone: '+91 98765 67890',
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white rounded-t-3xl z-10 px-6 pt-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Contact className="w-4 h-4 text-white" />
                  </div>
                  Contacts & Support
                </h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              {contacts.map((c, idx) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`p-5 rounded-2xl border ${c.borderColor} ${c.bgLight} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shrink-0 shadow-md`}>
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{c.label}</p>
                      <p className="text-base font-bold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500 mb-3">{c.role}</p>
                      <div className="flex flex-col gap-2">
                        <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors group">
                          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <Mail className="w-3 h-3" />
                          </div>
                          {c.email}
                        </a>
                        <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors group">
                          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <Phone className="w-3 h-3" />
                          </div>
                          {c.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="pt-3 pb-6 text-center">
                <p className="text-xs text-gray-300 flex items-center justify-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  LAXREE Sales University &mdash; Always Here to Help
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ==================== MAIN COMPONENT ====================

// Helper to convert upload URLs to API-served URLs
function getProperUrl(url: string): string {
  if (!url) return url
  if (url.startsWith('/api/') || url.startsWith('http')) return url
  const fileName = url.replace(/^\/upload\//, '')
  return `/api/uploads?file=${encodeURIComponent(fileName)}`
}

export function LessonViewer({
  module,
  course,
  academy,
  completions,
  onBack,
  onQuiz,
  onComplete,
  onNavigate,
  onDownloadPDF,
}: LessonViewerProps) {
  const [funMode, setFunMode] = useState(false)
  const [quizThought] = useState(() => getQuizThought(module.title))
  const [completing, setCompleting] = useState(false)
  const [contactsOpen, setContactsOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  // Proper URLs for video and PDF
  const videoUrl = module.contentUrl ? getProperUrl(module.contentUrl) : ''
  const pdfUrl = module.pdfUrl ? getProperUrl(module.pdfUrl) : ''

  // Content tab state - smart default based on content type
  const isVideo = module.contentType === 'video' && module.contentUrl
  const hasPdf = !!module.pdfUrl
  const getDefaultTab = (): 'watch' | 'pdf' | 'read' => {
    if (isVideo) return 'watch'
    if (hasPdf) return 'pdf'
    return 'read'
  }
  const [activeContentTab, setActiveContentTab] = useState<'watch' | 'pdf' | 'read'>(getDefaultTab)

  const completion = completions[module.id]
  const isCompleted = completion?.completed || false
  const modScore = completion?.score
  const moduleEmoji = getModuleEmoji(module.title)
  const crossSellItems = getCrossSellItems(module.title)

  // Navigation
  const sortedModules = useMemo(
    () => [...course.modules].sort((a, b) => a.order - b.order),
    [course.modules]
  )
  const currentIndex = sortedModules.findIndex(m => m.id === module.id)
  const prevModule = currentIndex > 0 ? sortedModules[currentIndex - 1] : null
  const nextModule = currentIndex < sortedModules.length - 1 ? sortedModules[currentIndex + 1] : null
  const totalModules = sortedModules.length
  const progressPercent = Math.round(((currentIndex + 1) / totalModules) * 100)

  const handleMarkComplete = async () => {
    setCompleting(true)
    try {
      await onComplete(module)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col min-h-full"
    >
      {/* Inject professional content CSS */}
      <style dangerouslySetInnerHTML={{ __html: PROFESSIONAL_CONTENT_STYLES }} />

      {/* ==================== TOP NAVIGATION BAR (STICKY) ==================== */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Row 1: Breadcrumbs + Actions */}
          <div className="py-3 flex items-center justify-between gap-3">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold shrink-0 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">LAXREE Academy</span>
                <span className="sm:hidden">Back</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <span className="text-gray-500 truncate hidden sm:inline">{academy.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 hidden sm:block" />
              <span className="text-gray-800 font-semibold truncate">Module {module.order}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Progress Pill */}
              <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs text-gray-600 font-semibold">{currentIndex + 1}/{totalModules}</span>
              </div>

              {/* PROMINENT PDF Download Button - GOLD/AMBER */}
              <Button
                size="sm"
                className="h-9 text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md shadow-amber-200/50 relative font-semibold"
                onClick={() => onDownloadPDF(module)}
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
              </Button>

              {/* Take Quiz */}
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs gap-1.5 border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 font-semibold"
                onClick={() => onQuiz(module)}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Take Quiz</span>
              </Button>

              {/* Mark Complete */}
              {!isCompleted ? (
                <Button
                  size="sm"
                  className="h-9 text-xs gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm font-semibold"
                  onClick={handleMarkComplete}
                  disabled={completing}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{completing ? 'Saving...' : 'Mark Complete'}</span>
                </Button>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700 gap-1 px-3 py-1.5 h-9 text-xs font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONTENT TAB BAR (STICKY) ==================== */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            {/* Watch Video Tab */}
            {isVideo && (
              <button
                onClick={() => setActiveContentTab('watch')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeContentTab === 'watch'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Watch Video</span>
                <span className="text-base leading-none">🎬</span>
              </button>
            )}

            {/* View PDF Tab */}
            <button
              onClick={() => setActiveContentTab('pdf')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeContentTab === 'pdf'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileDown className="w-4 h-4" />
              <span>View PDF</span>
              <span className="text-base leading-none">📄</span>
            </button>

            {/* Read Tab */}
            <button
              onClick={() => setActiveContentTab('read')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeContentTab === 'read'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Read</span>
              <span className="text-base leading-none">📖</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== SCROLLABLE CONTENT AREA ==================== */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="space-y-6">

            {/* ====== WATCH VIDEO TAB CONTENT ====== */}
            {activeContentTab === 'watch' && isVideo && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <VideoPlayer url={videoUrl} title={module.title} />
              </motion.div>
            )}

            {/* ====== VIEW PDF TAB CONTENT ====== */}
            {activeContentTab === 'pdf' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-4"
              >
                {/* PDF Tab Header with Download Button */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                      <FileDown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">
                        {module.pdfUrl ? 'Lesson PDF' : 'Download Lesson PDF'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {module.pdfUrl ? 'View and download the lesson document' : 'Save this lesson for offline reading & quick reference'}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="h-10 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-200/50 font-semibold text-sm gap-2 shrink-0"
                    onClick={() => onDownloadPDF(module)}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>

                {/* Embedded PDF Viewer or Download Card */}
                {module.pdfUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-gray-50">
                    <iframe
                      src={pdfUrl}
                      className="w-full border-0 rounded-xl"
                      style={{ height: '80vh' }}
                      title={`PDF: ${module.title}`}
                    />
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 p-[1px]">
                    <div className="relative rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/3 translate-x-1/3" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200/20 rounded-full translate-y-1/3 -translate-x-1/3" />
                      <div className="absolute top-4 right-4 text-6xl opacity-10 select-none">📄</div>

                      <div className="relative z-10 flex flex-col items-center text-center py-8 gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                          <FileDown className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-amber-900 flex items-center justify-center gap-2">
                            Download Lesson PDF
                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                              <Download className="w-2.5 h-2.5" /> Ready
                            </span>
                          </h3>
                          <p className="text-sm text-amber-700 mt-2 max-w-md">
                            Save this lesson for offline reading &amp; quick reference during sales calls
                          </p>
                        </div>
                        <Button
                          className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/50 font-bold text-sm gap-2"
                          onClick={() => onDownloadPDF(module)}
                        >
                          <Download className="w-5 h-5" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ====== READ TAB CONTENT ====== */}
            {activeContentTab === 'read' && (
            <>
            {/* ====== HERO BANNER ====== */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isVideo ? 0.15 : 0.1 }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-8 text-white shadow-xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
                <div className="absolute top-6 right-6 text-7xl opacity-15 select-none">{moduleEmoji}</div>
                <div className="absolute bottom-4 right-16 w-16 h-16 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-white/5 rounded-full" />

                <div className="relative z-10">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm font-semibold">
                      Module {module.order} of {totalModules}
                    </Badge>
                    {isVideo && (
                      <Badge className="bg-red-500/90 text-white border-red-400/30 text-xs gap-1 font-semibold">
                        <Video className="w-3 h-3" /> Video Lesson
                      </Badge>
                    )}
                    {!isVideo && module.contentType === 'text' && (
                      <Badge className="bg-teal-500/80 text-white border-teal-400/30 text-xs gap-1 font-semibold">
                        <BookOpen className="w-3 h-3" /> Reading Material
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge className="bg-emerald-400/30 text-white border-emerald-300/30 text-xs gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </Badge>
                    )}
                    {module.duration && (
                      <Badge className="bg-white/15 text-white border-white/20 text-xs gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {module.duration} min
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 tracking-tight">
                    {module.title}
                  </h1>

                  {/* Description */}
                  {module.description && (
                    <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                      {module.description}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-5 mt-5 flex-wrap">
                    {module.duration && (
                      <div className="flex items-center gap-2 text-emerald-200 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span>{module.duration} min read</span>
                      </div>
                    )}
                    {modScore !== null && modScore !== undefined && (
                      <div className="flex items-center gap-2 text-emerald-200 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Star className="w-4 h-4" />
                        </div>
                        <span>Score: {modScore}%</span>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-emerald-300 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <span>Module Complete!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ====== LEARNING OBJECTIVE CARD ====== */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isVideo ? 0.2 : 0.15 }}
            >
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-800 mb-1.5 flex items-center gap-2">
                      Learning Objective
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px] border-emerald-200 font-semibold">GOAL</Badge>
                    </h3>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      {module.description || `By the end of this module, you will understand the key concepts of "${module.title}" and be able to apply this knowledge in real sales scenarios.`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ====== MAIN CONTENT AREA - PROFESSIONAL PROSE ====== */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isVideo ? 0.25 : 0.2 }}
            >
              {module.content ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Content header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">Lesson Content</h3>
                        <p className="text-xs text-gray-400">Read carefully to master this topic</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isVideo && (
                        <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px] gap-1 font-semibold">
                          <Video className="w-3 h-3" /> Video + Reading
                        </Badge>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Reading Mode</span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Content Renderer */}
                  <div className="px-6 sm:px-10 py-6 sm:py-8">
                    <div
                      className="pro-mnc max-w-none"
                      dangerouslySetInnerHTML={{ __html: module.content }}
                    />
                  </div>
                </div>
              ) : !isVideo ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">Content Coming Soon</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    This module&apos;s interactive content will be available when you start the course.
                  </p>
                </div>
              ) : null}
            </motion.div>

            {/* ====== CROSS-SELL OPPORTUNITIES CARD ====== */}
            {crossSellItems && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isVideo ? 0.3 : 0.25 }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  {/* Gold/Amber gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl" />
                  <div className="relative m-[2px] rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full -translate-y-1/4 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-200/20 rounded-full translate-y-1/4 -translate-x-1/4" />
                    <div className="absolute top-4 right-6 text-6xl opacity-[0.07] select-none font-bold">$$$</div>

                    <div className="relative z-10 p-6 sm:p-8">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/40">
                          <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                            Cross-Sell Opportunities
                            <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                              <Zap className="w-2.5 h-2.5" /> Revenue Boost
                            </span>
                          </h3>
                          <p className="text-sm text-amber-700 mt-0.5">
                            When selling <strong>{module.title}</strong>, also pitch these complementary products
                          </p>
                        </div>
                      </div>

                      {/* Cross-sell items */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {crossSellItems.map((item, idx) => {
                          const IconComp = item.icon
                          return (
                            <motion.div
                              key={item.product}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + idx * 0.08 }}
                              className="group relative bg-white rounded-xl border border-amber-200/80 p-5 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden"
                            >
                              {/* Hover glow */}
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 to-orange-100/0 group-hover:from-amber-100/50 group-hover:to-orange-100/30 transition-all" />

                              <div className="relative z-10">
                                {/* Product icon + name */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
                                    <IconComp className="w-5 h-5 text-amber-700" />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5 text-amber-500" />
                                    <h4 className="text-sm font-bold text-amber-900">{item.product}</h4>
                                  </div>
                                </div>

                                {/* Pitch */}
                                <p className="text-xs text-amber-800/80 leading-relaxed line-clamp-3">
                                  {item.pitch}
                                </p>

                                {/* Action hint */}
                                <div className="flex items-center gap-1 mt-3 text-amber-600 group-hover:text-amber-700 transition-colors">
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Learn More</span>
                                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Bottom tip */}
                      <div className="mt-5 pt-4 border-t border-amber-200/60">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-800">Pro Tip</p>
                            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                              Bundle these products in your proposals for higher deal values. Hotels prefer single-vendor solutions — positioning LAXREE as a complete room solution increases close rates by up to 40%.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ====== FUN LEARNING MODE TOGGLE ====== */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isVideo ? 0.35 : 0.3 }}
            >
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-amber-800">Fun Learning Mode</p>
                    <p className="text-xs text-amber-600 mt-0.5">Hotel guest scenarios & real-world examples</p>
                  </div>
                </div>
                <Switch
                  checked={funMode}
                  onCheckedChange={setFunMode}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            </motion.div>

            {/* Fun Mode Hotel Guest Scenario */}
            <AnimatePresence>
              {funMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-fuchsia-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0 shadow-md text-xl">
                        🏨
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                          <span>🎭</span> Hotel Guest Scenario
                          <Badge className="bg-purple-100 text-purple-700 text-[10px] border-purple-200 font-semibold">IMMERSIVE</Badge>
                        </h3>
                        <p className="text-sm text-purple-700 leading-relaxed">
                          Imagine you&apos;re a hotel guest walking into a {module.title.toLowerCase().includes('mini') ? 'luxury suite and opening the mini bar' : module.title.toLowerCase().includes('safe') ? 'room and securing valuables in the safe' : module.title.toLowerCase().includes('rfid') ? 'room and tapping your card to unlock the door' : module.title.toLowerCase().includes('kettle') ? 'room and making morning tea with the kettle' : 'room and experiencing the amenities'}. What would make you say &ldquo;Wow, this hotel really thought of everything&rdquo;? That&apos;s the LAXREE difference you&apos;re selling.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ====== QUICK QUIZ THOUGHT CARD ====== */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isVideo ? 0.4 : 0.35 }}
            >
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-amber-800 mb-1.5 flex items-center gap-2">
                      💭 Quick Quiz Thought
                      <Badge className="bg-amber-100 text-amber-700 text-[10px] border-amber-200 font-semibold">THINK</Badge>
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      {quizThought}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-9 text-xs border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800 font-semibold gap-1.5"
                      onClick={() => onQuiz(module)}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Take Quiz to Find Out
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ====== MODULE NAVIGATION ====== */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isVideo ? 0.45 : 0.4 }}
            >
              <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
                {prevModule ? (
                  <button
                    onClick={() => onNavigate(prevModule)}
                    className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-all group flex-1 max-w-[45%] border border-transparent hover:border-gray-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-all shrink-0 border border-transparent">
                      <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Previous</p>
                      <p className="text-sm font-medium text-gray-700 truncate group-hover:text-emerald-700 transition-colors">{prevModule.title}</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex-1" />
                )}
                {nextModule ? (
                  <button
                    onClick={() => onNavigate(nextModule)}
                    className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-all group flex-1 max-w-[45%] justify-end border border-transparent hover:border-gray-200"
                  >
                    <div className="text-right min-w-0">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Next</p>
                      <p className="text-sm font-medium text-gray-700 truncate group-hover:text-emerald-700 transition-colors">{nextModule.title}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-all shrink-0 border border-transparent">
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </button>
                ) : (
                  <div className="flex-1" />
                )}
              </div>
            </motion.div>

            {/* ====== FOOTER BRANDING ====== */}
            <div className="text-center pt-8 pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-400 tracking-wide">LAXREE Sales University</p>
              </div>
              <p className="text-[10px] text-gray-300">Empowering Hospitality Excellence</p>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* ==================== STICKY BOTTOM NAV BAR ==================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Previous */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 h-10 font-semibold"
              disabled={!prevModule}
              onClick={() => prevModule && onNavigate(prevModule)}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Center Actions */}
            <div className="flex items-center gap-2">
              {!isCompleted ? (
                <Button
                  size="sm"
                  className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-10 shadow-sm font-semibold"
                  onClick={handleMarkComplete}
                  disabled={completing}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{completing ? 'Marking...' : 'Mark Complete'}</span>
                  <span className="sm:hidden">{completing ? '...' : 'Complete'}</span>
                </Button>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700 gap-1 px-4 py-2 h-10 text-sm font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Done
                </Badge>
              )}
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white h-10 shadow-sm font-semibold"
                onClick={() => onQuiz(module)}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{isCompleted ? 'Retake Quiz' : 'Take Quiz'}</span>
                <span className="sm:hidden">Quiz</span>
              </Button>
            </div>

            {/* Next */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 h-10 font-semibold"
              disabled={!nextModule}
              onClick={() => nextModule && onNavigate(nextModule)}
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ==================== FLOATING CONTACTS BUTTON ==================== */}
      <button
        onClick={() => setContactsOpen(true)}
        className="fixed bottom-20 right-4 sm:right-6 z-30 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all"
        title="Contacts & Support"
      >
        <Users className="w-5 h-5" />
      </button>

      {/* ==================== CONTACTS PANEL ==================== */}
      <ContactsPanel open={contactsOpen} onClose={() => setContactsOpen(false)} />

      {/* ==================== SIMULATION DIALOG (reserved for future use) ==================== */}
      <SimulationDialog
        simulationId={null}
        open={false}
        onClose={() => {}}
        onComplete={() => {}}
      />
    </motion.div>
  )
}
