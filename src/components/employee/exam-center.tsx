'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  BookOpen, Phone, MapPin, Lock, CheckCircle2, XCircle,
  Clock, ArrowRight, ArrowLeft, Play, Trophy, AlertTriangle,
  ChevronRight, Timer, FileText, Brain, Zap, Target,
  BarChart3, RotateCcw, Eye, X,
  Lightbulb, Hash, Send, Pause, ShieldCheck, ClipboardCheck,
  GraduationCap, Swords, Star
} from 'lucide-react'

// ============ TYPE DEFINITIONS ============

type ExamView = 'overview' | 'taking' | 'results'
type ExamType = 'INBOUND_SALES' | 'FIELD_SALES'
type ExamStage = 'PRE' | 'MID' | 'HARD' | 'EXTRA_HARD'
type QuestionType = 'MCQ' | 'SHORT_ANSWER'

interface ExamSummary {
  id: string
  examType: ExamType
  stage: ExamStage
  title: string
  description: string
  duration: number
  passingScore: number
  timeGateDays: number
  isActive: boolean
  _count: { questions: number; attempts: number }
}

interface UserAttempt {
  id: string
  examId: string
  examType: ExamType
  stage: ExamStage
  score: number
  passed: boolean
  adminApproved: boolean
  correctAnswers: number
  totalQuestions: number
  completedAt: string
}

interface ExamQuestion {
  id: string
  question: string
  questionType: QuestionType
  optionA: string | null
  optionB: string | null
  optionC: string | null
  optionD: string | null
  correctAnswer: string | null
  acceptableAnswers: string | null
  explanation: string
  category: string | null
  difficulty: string | null
  marks: number
}

interface ExamDetail {
  id: string
  examType: ExamType
  stage: ExamStage
  title: string
  description: string
  duration: number
  passingScore: number
  totalQuestions: number
  timeGateDays: number
  canTake: boolean
  reason: string
  questions: ExamQuestion[]
}

interface AnswerDetail {
  questionId: string
  question: string
  questionType: QuestionType
  userAnswer: string
  correctAnswer: string
  acceptableAnswers: string[] | null
  isCorrect: boolean
  explanation: string
  autoGraded: boolean
}

interface ExamResult {
  id: string
  score: number
  passed: boolean
  adminApproved: boolean
  correctAnswers: number
  totalQuestions: number
  wrongAnswers: number
  answerDetails: AnswerDetail[]
}

// ============ CONSTANTS ============

const STAGE_CONFIG: Record<ExamStage, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Star; days: number; description: string }> = {
  PRE: { label: 'Pre', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: Star, days: 7, description: 'Foundation knowledge' },
  MID: { label: 'Mid', color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', icon: Zap, days: 30, description: 'Intermediate mastery' },
  HARD: { label: 'Hard', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: Swords, days: 45, description: 'Advanced proficiency' },
  EXTRA_HARD: { label: 'Extra Hard', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: Trophy, days: 60, description: 'Expert excellence' },
}

const STAGE_ORDER: ExamStage[] = ['PRE', 'MID', 'HARD', 'EXTRA_HARD']

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Organization': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Product Features': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Technical': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Real-time Case': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Calculation': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Sales Process': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Customer Discovery': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700' },
}

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  easy: { color: 'text-green-600', bg: 'bg-green-100', label: 'Easy' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Medium' },
  hard: { color: 'text-red-600', bg: 'bg-red-100', label: 'Hard' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

// ============ HELPER FUNCTIONS ============

function getStageStatus(
  stage: ExamStage,
  examType: ExamType,
  userAttempts: UserAttempt[]
): 'locked' | 'unlocked' | 'completed' | 'passed_pending' {
  const stageIdx = STAGE_ORDER.indexOf(stage)
  const stageAttempts = userAttempts.filter(
    (a) => a.examType === examType && a.stage === stage
  )
  const passedAttempt = stageAttempts.find((a) => a.passed)

  if (passedAttempt) {
    return passedAttempt.adminApproved ? 'completed' : 'passed_pending'
  }

  if (stageIdx === 0) return 'unlocked'

  const prevStage = STAGE_ORDER[stageIdx - 1]
  const prevPassed = userAttempts.find(
    (a) => a.examType === examType && a.stage === prevStage && a.passed && a.adminApproved
  )

  return prevPassed ? 'unlocked' : 'locked'
}

function getBestScore(
  stage: ExamStage,
  examType: ExamType,
  userAttempts: UserAttempt[]
): number | null {
  const stageAttempts = userAttempts.filter(
    (a) => a.examType === examType && a.stage === stage
  )
  if (stageAttempts.length === 0) return null
  return Math.max(...stageAttempts.map((a) => a.score))
}

function getAttemptCount(
  stage: ExamStage,
  examType: ExamType,
  userAttempts: UserAttempt[]
): number {
  return userAttempts.filter(
    (a) => a.examType === examType && a.stage === stage
  ).length
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getCategoryColor(category: string | null): { bg: string; text: string } {
  if (!category) return { bg: 'bg-gray-100', text: 'text-gray-700' }
  return CATEGORY_COLORS[category] || { bg: 'bg-gray-100', text: 'text-gray-700' }
}

// ============ SUB-COMPONENTS ============

function StageBadge({
  stage,
  status,
  bestScore,
  attemptCount,
  onStart,
  timeGateDays,
}: {
  stage: ExamStage
  status: 'locked' | 'unlocked' | 'completed' | 'passed_pending'
  bestScore: number | null
  attemptCount: number
  onStart: () => void
  timeGateDays: number
}) {
  const config = STAGE_CONFIG[stage]
  const Icon = config.icon

  return (
    <motion.div variants={itemVariants} className="relative">
      <div
        className={`rounded-xl border-2 p-4 transition-all duration-300 ${
          status === 'locked'
            ? 'border-gray-200 bg-gray-50/50 opacity-60'
            : status === 'completed'
            ? 'border-emerald-300 bg-emerald-50/50'
            : status === 'passed_pending'
            ? 'border-amber-300 bg-amber-50/50'
            : `border-teal-300 bg-teal-50/50 hover:shadow-md`
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                status === 'locked'
                  ? 'bg-gray-200'
                  : status === 'completed'
                  ? 'bg-emerald-200'
                  : status === 'passed_pending'
                  ? 'bg-amber-200'
                  : 'bg-teal-200'
              }`}
            >
              {status === 'locked' ? (
                <Lock className="w-4 h-4 text-gray-500" />
              ) : status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : status === 'passed_pending' ? (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              ) : (
                <Icon className={`w-4 h-4 ${config.color}`} />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900">{config.label} Stage</h4>
              <p className="text-xs text-gray-500">{config.description}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              status === 'locked'
                ? 'border-gray-300 text-gray-400'
                : status === 'completed'
                ? 'border-emerald-300 text-emerald-600 bg-emerald-50'
                : status === 'passed_pending'
                ? 'border-amber-300 text-amber-600 bg-amber-50'
                : 'border-teal-300 text-teal-600 bg-teal-50'
            }`}
          >
            <Clock className="w-3 h-3 mr-1" />
            {timeGateDays}d gate
          </Badge>
        </div>

        {bestScore !== null && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Best Score</span>
              <span className={`font-semibold ${bestScore >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>
                {bestScore}%
              </span>
            </div>
            <Progress value={bestScore} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-gray-400">
            {attemptCount > 0 ? `${attemptCount} attempt${attemptCount > 1 ? 's' : ''}` : 'Not attempted'}
          </span>
          <Button
            size="sm"
            variant={status === 'unlocked' ? 'default' : 'outline'}
            disabled={status === 'locked' || status === 'completed'}
            onClick={onStart}
            className={`h-7 text-xs ${
              status === 'completed'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : status === 'passed_pending'
                ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                : status === 'unlocked'
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : ''
            }`}
          >
            {status === 'locked' ? (
              <>
                <Lock className="w-3 h-3 mr-1" /> Locked
              </>
            ) : status === 'completed' ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </>
            ) : status === 'passed_pending' ? (
              <>
                <ShieldCheck className="w-3 h-3 mr-1" /> Pending Approval
              </>
            ) : attemptCount > 0 ? (
              <>
                <RotateCcw className="w-3 h-3 mr-1" /> Retry
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" /> Start Exam
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function ExamTypeCard({
  examType,
  exams,
  userAttempts,
  onStartExam,
}: {
  examType: ExamType
  exams: ExamSummary[]
  userAttempts: UserAttempt[]
  onStartExam: (examId: string) => void
}) {
  const isInbound = examType === 'INBOUND_SALES'
  const gradientClass = isInbound
    ? 'from-emerald-600 to-teal-600'
    : 'from-teal-600 to-cyan-600'
  const icon = isInbound ? Phone : MapPin
  const Icon = icon
  const title = isInbound ? 'Inbound Sales Exam' : 'Field Sales Exam'
  const subtitle = isInbound
    ? 'Master phone-based selling skills and product knowledge'
    : 'Master on-site selling and relationship building'

  const completedStages = STAGE_ORDER.filter(
    (s) => getStageStatus(s, examType, userAttempts) === 'completed'
  ).length

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${gradientClass} p-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{completedStages}<span className="text-lg text-white/70">/4</span></div>
              <p className="text-white/70 text-xs">Stages Done</p>
            </div>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STAGE_ORDER.map((stage) => {
              const exam = exams.find((e) => e.stage === stage)
              const status = getStageStatus(stage, examType, userAttempts)
              const bestScore = getBestScore(stage, examType, userAttempts)
              const attemptCount = getAttemptCount(stage, examType, userAttempts)

              return (
                <StageBadge
                  key={stage}
                  stage={stage}
                  status={status}
                  bestScore={bestScore}
                  attemptCount={attemptCount}
                  onStart={() => exam && onStartExam(exam.id)}
                  timeGateDays={exam?.timeGateDays || STAGE_CONFIG[stage].days}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuestionNavMap({
  questions,
  answers,
  currentIndex,
  onSelect,
}: {
  questions: ExamQuestion[]
  answers: (string | null)[]
  currentIndex: number
  onSelect: (idx: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {questions.map((q, idx) => {
        const isAnswered = answers[idx] !== null && answers[idx] !== ''
        const isCurrent = idx === currentIndex
        return (
          <button
            key={q.id}
            onClick={() => onSelect(idx)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isCurrent
                ? 'bg-teal-600 text-white shadow-md scale-110'
                : isAnswered
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {idx + 1}
          </button>
        )
      })}
    </div>
  )
}

function MCQOptions({
  options,
  selectedAnswer,
  onSelect,
}: {
  options: { key: string; text: string | null }[]
  selectedAnswer: string | null
  onSelect: (key: string) => void
}) {
  const optionStyles: Record<string, string> = {
    A: 'border-red-200 hover:border-red-400 hover:bg-red-50',
    B: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    C: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    D: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  }
  const selectedStyles: Record<string, string> = {
    A: 'border-red-500 bg-red-50 ring-2 ring-red-200',
    B: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
    C: 'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
    D: 'border-purple-500 bg-purple-50 ring-2 ring-purple-200',
  }
  const labelColors: Record<string, string> = {
    A: 'bg-red-100 text-red-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-amber-100 text-amber-700',
    D: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-3">
      {options.map(
        ({ key, text }) =>
          text && (
            <motion.button
              key={key}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(key)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedAnswer === key ? selectedStyles[key] : optionStyles[key]
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold shrink-0 ${
                    selectedAnswer === key ? labelColors[key] : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {key}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed pt-0.5">{text}</span>
              </div>
            </motion.button>
          )
      )}
    </div>
  )
}

function ShortAnswerInput({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
        <FileText className="w-4 h-4" />
        Type your answer:
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="min-h-[120px] resize-y border-teal-200 focus:border-teal-400 focus:ring-teal-200"
      />
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <Lightbulb className="w-3 h-3" />
        Be specific and concise. Keyword matching is used for grading.
      </p>
    </div>
  )
}

// Result answer review card
function AnswerReviewCard({ detail, index }: { detail: AnswerDetail; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl border-2 p-4 transition-all ${
        detail.isCorrect
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-red-200 bg-red-50/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            detail.isCorrect ? 'bg-emerald-200' : 'bg-red-200'
          }`}
        >
          {detail.isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-medium text-gray-400">Q{index + 1}</span>
            <Badge variant="outline" className="text-[10px]">
              {detail.questionType === 'MCQ' ? 'Multiple Choice' : 'Short Answer'}
            </Badge>
            {detail.isCorrect ? (
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                Correct
              </Badge>
            ) : (
              <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                Incorrect
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-800 font-medium leading-relaxed">{detail.question}</p>

          {detail.questionType === 'MCQ' ? (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Your answer:</span>
                <span
                  className={`text-sm font-medium ${
                    detail.isCorrect ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {detail.userAnswer || '(not answered)'}
                </span>
              </div>
              {!detail.isCorrect && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16">Correct:</span>
                  <span className="text-sm font-medium text-emerald-600">{detail.correctAnswer}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Your answer:</span>
                <span
                  className={`text-sm ${
                    detail.isCorrect ? 'text-emerald-600 font-medium' : 'text-red-600'
                  }`}
                >
                  {detail.userAnswer || '(not answered)'}
                </span>
              </div>
              {!detail.isCorrect && detail.acceptableAnswers && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 w-16 shrink-0">Accepted:</span>
                  <div className="flex flex-wrap gap-1">
                    {detail.acceptableAnswers.map((a, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {detail.explanation && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              {expanded ? 'Hide' : 'Show'} explanation
              <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          )}

          <AnimatePresence>
            {expanded && detail.explanation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-lg bg-teal-50 border border-teal-100">
                  <p className="text-xs text-teal-700 leading-relaxed">{detail.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ============ MAIN COMPONENT ============

export function ExamCenter() {
  const user = useAuthStore((s) => s.user)

  // View state
  const [view, setView] = useState<ExamView>('overview')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Data
  const [exams, setExams] = useState<ExamSummary[]>([])
  const [userAttempts, setUserAttempts] = useState<UserAttempt[]>([])
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null)
  const [examResult, setExamResult] = useState<ExamResult | null>(null)

  // Exam taking state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [showConfirmExit, setShowConfirmExit] = useState(false)
  const [canTakeExam, setCanTakeExam] = useState(true)
  const [cannotTakeReason, setCannotTakeReason] = useState('')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasSubmittedRef = useRef(false)

  // ---- Fetch overview data ----
  const fetchOverview = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/exams?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setExams(data.exams || [])
        setUserAttempts(data.userAttempts || [])
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  // ---- Start exam ----
  const startExam = useCallback(
    async (examId: string) => {
      if (!user?.id) return
      setLoading(true)
      try {
        const res = await fetch(`/api/exams?examId=${examId}&userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          if (!data.exam.canTake) {
            setCanTakeExam(false)
            setCannotTakeReason(data.exam.reason || 'You cannot take this exam right now.')
            setLoading(false)
            return
          }
          setExamDetail(data.exam)
          setAnswers(new Array(data.exam.questions.length).fill(null))
          setTimeLeft(data.exam.duration * 60)
          setCurrentQuestionIdx(0)
          setView('taking')
          hasSubmittedRef.current = false
        }
      } catch (err) {
        console.error('Failed to start exam:', err)
      } finally {
        setLoading(false)
      }
    },
    [user?.id]
  )

  // ---- Timer ----
  useEffect(() => {
    if (view !== 'taking' || isPaused || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [view, isPaused, timeLeft <= 0])

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && view === 'taking' && !hasSubmittedRef.current && examDetail) {
      handleSubmit(true)
    }
  }, [timeLeft, view, examDetail])

  // ---- Submit exam ----
  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!user?.id || !examDetail || hasSubmittedRef.current) return
      hasSubmittedRef.current = true

      if (!isAutoSubmit) setShowConfirmSubmit(false)
      setSubmitting(true)

      try {
        const res = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            examId: examDetail.id,
            answers: answers.map((a) => a || ''),
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setExamResult(data.attempt)
          setView('results')
          if (timerRef.current) clearInterval(timerRef.current)
        }
      } catch (err) {
        console.error('Failed to submit exam:', err)
        hasSubmittedRef.current = false
      } finally {
        setSubmitting(false)
      }
    },
    [user?.id, examDetail, answers]
  )

  // ---- Back to overview ----
  const backToOverview = useCallback(() => {
    setView('overview')
    setExamDetail(null)
    setExamResult(null)
    setAnswers([])
    setTimeLeft(0)
    setCurrentQuestionIdx(0)
    setIsPaused(false)
    setCanTakeExam(true)
    setCannotTakeReason('')
    fetchOverview()
  }, [fetchOverview])

  // ---- Answer handling ----
  const setAnswer = useCallback((idx: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }, [])

  // ============ RENDER: LOADING ============
  if (loading && view === 'overview') {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-72 ml-13" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32" />
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-24 rounded-xl" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ============ RENDER: EXAM TAKING ============
  if (view === 'taking' && examDetail) {
    const question = examDetail.questions[currentQuestionIdx]
    const totalQuestions = examDetail.questions.length
    const answeredCount = answers.filter((a) => a !== null && a !== '').length
    const progressPercent = (answeredCount / totalQuestions) * 100
    const isLastQuestion = currentQuestionIdx === totalQuestions - 1
    const isWarning = timeLeft <= 300 // 5 minutes

    return (
      <div className="space-y-4">
        {/* Timer Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-0 z-30 rounded-2xl border-2 p-3 backdrop-blur-md ${
            isWarning
              ? 'border-red-300 bg-red-50/90'
              : 'border-teal-200 bg-white/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmExit(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-sm font-bold text-gray-900">{examDetail.title}</h2>
                <p className="text-xs text-gray-500">
                  {answeredCount}/{totalQuestions} answered
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Progress value={progressPercent} className="w-24 h-2" />
                <span className="text-xs text-gray-500 font-medium">{Math.round(progressPercent)}%</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                  isWarning ? 'bg-red-100' : 'bg-teal-50'
                }`}
              >
                <Timer
                  className={`w-4 h-4 ${isWarning ? 'text-red-500 animate-pulse' : 'text-teal-600'}`}
                />
                <span
                  className={`font-mono text-sm font-bold ${
                    isWarning ? 'text-red-600' : 'text-teal-700'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Pause className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Exam Paused</h3>
                <p className="text-gray-500 text-sm mb-6">
                  The timer is paused. Take a breath and resume when ready.
                </p>
                <Button onClick={() => setIsPaused(false)} className="bg-teal-600 hover:bg-teal-700">
                  <Play className="w-4 h-4 mr-2" /> Resume Exam
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIdx}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-100 font-semibold">
                      <Hash className="w-3 h-3 mr-1" />
                      Q{currentQuestionIdx + 1}
                    </Badge>
                    {question.category && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${getCategoryColor(question.category).bg} ${getCategoryColor(question.category).text} border-0`}
                      >
                        {question.category}
                      </Badge>
                    )}
                    {question.difficulty && DIFFICULTY_CONFIG[question.difficulty] && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${DIFFICULTY_CONFIG[question.difficulty].bg} ${DIFFICULTY_CONFIG[question.difficulty].color} border-0`}
                      >
                        {DIFFICULTY_CONFIG[question.difficulty].label}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {question.questionType === 'MCQ' ? 'MCQ' : 'Short Answer'}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {currentQuestionIdx + 1} of {totalQuestions}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-lg font-semibold text-gray-900 leading-relaxed mb-6">
                  {question.question}
                </h3>

                {/* Answer Section */}
                {question.questionType === 'MCQ' ? (
                  <MCQOptions
                    options={[
                      { key: 'A', text: question.optionA },
                      { key: 'B', text: question.optionB },
                      { key: 'C', text: question.optionC },
                      { key: 'D', text: question.optionD },
                    ]}
                    selectedAnswer={answers[currentQuestionIdx]}
                    onSelect={(key) => setAnswer(currentQuestionIdx, key)}
                  />
                ) : (
                  <ShortAnswerInput
                    value={answers[currentQuestionIdx] || ''}
                    onChange={(val) => setAnswer(currentQuestionIdx, val)}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
            disabled={currentQuestionIdx === 0}
            className="border-teal-200 hover:bg-teal-50"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            {isLastQuestion ? (
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" /> Submit Exam
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIdx(Math.min(totalQuestions - 1, currentQuestionIdx + 1))}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Map */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">Question Map</span>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-teal-600" /> Current
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Answered
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /> Unanswered
                </span>
              </div>
            </div>
            <QuestionNavMap
              questions={examDetail.questions}
              answers={answers}
              currentIndex={currentQuestionIdx}
              onSelect={setCurrentQuestionIdx}
            />
          </CardContent>
        </Card>

        {/* Confirm Submit Dialog */}
        <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-teal-600" />
                Submit Exam?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answeredCount} out of {totalQuestions} questions.
                {answeredCount < totalQuestions && (
                  <span className="text-amber-600 font-medium block mt-1">
                    ⚠️ {totalQuestions - answeredCount} question(s) are unanswered!
                  </span>
                )}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Exam</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleSubmit(false)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Submit Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirm Exit Dialog */}
        <AlertDialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Leave Exam?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your progress will be lost. Are you sure you want to exit the exam?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay</AlertDialogCancel>
              <AlertDialogAction onClick={backToOverview} className="bg-red-600 hover:bg-red-700">
                Exit Exam
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // ============ RENDER: RESULTS ============
  if (view === 'results' && examResult && examDetail) {
    const passed = examResult.passed
    const scorePercent = examResult.score
    const categoryBreakdown: Record<string, { correct: number; total: number }> = {}

    examResult.answerDetails.forEach((d) => {
      const cat = d.questionType === 'MCQ' ? 'MCQ' : 'Short Answer'
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { correct: 0, total: 0 }
      categoryBreakdown[cat].total++
      if (d.isCorrect) categoryBreakdown[cat].correct++
    })

    // Also build category breakdown from exam questions + answer details
    const categoryMap: Record<string, { correct: number; total: number; icon: typeof BookOpen }> = {}
    examDetail.questions.forEach((q, idx) => {
      const cat = q.category || 'General'
      if (!categoryMap[cat]) {
        const icon = CATEGORY_COLORS[cat] ? BookOpen : Brain
        categoryMap[cat] = { correct: 0, total: 0, icon }
      }
      categoryMap[cat].total++
      if (examResult.answerDetails[idx]?.isCorrect) categoryMap[cat].correct++
    })

    const circumference = 2 * Math.PI * 54
    const offset = circumference - (scorePercent / 100) * circumference

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Score Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <div
              className={`p-6 text-center ${
                passed
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50'
                  : 'bg-gradient-to-br from-red-50 to-amber-50'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <svg width="128" height="128" className="-rotate-90">
                    <circle
                      cx="64" cy="64" r="54" fill="none"
                      stroke={passed ? '#d1fae5' : '#fee2e2'}
                      strokeWidth="10"
                    />
                    <circle
                      cx="64" cy="64" r="54" fill="none"
                      stroke={passed ? '#059669' : '#dc2626'}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${passed ? 'text-emerald-700' : 'text-red-600'}`}>
                      {scorePercent}%
                    </span>
                    <span className="text-xs text-gray-500">Score</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                {passed ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-emerald-800">Congratulations! You Passed!</h2>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-red-700">Not Quite There Yet</h2>
                  </>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-3">
                {examDetail.title} • {examResult.correctAnswers}/{examResult.totalQuestions} correct
              </p>

              {passed && !examResult.adminApproved && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 px-4 py-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Admin Approval Pending
                </Badge>
              )}

              {passed && examResult.adminApproved && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approved — Stage Cleared!
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Correct', value: examResult.correctAnswers, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Wrong', value: examResult.wrongAnswers, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Passing', value: `${examDetail.passingScore}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Your Score', value: `${scorePercent}%`, icon: BarChart3, color: passed ? 'text-emerald-600' : 'text-red-600', bg: passed ? 'bg-emerald-50' : 'bg-red-50' },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categoryMap).map(([category, data]) => {
                  const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
                  const catColor = getCategoryColor(category)
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${catColor.bg} ${catColor.text} border-0`}
                          >
                            {category}
                          </Badge>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {data.correct}/{data.total} ({pct}%)
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                          className={`absolute top-0 left-0 h-full rounded-full ${
                            pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                Answer Review
              </CardTitle>
              <CardDescription>Review your answers and learn from mistakes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[600px] pr-2">
                <div className="space-y-3">
                  {examResult.answerDetails.map((detail, idx) => (
                    <AnswerReviewCard key={detail.questionId} detail={detail} index={idx} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-3 pb-4"
        >
          <Button
            onClick={backToOverview}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exam Center
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  // ============ RENDER: OVERVIEW ============
  const inboundExams = exams.filter((e) => e.examType === 'INBOUND_SALES')
  const fieldSalesExams = exams.filter((e) => e.examType === 'FIELD_SALES')

  const completedCount = STAGE_ORDER.reduce((acc, stage) => {
    const inboundStatus = getStageStatus(stage, 'INBOUND_SALES', userAttempts)
    const fieldStatus = getStageStatus(stage, 'FIELD_SALES', userAttempts)
    if (inboundStatus === 'completed') acc++
    if (fieldStatus === 'completed') acc++
    return acc
  }, 0)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Center</h1>
            <p className="text-gray-500 text-sm">Take certification exams and advance your career</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Available Exams',
            value: exams.filter((e) => e.isActive).length,
            icon: BookOpen,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
          },
          {
            label: 'Stages Completed',
            value: completedCount,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Total Attempts',
            value: userAttempts.length,
            icon: ClipboardCheck,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Pass Rate',
            value:
              userAttempts.length > 0
                ? `${Math.round((userAttempts.filter((a) => a.passed).length / userAttempts.length) * 100)}%`
                : '—',
            icon: Target,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-[11px] text-gray-500">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Cannot Take Exam Alert */}
      <AnimatePresence>
        {!canTakeExam && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 text-sm">Cannot Take Exam</h4>
                    <p className="text-amber-700 text-sm mt-0.5">{cannotTakeReason}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCanTakeExam(true)
                        setCannotTakeReason('')
                      }}
                      className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam Type Cards */}
      {exams.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-teal-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Exams Available</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                There are no exams configured yet. Check back later when your training manager sets up certification exams.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {inboundExams.length > 0 && (
            <ExamTypeCard
              examType="INBOUND_SALES"
              exams={inboundExams}
              userAttempts={userAttempts}
              onStartExam={startExam}
            />
          )}
          {fieldSalesExams.length > 0 && (
            <ExamTypeCard
              examType="FIELD_SALES"
              exams={fieldSalesExams}
              userAttempts={userAttempts}
              onStartExam={startExam}
            />
          )}
        </div>
      )}

      {/* Recent Attempts */}
      {userAttempts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Recent Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {userAttempts.slice(0, 10).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            attempt.passed ? 'bg-emerald-100' : 'bg-red-100'
                          }`}
                        >
                          {attempt.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attempt.examType === 'INBOUND_SALES' ? 'Inbound' : 'Field'} — {attempt.stage}
                          </p>
                          <p className="text-xs text-gray-400">
                            {attempt.completedAt
                              ? new Date(attempt.completedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'In progress'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            attempt.score >= 70 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {attempt.score}%
                        </span>
                        {attempt.passed && attempt.adminApproved && (
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Approved
                          </Badge>
                        )}
                        {attempt.passed && !attempt.adminApproved && (
                          <Badge className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
