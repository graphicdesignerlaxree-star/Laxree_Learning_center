'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Users, Search, Plus, MoreHorizontal, Edit2, Trash2, Ban, Key, Shield,
  UserCheck, ChevronLeft, ChevronRight, Copy, Check, Lock,
  GraduationCap, MapPin, Phone, Sparkles, BookOpen,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

interface UserData {
  id: string
  email: string
  fullName: string | null
  role: string
  departmentId: string | null
  designation: string | null
  employeeId: string | null
  isActive: boolean
  isSuspended: boolean
  isFirstLogin: boolean
  aiReadinessScore: number
  department?: { name: string } | null
  _count?: { enrollments: number; assessmentAttempts: number; certificationAttempts: number }
}

interface Department {
  id: string
  name: string
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-emerald-100 text-emerald-700',
  EMPLOYEE: 'bg-gray-100 text-gray-700',
}

function generatePassword(length = 8): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  return pwd
}

function generateEmployeeId(existingUsers: UserData[]): string {
  const existingIds = existingUsers
    .map(u => u.employeeId)
    .filter(Boolean)
    .map(id => {
      const match = id?.match(/EMP(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
  const maxNum = existingIds.length > 0 ? Math.max(...existingIds) : 0
  const nextNum = maxNum + 1
  return `EMP${String(nextNum).padStart(3, '0')}`
}

export function UserManagement() {
  const user = useAuthStore((s) => s.user)
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const PAGE_SIZE = 10

  // Dialog states
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()

  // Form state
  const [form, setForm] = useState({
    email: '', fullName: '', role: 'EMPLOYEE', departmentId: '', designation: '', employeeId: '', mobileNumber: '',
  })

  // Auto-generated credentials for display
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; employeeId: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter !== 'all') params.set('role', roleFilter)
    if (deptFilter !== 'all') params.set('departmentId', deptFilter)
    try {
      const res = await fetch(`/api/users?${params.toString()}`)
      const data = await res.json()
      if (data.users) {
        startTransition(() => {
          setUsers(data.users)
          setTotalPages(Math.ceil(data.users.length / PAGE_SIZE))
          setLoading(false)
        })
      }
    } catch { /* ignore */ }
  }, [search, roleFilter, deptFilter, startTransition])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments')
      const data = await res.json()
      if (data.departments) {
        startTransition(() => {
          setDepartments(data.departments.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })))
        })
      }
    } catch { /* ignore */ }
  }, [startTransition])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchDepartments() }, [fetchDepartments])

  const autoEnrollEmployee = async (userId: string, departmentId?: string) => {
    try {
      // Fetch all active required courses
      const coursesRes = await fetch('/api/courses')
      if (!coursesRes.ok) return
      const coursesData = await coursesRes.json()
      const courses = coursesData.courses || []

      // Auto-enroll in required courses
      const requiredCourses = courses.filter((c: any) => c.isRequired !== false && c.isActive !== false)
      for (const course of requiredCourses) {
        try {
          await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, courseId: course.id }),
          })
        } catch { /* enrollment failed for this course, continue */ }
      }

      // If department is assigned, also enroll in department-specific courses
      if (departmentId) {
        const deptCourses = courses.filter((c: any) => c.departmentId === departmentId && c.isActive !== false)
        for (const course of deptCourses) {
          try {
            await fetch('/api/courses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, courseId: course.id }),
            })
          } catch { /* enrollment failed for this course, continue */ }
        }
      }

      toast({ title: 'Auto-Enrolled', description: `Employee enrolled in ${requiredCourses.length} required courses` })
    } catch { /* auto-enrollment failed silently */ }
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const password = generatedPassword
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, createdBy: user?.id, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create user', variant: 'destructive' })
        setSaving(false)
        return
      }

      // Auto-enroll if EMPLOYEE role
      if (form.role === 'EMPLOYEE' && data.user?.id) {
        await autoEnrollEmployee(data.user.id, form.departmentId || undefined)
      }

      setShowCreate(false)
      // Show credentials dialog
      setCreatedCredentials({ email: form.email, password, employeeId: form.employeeId })
      setShowCredentials(true)
      setForm({ email: '', fullName: '', role: 'EMPLOYEE', departmentId: '', designation: '', employeeId: '', mobileNumber: '' })
      setGeneratedPassword('')
      fetchUsers()
    } catch {
      toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, ...form, updatedBy: user?.id }),
      })
      setShowEdit(false)
      setSelectedUser(null)
      fetchUsers()
    } catch { /* ignore */ }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await fetch(`/api/users?id=${selectedUser.id}&adminId=${user?.id}`, { method: 'DELETE' })
      setShowDelete(false)
      setSelectedUser(null)
      fetchUsers()
    } catch { /* ignore */ }
    setSaving(false)
  }

  const toggleSuspend = async (u: UserData) => {
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, isSuspended: !u.isSuspended, isActive: u.isSuspended, updatedBy: user?.id }),
      })
      fetchUsers()
    } catch { /* ignore */ }
  }

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return
    setSaving(true)
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id, password: newPassword, updatedBy: user?.id }),
      })
      toast({ title: 'Password Changed', description: `Password updated for ${selectedUser.fullName || selectedUser.email}` })
      setShowChangePassword(false)
      setSelectedUser(null)
      setNewPassword('')
    } catch {
      toast({ title: 'Error', description: 'Failed to change password', variant: 'destructive' })
    }
    setSaving(false)
  }

  const resetPassword = async (u: UserData) => {
    const newPwd = generatePassword()
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, password: newPwd, isFirstLogin: true, updatedBy: user?.id }),
      })
      setCreatedCredentials({ email: u.email, password: newPwd, employeeId: u.employeeId || '' })
      setShowCredentials(true)
      fetchUsers()
    } catch { /* ignore */ }
  }

  const openEdit = (u: UserData) => {
    setSelectedUser(u)
    setForm({
      email: u.email, fullName: u.fullName || '', role: u.role,
      departmentId: u.departmentId || '', designation: u.designation || '',
      employeeId: u.employeeId || '', mobileNumber: '',
    })
    setShowEdit(true)
  }

  const openCreate = () => {
    const nextId = generateEmployeeId(users)
    const pwd = generatePassword()
    setForm({ email: `${nextId.toLowerCase()}@laxree.com`, fullName: '', role: 'EMPLOYEE', departmentId: '', designation: '', employeeId: nextId, mobileNumber: '' })
    setGeneratedPassword(pwd)
    setShowCreate(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const paginatedUsers = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            Employees
          </h1>
          <p className="text-gray-500 mt-1 ml-13">Create and manage employees, provide login credentials</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Create Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search by name, email, or employee ID..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(0) }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden lg:table-cell">Designation</TableHead>
                    <TableHead className="hidden lg:table-cell">Readiness</TableHead>
                    <TableHead className="hidden sm:table-cell">Enrolled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                    </TableRow>
                  ) : paginatedUsers.map(u => (
                    <TableRow key={u.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.aiReadinessScore >= 70 ? 'bg-emerald-100 text-emerald-700' : u.aiReadinessScore >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {(u.fullName || u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.fullName || 'No name'}</p>
                            <p className="text-xs text-muted-foreground">{u.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'} variant="secondary">
                          {u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{u.department?.name || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{u.designation || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={u.aiReadinessScore} className="w-12 h-1.5" />
                          <span className={`text-xs font-medium ${u.aiReadinessScore >= 70 ? 'text-emerald-600' : u.aiReadinessScore >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                            {Math.round(u.aiReadinessScore)}%
                          </span>
                          {u.aiReadinessScore >= 70 && <MapPin className="w-3 h-3 text-emerald-500" />}
                          {u.aiReadinessScore >= 40 && u.aiReadinessScore < 70 && <Phone className="w-3 h-3 text-teal-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <GraduationCap className="w-3 h-3" />
                          {u._count?.enrollments || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.isSuspended ? (
                          <Badge variant="destructive" className="text-xs">Suspended</Badge>
                        ) : !u.isActive ? (
                          <Badge variant="secondary" className="text-xs bg-gray-200">Inactive</Badge>
                        ) : u.isFirstLogin ? (
                          <Badge className="text-xs bg-amber-100 text-amber-700">Pending Setup</Badge>
                        ) : (
                          <Badge className="text-xs bg-emerald-100 text-emerald-700">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Edit2 className="w-4 h-4 mr-2" /> Edit User
                            </DropdownMenuItem>
                            {u.role === 'EMPLOYEE' && (
                              <DropdownMenuItem onClick={() => autoEnrollEmployee(u.id, u.departmentId || undefined)}>
                                <GraduationCap className="w-4 h-4 mr-2" /> Re-enroll in Courses
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => toggleSuspend(u)}>
                              {u.isSuspended ? <><UserCheck className="w-4 h-4 mr-2" /> Unsuspend</> : <><Ban className="w-4 h-4 mr-2" /> Suspend</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(u); setNewPassword(''); setShowChangePassword(true) }}>
                              <Lock className="w-4 h-4 mr-2" /> Change Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => resetPassword(u)}>
                              <Key className="w-4 h-4 mr-2" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(u); setShowDelete(true) }} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, users.length)} of {users.length} users
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Create Employee Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Create New Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Enter full name" />
            </div>
            <div className="grid gap-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="emp011@laxree.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Designation</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Sales Executive" />
              </div>
              <div className="grid gap-2">
                <Label>Employee ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="Auto-generated" />
              </div>
            </div>
            {/* Generated credentials display */}
            {generatedPassword && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-800">Generated Login Credentials</p>
                <p className="text-xs text-emerald-600">Share these credentials with the employee. The password will only be shown once after creation.</p>
                <div className="flex items-center gap-2 bg-white rounded-md border px-3 py-2">
                  <span className="text-sm font-mono flex-1">Password: <strong>{generatedPassword}</strong></span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(generatedPassword)}>
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </Button>
                </div>
              </div>
            )}
            {/* Auto-enrollment info */}
            {form.role === 'EMPLOYEE' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Auto-Enrollment</p>
                  <p className="text-[10px] text-amber-600">This employee will be automatically enrolled in all required courses and department-specific courses upon creation.</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.email || !form.fullName} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5 text-emerald-600" /> Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Designation</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Employee ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-emerald-600" /> Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.fullName || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>New Password *</Label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setNewPassword(generatePassword())}
            >
              Auto-generate password
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={saving || !newPassword} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Display Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Employee Login Credentials
            </DialogTitle>
            <DialogDescription>
              Share these credentials with the employee. This is the only time the password will be visible.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="py-4 space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-emerald-600 font-medium">Employee ID</p>
                  <div className="flex items-center gap-2 bg-white rounded-md border px-3 py-2">
                    <span className="text-sm font-mono flex-1">{createdCredentials.employeeId}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(createdCredentials.employeeId)}>
                      <Copy className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-600 font-medium">Email</p>
                  <div className="flex items-center gap-2 bg-white rounded-md border px-3 py-2">
                    <span className="text-sm font-mono flex-1">{createdCredentials.email}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(createdCredentials.email)}>
                      <Copy className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-600 font-medium">Password</p>
                  <div className="flex items-center gap-2 bg-white rounded-md border px-3 py-2">
                    <span className="text-sm font-mono flex-1 font-bold">{createdCredentials.password}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(createdCredentials.password)}>
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const text = `Login Credentials for LAXREE Academy\nEmployee ID: ${createdCredentials.employeeId}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\n\nURL: https://laxree-academy.com`
                  copyToClipboard(text)
                  toast({ title: 'Copied!', description: 'Credentials copied to clipboard' })
                }}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy All Credentials
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCredentials(false)} className="bg-emerald-600 hover:bg-emerald-700">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" /> Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            Are you sure you want to delete <strong>{selectedUser?.fullName || selectedUser?.email}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} variant="destructive">
              {saving ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
