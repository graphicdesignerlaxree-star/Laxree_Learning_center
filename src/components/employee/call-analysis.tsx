'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Upload, Mic, FileAudio, X, Play, AlertCircle,
  CheckCircle2, Sparkles, TrendingUp, Lightbulb,
  ArrowRight, Clock, Volume2, BarChart3, Star,
  ChevronDown, ChevronUp, Trash2, RotateCcw,
  Hotel, MapPin, Building2, IndianRupee, BedDouble,
  Rocket, Megaphone, MessageSquare, Copy, PhoneCall,
} from 'lucide-react'

// Types
interface ScoreCategories {
  opening: number
  discovery: number
  productPitch: number
  objectionHandling: number
  closing: number
  enthusiasm: number
  overall: number
}

interface CallAnalysis {
  scores: ScoreCategories
  openingFeedback: string
  discoveryFeedback: string
  productPitchFeedback: string
  objectionHandlingFeedback: string
  closingFeedback: string
  enthusiasmFeedback: string
  overallFeedback: string
  keyStrengths: string[]
  improvements: string[]
  suggestions: string[]
  callSummary: string
  clientProfile?: {
    detected: boolean
    propertyType: string
    propertyStage: string
    location: string
    arrRange: string
    roomCount: string
  }
  recommendedPitch?: string
  interestBuildingTips?: string[]
  followUpMessage?: string
  clientCutCall?: boolean
  clientCutReason?: string | null
}

interface PastAnalysis {
  id: string
  fileName: string
  fileSize: number
  analyzedAt: string
  scores: ScoreCategories
  callSummary: string
}

type ProcessingStage = 'idle' | 'uploading' | 'transcribing' | 'analyzing' | 'complete' | 'error'

const SCORE_LABELS: Record<keyof ScoreCategories, { label: string; icon: React.ElementType; color: string }> = {
  opening: { label: 'Opening', icon: Play, color: 'emerald' },
  discovery: { label: 'Discovery Questions', icon: Lightbulb, color: 'teal' },
  productPitch: { label: 'Product Pitch', icon: Volume2, color: 'cyan' },
  objectionHandling: { label: 'Objection Handling', icon: ShieldIcon, color: 'amber' },
  closing: { label: 'Closing', icon: CheckCircle2, color: 'rose' },
  enthusiasm: { label: 'Enthusiasm', icon: Star, color: 'purple' },
  overall: { label: 'Overall', icon: BarChart3, color: 'emerald' },
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

const ACCEPTED_FORMATS = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm', '.aac']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function getProgressClass(score: number): string {
  if (score >= 80) return '[&>div]:bg-emerald-500'
  if (score >= 60) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-red-500'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function CallAnalysisView() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [stage, setStage] = useState<ProcessingStage>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [transcription, setTranscription] = useState('')
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null)
  const [showTranscription, setShowTranscription] = useState(false)
  const [pastAnalyses, setPastAnalyses] = useState<PastAnalysis[]>([])
  const [expandedPastId, setExpandedPastId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((s) => s.user)

  const handleFileSelect = useCallback((selectedFile: File) => {
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_FORMATS.includes(ext)) {
      setErrorMessage(`Unsupported format. Please upload: ${ACCEPTED_FORMATS.join(', ')}`)
      setStage('error')
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage('File too large. Maximum size is 50MB.')
      setStage('error')
      return
    }
    setFile(selectedFile)
    setStage('idle')
    setErrorMessage('')
    setAnalysis(null)
    setTranscription('')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }, [handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFileSelect(selectedFile)
  }, [handleFileSelect])

  const handleAnalyze = async () => {
    if (!file) return

    setStage('uploading')
    setErrorMessage('')

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer()
      const base64Audio = Buffer.from(arrayBuffer).toString('base64')

      setStage('transcribing')

      // Send to API
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('fileName', file.name)

      const response = await fetch('/api/call-analysis', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Analysis failed' }))
        throw new Error(errorData.error || 'Analysis failed')
      }

      setStage('analyzing')

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setTranscription(data.transcription || '')
      setAnalysis(data.analysis as CallAnalysis)
      setStage('complete')

      // Save to past analyses
      const pastAnalysis: PastAnalysis = {
        id: `pa-${Date.now()}`,
        fileName: data.metadata?.fileName || file.name,
        fileSize: data.metadata?.fileSize || file.size,
        analyzedAt: data.metadata?.analyzedAt || new Date().toISOString(),
        scores: data.analysis?.scores || { opening: 0, discovery: 0, productPitch: 0, objectionHandling: 0, closing: 0, enthusiasm: 0, overall: 0 },
        callSummary: data.analysis?.callSummary || 'No summary available',
      }
      setPastAnalyses(prev => [pastAnalysis, ...prev])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMessage(message)
      setStage('error')
    }
  }

  const handleReset = () => {
    setFile(null)
    setStage('idle')
    setErrorMessage('')
    setAnalysis(null)
    setTranscription('')
    setShowTranscription(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const overallScore = analysis?.scores.overall || 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Mic className="w-5 h-5 text-emerald-600" />
          </div>
          Call Recording AI Analysis
        </h1>
        <p className="text-gray-500 mt-1 ml-13">
          Upload your sales call recording — our Expert AI Sales Assistant analyzes your pitch, gives you a short &amp; sweet recommended pitch, identifies the client&apos;s hotel profile (ARR, property type, stage, location), and guides you on building interest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload & File Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload Dropzone */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-500" /> Upload Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                      transition-all duration-200
                      ${isDragging
                        ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
                        : 'border-gray-200 bg-gray-50/50 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_FORMATS.join(',')}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <motion.div
                      animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                      className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <FileAudio className="w-8 h-8 text-emerald-600" />
                    </motion.div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isDragging ? 'Drop your file here' : 'Drag & drop your recording'}
                    </p>
                    <p className="text-xs text-gray-400 mb-3">or click to browse</p>
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {ACCEPTED_FORMATS.map(fmt => (
                        <Badge key={fmt} variant="outline" className="text-xs text-gray-400 border-gray-200">
                          {fmt.replace('.', '')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Max 50MB</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="fileinfo"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {/* File Info Card */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileAudio className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      {stage === 'idle' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          onClick={handleReset}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {stage === 'idle' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={handleAnalyze}
                        >
                          <Sparkles className="w-4 h-4 mr-2" /> Analyze with AI
                        </Button>
                      </motion.div>
                    )}

                    {/* Processing States */}
                    {(stage === 'uploading' || stage === 'transcribing' || stage === 'analyzing') && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="relative">
                            <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">
                              {stage === 'uploading' && 'Uploading recording...'}
                              {stage === 'transcribing' && 'Transcribing audio...'}
                              {stage === 'analyzing' && 'AI is analyzing your call...'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {stage === 'uploading' && 'Sending your file to the server'}
                              {stage === 'transcribing' && 'Converting speech to text (this may take a minute)'}
                              {stage === 'analyzing' && 'Evaluating opening, questions, pitch & more'}
                            </p>
                          </div>
                        </div>
                        {/* Progress Steps */}
                        <div className="space-y-2">
                          {[
                            { label: 'Upload', done: stage !== 'uploading', active: stage === 'uploading' },
                            { label: 'Transcribe', done: stage === 'analyzing' || stage === 'complete', active: stage === 'transcribing' },
                            { label: 'Analyze', done: stage === 'complete', active: stage === 'analyzing' },
                          ].map((step, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {step.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : step.active ? (
                                <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-200 rounded-full" />
                              )}
                              <span className={`text-xs ${step.done ? 'text-emerald-600 font-medium' : step.active ? 'text-gray-700' : 'text-gray-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Error State */}
                    {stage === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 rounded-xl border border-red-100"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-700">Analysis Failed</p>
                            <p className="text-xs text-red-500 mt-0.5">{errorMessage}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full border-red-200 text-red-600 hover:bg-red-50"
                          onClick={handleReset}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> Try Again
                        </Button>
                      </motion.div>
                    )}

                    {/* Complete State */}
                    {stage === 'complete' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-emerald-700">Analysis Complete</p>
                          <p className="text-xs text-emerald-500">Your call has been evaluated</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-emerald-600 hover:bg-emerald-100"
                          onClick={handleReset}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> New
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Overall Score Card */}
          {analysis && stage === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span className="text-sm font-medium text-emerald-100">Overall Score</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold">{overallScore}</span>
                    <span className="text-lg text-emerald-200 mb-1">/100</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    {overallScore >= 80
                      ? 'Excellent call! You demonstrated strong sales skills across all categories.'
                      : overallScore >= 60
                        ? 'Good effort! Focus on the areas highlighted below to improve your score.'
                        : 'Keep practicing! Review the detailed feedback to identify key areas for improvement.'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Past Analyses */}
          {pastAnalyses.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-500" /> Past Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {pastAnalyses.map((pa) => (
                      <div key={pa.id} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <button
                          className="w-full text-left"
                          onClick={() => setExpandedPastId(expandedPastId === pa.id ? null : pa.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileAudio className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{pa.fileName}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-bold ${getScoreColor(pa.scores.overall)}`}>
                                {pa.scores.overall}
                              </span>
                              {expandedPastId === pa.id
                                ? <ChevronUp className="w-3 h-3 text-gray-400" />
                                : <ChevronDown className="w-3 h-3 text-gray-400" />
                              }
                            </div>
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedPastId === pa.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-2">
                                  {new Date(pa.analyzedAt).toLocaleString()}
                                </p>
                                <div className="grid grid-cols-2 gap-1">
                                  {Object.entries(pa.scores).map(([key, val]) => {
                                    const scoreKey = key as keyof ScoreCategories
                                    const config = SCORE_LABELS[scoreKey]
                                    return (
                                      <div key={key} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">{config?.label || key}</span>
                                        <span className={getScoreColor(val)}>{val}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-2 space-y-4">
          {analysis && stage === 'complete' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Score Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.entries(analysis.scores) as [keyof ScoreCategories, number][]).map(([key, score], index) => {
                  const config = SCORE_LABELS[key]
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Card className="overflow-hidden h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              score >= 80 ? 'bg-emerald-100' : score >= 60 ? 'bg-amber-100' : 'bg-red-100'
                            }`}>
                              <Icon className={`w-3.5 h-3.5 ${
                                score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'
                              }`} />
                            </div>
                            <span className="text-xs font-medium text-gray-500">{config.label}</span>
                          </div>
                          <div className="flex items-end gap-1 mb-2">
                            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
                            <span className="text-xs text-gray-400 mb-1">/100</span>
                          </div>
                          <Progress value={score} className={`h-1.5 ${getProgressClass(score)}`} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Call Summary */}
              {analysis.callSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-gray-700">Call Summary</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{analysis.callSummary}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Detailed Feedback */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Detailed Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-4">
                      {/* Opening */}
                      <FeedbackSection
                        icon={<Play className="w-3.5 h-3.5" />}
                        title="Opening"
                        score={analysis.scores.opening}
                        feedback={analysis.openingFeedback}
                      />
                      <Separator />
                      {/* Discovery */}
                      <FeedbackSection
                        icon={<Lightbulb className="w-3.5 h-3.5" />}
                        title="Discovery Questions"
                        score={analysis.scores.discovery}
                        feedback={analysis.discoveryFeedback}
                      />
                      <Separator />
                      {/* Product Pitch */}
                      <FeedbackSection
                        icon={<Volume2 className="w-3.5 h-3.5" />}
                        title="Product Pitch"
                        score={analysis.scores.productPitch}
                        feedback={analysis.productPitchFeedback}
                      />
                      <Separator />
                      {/* Objection Handling */}
                      <FeedbackSection
                        icon={<ShieldIcon className="w-3.5 h-3.5" />}
                        title="Objection Handling"
                        score={analysis.scores.objectionHandling}
                        feedback={analysis.objectionHandlingFeedback}
                      />
                      <Separator />
                      {/* Closing */}
                      <FeedbackSection
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        title="Closing"
                        score={analysis.scores.closing}
                        feedback={analysis.closingFeedback}
                      />
                      <Separator />
                      {/* Enthusiasm */}
                      <FeedbackSection
                        icon={<Star className="w-3.5 h-3.5" />}
                        title="Enthusiasm"
                        score={analysis.scores.enthusiasm}
                        feedback={analysis.enthusiasmFeedback}
                      />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Key Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                {analysis.keyStrengths && analysis.keyStrengths.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="h-full border-emerald-100 bg-emerald-50/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-emerald-700">Key Strengths</span>
                        </div>
                        <div className="space-y-2">
                          {analysis.keyStrengths.map((strength, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                              <span className="text-sm text-gray-600">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Improvements */}
                {analysis.improvements && analysis.improvements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <Card className="h-full border-amber-100 bg-amber-50/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="text-sm font-medium text-amber-700">Areas for Improvement</span>
                        </div>
                        <div className="space-y-2">
                          {analysis.improvements.map((improvement, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                              <span className="text-sm text-gray-600">{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* AI Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">AI Improvement Suggestions</span>
                      </div>
                      <div className="space-y-3">
                        {analysis.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center shrink-0 text-xs font-bold text-emerald-600">
                              {i + 1}
                            </div>
                            <span className="text-sm text-gray-600">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Client Cut Call Notice — not salesperson's fault */}
              {analysis.clientCutCall && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.62 }}
                >
                  <Card className="border-blue-200 bg-blue-50/40">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <PhoneCall className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-blue-800 block mb-1">
                            Client Disconnected Early — Not Your Mistake
                          </span>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            {analysis.clientCutReason || 'The client cut the call early. This often happens when the timing is off or they already have a vendor — not a reflection of your pitch. Use the tips below to rebuild interest.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Client Profile — Hotel Context */}
              {analysis.clientProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.63 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Hotel className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Client Profile — Hotel Context</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <ProfileChip
                          icon={<Building2 className="w-3.5 h-3.5" />}
                          label="Property Type"
                          value={analysis.clientProfile.propertyType || 'Unknown'}
                        />
                        <ProfileChip
                          icon={<Rocket className="w-3.5 h-3.5" />}
                          label="Property Stage"
                          value={analysis.clientProfile.propertyStage || 'Unknown'}
                        />
                        <ProfileChip
                          icon={<MapPin className="w-3.5 h-3.5" />}
                          label="Location"
                          value={analysis.clientProfile.location || 'Unknown'}
                        />
                        <ProfileChip
                          icon={<IndianRupee className="w-3.5 h-3.5" />}
                          label="ARR Range"
                          value={analysis.clientProfile.arrRange || 'Unknown'}
                        />
                        <ProfileChip
                          icon={<BedDouble className="w-3.5 h-3.5" />}
                          label="Room Count"
                          value={analysis.clientProfile.roomCount || 'Not asked'}
                        />
                        <ProfileChip
                          icon={<Sparkles className="w-3.5 h-3.5" />}
                          label="Profile Status"
                          value={analysis.clientProfile.detected ? 'Detected' : 'Not captured'}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recommended Pitch — Short & Sweet */}
              {analysis.recommendedPitch && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/40">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Megaphone className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-800">
                          Recommended Pitch — Short &amp; Sweet
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] border-emerald-200 font-semibold ml-auto">
                          USE THIS
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed bg-white/70 rounded-lg p-3 border border-emerald-100">
                        {analysis.recommendedPitch}
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-2 italic">
                        ✓ Guest experience benefit + ✓ ROI + ✓ Differentiator — short, presentable, easy to understand
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Interest Building Tips — for re-engaging disengaged clients */}
              {analysis.interestBuildingTips && analysis.interestBuildingTips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.68 }}
                >
                  <Card className="border-amber-200 bg-amber-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold text-amber-800">
                          Interest-Building Techniques
                        </span>
                        <span className="text-[11px] text-amber-600 ml-auto">If client seems disengaged</span>
                      </div>
                      <div className="space-y-2">
                        {analysis.interestBuildingTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-amber-100">
                            <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center shrink-0 text-xs font-bold text-amber-600">
                              {i + 1}
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Follow-up WhatsApp Message — ready to copy */}
              {analysis.followUpMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="border-teal-200 bg-teal-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="text-sm font-semibold text-teal-800">
                            Ready-to-Send Follow-Up Message
                          </span>
                          <Badge className="bg-teal-100 text-teal-700 text-[10px] border-teal-200 font-semibold">
                            WHATSAPP
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                          onClick={() => {
                            navigator.clipboard?.writeText(analysis.followUpMessage || '')
                          }}
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-lg p-3 border border-teal-100 whitespace-pre-wrap">
                        {analysis.followUpMessage}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Transcription Toggle */}
              {transcription && (
                <Card>
                  <CardContent className="p-4">
                    <button
                      className="w-full flex items-center justify-between"
                      onClick={() => setShowTranscription(!showTranscription)}
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-teal-500" />
                        <span className="text-sm font-medium text-gray-700">Call Transcription</span>
                      </div>
                      {showTranscription
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                    <AnimatePresence>
                      {showTranscription && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {transcription}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : stage === 'idle' && !file ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                    <Mic className="w-10 h-10 text-emerald-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analysis Yet</h3>
                  <p className="text-gray-400 max-w-md mb-4">
                    Upload a sales call recording to get AI-powered feedback on your opening, discovery questions,
                    product pitch, objection handling, closing, and enthusiasm.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md">
                    {[
                      { icon: Play, label: 'Opening' },
                      { icon: Lightbulb, label: 'Discovery' },
                      { icon: Volume2, label: 'Product Pitch' },
                      { icon: ShieldIcon, label: 'Objections' },
                      { icon: CheckCircle2, label: 'Closing' },
                      { icon: Star, label: 'Enthusiasm' },
                    ].map(({ icon: ItemIcon, label }) => (
                      <div key={label} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <ItemIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : stage === 'error' ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-red-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Analysis Failed</h3>
                <p className="text-gray-400 max-w-md">{errorMessage}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

// Feedback Section Component
function FeedbackSection({
  icon,
  title,
  score,
  feedback,
}: {
  icon: React.ReactNode
  title: string
  score: number
  feedback: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
            score >= 80 ? 'bg-emerald-100 text-emerald-600' : score >= 60 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-500'
          }`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={score} className={`w-20 h-1.5 ${getProgressClass(score)}`} />
          <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed pl-8">{feedback}</p>
    </div>
  )
}

// Profile Chip — small labelled value display for client profile
function ProfileChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  const isUnknown = !value || value.toLowerCase() === 'unknown' || value.toLowerCase() === 'not asked'
  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${isUnknown ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-teal-100'}`}>
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isUnknown ? 'bg-gray-100 text-gray-400' : 'bg-teal-100 text-teal-600'}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</div>
        <div className={`text-xs font-medium truncate ${isUnknown ? 'text-gray-400 italic' : 'text-gray-700'}`}>{value}</div>
      </div>
    </div>
  )
}
