'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Loader2, ChevronRight, Shield, User,
  Building2, BookOpen, Target, Award, LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'

const DEMO_ACCOUNTS = [
  { email: 'admin@laxree.com', password: 'admin123', label: 'Super Admin', icon: Shield, iconBg: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50/80 hover:border-emerald-300' },
  { email: 'emp002@laxree.com', password: 'emp123', label: 'Employee', icon: User, iconBg: 'bg-teal-50 border-teal-200', iconColor: 'text-teal-600', hoverBg: 'hover:bg-teal-50/80 hover:border-teal-300' },
]

const VALUE_PROPS = [
  { icon: BookOpen, title: 'Expert-Led Courses', desc: '13+ specialized modules crafted by hospitality professionals' },
  { icon: Target, title: 'Personalized Learning', desc: 'AI-powered paths tailored to your role and skill level' },
  { icon: Award, title: 'Recognized Certifications', desc: 'Industry-recognized credentials to advance your career' },
]

/* ─── Floating Particle ─── */
function Particle({ delay, duration, x, y, size }: {
  delay: number; duration: number; x: number; y: number; size: number
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.8, 0],
        scale: [0, 0.8, 1, 0.6, 0],
        y: [0, -20, -40, -60, -80],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: delay * 0.6,
        ease: 'easeInOut',
      }}
    />
  )
}

/* ─── Global Styles ─── */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes gentleFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .gentle-float {
        animation: gentleFloat 6s ease-in-out infinite;
      }
      .gradient-shift {
        background-size: 300% 300%;
        animation: gradientShift 12s ease infinite;
      }
      .login-input:focus {
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    `}</style>
  )
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const login = useAuthStore((s) => s.login)
  const { toast } = useToast()

  useEffect(() => { setMounted(true) }, [])

  /* Generate particles once - subtle and minimal */
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

    if (!e || !p) {
      setError('Please enter email and password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, password: p }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

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
  }, [])

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* ─── Left Branding Panel ─── */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 20%, #047857 40%, #0d9488 60%, #065f46 80%, #064e3b 100%)',
          }}
        >
          {/* 3D Boy Mascot Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ pointerEvents: 'none' }}
          >
            <source src="/api/uploads?file=3D_boy_mascot_logo_reveal_202606101754.mp4" type="video/mp4" />
          </video>

          {/* Semi-transparent dark overlay on top of video for text readability */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-br from-emerald-950/80 via-emerald-900/75 to-teal-900/80" />

          {/* Decorative overlay pattern */}
          <div
            className="absolute inset-0 z-[2] opacity-[0.04]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Warm glow accents */}
          <div
            className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full z-[2] opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-32 left-10 w-[350px] h-[350px] rounded-full z-[2] opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
            }}
          />

          {/* Floating particles */}
          {mounted && particles.map((p) => (
            <Particle key={p.id} {...p} />
          ))}

          {/* ─── Content ─── */}
          <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full flex-1">
            {/* Brand mark */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 gentle-float">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-white text-xl font-bold tracking-wide">LAXREE</span>
                  <span className="text-emerald-200/70 text-sm font-medium ml-2">Academy</span>
                </div>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
              className="text-4xl xl:text-5xl font-bold text-white leading-[1.2] tracking-tight mb-5"
            >
              Welcome to Your
              <br />
              Learning Journey
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="text-emerald-100/70 text-lg max-w-md leading-relaxed mb-10"
            >
              Grow your skills, earn certifications, and unlock your potential with LAXREE&apos;s hospitality training platform.
            </motion.p>

            {/* Decorative divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="w-20 h-0.5 mb-10 origin-left bg-gradient-to-r from-emerald-300/60 to-transparent"
            />

            {/* Value propositions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="space-y-5"
            >
              {VALUE_PROPS.map((prop, i) => {
                const IconComp = prop.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.5 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 group-hover:border-white/20 transition-all duration-300">
                      <IconComp className="w-5 h-5 text-emerald-200 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-white/90 text-sm font-semibold mb-0.5">{prop.title}</div>
                      <div className="text-emerald-100/40 text-xs leading-relaxed">{prop.desc}</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* Bottom decorative quote */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
            className="relative z-10 px-12 xl:px-16 pb-10"
          >
            <div className="border-t border-white/10 pt-6">
              <p className="text-emerald-100/30 text-xs italic">
                &ldquo;The beautiful thing about learning is that no one can take it away from you.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Login Form Panel ─── */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white relative overflow-hidden min-h-screen lg:min-h-0">
          {/* Subtle decorative elements */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.02]"
            style={{
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="w-full max-w-[420px] relative z-10"
          >
            {/* Mobile branding */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:hidden text-center mb-8"
            >
              <div className="inline-flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-emerald-800">LAXREE</span>
                <span className="text-emerald-500/60 text-sm font-medium">Academy</span>
              </div>
            </motion.div>

            {/* Welcome header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-gray-400 text-sm mt-1.5">Sign in to continue your learning journey</p>
            </motion.div>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleLogin()
                }}
                className="space-y-5"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-gray-600 font-medium text-[13px]">Email address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="login-input h-12 bg-gray-50/80 border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-emerald-400 focus:ring-emerald-400/10 focus:bg-white rounded-xl text-sm transition-all duration-200"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-600 font-medium text-[13px]">Password</Label>
                    <button type="button" className="text-[12px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-input h-12 bg-gray-50/80 border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-emerald-400 focus:ring-emerald-400/10 focus:bg-white pr-12 rounded-xl text-sm transition-all duration-200"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/25 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-300 tracking-widest font-medium">Quick access</span>
                </div>
              </motion.div>

              {/* Demo accounts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-3"
              >
                {DEMO_ACCOUNTS.map((account, i) => {
                  const IconComp = account.icon
                  return (
                    <motion.button
                      key={account.email}
                      type="button"
                      onClick={() => handleQuickLogin(account.email, account.password)}
                      disabled={isLoading}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 ${account.hoverBg} hover:shadow-sm transition-all duration-300 text-left group disabled:opacity-50`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.85 + i * 0.08, duration: 0.4 }}
                    >
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

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              className="mt-10 text-center"
            >
              <p className="text-[11px] text-gray-300 tracking-wide">
                &copy; {new Date().getFullYear()} LAXREE Academy. All rights reserved.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
