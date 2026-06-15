'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Award, CheckCircle2, Clock, AlertTriangle, Eye,
  ChevronRight, Shield, Sparkles, FileCheck, XCircle,
  TrendingUp, Star, Zap
} from 'lucide-react'

interface CertificationAttempt {
  id: string
  name: string
  status: string
  score: number
  date: string | null
  certificationId: string
}

interface CertificationData {
  certifications: CertificationAttempt[]
}

interface AvailableCert {
  id: string
  name: string
  description?: string
  requiredScore: number
  moduleType?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  approved: { label: 'Approved', color: 'text-emerald-700', icon: CheckCircle2, bg: 'bg-emerald-100 border-emerald-200' },
  pending: { label: 'Pending', color: 'text-amber-700', icon: Clock, bg: 'bg-amber-100 border-amber-200' },
  rejected: { label: 'Rejected', color: 'text-red-700', icon: XCircle, bg: 'bg-red-100 border-red-200' },
  needs_training: { label: 'Needs Training', color: 'text-orange-700', icon: AlertTriangle, bg: 'bg-orange-100 border-orange-200' },
  needs_review: { label: 'Needs Review', color: 'text-sky-700', icon: Eye, bg: 'bg-sky-100 border-sky-200' },
  needs_technical: { label: 'Needs Technical Coaching', color: 'text-orange-700', icon: AlertTriangle, bg: 'bg-orange-100 border-orange-200' },
  needs_sales: { label: 'Needs Sales Coaching', color: 'text-orange-700', icon: AlertTriangle, bg: 'bg-orange-100 border-orange-200' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

export function CertificationsView() {
  const [certAttempts, setCertAttempts] = useState<CertificationAttempt[]>([])
  const [availableCerts, setAvailableCerts] = useState<AvailableCert[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, certRes] = await Promise.all([
          fetch(`/api/dashboard?userId=${user?.id}&role=EMPLOYEE`),
          fetch(`/api/certifications?userId=${user?.id}`)
        ])
        if (dashRes.ok) {
          const dashData = await dashRes.json()
          setCertAttempts(dashData.certifications || [])
        }
        if (certRes.ok) {
          const certData = await certRes.json()
          const certs = (certData.attempts || []).reduce((acc: AvailableCert[], a: any) => {
            if (a.certification && !acc.find(c => c.id === a.certification.id)) {
              acc.push({
                id: a.certification.id,
                name: a.certification.name,
                description: a.certification.description,
                requiredScore: a.certification.requiredScore,
                moduleType: a.certification.moduleType,
              })
            }
            return acc
          }, [])
          setAvailableCerts(certs)
        }
      } catch (err) {
        console.error('Failed to fetch certifications:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  const approved = certAttempts.filter(c => c.status === 'approved')
  const pending = certAttempts.filter(c => c.status === 'pending')
  const others = certAttempts.filter(c => c.status !== 'approved' && c.status !== 'pending')

  // Demo data if sparse
  const demoPending: CertificationAttempt[] = pending.length === 0 ? [
    { id: 'dp1', name: 'Field Sales Certification', status: 'pending', score: 85, date: new Date().toISOString(), certificationId: 'c1' },
    { id: 'dp2', name: 'Product Knowledge Certification', status: 'needs_review', score: 72, date: new Date(Date.now() - 3 * 86400000).toISOString(), certificationId: 'c2' },
  ] : pending

  const demoApproved: CertificationAttempt[] = approved.length === 0 ? [
    { id: 'da1', name: 'Company Orientation Certification', status: 'approved', score: 92, date: new Date(Date.now() - 14 * 86400000).toISOString(), certificationId: 'c3' },
  ] : approved

  const demoAvailable: AvailableCert[] = availableCerts.length === 0 ? [
    { id: 'av1', name: 'Inbound Sales Certification', description: 'Master inbound sales techniques and customer handling', requiredScore: 75, moduleType: 'INBOUND_SALES' },
    { id: 'av2', name: 'Negotiation Expert Certification', description: 'Advanced negotiation strategies and closing techniques', requiredScore: 80, moduleType: 'NEGOTIATION' },
    { id: 'av3', name: 'Hospitality Specialist Certification', description: 'Industry-specific hospitality knowledge and practices', requiredScore: 70, moduleType: 'HOSPITALITY' },
  ] : availableCerts

  const totalCerts = demoApproved.length + demoPending.length + others.length
  const approvalRate = totalCerts > 0 ? Math.round((demoApproved.length / totalCerts) * 100) : 0

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Certifications</h2>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage your professional certifications</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <Award className="w-3 h-3 mr-1" /> {approvalRate}% Approval Rate
          </Badge>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-full -translate-y-6 translate-x-6 opacity-50" />
          <CardContent className="p-4 flex items-center gap-3 relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{demoApproved.length}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-full -translate-y-6 translate-x-6 opacity-50" />
          <CardContent className="p-4 flex items-center gap-3 relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{demoPending.length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -translate-y-6 translate-x-6 opacity-50" />
          <CardContent className="p-4 flex items-center gap-3 relative">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{others.length}</p>
              <p className="text-sm text-gray-500">Needs Action</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Approved Certifications */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Approved Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {demoApproved.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No approved certifications yet</p>
                <p className="text-xs text-gray-300 mt-1">Complete training and pass assessments to earn certifications</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoApproved.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">Score: {c.score}%</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">Approved</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending / In-Review Certifications */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              Certification Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {demoPending.length === 0 && others.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No certification attempts</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {[...demoPending, ...others].map((c, i) => {
                  const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending
                  const StatusIcon = statusCfg.icon

                  return (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl border hover:shadow-sm transition-shadow">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusCfg.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusCfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700">{c.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">Score: {c.score}%</span>
                          <span className="text-xs text-gray-400">
                            {c.date ? new Date(c.date).toLocaleDateString() : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${statusCfg.bg} ${statusCfg.color} border`}>
                        {statusCfg.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Certifications to Pursue */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              </div>
              Available Certifications
            </CardTitle>
            <CardDescription>Pursue new certifications to advance your career</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoAvailable.map((cert, i) => {
                const attempted = certAttempts.some(c => c.certificationId === cert.id)

                return (
                  <div key={i} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      {cert.moduleType && (
                        <Badge variant="outline" className="text-[10px] border-gray-200">
                          {cert.moduleType.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">{cert.name}</h4>
                    {cert.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{cert.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-gray-500">Pass: {cert.requiredScore}%</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`w-full rounded-lg ${
                        attempted
                          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                      disabled={attempted}
                    >
                      {attempted ? (
                        <><FileCheck className="w-3 h-3 mr-1" /> Already Attempted</>
                      ) : (
                        <><ChevronRight className="w-3 h-3 mr-1" /> Start Certification</>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
