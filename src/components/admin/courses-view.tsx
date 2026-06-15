'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BookOpen, ChevronDown, ChevronRight, Clock, Users, Play, FileText, Video, Layers } from 'lucide-react'

interface CourseData {
  id: string
  title: string
  description: string | null
  moduleType: string
  duration: number | null
  isActive: boolean
  isRequired: boolean
  _count?: { enrollments: number }
  learningPath?: { name: string } | null
  modules: { id: string; title: string; contentType: string | null; duration: number | null; order: number }[]
}

const MODULE_TYPE_COLORS: Record<string, string> = {
  ORIENTATION: 'bg-emerald-100 text-emerald-700',
  PRODUCT_ACADEMY: 'bg-teal-100 text-teal-700',
  TECHNICAL: 'bg-gray-100 text-gray-700',
  SALES_ACADEMY: 'bg-amber-100 text-amber-700',
  HOSPITALITY: 'bg-purple-100 text-purple-700',
  CUSTOMER_DISCOVERY: 'bg-emerald-100 text-emerald-700',
  NEGOTIATION: 'bg-amber-100 text-amber-700',
  COMPETITIVE_INTELLIGENCE: 'bg-teal-100 text-teal-700',
  FIELD_SALES: 'bg-emerald-100 text-emerald-700',
  INBOUND_SALES: 'bg-teal-100 text-teal-700',
  CERTIFICATION_PREP: 'bg-amber-100 text-amber-700',
  MOCK_SIMULATOR: 'bg-purple-100 text-purple-700',
  AI_COACH: 'bg-emerald-100 text-emerald-700',
}

export function CoursesView() {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(data => {
        if (data.courses) setCourses(data.courses)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const getContentTypeIcon = (type: string | null) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-emerald-500" />
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />
      default: return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          Courses & Modules
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Manage courses, modules, and learning content</p>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow">
                <Collapsible open={expanded.has(course.id)} onOpenChange={() => toggleExpand(course.id)}>
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm">{course.title}</h3>
                              <Badge className={MODULE_TYPE_COLORS[course.moduleType] || 'bg-gray-100 text-gray-700'} variant="secondary">
                                {course.moduleType.replace(/_/g, ' ')}
                              </Badge>
                              {course.isRequired && <Badge className="bg-amber-100 text-amber-700" variant="secondary">Required</Badge>}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration} min</span>}
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course._count?.enrollments || 0} enrolled</span>
                              <span>{course.modules.length} modules</span>
                            </div>
                          </div>
                          {expanded.has(course.id) ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </div>
                      </CardContent>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 py-3 bg-gray-50/50">
                      <div className="space-y-1.5">
                        {course.modules.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors">
                            {getContentTypeIcon(m.contentType)}
                            <span className="text-sm flex-1">{m.title}</span>
                            {m.duration && <span className="text-xs text-muted-foreground">{m.duration} min</span>}
                            <Badge variant="secondary" className="text-xs">{m.contentType || 'text'}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
