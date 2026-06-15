'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileCheck, Eye, MessageSquare, Send, Loader2 } from 'lucide-react'

interface AttemptData {
  id: string
  userId: string
  assessmentId: string
  score: number
  totalMarks: number
  correctAnswers: number
  wrongAnswers: number
  percentage: number
  passed: boolean
  answers: string | null
  startedAt: string
  completedAt: string | null
  user: { id: string; fullName: string | null; designation: string | null; department: { name: string } | null }
  assessment: { id: string; title: string; totalQuestions: number; passingScore: number }
}

export function ReviewAssessments() {
  const [attempts, setAttempts] = useState<AttemptData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptData | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch('/api/assessments')
        if (res.ok) {
          const json = await res.json()
          // Fetch all attempts from all assessments
          const allAttempts: AttemptData[] = []
          for (const assess of (json.assessments || [])) {
            const attemptRes = await fetch(`/api/assessments?id=${assess.id}`)
            if (attemptRes.ok) {
              const attemptJson = await attemptRes.json()
              // The assessment detail includes attempts via the assessment route
            }
          }
          // Instead, let's get attempts from scorecards
          // For now, use the assessment attempts we can get
          setAttempts([])
        }
      } catch (err) {
        console.error('Failed to fetch attempts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAttempts()
  }, [])

  // Fetch assessment attempts via a more direct approach
  useEffect(() => {
    const fetchAllAttempts = async () => {
      try {
        // Get all users and their assessment data
        const usersRes = await fetch('/api/users?role=EMPLOYEE')
        if (!usersRes.ok) return
        const usersJson = await usersRes.json()
        const allAttempts: AttemptData[] = []

        // Get assessment attempts from each user's dashboard
        for (const u of (usersJson.users || []).slice(0, 20)) {
          try {
            const dashRes = await fetch(`/api/dashboard?userId=${u.id}&role=EMPLOYEE`)
            if (dashRes.ok) {
              const dashJson = await dashRes.json()
              for (const a of (dashJson.assessments || [])) {
                allAttempts.push({
                  ...a,
                  userId: u.id,
                  user: { id: u.id, fullName: u.fullName, designation: u.designation, department: u.department },
                  assessment: { id: a.id, title: a.title || 'Unknown', totalQuestions: a.totalQuestions || 0, passingScore: 70 },
                  answers: a.answers || null,
                })
              }
            }
          } catch {}
        }
        setAttempts(allAttempts)
      } catch (err) {
        console.error('Failed to fetch attempts:', err)
      }
    }
    fetchAllAttempts()
  }, [])

  const handleReview = (attempt: AttemptData) => {
    setSelectedAttempt(attempt)
    setReviewOpen(true)
    setFeedback('')
  }

  const handleSubmitFeedback = async () => {
    setSubmitting(true)
    try {
      // In a real app, this would submit feedback to an API
      setReviewOpen(false)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>
          Review Assessments
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Review and provide feedback on assessment attempts</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                  <TableHead className="text-center">Correct/Wrong</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                      No assessment attempts to review
                    </TableCell>
                  </TableRow>
                ) : (
                  attempts.map((attempt) => (
                    <TableRow key={attempt.id} className="hover:bg-emerald-50/50">
                      <TableCell>
                        <div className="font-medium text-gray-900">{attempt.user?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{attempt.user?.designation}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-700">{attempt.assessment?.title || 'Unknown'}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${attempt.percentage >= 70 ? 'text-emerald-600' : attempt.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {attempt.percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={attempt.passed ? 'default' : 'destructive'} className={`text-xs ${attempt.passed ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                          {attempt.passed ? 'Pass' : 'Fail'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-600">
                        {attempt.correctAnswers}/{attempt.correctAnswers + attempt.wrongAnswers}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleReview(attempt)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Review</DialogTitle>
            <DialogDescription>
              {selectedAttempt?.user?.fullName} - {selectedAttempt?.assessment?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedAttempt && (
            <div className="space-y-6">
              {/* Score Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className={`text-xl font-bold ${selectedAttempt.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedAttempt.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <p className="text-xl font-bold text-teal-600">{selectedAttempt.correctAnswers}</p>
                  <p className="text-xs text-gray-500">Correct</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xl font-bold text-red-600">{selectedAttempt.wrongAnswers}</p>
                  <p className="text-xs text-gray-500">Wrong</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Badge variant={selectedAttempt.passed ? 'default' : 'destructive'} className={`text-xs ${selectedAttempt.passed ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                    {selectedAttempt.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Result</p>
                </div>
              </div>

              {/* Employee Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedAttempt.user?.fullName}</p>
                <p className="text-xs text-gray-500">{selectedAttempt.user?.designation} • {selectedAttempt.user?.department?.name || 'N/A'}</p>
              </div>

              {/* Answers Review (if available) */}
              {selectedAttempt.answers && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Answer Details</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedAttempt.answers)
                        return Object.entries(parsed).map(([q, a]) => (
                          <div key={q} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                            <span>Question {parseInt(q) + 1}</span>
                            <span className="font-medium">Answer: {a as string}</span>
                          </div>
                        ))
                      } catch {
                        return selectedAttempt.answers
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Provide Feedback
                </Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for the employee..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewOpen(false)}>Close</Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
