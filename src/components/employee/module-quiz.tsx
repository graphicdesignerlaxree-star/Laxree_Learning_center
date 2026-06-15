'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Trophy, Clock, AlertCircle, Sparkles, FileText
} from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  explanation: string
  marks: number
}

interface QuizData {
  id: string
  title: string
  description?: string
  duration?: number
  passingScore: number
  totalQuestions: number
  questions: QuizQuestion[]
}

interface QuizResult {
  id: string
  score: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  wrongAnswers: number
  answerDetails: Array<{
    questionId: string
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string
  }>
}

type QuizPhase = 'intro' | 'question' | 'reviewing' | 'results'

interface ModuleQuizProps {
  quiz: QuizData
  moduleId: string
  open: boolean
  onClose: () => void
  onComplete: (result: QuizResult) => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const
const OPTION_KEYS = ['optionA', 'optionB', 'optionC', 'optionD'] as const
const OPTION_COLORS = [
  'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
  'border-teal-200 bg-teal-50 hover:bg-teal-100',
  'border-amber-200 bg-amber-50 hover:bg-amber-100',
  'border-rose-200 bg-rose-50 hover:bg-rose-100',
]
const OPTION_SELECTED = 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300'
const OPTION_CORRECT = 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-400'
const OPTION_WRONG = 'border-red-400 bg-red-50 ring-2 ring-red-300'

export function ModuleQuiz({ quiz, moduleId, open, onClose, onComplete }: ModuleQuizProps) {
  const user = useAuthStore((s) => s.user)
  const [phase, setPhase] = useState<QuizPhase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [saving, setSaving] = useState(false)

  const resetQuiz = useCallback(() => {
    setPhase('intro')
    setCurrentQ(0)
    setSelectedAnswer(null)
    setAnswers([])
    setShowExplanation(false)
    setResult(null)
    setSaving(false)
  }, [])

  const handleClose = useCallback(() => {
    resetQuiz()
    onClose()
  }, [resetQuiz, onClose])

  const startQuiz = useCallback(() => {
    setPhase('question')
    setCurrentQ(0)
    setSelectedAnswer(null)
    setAnswers([])
    setShowExplanation(false)
  }, [])

  const handleSelect = useCallback((key: string) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(key)
    setShowExplanation(true)
  }, [selectedAnswer])

  const handleNext = useCallback(() => {
    if (!selectedAnswer) return

    const newAnswers = [...answers]
    newAnswers[currentQ] = selectedAnswer
    setAnswers(newAnswers)

    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // Submit quiz
      submitQuiz(newAnswers)
    }
  }, [selectedAnswer, answers, currentQ, quiz])

  const submitQuiz = async (finalAnswers: string[]) => {
    setSaving(true)
    try {
      const res = await fetch('/api/module-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          assessmentId: quiz.id,
          moduleId,
          answers: finalAnswers,
        })
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data.attempt)
        setPhase('results')
        onComplete(data.attempt)
      }
    } catch (err) {
      console.error('Quiz submit error:', err)
    } finally {
      setSaving(false)
    }
  }

  const question = quiz.questions[currentQ]
  const progressPercent = ((currentQ + (selectedAnswer ? 1 : 0)) / quiz.questions.length) * 100

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        {phase === 'intro' && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Module Quiz
                </DialogTitle>
                <DialogDescription>{quiz.title}</DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <Card className="border-emerald-200 bg-emerald-50/50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs text-gray-500">Questions</p>
                          <p className="font-bold text-gray-900">{quiz.totalQuestions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-bold text-gray-900">{quiz.duration || 10} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="text-xs text-gray-500">Passing Score</p>
                          <p className="font-bold text-gray-900">{quiz.passingScore}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <div>
                          <p className="text-xs text-gray-500">Format</p>
                          <p className="font-bold text-gray-900">MCQ</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> You need to score at least {quiz.passingScore}% to pass and mark this module as complete. Read each question carefully before answering.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={startQuiz} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Start Quiz <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {phase === 'question' && question && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-base">
                  Question {currentQ + 1} of {quiz.questions.length}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Quiz question {currentQ + 1}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Question */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{question.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {OPTION_KEYS.map((key, i) => {
                    const value = question[key as keyof QuizQuestion] as string
                    if (!value) return null
                    const isSelected = selectedAnswer === key.replace('option', '').charAt(0) as string
                    const correctKey = question.explanation ? null : null
                    const isCorrect = selectedAnswer && isSelected && (key.replace('option', '').charAt(0) === 'A' ? true : false)

                    let optClass = OPTION_COLORS[i]
                    if (selectedAnswer) {
                      const selectedKey = selectedAnswer
                      const correctAnswerKey = 'A' // We'll determine from the answer details
                      if (isSelected) {
                        optClass = OPTION_SELECTED
                      }
                    }

                    return (
                      <button
                        key={key}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${optClass} ${selectedAnswer ? 'pointer-events-none' : 'cursor-pointer'}`}
                        onClick={() => handleSelect(key.replace('option', '').charAt(0))}
                        disabled={selectedAnswer !== null}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm font-bold shrink-0">
                            {OPTION_LABELS[i]}
                          </span>
                          <span className="text-sm text-gray-700 pt-0.5">{value}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && selectedAnswer && question.explanation && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-800">{question.explanation}</p>
                    </div>
                  </motion.div>
                )}

                {/* Next Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleNext}
                    disabled={!selectedAnswer || saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? (
                      'Saving...'
                    ) : currentQ < quiz.questions.length - 1 ? (
                      <>Next <ArrowRight className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Submit Quiz <Trophy className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {phase === 'results' && result && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  Quiz Results
                </DialogTitle>
                <DialogDescription>{quiz.title}</DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Score Card */}
                <Card className={`${result.passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${result.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      <span className={`text-3xl font-bold ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.score}%
                      </span>
                    </div>
                    <p className={`text-lg font-bold mt-3 ${result.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                      {result.passed ? 'Passed! 🎉' : 'Not Passed'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {result.correctAnswers} correct out of {result.totalQuestions} questions
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Passing score: {quiz.passingScore}%
                    </p>
                  </CardContent>
                </Card>

                {/* Answer Review */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Answer Review</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {result.answerDetails.map((ad, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${ad.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                        <div className="flex items-start gap-2">
                          {ad.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 line-clamp-2">{ad.question}</p>
                            {!ad.isCorrect && (
                              <p className="text-xs text-red-600 mt-1">
                                Your answer: {ad.userAnswer} | Correct: {ad.correctAnswer}
                              </p>
                            )}
                            {ad.explanation && (
                              <p className="text-xs text-gray-500 mt-1">{ad.explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    Close
                  </Button>
                  {!result.passed && (
                    <Button onClick={resetQuiz} className="flex-1 bg-amber-600 hover:bg-amber-700">
                      <RotateCcw className="w-4 h-4 mr-1" /> Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  )
}
