'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  User, Mail, Phone, MapPin, Briefcase, Building2, Calendar,
  Globe, Edit3, Save, X, Shield, Loader2, Camera, Upload, CheckCircle2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProfileData {
  id: string
  fullName: string | null
  email: string
  designation: string | null
  department: string | null
  profilePhoto: string | null
  aiReadinessScore: number
  currentLevel: string | null
  fieldReady: boolean
  inboundReady: boolean
  employeeId: string | null
  location: string | null
  mobileNumber: string | null
  joiningDate: string | null
  experienceLevel: string | null
  previousIndustryExp: string | null
  salesExperience: string | null
  technicalExperience: string | null
  preferredLanguage: string | null
}

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali']
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export function MyProfileView() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [editData, setEditData] = useState<Partial<ProfileData>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.id}&role=EMPLOYEE`)
        if (res.ok) {
          const json = await res.json()
          setProfile(json.user)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchProfile()
  }, [user?.id])

  const handleEdit = () => {
    if (profile) {
      setEditData({
        fullName: profile.fullName || '',
        designation: profile.designation || '',
        location: profile.location || '',
        mobileNumber: profile.mobileNumber || '',
        experienceLevel: profile.experienceLevel || '',
        previousIndustryExp: profile.previousIndustryExp || '',
        salesExperience: profile.salesExperience || '',
        technicalExperience: profile.technicalExperience || '',
        preferredLanguage: profile.preferredLanguage || 'English',
      })
    }
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          ...editData,
        }),
      })

      if (res.ok) {
        setProfile(prev => prev ? { ...prev, ...editData } as ProfileData : prev)
        updateUser({
          fullName: editData.fullName || null,
          designation: editData.designation || null,
        })
        setIsEditing(false)
        toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' })
      } else {
        toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('userId', user?.id || '')

      const res = await fetch('/api/upload-profile-photo', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(prev => prev ? { ...prev, profilePhoto: data.photoUrl } as ProfileData : prev)
        updateUser({ profilePhoto: data.photoUrl })
        toast({ title: 'Photo Updated', description: 'Your profile photo has been updated.' })
      } else {
        const errData = await res.json()
        toast({ title: 'Upload Failed', description: errData.error || 'Failed to upload photo', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Upload Failed', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!profile) return <div className="text-center py-12 text-gray-500">Unable to load profile</div>

  const displayData = isEditing ? editData : profile

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 h-36 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-60" />
          <div className="absolute bottom-4 right-6 flex items-center gap-2 text-emerald-100/60 text-xs">
            <Building2 className="w-3 h-3" />
            <span>LAXREE Academy</span>
          </div>
        </div>
        <CardContent className="p-6 -mt-14 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
                <AvatarImage src={profile.profilePhoto || undefined} alt={profile.fullName || 'Profile'} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-3xl font-bold">
                  {profile.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-1 right-1 w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 transition-all group-hover:scale-110 disabled:opacity-50"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName || 'Employee'}</h2>
              <p className="text-gray-500 mt-0.5">{profile.designation || 'Team Member'} · {profile.department || 'Department'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {profile.fieldReady && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Field Ready
                  </Badge>
                )}
                {profile.inboundReady && (
                  <Badge className="bg-teal-100 text-teal-700 text-xs border-teal-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Inbound Ready
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs border-gray-200">
                  Level: {profile.currentLevel || 'Beginner'}
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-200">
                  AI Score: {Math.round(profile.aiReadinessScore)}
                </Badge>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Full Name</Label>
                {isEditing ? (
                  <Input value={editData.fullName || ''} onChange={(e) => setEditData(prev => ({ ...prev, fullName: e.target.value }))} className="h-9" />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.fullName || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Employee ID</Label>
                <p className="text-sm font-medium text-gray-900">{profile.employeeId || '—'}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                <p className="text-sm font-medium text-gray-900">{profile.email}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile</Label>
                {isEditing ? (
                  <Input value={editData.mobileNumber || ''} onChange={(e) => setEditData(prev => ({ ...prev, mobileNumber: e.target.value }))} className="h-9" />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.mobileNumber || '—'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-teal-600" />
              </div>
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Designation</Label>
                {isEditing ? (
                  <Input value={editData.designation || ''} onChange={(e) => setEditData(prev => ({ ...prev, designation: e.target.value }))} className="h-9" />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.designation || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1"><Building2 className="w-3 h-3" /> Department</Label>
                <p className="text-sm font-medium text-gray-900">{profile.department || '—'}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</Label>
                {isEditing ? (
                  <Input value={editData.location || ''} onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))} className="h-9" />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.location || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1"><Calendar className="w-3 h-3" /> Joining Date</Label>
                <p className="text-sm font-medium text-gray-900">
                  {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience & Skills */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-600" />
              </div>
              Experience & Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Experience Level</Label>
                {isEditing ? (
                  <Select value={editData.experienceLevel || ''} onValueChange={(v) => setEditData(prev => ({ ...prev, experienceLevel: v }))}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.experienceLevel || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Previous Industry Exp.</Label>
                {isEditing ? (
                  <Input value={editData.previousIndustryExp || ''} onChange={(e) => setEditData(prev => ({ ...prev, previousIndustryExp: e.target.value }))} className="h-9" />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.previousIndustryExp || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Sales Experience</Label>
                {isEditing ? (
                  <Input value={editData.salesExperience || ''} onChange={(e) => setEditData(prev => ({ ...prev, salesExperience: e.target.value }))} className="h-9" />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.salesExperience || '—'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Technical Experience</Label>
                {isEditing ? (
                  <Input value={editData.technicalExperience || ''} onChange={(e) => setEditData(prev => ({ ...prev, technicalExperience: e.target.value }))} className="h-9" />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.technicalExperience || '—'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
              Preferences & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Preferred Language</Label>
                {isEditing ? (
                  <Select value={editData.preferredLanguage || 'English'} onValueChange={(v) => setEditData(prev => ({ ...prev, preferredLanguage: v }))}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{profile.preferredLanguage || 'English'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 uppercase tracking-wide">Current Level</Label>
                <p className="text-sm font-medium text-gray-900">{profile.currentLevel || 'Beginner'}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-wide mb-3 block">Account Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                    <p className="text-xs text-gray-400">Receive email updates about your training</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs border-emerald-200">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">AI Recommendations</p>
                    <p className="text-xs text-gray-400">Get personalized learning suggestions</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs border-emerald-200">Enabled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
