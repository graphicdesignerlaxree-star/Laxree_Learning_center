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
  ClipboardList, Plus, Search, Edit2, Trash2, Download, Upload,
  Filter, RefreshCw, CheckSquare, XSquare, HelpCircle, BarChart3,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QuestionData {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string | null
  optionD: string | null
  correctAnswer: string
  explanation: string | null
  category: string | null
  difficulty: string | null
  questionType: string | null
  moduleType: string | null
  examType: string | null
  stage: number
  productCategory: string | null
  createdAt: string
  _count?: { assessmentQuestions: number }
}

interface QuestionStats {
  total: number
  byCategory: { category: string | null; _count: number }[]
  byDifficulty: { difficulty: string | null; _count: number }[]
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  inbound_sales_exam: 'Inbound Sales',
  field_sales_exam: 'Field Sales',
  both: 'Both',
}

const STAGE_LABELS: Record<number, string> = {
  0: 'Any',
  1: 'Pre Exam (7d)',
  2: 'Mid Exam (1m)',
  3: 'Hard Exam (1.5m)',
  4: 'Extra Hard (2m)',
}

const CATEGORIES = [
  'product_basics', 'product_knowledge', 'product_features', 'product_specs',
  'sales_basics', 'sales_scenario', 'real_time_case', 'calculation',
  'competitive', 'objection_handling', 'technical_query', 'negotiation',
  'compliance', 'strategic_selling', 'faq', 'upsell', 'procurement',
]

const PRODUCT_CATEGORIES = ['minibar', 'kettle', 'safe', 'rfid', 'hair_dryer']

const emptyForm = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
  category: '',
  difficulty: 'medium',
  questionType: 'mcq',
  moduleType: '',
  examType: '',
  stage: '0',
  productCategory: '',
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
  const [examTypeFilter, setExamTypeFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
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
      if (examTypeFilter !== 'all') params.set('examType', examTypeFilter)
      if (stageFilter !== 'all') params.set('stage', stageFilter)
      if (productFilter !== 'all') params.set('productCategory', productFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/question-banks?${params.toString()}`)
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
  }, [categoryFilter, difficultyFilter, examTypeFilter, stageFilter, productFilter, search, startTransition])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const totalPages = Math.ceil(questions.length / PAGE_SIZE)
  const paginated = questions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/question-banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, stage: parseInt(form.stage) || 0 }),
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
        body: JSON.stringify({ id: selectedQuestion.id, ...form, stage: parseInt(form.stage) || 0 }),
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
      explanation: q.explanation || '',
      category: q.category || '',
      difficulty: q.difficulty || 'medium',
      questionType: q.questionType || 'mcq',
      moduleType: q.moduleType || '',
      examType: q.examType || '',
      stage: String(q.stage),
      productCategory: q.productCategory || '',
    })
    setShowEdit(true)
  }

  const formDialog = (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
      <div className="grid gap-2">
        <Label>Question Text *</Label>
        <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Enter question text" rows={3} />
      </div>
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
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Correct Answer *</Label>
          <Select value={form.correctAnswer} onValueChange={(v) => setForm({ ...form, correctAnswer: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
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
        <div className="grid gap-2">
          <Label>Question Type</Label>
          <Select value={form.questionType} onValueChange={(v) => setForm({ ...form, questionType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="calculator">Calculator</SelectItem>
              <SelectItem value="scenario">Scenario</SelectItem>
              <SelectItem value="case_study">Case Study</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Product Category</Label>
          <Select value={form.productCategory} onValueChange={(v) => setForm({ ...form, productCategory: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map(p => <SelectItem key={p} value={p}>{p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Exam Type</Label>
          <Select value={form.examType} onValueChange={(v) => setForm({ ...form, examType: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound_sales_exam">Inbound Sales</SelectItem>
              <SelectItem value="field_sales_exam">Field Sales</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Stage</Label>
          <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any</SelectItem>
              <SelectItem value="1">Pre Exam (7d)</SelectItem>
              <SelectItem value="2">Mid Exam (1m)</SelectItem>
              <SelectItem value="3">Hard Exam (1.5m)</SelectItem>
              <SelectItem value="4">Extra Hard (2m)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Explanation</Label>
        <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Explain the correct answer" rows={2} />
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
          </div>
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
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
            Question Banks
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Manage assessment questions and categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Export', description: 'Question bank export initiated' })}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Import', description: 'Question bank import dialog coming soon' })}>
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Questions', value: stats?.total || questions.length, icon: HelpCircle, color: 'bg-emerald-600' },
          { label: 'Easy', value: stats?.byDifficulty.find(d => d.difficulty === 'easy')?._count || questions.filter(q => q.difficulty === 'easy').length, color: 'text-emerald-600', icon: BarChart3, bg: 'bg-emerald-50' },
          { label: 'Medium', value: stats?.byDifficulty.find(d => d.difficulty === 'medium')?._count || questions.filter(q => q.difficulty === 'medium').length, color: 'text-amber-600', icon: BarChart3, bg: 'bg-amber-50' },
          { label: 'Hard', value: stats?.byDifficulty.find(d => d.difficulty === 'hard')?._count || questions.filter(q => q.difficulty === 'hard').length, color: 'text-red-600', icon: BarChart3, bg: 'bg-red-50' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={s.bg || ''}><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color || ''}`}>{s.value}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color ? 'bg-white' : s.color}` }>
                  <s.icon className={`w-4 h-4 ${s.color ? s.color : 'text-white'}`} />
                </div>
              </div>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Category breakdown */}
      {stats && stats.byCategory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.byCategory.filter(c => c.category).map(c => (
                <Badge key={c.category} variant="secondary" className="text-xs">
                  {(c.category || '').replace(/_/g, ' ')}: {c._count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
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
              <SelectTrigger className="w-[160px]"><Filter className="w-4 h-4 mr-2 text-gray-400" /><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={examTypeFilter} onValueChange={(v) => { setExamTypeFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Exam Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inbound_sales_exam">Inbound</SelectItem>
                <SelectItem value="field_sales_exam">Field</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="1">Pre</SelectItem>
                <SelectItem value="2">Mid</SelectItem>
                <SelectItem value="3">Hard</SelectItem>
                <SelectItem value="4">Extra Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={(v) => { setProductFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Product" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {PRODUCT_CATEGORIES.map(p => <SelectItem key={p} value={p}>{p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">{selectedIds.size} selected</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  <XSquare className="w-4 h-4 mr-1" /> Clear
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Questions Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Questions Found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-4">
              {search || categoryFilter !== 'all' ? 'Try adjusting your filters or search.' : 'Start by adding questions to the bank.'}
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
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="hidden lg:table-cell">Exam Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Stage</TableHead>
                    <TableHead className="hidden lg:table-cell">Answer</TableHead>
                    <TableHead className="w-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {paginated.map((q, i) => (
                      <motion.tr key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-gray-50/50">
                        <TableCell>
                          <Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggleSelect(q.id)} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{page * PAGE_SIZE + i + 1}</TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm line-clamp-2">{q.question}</p>
                          {q._count && q._count.assessmentQuestions > 0 && (
                            <span className="text-[10px] text-emerald-600">Used in {q._count.assessmentQuestions} exam(s)</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {q.category ? <Badge variant="secondary" className="text-[10px]">{q.category.replace(/_/g, ' ')}</Badge> : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={DIFFICULTY_COLORS[q.difficulty || 'medium'] || ''} variant="secondary">{q.difficulty || 'medium'}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {q.examType ? <Badge variant="secondary" className="text-[10px]">{EXAM_TYPE_LABELS[q.examType] || q.examType}</Badge> : '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">{STAGE_LABELS[q.stage] || q.stage}</TableCell>
                        <TableCell className="hidden lg:table-cell"><span className="font-medium text-emerald-600">{q.correctAnswer}</span></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(q)}><Edit2 className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { setSelectedQuestion(q); setShowDelete(true) }}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Add New Question</DialogTitle>
            <DialogDescription>Create a new question for the question bank</DialogDescription>
          </DialogHeader>
          {formDialog}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.question || !form.optionA || !form.optionB} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Add Question'}
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
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" /> Delete Question</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            Are you sure you want to delete this question? This action cannot be undone.
          </p>
          <p className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg line-clamp-3">{selectedQuestion?.question}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDelete(false); setSelectedQuestion(null) }}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} variant="destructive">
              {saving ? 'Deleting...' : 'Delete Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" /> Bulk Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            Are you sure you want to delete <strong>{selectedIds.size} questions</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>Cancel</Button>
            <Button onClick={handleBulkDelete} disabled={saving} variant="destructive">
              {saving ? 'Deleting...' : `Delete ${selectedIds.size} Questions`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
