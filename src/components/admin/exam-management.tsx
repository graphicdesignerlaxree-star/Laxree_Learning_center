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
import {
  FileCheck, Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  CheckCircle2, XCircle, Users, Target, Clock, ChevronRight,
  BarChart3, Layers,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Only fields that ACTUALLY exist on the Assessment Prisma model
interface AssessmentData {
  id: string
  title: string
  description: string | null
  moduleType: string | null
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
  questionType: string | null
  moduleType: string | null
}

const MODULE_TYPES = [
  { value: 'ORIENTATION', label: 'Orientation' },
  { value: 'PRODUCT_ACADEMY', label: 'Product Academy' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'SALES_ACADEMY', label: 'Sales Academy' },
  { value: 'HOSPITALITY', label: 'Hospitality' },
  { value: 'CUSTOMER_DISCOVERY', label: 'Customer Discovery' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'COMPETITIVE_INTELLIGENCE', label: 'Competitive Intelligence' },
  { value: 'FIELD_SALES', label: 'Field Sales' },
  { value: 'INBOUND_SALES', label: 'Inbound Sales' },
  { value: 'CERTIFICATION_PREP', label: 'Certification Prep' },
  { value: 'MOCK_SIMULATOR', label: 'Mock Simulator' },
  { value: 'AI_COACH', label: 'AI Coach' },
  { value: 'CROSS_SELLING', label: 'Cross Selling' },
]

const emptyForm = {
  title: '',
  description: '',
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

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/exam-management', { cache: 'no-store' })
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
      const res = await fetch('/api/admin/question-banks?pageSize=1000', { cache: 'no-store' })
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
          duration: form.duration ? parseInt(form.duration) : null,
          passingScore: parseFloat(form.passingScore) || 70,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create assessment', variant: 'destructive' })
      } else {
        toast({ title: 'Assessment Created', description: `"${form.title}" has been added` })
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
          duration: form.duration ? parseInt(form.duration) : null,
          passingScore: parseFloat(form.passingScore) || 70,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to update assessment', variant: 'destructive' })
      } else {
        toast({ title: 'Assessment Updated', description: `"${form.title}" has been updated` })
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
        toast({ title: 'Assessment Deleted' })
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
      duration: a.duration ? String(a.duration) : '',
      passingScore: String(a.passingScore),
      moduleType: a.moduleType || '',
      isActive: a.isActive,
    })
    setShowEdit(true)
  }

  const openDetail = async (a: AssessmentData) => {
    try {
      const res = await fetch(`/api/admin/exam-management?id=${a.id}`, { cache: 'no-store' })
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
        toast({ title: 'Error', description: data.error || 'Failed to save', variant: 'destructive' })
      } else {
        toast({ title: 'Questions Updated', description: `${selectedQuestionIds.size} questions assigned` })
        setShowQuestionManager(false)
        fetchAssessments()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const filteredQuestions = availableQuestions.filter(q => {
    if (!searchQuestions) return true
    const s = searchQuestions.toLowerCase()
    return q.question.toLowerCase().includes(s) || (q.category || '').toLowerCase().includes(s)
  })

  const totalAttempts = Object.values(statsMap).reduce((sum, s) => sum + s.attempts, 0)
  const avgPassRate = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + (statsMap[a.id]?.passRate || 0), 0) / assessments.length)
    : 0

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><FileCheck className="w-5 h-5 text-emerald-600" /></div>
          Assessment Management
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
            Assessment Management
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Create and manage module assessments & quizzes</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> New Assessment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Assessments', value: assessments.length, icon: FileCheck, color: 'bg-emerald-600' },
          { label: 'Active', value: assessments.filter(a => a.isActive).length, icon: CheckCircle2, color: 'bg-teal-600' },
          { label: 'Total Attempts', value: totalAttempts, icon: Users, color: 'bg-emerald-500' },
          { label: 'Avg Pass Rate', value: `${avgPassRate}%`, icon: Target, color: 'bg-amber-500' },
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

      {/* Assessment List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : assessments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Assessments Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-4">Create your first assessment to start evaluating employees.</p>
            <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Create Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {assessments.map((a, i) => {
            const stats = statsMap[a.id]
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={a.isActive ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900">{a.title}</h3>
                          <Badge className={a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                            {a.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {a.moduleType && <Badge variant="outline" className="text-xs">{MODULE_TYPES.find(m => m.value === a.moduleType)?.label || a.moduleType}</Badge>}
                        </div>
                        {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {a.totalQuestions} questions</span>
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Pass: {a.passingScore}%</span>
                          {a.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.duration} min</span>}
                          {stats && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stats.attempts} attempts</span>}
                          {stats && stats.attempts > 0 && <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Avg: {stats.avgScore}% · Pass: {stats.passRate}%</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(a)} title="View Details"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openQuestionManager(a)} title="Manage Questions"><Layers className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(a)} title="Edit"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(a)} title={a.isActive ? 'Deactivate' : 'Activate'}>
                          {a.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedAssessment(a); setShowDelete(true) }} title="Delete" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate || showEdit} onOpenChange={(open) => { if (!open) { setShowCreate(false); setShowEdit(false); setSelectedAssessment(null) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-emerald-600" /> {showEdit ? 'Edit Assessment' : 'New Assessment'}</DialogTitle>
            <DialogDescription>{showEdit ? 'Update assessment details' : 'Create a new module assessment'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Product Knowledge Quiz" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Module Type</Label>
                <Select value={form.moduleType} onValueChange={(v) => setForm({ ...form, moduleType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {MODULE_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} placeholder="70" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setShowEdit(false); setSelectedAssessment(null) }}>Cancel</Button>
            <Button onClick={showEdit ? handleEdit : handleCreate} disabled={saving || !form.title} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : showEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-emerald-600" /> Assessment Details</DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-lg font-semibold">{selectedAssessment.title}</h3>
                {selectedAssessment.description && <p className="text-sm text-muted-foreground mt-1">{selectedAssessment.description}</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-emerald-600">{selectedAssessment.totalQuestions}</p><p className="text-xs text-muted-foreground">Questions</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{selectedAssessment.passingScore}%</p><p className="text-xs text-muted-foreground">Pass Mark</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{selectedAssessment.duration || '-'}</p><p className="text-xs text-muted-foreground">Minutes</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{selectedAssessment._count?.attempts || 0}</p><p className="text-xs text-muted-foreground">Attempts</p></CardContent></Card>
              </div>
              {selectedAssessment.questions && selectedAssessment.questions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Assigned Questions ({selectedAssessment.questions.length})</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedAssessment.questions.map((q, i) => (
                      <div key={q.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="font-medium"><span className="text-muted-foreground">Q{i + 1}.</span> {q.question.question}</p>
                        <p className="text-xs text-emerald-600 mt-1">Answer: {q.question.correctAnswer}</p>
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
            <DialogDescription>{selectedAssessment?.title} — {selectedQuestionIds.size} selected</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search questions..." value={searchQuestions} onChange={(e) => setSearchQuestions(e.target.value)} className="pl-9" />
            </div>
            <div className="max-h-[50vh] overflow-y-auto space-y-1 border rounded-lg p-2">
              {filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No questions found</p>
              ) : filteredQuestions.map(q => (
                <label key={q.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox
                    checked={selectedQuestionIds.has(q.id)}
                    onCheckedChange={(checked) => {
                      const next = new Set(selectedQuestionIds)
                      if (checked) next.add(q.id)
                      else next.delete(q.id)
                      setSelectedQuestionIds(next)
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {q.category && <Badge variant="secondary" className="text-[10px]">{q.category}</Badge>}
                      {q.difficulty && <Badge className={`text-[10px] ${q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{q.difficulty}</Badge>}
                      {q.questionType && <Badge variant="outline" className="text-[10px]">{q.questionType === 'MCQ' ? 'MCQ' : 'Short Answer'}</Badge>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionManager(false)}>Cancel</Button>
            <Button onClick={saveQuestionAssignment} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : `Save ${selectedQuestionIds.size} Questions`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-500" /> Delete Assessment</DialogTitle>
            <DialogDescription>This will permanently delete the assessment and all its attempts. This cannot be undone.</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="py-4">
              <p className="text-sm">Are you sure you want to delete <span className="font-semibold">{selectedAssessment.title}</span>?</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} variant="destructive">{saving ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
