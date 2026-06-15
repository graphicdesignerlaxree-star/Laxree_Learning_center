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

interface VideoLesson {
  id: string
  title: string
  duration: string
  category: string
  image: string
  description: string
  transcript: string[]
  keyPoints: string[]
  youtubeId: string
}

const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'v1',
    title: 'Safe Box Installation & Operation',
    duration: '15:30',
    category: 'Safe Box',
    image: 'https://sfile.chatglm.cn/images-ppt/f896588e4161.jpg',
    description: 'Complete installation guide for LAXREE electronic safe boxes including wall mounting, programming, and troubleshooting procedures.',
    transcript: [
      'Welcome to the LAXREE Safe Box Installation and Operation training module. In this comprehensive guide, we will walk through the entire installation process, from unboxing to full operational status, ensuring your hotel guests enjoy secure and reliable in-room storage.',
      'UNBOXING & PRE-INSTALLATION CHECK: Upon receiving your LAXREE safe boxes, carefully inspect each unit for transit damage. Verify the package contents: safe unit, 4× AA batteries, 2 override keys, 4 anchor bolts with wall plugs, and the user manual. Check the model number on the packaging matches your order — LAXREE offers three sizes: Compact (LER-20), Standard (LER-30), and Laptop (LER-40).',
      'MOUNTING PROCEDURE: Position the safe inside the wardrobe cabinet or on a designated shelf at a height accessible to standing guests. Mark the anchor points through the pre-drilled holes in the bottom of the safe. Use a 10mm masonry drill bit for concrete walls or a 6mm bit for wooden surfaces. Insert wall plugs and secure with the provided anchor bolts. The safe must not wobble or tilt — test by applying 15kg of downward pressure.',
      'POWER & PROGRAMMING: Open the battery compartment on the inside of the door. Insert 4× AA batteries ensuring correct polarity. The LED display will flash indicating power-up. Press the reset button once. Enter the master code (default: 1-2-3-4) and press #. The display will show "OPEN" confirming successful initialization. Now set a new master code: press *, enter new 3-8 digit code, press #, re-enter to confirm.',
      'GUEST OPERATION: To lock — close the door, enter any 3-8 digit code, press #. The display shows "CLOSED" and the motorized bolt engages. To open — enter the same code and press #. The display shows "OPEN" and the bolt retracts. The safe auto-locks after 3 incorrect attempts for 5 minutes as a security measure.',
      'EMERGENCY ACCESS: If a guest forgets their code, use the master code or the override key. The override keyhole is concealed behind the front panel badge — insert a flathead screwdriver to gently pry off the badge. Insert the override key and turn clockwise to unlock. After access, help the guest set a new personal code.',
      'TROUBLESHOOTING: Low battery indicator — display shows "LO-BAT" and beeps 3 times per operation. Replace batteries within 48 hours. Keypad not responding — remove and reinsert batteries, check polarity. Door won\'t close — check for obstructions in the bolt channel and ensure the hinge pins are seated correctly.',
    ],
    keyPoints: [
      'Always anchor the safe to a solid surface using all 4 bolts',
      'Change the default master code during every installation',
      'Replace batteries at the first low-battery warning',
      'Keep override keys in a secure location accessible only to management',
      'Test the safe with at least 3 lock/unlock cycles after installation',
    ],
    youtubeId: '',
  },
  {
    id: 'v2',
    title: 'RFID Door Lock — Complete Guide',
    duration: '18:45',
    category: 'Door Lock',
    image: 'https://sfile.chatglm.cn/images-ppt/5e822e3c57c5.png',
    description: 'Comprehensive training on LAXREE RFID door lock systems including installation, card programming, PMS integration, and maintenance.',
    transcript: [
      'Welcome to the LAXREE RFID Door Lock training module. This comprehensive guide covers everything from mechanical installation to software integration with your hotel\'s Property Management System.',
      'TECHNOLOGY OVERVIEW: LAXREE RFID locks use 13.56MHz Mifare technology — the industry standard for contactless hotel room access. Each lock stores up to 300 recent access records, providing a complete audit trail. The system supports five card types in a strict hierarchy: Master Card, Building Card, Floor Card, Guest Card, and Emergency Card.',
      'INSTALLATION PROCESS: Begin with the door preparation — standard doors require a 60mm backset mortise cutout. Install the lock body into the door edge first, then attach the exterior reader plate and interior battery cover. Connect the cable harness between the reader and lock body. The entire installation takes approximately 20-25 minutes per door with proper tools.',
      'CARD ENCODING: Using the LAXREE Encoder Software, connect the USB encoder to your front desk computer. The software integrates with major PMS systems (Opera, Protel, IDS) via TCP/IP interface. When a guest checks in, the PMS automatically sends the room number and check-out date to the encoder, which writes this data to the RFID card.',
      'BATTERY MANAGEMENT: Each lock is powered by 4× AA batteries with 12-18 month average lifespan. The low battery warning gives approximately 200 more operations. For large properties, implement a scheduled battery replacement program every 12 months to prevent guest-facing lockouts.',
      'EMERGENCY PROCEDURES: Every lock has a mechanical key override hidden behind the interior cover plate. The Emergency Card opens all locks and overrides any guest privacy settings. In case of total electronic failure, the mechanical key is the fail-safe access method.',
    ],
    keyPoints: [
      'RFID 13.56MHz Mifare technology — industry standard for hotel access',
      '5-level card hierarchy from Master to Emergency',
      'PMS integration via TCP/IP with Opera, Protel, and IDS',
      '300-record audit trail stored in each lock',
      'Anti-panic exit function — inside handle always allows free egress',
    ],
    youtubeId: '',
  },
  {
    id: 'v3',
    title: 'Minibar — Setup & Management',
    duration: '20:15',
    category: 'Minibar',
    image: 'https://sfile.chatglm.cn/images-ppt/650c00aeb47d.png',
    description: 'Detailed guide to LAXREE minibar products including absorption, compressor, and thermoelectric models with setup, par level management, and maintenance procedures.',
    transcript: [
      'Welcome to the LAXREE Minibar Setup and Management training. LAXREE offers three minibar technologies — each designed for specific hotel requirements. Understanding these differences is crucial for recommending the right product to your clients.',
      'THERMOELECTRIC MINIBARS: These use solid-state Peltier cooling technology with no moving parts, making them completely silent and lightweight. Ideal for budget and mid-range hotels. Capacity ranges from 20L to 40L. Temperature range: 8-15°C. Power consumption: just 45W. The trade-off is slower cooling and higher minimum temperature compared to compressor models.',
      'ABSORPTION MINIBARS: Using a heat-driven absorption cycle, these operate at 0 dB noise level — making them the preferred choice for luxury hotels and 5-star properties. The absorption process uses a ammonia/water/hydrogen gas mixture with no compressor, ensuring absolutely silent operation. Temperature range: 5-12°C. Power: 60W. Available in mirror, wooden, and painted glass finishes.',
      'COMPRESSOR MINIBARS: Featuring the same technology as home refrigerators, compressor models offer the fastest cooling and lowest temperatures. Temperature range: 2-8°C. Power: 70-90W with inverter technology. Some noise (<39 dB) but superior cooling performance, especially in tropical climates. Ideal for high-demand rooms and suites.',
      'PAR LEVEL MANAGEMENT: Each room should be stocked with 8-12 items based on the property\'s standard. Place beverages on the top shelf, snacks on the middle shelf, and complementary items on the bottom shelf. Smart minibars with weight sensors automatically detect consumption and sync with the PMS for automatic billing.',
      'MAINTENANCE: Clean interior surfaces monthly with mild detergent. Check door seals quarterly. Ensure minimum 10cm clearance from walls for absorption model ventilation. All LAXREE minibars use eco-friendly R600a refrigerant and meet energy efficiency Class A+ standards.',
    ],
    keyPoints: [
      'Absorption = 0 dB silence for luxury; Compressor = fastest cooling; Thermoelectric = budget-friendly',
      'Par level: 8-12 items per room with standard arrangement',
      'Smart minibars auto-detect consumption and sync with PMS',
      'Monthly cleaning, quarterly seal checks, 10cm wall clearance',
      'All models use eco-friendly R600a refrigerant, Class A+ efficiency',
    ],
    youtubeId: '',
  },
  {
    id: 'v4',
    title: 'Electric Kettle — Product Demo',
    duration: '12:20',
    category: 'Kettle',
    image: 'https://sfile.chatglm.cn/images-ppt/2eece29f9d02.jpg',
    description: 'Complete product demonstration of LAXREE electric kettles including all models, safety features, and maintenance procedures.',
    transcript: [
      'Welcome to the LAXREE Electric Kettle product training. LAXREE offers 5 kettle models designed specifically for hotel environments, with safety and guest convenience as top priorities.',
      'MODEL RANGE: LRWT-143 (0.6L, 1000W, SS 201, ₹560) — Compact for single guests. LRWT-145 (0.8L, 800W, SS 201 Matte, ₹488) — Best value. LRWT-155 (1.0L, 1000W, SS 304 Double Wall, ₹1,104) — Premium with insulation. LRWT-150 (0.8L, 900W, SS 201, ₹660) — Standard. LRWT-156 (1.0L, 1000W, SS 304, ₹1,320) — Luxury finish.',
      'SAFETY FEATURES: Every LAXREE kettle includes three critical safety systems: (1) Auto shut-off when water reaches boiling point, (2) Boil-dry protection that cuts power if the kettle operates with insufficient water, and (3) A secure locking lid that prevents hot water spills even if the kettle is knocked over.',
      'MAINTENANCE: Descale every 2-3 months using a 1:1 water-vinegar solution. Boil the mixture, let sit 30 minutes, then rinse thoroughly. Wipe exterior with a damp cloth only — never immerse in water. The concealed heating element makes interior cleaning easy.',
    ],
    keyPoints: [
      '5 models from ₹488 to ₹1,320 covering all hotel segments',
      'Triple safety: auto shut-off, boil-dry protection, locking lid',
      '360° rotational base and concealed heating element',
      'BPA-free interior surfaces, food-grade stainless steel',
      'Descale every 2-3 months with vinegar solution',
    ],
    youtubeId: '',
  },
  {
    id: 'v5',
    title: 'Mirror & Hair Dryer Guide',
    duration: '14:00',
    category: 'Mirror',
    image: 'https://sfile.chatglm.cn/images-ppt/683a45ce407a.jpg',
    description: 'Complete guide to LAXREE bathroom mirrors and hair dryers including wall-mounted and foldable models with installation procedures.',
    transcript: [
      'Welcome to the LAXREE Mirror and Hair Dryer training module. These bathroom essentials are often overlooked in hotel procurement but play a critical role in guest satisfaction scores.',
      'MIRRORS: LAXREE offers LED-backlit mirrors with anti-fog technology, standard frameless mirrors, and magnifying vanity mirrors. The LED mirrors feature touch-sensitive controls, adjustable color temperature (warm 3000K to cool 6500K), and energy-efficient LEDs rated for 50,000 hours. The anti-fog heating pad activates automatically when the bathroom light is turned on.',
      'HAIR DRYERS: Two mounting options — wall-mounted (saves counter space, prevents theft) and foldable portable (for premium suites). Wall-mounted models feature 1200W-1600W motors with 2 heat/speed settings. All models include auto-shutoff if overheated and a 1.5m power cord for guest convenience.',
      'INSTALLATION: Wall-mounted hair dryers should be installed near the bathroom vanity at 120cm height. Use the provided mounting bracket and secure to wall studs or use appropriate anchors. The power connection should be made by a licensed electrician with GFCI protection.',
    ],
    keyPoints: [
      'LED mirrors with anti-fog tech and 50,000-hour rated LEDs',
      'Wall-mounted dryers prevent theft, portable for suites',
      'GFCI protection required for bathroom installations',
      'Touch-sensitive controls with adjustable color temperature',
    ],
    youtubeId: '',
  },
  {
    id: 'v6',
    title: 'Digital Signage Solutions',
    duration: '16:30',
    category: 'Signage',
    image: 'https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg',
    description: 'Training on LAXREE digital signage products for hotel lobbies, conference rooms, and wayfinding systems.',
    transcript: [
      'Welcome to the LAXREE Digital Signage training. Modern hotels are replacing static signs with dynamic digital displays that enhance guest experience and create new revenue opportunities.',
      'PRODUCT RANGE: LAXREE offers three signage categories: (1) Lobby Displays — 43" to 65" 4K screens for welcome messages, hotel maps, and promotional content. (2) Room Door Signs — 10" e-ink or LCD displays outside each room showing guest name, privacy status, and housekeeping status. (3) Wayfinding Kiosks — Touch-screen interactive directories for large properties.',
      'CONTENT MANAGEMENT: The LAXREE Signage Cloud Platform allows centralized content management across all displays. Schedule content by time of day (breakfast buffet hours, evening restaurant specials), by day of week, or by season. The platform supports images, videos, live weather, and PMS-integrated guest welcome messages.',
      'ROI ANALYSIS: Digital signage typically pays for itself within 18-24 months through: reduced printing costs, increased F&B revenue from in-lobby promotions, and improved guest satisfaction scores. Hotels report 15-25% increase in restaurant reservations when promoted on lobby displays.',
    ],
    keyPoints: [
      'Three categories: Lobby Displays, Room Door Signs, Wayfinding Kiosks',
      'Cloud-based content management with scheduling',
      'PMS integration for personalized guest welcome messages',
      'ROI in 18-24 months through printing savings and F&B promotion',
    ],
    youtubeId: '',
  },
  {
    id: 'v7',
    title: 'Dispenser Installation & Setup',
    duration: '10:45',
    category: 'Dispenser',
    image: 'https://sfile.chatglm.cn/images-ppt/f275fdaffe40.jpg',
    description: 'Step-by-step guide to installing and maintaining LAXREE soap and shampoo dispensers in hotel bathrooms.',
    transcript: [
      'Welcome to the LAXREE Dispenser training. Wall-mounted dispensers are rapidly replacing single-use amenity bottles in hotels worldwide due to sustainability mandates and cost savings.',
      'PRODUCT RANGE: LAXREE offers 3-chamber and 2-chamber dispenser systems. Each chamber holds 400ml of product. The 3-chamber system typically dispenses shampoo, body wash, and lotion. The 2-chamber system dispenses shampoo and body wash. All models feature tamper-proof locking mechanisms and easy-fill designs.',
      'INSTALLATION: Mount dispensers on the shower wall at 120cm height for standing showers or 80cm for bathtubs. Use silicone adhesive for tile surfaces (no drilling required) or wall anchors for concrete. The dispenser bracket snaps onto the mounting plate for easy removal during cleaning.',
      'COST SAVINGS: A typical 150-room hotel saves ₹8-12 lakhs annually by switching from individual bottles to dispensers. Each refill costs approximately ₹15-20 per room versus ₹60-80 for individual amenity bottles. The environmental benefit: eliminating 50,000+ single-use plastic bottles per year.',
    ],
    keyPoints: [
      '2-chamber and 3-chamber systems, 400ml per chamber',
      'No-drill silicone adhesive mounting for tile surfaces',
      'Tamper-proof locking and easy-fill design',
      'Save ₹8-12 lakhs/year for a 150-room hotel vs individual bottles',
    ],
    youtubeId: '',
  },
  {
    id: 'v8',
    title: 'Housekeeping Trolley Setup',
    duration: '8:30',
    category: 'Housekeeping',
    image: 'https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg',
    description: 'Guide to LAXREE housekeeping trolleys including assembly, stocking procedures, and maintenance for efficient room service.',
    transcript: [
      'Welcome to the LAXREE Housekeeping Trolley training. An organized trolley is the backbone of efficient room service and directly impacts housekeeping productivity.',
      'ASSEMBLY: LAXREE trolleys ship flat-pack and require approximately 20 minutes for assembly. The aluminum frame is lightweight yet supports up to 80kg. The 4-wheel system includes 2 locking casters for stability when parked. Assemble the frame first, then attach the bag supports and shelf brackets.',
      'STOCKING LAYOUT: Top shelf — clean linens (2 sheets, 2 pillowcases, 1 duvet cover per room). Middle shelf — towels (2 bath towels, 2 hand towels, 2 face towels per room). Bottom shelf — amenities and cleaning supplies. Side bag — trash bag, soiled linen bag. Rear organizer — cleaning sprays, gloves, dusters.',
      'MAINTENANCE: Wipe down the frame weekly with disinfectant. Check wheel casters monthly and lubricate if sticking. Replace soiled linen bags when torn. The trolley should be parked in the corridor on the same side as the room being serviced, never blocking the hallway.',
    ],
    keyPoints: [
      'Aluminum frame supports 80kg, 2 locking casters',
      'Standard stocking: linens on top, towels in middle, supplies on bottom',
      'Weekly disinfection and monthly caster maintenance',
      'Park on same side as room being serviced',
    ],
    youtubeId: '',
  },
  {
    id: 'v9',
    title: 'Luggage Rack & Accessories',
    duration: '7:00',
    category: 'Luggage',
    image: 'https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg',
    description: 'Overview of LAXREE luggage racks, shoe shine machines, weighing scales, and other room accessories.',
    transcript: [
      'Welcome to the LAXREE Luggage Rack and Accessories training. These finishing touches in a hotel room may seem minor but significantly impact guest comfort and the overall room impression.',
      'LUGGAGE RACKS: LAXREE offers folding and fixed luggage racks in solid wood and metal finishes. Standard dimensions: 65cm × 45cm × 45cm (W×D×H). Weight capacity: 50kg. The folding model is ideal for rooms with limited storage space, while the fixed model adds a premium look to suites.',
      'WEIGHING SCALES: Digital scales with tempered glass top, auto-on when stepped on, and LCD display. Battery-powered (2× CR2032) with 18-month lifespan. Capacity: 180kg with 100g accuracy. These are a popular add-on item when selling minibars or kettles.',
      'SHOE SHINE MACHINES: Compact wall-mounted or freestanding units. Features include automatic brush rotation and optional polish dispensing. Popular in business hotels and airport properties.',
    ],
    keyPoints: [
      'Folding and fixed luggage racks, 50kg capacity',
      'Digital scales — great add-on sale with minibars/kettles',
      'Shoe shine machines popular in business hotels',
      'All accessories available in matching finishes',
    ],
    youtubeId: '',
  },
  {
    id: 'v10',
    title: 'Hotel Hangers & Wardrobe Solutions',
    duration: '6:15',
    category: 'Hangers',
    image: 'https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg',
    description: 'Training on LAXREE hotel hangers, wardrobe accessories, and complete closet solutions for guest rooms.',
    transcript: [
      'Welcome to the LAXREE Hotel Hangers training. Quality hangers are a small detail that guests notice immediately — flimsy wire hangers create a negative impression while sturdy wooden hangers signal quality.',
      'PRODUCT RANGE: LAXREE offers three hanger types: (1) Wooden Hangers — Solid beechwood with chrome hook, available in natural and walnut finishes. These are the premium option for 4-5 star properties. (2) Velvet Hangers — Slim-profile non-slip design in black or gray. These save closet space and prevent garments from slipping off. (3) Tubular Hangers — Cost-effective plastic option for budget and mid-range hotels.',
      'WARDROBE ACCESSORIES: Complete your wardrobe solution with LAXREE\'s matching shelf dividers, tie/belt racks, and valet hooks. The anti-theft hook system uses a fixed-ring design that prevents hangers from being removed from the closet rod — a common hotel requirement.',
    ],
    keyPoints: [
      'Wooden (premium), Velvet (space-saving), Tubular (budget) options',
      'Anti-theft fixed-ring hook system available',
      'Matching shelf dividers, tie racks, and valet hooks',
      '4-6 hangers per room standard for business hotels',
    ],
    youtubeId: '',
  },
  {
    id: 'v11',
    title: 'Dustbin & Waste Management Solutions',
    duration: '5:30',
    category: 'Dustbin',
    image: 'https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg',
    description: 'Overview of LAXREE waste management products including room dustbins, lobby bins, and sensor-operated models.',
    transcript: [
      'Welcome to the LAXREE Dustbin Solutions training. Proper waste management in hotel rooms and public areas is essential for hygiene, guest comfort, and housekeeping efficiency.',
      'ROOM DUSTBINS: LAXREE room dustbins come in 12L and 20L capacities with pedal-operated and sensor-operated options. The sensor model uses infrared technology to open the lid when a hand approaches — a hygienic touchless solution that\'s increasingly popular post-pandemic. Materials include stainless steel, ABS plastic, and bamboo.',
      'LOBBY & PUBLIC AREA BINS: Larger capacity bins (40L-80L) with dual-compartment recycling options. The slim-profile lobby bin fits neatly against walls without obstructing walkways. Available with custom branding and color options to match hotel interiors.',
    ],
    keyPoints: [
      'Room bins: 12L-20L, pedal or sensor-operated',
      'Touchless sensor models popular post-pandemic',
      'Lobby bins: 40L-80L with dual-compartment recycling',
      'Custom branding and color options available',
    ],
    youtubeId: '',
  },
  {
    id: 'v12',
    title: 'Rollaway Bed & Mattress Solutions',
    duration: '9:00',
    category: 'Bed',
    image: 'https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg',
    description: 'Complete guide to LAXREE rollaway beds, hotel mattresses, and bed base solutions for all room types.',
    transcript: [
      'Welcome to the LAXREE Rollaway Bed and Mattress training. Quality sleep is the #1 factor in guest satisfaction, making these products critical to any hotel\'s success.',
      'ROLLAWAY BEDS: LAXREE rollaway beds feature a steel frame with folding mechanism, 12cm thick high-density foam mattress, and 4 caster wheels (2 with brakes). Open dimensions: 190cm × 90cm × 45cm. Folded: 90cm × 25cm × 120cm — compact enough for standard wardrobe storage. Weight capacity: 120kg. The quick-fold mechanism allows housekeeping to set up or fold down in under 30 seconds.',
      'HOTEL MATTRESSES: Available in three comfort levels: Firm (orthopedic, popular in business hotels), Medium (universal comfort, best-seller), and Plush (luxury, 5-star properties). All models feature pocket spring systems with foam encasement for edge support. Sizes: Single, Double, Queen, King. Custom firmness available for bulk orders of 50+ units.',
    ],
    keyPoints: [
      'Rollaway: steel frame, 12cm foam, folds in 30 seconds, 120kg capacity',
      'Mattresses in Firm, Medium, Plush comfort levels',
      'Pocket spring with foam encasement for edge support',
      'Custom firmness available for 50+ unit orders',
    ],
    youtubeId: '',
  },
  {
    id: 'v13',
    title: 'Add-on Products & Cross-Selling',
    duration: '11:00',
    category: 'Add-ons',
    image: 'https://sfile.chatglm.cn/images-ppt/2619e87ae6aa.jpg',
    description: 'Overview of LAXREE add-on products and cross-selling strategies to maximize order value.',
    transcript: [
      'Welcome to the LAXREE Add-on Products and Cross-Selling training. As a LAXREE sales professional, understanding how to bundle products and maximize order value is key to your success.',
      'ADD-ON PRODUCTS: LAXREE offers numerous complementary items: Room Trays (water glasses, tray, and coaster sets), Iron & Ironing Boards (wall-mounted or freestanding), Bathroom Scales, Door Knobs & Handles (matching RFID lock finishes), Bed Runners and Cushions, and Guest Room Directories (leather-bound information folders).',
      'CROSS-SELLING STRATEGY: When a client orders minibars, suggest: safe boxes (same wardrobe space), kettles (same room), and dispensers (same bathroom). When selling RFID locks, suggest: digital signage (same technology platform) and safe boxes (shared audit trail capability). The goal is to position LAXREE as a single-source vendor — every additional product in the order increases your commission and the client\'s integration efficiency.',
      'BUNDLE DISCOUNTS: Offer tiered pricing — 3 product categories: 5% discount. 5+ categories: 8% discount. Full room package: 12% discount. These margins are built into LAXREE\'s pricing structure, so you never sell at a loss while the client perceives great value.',
    ],
    keyPoints: [
      'Room trays, irons, scales, directories as easy add-ons',
      'Cross-sell related products: minibar + safe + kettle as a room package',
      'Position LAXREE as single-source vendor for maximum efficiency',
      'Bundle discounts: 3 categories=5%, 5+=8%, full room=12%',
    ],
    youtubeId: '',
  },
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

interface DocumentResource {
  id: string
  title: string
  description: string
  category: string
  pages: number
  icon: typeof FileText
  color: string
  bgColor: string
  content: string
}

const DOCUMENT_RESOURCES: DocumentResource[] = [
  {
    id: 'doc1',
    title: 'LAXREE Product Catalogue',
    description: 'Complete product listing with specifications, pricing, and model numbers for all LAXREE hospitality products.',
    category: 'Catalog',
    pages: 24,
    icon: Package,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    content: `<h2 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:8px;">LAXREE Product Catalogue</h2>
<h3>Mini Bars</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tr style="background:#f0fdf4;"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Model</th><th style="padding:8px;border:1px solid #e5e7eb;">Capacity</th><th style="padding:8px;border:1px solid #e5e7eb;">Technology</th><th style="padding:8px;border:1px solid #e5e7eb;">Temp Range</th><th style="padding:8px;border:1px solid #e5e7eb;">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LMMB-20T</td><td style="padding:8px;border:1px solid #e5e7eb;">20L</td><td style="padding:8px;border:1px solid #e5e7eb;">Thermoelectric</td><td style="padding:8px;border:1px solid #e5e7eb;">8-15°C</td><td style="padding:8px;border:1px solid #e5e7eb;">4,200</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LMMB-40A</td><td style="padding:8px;border:1px solid #e5e7eb;">40L</td><td style="padding:8px;border:1px solid #e5e7eb;">Absorption</td><td style="padding:8px;border:1px solid #e5e7eb;">5-12°C</td><td style="padding:8px;border:1px solid #e5e7eb;">8,500</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LMMB-45C</td><td style="padding:8px;border:1px solid #e5e7eb;">45L</td><td style="padding:8px;border:1px solid #e5e7eb;">Compressor</td><td style="padding:8px;border:1px solid #e5e7eb;">2-8°C</td><td style="padding:8px;border:1px solid #e5e7eb;">12,500</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LMMB-60C</td><td style="padding:8px;border:1px solid #e5e7eb;">60L</td><td style="padding:8px;border:1px solid #e5e7eb;">Compressor</td><td style="padding:8px;border:1px solid #e5e7eb;">2-8°C</td><td style="padding:8px;border:1px solid #e5e7eb;">15,800</td></tr></table>
<h3>Safe Boxes</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tr style="background:#f0fdf4;"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Model</th><th style="padding:8px;border:1px solid #e5e7eb;">Size</th><th style="padding:8px;border:1px solid #e5e7eb;">Features</th><th style="padding:8px;border:1px solid #e5e7eb;">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRSB-201</td><td style="padding:8px;border:1px solid #e5e7eb;">Compact</td><td style="padding:8px;border:1px solid #e5e7eb;">LED, Digital Keypad</td><td style="padding:8px;border:1px solid #e5e7eb;">3,200</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRSB-205</td><td style="padding:8px;border:1px solid #e5e7eb;">Standard</td><td style="padding:8px;border:1px solid #e5e7eb;">LED, Audit Trail</td><td style="padding:8px;border:1px solid #e5e7eb;">4,800</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRSB-209</td><td style="padding:8px;border:1px solid #e5e7eb;">Laptop/Orbita</td><td style="padding:8px;border:1px solid #e5e7eb;">LED, Interior Light, USB</td><td style="padding:8px;border:1px solid #e5e7eb;">6,500</td></tr></table>
<h3>RFID Door Locks</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tr style="background:#f0fdf4;"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Model</th><th style="padding:8px;border:1px solid #e5e7eb;">Technology</th><th style="padding:8px;border:1px solid #e5e7eb;">Finish</th><th style="padding:8px;border:1px solid #e5e7eb;">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRDL-100</td><td style="padding:8px;border:1px solid #e5e7eb;">Mifare 13.56MHz</td><td style="padding:8px;border:1px solid #e5e7eb;">SS304 Satin</td><td style="padding:8px;border:1px solid #e5e7eb;">5,800</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRDL-200</td><td style="padding:8px;border:1px solid #e5e7eb;">Mifare + Bluetooth</td><td style="padding:8px;border:1px solid #e5e7eb;">SS304 Gold</td><td style="padding:8px;border:1px solid #e5e7eb;">7,500</td></tr></table>
<h3>Electric Kettles</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tr style="background:#f0fdf4;"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Model</th><th style="padding:8px;border:1px solid #e5e7eb;">Capacity</th><th style="padding:8px;border:1px solid #e5e7eb;">Power</th><th style="padding:8px;border:1px solid #e5e7eb;">Material</th><th style="padding:8px;border:1px solid #e5e7eb;">SSP (₹)</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRWT-143</td><td style="padding:8px;border:1px solid #e5e7eb;">0.6L</td><td style="padding:8px;border:1px solid #e5e7eb;">1000W</td><td style="padding:8px;border:1px solid #e5e7eb;">SS 201</td><td style="padding:8px;border:1px solid #e5e7eb;">560</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRWT-145</td><td style="padding:8px;border:1px solid #e5e7eb;">0.8L</td><td style="padding:8px;border:1px solid #e5e7eb;">800W</td><td style="padding:8px;border:1px solid #e5e7eb;">SS 201 Matte</td><td style="padding:8px;border:1px solid #e5e7eb;">488</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRWT-155</td><td style="padding:8px;border:1px solid #e5e7eb;">1.0L</td><td style="padding:8px;border:1px solid #e5e7eb;">1000W</td><td style="padding:8px;border:1px solid #e5e7eb;">SS 304 Double</td><td style="padding:8px;border:1px solid #e5e7eb;">1,104</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRWT-150</td><td style="padding:8px;border:1px solid #e5e7eb;">0.8L</td><td style="padding:8px;border:1px solid #e5e7eb;">900W</td><td style="padding:8px;border:1px solid #e5e7eb;">SS 201</td><td style="padding:8px;border:1px solid #e5e7eb;">660</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">LRWT-156</td><td style="padding:8px;border:1px solid #e5e7eb;">1.0L</td><td style="padding:8px;border:1px solid #e5e7eb;">1000W</td><td style="padding:8px;border:1px solid #e5e7eb;">SS 304</td><td style="padding:8px;border:1px solid #e5e7eb;">1,320</td></tr></table>
<p style="color:#6b7280;font-size:12px;margin-top:20px;">LAXREE Hospitality Solutions | Product Catalogue | Generated: ${new Date().toLocaleDateString()}</p>`,
  },
  {
    id: 'doc2',
    title: 'Safe Box Installation Manual',
    description: 'Step-by-step installation guide for LAXREE electronic safe boxes with diagrams and troubleshooting flowcharts.',
    category: 'Manual',
    pages: 12,
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    content: `<h2 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:8px;">Safe Box Installation Manual</h2>
<h3>1. Pre-Installation Requirements</h3>
<ul><li>Mounting surface: Solid concrete wall, wooden shelf, or wardrobe cabinet floor</li><li>Tools required: 10mm masonry drill bit, spirit level, Phillips screwdriver, measuring tape</li><li>Clearance: Minimum 5cm on each side, 10cm above for ventilation</li><li>Weight: Safe weighs 8-15kg depending on model — ensure mounting surface can support 3× the safe weight</li></ul>
<h3>2. Mounting Procedure</h3>
<ol><li>Position the safe at the desired location and mark anchor points through the pre-drilled bottom holes</li><li>Using a spirit level, ensure the safe sits perfectly horizontal</li><li>Drill anchor holes using appropriate bit for the surface material</li><li>Insert wall plugs (concrete) or use lag bolts (wood)</li><li>Secure the safe with all 4 anchor bolts, tightening in a cross pattern</li><li>Test stability by applying 15kg downward pressure — the safe must not shift or wobble</li></ol>
<h3>3. Power & Initialization</h3>
<ol><li>Open battery compartment on inside of door</li><li>Insert 4× AA batteries (included) with correct polarity</li><li>LED display flashes — press reset button once</li><li>Enter default master code: 1-2-3-4 then press #</li><li>Display shows "OPEN" — initialization complete</li><li>Set new master code: Press * → enter new 3-8 digit code → press # → re-enter to confirm</li></ol>
<h3>4. Troubleshooting Flowchart</h3>
<ul><li><strong>Safe won't open:</strong> Check batteries → Try master code → Use override key → Contact support</li><li><strong>Display blank:</strong> Replace batteries → Check polarity → Check battery contacts for corrosion</li><li><strong>Code not accepted:</strong> Use master code → If master fails, use override key → Reset code after access</li><li><strong>Door won't close:</strong> Check bolt channel for obstructions → Check hinge pins → Verify door alignment</li></ul>
<p style="color:#6b7280;font-size:12px;margin-top:20px;">LAXREE Hospitality Solutions | Installation Manual | v2.1</p>`,
  },
  {
    id: 'doc3',
    title: 'RFID Lock Configuration Guide',
    description: 'Software setup guide for LAXREE RFID lock systems including card encoding, PMS integration, and system configuration.',
    category: 'Guide',
    pages: 16,
    icon: KeyRound,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    content: `<h2 style="color:#7c3aed;border-bottom:2px solid #7c3aed;padding-bottom:8px;">RFID Lock Configuration Guide</h2>
<h3>1. System Requirements</h3>
<ul><li>Windows 10+ or macOS 12+ for encoder software</li><li>USB 2.0+ port for card encoder</li><li>TCP/IP network connection to PMS server</li><li>LAXREE Encoder Software v4.0+ (download from partner portal)</li></ul>
<h3>2. Card Hierarchy Setup</h3>
<ol><li><strong>Master Card:</strong> Opens ALL locks. Issued to GM and Security Director only. Encode by selecting "Master" in software and scanning an empty card.</li><li><strong>Building Card:</strong> Opens all rooms in a building. Useful for maintenance staff.</li><li><strong>Floor Card:</strong> Opens all rooms on a specific floor. Issued to housekeeping supervisors.</li><li><strong>Guest Card:</strong> Opens assigned room only, valid during stay period. Auto-encoded during PMS check-in.</li><li><strong>Emergency Card:</strong> Overrides all locks, bypasses privacy settings. Kept in secure location.</li></ol>
<h3>3. PMS Integration</h3>
<ul><li><strong>Opera PMS:</strong> Configure LAXREE interface via OHI (Oracle Hospitality Integration) using TCP/IP on port 8080</li><li><strong>Protel:</strong> Use the LAXREE SOAP API connector with WSDL endpoint</li><li><strong>IDS:</strong> Direct database integration via ODBC connection</li><li>Test integration by performing a test check-in and verifying the guest card opens the assigned room</li></ul>
<h3>4. Battery Management Schedule</h3>
<p>For properties with 100+ rooms, implement a proactive battery replacement schedule: Replace all lock batteries every 12 months during low-occupancy periods. Track battery replacements in the LAXREE management software.</p>
<p style="color:#6b7280;font-size:12px;margin-top:20px;">LAXREE Hospitality Solutions | Configuration Guide | v4.0</p>`,
  },
  {
    id: 'doc4',
    title: 'Sales Playbook',
    description: 'Complete LAXREE sales methodology including prospecting scripts, objection handling, closing techniques, and follow-up templates.',
    category: 'Training',
    pages: 32,
    icon: TrendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    content: `<h2 style="color:#d97706;border-bottom:2px solid #d97706;padding-bottom:8px;">LAXREE Sales Playbook</h2>
<h3>Sales Process — 8 Steps to Close</h3>
<h4>Step 1: Prospecting</h4>
<p>Identify potential clients through: (a) Hotel industry directories (HVS, STR), (b) Trade shows (HOTELEX, ATM, ITB), (c) LinkedIn searches for "procurement manager hotel", (d) Referrals from existing clients. Target: 20 new prospects per week.</p>
<h4>Step 2: Research & Qualification</h4>
<p>Before first contact, research: Property name, room count, star rating, current supplier, recent renovations, and decision-maker contact info. Score each lead: A (100+ rooms, renovation planned), B (50-99 rooms), C (under 50 rooms). Focus on A and B leads.</p>
<h4>Step 3: Initial Contact Script</h4>
<p>"Good morning [Name], I'm calling from LAXREE Hospitality Solutions. We help hotels like [similar property] upgrade their in-room amenities while reducing procurement costs by up to 25%. I'd love 15 minutes to show you how — would Tuesday or Thursday work better for a quick call?"</p>
<h4>Step 4: Discovery Meeting</h4>
<p>Ask these 6 key questions: (1) How many rooms? (2) What's the renovation timeline? (3) Who's the current supplier? (4) What's the budget range? (5) Any brand standards to meet? (6) What's the biggest pain point with current amenities?</p>
<h4>Step 5: Product Demonstration</h4>
<p>Bring physical samples for safe boxes and RFID locks. Show video demos for minibars and digital signage. Always demonstrate 3+ products to enable cross-selling. Highlight the "one vendor" advantage throughout.</p>
<h4>Step 6: Objection Handling</h4>
<ul><li><strong>"Too expensive":</strong> Show TCO comparison over 5 years including warranty, maintenance, and energy costs</li><li><strong>"Happy with current supplier":</strong> Offer pilot program for 5-10 rooms at no commitment</li><li><strong>"Need to test first":</strong> Provide demo units for 2-week trial period</li><li><strong>"Board needs to approve":</strong> Provide ROI calculation document and reference letters</li></ul>
<h4>Step 7: Proposal & Quotation</h4>
<p>Include: Product specs, unit pricing, volume discounts, delivery timeline, installation services, warranty terms, and payment options. Always present 3 options: Standard, Premium, and Full Package.</p>
<h4>Step 8: Close & Follow-Up</h4>
<p>Identify all stakeholders (GM, Housekeeping, IT, Finance). Address each concern individually. Offer 2-year warranty extension as closing incentive. Post-close: Schedule installation, send thank-you, set 30-day follow-up.</p>
<p style="color:#6b7280;font-size:12px;margin-top:20px;">LAXREE Hospitality Solutions | Sales Playbook | Confidential</p>`,
  },
  {
    id: 'doc5',
    title: 'Warranty & Service Agreement',
    description: 'Complete warranty terms, service level agreements, and support procedures for all LAXREE products.',
    category: 'Legal',
    pages: 8,
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    content: `<h2 style="color:#059669;border-bottom:2px solid #059669;padding-bottom:8px;">LAXREE Warranty & Service Agreement</h2>
<h3>1. Standard Warranty Terms</h3>
<p>All LAXREE products carry a <strong>3-year standard warranty</strong> from the date of delivery, covering manufacturing defects and component failures under normal use. This is significantly longer than the industry average of 1-2 years.</p>
<h3>2. What's Covered</h3>
<ul><li>Manufacturing defects in materials and workmanship</li><li>Electronic component failures (PCBs, sensors, motors)</li><li>Mechanical failures under normal operation</li><li>Software updates for lock systems and digital signage</li><li>Free replacement of defective parts with shipping covered by LAXREE</li></ul>
<h3>3. What's Not Covered</h3>
<ul><li>Damage caused by misuse, unauthorized modification, or improper installation</li><li>Normal wear and tear (cosmetic scratches, paint fading)</li><li>Battery replacement (considered consumable)</li><li>Damage from natural disasters, power surges, or water immersion</li></ul>
<h3>4. Extended Warranty Options</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;"><tr style="background:#f0fdf4;"><th style="padding:8px;border:1px solid #e5e7eb;">Period</th><th style="padding:8px;border:1px solid #e5e7eb;">Cost (% of product value)</th><th style="padding:8px;border:1px solid #e5e7eb;">Additional Coverage</th></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">4th Year</td><td style="padding:8px;border:1px solid #e5e7eb;">8%</td><td style="padding:8px;border:1px solid #e5e7eb;">Same as standard</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">5th Year</td><td style="padding:8px;border:1px solid #e5e7eb;">6%</td><td style="padding:8px;border:1px solid #e5e7eb;">Same as standard</td></tr>
<tr><td style="padding:8px;border:1px solid #e5e7eb;">Lifetime</td><td style="padding:8px;border:1px solid #e5e7eb;">15%</td><td style="padding:8px;border:1px solid #e5e7eb;">Includes annual maintenance visit</td></tr></table>
<h3>5. Support Channels</h3>
<ul><li><strong>24/7 Technical Hotline:</strong> +91-XXXX-XXXXXX</li><li><strong>Email:</strong> support@laxree.com (4-hour response SLA)</li><li><strong>On-site Service:</strong> Available for 100+ room installations (48-hour response)</li></ul>
<p style="color:#6b7280;font-size:12px;margin-top:20px;">LAXREE Hospitality Solutions | Warranty Terms | Effective: January 2025</p>`,
  },
  {
    id: 'doc6',
    title: 'Quick Reference Card',
    description: 'Product specifications at a glance — handy reference for sales calls and client meetings.',
    category: 'Reference',
    pages: 4,
    icon: BookOpen,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    content: `<h2 style="color:#e11d48;border-bottom:2px solid #e11d48;padding-bottom:8px;">LAXREE Quick Reference Card</h2>
<h3>Mini Bars — Key Specs</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;"><tr style="background:#fff1f2;"><th style="padding:6px;border:1px solid #e5e7eb;">Type</th><th style="padding:6px;border:1px solid #e5e7eb;">Noise</th><th style="padding:6px;border:1px solid #e5e7eb;">Temp</th><th style="padding:6px;border:1px solid #e5e7eb;">Power</th><th style="padding:6px;border:1px solid #e5e7eb;">Best For</th></tr>
<tr><td style="padding:6px;border:1px solid #e5e7eb;">Thermoelectric</td><td style="padding:6px;border:1px solid #e5e7eb;">Silent</td><td style="padding:6px;border:1px solid #e5e7eb;">8-15°C</td><td style="padding:6px;border:1px solid #e5e7eb;">45W</td><td style="padding:6px;border:1px solid #e5e7eb;">Budget</td></tr>
<tr><td style="padding:6px;border:1px solid #e5e7eb;">Absorption</td><td style="padding:6px;border:1px solid #e5e7eb;">0 dB</td><td style="padding:6px;border:1px solid #e5e7eb;">5-12°C</td><td style="padding:6px;border:1px solid #e5e7eb;">60W</td><td style="padding:6px;border:1px solid #e5e7eb;">5-Star</td></tr>
<tr><td style="padding:6px;border:1px solid #e5e7eb;">Compressor</td><td style="padding:6px;border:1px solid #e5e7eb;">&lt;39 dB</td><td style="padding:6px;border:1px solid #e5e7eb;">2-8°C</td><td style="padding:6px;border:1px solid #e5e7eb;">70-90W</td><td style="padding:6px;border:1px solid #e5e7eb;">Tropical</td></tr></table>
<h3>Safe Boxes — Key Specs</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;"><tr style="background:#fff1f2;"><th style="padding:6px;border:1px solid #e5e7eb;">Model</th><th style="padding:6px;border:1px solid #e5e7eb;">Size</th><th style="padding:6px;border:1px solid #e5e7eb;">Power</th><th style="padding:6px;border:1px solid #e5e7eb;">SSP</th></tr>
<tr><td style="padding:6px;border:1px solid #e5e7eb;">LRSB-201</td><td style="padding:6px;border:1px solid #e5e7eb;">Compact</td><td style="padding:6px;border:1px solid #e5e7eb;">4×AA</td><td style="padding:6px;border:1px solid #e5e7eb;">₹3,200</td></tr>
<tr><td style="padding:6px;border:1px solid #e5e7eb;">LRSB-205</td><td style="padding:6px;border:1px solid #e5e7eb;">Standard</td><td style="padding:6px;border:1px solid #e5e7eb;">4×AA</td><td style="padding:6px;border:1px solid #e5e7eb;">₹4,800</td></tr>
<tr><td style="padding:6px;border:1px solid #e5e7eb;">LRSB-209</td><td style="padding:6px;border:1px solid #e5e7eb;">Laptop</td><td style="padding:6px;border:1px solid #e5e7eb;">4×AA</td><td style="padding:6px;border:1px solid #e5e7eb;">₹6,500</td></tr></table>
<h3>Key Selling Points</h3>
<ul><li>3-year warranty (vs 1-2 year industry avg)</li><li>One-stop vendor: 15+ product categories</li><li>15-25% lower TCO vs European brands</li><li>24/7 technical support hotline</li><li>PMS integration: Opera, Protel, IDS</li></ul>`,
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
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null)
  const [practiceIdx, setPracticeIdx] = useState(0)
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null)
  const [practiceRevealed, setPracticeRevealed] = useState(false)
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 })
  const [docViewerOpen, setDocViewerOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<DocumentResource | null>(null)

  const openVideo = (video: VideoLesson) => {
    setSelectedVideo(video)
    setVideoDialogOpen(true)
  }

  const openDoc = (doc: DocumentResource) => {
    setSelectedDoc(doc)
    setDocViewerOpen(true)
  }

  const downloadDoc = (doc: DocumentResource) => {
    const htmlContent = `<!DOCTYPE html><html><head><title>${doc.title}</title><style>body{font-family:'Segoe UI',Tahoma,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#333;line-height:1.6}h2{color:#059669;border-bottom:2px solid #059669;padding-bottom:8px}h3{color:#0d9488;margin-top:24px}h4{color:#047857;margin-top:16px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:8px;border:1px solid #e5e7eb;text-align:left}th{background:#f0fdf4}ul,ol{padding-left:24px}li{margin-bottom:6px}@media print{body{padding:20px}}</style></head><body>${doc.content}<div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px">LAXREE Hospitality Solutions | ${doc.title} | Generated: ${new Date().toLocaleDateString()}</div></body></html>`
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title.replace(/\s+/g, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
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
                <TabsTrigger value="documents" className="gap-1.5 text-xs sm:text-sm">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Documents</span>
                  <span className="sm:hidden">Docs</span>
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

            {/* Tab: Video Lessons */}
            <TabsContent value="video-chapters" className="p-4 mt-0">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-teal-600" />
                  Product Video Lessons
                </h3>
                <p className="text-sm text-gray-500 mt-1">Watch product training lessons with detailed transcripts and key learning points</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VIDEO_LESSONS.map((video, idx) => {
                  const catColor = VIDEO_CATEGORY_COLORS[video.category] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                  return (
                    <motion.button
                      key={video.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openVideo(video)}
                      className="text-left rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                      {/* Video Thumbnail with product image */}
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={video.image}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                            ;(e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-teal-800', 'to-emerald-900')
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-colors">
                            <CirclePlay className="w-6 h-6 text-white" />
                          </div>
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
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Volume2 className="w-3 h-3 text-gray-400" />
                          <span className="text-[11px] text-gray-400">Video Lesson</span>
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

            {/* Tab: Documents & Resources */}
            <TabsContent value="documents" className="p-4 mt-0">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Documents & Resources
                </h3>
                <p className="text-sm text-gray-500 mt-1">Download product manuals, guides, and reference documents</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOCUMENT_RESOURCES.map((doc, idx) => {
                  const Icon = doc.icon
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${doc.bgColor} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${doc.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {doc.category}
                            </Badge>
                            <span className="text-[10px] text-gray-400">{doc.pages} pages</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                          onClick={() => openDoc(doc)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs border-gray-200 text-gray-600 hover:bg-gray-50"
                          onClick={() => downloadDoc(doc)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
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

      {/* Video Lesson Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Video className="w-4 h-4 text-teal-600" />
              {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedVideo?.category} • {selectedVideo?.duration} • Video Lesson
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            {selectedVideo && (
              <>
                {/* YouTube Embed or Product Image */}
                {selectedVideo.youtubeId ? (
                  <div className="rounded-xl overflow-hidden aspect-video mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden mb-4 relative">
                    <img
                      src={selectedVideo.image}
                      alt={selectedVideo.title}
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{selectedVideo.title}</p>
                          <p className="text-white/70 text-xs">{selectedVideo.category} • {selectedVideo.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{selectedVideo.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Transcript */}
                  <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        Lesson Transcript
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {selectedVideo.transcript.map((para, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                            <p className="text-sm text-gray-700 leading-relaxed">{para}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div>
                    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-teal-600" />
                        Key Takeaways
                      </h3>
                      <div className="space-y-2">
                        {selectedVideo.keyPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-700 leading-relaxed">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={docViewerOpen} onOpenChange={setDocViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4 text-teal-600" />
                  {selectedDoc?.title}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedDoc?.category} • {selectedDoc?.pages} pages
                </DialogDescription>
              </div>
              {selectedDoc && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  onClick={() => downloadDoc(selectedDoc)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
            {selectedDoc && (
              <div className="bg-white rounded-lg border shadow-sm p-6" style={{ minHeight: '400px' }}>
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><style>body{font-family:'Segoe UI',Tahoma,sans-serif;padding:20px;max-width:900px;margin:0 auto;color:#333;line-height:1.6;font-size:14px}h2{color:#059669;border-bottom:2px solid #059669;padding-bottom:8px;margin-top:24px}h3{color:#0d9488;margin-top:20px}h4{color:#047857;margin-top:16px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:8px;border:1px solid #e5e7eb;text-align:left}th{background:#f0fdf4}ul,ol{padding-left:24px}li{margin-bottom:6px}p{margin-bottom:8px}strong{color:#047857}</style></head><body>${selectedDoc.content}</body></html>`}
                  className="w-full border-0"
                  style={{ minHeight: '500px', height: '70vh' }}
                  title={selectedDoc.title}
                />
              </div>
            )}
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
