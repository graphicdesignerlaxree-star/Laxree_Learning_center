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
  Phone,
  Bot,
  Mic,
  // New icons for boss view
  Shield,
  BarChart3,
  Award,
  Video,
  Building2,
  ScrollText,
  History,
  Palette,
  Gauge,
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
  // Overview
  { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'Monitoring Center', view: 'monitoring-center', icon: Gauge },

  // People
  { label: 'Employees', view: 'employees', icon: Users },
  { label: 'Departments', view: 'departments', icon: Building2 },
  { label: 'Performance Monitor', view: 'performance-monitor', icon: Activity },
  { label: 'Login History', view: 'login-history', icon: History },

  // Learning Content
  { label: 'Learning Paths', view: 'learning-paths', icon: Route },
  { label: 'Courses & Modules', view: 'courses', icon: BookOpen },
  { label: 'Assessments', view: 'assessments', icon: ClipboardCheck },
  { label: 'Exam Management', view: 'exam-management', icon: ClipboardList },
  { label: 'Question Banks', view: 'question-banks', icon: BookOpen },
  { label: 'Mock Simulations', view: 'mock-simulations', icon: MonitorPlay },
  { label: 'Video Library', view: 'video-management', icon: Video },
  { label: 'Documents', view: 'documents', icon: FileText },

  // Approvals & Scorecards
  { label: 'Stage Approvals', view: 'stage-approvals', icon: Shield },
  { label: 'Scorecards', view: 'scorecards', icon: Award },
  { label: 'Certifications', view: 'certifications', icon: Sparkles },

  // Analytics & Audit
  { label: 'Reports', view: 'reports', icon: BarChart3 },
  { label: 'Audit Center', view: 'audit-center', icon: ScrollText },

  // AI Tools
  { label: 'AI Deployment Advisor', view: 'ai-deployment', icon: Brain },

  // Config
  { label: 'Customization', view: 'customization', icon: Palette },
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
