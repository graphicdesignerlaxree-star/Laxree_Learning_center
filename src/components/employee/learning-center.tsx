'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Building2, Package, Wrench, TrendingUp, Hotel, Search,
  Handshake, Eye, MapPin, PhoneIncoming, Award, MonitorPlay,
  Brain, ChevronRight, ArrowLeft, CheckCircle2, Circle,
  Play, FileText, Video, BookOpen, Download, FolderOpen,
  ClipboardCheck, Lock, Coffee, KeyRound, Wind, Key,
  BedDouble, Paintbrush, DoorOpen, ShieldCheck, Sparkles, X,
  ExternalLink, FileDown, BookMarked, Trophy, RefreshCw,
  HelpCircle, MessageCircle, CirclePlay, Volume2, ShoppingCart,
  Shield, Refrigerator, Flame, ArrowRight, XCircle, Target,
  Lightbulb, RotateCcw, Clock
} from 'lucide-react'
import { ModuleQuiz } from './module-quiz'
import { LessonViewer } from './lesson-viewer'

// ==================== TYPES ====================

interface ModuleData {
  id: string
  title: string
  description?: string
  content?: string
  contentType?: string
  contentUrl?: string
  pdfUrl?: string
  order: number
  duration?: number
  completed?: boolean
  score?: number | null
  productCategoryId?: string | null
}

interface CourseData {
  id: string
  title: string
  description?: string
  moduleType: string
  duration?: number
  modules: ModuleData[]
  enrollment?: {
    courseId: string
    progress: number
    status: string
  } | null
}

interface CatalogDoc {
  id: string
  title: string
  type: string
  fileUrl: string
  fileName: string
  fileSize?: number
  category?: string
}

interface QuizData {
  id: string
  title: string
  description?: string
  duration?: number
  passingScore: number
  totalQuestions: number
  questions: Array<{
    id: string
    question: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    explanation: string
    marks: number
  }>
}

interface QuizResult {
  id: string
  score: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  wrongAnswers: number
  answerDetails: Array<{
    questionId: string
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string
  }>
}

// ==================== ACADEMY CONFIG ====================

const ACADEMIES = [
  { type: 'ORIENTATION', title: 'Company Introduction', emoji: '🏢', icon: Building2,
    description: 'Learn about LAXREE\'s mission, values, and company culture',
    gradient: 'from-emerald-500 to-emerald-700', bgLight: 'bg-emerald-50', color: 'emerald' },
  { type: 'PRODUCT_ACADEMY', title: 'LAXREE Product Academy', emoji: '📦', icon: Package,
    description: 'Master our product portfolio — Minibar, Kettle, Safe Locker & more',
    gradient: 'from-teal-500 to-teal-700', bgLight: 'bg-teal-50', color: 'teal' },
  { type: 'TECHNICAL', title: 'Technical Learning', emoji: '🔧', icon: Wrench,
    description: 'Technical skills, tools, and system proficiency',
    gradient: 'from-cyan-500 to-cyan-700', bgLight: 'bg-cyan-50', color: 'cyan' },
  { type: 'SALES_ACADEMY', title: 'Sales Academy', emoji: '📈', icon: TrendingUp,
    description: 'Sales methodologies, objection handling, and follow-up systems',
    gradient: 'from-amber-500 to-amber-700', bgLight: 'bg-amber-50', color: 'amber' },
  { type: 'HOSPITALITY', title: 'Hospitality Industry Academy', emoji: '🏨', icon: Hotel,
    description: 'Industry-specific knowledge for hospitality sector',
    gradient: 'from-rose-500 to-rose-700', bgLight: 'bg-rose-50', color: 'rose' },
  { type: 'CUSTOMER_DISCOVERY', title: 'Customer Discovery Academy', emoji: '🔍', icon: Search,
    description: 'Understanding customer needs and discovery techniques',
    gradient: 'from-violet-500 to-violet-700', bgLight: 'bg-violet-50', color: 'violet' },
  { type: 'NEGOTIATION', title: 'Negotiation Academy', emoji: '🤝', icon: Handshake,
    description: 'Negotiation skills, strategies, and frameworks',
    gradient: 'from-orange-500 to-orange-700', bgLight: 'bg-orange-50', color: 'orange' },
  { type: 'COMPETITIVE_INTELLIGENCE', title: 'Competitive Intelligence Academy', emoji: '👁️', icon: Eye,
    description: 'Market analysis and competitive positioning',
    gradient: 'from-sky-500 to-sky-700', bgLight: 'bg-sky-50', color: 'sky' },
  { type: 'FIELD_SALES', title: 'Field Sales Academy', emoji: '🗺️', icon: MapPin,
    description: 'On-ground sales tactics and field operations',
    gradient: 'from-lime-600 to-green-700', bgLight: 'bg-lime-50', color: 'lime' },
  { type: 'INBOUND_SALES', title: 'Inbound Sales Academy', emoji: '📞', icon: PhoneIncoming,
    description: 'Inbound sales handling and conversion strategies',
    gradient: 'from-fuchsia-500 to-fuchsia-700', bgLight: 'bg-fuchsia-50', color: 'fuchsia' },
  { type: 'CERTIFICATION_PREP', title: 'Certification Center', emoji: '🏆', icon: Award,
    description: 'Prepare for certifications and assessments',
    gradient: 'from-yellow-500 to-amber-600', bgLight: 'bg-yellow-50', color: 'yellow' },
  { type: 'MOCK_SIMULATOR', title: 'Mock Sales Simulator', emoji: '🎭', icon: MonitorPlay,
    description: 'Practice sales scenarios with AI-powered simulations',
    gradient: 'from-red-500 to-red-700', bgLight: 'bg-red-50', color: 'red' },
  { type: 'AI_COACH', title: 'AI Sales Coach', emoji: '🤖', icon: Brain,
    description: 'AI-powered coaching and personalized guidance',
    gradient: 'from-purple-500 to-purple-700', bgLight: 'bg-purple-50', color: 'purple' },
  { type: 'CROSS_SELLING', title: 'Cross Selling Academy', emoji: '🔄', icon: RefreshCw,
    description: 'Learn to pitch complementary products — when a client wants a Mini Bar, how to sell Safe Box, Kettle & more',
    gradient: 'from-emerald-600 to-teal-700', bgLight: 'bg-emerald-50', color: 'emerald' },
]

// ==================== STUDY MATERIALS DATA ====================

interface StudyChapter {
  id: string
  title: string
  icon: typeof BookOpen
  color: string
  bgColor: string
  borderColor: string
  description: string
  content: string[]
}

const STUDY_CHAPTERS: StudyChapter[] = [
  {
    id: 'ch1',
    title: 'Company Introduction',
    icon: Building2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Learn about LAXREE — a premium hotel amenities manufacturer serving the global hospitality industry.',
    content: [
      'LAXREE is a leading manufacturer and supplier of premium hotel amenities, dedicated to elevating the guest experience through innovative and reliable products.',
      'Our comprehensive product portfolio includes: Electronic Safe Boxes, RFID Door Locks, Minibars (Absorption & Compressor), Electric Kettles, Mirrors & Hair Dryers, Digital Signage Solutions, Dispensers, Luggage Racks, Hotel Hangers, Dustbins, Rollaway Beds, and various Add-on products.',
      'Target Market: LAXREE primarily serves hotels, resorts, serviced apartments, and the broader hospitality industry. Our clients range from boutique properties to international hotel chains.',
      'Mission: To provide world-class hotel amenities that combine cutting-edge technology with elegant design, ensuring both guest satisfaction and operational efficiency for hotel management.',
      'Quality Standards: All LAXREE products undergo rigorous quality testing and comply with international safety certifications including CE, RoHS, and ISO standards.',
    ],
  },
  {
    id: 'ch2',
    title: 'Product Knowledge — Safe Box',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Master the features, installation, and troubleshooting of LAXREE electronic safe boxes.',
    content: [
      'LAXREE electronic safes feature a digital keypad with LED display for easy code entry. The keypad supports 3-8 digit user codes and a master code for administrative override.',
      'Emergency Access: Each safe includes an override key hidden behind a removable panel, allowing access even if the code is forgotten or the electronics fail.',
      'Installation Requirements: Safes must be bolted to a solid surface using the pre-drilled anchor holes. Recommended installation on shelves or inside wardrobe cabinets at a height comfortable for guest access.',
      'Specifications: Available in multiple sizes (small, medium, large). Power: 4× AA batteries with average 12-month lifespan. Steel construction with 3mm door and 2mm body thickness.',
      'Troubleshooting — Forgotten Code: Use the master code (default: 1234) or the override key to access the safe. After access, the user code can be reset.',
      'Troubleshooting — Battery Replacement: When the low battery indicator appears, replace all 4 AA batteries promptly. The safe retains code memory during battery replacement for up to 30 seconds.',
      'Troubleshooting — Keypad Not Responding: Check battery connection and polarity. If the issue persists, use the override key and contact technical support.',
    ],
  },
  {
    id: 'ch3',
    title: 'Product Knowledge — RFID Door Lock',
    icon: KeyRound,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    description: 'Understand the RFID card-based access system, card hierarchy, and maintenance procedures.',
    content: [
      'LAXREE RFID Door Locks use 13.56MHz Mifare technology for secure, contactless room access. The system supports multiple card types with a strict hierarchy for access control.',
      'Card Hierarchy: (1) Master Card — Opens all locks in the property, used by management only. (2) Floor Card — Opens all rooms on a specific floor. (3) Guest Card — Opens only the assigned room during the stay period. (4) Emergency Card — Overrides all locks for emergency situations.',
      'Battery Life: Powered by 4× AA batteries with an average lifespan of 12-18 months depending on usage frequency (approximately 50,000 operations).',
      'Low Battery Indicator: The lock emits 5 short beeps and the LED flashes red when battery voltage drops below the threshold. The lock continues to function for approximately 200 more operations after the warning.',
      'Emergency Mechanical Key: Each lock has a hidden keyhole behind a removable cover plate. Mechanical keys are provided in a secure key box for emergency use when electronic systems fail.',
      'Installation: Fits standard door preparations (60mm backset). Mortise lock body with anti-panic exit function — the inside handle always allows free egress for guest safety.',
      'Software Integration: Compatible with major Property Management Systems (PMS) including Opera, Protel, and IDS through LAXREE\'s central encoding system.',
    ],
  },
  {
    id: 'ch4',
    title: 'Product Knowledge — Minibar',
    icon: Refrigerator,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Learn about absorption and compressor minibars, sensor technology, and par level management.',
    content: [
      'LAXREE offers two types of minibars: Absorption (silent operation, ideal for guest rooms) and Compressor (faster cooling, suitable for high-demand environments).',
      'Temperature Settings: Absorption minibars maintain 5-12°C range. Compressor minibars maintain 2-8°C range. Both types feature adjustable thermostats for precise temperature control.',
      'Sensor Technology: LAXREE smart minibars are equipped with weight sensors and infrared detectors that automatically track item removal and consumption. Data syncs with the PMS for automatic billing.',
      'Product Arrangement: Follow the standard par level layout — beverages on top shelf, snacks on middle shelf, and complementary items on bottom shelf. Each item has a designated sensor position.',
      'Par Level Management: Each room is stocked with a predefined par level (typically 8-12 items). Housekeeping must restock consumed items daily and report discrepancies through the management system.',
      'Maintenance: Clean interior surfaces monthly with mild detergent. Check door seals quarterly. Ensure minimum 10cm clearance from walls for proper ventilation on absorption models.',
      'Energy Saving: All LAXREE minibars use eco-friendly refrigerants (R600a) and meet energy efficiency Class A+ standards, consuming less than 0.8 kWh/day.',
    ],
  },
  {
    id: 'ch5',
    title: 'Product Knowledge — Electric Kettle',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Master safety features, specifications, maintenance, and common customer queries for kettles.',
    content: [
      'Safety Features: All LAXREE kettles feature auto shut-off when water reaches boiling point, boil-dry protection (automatically switches off when water level is too low), and a secure locking lid to prevent spills.',
      'Capacity Options: Available in 0.6L (compact), 0.8L (standard), and 1.0L (large) capacities to suit different room types and guest needs.',
      'Wattage Specifications: 0.6L: 700W | 0.8L: 900W | 1.0L: 1000W. All models feature 360° rotational base for easy handling and concealed heating elements for easy cleaning.',
      'Cleaning & Maintenance: Descale every 2-3 months using a vinegar solution (1:1 water:vinegar, boil, let sit 30 min, rinse thoroughly). Wipe exterior with damp cloth only — never immerse in water.',
      'Common Customer Queries: (1) "Kettle not switching on" — Check it\'s properly seated on the base and the lid is closed. (2) "Water tastes metallic" — Descale the kettle. (3) "Kettle leaks from bottom" — Check if overfilled beyond MAX line; if issue persists, replace the unit.',
      'Material Options: Stainless steel body (premium), food-grade PP plastic (standard), and glass body (luxury). All interior surfaces that contact water are BPA-free.',
    ],
  },
  {
    id: 'ch6',
    title: 'Sales Process',
    icon: ShoppingCart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Learn the complete LAXREE sales process from prospecting to closing deals with hotel clients.',
    content: [
      'Step 1 — Customer Discovery: Identify potential clients through hotel industry directories, trade shows (HOTELEX, Arabian Travel Market), and referrals. Research the property: room count, star rating, current supplier, and recent renovations.',
      'Step 2 — Needs Analysis: Schedule a discovery call or site visit. Ask key questions: How many rooms? What is the renovation timeline? What is the budget range? Are there specific brand standards to meet? What is the current pain point with existing amenities?',
      'Step 3 — Product Demonstration: Present LAXREE products in context. Use physical samples for safe boxes and door locks. Show video demonstrations for minibars and digital signage. Highlight key differentiators during each demo.',
      'Step 4 — Handling Objections: Common objections include: (a) "Price is higher than competitors" — Emphasize total cost of ownership, warranty, and after-sales support. (b) "We are happy with current supplier" — Highlight LAXREE\'s superior technology and customization options. (c) "Need to test first" — Offer a pilot program for 5-10 rooms.',
      'Step 5 — Proposal & Quotation: Prepare a detailed quotation with product specifications, unit pricing, volume discounts, delivery timeline, installation services, and warranty terms.',
      'Step 6 — Closing Strategies: For hotel procurement decisions, identify all stakeholders (GM, Housekeeping Director, IT Manager, Finance). Address each stakeholder\'s concerns individually. Offer flexible payment terms for large orders. Include a 2-year warranty extension as a closing incentive.',
    ],
  },
  {
    id: 'ch7',
    title: 'Competitive Intelligence',
    icon: TrendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Know the competitive landscape, LAXREE\'s unique advantages, and market positioning.',
    content: [
      'Key Competitors: (1) Saflok (Dormakaba) — Strong in door locks, limited product range. (2) Onity — Established lock brand, weak minibar and safe offerings. (3) Dometic — Minibar specialist, no locks or safes. (4) Assa Abloy — Premium locks, very high price point.',
      'LAXREE Unique Selling Propositions: (1) One-stop solution — Complete range of hotel amenities from a single supplier. (2) Integrated technology — Locks, safes, and minibars can share a single management platform. (3) Competitive pricing — 15-25% lower than premium European brands with comparable quality.',
      'Price Positioning: LAXREE occupies the "premium value" segment — higher quality than budget brands, more affordable than luxury European brands. This positioning resonates with 4-star and select 5-star properties.',
      'Value Proposition: Lower total cost of ownership through: (1) Longer warranty periods (3 years standard vs. 1-2 years industry average). (2) Free software updates for lock systems. (3) 24/7 technical support hotline. (4) On-site spare parts inventory for large orders.',
      'Market Trends: (1) Growing demand for smart room technology and IoT integration. (2) Contactless check-in/check-out driving RFID lock upgrades. (3) Sustainability focus increasing demand for energy-efficient minibars. (4) Post-pandemic emphasis on touchless dispensers and automated solutions.',
      'Opportunities: (1) New hotel constructions in Asia-Pacific and Middle East. (2) Renovation cycles for existing properties (every 7-10 years). (3) Government regulations mandating upgraded safety features in hotel rooms.',
    ],
  },
]

const VIDEO_CHAPTERS = [
  { title: 'Safe Box Installation & Operation', duration: '5:30', category: 'Safe Box', videoUrl: '/api/uploads?file=Safe_box.mp4' },
  { title: 'RFID Door Lock — Complete Guide', duration: '4:45', category: 'Door Lock', videoUrl: '/api/uploads?file=Rfid.mp4' },
  { title: 'Minibar — Setup & Management', duration: '6:15', category: 'Minibar', videoUrl: '/api/uploads?file=Minibar%20(1).mp4' },
  { title: 'Electric Kettle — Demo', duration: '3:20', category: 'Kettle', videoUrl: '/api/uploads?file=kettle%20(1).mp4' },
  { title: 'Mirror & Hair Dryer Guide', duration: '5:00', category: 'Mirror', videoUrl: '/api/uploads?file=mirror%20%26%20hair%20drayer.mp4' },
  { title: 'Digital Signage Solutions', duration: '4:30', category: 'Signage', videoUrl: '/api/uploads?file=Digital%20Signage_1.mp4' },
  { title: 'Housekeeping Trolley Setup', duration: '3:45', category: 'Housekeeping', videoUrl: '/api/uploads?file=Housekeeping.mp4' },
  { title: 'Dispenser Installation', duration: '4:00', category: 'Dispenser', videoUrl: '/api/uploads?file=dispencer.mp4' },
  { title: 'Luggage Rack & Accessories', duration: '3:30', category: 'Luggage', videoUrl: '/api/uploads?file=Luggage.mp4' },
  { title: 'Hotel Hangers Guide', duration: '2:45', category: 'Hangers', videoUrl: '/api/uploads?file=hanger%20(1).mp4' },
  { title: 'Dustbin Solutions', duration: '3:15', category: 'Dustbin', videoUrl: '/api/uploads?file=Dustbin.mp4' },
  { title: 'Rollaway Bed Setup', duration: '4:00', category: 'Bed', videoUrl: '/api/uploads?file=Rollaway%20Bed.mp4' },
  { title: 'Add-on Products', duration: '3:30', category: 'Add-ons', videoUrl: '/api/uploads?file=Add-ons.mp4' },
]

const FAQ_ITEMS = [
  {
    q: 'What is LAXREE?',
    a: 'LAXREE is a leading manufacturer and supplier of premium hotel amenities, dedicated to elevating the guest experience through innovative and reliable products. We provide a comprehensive range of hotel room equipment including safe boxes, RFID door locks, minibars, electric kettles, mirrors, hair dryers, digital signage, dispensers, luggage racks, hangers, dustbins, rollaway beds, and various add-on products.',
  },
  {
    q: 'What product categories does LAXREE offer?',
    a: 'LAXREE offers a complete range of hotel amenities: Safe Boxes (electronic with digital keypad), RFID Door Locks (13.56MHz Mifare technology), Minibars (absorption & compressor types), Electric Kettles (various capacities), Mirrors & Hair Dryers, Digital Signage Solutions, Dispensers (for shampoo, soap, lotion), Luggage Racks, Hotel Hangers, Dustbins, Rollaway Beds, and various Add-on products like weighing scales and shoe shine machines.',
  },
  {
    q: 'How do I reset a Safe Box code?',
    a: 'To reset a Safe Box code: (1) Open the safe using the current code or the master code (default: 1234). (2) Press and hold the "*" button for 3 seconds until you hear a beep. (3) Enter the new 3-8 digit code. (4) Press "#" to confirm. (5) Enter the new code again to verify. If the guest has forgotten their code, use the master code or the emergency override key to gain access first, then reset.',
  },
  {
    q: 'What happens when the RFID lock battery is low?',
    a: 'When the RFID lock battery is low: (1) The lock emits 5 short beeps and the LED flashes red during each operation. (2) The lock continues to function for approximately 200 more operations after the warning. (3) To replace, open the interior battery cover, remove the 4× AA batteries, and insert fresh ones within 30 seconds to maintain code memory. (4) If batteries die completely, use the emergency mechanical key to access the room.',
  },
  {
    q: 'How to maintain a minibar for optimal performance?',
    a: 'For optimal minibar performance: (1) Clean interior surfaces monthly with mild detergent and a soft cloth. (2) Check door seals quarterly for proper closure and replace if cracked. (3) Ensure minimum 10cm clearance from walls for proper ventilation (absorption models). (4) Descale compressor models every 6 months in hard water areas. (5) Verify temperature settings monthly — absorption: 5-12°C, compressor: 2-8°C. (6) Never use abrasive cleaners or sharp objects inside the minibar.',
  },
  {
    q: 'What is the warranty period for LAXREE products?',
    a: 'LAXREE offers a standard 3-year warranty on all products, which is significantly longer than the industry average of 1-2 years. This covers manufacturing defects and component failures under normal use. The warranty includes: free replacement of defective parts, on-site service for large installations, and free software updates for electronic products (locks, safes, digital signage). Extended warranty up to 5 years is available as a paid option.',
  },
  {
    q: 'How to handle a customer objection about pricing?',
    a: 'When a customer objects to pricing: (1) Acknowledge their concern professionally. (2) Shift the conversation to Total Cost of Ownership (TCO) — LAXREE\'s 3-year warranty means lower replacement and maintenance costs. (3) Highlight the integrated platform advantage — buying from one supplier saves procurement and integration costs. (4) Offer volume discounts for properties with 100+ rooms. (5) Present a side-by-side comparison showing LAXREE\'s value over a 5-year period. (6) Offer a pilot program for 5-10 rooms to prove quality before committing to a full order.',
  },
  {
    q: 'What are the key differentiators of LAXREE vs competitors?',
    a: 'Key LAXREE differentiators: (1) One-Stop Solution — Complete hotel amenities range from a single supplier, eliminating multi-vendor complexity. (2) Integrated Technology — Locks, safes, and minibars share a unified management platform. (3) Premium Value Positioning — 15-25% more affordable than European luxury brands with comparable quality. (4) Superior Warranty — 3-year standard vs. 1-2 year industry average. (5) 24/7 Support — Round-the-clock technical hotline. (6) Customization — Brand-specific finishes, colors, and logo engraving available.',
  },
]

interface PracticeQuestion {
  q: string
  options: string[]
  correct: number
  explanation: string
}

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    q: 'What is the default master code for LAXREE safe box?',
    options: ['1234', '0000', '9999', '1111'],
    correct: 0,
    explanation: 'The default master code is 1234, which should be changed during installation for security purposes.',
  },
  {
    q: 'RFID locks use which technology?',
    options: ['Bluetooth 5.0', 'NFC', 'RFID 13.56MHz Mifare', 'WiFi 802.11'],
    correct: 2,
    explanation: 'LAXREE RFID locks use 13.56MHz Mifare technology for secure, contactless room access.',
  },
  {
    q: 'What is the average battery life of an RFID door lock?',
    options: ['3-6 months', '6-9 months', '12-18 months', '24-36 months'],
    correct: 2,
    explanation: 'The RFID door lock battery lasts 12-18 months on average, supporting approximately 50,000 operations.',
  },
  {
    q: 'Which card type opens all locks in a hotel property?',
    options: ['Guest Card', 'Floor Card', 'Master Card', 'Emergency Card'],
    correct: 2,
    explanation: 'The Master Card opens all locks in the property and is reserved for management use only. The Emergency Card overrides locks but is for emergency situations.',
  },
  {
    q: 'What temperature range do absorption minibars maintain?',
    options: ['0-4°C', '5-12°C', '15-20°C', '2-8°C'],
    correct: 1,
    explanation: 'Absorption minibars maintain 5-12°C range. Compressor minibars maintain the colder 2-8°C range.',
  },
  {
    q: 'What safety feature prevents a kettle from operating without water?',
    options: ['Auto Shut-off', 'Boil-Dry Protection', 'Thermal Fuse', 'Pressure Valve'],
    correct: 1,
    explanation: 'Boil-Dry Protection automatically switches off the kettle when the water level is too low, preventing damage and safety hazards.',
  },
  {
    q: 'What is LAXREE\'s standard warranty period?',
    options: ['1 year', '2 years', '3 years', '5 years'],
    correct: 2,
    explanation: 'LAXREE offers a standard 3-year warranty on all products, significantly longer than the industry average of 1-2 years.',
  },
  {
    q: 'How many operations can an RFID lock perform after a low battery warning?',
    options: ['50 operations', '100 operations', '200 operations', '500 operations'],
    correct: 2,
    explanation: 'After the low battery warning (5 short beeps and red LED flash), the lock continues to function for approximately 200 more operations.',
  },
  {
    q: 'What is LAXREE\'s price positioning compared to European luxury brands?',
    options: ['50% higher', 'Same price', '15-25% lower', '40% lower'],
    correct: 2,
    explanation: 'LAXREE occupies the "premium value" segment, offering 15-25% lower pricing than premium European brands with comparable quality.',
  },
  {
    q: 'Which refrigerant do LAXREE minibars use?',
    options: ['R134a', 'R410A', 'R600a', 'R22'],
    correct: 2,
    explanation: 'All LAXREE minibars use eco-friendly R600a refrigerant, which has a low Global Warming Potential (GWP) and meets environmental regulations.',
  },
]

const VIDEO_CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Safe Box': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Door Lock': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'Minibar': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Kettle': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Mirror': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Signage': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Housekeeping': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Dispenser': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Luggage': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Hangers': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'Dustbin': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'Bed': { bg: 'bg-lime-100', text: 'text-lime-700' },
  'Add-ons': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
}

// Product module icon mapping
const MODULE_ICONS: Record<string, any> = {
  'mini bar': Coffee,
  'minibar': Coffee,
  'kettle': Coffee,
  'tcm': Coffee,
  'safe': Lock,
  'safe box': Lock,
  'rfid': Key,
  'lock': Key,
  'hair': Wind,
  'dryer': Wind,
  'mirror': Eye,
  'dispenser': Paintbrush,
  'mattress': BedDouble,
  'bed': BedDouble,
  'housekeeping': Paintbrush,
  'trolley': Paintbrush,
  'signage': MonitorPlay,
  'lobby': DoorOpen,
}

function getModuleIcon(title: string) {
  const lower = title.toLowerCase()
  for (const [key, icon] of Object.entries(MODULE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return BookOpen
}

// ==================== SKELETON ====================

function LearningSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  )
}

// ==================== STUDY MATERIALS SECTION ====================

function StudyMaterialsSection() {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<typeof VIDEO_CHAPTERS[0] | null>(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const [practiceIdx, setPracticeIdx] = useState(0)
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null)
  const [practiceRevealed, setPracticeRevealed] = useState(false)
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 })

  const openVideo = (video: typeof VIDEO_CHAPTERS[0]) => {
    setSelectedVideo(video)
    setVideoLoading(true)
    setVideoError(false)
    setVideoDialogOpen(true)
  }

  const handlePracticeAnswer = (optionIdx: number) => {
    if (practiceRevealed) return
    setPracticeAnswer(optionIdx)
    setPracticeRevealed(true)
    if (optionIdx === PRACTICE_QUESTIONS[practiceIdx].correct) {
      setPracticeScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }))
    } else {
      setPracticeScore((s) => ({ ...s, total: s.total + 1 }))
    }
  }

  const nextPracticeQuestion = () => {
    if (practiceIdx < PRACTICE_QUESTIONS.length - 1) {
      setPracticeIdx((i) => i + 1)
      setPracticeAnswer(null)
      setPracticeRevealed(false)
    }
  }

  const resetPracticeQuiz = () => {
    setPracticeIdx(0)
    setPracticeAnswer(null)
    setPracticeRevealed(false)
    setPracticeScore({ correct: 0, total: 0 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Study Materials</h2>
              <p className="text-white/80 text-sm">Prepare with comprehensive learning resources</p>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <Tabs defaultValue="study-guide" className="w-full">
            <div className="border-b px-4 pt-3">
              <TabsList className="h-10 bg-gray-100/80 w-full sm:w-auto">
                <TabsTrigger value="study-guide" className="gap-1.5 text-xs sm:text-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Study Guide</span>
                  <span className="sm:hidden">Guide</span>
                </TabsTrigger>
                <TabsTrigger value="video-chapters" className="gap-1.5 text-xs sm:text-sm">
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video Chapters</span>
                  <span className="sm:hidden">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="faq" className="gap-1.5 text-xs sm:text-sm">
                  <HelpCircle className="w-3.5 h-3.5" />
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="practice-quiz" className="gap-1.5 text-xs sm:text-sm">
                  <Brain className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Practice Quiz</span>
                  <span className="sm:hidden">Quiz</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab: Study Guide */}
            <TabsContent value="study-guide" className="p-4 mt-0">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  Product Knowledge Chapters
                </h3>
                <p className="text-sm text-gray-500 mt-1">Click on any chapter to expand its content</p>
              </div>
              <Accordion type="multiple" className="space-y-2">
                {STUDY_CHAPTERS.map((chapter, idx) => {
                  const Icon = chapter.icon
                  return (
                    <AccordionItem
                      key={chapter.id}
                      value={chapter.id}
                      className={`border rounded-xl px-4 ${chapter.borderColor} ${chapter.bgColor}/30 hover:${chapter.bgColor}/60 transition-colors`}
                    >
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className={`w-9 h-9 rounded-lg ${chapter.bgColor} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${chapter.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">
                                Ch. {idx + 1}
                              </Badge>
                              <span className="font-semibold text-sm text-gray-900">{chapter.title}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{chapter.description}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="ml-12 space-y-3">
                          {chapter.content.map((paragraph, pIdx) => (
                            <motion.div
                              key={pIdx}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: pIdx * 0.05 }}
                              className="flex items-start gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                              <p className="text-sm text-gray-700 leading-relaxed">{paragraph}</p>
                            </motion.div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </TabsContent>

            {/* Tab: Video Chapters */}
            <TabsContent value="video-chapters" className="p-4 mt-0">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-teal-600" />
                  Product Video Tutorials
                </h3>
                <p className="text-sm text-gray-500 mt-1">Watch product demos and installation guides</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VIDEO_CHAPTERS.map((video, idx) => {
                  const catColor = VIDEO_CATEGORY_COLORS[video.category] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openVideo(video)}
                      className="text-left rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                      {/* Video Thumbnail Placeholder */}
                      <div className="relative h-28 bg-gradient-to-br from-teal-800 to-emerald-900 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_60%)]" />
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <CirclePlay className="w-6 h-6 text-white" />
                        </div>
                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/80" />
                          <span className="text-[11px] font-medium text-white">{video.duration}</span>
                        </div>
                        {/* Category Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge className={`text-[10px] ${catColor.bg} ${catColor.text} border-0`}>
                            {video.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Volume2 className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] text-gray-400">Video Tutorial</span>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </TabsContent>

            {/* Tab: FAQ */}
            <TabsContent value="faq" className="p-4 mt-0">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  Frequently Asked Questions
                </h3>
                <p className="text-sm text-gray-500 mt-1">Quick answers to common questions about LAXREE products</p>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {FAQ_ITEMS.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="border rounded-xl px-4 border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                        </div>
                        <span className="font-medium text-sm text-gray-900">{faq.q}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="ml-10">
                        <p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            {/* Tab: Practice Quiz */}
            <TabsContent value="practice-quiz" className="p-4 mt-0">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-600" />
                  Practice Quiz
                </h3>
                <p className="text-sm text-gray-500 mt-1">Test your knowledge — these questions are not graded</p>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    Question {practiceIdx + 1} of {PRACTICE_QUESTIONS.length}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    <Target className="w-3 h-3 mr-1" />
                    {practiceScore.correct}/{practiceScore.total}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPracticeQuiz}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
              <Progress
                value={((practiceIdx + (practiceRevealed ? 1 : 0)) / PRACTICE_QUESTIONS.length) * 100}
                className="h-1.5 mb-5"
              />

              {/* Question Card */}
              {PRACTICE_QUESTIONS[practiceIdx] && (
                <motion.div
                  key={practiceIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="rounded-xl border border-gray-200 p-5 bg-white">
                    <h4 className="text-sm font-semibold text-gray-900 leading-relaxed mb-4">
                      {PRACTICE_QUESTIONS[practiceIdx].q}
                    </h4>

                    <div className="space-y-2">
                      {PRACTICE_QUESTIONS[practiceIdx].options.map((option, oIdx) => {
                        const isCorrect = oIdx === PRACTICE_QUESTIONS[practiceIdx].correct
                        const isSelected = oIdx === practiceAnswer
                        let optionClass = 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
                        if (practiceRevealed) {
                          if (isCorrect) {
                            optionClass = 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200'
                          } else if (isSelected && !isCorrect) {
                            optionClass = 'border-red-400 bg-red-50 ring-1 ring-red-200'
                          } else {
                            optionClass = 'border-gray-200 opacity-50'
                          }
                        } else if (isSelected) {
                          optionClass = 'border-teal-400 bg-teal-50 ring-1 ring-teal-200'
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handlePracticeAnswer(oIdx)}
                            disabled={practiceRevealed}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${optionClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold shrink-0 ${
                                  practiceRevealed && isCorrect
                                    ? 'bg-emerald-200 text-emerald-700'
                                    : practiceRevealed && isSelected && !isCorrect
                                    ? 'bg-red-200 text-red-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {practiceRevealed && isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : practiceRevealed && isSelected && !isCorrect ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  String.fromCharCode(65 + oIdx)
                                )}
                              </span>
                              <span className="text-sm text-gray-700">{option}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                      {practiceRevealed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Lightbulb className="w-3.5 h-3.5 text-teal-600" />
                              <span className="text-xs font-semibold text-teal-700">Explanation</span>
                            </div>
                            <p className="text-xs text-teal-700 leading-relaxed">
                              {PRACTICE_QUESTIONS[practiceIdx].explanation}
                            </p>
                          </div>

                          {practiceIdx < PRACTICE_QUESTIONS.length - 1 ? (
                            <Button
                              onClick={nextPracticeQuestion}
                              className="mt-3 bg-teal-600 hover:bg-teal-700 text-white w-full"
                              size="sm"
                            >
                              Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          ) : (
                            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                              <p className="text-sm font-semibold text-emerald-700 mb-1">Quiz Complete!</p>
                              <p className="text-xs text-emerald-600">
                                You scored {practiceScore.correct} out of {practiceScore.total}
                              </p>
                              <Button
                                onClick={resetPracticeQuiz}
                                variant="outline"
                                size="sm"
                                className="mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Try Again
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Video className="w-4 h-4 text-teal-600" />
              {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedVideo?.category} • {selectedVideo?.duration}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-2">
            <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
              {videoLoading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading video...</p>
                  </div>
                </div>
              )}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="flex flex-col items-center gap-3 text-center px-6">
                    <XCircle className="w-10 h-10 text-red-400" />
                    <p className="text-gray-300 text-sm font-medium">Failed to load video</p>
                    <p className="text-gray-500 text-xs">The video file could not be played. Please try again later.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => {
                        setVideoError(false)
                        setVideoLoading(true)
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}
              {selectedVideo && (
                <video
                  key={selectedVideo.videoUrl}
                  controls
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                  onCanPlay={() => setVideoLoading(false)}
                  onWaiting={() => setVideoLoading(true)}
                  onPlaying={() => setVideoLoading(false)}
                  onError={() => { setVideoLoading(false); setVideoError(true) }}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ==================== MAIN COMPONENT ====================

export function LearningCenter() {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAcademy, setSelectedAcademy] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null)
  const [moduleCompletions, setModuleCompletions] = useState<Record<string, { completed: boolean; score: number | null }>>({})
  const [catalogs, setCatalogs] = useState<CatalogDoc[]>([])
  const [activeTab, setActiveTab] = useState('modules')
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [quizModule, setQuizModule] = useState<ModuleData | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizLoading, setQuizLoading] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [viewingModule, setViewingModule] = useState(false)
  const [mainView, setMainView] = useState<'academies' | 'study-materials'>('academies')
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfViewerUrl, setPdfViewerUrl] = useState('')
  const [pdfViewerTitle, setPdfViewerTitle] = useState('')
  const user = useAuthStore((s) => s.user)

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/courses?userId=${user?.id}`)
        if (res.ok) {
          const json = await res.json()
          setCourses(json.courses || [])
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchCourses()
  }, [user?.id])

  // Fetch module completions
  useEffect(() => {
    const fetchCompletions = async () => {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/module-completion?userId=${user?.id}`)
        if (res.ok) {
          const json = await res.json()
          const map: Record<string, { completed: boolean; score: number | null }> = {}
          json.completions?.forEach((c: any) => {
            map[c.moduleId] = { completed: c.completed, score: c.score }
          })
          setModuleCompletions(map)
        }
      } catch (err) {
        console.error('Failed to fetch completions:', err)
      }
    }
    fetchCompletions()
  }, [user?.id])

  // Fetch catalogs
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const res = await fetch('/api/generate-pdf?type=catalog')
        if (res.ok) {
          const json = await res.json()
          setCatalogs(json.catalogs || [])
        }
      } catch (err) {
        console.error('Failed to fetch catalogs:', err)
      }
    }
    fetchCatalogs()
  }, [])

  // Open quiz for a module
  const openQuiz = useCallback(async (mod: ModuleData) => {
    if (!user?.id) return
    setQuizLoading(true)
    try {
      const res = await fetch(`/api/module-quiz?moduleId=${mod.id}&userId=${user.id}`)
      if (res.ok) {
        const json = await res.json()
        if (json.quiz) {
          setQuizData(json.quiz)
          setQuizModule(mod)
          setQuizOpen(true)
        }
      }
    } catch (err) {
      console.error('Failed to fetch quiz:', err)
    } finally {
      setQuizLoading(false)
    }
  }, [user?.id])

  // Handle quiz completion
  const handleQuizComplete = useCallback((result: QuizResult) => {
    if (quizModule) {
      setModuleCompletions(prev => ({
        ...prev,
        [quizModule.id]: { completed: result.passed, score: result.score }
      }))
    }
    // Refresh completions
    if (user?.id) {
      fetch(`/api/module-completion?userId=${user?.id}`)
        .then(res => res.json())
        .then(json => {
          const map: Record<string, { completed: boolean; score: number | null }> = {}
          json.completions?.forEach((c: any) => {
            map[c.moduleId] = { completed: c.completed, score: c.score }
          })
          setModuleCompletions(map)
        })
        .catch(() => {})
    }
  }, [quizModule, user?.id])

  // Helper to convert upload URLs to API-served URLs
  const getProperUrl = useCallback((url: string) => {
    if (!url) return url
    // If already an API URL, return as-is
    if (url.startsWith('/api/') || url.startsWith('http')) return url
    // Convert /upload/... to /api/uploads?file=...
    const fileName = url.replace(/^\/upload\//, '')
    return `/api/uploads?file=${encodeURIComponent(fileName)}`
  }, [])

  // Open PDF in viewer dialog
  const openPdfViewer = useCallback((url: string, title: string) => {
    setPdfViewerUrl(url)
    setPdfViewerTitle(title)
    setPdfViewerOpen(true)
  }, [])

  // Download PDF for module
  const downloadPDF = useCallback(async (mod: ModuleData) => {
    // If there's an uploaded PDF, open it in the viewer dialog
    if (mod.pdfUrl) {
      const properUrl = getProperUrl(mod.pdfUrl)
      openPdfViewer(properUrl, mod.title)
      return
    }
    
    setPdfGenerating(true)
    try {
      const res = await fetch(`/api/generate-pdf?moduleId=${mod.id}`)
      if (res.ok) {
        const json = await res.json()
        // Check if the API returns an uploaded PDF URL
        if (json.module?.pdfUrl) {
          const properUrl = getProperUrl(json.module.pdfUrl)
          openPdfViewer(properUrl, json.module.title || mod.title)
          return
        }
        if (json.module?.content) {
          // Open in PDF viewer dialog with HTML content rendered in iframe
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${json.module.title} - LAXREE Academy</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
                h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
                h2 { color: #0d9488; margin-top: 24px; }
                h3 { color: #047857; margin-top: 20px; }
                h4 { color: #065f46; margin-top: 16px; }
                table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                th, td { padding: 10px; border: 1px solid #e5e7eb; text-align: left; }
                th { background: #f0fdf4; }
                ul, ol { padding-left: 24px; }
                li { margin-bottom: 6px; }
                p { line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .header p { color: #6b7280; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${json.module.title}</h1>
                <p>${json.module.courseTitle || 'LAXREE Academy'} ${json.module.category ? '| ' + json.module.category : ''}</p>
                ${json.module.duration ? '<p>Duration: ' + json.module.duration + ' minutes</p>' : ''}
              </div>
              ${json.module.content}
              <div class="footer">
                <p>LAXREE Hospitality Solutions | Training Module | Generated on ${new Date().toLocaleDateString()}</p>
              </div>
            </body>
            </html>
          `
          const blob = new Blob([htmlContent], { type: 'text/html' })
          const blobUrl = URL.createObjectURL(blob)
          openPdfViewer(blobUrl, json.module.title || mod.title)
        }
      }
    } catch (err) {
      console.error('PDF download error:', err)
    } finally {
      setPdfGenerating(false)
    }
  }, [getProperUrl, openPdfViewer])

  // Mark module as complete manually
  const markComplete = useCallback(async (mod: ModuleData) => {
    if (!user?.id) return
    try {
      await fetch('/api/module-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, moduleId: mod.id, completed: true }),
      })
      setModuleCompletions(prev => ({
        ...prev,
        [mod.id]: { completed: true, score: prev[mod.id]?.score || null }
      }))
    } catch (err) {
      console.error('Failed to mark complete:', err)
    }
  }, [user?.id])

  if (loading) return <LearningSkeleton />

  const academyCourses = selectedAcademy
    ? courses.filter(c => c.moduleType === selectedAcademy)
    : []

  const getAcademyInfo = (type: string) => ACADEMIES.find(a => a.type === type)

  const getProgressForAcademy = (type: string) => {
    const list = courses.filter(c => c.moduleType === type)
    if (list.length === 0) return 0
    const totalProgress = list.reduce((sum, c) => sum + (c.enrollment?.progress || 0), 0)
    return Math.round(totalProgress / list.length)
  }

  const getModuleCountForAcademy = (type: string) => {
    return courses.filter(c => c.moduleType === type).reduce((sum, c) => sum + (c.modules?.length || 0), 0)
  }

  // Get academy info for the LessonViewer
  const currentAcademy = selectedAcademy ? getAcademyInfo(selectedAcademy) : null
  const currentCourse = selectedAcademy
    ? courses.find(c => c.moduleType === selectedAcademy && c.modules?.some(m => m.id === selectedModule?.id))
    : null

  // LessonViewer: when viewingModule is active, show immersive reader instead of academy detail
  if (viewingModule && selectedModule && currentAcademy && currentCourse) {
    return (
      <div className="space-y-0 -m-6">
        <LessonViewer
          module={selectedModule}
          course={currentCourse}
          academy={{ type: currentAcademy.type, title: currentAcademy.title, emoji: currentAcademy.emoji, gradient: currentAcademy.gradient }}
          completions={moduleCompletions}
          onBack={() => setViewingModule(false)}
          onQuiz={(mod) => { openQuiz(mod) }}
          onComplete={(mod) => markComplete(mod)}
          onNavigate={(mod) => { setSelectedModule(mod); setViewingModule(true) }}
          onDownloadPDF={(mod) => downloadPDF(mod)}
        />

        {/* Quiz Dialog still available */}
        {quizData && quizModule && (
          <ModuleQuiz
            quiz={quizData}
            moduleId={quizModule.id}
            open={quizOpen}
            onClose={() => setQuizOpen(false)}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!selectedAcademy ? (
          /* ==================== MAIN VIEW (Academy Grid + Study Materials) ==================== */
          <motion.div
            key={mainView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top-level tab toggle between Academies and Study Materials */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setMainView('academies')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    mainView === 'academies'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Academies
                </button>
                <button
                  onClick={() => setMainView('study-materials')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    mainView === 'study-materials'
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  Study Materials
                </button>
              </div>

              {mainView === 'academies' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900">Choose Your Academy</h2>
                  <p className="text-gray-500 text-sm mt-1">Select an academy to start or continue your learning journey</p>
                </>
              )}

              {mainView === 'study-materials' && (
                <>
                  <h2 className="text-xl font-bold text-gray-900">Study Materials</h2>
                  <p className="text-gray-500 text-sm mt-1">Comprehensive learning resources to prepare for your assessments</p>
                </>
              )}
            </div>

            {mainView === 'academies' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ACADEMIES.map((academy, i) => {
                    const progress = getProgressForAcademy(academy.type)
                    const moduleCount = getModuleCountForAcademy(academy.type)
                    const isStarted = progress > 0

                    return (
                      <motion.div
                        key={academy.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                      >
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group border-0"
                          onClick={() => setSelectedAcademy(academy.type)}
                        >
                          <div className={`bg-gradient-to-r ${academy.gradient} p-4 text-white relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
                            <div className="flex items-start justify-between relative z-10">
                              <div>
                                <span className="text-2xl">{academy.emoji}</span>
                                <h3 className="font-bold text-base mt-1">{academy.title}</h3>
                              </div>
                              <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>

                          <CardContent className="p-4">
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{academy.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                              <span>{moduleCount} modules</span>
                              <span>{progress}% complete</span>
                            </div>
                            <Progress value={progress} className="h-1.5 mb-3" />
                            <Button
                              size="sm"
                              className={`w-full ${
                                isStarted
                                  ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isStarted ? (
                                <><Play className="w-3 h-3 mr-1" /> Continue</>
                              ) : (
                                <><BookOpen className="w-3 h-3 mr-1" /> Start</>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}

                  {/* Study Materials Card — prominent card in the grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ACADEMIES.length * 0.04, duration: 0.3 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group border-0"
                      onClick={() => setMainView('study-materials')}
                    >
                      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                        <div className="flex items-start justify-between relative z-10">
                          <div>
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2">
                              <BookMarked className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-base">Study Materials</h3>
                          </div>
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-xs font-medium">4 Sections</span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          Study guides, video tutorials, FAQ, and practice quizzes
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <BookOpen className="w-3 h-3 text-emerald-500" />
                            <span>7 Chapters</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Video className="w-3 h-3 text-teal-500" />
                            <span>13 Videos</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <HelpCircle className="w-3 h-3 text-cyan-500" />
                            <span>8 FAQs</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Brain className="w-3 h-3 text-purple-500" />
                            <span>10 Quiz Qs</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                          <BookMarked className="w-3 h-3 mr-1" /> Explore Materials
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Catalogues Quick Access */}
                {catalogs.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-emerald-600" /> Catalogues & Resources
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {catalogs.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                {doc.type === 'catalog' ? (
                                  <BookMarked className="w-5 h-5 text-emerald-600" />
                                ) : doc.type === 'sop' ? (
                                  <ClipboardCheck className="w-5 h-5 text-teal-600" />
                                ) : (
                                  <FileText className="w-5 h-5 text-amber-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">{doc.title}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {doc.type.toUpperCase()}
                                </Badge>
                              </div>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0"
                              >
                                <Button size="sm" variant="outline" className="h-8">
                                  <Download className="w-3 h-3 mr-1" /> PDF
                                </Button>
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ==================== STUDY MATERIALS VIEW ==================== */
              <StudyMaterialsSection />
            )}
          </motion.div>
        ) : (
          /* ==================== ACADEMY DETAIL VIEW ==================== */
          <motion.div
            key="academy-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {(() => {
              const academy = getAcademyInfo(selectedAcademy)
              if (!academy) return null

              return (
                <>
                  {/* Academy Header */}
                  <div className={`bg-gradient-to-r ${academy.gradient} rounded-xl p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-8" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white hover:bg-white/10 mb-3 -ml-2"
                      onClick={() => { setSelectedAcademy(null); setActiveTab('modules') }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back to Academies
                    </Button>
                    <div className="flex items-start gap-4 relative z-10">
                      <span className="text-4xl">{academy.emoji}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{academy.title}</h2>
                        <p className="text-white/80 mt-1">{academy.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                          <span>{academyCourses.length} courses</span>
                          <span>{getModuleCountForAcademy(selectedAcademy)} modules</span>
                          <span>{getProgressForAcademy(selectedAcademy)}% complete</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs: Modules & Catalogues */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="modules" className="flex-1">
                        <BookOpen className="w-4 h-4 mr-1" /> Modules
                      </TabsTrigger>
                      <TabsTrigger value="catalogues" className="flex-1">
                        <FolderOpen className="w-4 h-4 mr-1" /> Catalogues
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="modules" className="mt-4 space-y-4">
                      {academyCourses.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="py-12 text-center">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-600">No Courses Available Yet</h3>
                            <p className="text-gray-400 mt-1">Courses for this academy are being developed.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        academyCourses.map((course) => {
                          return (
                            <Card key={course.id} className="overflow-hidden">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base">{course.title}</CardTitle>
                                    {course.description && (
                                      <CardDescription className="mt-1">{course.description}</CardDescription>
                                    )}
                                  </div>
                                  {course.enrollment && (
                                    <Badge variant={course.enrollment.status === 'completed' ? 'default' : 'secondary'}>
                                      {course.enrollment.status === 'completed' ? 'Completed' :
                                        course.enrollment.status === 'in_progress' ? 'In Progress' : 'Enrolled'}
                                    </Badge>
                                  )}
                                </div>
                                {course.enrollment && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                      <span>Progress</span>
                                      <span>{Math.round(course.enrollment.progress)}%</span>
                                    </div>
                                    <Progress value={course.enrollment.progress} className="h-2" />
                                  </div>
                                )}
                              </CardHeader>

                              {/* Modules List */}
                              {course.modules && course.modules.length > 0 && (
                                <CardContent>
                                  <p className="text-sm font-medium text-gray-600 mb-3">
                                    Modules ({course.modules.length})
                                  </p>
                                  <div className="space-y-2">
                                    {course.modules
                                      .sort((a, b) => a.order - b.order)
                                      .map((mod) => {
                                        const completion = moduleCompletions[mod.id]
                                        const isCompleted = completion?.completed || false
                                        const modScore = completion?.score
                                        const ModIcon = getModuleIcon(mod.title)

                                        return (
                                          <div
                                            key={mod.id}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                                              isCompleted
                                                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                                                : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                                            }`}
                                            onClick={() => { setSelectedModule(mod); setViewingModule(true) }}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative ${
                                                isCompleted ? 'bg-emerald-100' : mod.contentType === 'video' ? 'bg-red-50' : 'bg-gray-100'
                                              }`}>
                                                {isCompleted ? (
                                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                ) : mod.contentType === 'video' ? (
                                                  <MonitorPlay className="w-4 h-4 text-red-500" />
                                                ) : (
                                                  <ModIcon className="w-4 h-4 text-gray-400" />
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-700' : 'text-gray-700'} group-hover:text-emerald-700 transition-colors`}>
                                                    {mod.order}. {mod.title}
                                                  </p>
                                                  {isCompleted && modScore !== null && modScore !== undefined && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                                      {modScore}%
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                  {mod.duration && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                      <Clock2 className="w-3 h-3" />{mod.duration} min
                                                    </span>
                                                  )}
                                                  {mod.contentType && (
                                                    <Badge variant="outline" className={`text-xs px-1.5 py-0 ${mod.contentType === 'video' ? 'border-red-200 text-red-600 bg-red-50' : ''}`}>
                                                      {mod.contentType === 'video' ? '🎬 Video' : mod.contentType}
                                                    </Badge>
                                                  )}
                                                  {/* Show available content types */}
                                                  <div className="flex items-center gap-1">
                                                    {mod.contentType === 'video' && mod.contentUrl && (
                                                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-blue-200 text-blue-600 bg-blue-50">▶ Watch</Badge>
                                                    )}
                                                    {mod.pdfUrl && (
                                                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-200 text-amber-600 bg-amber-50">📄 PDF</Badge>
                                                    )}
                                                    {mod.content && (
                                                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-teal-200 text-teal-600 bg-teal-50">📖 Read</Badge>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                            </div>
                                          </div>
                                        )
                                      })}
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          )
                        })
                      )}
                    </TabsContent>

                    <TabsContent value="catalogues" className="mt-4">
                      {catalogs.length === 0 ? (
                        <Card className="border-dashed">
                          <CardContent className="py-12 text-center">
                            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-600">No Catalogues Available</h3>
                            <p className="text-gray-400 mt-1">Catalogues will be added soon.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {catalogs.map((doc) => (
                            <Card key={doc.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                    {doc.type === 'catalog' ? (
                                      <BookMarked className="w-6 h-6 text-emerald-600" />
                                    ) : doc.type === 'sop' ? (
                                      <ClipboardCheck className="w-6 h-6 text-teal-600" />
                                    ) : (
                                      <FileText className="w-6 h-6 text-amber-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700 text-sm">{doc.title}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {doc.type.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full h-8">
                                      <ExternalLink className="w-3 h-3 mr-1" /> View
                                    </Button>
                                  </a>
                                  <a href={doc.fileUrl} download className="flex-1">
                                    <Button size="sm" className="w-full h-8 bg-emerald-600 hover:bg-emerald-700">
                                      <Download className="w-3 h-3 mr-1" /> Download
                                    </Button>
                                  </a>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== QUIZ DIALOG ==================== */}
      {quizData && quizModule && (
        <ModuleQuiz
          quiz={quizData}
          moduleId={quizModule.id}
          open={quizOpen}
          onClose={() => setQuizOpen(false)}
          onComplete={handleQuizComplete}
        />
      )}

      {/* ==================== PDF VIEWER DIALOG ==================== */}
      <Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 pb-2 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-amber-600" />
                {pdfViewerTitle}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-200 hover:border-amber-300 hover:text-amber-700"
                  onClick={() => {
                    if (pdfViewerUrl) window.open(pdfViewerUrl, '_blank')
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-200 hover:border-amber-300 hover:text-amber-700"
                  onClick={() => {
                    if (pdfViewerUrl) {
                      const a = document.createElement('a')
                      a.href = pdfViewerUrl
                      a.download = `${pdfViewerTitle || 'document'}.pdf`
                      a.click()
                    }
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              Document Viewer
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-gray-100">
            {pdfViewerUrl && (
              <iframe
                src={pdfViewerUrl}
                className="w-full h-full border-0"
                title={`PDF: ${pdfViewerTitle}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== HELPER COMPONENTS ====================

function Clock2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function RotateCcw2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}
