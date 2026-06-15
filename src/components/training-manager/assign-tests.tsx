'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClipboardCheck, Search, Calendar, Users, CheckCircle2, Loader2 } from 'lucide-react'

interface UserItem {
  id: string
  fullName: string | null
  email: string
  designation: string | null
  department: { id: string; name: string } | null
}

interface AssessmentItem {
  id: string
  title: string
  moduleType: string | null
  duration: number | null
  passingScore: number
  totalQuestions: number
  _count: { attempts: number }
}

export function AssignTests() {
  const user = useAuthStore((s) => s.user)
  const [employees, setEmployees] = useState<UserItem[]>([])
  const [assessments, setAssessments] = useState<AssessmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmp, setSearchEmp] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [bulkDept, setBulkDept] = useState('none')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resultMsg, setResultMsg] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, assessRes] = await Promise.all([
          fetch('/api/users?role=EMPLOYEE'),
          fetch('/api/assessments'),
        ])
        if (empRes.ok) {
          const json = await empRes.json()
          setEmployees(json.users || [])
        }
        if (assessRes.ok) {
          const json = await assessRes.json()
          setAssessments(json.assessments || [])
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredEmployees = employees.filter(emp =>
    !searchEmp ||
    emp.fullName?.toLowerCase().includes(searchEmp.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchEmp.toLowerCase())
  )

  const departments = Array.from(new Set(employees.map(e => e.department?.name).filter(Boolean))) as string[]

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAssessment = (id: string) => {
    setSelectedAssessments(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleBulkDept = (dept: string) => {
    setBulkDept(dept)
    if (dept && dept !== 'none') {
      const deptEmpIds = employees.filter(e => e.department?.name === dept).map(e => e.id)
      setSelectedEmployees(deptEmpIds)
    } else {
      setSelectedEmployees([])
    }
  }

  const handleAssign = async () => {
    setSubmitting(true)
    setResultMsg('')
    try {
      // Create assignments as assessment attempts
      const assignments = []
      for (const empId of selectedEmployees) {
        for (const assessId of selectedAssessments) {
          assignments.push(
            fetch('/api/assessments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: empId,
                assessmentId: assessId,
                deadline,
                assignOnly: true,
              }),
            })
          )
        }
      }
      await Promise.all(assignments)
      setResultMsg(`Successfully assigned ${selectedAssessments.length} assessment(s) to ${selectedEmployees.length} employee(s)`)
      setSelectedEmployees([])
      setSelectedAssessments([])
      setDeadline('')
      setBulkDept('none')
      setConfirmOpen(false)
    } catch (err) {
      setResultMsg('Failed to assign assessments. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
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
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
          </div>
          Assign Tests
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Assign assessments and tests to employees</p>
      </div>

      {resultMsg && (
        <div className={`p-3 rounded-lg text-sm ${resultMsg.includes('Success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {resultMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Select Employees
              {selectedEmployees.length > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {selectedEmployees.length} selected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchEmp} onChange={(e) => setSearchEmp(e.target.value)} placeholder="Search employees..." className="pl-9" />
            </div>
            <Select value={bulkDept} onValueChange={handleBulkDept}>
              <SelectTrigger><SelectValue placeholder="Bulk assign to department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1 border rounded-lg p-2">
              {filteredEmployees.map(emp => (
                <label key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox checked={selectedEmployees.includes(emp.id)} onCheckedChange={() => toggleEmployee(emp.id)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{emp.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{emp.designation} • {emp.department?.name || 'N/A'}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-teal-600" />
                Select Assessments
                {selectedAssessments.length > 0 && (
                  <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">
                    {selectedAssessments.length} selected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 border rounded-lg p-2">
                {assessments.map(assess => (
                  <label key={assess.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Checkbox checked={selectedAssessments.includes(assess.id)} onCheckedChange={() => toggleAssessment(assess.id)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{assess.title}</p>
                      <p className="text-xs text-gray-400">
                        {assess.moduleType?.replace(/_/g, ' ') || 'General'} • Pass: {assess.passingScore}% • {assess.totalQuestions} Qs
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Completion Deadline
                </Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <Button onClick={() => setConfirmOpen(true)} disabled={selectedEmployees.length === 0 || selectedAssessments.length === 0} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Assign {selectedAssessments.length} Test(s) to {selectedEmployees.length} Employee(s)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Confirm Test Assignment
            </DialogTitle>
            <DialogDescription>Review the details before assigning tests.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Employees ({selectedEmployees.length})</p>
              <p className="text-sm text-gray-700">{selectedEmployees.map(id => employees.find(e => e.id === id)?.fullName).join(', ')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Assessments ({selectedAssessments.length})</p>
              <p className="text-sm text-gray-700">{selectedAssessments.map(id => assessments.find(a => a.id === id)?.title).join(', ')}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleAssign} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardCheck className="w-4 h-4 mr-2" />}
              Confirm & Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
