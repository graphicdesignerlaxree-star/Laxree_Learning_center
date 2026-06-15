'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileCheck, Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  CheckCircle2, XCircle, Users, Target, Clock, ChevronRight,
  BarChart3, Layers, ArrowRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AssessmentData {
  id: string
  title: string
  description: string | null
  moduleType: string | null
  examType: string | null
  stage: number
  stageLabel: string | null
  duration: number | null
  passingScore: number
  totalQuestions: number
  isActive: boolean
  createdAt: string
  _count?: { attempts: number; questions: number }
  questions?: { id: string; questionBankId: string; question: { id: string; question: string; correctAnswer: string; difficulty: string | null; category: string | null } }[]
}

interface StatsMap {
  [key: string]: { attempts: number; avgScore: number; passRate: number }
}

interface QuestionBankItem {
  id: string
  question: string
  category: string | null
  difficulty: string | null
  examType: string | null
  stage: number
  productCategory: string | null
}

const STAGE_INFO: Record<number, { label: string; time: string; color: string; bgColor: string }> = {
  1: { label: 'Pre Exam', time: 'Day 7', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  2: { label: 'Mid Exam', time: 'Month 1', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  3: { label: 'Hard Exam', time: 'Month 1.5', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  4: { label: 'Extra Hard', time: 'Month 2', color: 'text-red-700', bgColor: 'bg-red-100' },
}

const EXAM_TYPE_COLORS: Record<string, string> = {
  inbound_sales_exam: 'bg-teal-100 text-teal-700 border-teal-200',
  field_sales_exam: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

const emptyForm = {
  title: '',
  description: '',
  examType: '',
  stage: '0',
  stageLabel: '',
  duration: '',
  passingScore: '70',
  moduleType: '',
  isActive: true,
}

export function ExamManagement() {
  const { toast } = useToast()
  const [assessments, setAssessments] = useState<AssessmentData[]>([])
  const [statsMap, setStatsMap] = useState<StatsMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showQuestionManager, setShowQuestionManager] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [availableQuestions, setAvailableQuestions] = useState<QuestionBankItem[]>([])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())
  const [searchQuestions, setSearchQuestions] = useState('')
  const [activeTab, setActiveTab] = useState('grid')

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/exam-management')
      const data = await res.json()
      if (res.ok) {
        startTransition(() => {
          setAssessments(data.assessments || [])
          setStatsMap(data.statsMap || {})
          setError(null)
          setLoading(false)
        })
      } else {
        startTransition(() => {
          setError(data.error || 'Failed to load assessments')
          setLoading(false)
        })
      }
    } catch {
      startTransition(() => {
        setError('Network error. Please try again.')
        setLoading(false)
      })
    }
  }, [startTransition])

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/question-banks')
      const data = await res.json()
      if (res.ok) {
        startTransition(() => {
          setAvailableQuestions(data.questions || [])
        })
      }
    } catch { /* ignore */ }
  }, [startTransition])

  useEffect(() => { fetchAssessments() }, [fetchAssessments])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/exam-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          stage: parseInt(form.stage) || 0,
          duration: form.duration ? parseInt(form.duration) : null,
          passingScore: parseFloat(form.passingScore) || 70,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create exam', variant: 'destructive' })
      } else {
        toast({ title: 'Exam Created', description: `"${form.title}" has been added` })
        setShowCreate(false)
        setForm(emptyForm)
        fetchAssessments()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!selectedAssessment) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/exam-management', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAssessment.id,
          ...form,
          stage: parseInt(form.stage) || 0,
          duration: form.duration ? parseInt(form.duration) : null,
          passingScore: parseFloat(form.passingScore) || 70,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to update exam', variant: 'destructive' })
      } else {
        toast({ title: 'Exam Updated', description: `"${form.title}" has been updated` })
        setShowEdit(false)
        setSelectedAssessment(null)
        fetchAssessments()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedAssessment) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/exam-management?id=${selectedAssessment.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' })
      } else {
        toast({ title: 'Exam Deleted' })
        setShowDelete(false)
        setSelectedAssessment(null)
        fetchAssessments()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const toggleActive = async (a: AssessmentData) => {
    try {
      await fetch('/api/admin/exam-management', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, isActive: !a.isActive }),
      })
      toast({ title: a.isActive ? 'Deactivated' : 'Activated', description: `"${a.title}" ${a.isActive ? 'deactivated' : 'activated'}` })
      fetchAssessments()
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle status', variant: 'destructive' })
    }
  }

  const openEdit = (a: AssessmentData) => {
    setSelectedAssessment(a)
    setForm({
      title: a.title,
      description: a.description || '',
      examType: a.examType || '',
      stage: String(a.stage),
      stageLabel: a.stageLabel || '',
      duration: a.duration ? String(a.duration) : '',
      passingScore: String(a.passingScore),
      moduleType: a.moduleType || '',
      isActive: a.isActive,
    })
    setShowEdit(true)
  }

  const openDetail = async (a: AssessmentData) => {
    try {
      const res = await fetch(`/api/admin/exam-management?id=${a.id}`)
      const data = await res.json()
      if (res.ok && data.assessment) {
        setSelectedAssessment(data.assessment)
        setShowDetail(true)
      }
    } catch { /* ignore */ }
  }

  const openQuestionManager = async (a: AssessmentData) => {
    setSelectedAssessment(a)
    await fetchQuestions()
    const existingIds = new Set(a.questions?.map(q => q.questionBankId) || [])
    setSelectedQuestionIds(existingIds)
    setSearchQuestions('')
    setShowQuestionManager(true)
  }

  const saveQuestionAssignment = async () => {
    if (!selectedAssessment) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/exam-management', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAssessment.id,
          questionIds: Array.from(selectedQuestionIds),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to update questions', variant: 'destructive' })
      } else {
        toast({ title: 'Questions Updated', description: `${selectedQuestionIds.size} questions assigned to "${selectedAssessment.title}"` })
        setShowQuestionManager(false)
        fetchAssessments()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  // Group by stage for timeline
  const stages = [1, 2, 3, 4]
  const groupedByStage = stages.map(stage => ({
    stage,
    info: STAGE_INFO[stage],
    exams: assessments.filter(a => a.stage === stage),
  }))

  // Overall stats
  const overallStats = {
    total: assessments.length,
    active: assessments.filter(a => a.isActive).length,
    totalAttempts: Object.values(statsMap).reduce((sum, s) => sum + s.attempts, 0),
    avgPassRate: Object.values(statsMap).length > 0 ? Math.round(Object.values(statsMap).reduce((sum, s) => sum + s.passRate, 0) / Object.values(statsMap).length) : 0,
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><FileCheck className="w-5 h-5 text-emerald-600" /></div>
          Exam Management
        </h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAssessments} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><FileCheck className="w-5 h-5 text-emerald-600" /></div>
            Exam Management
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Manage stage-wise assessments and question assignments</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Create Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Exams', value: overallStats.total, icon: FileCheck, color: 'bg-emerald-600' },
          { label: 'Active', value: overallStats.active, icon: CheckCircle2, color: 'bg-teal-600' },
          { label: 'Total Attempts', value: overallStats.totalAttempts, icon: Users, color: 'bg-emerald-500' },
          { label: 'Avg Pass Rate', value: `${overallStats.avgPassRate}%`, icon: Target, color: 'bg-amber-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4 text-white" /></div>
              </div>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="grid">Stage Timeline</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6 mt-4">
          {loading ? (
            <div className="space-y-6">
              {stages.map(stage => (
                <div key={stage}>
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {groupedByStage.map(({ stage, info, exams }) => (
                <motion.div key={stage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stage * 0.1 }}>
                  {/* Stage Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${info.bgColor}`}>
                      <span className={`text-lg font-bold ${info.color}`}>{stage}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.label}</h3>
                      <p className="text-xs text-muted-foreground">Scheduled around {info.time}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                    {stage < 4 && <div className="flex-1 border-t border-dashed border-gray-200" />}
                  </div>

                  {/* Exam Cards */}
                  {exams.length === 0 ? (
                    <Card className="border-dashed ml-13">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">No exams configured for this stage</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-13">
                      {exams.map(exam => {
                        const stat = statsMap[exam.id] || { attempts: 0, avgScore: 0, passRate: 0 }
                        return (
                          <Card key={exam.id} className={`hover:shadow-md transition-all ${!exam.isActive ? 'opacity-60' : ''}`}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900">{exam.title}</h4>
                                    {exam.description && <p className="text-xs text-muted-foreground mt-0.5">{exam.description}</p>}
                                  </div>
                                  <Badge className={exam.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>{exam.isActive ? 'Active' : 'Inactive'}</Badge>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {exam.examType && <Badge variant="outline" className={`text-[10px] ${EXAM_TYPE_COLORS[exam.examType] || ''}`}>{exam.examType === 'inbound_sales_exam' ? 'Inbound' : 'Field'}</Badge>}
                                  {exam.duration && <Badge variant="secondary" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />{exam.duration}min</Badge>}
                                  <Badge variant="secondary" className="text-[10px]">{exam.totalQuestions} Qs</Badge>
                                  <Badge variant="secondary" className="text-[10px]">Pass: {exam.passingScore}%</Badge>
                                </div>

                                {/* Attempt Stats */}
                                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                  <div className="text-center">
                                    <p className="text-sm font-bold text-gray-900">{stat.attempts}</p>
                                    <p className="text-[10px] text-muted-foreground">Attempts</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-bold text-gray-900">{stat.avgScore}%</p>
                                    <p className="text-[10px] text-muted-foreground">Avg Score</p>
                                  </div>
                                  <div className="text-center">
                                    <p className={`text-sm font-bold ${stat.passRate >= 70 ? 'text-emerald-600' : stat.passRate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{stat.passRate}%</p>
                                    <p className="text-[10px] text-muted-foreground">Pass Rate</p>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 pt-1">
                                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => openDetail(exam)}>
                                    <Eye className="w-3 h-3 mr-1" /> View
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => openQuestionManager(exam)}>
                                    <Layers className="w-3 h-3 mr-1" /> Questions
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEdit(exam)}>
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toggleActive(exam)}>
                                    {exam.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Pass Score</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Pass Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments.map(a => {
                        const stat = statsMap[a.id] || { attempts: 0, avgScore: 0, passRate: 0 }
                        return (
                          <TableRow key={a.id} className="hover:bg-gray-50/50">
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{a.title}</p>
                                {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                              </div>
                            </TableCell>
                            <TableCell>{a.examType ? <Badge variant="outline" className={`text-[10px] ${EXAM_TYPE_COLORS[a.examType] || ''}`}>{a.examType === 'inbound_sales_exam' ? 'Inbound' : 'Field'}</Badge> : '-'}</TableCell>
                            <TableCell>
                              {a.stage > 0 ? <Badge className={`${STAGE_INFO[a.stage]?.bgColor || 'bg-gray-100'} ${STAGE_INFO[a.stage]?.color || 'text-gray-600'}`}>{STAGE_INFO[a.stage]?.label || `Stage ${a.stage}`}</Badge> : <Badge variant="secondary">Unstaged</Badge>}
                            </TableCell>
                            <TableCell className="text-sm">{a.totalQuestions}</TableCell>
                            <TableCell className="text-sm">{a.passingScore}%</TableCell>
                            <TableCell className="text-sm">{stat.attempts}</TableCell>
                            <TableCell>
                              <span className={`text-sm font-medium ${stat.passRate >= 70 ? 'text-emerald-600' : stat.passRate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{stat.passRate}%</span>
                            </TableCell>
                            <TableCell><Badge className={a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>{a.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openDetail(a)}><Eye className="w-3 h-3" /></Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(a)}><Edit2 className="w-3 h-3" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Create New Exam</DialogTitle>
            <DialogDescription>Configure a new assessment</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Exam title" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Exam Type</Label>
                <Select value={form.examType} onValueChange={(v) => setForm({ ...form, examType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound_sales_exam">Inbound Sales</SelectItem>
                    <SelectItem value="field_sales_exam">Field Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Not Staged</SelectItem>
                    <SelectItem value="1">Pre Exam (7d)</SelectItem>
                    <SelectItem value="2">Mid Exam (1m)</SelectItem>
                    <SelectItem value="3">Hard Exam (1.5m)</SelectItem>
                    <SelectItem value="4">Extra Hard (2m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 30" />
              </div>
              <div className="grid gap-2">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} placeholder="70" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.title} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Create Exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5 text-emerald-600" /> Edit Exam</DialogTitle>
            <DialogDescription>Update exam configuration</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Exam Type</Label>
                <Select value={form.examType} onValueChange={(v) => setForm({ ...form, examType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound_sales_exam">Inbound Sales</SelectItem>
                    <SelectItem value="field_sales_exam">Field Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Not Staged</SelectItem>
                    <SelectItem value="1">Pre Exam (7d)</SelectItem>
                    <SelectItem value="2">Mid Exam (1m)</SelectItem>
                    <SelectItem value="3">Hard Exam (1.5m)</SelectItem>
                    <SelectItem value="4">Extra Hard (2m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEdit(false); setSelectedAssessment(null) }}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" /> Delete Exam</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            Are you sure you want to delete <strong>{selectedAssessment?.title}</strong>? All associated attempts will also be removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDelete(false); setSelectedAssessment(null) }}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} variant="destructive">
              {saving ? 'Deleting...' : 'Delete Exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-emerald-600" /> Exam Details</DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedAssessment.title}</h3>
                  {selectedAssessment.description && <p className="text-sm text-muted-foreground mt-1">{selectedAssessment.description}</p>}
                </div>
                <Badge className={selectedAssessment.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                  {selectedAssessment.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{selectedAssessment.totalQuestions}</p><p className="text-xs text-muted-foreground">Questions</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{selectedAssessment.passingScore}%</p><p className="text-xs text-muted-foreground">Pass Score</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{selectedAssessment.duration || '-'}min</p><p className="text-xs text-muted-foreground">Duration</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{selectedAssessment._count?.attempts || 0}</p><p className="text-xs text-muted-foreground">Attempts</p></CardContent></Card>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAssessment.examType && <Badge variant="outline">{selectedAssessment.examType === 'inbound_sales_exam' ? 'Inbound Sales' : 'Field Sales'}</Badge>}
                {selectedAssessment.stage > 0 && <Badge className={`${STAGE_INFO[selectedAssessment.stage]?.bgColor} ${STAGE_INFO[selectedAssessment.stage]?.color}`}>{STAGE_INFO[selectedAssessment.stage]?.label}</Badge>}
              </div>

              {selectedAssessment.questions && selectedAssessment.questions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" /> Assigned Questions ({selectedAssessment.questions.length})
                  </h4>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                    {selectedAssessment.questions.map((q, i) => (
                      <div key={q.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                        <span className="text-xs font-medium text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2">{q.question.question}</p>
                          <div className="flex gap-1 mt-1">
                            {q.question.difficulty && <Badge className={`text-[10px] ${DIFFICULTY_COLORS[q.question.difficulty] || ''}`}>{q.question.difficulty}</Badge>}
                            {q.question.category && <Badge variant="secondary" className="text-[10px]">{q.question.category.replace(/_/g, ' ')}</Badge>}
                            <Badge variant="secondary" className="text-[10px]">Answer: {q.question.correctAnswer}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Question Manager Dialog */}
      <Dialog open={showQuestionManager} onOpenChange={setShowQuestionManager}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-emerald-600" /> Manage Questions</DialogTitle>
            <DialogDescription>
              Assign questions to &quot;{selectedAssessment?.title}&quot; — {selectedQuestionIds.size} selected
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search questions..." value={searchQuestions} onChange={(e) => setSearchQuestions(e.target.value)} className="pl-9" />
            </div>
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-1 border rounded-lg p-2">
              {availableQuestions
                .filter(q => !searchQuestions || q.question.toLowerCase().includes(searchQuestions.toLowerCase()))
                .map(q => (
                  <label key={q.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Checkbox
                      checked={selectedQuestionIds.has(q.id)}
                      onCheckedChange={() => {
                        const next = new Set(selectedQuestionIds)
                        if (next.has(q.id)) next.delete(q.id)
                        else next.add(q.id)
                        setSelectedQuestionIds(next)
                      }}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{q.question}</p>
                      <div className="flex gap-1 mt-1">
                        {q.difficulty && <Badge className={`text-[10px] ${DIFFICULTY_COLORS[q.difficulty] || ''}`}>{q.difficulty}</Badge>}
                        {q.category && <Badge variant="secondary" className="text-[10px]">{q.category.replace(/_/g, ' ')}</Badge>}
                      </div>
                    </div>
                  </label>
                ))}
              {availableQuestions.filter(q => !searchQuestions || q.question.toLowerCase().includes(searchQuestions.toLowerCase())).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No questions available</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionManager(false)}>Cancel</Button>
            <Button onClick={saveQuestionAssignment} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : `Save (${selectedQuestionIds.size} questions)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
