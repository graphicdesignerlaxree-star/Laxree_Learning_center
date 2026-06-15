'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Route, BookOpen, Users, ChevronRight, Target } from 'lucide-react'

interface PathData {
  id: string
  name: string
  description: string | null
  targetRole: string | null
  courses: { id: string; title: string; moduleType: string; duration: number | null }[]
}

export function LearningPathsView() {
  const [paths, setPaths] = useState<PathData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(data => {
        if (data.courses) {
          // Group courses by learning path
          const pathMap = new Map<string, PathData>()
          for (const c of data.courses) {
            const pathId = c.learningPath?.name || c.learningPathId || 'uncategorized'
            if (!pathMap.has(pathId)) {
              pathMap.set(pathId, {
                id: pathId, name: c.learningPath?.name || 'Uncategorized',
                description: null, targetRole: 'EMPLOYEE', courses: [],
              })
            }
            pathMap.get(pathId)!.courses.push({
              id: c.id, title: c.title, moduleType: c.moduleType, duration: c.duration,
            })
          }
          setPaths(Array.from(pathMap.values()))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Route className="w-5 h-5 text-emerald-600" />
          </div>
          Learning Paths
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Manage learning paths and course assignments</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paths.map((path, i) => (
            <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Route className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{path.name}</CardTitle>
                        {path.targetRole && <p className="text-xs text-muted-foreground">Target: {path.targetRole}</p>}
                      </div>
                    </div>
                    <Badge variant="secondary">{path.courses.length} courses</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {path.courses.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm flex-1">{c.title}</span>
                        {c.duration && <span className="text-xs text-muted-foreground">{c.duration}min</span>}
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
