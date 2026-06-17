'use client'

import { useAuthStore } from '@/stores/auth-store'
import {
  LayoutDashboard, Users, Route, BookOpen, ClipboardCheck,
  MonitorPlay, FileText, Activity, Settings,
  TrendingUp, Sparkles, Brain, User, GraduationCap,
  ClipboardList, Upload, Phone, Bot, Mic,
  Construction,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_LABELS } from './sidebar-config'

// Super Admin Components
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { UserManagement } from '@/components/admin/user-management'
import { EmployeeMonitor } from '@/components/admin/employee-monitor'
import { AIDeploymentAdvisor } from '@/components/admin/ai-deployment-advisor'
import { LearningPathsView } from '@/components/admin/learning-paths-view'
import { CoursesView } from '@/components/admin/courses-view'
import { AssessmentsView } from '@/components/admin/assessments-view'
import { MockSimulationsView as AdminMockSimulationsView } from '@/components/admin/mock-simulations-view'
import { DocumentsView } from '@/components/admin/documents-view'
import { SettingsView } from '@/components/admin/settings-view'

// Employee Components
import { EmployeeDashboard } from '@/components/employee/employee-dashboard'
import { LearningCenter } from '@/components/employee/learning-center'
import { MyPerformance } from '@/components/employee/my-performance'
import { AICareerCenter } from '@/components/employee/ai-career-center'
import { MockSimulationsView } from '@/components/employee/mock-simulations'
import { ExamCenter } from '@/components/employee/exam-center'
import { AICoachView } from '@/components/employee/ai-coach'
import { MyProfileView } from '@/components/employee/my-profile'
import { UploadCenter } from '@/components/employee/upload-center'
import { CallPractice } from '@/components/employee/call-practice'
import { CallAnalysisView } from '@/components/employee/call-analysis'
import { AISimulation } from '@/components/employee/ai-simulation'
import { ScorecardsView } from '@/components/employee/scorecards-view'
import { CertificationsView } from '@/components/employee/certifications-view'

const ICON_MAP: Record<string, LucideIcon> = {
  'dashboard': LayoutDashboard,
  'employees': Users,
  'performance-monitor': Activity,
  'ai-deployment': Brain,
  'learning-paths': Route,
  'courses': BookOpen,
  'assessments': ClipboardCheck,
  'mock-simulations': MonitorPlay,
  'documents': FileText,
  'settings': Settings,
  'learning-center': GraduationCap,
  'exam-center': ClipboardList,
  'my-performance': TrendingUp,
  'ai-career-center': Sparkles,
  'ai-coach': Brain,
  'my-profile': User,
  'upload-center': Upload,
  'call-practice': Phone,
  'call-analysis': Mic,
  'ai-simulation': Bot,
}

const VIEW_TITLES: Record<string, string> = {
  'dashboard': 'Dashboard',
  'employees': 'Employees',
  'performance-monitor': 'Performance Monitor',
  'ai-deployment': 'AI Deployment Advisor',
  'learning-paths': 'Learning Paths',
  'courses': 'Courses & Modules',
  'assessments': 'Assessments',
  'mock-simulations': 'Mock Simulations',
  'documents': 'Documents',
  'settings': 'Settings',
  'learning-center': 'Learning Center',
  'exam-center': 'Exam Center',
  'my-performance': 'My Performance',
  'scorecards': 'Scorecards',
  'certifications': 'Certifications',
  'ai-career-center': 'AI Career Center',
  'ai-coach': 'AI Coach',
  'my-profile': 'My Profile',
  'upload-center': 'Upload Center',
  'call-practice': 'Call Practice',
  'call-analysis': 'Call Recording AI',
  'ai-simulation': 'AI Simulation',
}

const VIEW_DESCRIPTIONS: Record<string, string> = {
  'dashboard': 'Overview of your platform activity and key metrics',
  'employees': 'Create and manage employees, provide login credentials',
  'performance-monitor': 'Monitor employee performance, scores, and readiness',
  'ai-deployment': 'AI recommends whether employee should handle calls or go to field',
  'learning-paths': 'Create and manage learning paths for employees',
  'courses': 'Manage courses, modules, and content',
  'assessments': 'Create and manage assessments and tests',
  'mock-simulations': 'Set up and monitor mock sales simulations',
  'documents': 'Manage training documents and resources',
  'settings': 'Platform configuration and preferences',
  'learning-center': 'Browse and enroll in courses',
  'exam-center': 'Take certification exams and advance your career',
  'my-performance': 'Track your learning progress and scores',
  'scorecards': 'View detailed scorecards and rankings',
  'certifications': 'Manage certification programs and approvals',
  'ai-career-center': 'AI-powered career development recommendations',
  'ai-coach': 'Get personalized AI coaching and feedback',
  'my-profile': 'View and update your profile information',
  'upload-center': 'Upload and manage documents, catalogs, and resources',
  'call-practice': 'Practice sales calls with realistic scenarios',
  'call-analysis': 'Upload call recordings and get AI-powered sales coaching with pitch guidance',
  'ai-simulation': 'Chat with an AI sales simulator to sharpen your skills',
}

function PlaceholderView({ viewId }: { viewId: string }) {
  const user = useAuthStore((s) => s.user)
  const Icon = ICON_MAP[viewId] || LayoutDashboard
  const title = VIEW_TITLES[viewId] || 'Dashboard'
  const description = VIEW_DESCRIPTIONS[viewId] || 'Manage your platform'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-emerald-600" />
          </div>
          {title}
        </h1>
        <p className="text-gray-500 mt-1 ml-13">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-500 flex items-center gap-2">
            <Construction className="w-4 h-4 text-amber-500" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <Icon className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-400 max-w-md">
              This section is being built with detailed functionality for {ROLE_LABELS[user?.role || 'EMPLOYEE']} role.
              Check back soon for the full experience!
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Development in progress
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Super Admin view mapping
const ADMIN_VIEWS: Record<string, React.ComponentType> = {
  'dashboard': AdminDashboard,
  'employees': UserManagement,
  'performance-monitor': EmployeeMonitor,
  'ai-deployment': AIDeploymentAdvisor,
  'learning-paths': LearningPathsView,
  'courses': CoursesView,
  'assessments': AssessmentsView,
  'mock-simulations': AdminMockSimulationsView,
  'documents': DocumentsView,
  'settings': SettingsView,
}

// Employee view mapping
const EMPLOYEE_VIEWS: Record<string, React.ComponentType> = {
  'dashboard': EmployeeDashboard,
  'learning-center': LearningCenter,
  'exam-center': ExamCenter,
  'my-performance': MyPerformance,
  'scorecards': ScorecardsView,
  'certifications': CertificationsView,
  'ai-career-center': AICareerCenter,
  'mock-simulations': MockSimulationsView,
  'ai-coach': AICoachView,
  'my-profile': MyProfileView,
  'upload-center': UploadCenter,
  'call-practice': CallPractice,
  'call-analysis': CallAnalysisView,
  'ai-simulation': AISimulation,
}

export function ViewRenderer() {
  const currentView = useAuthStore((s) => s.currentView)
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  // Check for role-specific views
  if (role === 'SUPER_ADMIN') {
    const Component = ADMIN_VIEWS[currentView]
    if (Component) return <Component />
  }

  if (role === 'EMPLOYEE') {
    const Component = EMPLOYEE_VIEWS[currentView]
    if (Component) return <Component />
  }

  // Fallback to placeholder for unimplemented views
  return <PlaceholderView viewId={currentView} />
}
