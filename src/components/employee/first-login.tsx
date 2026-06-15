'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ChevronLeft, ChevronRight, Loader2, Check, User, MapPin, Briefcase, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'

const TOTAL_STEPS = 4

const DEPARTMENTS = ['Sales', 'Inbound Sales', 'Field Sales', 'Training', 'Operations']
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali']

interface FormData {
  fullName: string
  employeeId: string
  designation: string
  department: string
  location: string
  reportingManager: string
  joiningDate: string
  mobileNumber: string
  email: string
  experienceLevel: string
  previousIndustryExperience: string
  salesExperience: string
  technicalExperience: string
  preferredLanguage: string
  profilePhoto: string
}

export function FirstLoginFlow() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    employeeId: '',
    designation: '',
    department: '',
    location: '',
    reportingManager: '',
    joiningDate: '',
    mobileNumber: '',
    email: '',
    experienceLevel: '',
    previousIndustryExperience: '',
    salesExperience: '',
    technicalExperience: '',
    preferredLanguage: '',
    profilePhoto: '',
  })

  const progress = (step / TOTAL_STEPS) * 100

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Build update payload - only include employeeId if it's different from current
      const existingEmployeeId = user?.employeeId
      const newEmployeeId = formData.employeeId.trim()

      const payload: Record<string, any> = {
        id: user?.id,
        fullName: formData.fullName,
        designation: formData.designation,
        department: formData.department || undefined,
        location: formData.location,
        joiningDate: formData.joiningDate || undefined,
        mobileNumber: formData.mobileNumber,
        experienceLevel: formData.experienceLevel,
        previousIndustryExp: formData.previousIndustryExperience || undefined,
        salesExperience: formData.salesExperience || undefined,
        technicalExperience: formData.technicalExperience || undefined,
        preferredLanguage: formData.preferredLanguage || undefined,
        isFirstLogin: false,
        updatedBy: user?.id,
      }

      // Only include employeeId if user doesn't already have one, or if they're changing it to a new value
      if (!existingEmployeeId) {
        payload.employeeId = newEmployeeId || undefined
      } else if (newEmployeeId && newEmployeeId !== existingEmployeeId) {
        payload.employeeId = newEmployeeId
      }
      // If employeeId is already set and unchanged, don't send it to avoid unique constraint issues

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        // Check for unique constraint error and provide friendly message
        const errorMsg = data.error || 'Failed to update profile'
        const friendlyMsg = errorMsg.includes('Unique constraint failed') || errorMsg.includes('unique')
          ? 'This Employee ID is already in use. Please use a different one.'
          : errorMsg
        toast({ title: 'Error', description: friendlyMsg, variant: 'destructive' })
        return
      }

      updateUser({
        fullName: formData.fullName,
        employeeId: formData.employeeId || user?.employeeId,
        designation: formData.designation,
        department: formData.department,
        isFirstLogin: false,
      })

      toast({ title: 'Profile Complete!', description: 'Welcome to LAXREE Academy!' })
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepInfo = [
    { title: 'Personal Information', desc: 'Tell us about yourself', icon: User },
    { title: 'Work Details', desc: 'Your role and location', icon: MapPin },
    { title: 'Experience', desc: 'Your professional background', icon: Briefcase },
    { title: 'Preferences', desc: 'Language and profile setup', icon: Globe },
  ]

  const currentStepInfo = stepInfo[step - 1]

  // If user already has data, pre-fill
  const prefilledEmployeeId = formData.employeeId || user?.employeeId || ''
  const prefilledFullName = formData.fullName || user?.fullName || ''
  const prefilledDesignation = formData.designation || user?.designation || ''
  const prefilledEmail = formData.email || user?.email || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-800">LAXREE Academy</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-gray-500 mt-1">First time here? Let&apos;s set up your account.</p>
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {stepInfo.map((s, i) => {
              const StepIcon = s.icon
              const isCompleted = step > i + 1
              const isCurrent = step === i + 1
              return (
                <div key={i} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${isCompleted ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-gray-100 text-gray-400'}
                  `}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  {i < stepInfo.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-1 transition-colors ${step > i + 1 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2 text-center">
            Step {step} of {TOTAL_STEPS} — {currentStepInfo.title}
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl shadow-emerald-900/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{currentStepInfo.title}</CardTitle>
            <CardDescription>{currentStepInfo.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="Enter your full name"
                        value={formData.fullName || prefilledFullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID {user?.employeeId ? '' : '*'}</Label>
                      <Input
                        placeholder="e.g. EMP001"
                        value={formData.employeeId || prefilledEmployeeId}
                        onChange={(e) => updateField('employeeId', e.target.value)}
                        disabled={!!user?.employeeId}
                        className={user?.employeeId ? 'bg-gray-50 text-gray-500' : ''}
                      />
                      {user?.employeeId && (
                        <p className="text-xs text-gray-400">Employee ID is pre-assigned and cannot be changed</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Designation *</Label>
                      <Input
                        placeholder="e.g. Sales Executive"
                        value={formData.designation || prefilledDesignation}
                        onChange={(e) => updateField('designation', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department *</Label>
                      <Select value={formData.department} onValueChange={(v) => updateField('department', v)}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Input
                        placeholder="e.g. Mumbai, Delhi"
                        value={formData.location}
                        onChange={(e) => updateField('location', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reporting Manager</Label>
                      <Input
                        placeholder="Manager name"
                        value={formData.reportingManager}
                        onChange={(e) => updateField('reportingManager', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Joining Date</Label>
                      <Input
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => updateField('joiningDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number *</Label>
                      <Input
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.mobileNumber}
                        onChange={(e) => updateField('mobileNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="your.email@laxree.com"
                        value={formData.email || prefilledEmail}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label>Experience Level *</Label>
                      <Select value={formData.experienceLevel} onValueChange={(v) => updateField('experienceLevel', v)}>
                        <SelectTrigger><SelectValue placeholder="Select your experience level" /></SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Previous Industry Experience</Label>
                      <Input
                        placeholder="e.g. 3 years in hospitality"
                        value={formData.previousIndustryExperience}
                        onChange={(e) => updateField('previousIndustryExperience', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sales Experience</Label>
                      <Input
                        placeholder="e.g. 2 years B2B sales"
                        value={formData.salesExperience}
                        onChange={(e) => updateField('salesExperience', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Technical Experience</Label>
                      <Input
                        placeholder="e.g. CRM tools, product demos"
                        value={formData.technicalExperience}
                        onChange={(e) => updateField('technicalExperience', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="space-y-2">
                      <Label>Preferred Learning Language *</Label>
                      <Select value={formData.preferredLanguage} onValueChange={(v) => updateField('preferredLanguage', v)}>
                        <SelectTrigger><SelectValue placeholder="Select preferred language" /></SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Profile Photo</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <User className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || isSubmitting}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              {step < TOTAL_STEPS ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
