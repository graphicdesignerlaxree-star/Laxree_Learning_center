'use client'

import { useEffect, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Palette, Building2, Navigation, Home, Route, Award, ClipboardCheck,
  Trophy, Gamepad2, BadgeCheck, Gift, Save, Check,
} from 'lucide-react'

interface Setting {
  id: string
  key: string
  value: string
  category: string | null
}

function SaveButton({ section, onSave, saving, saved }: { section: string; onSave: (s: string) => void; saving: boolean; saved: boolean }) {
  return (
    <Button onClick={() => onSave(section)} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
      {saved ? <><Check className="w-4 h-4 mr-1" /> Saved</> : <><Save className="w-4 h-4 mr-1" /> Save</>}
    </Button>
  )
}

export function CustomizationCenter() {
  const user = useAuthStore((s) => s.user)
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [, startTransition] = useTransition()

  // Local state for editable settings
  const [theme, setTheme] = useState({ primaryColor: '#059669', secondaryColor: '#0D9488' })
  const [branding, setBranding] = useState({ companyName: 'LAXREE', tagline: 'Premium Hotel Amenities & Solutions', logo: '' })
  const [certLogic, setCertLogic] = useState({ passingScore: '70', fieldScore: '80', inboundScore: '75' })
  const [assessLogic, setAssessLogic] = useState({ defaultTime: '30', retakeLimit: '3', randomizeQuestions: true })
  const [leaderboard, setLeaderboard] = useState({ enabled: true, resetFrequency: 'monthly', showDepartment: true })
  const [gamification, setGamification] = useState({ badgesEnabled: true, pointsPerCourse: '10', pointsPerAssessment: '5', streakBonus: '2' })

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          startTransition(() => {
            setSettings(data.settings)
            data.settings.forEach((s: Setting) => {
              if (s.key === 'primary_color') setTheme(t => ({ ...t, primaryColor: s.value }))
              if (s.key === 'secondary_color') setTheme(t => ({ ...t, secondaryColor: s.value }))
              if (s.key === 'company_name') setBranding(b => ({ ...b, companyName: s.value }))
              if (s.key === 'company_tagline') setBranding(b => ({ ...b, tagline: s.value }))
              if (s.key === 'certification_passing_score') setCertLogic(c => ({ ...c, passingScore: s.value }))
              if (s.key === 'field_readiness_score') setCertLogic(c => ({ ...c, fieldScore: s.value }))
              if (s.key === 'inbound_readiness_score') setCertLogic(c => ({ ...c, inboundScore: s.value }))
              if (s.key === 'leaderboard_enabled') setLeaderboard(l => ({ ...l, enabled: s.value === 'true' }))
              if (s.key === 'badges_enabled') setGamification(g => ({ ...g, badgesEnabled: s.value === 'true' }))
            })
            setLoading(false)
          })
        } else {
          startTransition(() => setLoading(false))
        }
      })
      .catch(() => startTransition(() => setLoading(false)))
  }, [startTransition])

  const saveSetting = async (key: string, value: string, category: string) => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, category, updatedBy: user?.id }),
    })
  }

  const handleSave = async (section: string) => {
    setSaving(true)
    try {
      const saves: Promise<any>[] = []
      if (section === 'theme') {
        saves.push(saveSetting('primary_color', theme.primaryColor, 'theme'))
        saves.push(saveSetting('secondary_color', theme.secondaryColor, 'theme'))
      } else if (section === 'branding') {
        saves.push(saveSetting('company_name', branding.companyName, 'branding'))
        saves.push(saveSetting('company_tagline', branding.tagline, 'branding'))
      } else if (section === 'certification') {
        saves.push(saveSetting('certification_passing_score', certLogic.passingScore, 'certification'))
        saves.push(saveSetting('field_readiness_score', certLogic.fieldScore, 'certification'))
        saves.push(saveSetting('inbound_readiness_score', certLogic.inboundScore, 'certification'))
      } else if (section === 'leaderboard') {
        saves.push(saveSetting('leaderboard_enabled', String(leaderboard.enabled), 'gamification'))
      } else if (section === 'gamification') {
        saves.push(saveSetting('badges_enabled', String(gamification.badgesEnabled), 'gamification'))
        saves.push(saveSetting('points_per_course', gamification.pointsPerCourse, 'gamification'))
        saves.push(saveSetting('points_per_assessment', gamification.pointsPerAssessment, 'gamification'))
      }
      await Promise.all(saves)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="grid grid-cols-1 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-emerald-600" />
          </div>
          Customization Center
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Customize platform branding, settings, and behavior</p>
      </div>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="theme" className="text-xs"><Palette className="w-3 h-3 mr-1" /> Theme</TabsTrigger>
          <TabsTrigger value="branding" className="text-xs"><Building2 className="w-3 h-3 mr-1" /> Branding</TabsTrigger>
          <TabsTrigger value="navigation" className="text-xs"><Navigation className="w-3 h-3 mr-1" /> Sidebar</TabsTrigger>
          <TabsTrigger value="homepage" className="text-xs"><Home className="w-3 h-3 mr-1" /> Homepage</TabsTrigger>
          <TabsTrigger value="paths" className="text-xs"><Route className="w-3 h-3 mr-1" /> Learning Paths</TabsTrigger>
          <TabsTrigger value="certification" className="text-xs"><Award className="w-3 h-3 mr-1" /> Certification</TabsTrigger>
          <TabsTrigger value="assessment" className="text-xs"><ClipboardCheck className="w-3 h-3 mr-1" /> Assessment</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs"><Trophy className="w-3 h-3 mr-1" /> Leaderboard</TabsTrigger>
          <TabsTrigger value="gamification" className="text-xs"><Gamepad2 className="w-3 h-3 mr-1" /> Gamification</TabsTrigger>
          <TabsTrigger value="badges" className="text-xs"><BadgeCheck className="w-3 h-3 mr-1" /> Badges</TabsTrigger>
          <TabsTrigger value="rewards" className="text-xs"><Gift className="w-3 h-3 mr-1" /> Rewards</TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">Dashboard Theme</CardTitle>
              <SaveButton section="theme" onSave={handleSave} saving={saving} saved={saved} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                    <Input value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} className="flex-1" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['#059669', '#0D9488', '#10B981', '#047857', '#065F46'].map(c => (
                      <button key={c} className={`w-8 h-8 rounded-lg border-2 ${theme.primaryColor === c ? 'border-gray-900' : 'border-transparent'}`} style={{ background: c }} onClick={() => setTheme({ ...theme, primaryColor: c })} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={theme.secondaryColor} onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                    <Input value={theme.secondaryColor} onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })} className="flex-1" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['#0D9488', '#059669', '#14B8A6', '#0F766E', '#115E59'].map(c => (
                      <button key={c} className={`w-8 h-8 rounded-lg border-2 ${theme.secondaryColor === c ? 'border-gray-900' : 'border-transparent'}`} style={{ background: c }} onClick={() => setTheme({ ...theme, secondaryColor: c })} />
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Preview</h4>
                <div className="flex gap-4">
                  <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: theme.primaryColor }}>
                    <p className="text-white font-medium">Primary Color Preview</p>
                    <p className="text-white/70 text-sm">Buttons, links, highlights</p>
                  </div>
                  <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: theme.secondaryColor }}>
                    <p className="text-white font-medium">Secondary Color Preview</p>
                    <p className="text-white/70 text-sm">Accents, secondary elements</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">Company Branding</CardTitle>
              <SaveButton section="branding" onSave={handleSave} saving={saving} saved={saved} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={branding.companyName} onChange={(e) => setBranding({ ...branding, companyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <span className="text-2xl font-bold text-emerald-600">{branding.companyName.slice(0, 2)}</span>
                  </div>
                  <Button variant="outline" size="sm">Upload Logo</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sidebar Tab */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sidebar Menu Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop to reorder sidebar menu items. Toggle visibility for each role.</p>
              <div className="space-y-2">
                {['Dashboard', 'User Management', 'Departments', 'Learning Paths', 'Courses & Modules', 'Question Banks', 'Assessments', 'Certifications', 'Mock Simulations', 'Documents', 'Monitoring', 'Customization', 'Audit & Security', 'Reports', 'Settings'].map((item, i) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <span className="text-muted-foreground text-sm w-6">{i + 1}</span>
                    <span className="text-sm font-medium flex-1">{item}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Visible</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Tab */}
        <TabsContent value="homepage">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Homepage Design Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Welcome Banner Title</Label>
                  <Input defaultValue="Welcome to LAXREE Academy" />
                </div>
                <div className="space-y-2">
                  <Label>Welcome Banner Subtitle</Label>
                  <Input defaultValue="Your learning journey starts here" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Featured Section</Label>
                <div className="flex items-center gap-3">
                  <Switch defaultChecked />
                  <span className="text-sm">Show featured courses on homepage</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Activity Feed</Label>
                <div className="flex items-center gap-3">
                  <Switch defaultChecked />
                  <span className="text-sm">Show recent activity on homepage</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Learning Paths Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'New Employee Onboarding', target: 'Employee', courses: 1, active: true },
                { name: 'Sales Mastery Path', target: 'Employee', courses: 3, active: true },
                { name: 'Field Sales Excellence', target: 'Employee', courses: 1, active: true },
                { name: 'Inbound Sales Excellence', target: 'Employee', courses: 1, active: true },
              ].map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Route className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.courses} courses · Target: {p.target}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={p.active} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certification Tab */}
        <TabsContent value="certification">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">Certification Logic</CardTitle>
              <SaveButton section="certification" onSave={handleSave} saving={saving} saved={saved} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Default Passing Score (%)</Label>
                  <Input type="number" value={certLogic.passingScore} onChange={(e) => setCertLogic({ ...certLogic, passingScore: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Field Readiness Score (%)</Label>
                  <Input type="number" value={certLogic.fieldScore} onChange={(e) => setCertLogic({ ...certLogic, fieldScore: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Inbound Readiness Score (%)</Label>
                  <Input type="number" value={certLogic.inboundScore} onChange={(e) => setCertLogic({ ...certLogic, inboundScore: e.target.value })} />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-approve certifications above threshold</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Require manager approval for all certifications</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Send notification on certification expiry</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assessment Logic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Default Duration (minutes)</Label>
                  <Input type="number" value={assessLogic.defaultTime} onChange={(e) => setAssessLogic({ ...assessLogic, defaultTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Max Retake Limit</Label>
                  <Input type="number" value={assessLogic.retakeLimit} onChange={(e) => setAssessLogic({ ...assessLogic, retakeLimit: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input type="number" defaultValue="70" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Randomize question order</span>
                  <Switch checked={assessLogic.randomizeQuestions} onCheckedChange={(v) => setAssessLogic({ ...assessLogic, randomizeQuestions: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show correct answers after completion</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Timed assessments</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">Leaderboard Logic</CardTitle>
              <SaveButton section="leaderboard" onSave={handleSave} saving={saving} saved={saved} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Leaderboard</p>
                  <p className="text-xs text-muted-foreground">Display leaderboard rankings to employees</p>
                </div>
                <Switch checked={leaderboard.enabled} onCheckedChange={(v) => setLeaderboard({ ...leaderboard, enabled: v })} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reset Frequency</Label>
                  <select className="w-full rounded-md border p-2 text-sm" value={leaderboard.resetFrequency} onChange={(e) => setLeaderboard({ ...leaderboard, resetFrequency: e.target.value })}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Ranking Criteria</Label>
                  <select className="w-full rounded-md border p-2 text-sm" defaultValue="ai_score">
                    <option value="ai_score">AI Readiness Score</option>
                    <option value="course_completion">Course Completion</option>
                    <option value="assessment_score">Assessment Score</option>
                    <option value="combined">Combined Score</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show department rankings</span>
                <Switch checked={leaderboard.showDepartment} onCheckedChange={(v) => setLeaderboard({ ...leaderboard, showDepartment: v })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gamification Tab */}
        <TabsContent value="gamification">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">Gamification Rules</CardTitle>
              <SaveButton section="gamification" onSave={handleSave} saving={saving} saved={saved} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Badges</p>
                  <p className="text-xs text-muted-foreground">Award badges for achievements</p>
                </div>
                <Switch checked={gamification.badgesEnabled} onCheckedChange={(v) => setGamification({ ...gamification, badgesEnabled: v })} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Points per Course</Label>
                  <Input type="number" value={gamification.pointsPerCourse} onChange={(e) => setGamification({ ...gamification, pointsPerCourse: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Points per Assessment</Label>
                  <Input type="number" value={gamification.pointsPerAssessment} onChange={(e) => setGamification({ ...gamification, pointsPerAssessment: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Streak Bonus (x)</Label>
                  <Input type="number" value={gamification.streakBonus} onChange={(e) => setGamification({ ...gamification, streakBonus: e.target.value })} />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily learning streaks</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show point notifications</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Badge System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: '🎓', name: 'First Course Complete', criteria: 'Complete 1 course', earned: 8 },
                { icon: '🏆', name: 'Product Expert', criteria: 'Score 90%+ on product assessment', earned: 3 },
                { icon: '🎯', name: 'Sales Ready', criteria: 'Get sales readiness certified', earned: 2 },
                { icon: '⭐', name: 'Top Performer', criteria: 'Top 3 in department ranking', earned: 5 },
              ].map(b => (
                <div key={b.name} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50">
                  <span className="text-2xl">{b.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.criteria}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{b.earned} earned</Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2"><BadgeCheck className="w-4 h-4 mr-2" /> Add New Badge</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rewards System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Rewards</p>
                  <p className="text-xs text-muted-foreground">Allow employees to redeem points for rewards</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-3">
                {[
                  { name: 'Certificate of Excellence', points: 500, available: true },
                  { name: 'Extra Day Off', points: 1000, available: true },
                  { name: 'Premium Course Access', points: 300, available: true },
                  { name: 'Team Lunch Voucher', points: 800, available: false },
                ].map(r => (
                  <div key={r.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.points} points</p>
                      </div>
                    </div>
                    <Badge className={r.available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                      {r.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm"><Gift className="w-4 h-4 mr-2" /> Add Reward</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
