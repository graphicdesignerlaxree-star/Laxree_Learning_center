'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  Upload, FileText, File, FileSpreadsheet, FileImage, Presentation,
  Search, Filter, Download, Eye, Grid3X3, List, Trash2, Plus,
  CloudUpload, FolderOpen, CheckCircle2, Clock, X, FileIcon,
  ChevronDown
} from 'lucide-react'

// ==================== TYPES ====================

interface DocumentData {
  id: string
  title: string
  type: string
  fileUrl: string
  fileName: string
  fileSize?: number
  category?: string
  uploadedBy?: string
  createdAt: string
}

type ViewMode = 'grid' | 'list'
type FilterType = 'ALL' | 'PDF' | 'DOC' | 'XLS' | 'PPT' | 'OTHER'

// ==================== HELPERS ====================

function getFileIcon(type: string) {
  const lower = type?.toLowerCase() || ''
  if (lower.includes('pdf')) return FileText
  if (lower.includes('doc') || lower.includes('word')) return File
  if (lower.includes('xls') || lower.includes('excel') || lower.includes('spreadsheet')) return FileSpreadsheet
  if (lower.includes('ppt') || lower.includes('presentation')) return Presentation
  if (lower.includes('image') || lower.includes('img') || lower.includes('png') || lower.includes('jpg')) return FileImage
  return FileIcon
}

function getFileColor(type: string) {
  const lower = type?.toLowerCase() || ''
  if (lower.includes('pdf')) return 'bg-red-100 text-red-700 border-red-200'
  if (lower.includes('doc') || lower.includes('word')) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (lower.includes('xls') || lower.includes('excel') || lower.includes('spreadsheet')) return 'bg-green-100 text-green-700 border-green-200'
  if (lower.includes('ppt') || lower.includes('presentation')) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const FILTER_OPTIONS: { label: string; value: FilterType; icon: any }[] = [
  { label: 'All Files', value: 'ALL', icon: FolderOpen },
  { label: 'PDF', value: 'PDF', icon: FileText },
  { label: 'Documents', value: 'DOC', icon: File },
  { label: 'Spreadsheets', value: 'XLS', icon: FileSpreadsheet },
  { label: 'Presentations', value: 'PPT', icon: Presentation },
  { label: 'Other', value: 'OTHER', icon: FileIcon },
]

// ==================== SKELETON ====================

function UploadSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function UploadCenter() {
  const user = useAuthStore((s) => s.user)
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<DocumentData | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-pdf?type=catalog')
      if (res.ok) {
        const data = await res.json()
        if (data.documents) {
          setDocuments(data.documents)
        }
      }
      // Also fetch from documents API
      const docRes = await fetch('/api/courses')
      if (docRes.ok) {
        // catalogs are already fetched above
      }
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchQuery.toLowerCase())

    const lowerType = (doc.type || doc.fileName || '').toLowerCase()
    let matchesFilter = true
    if (filterType === 'PDF') matchesFilter = lowerType.includes('pdf')
    else if (filterType === 'DOC') matchesFilter = lowerType.includes('doc') || lowerType.includes('word')
    else if (filterType === 'XLS') matchesFilter = lowerType.includes('xls') || lowerType.includes('excel') || lowerType.includes('spreadsheet')
    else if (filterType === 'PPT') matchesFilter = lowerType.includes('ppt') || lowerType.includes('presentation')
    else if (filterType === 'OTHER') matchesFilter = !lowerType.includes('pdf') && !lowerType.includes('doc') && !lowerType.includes('xls') && !lowerType.includes('ppt')

    return matchesSearch && matchesFilter
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await handleUpload(files[0])
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleUpload(files[0])
    }
  }, [])

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name)
      formData.append('type', file.name.split('.').pop()?.toUpperCase() || 'OTHER')
      formData.append('category', 'Employee Upload')
      formData.append('uploadedBy', user?.id || '')

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setUploadSuccess(true)
        setTimeout(() => {
          setUploadSuccess(false)
          setUploadDialogOpen(false)
        }, 1500)
        fetchDocuments()
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            Upload Center
          </h1>
          <p className="text-gray-500 mt-1 ml-13">
            Upload and manage documents, catalogs, and training resources
          </p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </motion.div>

      {/* Drag & Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center
          ${isDragOver
            ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
            : 'border-gray-200 bg-gray-50/50 hover:border-emerald-300 hover:bg-emerald-50/30'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
        />
        <CloudUpload className={`w-12 h-12 mx-auto mb-3 transition-colors ${isDragOver ? 'text-emerald-500' : 'text-gray-300'}`} />
        <h3 className="text-base font-semibold text-gray-700 mb-1">
          {isDragOver ? 'Drop your file here' : 'Drag & drop files here'}
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          or click to browse — PDF, DOC, XLS, PPT supported
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Browse Files
        </Button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
          />
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {FILTER_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                variant="ghost"
                size="sm"
                onClick={() => setFilterType(opt.value)}
                className={`h-8 px-3 text-xs font-medium transition-all ${
                  filterType === opt.value
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <opt.icon className="w-3.5 h-3.5 mr-1.5" />
                {opt.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 text-sm text-gray-500"
      >
        <span className="flex items-center gap-1.5">
          <FolderOpen className="w-4 h-4 text-emerald-500" />
          <strong className="text-gray-700">{documents.length}</strong> total documents
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-red-400" />
          <strong className="text-gray-700">{documents.filter(d => (d.type || d.fileName || '').toLowerCase().includes('pdf')).length}</strong> PDFs
        </span>
        <span className="text-gray-300">|</span>
        <span>Showing <strong className="text-emerald-600">{filteredDocuments.length}</strong> results</span>
      </motion.div>

      {/* Documents */}
      {loading ? (
        <UploadSkeleton />
      ) : filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Documents Found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {searchQuery || filterType !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Upload your first document to get started'}
          </p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredDocuments.map((doc, index) => {
              const IconComp = getFileIcon(doc.type || doc.fileName || '')
              const colorClass = getFileColor(doc.type || doc.fileName || '')
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="group hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 border-gray-100 hover:border-emerald-200 cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass} shrink-0`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate text-sm" title={doc.title}>
                            {doc.title}
                          </h3>
                          <p className="text-xs text-gray-400 truncate">{doc.fileName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${colorClass} border-0`}>
                          {(doc.type || doc.fileName?.split('.').pop()?.toUpperCase() || 'FILE').toUpperCase()}
                        </Badge>
                        {doc.category && (
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-100">
                            {doc.category}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(doc.createdAt)}
                        </span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                          asChild
                        >
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <Card className="border-gray-100">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-gray-50">
                {filteredDocuments.map((doc, index) => {
                  const IconComp = getFileIcon(doc.type || doc.fileName || '')
                  const colorClass = getFileColor(doc.type || doc.fileName || '')
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center gap-4 p-4 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClass} shrink-0`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm truncate">{doc.title}</h4>
                        <p className="text-xs text-gray-400">{doc.category || 'Uncategorized'}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${colorClass} border-0 hidden sm:inline-flex`}>
                        {(doc.type || doc.fileName?.split('.').pop()?.toUpperCase() || 'FILE').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-400 hidden md:block w-20 text-right">
                        {formatFileSize(doc.fileSize)}
                      </span>
                      <span className="text-xs text-gray-400 hidden md:block w-24 text-right">
                        {formatDate(doc.createdAt)}
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-700"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-700"
                          asChild
                        >
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Upload Document
            </DialogTitle>
            <DialogDescription>
              Upload a document to share with your team
            </DialogDescription>
          </DialogHeader>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300
              ${isDragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}
            `}
          >
            {uploadSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                <p className="font-semibold text-emerald-700">Upload Successful!</p>
              </motion.div>
            ) : uploading ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <CloudUpload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-600 mb-3">Drop a file here or click to browse</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-emerald-200 text-emerald-700"
                >
                  Choose File
                </Button>
                <p className="text-xs text-gray-400 mt-2">PDF, DOC, XLS, PPT — Max 10MB</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDoc && (() => {
                const IconComp = getFileIcon(previewDoc.type || previewDoc.fileName || '')
                return <IconComp className="w-5 h-5 text-emerald-600" />
              })()}
              {previewDoc?.title}
            </DialogTitle>
            <DialogDescription>
              Document details and download options
            </DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">File Name</p>
                  <p className="font-medium text-gray-700">{previewDoc.fileName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Type</p>
                  <Badge variant="outline" className={`${getFileColor(previewDoc.type || previewDoc.fileName || '')} border-0`}>
                    {(previewDoc.type || previewDoc.fileName?.split('.').pop()?.toUpperCase() || 'FILE').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Category</p>
                  <p className="font-medium text-gray-700">{previewDoc.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Size</p>
                  <p className="font-medium text-gray-700">{formatFileSize(previewDoc.fileSize)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Uploaded</p>
                  <p className="font-medium text-gray-700">{formatDate(previewDoc.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  asChild
                >
                  <a href={previewDoc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  asChild
                >
                  <a href={previewDoc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    Open in Browser
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
