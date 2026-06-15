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
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Video, Plus, Search, Edit2, Trash2, Eye, Star, StarOff,
  Play, Clock, Filter, RefreshCw, Film, ToggleLeft, ExternalLink,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VideoData {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail: string | null
  duration: number | null
  category: string | null
  productCategory: string | null
  isFeatured: boolean
  isActive: boolean
  views: number
  uploadedBy: string | null
  createdAt: string
}

const CATEGORIES = [
  { value: 'product_training', label: 'Product Training' },
  { value: 'sales_training', label: 'Sales Training' },
  { value: 'technical', label: 'Technical' },
  { value: 'orientation', label: 'Orientation' },
]

const PRODUCT_CATEGORIES = [
  { value: 'minibar', label: 'Minibar' },
  { value: 'kettle', label: 'Kettle' },
  { value: 'safe', label: 'Safe' },
  { value: 'rfid', label: 'RFID' },
  { value: 'hair_dryer', label: 'Hair Dryer' },
]

const CATEGORY_COLORS: Record<string, string> = {
  product_training: 'bg-emerald-100 text-emerald-700',
  sales_training: 'bg-teal-100 text-teal-700',
  technical: 'bg-amber-100 text-amber-700',
  orientation: 'bg-rose-100 text-rose-700',
}

const PRODUCT_COLORS: Record<string, string> = {
  minibar: 'bg-violet-100 text-violet-700',
  kettle: 'bg-orange-100 text-orange-700',
  safe: 'bg-cyan-100 text-cyan-700',
  rfid: 'bg-lime-100 text-lime-700',
  hair_dryer: 'bg-pink-100 text-pink-700',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const emptyForm = {
  title: '',
  description: '',
  url: '',
  category: '',
  productCategory: '',
  duration: '',
  isFeatured: false,
  isActive: true,
}

export function VideoManagement() {
  const { toast } = useToast()
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')

  const fetchVideos = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (productFilter !== 'all') params.set('productCategory', productFilter)
      const res = await fetch(`/api/admin/videos?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        startTransition(() => {
          setVideos(data.videos || [])
          setError(null)
          setLoading(false)
        })
      } else {
        startTransition(() => {
          setError(data.error || 'Failed to load videos')
          setLoading(false)
        })
      }
    } catch {
      startTransition(() => {
        setError('Network error. Please try again.')
        setLoading(false)
      })
    }
  }, [categoryFilter, productFilter, startTransition])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  const filtered = videos.filter(v => {
    if (!search) return true
    const s = search.toLowerCase()
    return v.title.toLowerCase().includes(s) || (v.description || '').toLowerCase().includes(s) || (v.category || '').toLowerCase().includes(s)
  })

  const handleCreate = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration: form.duration ? parseInt(form.duration) : null }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create video', variant: 'destructive' })
      } else {
        toast({ title: 'Video Created', description: `"${form.title}" has been added` })
        setShowCreate(false)
        setForm(emptyForm)
        fetchVideos()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!selectedVideo) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedVideo.id, ...form, duration: form.duration ? parseInt(form.duration) : null }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to update video', variant: 'destructive' })
      } else {
        toast({ title: 'Video Updated', description: `"${form.title}" has been updated` })
        setShowEdit(false)
        setSelectedVideo(null)
        fetchVideos()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedVideo) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/videos?id=${selectedVideo.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to delete video', variant: 'destructive' })
      } else {
        toast({ title: 'Video Deleted', description: `"${selectedVideo.title}" has been removed` })
        setShowDelete(false)
        setSelectedVideo(null)
        fetchVideos()
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
    setSaving(false)
  }

  const toggleFeatured = async (v: VideoData) => {
    try {
      await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v.id, isFeatured: !v.isFeatured }),
      })
      toast({ title: v.isFeatured ? 'Unfeatured' : 'Featured', description: `"${v.title}" ${v.isFeatured ? 'removed from featured' : 'marked as featured'}` })
      fetchVideos()
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle featured', variant: 'destructive' })
    }
  }

  const toggleActive = async (v: VideoData) => {
    try {
      await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v.id, isActive: !v.isActive }),
      })
      toast({ title: v.isActive ? 'Deactivated' : 'Activated', description: `"${v.title}" ${v.isActive ? 'deactivated' : 'activated'}` })
      fetchVideos()
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle status', variant: 'destructive' })
    }
  }

  const openEdit = (v: VideoData) => {
    setSelectedVideo(v)
    setForm({
      title: v.title,
      description: v.description || '',
      url: v.url,
      category: v.category || '',
      productCategory: v.productCategory || '',
      duration: v.duration ? String(v.duration) : '',
      isFeatured: v.isFeatured,
      isActive: v.isActive,
    })
    setShowEdit(true)
  }

  const openPreview = (v: VideoData) => {
    setSelectedVideo(v)
    setShowPreview(true)
  }

  // Stats
  const stats = {
    total: videos.length,
    active: videos.filter(v => v.isActive).length,
    featured: videos.filter(v => v.isFeatured).length,
    totalViews: videos.reduce((sum, v) => sum + v.views, 0),
  }

  const formDialog = (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label>Title *</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
      </div>
      <div className="grid gap-2">
        <Label>URL *</Label>
        <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Product Category</Label>
          <Select value={form.productCategory} onValueChange={(v) => setForm({ ...form, productCategory: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Duration (seconds)</Label>
        <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 300" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
          <Label>Active</Label>
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5 text-emerald-600" />
          </div>
          Video Management
        </h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchVideos} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Retry</Button>
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
              <Video className="w-5 h-5 text-emerald-600" />
            </div>
            Video Management
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Manage training videos and multimedia content</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Add Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Videos', value: stats.total, icon: Film, color: 'bg-emerald-600' },
          { label: 'Active', value: stats.active, icon: ToggleLeft, color: 'bg-teal-600' },
          { label: 'Featured', value: stats.featured, icon: Star, color: 'bg-amber-500' },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'bg-emerald-500' },
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[170px]"><Filter className="w-4 h-4 mr-2 text-gray-400" /><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Product" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {PRODUCT_CATEGORIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button size="sm" variant={viewMode === 'cards' ? 'default' : 'ghost'} className={viewMode === 'cards' ? 'bg-emerald-600 hover:bg-emerald-700 h-7 px-2' : 'h-7 px-2'} onClick={() => setViewMode('cards')}>
                <Film className="w-3 h-3" />
              </Button>
              <Button size="sm" variant={viewMode === 'table' ? 'default' : 'ghost'} className={viewMode === 'table' ? 'bg-emerald-600 hover:bg-emerald-700 h-7 px-2' : 'h-7 px-2'} onClick={() => setViewMode('table')}>
                <Video className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-40 w-full mb-3" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Videos Found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-4">
              {search || categoryFilter !== 'all' || productFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Start by adding your first training video.'}
            </p>
            {!search && categoryFilter === 'all' && productFilter === 'all' && (
              <Button onClick={() => { setForm(emptyForm); setShowCreate(true) }} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> Add Video
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" layout>
          <AnimatePresence>
            {filtered.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                <Card className={`hover:shadow-md transition-all ${!v.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    {/* Thumbnail area */}
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-3 aspect-video flex items-center justify-center group cursor-pointer" onClick={() => openPreview(v)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Play className="w-10 h-10 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                      {v.duration && (
                        <span className="absolute bottom-2 right-2 text-xs text-white bg-black/60 rounded px-1.5 py-0.5 z-10">
                          {formatDuration(v.duration)}
                        </span>
                      )}
                      {v.isFeatured && (
                        <span className="absolute top-2 left-2 z-10">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{v.title}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{v.views}</span>
                        </div>
                      </div>
                      {v.description && <p className="text-xs text-muted-foreground line-clamp-2">{v.description}</p>}
                      <div className="flex flex-wrap gap-1.5">
                        {v.category && <Badge className={`text-[10px] ${CATEGORY_COLORS[v.category] || 'bg-gray-100 text-gray-600'}`}>{CATEGORIES.find(c => c.value === v.category)?.label || v.category}</Badge>}
                        {v.productCategory && <Badge className={`text-[10px] ${PRODUCT_COLORS[v.productCategory] || 'bg-gray-100 text-gray-600'}`}>{PRODUCT_CATEGORIES.find(p => p.value === v.productCategory)?.label || v.productCategory}</Badge>}
                        <Badge className={`text-[10px] ${v.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{v.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-1 border-t">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openPreview(v)}>
                          <ExternalLink className="w-3 h-3 mr-1" /> Preview
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEdit(v)}>
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toggleFeatured(v)}>
                          {v.isFeatured ? <StarOff className="w-3 h-3 mr-1" /> : <Star className="w-3 h-3 mr-1" />}
                          {v.isFeatured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500 hover:text-red-600" onClick={() => { setSelectedVideo(v); setShowDelete(true) }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden md:table-cell">Product</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id} className={`hover:bg-gray-50/50 ${!v.isActive ? 'opacity-60' : ''}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {v.isFeatured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                          <div>
                            <p className="text-sm font-medium">{v.title}</p>
                            {v.description && <p className="text-xs text-muted-foreground line-clamp-1">{v.description}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{v.category ? <Badge className={`text-[10px] ${CATEGORY_COLORS[v.category] || ''}`}>{CATEGORIES.find(c => c.value === v.category)?.label || v.category}</Badge> : '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{v.productCategory ? <Badge className={`text-[10px] ${PRODUCT_COLORS[v.productCategory] || ''}`}>{PRODUCT_CATEGORIES.find(p => p.value === v.productCategory)?.label || v.productCategory}</Badge> : '-'}</TableCell>
                      <TableCell className="text-sm"><Clock className="w-3 h-3 inline mr-1 text-gray-400" />{formatDuration(v.duration)}</TableCell>
                      <TableCell className="text-sm">{v.views}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${v.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{v.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(v)}><Edit2 className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { setSelectedVideo(v); setShowDelete(true) }}><Trash2 className="w-3 h-3" /></Button>
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Add New Video</DialogTitle>
            <DialogDescription>Add a new training video to the platform</DialogDescription>
          </DialogHeader>
          {formDialog}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.title || !form.url} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5 text-emerald-600" /> Edit Video</DialogTitle>
            <DialogDescription>Update video details</DialogDescription>
          </DialogHeader>
          {formDialog}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEdit(false); setSelectedVideo(null) }}>Cancel</Button>
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
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" /> Delete Video</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            Are you sure you want to delete <strong>{selectedVideo?.title}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDelete(false); setSelectedVideo(null) }}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} variant="destructive">
              {saving ? 'Deleting...' : 'Delete Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Play className="w-5 h-5 text-emerald-600" /> Video Preview</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be') || selectedVideo.url.includes('vimeo.com') ? (
                  <iframe src={selectedVideo.url} className="w-full h-full" allowFullScreen title={selectedVideo.title} />
                ) : (
                  <video src={selectedVideo.url} controls className="w-full h-full" />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">{selectedVideo.title}</h3>
                {selectedVideo.description && <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {selectedVideo.category && <Badge className={CATEGORY_COLORS[selectedVideo.category] || ''}>{CATEGORIES.find(c => c.value === selectedVideo.category)?.label}</Badge>}
                  {selectedVideo.productCategory && <Badge className={PRODUCT_COLORS[selectedVideo.productCategory] || ''}>{PRODUCT_CATEGORIES.find(p => p.value === selectedVideo.productCategory)?.label}</Badge>}
                  <Badge variant="secondary">{selectedVideo.views} views</Badge>
                  {selectedVideo.duration && <Badge variant="secondary">{formatDuration(selectedVideo.duration)}</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleFeatured(selectedVideo)}>
                  {selectedVideo.isFeatured ? <StarOff className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                  {selectedVideo.isFeatured ? 'Unfeature' : 'Feature'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleActive(selectedVideo)}>
                  {selectedVideo.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
