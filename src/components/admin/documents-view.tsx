'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useTransition, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, File, Video, BookOpen, Download, Upload, Calendar,
  Plus, Search, Trash2, Eye, X, Loader2, Folder, Filter,
  Image, FileSpreadsheet, Presentation, FileArchive, Play,
  Film, FileType, FilePlus2, Pencil, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

interface DocumentData {
  id: string
  title: string
  type: string
  fileName: string
  fileSize: number | null
  category: string | null
  fileUrl: string
  description?: string | null
  uploadedBy: string | null
  createdAt: string
}

interface CourseData {
  id: string
  title: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  sop: FileText,
  video: Video,
  catalog: BookOpen,
  presentation: Presentation,
  spreadsheet: FileSpreadsheet,
  image: Image,
  archive: FileArchive,
  document: File,
}

const TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-600',
  sop: 'bg-sky-100 text-sky-600',
  video: 'bg-purple-100 text-purple-600',
  catalog: 'bg-emerald-100 text-emerald-600',
  presentation: 'bg-amber-100 text-amber-600',
  spreadsheet: 'bg-teal-100 text-teal-600',
  image: 'bg-pink-100 text-pink-600',
  archive: 'bg-gray-100 text-gray-600',
  document: 'bg-orange-100 text-orange-600',
}

const CATEGORIES = [
  { value: 'training', label: 'Training' },
  { value: 'product', label: 'Product' },
  { value: 'sales', label: 'Sales' },
  { value: 'technical', label: 'Technical' },
  { value: 'operations', label: 'Operations' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'presentation', label: 'Presentation' },
]

const INITIAL_DOCS: DocumentData[] = [
  { id: '1', title: 'LAXREE Sales Training Manual', type: 'pdf', fileName: 'Laxree_Sales_Training_Manual.pdf', fileSize: 2400000, category: 'training', fileUrl: '/upload/Laxree_Sales_Training_Manual.pdf', uploadedBy: null, createdAt: new Date().toISOString() },
  { id: '2', title: 'Mini Bar Specifications', type: 'pdf', fileName: 'Mini Bar.pdf', fileSize: 1800000, category: 'product', fileUrl: '/upload/Mini Bar.pdf', uploadedBy: null, createdAt: new Date().toISOString() },
  { id: '3', title: 'Safe Box Specifications', type: 'pdf', fileName: 'Safe Box.pdf', fileSize: 1500000, category: 'product', fileUrl: '/upload/Safe Box.pdf', uploadedBy: null, createdAt: new Date().toISOString() },
  { id: '4', title: 'Amenities SSP', type: 'pdf', fileName: 'Amenities SSP.pdf', fileSize: 3200000, category: 'product', fileUrl: '/upload/Amenities SSP.pdf', uploadedBy: null, createdAt: new Date().toISOString() },
  { id: '5', title: 'LAXREE Master Catalogue', type: 'catalog', fileName: 'Laxree_Master_Catalogue.pdf', fileSize: 8500000, category: 'catalog', fileUrl: '/upload/Laxree_Master_Catalogue.pdf', uploadedBy: null, createdAt: new Date().toISOString() },
  { id: '6', title: 'Hotel Amenities Presentation', type: 'presentation', fileName: 'LAXREE_Hotel_Amenities.pptx', fileSize: 5200000, category: 'presentation', fileUrl: '/upload/LAXREE_Hotel_Amenities.pptx', uploadedBy: null, createdAt: new Date().toISOString() },
  { id: '7', title: 'MiniBar Answer Sheet', type: 'sop', fileName: 'Laxree_MiniBar_AnswerSheet.docx', fileSize: 450000, category: 'assessment', fileUrl: '/upload/Laxree_MiniBar_AnswerSheet.docx', uploadedBy: null, createdAt: new Date().toISOString() },
  { id: '8', title: 'SSP Final', type: 'spreadsheet', fileName: 'SSP_Final.xlsx', fileSize: 1200000, category: 'operations', fileUrl: '/upload/SSP_Final.xlsx', uploadedBy: null, createdAt: new Date().toISOString() },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

export function DocumentsView() {
  const [documents, setDocuments] = useState<DocumentData[]>(INITIAL_DOCS)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [courses, setCourses] = useState<CourseData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'pdf',
    category: 'training',
    courseId: '',
    description: '',
  })
  // Edit dialog
  const [editingDoc, setEditingDoc] = useState<DocumentData | null>(null)
  const [editForm, setEditForm] = useState({ title: '', category: 'training', description: '' })
  // Preview dialog
  const [previewDoc, setPreviewDoc] = useState<DocumentData | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses')
      if (res.ok) {
        const data = await res.json()
        if (data.courses) setCourses(data.courses.map((c: any) => ({ id: c.id, title: c.title })))
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Categorize content
  const videos = documents.filter(d => d.type === 'video')
  const pdfs = documents.filter(d => d.type === 'pdf' || d.type === 'sop')
  const docs = documents.filter(d => ['document', 'spreadsheet', 'presentation', 'catalog', 'archive'].includes(d.type))

  const filteredDocs = documents.filter(doc => {
    if (!searchTerm) return true
    return doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setSelectedFiles(files)
      if (!uploadForm.title) {
        setUploadForm(prev => ({ ...prev, title: files[0].name.replace(/\.[^/.]+$/, '') }))
      }
      // Auto-detect type
      const ext = files[0].name.split('.').pop()?.toLowerCase()
      const typeMap: Record<string, string> = { pdf: 'pdf', docx: 'document', doc: 'document', xlsx: 'spreadsheet', xls: 'spreadsheet', pptx: 'presentation', ppt: 'presentation', mp4: 'video', webm: 'video' }
      if (ext && typeMap[ext]) {
        setUploadForm(prev => ({ ...prev, type: typeMap[ext] }))
      }
    }
  }, [uploadForm.title])

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
      if (!uploadForm.title && files.length > 0) {
        setUploadForm(prev => ({ ...prev, title: files[0].name.replace(/\.[^/.]+$/, '') }))
      }
      if (files.length === 1) {
        const ext = files[0].name.split('.').pop()?.toLowerCase()
        const typeMap: Record<string, string> = { pdf: 'pdf', docx: 'document', doc: 'document', xlsx: 'spreadsheet', xls: 'spreadsheet', pptx: 'presentation', ppt: 'presentation', mp4: 'video', webm: 'video', png: 'image', jpg: 'image', jpeg: 'image', zip: 'archive', rar: 'archive' }
        if (ext && typeMap[ext]) {
          setUploadForm(prev => ({ ...prev, type: typeMap[ext] }))
        }
      }
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }
    setUploading(true)
    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload-profile-photo', {
          method: 'POST',
          body: formData,
        })
        let fileUrl = ''
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          fileUrl = data.url || data.filePath || `/upload/${file.name}`
        } else {
          fileUrl = `/upload/${file.name}`
        }

        const newDoc: DocumentData = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          title: selectedFiles.length > 1 ? file.name.replace(/\.[^/.]+$/, '') : uploadForm.title,
          type: uploadForm.type,
          fileName: file.name,
          fileSize: file.size,
          category: uploadForm.category,
          fileUrl: fileUrl,
          description: uploadForm.description,
          uploadedBy: 'admin',
          createdAt: new Date().toISOString(),
        }
        setDocuments(prev => [newDoc, ...prev])
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully`)
      setSelectedFiles([])
      setUploadForm({ title: '', type: 'pdf', category: 'training', courseId: '', description: '' })
      setActiveTab('all')
    } catch {
      toast.error('Upload failed')
    }
    setUploading(false)
  }

  const handleDeleteDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
    toast.success('Document removed')
  }

  const handleEditDoc = (doc: DocumentData) => {
    setEditingDoc(doc)
    setEditForm({ title: doc.title, category: doc.category || 'training', description: doc.description || '' })
  }

  const handleSaveEdit = () => {
    if (!editingDoc) return
    setDocuments(prev => prev.map(d =>
      d.id === editingDoc.id
        ? { ...d, title: editForm.title, category: editForm.category, description: editForm.description }
        : d
    ))
    setEditingDoc(null)
    toast.success('Document updated')
  }

  const statsByType = (type: string) => documents.filter(d => d.type === type).length

  // Content card for video/PDF/document
  const ContentCard = ({ doc }: { doc: DocumentData }) => {
    const Icon = TYPE_ICONS[doc.type] || FileText
    const colorClass = TYPE_COLORS[doc.type] || 'bg-gray-100 text-gray-600'
    return (
      <Card className="hover:shadow-md transition-all group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{doc.title}</p>
              <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
              {doc.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{formatSize(doc.fileSize)}</span>
                <span>{formatDate(doc.createdAt)}</span>
                <Badge variant="outline" className="text-[10px] capitalize">{doc.category || 'uncategorized'}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 pt-3 border-t">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setPreviewDoc(doc)}>
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(`/api/uploads?file=${doc.fileName}`, '_blank')}>
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleEditDoc(doc)}>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-500 hover:text-red-700" onClick={() => handleDeleteDoc(doc.id)}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Folder className="w-5 h-5 text-white" />
              </div>
              Content Management
            </h1>
            <p className="text-gray-500 mt-1 ml-13">Manage videos, PDFs, documents & training resources</p>
          </div>
          <Button onClick={() => setActiveTab('upload')} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Upload className="w-4 h-4" /> Upload Content
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: documents.length, icon: Folder, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'PDFs', value: pdfs.length, icon: FileType, color: 'bg-red-100 text-red-600' },
            { label: 'Videos', value: videos.length, icon: Film, color: 'bg-purple-100 text-purple-600' },
            { label: 'Documents', value: docs.length, icon: FileText, color: 'bg-orange-100 text-orange-600' },
            { label: 'SOPs', value: statsByType('sop'), icon: BookOpen, color: 'bg-sky-100 text-sky-600' },
            { label: 'Catalogs', value: statsByType('catalog'), icon: Presentation, color: 'bg-teal-100 text-teal-600' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <TabsList className="grid grid-cols-5 w-auto">
              <TabsTrigger value="all" className="gap-1.5 text-xs"><Folder className="w-3.5 h-3.5" /> All</TabsTrigger>
              <TabsTrigger value="videos" className="gap-1.5 text-xs"><Film className="w-3.5 h-3.5" /> Videos</TabsTrigger>
              <TabsTrigger value="pdfs" className="gap-1.5 text-xs"><FileType className="w-3.5 h-3.5" /> PDFs</TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5 text-xs"><File className="w-3.5 h-3.5" /> Docs</TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5 text-xs"><FilePlus2 className="w-3.5 h-3.5" /> Upload</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search content..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
          </div>

          {/* All Content Tab */}
          <TabsContent value="all">
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
            ) : filteredDocs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Folder className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No content found</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setActiveTab('upload')}>
                    <Upload className="w-3.5 h-3.5" /> Upload Content
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map(doc => (
                  <ContentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            {videos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No videos uploaded yet</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setActiveTab('upload')}>
                    <Upload className="w-3.5 h-3.5" /> Upload Video
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map(doc => (
                  <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-all">
                    <div className="relative bg-black aspect-video flex items-center justify-center">
                      <video
                        className="w-full h-full"
                        controls
                        preload="metadata"
                        src={`/api/uploads?file=${doc.fileName}`}
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{formatSize(doc.fileSize)}</span>
                            <span>{formatDate(doc.createdAt)}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{doc.type.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleEditDoc(doc)}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-500 hover:text-red-700" onClick={() => handleDeleteDoc(doc.id)}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PDFs Tab */}
          <TabsContent value="pdfs">
            {pdfs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileType className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No PDFs uploaded yet</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setActiveTab('upload')}>
                    <Upload className="w-3.5 h-3.5" /> Upload PDF
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pdfs.map(doc => (
                  <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-all">
                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-4 flex items-center justify-center border-b">
                      <div className="w-full" style={{ height: '280px' }}>
                        <iframe
                          src={`/api/uploads?file=${doc.fileName}#toolbar=0&navpanes=0`}
                          className="w-full h-full border-0 rounded"
                          title={doc.title}
                        />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{formatSize(doc.fileSize)}</span>
                            <span>{formatDate(doc.createdAt)}</span>
                            <Badge variant="outline" className="text-[10px] capitalize">{doc.category || 'uncategorized'}</Badge>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0 bg-red-100 text-red-700">{doc.type.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(`/api/uploads?file=${doc.fileName}`, '_blank')}>
                          <ExternalLink className="w-3.5 h-3.5" /> Open Full
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleEditDoc(doc)}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-500 hover:text-red-700" onClick={() => handleDeleteDoc(doc.id)}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            {docs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <File className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setActiveTab('upload')}>
                    <Upload className="w-3.5 h-3.5" /> Upload Document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map(doc => (
                  <ContentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FilePlus2 className="w-5 h-5 text-emerald-600" />
                  Upload New Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Drag & Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-emerald-400 bg-emerald-50/50 scale-[1.01]'
                        : selectedFiles.length > 0
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleFileSelect}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".mp4,.webm,.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                    />
                    {selectedFiles.length > 0 ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold">{selectedFiles.length} file(s) selected</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                          {selectedFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                              {f.name.endsWith('.mp4') || f.name.endsWith('.webm') ? <Film className="w-3.5 h-3.5 text-purple-500" /> :
                               f.name.endsWith('.pdf') ? <FileType className="w-3.5 h-3.5 text-red-500" /> :
                               <File className="w-3.5 h-3.5 text-orange-500" />}
                              <span>{f.name}</span>
                              <span className="text-muted-foreground">({formatSize(f.size)})</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-emerald-600">Click or drag to change selection</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-7 h-7 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Drag & drop files here</p>
                          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5 text-purple-500" /> .mp4, .webm</span>
                          <span className="flex items-center gap-1"><FileType className="w-3.5 h-3.5 text-red-500" /> .pdf</span>
                          <span className="flex items-center gap-1"><File className="w-3.5 h-3.5 text-orange-500" /> .docx, .xlsx, .pptx</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata Form */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="upload-title">Title</Label>
                      <Input
                        id="upload-title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Content title (auto-filled from filename)"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="upload-category">Category / Module</Label>
                      <Select value={uploadForm.category} onValueChange={(v) => setUploadForm(prev => ({ ...prev, category: v }))}>
                        <SelectTrigger id="upload-category"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="upload-desc">Description</Label>
                      <Textarea
                        id="upload-desc"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this content"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Upload Button */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setSelectedFiles([]); setUploadForm({ title: '', type: 'pdf', category: 'training', courseId: '', description: '' }) }}>
                      Clear
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || selectedFiles.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[140px]"
                    >
                      {uploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'File'}</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null) }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDoc && (() => {
                const Icon = TYPE_ICONS[previewDoc.type] || FileText
                return <Icon className="w-5 h-5" />
              })()}
              {previewDoc?.title || 'Preview'}
            </DialogTitle>
            <DialogDescription>{previewDoc?.fileName}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {previewDoc?.type === 'video' ? (
              <video
                className="w-full rounded-lg"
                controls
                autoPlay
                src={`/api/uploads?file=${previewDoc.fileName}`}
              >
                Your browser does not support video playback.
              </video>
            ) : previewDoc?.type === 'pdf' || previewDoc?.type === 'sop' ? (
              <iframe
                src={`/api/uploads?file=${previewDoc.fileName}`}
                className="w-full border-0 rounded-lg"
                style={{ height: '70vh' }}
                title={previewDoc.title}
              />
            ) : (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">This file type cannot be previewed inline</p>
                <Button onClick={() => window.open(`/api/uploads?file=${previewDoc?.fileName}`, '_blank')} className="gap-2">
                  <ExternalLink className="w-4 h-4" /> Open in New Tab
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={(open) => { if (!open) setEditingDoc(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-emerald-600" />
              Edit Content
            </DialogTitle>
            <DialogDescription>Update the details for this content</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Content title"
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoc(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )
}
