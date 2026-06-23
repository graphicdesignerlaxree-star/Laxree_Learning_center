'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Loader2, ChevronRight, Shield, User,
  Building2, BookOpen, Target, Award, LogIn, Home, ArrowLeft, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAuthStore, type Company } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'

type Segment = 'AMENITIES' | 'ROOFING'

const SEGMENT_CONFIG: Record<Segment, {
  label: string
  fullName: string
  tagline: string
  subtitle: string
  heroTitle: string
  heroSubtitle: string
  accent: string
  gradient: string
  overlay: string
  glow1: string
  glow2: string
  demoAccounts: { email: string; password: string; label: string; icon: typeof Shield; iconBg: string; iconColor: string; hoverBg: string }[]
  valueProps: { icon: typeof BookOpen; title: string; desc: string }[]
}> = {
  AMENITIES: {
    label: 'Laxree Amenities',
    fullName: 'Laxree Amenities',
    tagline: 'Hotel Amenity Sales Training',
    subtitle: 'Hospitality product training platform',
    heroTitle: 'Welcome to Your Learning Journey',
    heroSubtitle: "Grow your skills, earn certifications, and unlock your potential with LAXREE's hospitality training platform.",
    accent: 'emerald',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 20%, #047857 40%, #0d9488 60%, #065f46 80%, #064e3b 100%)',
    overlay: 'bg-gradient-to-br from-emerald-950/80 via-emerald-900/75 to-teal-900/80',
    glow1: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
    demoAccounts: [
      { email: 'admin@laxree.com', password: 'admin123', label: 'Super Admin', icon: Shield, iconBg: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50/80 hover:border-emerald-300' },
      { email: 'emp002@laxree.com', password: 'emp123', label: 'Employee', icon: User, iconBg: 'bg-teal-50 border-teal-200', iconColor: 'text-teal-600', hoverBg: 'hover:bg-teal-50/80 hover:border-teal-300' },
    ],
    valueProps: [
      { icon: BookOpen, title: 'Expert-Led Courses', desc: '13+ specialized modules crafted by hospitality professionals' },
      { icon: Target, title: 'Personalized Learning', desc: 'AI-powered paths tailored to your role and skill level' },
      { icon: Award, title: 'Recognized Certifications', desc: 'Industry-recognized credentials to advance your career' },
    ],
  },
  ROOFING: {
    label: 'Laxree Roofing',
    fullName: 'Laxree Roofing',
    tagline: 'Roofing Sales & Technical Training',
    subtitle: 'Premium roofing solutions training platform',
    heroTitle: 'Master Roofing, Build Careers',
    heroSubtitle: 'Train on stone-coated tiles, artificial thatch, and asphalt shingles. Grow your sales and technical expertise with Laxree Roofing.',
    accent: 'amber',
    gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 20%, #92400e 40%, #b45309 60%, #92400e 80%, #451a03 100%)',
    overlay: 'bg-gradient-to-br from-amber-950/85 via-orange-900/80 to-stone-900/85',
    glow1: 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(217, 119, 6, 0.4) 0%, transparent 70%)',
    demoAccounts: [
      { email: 'roofing.admin@laxree.com', password: 'admin123', label: 'Roofing Admin', icon: Shield, iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600', hoverBg: 'hover:bg-amber-50/80 hover:border-amber-300' },
      { email: 'roofing.emp001@laxree.com', password: 'emp123', label: 'Roofing Employee', icon: User, iconBg: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-600', hoverBg: 'hover:bg-orange-50/80 hover:border-orange-300' },
    ],
    valueProps: [
      { icon: BookOpen, title: 'Roofing Product Academy', desc: 'Stone-coated tiles, thatch tiles, and asphalt shingles deep dives' },
      { icon: Target, title: 'Sales & Installation Training', desc: 'Field sales, inbound sales, and technical installation modules' },
      { icon: Award, title: 'Roofing Certifications', desc: 'Get certified on Laxree Roofing products and sales methodology' },
    ],
  },
}

/* ─── Floating Particle ─── */
function Particle({ delay, duration, x, y, size }: {
  delay: number; duration: number; x: number; y: number; size: number
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/10"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.8, 0],
        scale: [0, 0.8, 1, 0.6, 0],
        y: [0, -20, -40, -60, -80],
      }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: delay * 0.6, ease: 'easeInOut' }}
    />
  )
}

/* ─── Global Styles ─── */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes gentleFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
      @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .gentle-float { animation: gentleFloat 6s ease-in-out infinite; }
      .gradient-shift { background-size: 300% 300%; animation: gradientShift 12s ease infinite; }
      .login-input:focus { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
      .login-input-amber:focus { box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15); }
    `}</style>
  )
}

export function LoginPage() {
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const login = useAuthStore((s) => s.login)
  const { toast } = useToast()

  useEffect(() => { setMounted(true) }, [])

  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 8,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
    })), [])

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const e = loginEmail || email
    const p = loginPassword || password
    const c = selectedSegment

    if (!e || !p) { setError('Please enter email and password'); return }
    if (!c) { setError('Please select a segment first'); return }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, password: p, company: c }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      login(data.user)
      toast({ title: 'Welcome back!', description: `Logged in as ${data.user.fullName || data.user.email}` })
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = useCallback((demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    handleLogin(demoEmail, demoPassword)
  }, [selectedSegment])

  const handleBackToSegments = () => {
    setSelectedSegment(null)
    setEmail('')
    setPassword('')
    setError('')
  }

  /* ─── Segment Selector Screen ─── */
  if (!selectedSegment) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-white to-stone-100">
          {/* Top bar */}
          <header className="px-6 py-5 sm:px-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-stone-800 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-stone-800">Laxree Solutions</span>
                <span className="text-stone-400 text-xs font-medium ml-1.5">LLP</span>
              </div>
            </div>
            <a href="https://laxreeroofing.com/" target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
              <Home className="w-3.5 h-3.5" /> laxreeroofing.com
            </a>
          </header>

          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mb-10"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight mb-3">
                Choose Your Training Segment
              </h1>
              <p className="text-stone-500 text-base sm:text-lg leading-relaxed">
                Laxree Solutions LLP operates two business segments. Select the one you belong to so we can show the right training, exams, and content for you.
              </p>
            </motion.div>

            {/* Segment cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              {/* Amenities card */}
              <motion.button
                type="button"
                onClick={() => setSelectedSegment('AMENITIES')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                className="group relative overflow-hidden rounded-2xl text-left shadow-lg shadow-emerald-900/10 border border-emerald-100"
              >
                <div className="absolute inset-0 gradient-shift" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent" />
                <div className="relative z-10 p-7 sm:p-8 text-white min-h-[260px] flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-emerald-200/80">Segment 1</div>
                      <div className="text-xl font-bold">Laxree Amenities</div>
                    </div>
                  </div>
                  <p className="text-emerald-100/85 text-sm leading-relaxed mb-5">
                    Hotel amenity sales training — safe boxes, RFID door locks, minibars, electric kettles, hair dryers, mirrors, digital signage, dispensers, and housekeeping trolleys.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-emerald-200/70 font-medium">Hospitality training platform</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/15 group-hover:bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors">
                      Continue <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* Roofing card */}
              <motion.button
                type="button"
                onClick={() => setSelectedSegment('ROOFING')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                className="group relative overflow-hidden rounded-2xl text-left shadow-lg shadow-amber-900/10 border border-amber-100"
              >
                <div className="absolute inset-0 gradient-shift" style={{ background: 'linear-gradient(135deg, #451a03 0%, #92400e 50%, #b45309 100%)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 to-transparent" />
                <div className="relative z-10 p-7 sm:p-8 text-white min-h-[260px] flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-amber-200/80">Segment 2</div>
                      <div className="text-xl font-bold">Laxree Roofing</div>
                    </div>
                  </div>
                  <p className="text-amber-100/85 text-sm leading-relaxed mb-5">
                    Premium roofing solutions training — stone-coated tiles, artificial thatch tiles, and asphalt shingle tiles. Sales, technical, and installation expertise.
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-amber-200/70 font-medium">Roofing training platform</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/15 group-hover:bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors">
                      Continue <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-xs text-stone-400 text-center max-w-md"
            >
              Employees can only access the segment they belong to. If you don&apos;t know which segment you&apos;re in, contact your administrator.
            </motion.p>
          </div>

          <footer className="px-6 py-5 text-center">
            <p className="text-[11px] text-stone-300 tracking-wide">
              &copy; {new Date().getFullYear()} Laxree Solutions LLP. All rights reserved.
            </p>
          </footer>
        </div>
      </>
    )
  }

  /* ─── Login Form Screen (segment selected) ─── */
  const cfg = SEGMENT_CONFIG[selectedSegment]
  const isAmber = selectedSegment === 'ROOFING'

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* ─── Left Branding Panel ─── */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col gradient-shift" style={{ background: cfg.gradient }}>
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" style={{ pointerEvents: 'none' }}>
            <source src="/api/uploads?file=3D_boy_mascot_logo_reveal_202606101754.mp4" type="video/mp4" />
          </video>
          <div className={`absolute inset-0 z-[1] ${cfg.overlay}`} />
          <div
            className="absolute inset-0 z-[2] opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full z-[2] opacity-20" style={{ background: cfg.glow1 }} />
          <div className="absolute bottom-32 left-10 w-[350px] h-[350px] rounded-full z-[2] opacity-15" style={{ background: cfg.glow2 }} />

          {mounted && particles.map((p) => (<Particle key={p.id} {...p} />))}

          <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full flex-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="mb-6">
              <div className="inline-flex items-center gap-3">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 gentle-float">
                  {isAmber ? <Home className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <span className="text-white text-xl font-bold tracking-wide">{isAmber ? 'LAXREE' : 'LAXREE'}</span>
                  <span className={`text-sm font-medium ml-2 ${isAmber ? 'text-amber-200/70' : 'text-emerald-200/70'}`}>{isAmber ? 'Roofing' : 'Amenities'}</span>
                </div>
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }} className="text-4xl xl:text-5xl font-bold text-white leading-[1.2] tracking-tight mb-5">
              {cfg.heroTitle}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }} className={`text-lg max-w-md leading-relaxed mb-10 ${isAmber ? 'text-amber-100/70' : 'text-emerald-100/70'}`}>
              {cfg.heroSubtitle}
            </motion.p>

            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }} className={`w-20 h-0.5 mb-10 origin-left bg-gradient-to-r ${isAmber ? 'from-amber-300/60 to-transparent' : 'from-emerald-300/60 to-transparent'}`} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="space-y-5">
              {cfg.valueProps.map((prop, i) => {
                const IconComp = prop.icon
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.12, duration: 0.5 }} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 group-hover:border-white/20 transition-all duration-300">
                      <IconComp className={`w-5 h-5 ${isAmber ? 'text-amber-200 group-hover:text-white' : 'text-emerald-200 group-hover:text-white'} transition-colors`} />
                    </div>
                    <div>
                      <div className="text-white/90 text-sm font-semibold mb-0.5">{prop.title}</div>
                      <div className={`text-xs leading-relaxed ${isAmber ? 'text-amber-100/40' : 'text-emerald-100/40'}`}>{prop.desc}</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }} className="relative z-10 px-12 xl:px-16 pb-10">
            <div className="border-t border-white/10 pt-6">
              <p className={`text-xs italic ${isAmber ? 'text-amber-100/30' : 'text-emerald-100/30'}`}>
                &ldquo;The beautiful thing about learning is that no one can take it away from you.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Login Form Panel ─── */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white relative overflow-hidden min-h-screen lg:min-h-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: isAmber ? 'radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.02]" style={{ background: isAmber ? 'radial-gradient(circle, rgba(217, 119, 6, 0.4) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)' }} />

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }} className="w-full max-w-[420px] relative z-10">
            {/* Back to segments */}
            <button type="button" onClick={handleBackToSegments} className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors mb-6">
              <ArrowLeft className="w-3.5 h-3.5" /> All segments
            </button>

            {/* Mobile branding */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-2.5 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${isAmber ? 'bg-amber-600 shadow-amber-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
                  {isAmber ? <Home className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
                </div>
                <span className={`text-lg font-bold ${isAmber ? 'text-amber-800' : 'text-emerald-800'}`}>LAXREE</span>
                <span className={`text-sm font-medium ${isAmber ? 'text-amber-500/60' : 'text-emerald-500/60'}`}>{isAmber ? 'Roofing' : 'Amenities'}</span>
              </div>
            </motion.div>

            {/* Segment badge */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }} className="mb-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isAmber ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                <Check className="w-3 h-3" /> {cfg.fullName} — {cfg.tagline}
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-gray-400 text-sm mt-1.5">Sign in to continue your learning journey</p>
            </motion.div>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-5">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="space-y-2">
                  <Label htmlFor="email" className="text-gray-600 font-medium text-[13px]">Email address</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`${isAmber ? 'login-input-amber focus:border-amber-400 focus:ring-amber-400/10' : 'login-input focus:border-emerald-400 focus:ring-emerald-400/10'} h-12 bg-gray-50/80 border-gray-200 text-gray-900 placeholder:text-gray-300 focus:bg-white rounded-xl text-sm transition-all duration-200`} disabled={isLoading} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-600 font-medium text-[13px]">Password</Label>
                    <button type="button" className={`text-[12px] font-medium transition-colors ${isAmber ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}>Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${isAmber ? 'login-input-amber focus:border-amber-400 focus:ring-amber-400/10' : 'login-input focus:border-emerald-400 focus:ring-emerald-400/10'} h-12 bg-gray-50/80 border-gray-200 text-gray-900 placeholder:text-gray-300 focus:bg-white pr-12 rounded-xl text-sm transition-all duration-200`} disabled={isLoading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
                  <Button type="submit" className={`w-full h-12 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg text-sm ${isAmber ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/15 hover:shadow-amber-600/25' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15 hover:shadow-emerald-600/25'}`} disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>) : (<><LogIn className="w-4 h-4 mr-2" />Sign In</>)}
                  </Button>
                </motion.div>
              </form>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-300 tracking-widest font-medium">Quick access</span></div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="space-y-3">
                {cfg.demoAccounts.map((account, i) => {
                  const IconComp = account.icon
                  return (
                    <motion.button key={account.email} type="button" onClick={() => handleQuickLogin(account.email, account.password)} disabled={isLoading} className={`w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 ${account.hoverBg} hover:shadow-sm transition-all duration-300 text-left group disabled:opacity-50`} whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 + i * 0.08, duration: 0.4 }}>
                      <div className={`w-10 h-10 rounded-xl ${account.iconBg} border flex items-center justify-center`}>
                        <IconComp className={`w-4 h-4 ${account.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{account.label}</div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">{account.email}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-emerald-500 transition-colors" />
                    </motion.button>
                  )
                })}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.7 }} className="mt-10 text-center">
              <p className="text-[11px] text-gray-300 tracking-wide">&copy; {new Date().getFullYear()} {cfg.fullName}. All rights reserved.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
