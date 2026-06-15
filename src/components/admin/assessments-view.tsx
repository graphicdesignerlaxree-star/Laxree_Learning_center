'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClipboardCheck, Clock, CheckCircle2, Users, Target } from 'lucide-react'

interface AssessmentData {
  id: string
  title: string
  description: string | null
  moduleType: string | null
  duration: number | null
  passingScore: number
  totalQuestions: number
  isActive: boolean
  _count?: { attempts: number }
}

export function AssessmentsView() {
  const [assessments, setAssessments] = useState<AssessmentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/assessments')
      .then(r => r.json())
      .then(data => {
        if (data.assessments) setAssessments(data.assessments)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
          </div>
          Assessments
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Create and manage assessments and tests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Assessments', value: assessments.length, icon: ClipboardCheck, color: 'bg-emerald-600' },
          { label: 'Active', value: assessments.filter(a => a.isActive).length, icon: CheckCircle2, color: 'bg-teal-600' },
          { label: 'Total Attempts', value: assessments.reduce((sum, a) => sum + (a._count?.attempts || 0), 0), icon: Users, color: 'bg-emerald-500' },
          { label: 'Avg Passing Score', value: assessments.length ? `${Math.round(assessments.reduce((s, a) => s + a.passingScore, 0) / assessments.length)}%` : '0%', icon: Target, color: 'bg-amber-500' },
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

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map(a => (
                    <TableRow key={a.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{a.title}</p>
                          {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{(a.moduleType || 'general').replace(/_/g, ' ')}</Badge></TableCell>
                      <TableCell className="text-sm">{a.duration ? `${a.duration} min` : '-'}</TableCell>
                      <TableCell className="text-sm font-medium">{a.passingScore}%</TableCell>
                      <TableCell className="text-sm">{a.totalQuestions}</TableCell>
                      <TableCell className="text-sm">{a._count?.attempts || 0}</TableCell>
                      <TableCell>
                        <Badge className={a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
