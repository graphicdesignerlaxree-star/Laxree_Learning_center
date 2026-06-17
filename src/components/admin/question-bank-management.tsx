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
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ClipboardList, Plus, Search, Edit2, Trash2,
  Filter, RefreshCw, CheckSquare, XSquare, HelpCircle, BarChart3,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Only fields that ACTUALLY exist on the QuestionBank Prisma model
interface QuestionData {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string | null
  optionD: string | null
  correctAnswer: string
  acceptableAnswers: string | null
  explanation: string | null
  category: string | null
  difficulty: string | null
  questionType: string | null
  moduleType: string | null
  createdAt: string
  _count?: { assessmentQuestions: number; examQuestions: number }
}

interface QuestionStats {
  total: number
  easy: number
  medium: number
  hard: number
  mcq: number
  shortAnswer: number
  byCategory: Record<string, number>
  byDifficulty: Record<string, number>
  byModuleType: Record<string, number>
  byQuestionType: Record<string, number>
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
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

const CATEGORIES = [
  'Product Knowledge', 'Sales Process - Opening & Discovery', 'Pitching & Value Proposition',
  'Objection Handling', 'Negotiation & Closing', 'Industry Context & Competition',
  'Customer Service & After-Sales', 'Technical', 'Hospitality', 'Compliance',
]

const emptyForm = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  acceptableAnswers: '',
  explanation: '',
  category: '',
  difficulty: 'medium',
  questionType: 'MCQ',
  moduleType: '',
}

export function QuestionBankManagement() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [stats, setStats] = useState<QuestionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [moduleTypeFilter, setModuleTypeFilter] = useState('all')
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 15
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchQuestions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter)
      if (moduleTypeFilter !== 'all') params.set('moduleType', moduleTypeFilter)
      if (questionTypeFilter !== 'all') params.set('questionType', questionTypeFilter)
      if (search) params.set('search', search)
      params.set('pageSize', '1000')
      const res = await fetch(`/api/admin/question-banks?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        startTransition(() => {
          setQuestions(data.questions || [])
          if (data.stats) setStats(data.stats)
          setError(null)
          setLoading(false)
        })
      } else {
        startTransition(() => {
          setError(data.error || 'Failed to load questions')
          setLoading(false)
        })
      }
    } catch {
      startTransition(() => {
        setError('Network error. Please try again.')
        setLoading(false)
      })
    }
  }, [categoryFilter, difficultyFilter, moduleTypeFilter, questionTypeFilter, search, startTransition])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const totalPages = Math.ceil(questions.length / PAGE_SIZE)
  const paginated = questions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/question-banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create question', variant: 'destructive' })
      } else {
        toast({ title: 'Question Created', description: 'New question has been added to the bank' })
        setShowCreate(false)
        setForm(emptyForm)
        fetchQuestions()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!selectedQuestion) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/question-banks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedQuestion.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to update question', variant: 'destructive' })
      } else {
        toast({ title: 'Question Updated', description: 'Question has been updated successfully' })
        setShowEdit(false)
        setSelectedQuestion(null)
        fetchQuestions()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedQuestion) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/question-banks?id=${selectedQuestion.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to delete', variant: 'destructive' })
      } else {
        toast({ title: 'Question Deleted' })
        setShowDelete(false)
        setSelectedQuestion(null)
        fetchQuestions()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setSaving(true)
    try {
      let deleted = 0
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/question-banks?id=${id}`, { method: 'DELETE' })
        if (res.ok) deleted++
      }
      toast({ title: 'Bulk Delete Complete', description: `${deleted} question(s) deleted` })
      setSelectedIds(new Set())
      setShowBulkDelete(false)
      fetchQuestions()
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginated.map(q => q.id)))
    }
  }

  const openEdit = (q: QuestionData) => {
    setSelectedQuestion(q)
    setForm({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: q.correctAnswer,
      acceptableAnswers: q.acceptableAnswers || '',
      explanation: q.explanation || '',
      category: q.category || '',
      difficulty: q.difficulty || 'medium',
      questionType: q.questionType || 'MCQ',
      moduleType: q.moduleType || '',
    })
    setShowEdit(true)
  }

  const isShortAnswer = form.questionType === 'SHORT_ANSWER'

  const formDialog = (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid gap-2">
        <Label>Question Text *</Label>
        <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Enter question text" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Question Type</Label>
          <Select value={form.questionType} onValueChange={(v) => setForm({ ...form, questionType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MCQ">Multiple Choice</SelectItem>
              <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Difficulty</Label>
          <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Module Type</Label>
          <Select value={form.moduleType} onValueChange={(v) => setForm({ ...form, moduleType: v })}>
            <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
            <SelectContent>
              {MODULE_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isShortAnswer ? (
        <div className="grid gap-2">
          <Label>Correct Answer *</Label>
          <Input value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} placeholder="Enter the correct answer text" />
          <Label className="mt-2">Acceptable Answers (comma-separated)</Label>
          <Input value={form.acceptableAnswers} onChange={(e) => setForm({ ...form, acceptableAnswers: e.target.value })} placeholder="alt answer 1, alt answer 2" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Option A *</Label>
              <Input value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} placeholder="Option A" />
            </div>
            <div className="grid gap-2">
              <Label>Option B *</Label>
              <Input value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} placeholder="Option B" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Option C</Label>
              <Input value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} placeholder="Option C (optional)" />
            </div>
            <div className="grid gap-2">
              <Label>Option D</Label>
              <Input value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} placeholder="Option D (optional)" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Correct Answer *</Label>
            <Select value={form.correctAnswer} onValueChange={(v) => setForm({ ...form, correctAnswer: v })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div className="grid gap-2">
        <Label>Explanation</Label>
        <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Explain the correct answer (optional)" rows={2} />
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><HelpCircle className="w-5 h-5 text-emerald-600" /></div>
          Question Banks
        </h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchQuestions} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
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
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><HelpCircle className="w-5 h-5 text-emerald-600" /></div>
            Question Banks
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Manage assessment & exam questions</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowBulkDelete(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Questions', value: stats.total, icon: HelpCircle, color: 'bg-emerald-600' },
            { label: 'MCQ', value: stats.mcq, icon: CheckSquare, color: 'bg-teal-600' },
            { label: 'Short Answer', value: stats.shortAnswer, icon: BarChart3, color: 'bg-emerald-500' },
            { label: 'Easy', value: stats.easy, icon: CheckSquare, color: 'bg-emerald-400' },
            { label: 'Hard', value: stats.hard, icon: XSquare, color: 'bg-red-500' },
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
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search questions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2 text-gray-400" /><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={questionTypeFilter} onValueChange={(v) => { setQuestionTypeFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MCQ">MCQ</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleTypeFilter} onValueChange={(v) => { setModuleTypeFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Module" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {MODULE_TYPES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Questions Found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-4">
              {search || categoryFilter !== 'all' || difficultyFilter !== 'all' || moduleTypeFilter !== 'all' || questionTypeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Add your first question to the bank.'}
            </p>
            <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={selectedIds.size === paginated.length && paginated.length > 0} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="hidden lg:table-cell">Answer</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((q, i) => (
                    <TableRow key={q.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggleSelect(q.id)} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{page * PAGE_SIZE + i + 1}</TableCell>
                      <TableCell className="text-sm max-w-[300px]">
                        <p className="line-clamp-2">{q.question}</p>
                        {(q._count?.assessmentQuestions || q._count?.examQuestions) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Used in {q._count?.assessmentQuestions || 0} assessment(s) · {q._count?.examQuestions || 0} exam(s)
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="secondary" className="text-xs">{q.category || '-'}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {q.questionType === 'SHORT_ANSWER' ? 'Short Answer' : 'MCQ'}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge className={DIFFICULTY_COLORS[q.difficulty || 'medium'] || ''} variant="secondary">{q.difficulty || 'medium'}</Badge></TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="font-medium text-emerald-600 text-sm">
                          {q.questionType === 'SHORT_ANSWER' ? (q.correctAnswer.length > 20 ? q.correctAnswer.slice(0, 20) + '...' : q.correctAnswer) : q.correctAnswer}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(q)}><Edit2 className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => { setSelectedQuestion(q); setShowDelete(true) }}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, questions.length)} of {questions.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Add Question</DialogTitle>
            <DialogDescription>Create a new question for assessments and exams</DialogDescription>
          </DialogHeader>
          {formDialog}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.question || (!isShortAnswer && (!form.optionA || !form.optionB))} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Create Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5 text-emerald-600" /> Edit Question</DialogTitle>
            <DialogDescription>Update question details</DialogDescription>
          </DialogHeader>
          {formDialog}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEdit(false); setSelectedQuestion(null) }}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving || !form.question || (!isShortAnswer && (!form.optionA || !form.optionB))} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Update Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-500" /> Delete Question</DialogTitle>
            <DialogDescription>This will permanently delete the question and remove it from all assessments/exams.</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="py-4">
              <p className="text-sm mb-2">Are you sure you want to delete this question?</p>
              <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3 line-clamp-3">{selectedQuestion.question}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} variant="destructive">{saving ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-500" /> Bulk Delete</DialogTitle>
            <DialogDescription>This will permanently delete {selectedIds.size} question(s).</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">Are you sure you want to delete {selectedIds.size} question(s)? This cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>Cancel</Button>
            <Button onClick={handleBulkDelete} disabled={saving} variant="destructive">{saving ? 'Deleting...' : `Delete ${selectedIds.size} Questions`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
