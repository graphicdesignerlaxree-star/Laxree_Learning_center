'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart3, RefreshCw, Download, Eye, Search,
  CheckCircle2, XCircle, TrendingUp, Users, Target,
  MessageSquare, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'

interface ScorecardData {
  id: string
  userId: string
  examName: string
  date: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  scorePercentage: number
  rank: number | null
  departmentRank: number | null
  passStatus: boolean
  certificationStatus: string | null
  improvementSuggestions: string | null
  managerFeedback: string | null
  aiFeedback: string | null
  user: {
    id: string
    fullName: string | null
    email: string
    employeeId: string | null
    designation: string | null
    department: { name: string } | null
  }
}

interface ScorecardStats {
  total: number
  passed: number
  failed: number
  passRate: number
  avgScore: number
  distribution: { range: string; count: number }[]
  departmentPerformance: { name: string; total: number; passed: number; passRate: number; avgScore: number }[]
}

const CHART_COLORS = ['#059669', '#0D9488', '#10B981', '#34D399', '#6EE7B7']

export function ScorecardMonitor() {
  const { toast } = useToast()
  const [scorecards, setScorecards] = useState<ScorecardData[]>([])
  const [stats, setStats] = useState<ScorecardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [passFilter, setPassFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 15
  const [showDetail, setShowDetail] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedScorecard, setSelectedScorecard] = useState<ScorecardData | null>(null)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchScorecards = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (passFilter !== 'all') params.set('passStatus', passFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      const res = await fetch(`/api/admin/scorecards?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        startTransition(() => {
          setScorecards(data.scorecards || [])
          setStats(data.stats || null)
          setError(null)
          setLoading(false)
        })
      } else {
        startTransition(() => {
          setError(data.error || 'Failed to load scorecards')
          setLoading(false)
        })
      }
    } catch {
      startTransition(() => {
        setError('Network error. Please try again.')
        setLoading(false)
      })
    }
  }, [passFilter, dateFrom, dateTo, startTransition])

  useEffect(() => { fetchScorecards() }, [fetchScorecards])

  // Client-side search
  const filtered = scorecards.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (s.user?.fullName || '').toLowerCase().includes(q) || (s.user?.email || '').toLowerCase().includes(q) || (s.examName || '').toLowerCase().includes(q) || (s.user?.employeeId || '').toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleAddFeedback = async () => {
    if (!selectedScorecard || !feedback) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/scorecards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scorecardId: selectedScorecard.id, managerFeedback: feedback }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to add feedback', variant: 'destructive' })
      } else {
        toast({ title: 'Feedback Added', description: 'Manager feedback has been saved' })
        setShowFeedback(false)
        setFeedback('')
        fetchScorecards()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-emerald-600" /></div>
          Scorecard Monitor
        </h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchScorecards} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
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
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-emerald-600" /></div>
            Scorecard Monitor
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Monitor exam results and performance analytics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Export', description: 'Scorecard export initiated' })}>
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: BarChart3, color: 'bg-emerald-600' },
            { label: 'Passed', value: stats.passed, icon: CheckCircle2, color: 'bg-teal-600' },
            { label: 'Failed', value: stats.failed, icon: XCircle, color: 'bg-red-500' },
            { label: 'Pass Rate', value: `${stats.passRate}%`, icon: TrendingUp, color: 'bg-emerald-500' },
            { label: 'Avg Score', value: `${stats.avgScore}%`, icon: Target, color: 'bg-amber-500' },
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

      {/* Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Score Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" /> Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="range" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stats.distribution.map((_, index) => (
                          <rect key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Department Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.departmentPerformance.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="passRate" fill="#059669" radius={[4, 4, 0, 0]} name="Pass Rate %" />
                        <Bar dataKey="avgScore" fill="#0D9488" radius={[4, 4, 0, 0]} name="Avg Score %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No department data available</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Pass/Fail Summary */}
      {stats && stats.total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.passRate}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span>Passed: {stats.passed} ({stats.passRate}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span>Failed: {stats.failed} ({100 - stats.passRate}%)</span>
                </div>
              </div>
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
              <Input placeholder="Search by name, email, exam..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="pl-9" />
            </div>
            <Select value={passFilter} onValueChange={(v) => { setPassFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Result" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Passed</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0) }} className="w-[140px]" placeholder="From" />
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0) }} className="w-[140px]" placeholder="To" />
          </div>
        </CardContent>
      </Card>

      {/* Scorecards Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Scorecards Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {search || passFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Scorecards will appear here once employees take exams.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Feedback</TableHead>
                    <TableHead className="w-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(s => (
                    <TableRow key={s.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                            {(s.user?.fullName || s.user?.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{s.user?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{s.user?.employeeId || s.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <p className="line-clamp-1">{s.examName}</p>
                        <p className="text-xs text-muted-foreground">{s.totalQuestions}Q · {s.correctAnswers}✓ · {s.wrongAnswers}✗</p>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-bold ${s.scorePercentage >= 70 ? 'text-emerald-600' : s.scorePercentage >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                          {Math.round(s.scorePercentage)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={s.passStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {s.passStatus ? 'Pass' : 'Fail'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {s.managerFeedback ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]"><MessageSquare className="w-3 h-3 mr-1" />Yes</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setSelectedScorecard(s); setShowDetail(true) }}>
                          <Eye className="w-3 h-3" />
                        </Button>
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
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
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

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-emerald-600" /> Scorecard Detail</DialogTitle>
          </DialogHeader>
          {selectedScorecard && (
            <div className="space-y-4 py-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700">
                  {(selectedScorecard.user?.fullName || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedScorecard.user?.fullName || 'Unknown'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedScorecard.user?.designation || ''} · {selectedScorecard.user?.department?.name || 'No Dept'}</p>
                  <p className="text-xs text-muted-foreground">{selectedScorecard.user?.email}</p>
                </div>
              </div>

              {/* Score summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${selectedScorecard.passStatus ? 'text-emerald-600' : 'text-red-500'}`}>{Math.round(selectedScorecard.scorePercentage)}%</p><p className="text-xs text-muted-foreground">Score</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{selectedScorecard.correctAnswers}/{selectedScorecard.totalQuestions}</p><p className="text-xs text-muted-foreground">Correct</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{selectedScorecard.wrongAnswers}</p><p className="text-xs text-muted-foreground">Wrong</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <Badge className={selectedScorecard.passStatus ? 'bg-emerald-100 text-emerald-700 text-base' : 'bg-red-100 text-red-700 text-base'}>
                    {selectedScorecard.passStatus ? 'PASS' : 'FAIL'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Result</p>
                </CardContent></Card>
              </div>

              {/* Exam info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Exam</span><span className="text-sm font-medium">{selectedScorecard.examName}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Date</span><span className="text-sm">{new Date(selectedScorecard.date).toLocaleDateString()}</span></div>
                {selectedScorecard.rank && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Rank</span><span className="text-sm">#{selectedScorecard.rank}</span></div>}
              </div>

              {/* AI Feedback */}
              {selectedScorecard.aiFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">AI Feedback</p>
                  <p className="text-sm text-emerald-800">{selectedScorecard.aiFeedback}</p>
                </div>
              )}

              {/* Improvement Suggestions */}
              {selectedScorecard.improvementSuggestions && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Improvement Suggestions</p>
                  <p className="text-sm text-amber-800">{selectedScorecard.improvementSuggestions}</p>
                </div>
              )}

              {/* Manager Feedback */}
              {selectedScorecard.managerFeedback && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-teal-700 mb-1">Manager Feedback</p>
                  <p className="text-sm text-teal-800">{selectedScorecard.managerFeedback}</p>
                </div>
              )}

              {/* Add feedback button */}
              <Button variant="outline" className="w-full" onClick={() => { setFeedback(selectedScorecard.managerFeedback || ''); setShowFeedback(true) }}>
                <MessageSquare className="w-4 h-4 mr-2" /> {selectedScorecard.managerFeedback ? 'Edit Manager Feedback' : 'Add Manager Feedback'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-600" /> Manager Feedback</DialogTitle>
            <DialogDescription>Add feedback for {selectedScorecard?.user?.fullName}&apos;s scorecard</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Feedback</Label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Enter your feedback for this scorecard..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedback(false)}>Cancel</Button>
            <Button onClick={handleAddFeedback} disabled={saving || !feedback} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Save Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
