'use client'

import { useAuthStore } from '@/stores/auth-store'
import { getSidebarItems, ROLE_LABELS } from './sidebar-config'
import { ViewRenderer } from './view-renderer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  Search,
  Settings,
  ChevronRight,
  Home,
  Sparkles,
  BookOpen,
  Brain,
  TrendingUp,
  UserCog,
  Activity,
  FileText,
  Shield,
  BarChart3,
  Users,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import React from 'react'

/* ──────────────────────────────────────────────────────────
   VIEW LABEL MAP – used for breadcrumb display
   ────────────────────────────────────────────────────────── */
const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  'performance-monitor': 'Performance Monitor',
  'ai-deployment': 'AI Deployment Advisor',
  'learning-paths': 'Learning Paths',
  courses: 'Courses & Modules',
  assessments: 'Assessments',
  'mock-simulations': 'Mock Simulations',
  documents: 'Documents',
  settings: 'Settings',
  'monitoring-center': 'Monitoring Center',
  reports: 'Reports & Analytics',
  'exam-management': 'Exam Management',
  scorecards: 'Scorecards',
  'stage-approvals': 'Stage Approvals',
  'question-banks': 'Question Banks',
  'video-management': 'Video Library',
  certifications: 'Certifications',
  departments: 'Departments',
  'audit-center': 'Audit Center',
  customization: 'Customization Center',
  'login-history': 'Login History',
  'learning-center': 'Learning Center',
  'exam-center': 'Exam Center',
  'my-performance': 'My Performance',
  'ai-career-center': 'AI Career Center',
  'call-practice': 'Call Practice',
  'call-analysis': 'Call Recording AI',
  'ai-simulation': 'AI Simulation',
  'ai-coach': 'AI Coach',
  'my-profile': 'My Profile',
}

/* ──────────────────────────────────────────────────────────
   ANIMATION VARIANTS
   ────────────────────────────────────────────────────────── */
const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
}

const groupLabelVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
}

/* ──────────────────────────────────────────────────────────
   NAV ITEM – extracted for DRY premium styling
   ────────────────────────────────────────────────────────── */
function NavItem({
  item,
  isActive,
  onClick,
  index,
}: {
  item: ReturnType<typeof getSidebarItems>[number]
  isActive: boolean
  onClick: () => void
  index: number
}) {
  return (
    <SidebarMenuItem key={item.view}>
      <SidebarMenuButton
        isActive={isActive}
        onClick={onClick}
        tooltip={item.label}
        className={`
          group relative transition-all duration-300 ease-out rounded-lg
          ${isActive
            ? 'bg-white/[0.12] text-white font-semibold backdrop-blur-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
            : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
          }
        `}
      >
        {/* Active left indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <item.icon
          className={`w-[18px] h-[18px] transition-all duration-300 ${
            isActive
              ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(110,231,183,0.4)]'
              : 'text-white/40 group-hover:text-white/70'
          }`}
        />
        <span className="transition-all duration-300">{item.label}</span>
        {item.badge && (
          <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 py-0 h-4 shadow-sm border-0 font-semibold">
            {item.badge}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/* ──────────────────────────────────────────────────────────
   SIDEBAR NAV
   ────────────────────────────────────────────────────────── */
function SidebarNav() {
  const user = useAuthStore((s) => s.user)
  const currentView = useAuthStore((s) => s.currentView)
  const setCurrentView = useAuthStore((s) => s.setCurrentView)
  const items = getSidebarItems(user?.role || 'EMPLOYEE')

  // Group items based on role
  let groups: { label: string; items: typeof items; icon: any }[]

  if (user?.role === 'SUPER_ADMIN' || user?.role === 'TRAINING_MANAGER' || user?.role === 'TEAM_LEADER') {
    // Admin-style grouping — boss view with full control
    const overviewItems = items.filter(i => ['dashboard', 'monitoring-center'].includes(i.view))
    const peopleItems = items.filter(i => ['employees', 'departments', 'performance-monitor', 'login-history'].includes(i.view))
    const contentItems = items.filter(i => ['learning-paths', 'courses', 'assessments', 'exam-management', 'question-banks', 'mock-simulations', 'video-management', 'documents'].includes(i.view))
    const approvalItems = items.filter(i => ['stage-approvals', 'scorecards', 'certifications'].includes(i.view))
    const analyticsItems = items.filter(i => ['reports', 'audit-center'].includes(i.view))
    const aiItems = items.filter(i => ['ai-deployment'].includes(i.view))
    const configItems = items.filter(i => ['customization', 'settings'].includes(i.view))

    groups = [
      { label: 'Overview', items: overviewItems, icon: Home },
      { label: 'People', items: peopleItems, icon: Users },
      { label: 'Learning Content', items: contentItems, icon: BookOpen },
      { label: 'Approvals', items: approvalItems, icon: Shield },
      { label: 'Analytics', items: analyticsItems, icon: BarChart3 },
      { label: 'AI Tools', items: aiItems, icon: Brain },
      { label: 'Config', items: configItems, icon: Settings },
    ].filter(g => g.items.length > 0)
  } else {
    // Employee-style grouping
    const overviewItems = items.filter(i => ['dashboard', 'my-performance'].includes(i.view))
    const learningItems = items.filter(i => ['learning-center', 'exam-center', 'mock-simulations'].includes(i.view))
    const aiItems = items.filter(i => ['ai-career-center', 'ai-simulation', 'ai-coach', 'call-practice', 'call-analysis'].includes(i.view))
    const progressItems = items.filter(i => ['scorecards', 'certifications'].includes(i.view))
    const accountItems = items.filter(i => ['my-profile'].includes(i.view))

    groups = [
      { label: 'Overview', items: overviewItems, icon: Home },
      { label: 'Learning', items: learningItems, icon: BookOpen },
      { label: 'AI Tools', items: aiItems, icon: Brain },
      { label: 'Progress', items: progressItems, icon: TrendingUp },
      { label: 'Account', items: accountItems, icon: Settings },
    ].filter(g => g.items.length > 0)
  }

  let globalIndex = 0

  return (
    <>
      {groups.map((group, groupIdx) => (
        <SidebarGroup key={group.label} className="py-1">
          <motion.div
            custom={globalIndex}
            variants={groupLabelVariants}
            initial="hidden"
            animate="visible"
          >
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-bold px-3 mb-0.5 select-none">
              {group.label}
            </SidebarGroupLabel>
          </motion.div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                const idx = globalIndex++
                const isActive = currentView === item.view
                return (
                  <motion.div
                    key={item.view}
                    custom={idx}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <NavItem
                      item={item}
                      isActive={isActive}
                      onClick={() => setCurrentView(item.view)}
                      index={idx}
                    />
                  </motion.div>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
          {groupIdx < groups.length - 1 && (
            <div className="mx-4 my-2">
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>
          )}
        </SidebarGroup>
      ))}
    </>
  )
}

/* ──────────────────────────────────────────────────────────
   TOP BAR
   ────────────────────────────────────────────────────────── */
function TopBar() {
  const user = useAuthStore((s) => s.user)
  const currentView = useAuthStore((s) => s.currentView)
  const logout = useAuthStore((s) => s.logout)
  const { toggleSidebar } = useSidebar()
  const [searchFocused, setSearchFocused] = React.useState(false)

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U'

  const roleLabel = ROLE_LABELS[user?.role || 'EMPLOYEE']
  const viewLabel = VIEW_LABELS[currentView] || currentView

  return (
    <header className="flex h-[52px] items-center gap-2 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Sidebar Toggle */}
      <SidebarTrigger className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 transition-all duration-200 rounded-lg h-8 w-8">
        <Menu className="w-[18px] h-[18px]" />
      </SidebarTrigger>

      <Separator orientation="vertical" className="h-5 bg-gray-200/60" />

      {/* Breadcrumb */}
      <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0">
        <span className="text-gray-400 font-medium text-xs">LAXREE</span>
        <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
        <AnimatePresence mode="wait">
          <motion.span
            key={currentView}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-gray-700 font-semibold text-xs truncate"
          >
            {viewLabel}
          </motion.span>
        </AnimatePresence>
      </nav>

      <div className="flex-1" />

      {/* Search Bar */}
      <div
        className={`
          hidden md:flex items-center gap-2 rounded-xl px-3.5 py-1.5 flex-1 max-w-xs transition-all duration-300 ease-out
          ${searchFocused
            ? 'bg-white ring-2 ring-emerald-500/20 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
            : 'bg-gray-100/70 hover:bg-gray-100'
          }
        `}
      >
        <Search className={`w-4 h-4 transition-colors duration-200 ${searchFocused ? 'text-emerald-500' : 'text-gray-400'}`} />
        <Input
          placeholder="Search courses, assessments..."
          className="border-0 bg-transparent p-0 h-6 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {!searchFocused && (
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 leading-none">
            ⌘K
          </kbd>
        )}
      </div>

      <div className="flex-1 md:hidden" />

      {/* Notification Bell */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/60 transition-all duration-200 h-8 w-8 rounded-xl"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[9px] font-bold text-white ring-2 ring-white shadow-sm">
              3
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 shadow-xl border-0 rounded-xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
            <p className="text-white font-semibold text-sm">Notifications</p>
            <p className="text-emerald-200 text-xs">You have 3 unread messages</p>
          </div>
          <div className="p-2">
            <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">New assessment available</span>
                <span className="text-xs text-gray-400">2 minutes ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Course completion certificate</span>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Performance review scheduled</span>
                <span className="text-xs text-gray-400">Yesterday</span>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-8 px-2 hover:bg-gray-100/70 transition-all duration-200 rounded-xl"
          >
            <Avatar className="h-7 w-7 ring-2 ring-emerald-500/20 shadow-sm">
              <AvatarImage src={user?.profilePhoto || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-semibold text-gray-700 leading-tight">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[9px] text-gray-400 leading-tight font-semibold uppercase tracking-wider">
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 shadow-xl border-0 rounded-xl p-0 overflow-hidden">
          {/* User header with gradient */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/20 shadow-lg">
                <AvatarImage src={user?.profilePhoto || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-sm font-bold backdrop-blur-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-xs text-emerald-200/80 truncate">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          <div className="p-1.5">
            <div className="flex items-center gap-2 px-2.5 py-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 rounded-md px-2 py-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{roleLabel}</span>
              </div>
            </div>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

/* ──────────────────────────────────────────────────────────
   APP SIDEBAR
   ────────────────────────────────────────────────────────── */
function AppSidebar() {
  const user = useAuthStore((s) => s.user)

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <Sidebar className="border-r-0 shadow-2xl shadow-black/10">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a3d2e] via-[#064e3b] to-[#052e23] pointer-events-none" />
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Header */}
        <SidebarHeader className="p-4 pb-2">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-105">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-extrabold text-white tracking-tight leading-none">
                LAXREE
              </span>
              <span className="text-[8px] text-emerald-400/50 uppercase tracking-[0.25em] font-bold mt-0.5">
                Academy Platform
              </span>
            </div>
          </div>
        </SidebarHeader>

        {/* Separator */}
        <div className="mx-4 my-1">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Navigation */}
        <SidebarContent className="px-2 py-1 sidebar-scroll overflow-y-auto">
          <SidebarNav />
        </SidebarContent>

        {/* Footer with User Profile */}
        <SidebarFooter className="p-3 pt-0">
          <div className="mx-1 mb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-all duration-300 cursor-default">
            <div className="relative">
              <Avatar className="h-8 w-8 ring-2 ring-emerald-400/20 shadow-sm">
                <AvatarImage src={user?.profilePhoto || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500/40 to-teal-500/40 text-emerald-100 text-[10px] font-bold backdrop-blur-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#064e3b] shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-white/90 truncate leading-tight">
                {user?.fullName || 'User'}
              </span>
              <span className="text-[9px] text-emerald-400/40 truncate font-semibold uppercase tracking-wider leading-tight mt-0.5">
                {ROLE_LABELS[user?.role || 'EMPLOYEE']}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </div>

      <SidebarRail className="after:bg-white/10 hover:after:bg-white/20" />
    </Sidebar>
  )
}

/* ──────────────────────────────────────────────────────────
   APP SHELL
   ────────────────────────────────────────────────────────── */
export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50">
          <div className="p-4 sm:p-6 lg:p-8">
            <ViewRenderer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
