'use client'

import {
  LayoutDashboard,
  Users,
  Route,
  BookOpen,
  ClipboardCheck,
  MonitorPlay,
  FileText,
  Activity,
  Brain,
  Settings,
  TrendingUp,
  GraduationCap,
  Sparkles,
  User,
  ClipboardList,
  Upload,
  Phone,
  Bot,
  Mic,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/stores/auth-store'

export interface SidebarItem {
  label: string
  view: string
  icon: LucideIcon
  badge?: string
}

const SUPER_ADMIN_ITEMS: SidebarItem[] = [
  { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'Employees', view: 'employees', icon: Users },
  { label: 'Performance Monitor', view: 'performance-monitor', icon: Activity },
  { label: 'AI Deployment Advisor', view: 'ai-deployment', icon: Brain },
  { label: 'Learning Paths', view: 'learning-paths', icon: Route },
  { label: 'Courses & Modules', view: 'courses', icon: BookOpen },
  { label: 'Assessments', view: 'assessments', icon: ClipboardCheck },
  { label: 'Mock Simulations', view: 'mock-simulations', icon: MonitorPlay },
  { label: 'Documents', view: 'documents', icon: FileText },
  { label: 'Settings', view: 'settings', icon: Settings },
]

const EMPLOYEE_ITEMS: SidebarItem[] = [
  { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'Learning Center', view: 'learning-center', icon: GraduationCap },
  { label: 'Exam Center', view: 'exam-center', icon: ClipboardList },
  { label: 'My Performance', view: 'my-performance', icon: TrendingUp },
  { label: 'Scorecards', view: 'scorecards', icon: TrendingUp },
  { label: 'Certifications', view: 'certifications', icon: Sparkles },
  { label: 'AI Career Center', view: 'ai-career-center', icon: Sparkles },
  { label: 'Mock Simulations', view: 'mock-simulations', icon: MonitorPlay },
  { label: 'Upload Center', view: 'upload-center', icon: Upload },
  { label: 'Call Practice', view: 'call-practice', icon: Phone },
  { label: 'Call Recording AI', view: 'call-analysis', icon: Mic },
  { label: 'AI Simulation', view: 'ai-simulation', icon: Bot },
  { label: 'AI Coach', view: 'ai-coach', icon: Brain },
  { label: 'My Profile', view: 'my-profile', icon: User },
]

export function getSidebarItems(role: Role): SidebarItem[] {
  switch (role) {
    case 'SUPER_ADMIN':
      return SUPER_ADMIN_ITEMS
    case 'EMPLOYEE':
      return EMPLOYEE_ITEMS
    default:
      return EMPLOYEE_ITEMS
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  EMPLOYEE: 'Employee',
}
