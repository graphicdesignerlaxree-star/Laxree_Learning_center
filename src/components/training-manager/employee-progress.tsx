'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, TrendingUp, Award, BookOpen, Clock } from 'lucide-react'

interface EmployeeData {
  id: string
  fullName: string | null
  email: string
  designation: string | null
  department: { name: string } | null
  aiReadinessScore: number
  enrollments: { status: string; progress: number; course: { title: string } }[]
  assessmentAttempts: { percentage: number; passed: boolean; assessment: { title: string }; completedAt: string | null }[]
  certificationAttempts: { status: string; certification: { name: string } }[]
  lastLoginAt: string | null
  _count: { enrollments: number; assessmentAttempts: number; certificationAttempts: number }
}

export function EmployeeProgress() {
  const user = useAuthStore((s) => s.user)
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deptRes] = await Promise.all([
          fetch('/api/users?role=EMPLOYEE'),
          fetch('/api/dashboard?userId=' + user?.id + '&role=SUPER_ADMIN'),
        ])
        if (usersRes.ok) {
          const usersJson = await usersRes.json()
          setUsersWithEnrollments(usersJson.users || [])
        }
        // We'll derive departments from users
      } catch (err) {
        console.error('Failed to fetch employees:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  const setUsersWithEnrollments = async (basicUsers: any[]) => {
    // Fetch detailed info for each employee with enrollments
    const detailedUsers = await Promise.all(
      basicUsers.map(async (u: any) => {
        try {
          const res = await fetch(`/api/dashboard?userId=${u.id}&role=EMPLOYEE`)
          if (res.ok) {
            const data = await res.json()
            return {
              ...u,
              enrollments: data.enrollments || [],
              assessmentAttempts: data.assessments || [],
              certificationAttempts: data.certifications || [],
            }
          }
        } catch {}
        return u
      })
    )
    setEmployees(detailedUsers)
    // Extract departments
    const depts = new Map<string, string>()
    detailedUsers.forEach(u => {
      if (u.department?.name) depts.set(u.department.name, u.department.name)
    })
    setDepartments(Array.from(depts.entries()).map(([id, name]) => ({ id: name, name })))
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !search || 
      emp.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(search.toLowerCase())
    const matchesDept = deptFilter === 'all' || emp.department?.name === deptFilter
    return matchesSearch && matchesDept
  })

  const getCompletionPercent = (emp: EmployeeData) => {
    if (!emp.enrollments?.length) return 0
    const completed = emp.enrollments.filter((e: any) => e.status === 'completed').length
    return Math.round((completed / emp.enrollments.length) * 100)
  }

  const getAvgScore = (emp: EmployeeData) => {
    if (!emp.assessmentAttempts?.length) return 0
    const total = emp.assessmentAttempts.reduce((sum: number, a: any) => sum + (a.percentage || a.score || 0), 0)
    return Math.round(total / emp.assessmentAttempts.length)
  }

  const getCertStatus = (emp: EmployeeData) => {
    if (!emp.certificationAttempts?.length) return 'None'
    const approved = emp.certificationAttempts.filter((c: any) => c.status === 'approved').length
    const pending = emp.certificationAttempts.filter((c: any) => c.status === 'pending').length
    if (approved > 0) return `${approved} Certified`
    if (pending > 0) return `${pending} Pending`
    return 'In Progress'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16" />
        ))}
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
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          Employee Progress
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Track learning and development progress across all employees</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="pl-9"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-center">Completion %</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead>Cert Status</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => {
                    const completion = getCompletionPercent(emp)
                    const avgScore = getAvgScore(emp)
                    const certStatus = getCertStatus(emp)
                    const completedCourses = emp.enrollments?.filter((e: any) => e.status === 'completed').length || 0
                    const totalCourses = emp.enrollments?.length || 0

                    return (
                      <TableRow
                        key={emp.id}
                        className="cursor-pointer hover:bg-emerald-50/50"
                        onClick={() => { setSelectedEmployee(emp); setDetailOpen(true) }}
                      >
                        <TableCell>
                          <div className="font-medium text-gray-900">{emp.fullName || 'Unknown'}</div>
                          <div className="text-xs text-gray-400">{emp.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                            {emp.department?.name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{emp.designation || 'N/A'}</TableCell>
                        <TableCell className="text-center text-sm">{completedCourses}/{totalCourses}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <Progress value={completion} className="w-16 h-2" />
                            <span className="text-xs text-gray-500">{completion}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-medium ${avgScore >= 70 ? 'text-emerald-600' : avgScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            {avgScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={certStatus.includes('Certified') ? 'default' : 'secondary'} 
                            className={`text-xs ${certStatus.includes('Certified') ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                            {certStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {emp.lastLoginAt ? new Date(emp.lastLoginAt).toLocaleDateString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.fullName || 'Employee'} - Progress Detail</DialogTitle>
            <DialogDescription>
              {selectedEmployee?.designation} • {selectedEmployee?.department?.name || 'No Department'}
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">{getCompletionPercent(selectedEmployee)}%</p>
                  <p className="text-xs text-gray-500">Training Complete</p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <p className="text-2xl font-bold text-teal-600">{getAvgScore(selectedEmployee)}%</p>
                  <p className="text-xs text-gray-500">Avg Assessment</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{selectedEmployee.aiReadinessScore || 0}</p>
                  <p className="text-xs text-gray-500">AI Readiness</p>
                </div>
              </div>

              {/* Course Enrollments */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Course Enrollments
                </h4>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                  {selectedEmployee.enrollments?.length ? selectedEmployee.enrollments.map((enr: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">{enr.courseTitle || enr.course?.title || 'Unknown Course'}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={enr.progress || 0} className="w-20 h-2" />
                        <Badge variant={enr.status === 'completed' ? 'default' : 'secondary'} 
                          className={`text-[10px] ${enr.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                          {enr.status}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400 text-center py-4">No enrollments</p>
                  )}
                </div>
              </div>

              {/* Assessment Scores */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600" />
                  Assessment Scores
                </h4>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                  {selectedEmployee.assessmentAttempts?.length ? selectedEmployee.assessmentAttempts.map((a: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">{a.title || a.assessment?.title || 'Unknown'}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${(a.percentage || a.score) >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {a.percentage || a.score}%
                        </span>
                        <Badge variant={a.passed ? 'default' : 'destructive'} className="text-[10px]">
                          {a.passed ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400 text-center py-4">No assessment attempts</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
