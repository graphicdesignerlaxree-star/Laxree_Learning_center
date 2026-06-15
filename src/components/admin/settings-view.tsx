'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Settings, Save, Check, Globe, Bell, Database, Shield, Mail, Clock } from 'lucide-react'

interface PlatformSetting {
  id: string
  key: string
  value: string
  category: string | null
}

export function SettingsView() {
  const user = useAuthStore((s) => s.user)
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [, startTransition] = useTransition()

  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'LAXREE Academy',
    supportEmail: 'support@laxree.com',
    defaultLanguage: 'English',
    timezone: 'Asia/Kolkata',
  })

  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    certificationReminders: true,
    courseDeadlines: true,
    weeklyDigest: true,
    newCourseAlerts: true,
  })

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.settings) {
        startTransition(() => {
          setSettings(data.settings)
          setLoading(false)
        })
      } else {
        startTransition(() => setLoading(false))
      }
    } catch {
      startTransition(() => setLoading(false))
    }
  }, [startTransition])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'platform_name', value: generalSettings.platformName, category: 'general', updatedBy: user?.id }),
        }),
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'support_email', value: generalSettings.supportEmail, category: 'general', updatedBy: user?.id }),
        }),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-600" />
            </div>
            Settings
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Platform configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save All</>}
        </Button>
      </div>

      {/* General Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600" /> General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input value={generalSettings.platformName} onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input type="email" value={generalSettings.supportEmail} onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Default Language</Label>
                <select className="w-full rounded-md border p-2 text-sm" value={generalSettings.defaultLanguage} onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <select className="w-full rounded-md border p-2 text-sm" value={generalSettings.timezone} onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-teal-600" /> Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications for important events' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Show browser push notifications' },
              { key: 'certificationReminders', label: 'Certification Reminders', desc: 'Remind users about expiring certifications' },
              { key: 'courseDeadlines', label: 'Course Deadline Alerts', desc: 'Notify users about upcoming course deadlines' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Send weekly activity summary to all users' },
              { key: 'newCourseAlerts', label: 'New Course Alerts', desc: 'Notify users when new courses are published' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={notifSettings[n.key as keyof typeof notifSettings]}
                  onCheckedChange={(v) => setNotifSettings({ ...notifSettings, [n.key]: v })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600" /> Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Force Password Reset</p>
                <p className="text-xs text-muted-foreground">Require all users to reset passwords on next login</p>
              </div>
              <Button variant="outline" size="sm">Reset All</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Session Timeout</p>
                <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <select className="rounded-md border p-2 text-sm">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Platform Settings from DB */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4 text-teal-600" /> Platform Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {settings.length > 0 ? settings.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{s.key}</p>
                    <p className="text-xs text-muted-foreground">Category: {s.category || 'general'}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{s.value}</Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No settings configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
