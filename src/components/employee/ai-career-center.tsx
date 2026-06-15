'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles, TrendingUp, Award, CheckCircle2, Circle, BookOpen,
  ChevronRight, ArrowUp, Target, Star, Zap, GraduationCap,
  Briefcase, ArrowRight
} from 'lucide-react'
import {
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'

interface CareerData {
  user: {
    id: string
    fullName: string | null
    designation: string | null
    currentLevel: string | null
    aiReadinessScore: number
    fieldReady: boolean
    inboundReady: boolean
  }
  trainingCompletion: number
  enrollments: Array<{
    id: string
    courseTitle: string
    progress: number
    status: string
  }>
  certifications: Array<{
    id: string
    name: string
    status: string
    score: number
  }>
}

const LEVELS = [
  { name: 'Beginner', icon: '🌱', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { name: 'Intermediate', icon: '🌿', color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  { name: 'Advanced', icon: '🌳', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { name: 'Expert', icon: '⭐', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
]

const SKILL_REQUIREMENTS: Record<string, Array<{ skill: string; category: string }>> = {
  Intermediate: [
    { skill: 'Complete Product Academy', category: 'Course' },
    { skill: 'Sales Methodology Assessment', category: 'Assessment' },
    { skill: 'Customer Discovery Fundamentals', category: 'Course' },
    { skill: 'Mock Sales Score ≥ 70', category: 'Simulation' },
    { skill: 'Field Sales Certification', category: 'Certification' },
  ],
  Advanced: [
    { skill: 'Negotiation Academy Complete', category: 'Course' },
    { skill: 'Competitive Intelligence Complete', category: 'Course' },
    { skill: 'Advanced Sales Assessment', category: 'Assessment' },
    { skill: 'Mock Sales Score ≥ 85', category: 'Simulation' },
    { skill: 'Inbound Sales Certification', category: 'Certification' },
    { skill: 'AI Readiness Score ≥ 75', category: 'Metric' },
  ],
  Expert: [
    { skill: 'All Academies Completed', category: 'Course' },
    { skill: 'All Assessments Passed', category: 'Assessment' },
    { skill: 'Mock Sales Score ≥ 90', category: 'Simulation' },
    { skill: 'All Certifications Earned', category: 'Certification' },
    { skill: 'AI Readiness Score ≥ 90', category: 'Metric' },
    { skill: 'Leaderboard Top 5', category: 'Metric' },
  ],
}

const CERT_REQUIREMENTS: Record<string, string[]> = {
  Intermediate: ['Field Sales Certification'],
  Advanced: ['Inbound Sales Certification', 'Negotiation Expert Certification'],
  Expert: ['All Available Certifications'],
}

const RECOMMENDED_COURSES = [
  { title: 'Advanced Product Features', type: 'PRODUCT_ACADEMY', duration: '2 hours', reason: 'Essential for next level' },
  { title: 'Sales Closing Techniques', type: 'SALES_ACADEMY', duration: '1.5 hours', reason: 'Boost your sales score' },
  { title: 'Competitive Analysis', type: 'COMPETITIVE_INTELLIGENCE', duration: '3 hours', reason: 'Strategic advantage' },
]

export function AICareerCenter() {
  const [data, setData] = useState<CareerData | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=EMPLOYEE`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to fetch career data:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const currentLevelName = data?.user.currentLevel || 'Beginner'
  const currentLevelIndex = LEVELS.findIndex(l => l.name === currentLevelName)
  const nextLevel = LEVELS[Math.min(currentLevelIndex + 1, LEVELS.length - 1)]
  const isMaxLevel = currentLevelIndex >= LEVELS.length - 1

  const readinessScore = Math.round(data?.user.aiReadinessScore || 0)

  // Calculate promotion readiness
  const completedCourses = data?.enrollments.filter(e => e.status === 'completed').length || 0
  const totalCourses = data?.enrollments.length || 1
  const certCount = data?.certifications.filter(c => c.status === 'approved').length || 0
  const promotionReadiness = isMaxLevel ? 100 : Math.min(100, Math.round(
    (completedCourses / totalCourses) * 40 +
    (certCount / 3) * 30 +
    (readinessScore / 100) * 30
  ))

  // Required skills for next level
  const requiredSkills = SKILL_REQUIREMENTS[nextLevel?.name || 'Intermediate'] || []
  const requiredCerts = CERT_REQUIREMENTS[nextLevel?.name || 'Intermediate'] || []

  // Simulate skill completion
  const skillCompletion = requiredSkills.map(s => ({
    ...s,
    completed: s.category === 'Course'
      ? data?.enrollments.some(e => e.courseTitle.includes(s.skill.split(' ')[0]) && e.status === 'completed') || false
      : s.category === 'Certification'
        ? data?.certifications.some(c => c.status === 'approved') || false
        : s.category === 'Assessment'
          ? readinessScore > 50
          : readinessScore > 60,
  }))

  const completedSkills = skillCompletion.filter(s => s.completed).length

  // AI Insights
  const aiInsight = promotionReadiness >= 80
    ? `You're very close to reaching ${nextLevel?.name} level! Focus on completing your remaining certifications and boosting your mock sales scores. Based on your current trajectory, you could reach the next level within 2-4 weeks.`
    : promotionReadiness >= 50
      ? `Good progress toward ${nextLevel?.name} level. You need to strengthen your core competencies and complete more training modules. Focus on the recommended courses below for targeted improvement.`
      : `You're at the beginning of your journey to ${nextLevel?.name} level. Start by completing foundational courses and assessments. Consistent daily learning will help you build momentum toward your career goals.`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Current Level + Next Level + Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current Level */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                LEVELS[currentLevelIndex]?.bgColor || 'bg-amber-50'
              }`}>
                {LEVELS[currentLevelIndex]?.icon || '🌱'}
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Level</p>
                <p className={`text-xl font-bold ${LEVELS[currentLevelIndex]?.color || 'text-amber-600'}`}>
                  {currentLevelName}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {data?.user.fieldReady && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Field Ready</Badge>
                  )}
                  {data?.user.inboundReady && (
                    <Badge className="bg-teal-100 text-teal-700 text-xs">Inbound Ready</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Level */}
        <Card className={`border ${isMaxLevel ? 'border-purple-100' : nextLevel?.borderColor || 'border-teal-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                nextLevel?.bgColor || 'bg-teal-50'
              }`}>
                {isMaxLevel ? '👑' : nextLevel?.icon || '🌿'}
              </div>
              <div>
                <p className="text-sm text-gray-500">{isMaxLevel ? 'Max Level' : 'Working Toward'}</p>
                <p className={`text-xl font-bold ${nextLevel?.color || 'text-teal-600'}`}>
                  {isMaxLevel ? 'Expert' : nextLevel?.name || 'Intermediate'}
                </p>
                {!isMaxLevel && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <ArrowUp className="w-3 h-3" />
                    <span>{completedSkills}/{requiredSkills.length} requirements met</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promotion Readiness Gauge */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">Promotion Readiness</p>
            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0}
                  data={[{ value: promotionReadiness, fill: promotionReadiness >= 70 ? '#059669' : promotionReadiness >= 40 ? '#0d9488' : '#d97706' }]}
                >
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-4">
              <span className="text-3xl font-bold text-gray-900">{promotionReadiness}%</span>
              <p className="text-xs text-gray-400 mt-0.5">Ready for next level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Growth Path - Visual Ladder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Career Growth Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-3 sm:gap-6 py-4">
            {LEVELS.map((level, i) => {
              const isCurrentOrPast = i <= currentLevelIndex
              const isCurrent = i === currentLevelIndex

              return (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-16 sm:w-20 rounded-t-xl flex flex-col items-center justify-center transition-all ${
                    isCurrent ? `h-28 sm:h-32 ${level.bgColor} border-2 ${level.borderColor} shadow-md` :
                    isCurrentOrPast ? `h-20 sm:h-24 ${level.bgColor} opacity-80` :
                    'h-14 sm:h-16 bg-gray-50 border border-gray-200'
                  }`}>
                    <span className="text-xl sm:text-2xl">{level.icon}</span>
                    {isCurrent && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1 animate-pulse" />
                    )}
                  </div>
                  <div className={`w-16 sm:w-20 py-2 text-center rounded-b-xl ${
                    isCurrent ? level.bgColor : isCurrentOrPast ? 'bg-gray-50' : 'bg-gray-50'
                  }`}>
                    <p className={`text-xs font-semibold ${isCurrent ? level.color : 'text-gray-400'}`}>
                      {level.name}
                    </p>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 my-2 hidden sm:block" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Required Skills for Next Level */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-500" /> Required Skills for {nextLevel?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillCompletion.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  {skill.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${skill.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                      {skill.skill}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-emerald-600">{completedSkills}/{requiredSkills.length}</span>
                </div>
                <Progress value={(completedSkills / Math.max(requiredSkills.length, 1)) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Certifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Required Certifications for {nextLevel?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredCerts.map((cert, i) => {
                const hasCert = data?.certifications.some(c =>
                  c.name.includes(cert.split(' ')[0]) && c.status === 'approved'
                )
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    {hasCert ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Award className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <span className={`text-sm ${hasCert ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                      {cert}
                    </span>
                    <Badge variant={hasCert ? 'default' : 'outline'} className="ml-auto text-xs">
                      {hasCert ? 'Earned' : 'Required'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Roadmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-500" /> Learning Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-100" />

            <div className="space-y-6">
              {[
                { phase: 'Phase 1', title: 'Foundation Building', status: 'completed', desc: 'Complete Company Orientation and Product Academy' },
                { phase: 'Phase 2', title: 'Core Skills Development', status: currentLevelName === 'Beginner' ? 'current' : 'completed', desc: 'Sales Academy, Technical Learning, and first certification' },
                { phase: 'Phase 3', title: 'Specialization', status: currentLevelName === 'Intermediate' ? 'current' : currentLevelName === 'Beginner' ? 'upcoming' : 'completed', desc: 'Choose Field Sales or Inbound Sales specialization track' },
                { phase: 'Phase 4', title: 'Advanced Mastery', status: currentLevelName === 'Advanced' ? 'current' : currentLevelName === 'Expert' ? 'completed' : 'upcoming', desc: 'Negotiation, Competitive Intelligence, and mock simulations' },
                { phase: 'Phase 5', title: 'Expert Certification', status: currentLevelName === 'Expert' ? 'current' : 'upcoming', desc: 'All certifications earned, top leaderboard position' },
              ].map((phase, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    phase.status === 'completed' ? 'bg-emerald-500 text-white' :
                    phase.status === 'current' ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-300' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {phase.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : phase.status === 'current' ? (
                      <Zap className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div className={`pt-2 ${phase.status === 'upcoming' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{phase.phase}</span>
                      <Badge variant={phase.status === 'completed' ? 'default' : phase.status === 'current' ? 'secondary' : 'outline'} className="text-xs">
                        {phase.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{phase.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Courses + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-500" /> Recommended Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECOMMENDED_COURSES.map((course, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{course.title}</p>
                    <p className="text-xs text-gray-400">{course.reason} · {course.duration}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Career Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{aiInsight}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-lg font-bold text-emerald-700">{data?.trainingCompletion || 0}%</p>
                  <p className="text-xs text-gray-500">Training Complete</p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-lg font-bold text-teal-700">{readinessScore}</p>
                  <p className="text-xs text-gray-500">AI Readiness</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <Sparkles className="w-3 h-3" />
                <span>Personalized AI analysis based on your progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
