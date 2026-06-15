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
import { BookOpen, HelpCircle, Eye, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

interface CourseData {
  id: string
  title: string
  description: string | null
  moduleType: string
  duration: number | null
  isActive: boolean
  _count: { enrollments: number; modules: number }
}

interface QuestionBankData {
  id: string
  question: string
  category: string | null
  difficulty: string | null
  moduleType: string | null
}

export function TmCourses() {
  const user = useAuthStore((s) => s.user)
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses')
        if (res.ok) {
          const json = await res.json()
          setCourses(json.courses || [])
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

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
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          Courses & Modules
        </h1>
        <p className="text-gray-500 mt-1 ml-13">View available courses and modules (Read-only)</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-center">Modules</TableHead>
                  <TableHead className="text-center">Enrolled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">No courses available</TableCell>
                  </TableRow>
                ) : (
                  courses.map(course => (
                    <TableRow key={course.id} className="hover:bg-emerald-50/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          {course.description && <p className="text-xs text-gray-400 truncate max-w-xs">{course.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                          {course.moduleType?.replace(/_/g, ' ') || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {course.duration ? `${course.duration} min` : 'Self-paced'}
                      </TableCell>
                      <TableCell className="text-center text-sm">{course._count?.modules || 0}</TableCell>
                      <TableCell className="text-center text-sm">{course._count?.enrollments || 0}</TableCell>
                      <TableCell>
                        <Badge variant={course.isActive ? 'default' : 'secondary'} className={`text-xs ${course.isActive ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedCourse(course); setDetailOpen(true) }} className="text-emerald-600 hover:text-emerald-700">
                          <Eye className="w-4 h-4 mr-1" />
                          View
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

      {/* Course Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>{selectedCourse?.description || 'No description'}</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-emerald-600">{selectedCourse._count?.enrollments || 0}</p>
                  <p className="text-xs text-gray-500">Enrolled</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-teal-600">{selectedCourse._count?.modules || 0}</p>
                  <p className="text-xs text-gray-500">Modules</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{selectedCourse.moduleType?.replace(/_/g, ' ') || 'General'}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{selectedCourse.duration ? `${selectedCourse.duration} min` : 'Self-paced'}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={selectedCourse.isActive ? 'default' : 'secondary'} className={`text-xs ${selectedCourse.isActive ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                    {selectedCourse.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export function TmQuestionBanks() {
  const [questions, setQuestions] = useState<QuestionBankData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch questions via a dedicated endpoint - for now show placeholder
        setQuestions([])
      } catch (err) {
        console.error('Failed to fetch questions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
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
            <HelpCircle className="w-5 h-5 text-emerald-600" />
          </div>
          Question Banks
        </h1>
        <p className="text-gray-500 mt-1 ml-13">View question bank entries (Read-only)</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Question Bank</h3>
              <p className="text-gray-400 text-center max-w-md">Questions are managed through assessments. Create or edit assessments to view associated questions.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Module</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="text-sm">{q.question}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{q.category || 'N/A'}</Badge></TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{q.difficulty || 'Medium'}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500">{q.moduleType?.replace(/_/g, ' ') || 'General'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
