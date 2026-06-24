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
  Lightbulb, RotateCcw, Clock, Star, Layers, Home, Leaf
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
// Two segment-specific academy configs — Amenities (hospitality) and Roofing.
// Each segment gets its own titles, descriptions, and gradient palette so the
// dashboard never shows the wrong product keywords to the wrong user.

const AMENITIES_ACADEMIES = [
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

// Roofing-segment academy cards — every title/description uses roofing keywords
// (stone-coated tiles, thatch, asphalt shingles, installation, dealership) so
// roofing users never see amenities product names (Minibar/Kettle/Safe Locker).
// Gradient palette is amber/orange/stone to match the roofing theme.
const ROOFING_ACADEMIES = [
  { type: 'ORIENTATION', title: 'Company Introduction — Laxree Roofing', emoji: '🏢', icon: Building2,
    description: 'Learn about Laxree Roofing\'s mission, premium roofing products, and Indian market vision',
    gradient: 'from-amber-500 to-amber-700', bgLight: 'bg-amber-50', color: 'amber' },
  { type: 'PRODUCT_ACADEMY', title: 'Roofing Product Academy', emoji: '📦', icon: Package,
    description: 'Master our roofing portfolio — Stone-Coated Tiles, Thatch, Asphalt Shingles & more',
    gradient: 'from-orange-500 to-orange-700', bgLight: 'bg-orange-50', color: 'orange' },
  { type: 'TECHNICAL', title: 'Technical & Installation Learning', emoji: '🔧', icon: Wrench,
    description: 'Installation methods, insulation, roof frames, and waterproofing techniques',
    gradient: 'from-stone-500 to-stone-700', bgLight: 'bg-stone-50', color: 'stone' },
  { type: 'SALES_ACADEMY', title: 'Roofing Sales Academy', emoji: '📈', icon: TrendingUp,
    description: 'Sales methodologies for homeowners, builders, architects & dealers',
    gradient: 'from-amber-500 to-orange-700', bgLight: 'bg-amber-50', color: 'amber' },
  { type: 'HOSPITALITY', title: 'Roofing Industry Academy', emoji: '🏗️', icon: Hotel,
    description: 'Indian roofing market, climate zones, and competitor analysis',
    gradient: 'from-rose-500 to-rose-700', bgLight: 'bg-rose-50', color: 'rose' },
  { type: 'CUSTOMER_DISCOVERY', title: 'Customer Discovery Academy', emoji: '🔍', icon: Search,
    description: 'Understanding roofing buyer personas — homeowners, architects, builders, dealers',
    gradient: 'from-violet-500 to-violet-700', bgLight: 'bg-violet-50', color: 'violet' },
  { type: 'NEGOTIATION', title: 'Negotiation Academy', emoji: '🤝', icon: Handshake,
    description: 'Negotiation for roofing projects, bulk orders & dealership deals',
    gradient: 'from-orange-500 to-amber-700', bgLight: 'bg-orange-50', color: 'orange' },
  { type: 'COMPETITIVE_INTELLIGENCE', title: 'Competitive Intelligence Academy', emoji: '👁️', icon: Eye,
    description: 'DECRA, Gerard, CertainTeed vs Laxree Roofing positioning',
    gradient: 'from-sky-500 to-sky-700', bgLight: 'bg-sky-50', color: 'sky' },
  { type: 'FIELD_SALES', title: 'Field Sales Academy', emoji: '🗺️', icon: MapPin,
    description: 'On-site roofing sales — villa visits, site surveys, dealer meetings',
    gradient: 'from-lime-600 to-green-700', bgLight: 'bg-lime-50', color: 'lime' },
  { type: 'INBOUND_SALES', title: 'Inbound Sales Academy', emoji: '📞', icon: PhoneIncoming,
    description: 'Handling roofing inquiries — phone, WhatsApp, walk-in dealer leads',
    gradient: 'from-fuchsia-500 to-fuchsia-700', bgLight: 'bg-fuchsia-50', color: 'fuchsia' },
  { type: 'CERTIFICATION_PREP', title: 'Certification Center', emoji: '🏆', icon: Award,
    description: 'Prepare for roofing certifications and assessments',
    gradient: 'from-yellow-500 to-amber-600', bgLight: 'bg-yellow-50', color: 'yellow' },
  { type: 'MOCK_SIMULATOR', title: 'Mock Sales Simulator', emoji: '🎭', icon: MonitorPlay,
    description: 'Practice roofing sales scenarios with AI-powered simulations',
    gradient: 'from-red-500 to-red-700', bgLight: 'bg-red-50', color: 'red' },
  { type: 'AI_COACH', title: 'AI Sales Coach', emoji: '🤖', icon: Brain,
    description: 'AI-powered coaching and personalized guidance for roofing sales',
    gradient: 'from-purple-500 to-purple-700', bgLight: 'bg-purple-50', color: 'purple' },
  { type: 'CROSS_SELLING', title: 'Cross Selling Academy', emoji: '🔄', icon: RefreshCw,
    description: 'When a client wants stone-coated tiles, upsell insulation, ridge accessories & thatch for gazebos',
    gradient: 'from-amber-600 to-orange-700', bgLight: 'bg-amber-50', color: 'amber' },
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

const AMENITIES_STUDY_CHAPTERS: StudyChapter[] = [
  {
    id: 'ch1',
    title: 'Company Introduction',
    icon: Building2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Learn about LAXREE — a premium hotel amenities manufacturer serving the global hospitality industry.',
    content: [
      'LAXREE was established with a singular founding vision: to bridge the gap between the premium quality expected by international hotel brands and the cost efficiency demanded by modern hospitality procurement. From our inception, we recognized that hotel operators were often forced to choose between expensive European brands with superior quality and affordable alternatives that compromised on reliability and guest satisfaction. LAXREE was created to eliminate this compromise entirely. Our founders brought together decades of experience in hospitality technology, manufacturing excellence, and global supply chain management to build a company that could deliver world-class products at competitive price points. Today, that founding vision continues to guide every product we design, every component we source, and every relationship we build with our hotel partners around the world.',
      'Our mission statement — "To provide world-class hotel amenities that combine cutting-edge technology with elegant design, ensuring both guest satisfaction and operational efficiency for hotel management" — is more than a slogan; it is the operational blueprint that drives every department within LAXREE. We believe that hotel amenities should never be an afterthought. A safe box that fails during a guest stay, a door lock that malfunctions at check-in, or a minibar that cannot maintain temperature — these are not minor inconveniences but critical failures that directly impact guest satisfaction scores, online reviews, and ultimately revenue per available room (RevPAR). Our mission compels us to engineer products that perform flawlessly under the demanding conditions of daily hotel operations, where devices are used by hundreds of different guests with varying levels of familiarity and care.',
      'LAXREE operates on six core values that define our corporate culture and guide our business decisions. First, Quality First — we never compromise on material specifications or manufacturing tolerances, even when cost pressures exist. Second, Innovation Continuously — we invest over 8% of annual revenue into research and development, ensuring our products incorporate the latest advancements in security technology, energy efficiency, and smart connectivity. Third, Customer Partnership — we view every sale as the beginning of a long-term relationship, not the end of a transaction. Fourth, Global Standard, Local Service — while our products meet the highest international standards, our support teams understand the unique requirements of each regional market. Fifth, Sustainability Responsibility — we are committed to reducing the environmental footprint of our manufacturing processes and our products throughout their lifecycle. Sixth, Integrity Always — we conduct business with transparency, honesty, and respect for all stakeholders.',
      'LAXREE has established a formidable global presence spanning over 60 countries across six continents. Our headquarters and primary manufacturing campus are located in a state-of-the-art facility covering more than 50,000 square meters, equipped with advanced CNC machinery, automated assembly lines, and dedicated quality control laboratories. In addition to our main campus, we maintain regional offices and warehousing facilities in Dubai (serving the Middle East and Africa), Singapore (covering Southeast Asia and Oceania), and Rotterdam (supporting European distribution). This strategically distributed logistics network enables us to maintain delivery lead times of 2-4 weeks for standard orders and 6-8 weeks for customized projects, significantly outperforming competitors who typically require 8-12 weeks for international shipments. Our global distribution partners are carefully selected and trained to provide installation, maintenance, and after-sales support that meets LAXREE standards.',
      'Our comprehensive product portfolio encompasses over 15 major product categories, making LAXREE one of the few truly one-stop suppliers in the hospitality amenities industry. The portfolio includes: Electronic Safe Boxes (available in Compact, Standard, and Laptop sizes with digital keypad and RFID options), RFID Door Locks (featuring 13.56MHz Mifare technology with full PMS integration), Minibars (offering Absorption, Compressor, and Thermoelectric technologies in multiple capacities), Electric Kettles (ranging from 0.6L to 1.0L in stainless steel, plastic, and glass body options), Tea and Coffee Maker Trays, Illuminated and LED Mirrors, Professional Hair Dryers, Digital Signage and Room Information Displays, Bathroom Dispensers for shampoo, body wash, and lotion, Luggage Racks in wood and metal designs, Hotel Hangers in various materials including wood and velvet, Dustbins and Waste Bins in multiple sizes and finishes, Rollaway and Folding Beds, Iron and Ironing Board Sets, and a comprehensive range of Add-on accessories including door closers, peepholes, and room number signs.',
      'Quality certification is not merely a compliance exercise at LAXREE — it is embedded in our organizational DNA. Every product line carries the CE marking, demonstrating conformity with European Union health, safety, and environmental protection standards. Our RoHS compliance ensures that all electronic components are free from hazardous substances including lead, mercury, and cadmium. We maintain ISO 9001:2015 certification for our quality management system, undergoing annual surveillance audits by internationally accredited certification bodies. Additionally, our electronic safe boxes are independently tested and certified by leading security laboratories to meet EN 14450 and EN 1143 standards for burglary resistance. Our RFID door locks have passed rigorous testing protocols including salt spray corrosion testing (over 96 hours), lifecycle endurance testing (exceeding 200,000 operations), and electromagnetic compatibility testing per EN 61000 standards. These certifications provide our hotel clients with documented assurance that LAXREE products will perform reliably in the most demanding hospitality environments.',
      'Our manufacturing capabilities represent a significant competitive advantage that enables LAXREE to deliver consistent quality at scale. The production facility operates on a vertically integrated model where approximately 70% of components are manufactured in-house, including sheet metal fabrication, electronic circuit board assembly, plastic injection molding, and surface finishing. This vertical integration provides us with complete control over production schedules, quality at every manufacturing stage, and the agility to accommodate custom orders without the delays typically associated with external supplier dependencies. Our facility operates three production shifts with a combined daily output capacity of over 2,000 safe boxes, 1,500 door locks, and 800 minibars. Each production line incorporates statistical process control (SPC) methodology, and every finished unit undergoes a comprehensive functional test before packaging and shipment.',
      'Research and development is the engine that drives LAXREE product innovation. Our R&D team of over 40 engineers specializes in mechanical design, electronic engineering, firmware development, and software integration. We maintain dedicated laboratories for environmental testing (temperature cycling, humidity exposure, salt spray), mechanical testing (impact resistance, cycle endurance, force measurement), and electronic testing (EMC compliance, battery life optimization, wireless communication validation). Our current R&D pipeline includes next-generation smart locks with Bluetooth Low Energy and NFC capabilities, IoT-connected minibars with cloud-based inventory management, and AI-powered predictive maintenance systems that can alert hotel engineering teams to potential equipment failures before they occur. We file an average of 12-15 new patents annually, protecting our innovations in lock mechanism design, sensor technology, and energy management systems.',
      'Client testimonials and success stories provide compelling evidence of LAXREE impact on hotel operations. The Grand Hyatt Dubai, a 674-room luxury property, reported a 92% reduction in guest complaints related to room amenities within the first year after switching to LAXREE products. The property replaced 1,800 safe boxes, 674 door locks, and 500 minibars in a phased renovation project completed in just 6 weeks. The Novotel Bangkok Sukhumvit, a 380-room business hotel, achieved a 30% reduction in housekeeping time per room after installing LAXREE smart minibars with automatic consumption tracking, eliminating the need for manual minibar checks. The Ritz-Carlton Doha selected LAXREE as their preferred amenities supplier for their 237-room beachfront property, citing the superior finish quality and seamless PMS integration as decisive factors. These success stories demonstrate that LAXREE products deliver measurable operational benefits across diverse property types and market segments.',
      'LAXREE competitive positioning is strategically designed to occupy the premium-value segment of the hospitality amenities market. When compared to established European brands such as Saflok, Onity, and Dometic, LAXREE offers products of comparable or superior technical specification at price points 15-25% lower. This pricing advantage is not achieved through quality compromises but through manufacturing efficiency gains from our vertically integrated production model, lower labor costs in our manufacturing geography, and strategic sourcing of raw materials. When compared to Chinese budget brands, LAXREE differentiates on multiple dimensions: superior material quality (we use thicker gauge steel, higher-grade electronic components, and premium surface finishes), more comprehensive quality control processes, better warranty terms, and significantly stronger after-sales support infrastructure. This dual competitive positioning allows LAXREE sales representatives to compete effectively against both premium and budget competitors.',
      'Sustainability is a growing priority for the hospitality industry, and LAXREE has proactively integrated environmental responsibility into our product design and manufacturing operations. All LAXREE minibars utilize R600a (isobutane) refrigerant, which has a Global Warming Potential (GWP) of just 3 compared to R134a with a GWP of 1,430 — a reduction of over 99% in climate impact. Our electronic products are designed for energy efficiency, with safe boxes consuming less than 50 microamps in standby mode and door locks optimized for extended battery life, reducing battery waste by up to 40% compared to competitor products. Our manufacturing facility has implemented a comprehensive waste reduction program that has decreased landfill contributions by 65% over the past three years, and we have committed to achieving carbon neutrality in our operations by 2030. These sustainability credentials are increasingly important as hotel brands set environmental targets and seek suppliers who can help them achieve their ESG goals.',
      'After-sales support is the cornerstone of the LAXREE customer experience philosophy. We understand that in the hospitality industry, product downtime directly translates to guest dissatisfaction and potential revenue loss. To minimize this risk, we have built a comprehensive support infrastructure that includes a 24/7 technical support hotline staffed by trained engineers (not call center agents), a global network of over 200 certified service technicians available for on-site support, regional spare parts warehouses strategically located to ensure 48-hour delivery of any replacement component, remote diagnostic capabilities for lock systems and smart minibars that allow our engineers to troubleshoot issues without a site visit, and a comprehensive online knowledge base with video tutorials, troubleshooting guides, and firmware update instructions. For large installations exceeding 200 rooms, we provide a dedicated account engineer who conducts quarterly site visits, performs preventive maintenance checks, and serves as the single point of contact for all technical matters.',
      'LAXREE has cultivated strategic partnerships with leading hospitality technology providers to ensure seamless integration of our products into the broader hotel technology ecosystem. Our RFID door lock system is certified for integration with all major Property Management Systems including Oracle Opera (versions 5.5 and Cloud), Protel (On-Premise and MPE), IDS Next (Fortune and Enterprise), and many regional PMS platforms. We are an authorized technology partner with Assa Abloy Hospitality for select integration projects and maintain working relationships with building management system providers including Honeywell, Siemens, and Schneider Electric. These partnerships ensure that when a hotel selects LAXREE products, they can be confident that the installation will integrate smoothly with their existing technology infrastructure without costly custom development or operational disruptions.',
      'Corporate governance and business ethics are fundamental to how LAXREE operates as a responsible global enterprise. We maintain a comprehensive code of conduct that applies to all employees, officers, and business partners worldwide. Our anti-corruption policy strictly prohibits any form of bribery, kickback, or improper inducement in connection with business transactions, and all employees complete annual compliance training. We conduct due diligence on all distributors and agents before onboarding, and our contracts include specific anti-corruption representations and warranties. LAXREE is committed to fair labor practices throughout our supply chain, and our supplier code of conduct prohibits child labor, forced labor, and unsafe working conditions. We publish an annual corporate responsibility report detailing our performance in environmental stewardship, labor practices, and community engagement.',
      'Looking ahead, LAXREE strategic roadmap is focused on three key growth pillars. First, Smart Room Technology — we are investing heavily in developing a comprehensive IoT platform that will connect all LAXREE in-room products into a unified smart room ecosystem, enabling features such as voice-activated safe access, automated minibar restocking through AI-powered demand forecasting, and real-time room status monitoring for housekeeping optimization. Second, Geographic Expansion — we are establishing new regional offices in Latin America and sub-Saharan Africa to capitalize on the rapid growth in hotel construction in these emerging markets. Third, Service Recurring Revenue — we are transitioning our business model to include subscription-based software services, remote monitoring contracts, and preventive maintenance agreements that provide recurring revenue while strengthening long-term customer relationships. These strategic initiatives position LAXREE for sustained growth and market leadership in the evolving hospitality technology landscape.',
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
      'LAXREE electronic safe boxes represent the flagship product category of our hospitality portfolio, trusted by over 3,000 hotel properties worldwide. The current product range includes three primary models designed to meet the diverse storage needs of hotel guests across all property segments. The Compact model (LER-20) is specifically engineered for budget and select-service hotels where wardrobe space is limited, featuring external dimensions of 200mm (H) x 310mm (W) x 200mm (D) and an internal capacity of approximately 12 liters, sufficient for storing passports, cash, jewelry, and small personal electronics such as smartphones. The Standard model (LER-30) is our best-selling unit, designed for 3-star and 4-star properties, with external dimensions of 200mm (H) x 420mm (W) x 370mm (D) and a generous 31-liter internal capacity that accommodates standard document folders, tablets, and camera equipment in addition to personal valuables. The Laptop model (LER-40) is purpose-built for 4-star and 5-star business hotels, featuring external dimensions of 200mm (H) x 430mm (W) x 500mm (D) with a 43-liter capacity that comfortably stores laptops up to 17 inches along with other valuables.',
      'The digital keypad system on LAXREE electronic safes has been engineered for intuitive guest operation while maintaining bank-grade security. The keypad features backlit rubber keys that provide tactile feedback and remain clearly visible in low-light wardrobe conditions. The LED display shows operational status, battery level, and code entry progress with clear visual indicators. User codes can be programmed from 3 to 8 digits, allowing guests to select a memorable PIN of their preferred length. The code programming sequence is designed to be self-explanatory: the guest simply closes the door, enters their desired code, and presses the lock key — the safe confirms with an audible beep and the display shows a closed lock icon. For returning guests, the safe retains the last user code until it is changed, providing a consistent experience for extended-stay visitors.',
      'The master code system provides hotel management with essential administrative control over all safe units in the property. Each safe is factory-configured with a default master code (1234#) that must be changed during initial installation. The master code serves three critical functions: it can open any safe in the property regardless of the guest code currently set, it can be used to delete a guest code when a guest checks out and the safe is found locked, and it provides access to the programming menu where the master code itself can be changed and additional administrative functions can be configured. We recommend that properties assign master code management to the front desk or security department, with the code changed quarterly as a security best practice. The master code hierarchy also supports a secondary management code (sometimes called the supervisor code) that can open safes but cannot change the master code, providing an additional layer of access control delegation.',
      'Emergency access is a critical safety and operational requirement for hotel safe boxes, and LAXREE provides multiple redundancy mechanisms to ensure that valuables are never permanently inaccessible. The primary emergency access method is the override key system. Each safe unit is supplied with two unique override keys that are mechanically coded to match the lock cylinder of that specific unit. The keyhole is concealed behind a removable plastic cover panel on the front face of the safe, typically located between the keypad and the door handle. To use the override key, the cover panel is pried off using a coin or flat tool, the key is inserted and turned clockwise while the handle is pulled, and the door opens. The cover panel then snaps back into place. Hotel management must maintain a secure key register, storing override keys in a locked cabinet at the front desk or in the security office, with sign-out procedures documented in the hotel standard operating procedures.',
      'Proper installation is essential for both the security functionality and the guest experience of LAXREE electronic safes. The installation process begins with selecting the optimal location within the guest room. The recommended position is inside the wardrobe cabinet on a fixed shelf, at a height between 900mm and 1200mm from the floor — this range ensures comfortable access for most guests without requiring bending or stretching. The safe must be positioned with at least 50mm clearance on the hinged side to allow the door to open fully, and 20mm clearance at the back for ventilation of electronic components. The shelf or surface must be capable of supporting the weight of the safe plus contents (ranging from 5kg for the Compact to 14kg for the Laptop model when fully loaded). Using the pre-drilled anchor holes in the base of the safe (two holes for Compact, four holes for Standard and Laptop models), the safe is secured to the shelf using the provided expansion anchors and bolts. For concrete or masonry surfaces, use the 8mm masonry drill bit provided in the installation kit.',
      'Battery management is a crucial aspect of safe box maintenance that directly impacts guest satisfaction and operational efficiency. All LAXREE electronic safes are powered by four AA (1.5V) alkaline batteries, which under normal usage conditions provide approximately 12 months of operation or roughly 10,000 lock/unlock cycles. The battery compartment is located on the inside of the door, accessible only when the safe is open, which prevents tampering from outside. When battery voltage drops below the operational threshold of approximately 4.5V, the safe provides two advance warnings: the LED display shows a low-battery icon, and a short beep sounds each time the safe is opened. These warnings begin approximately 4-6 weeks before battery failure, providing housekeeping and maintenance teams ample time to schedule replacement. When replacing batteries, the safe retains all programmed codes in non-volatile memory for a minimum of 30 seconds, allowing sufficient time to swap batteries without data loss. We strongly recommend using only high-quality alkaline batteries from reputable brands, as cheaper zinc-carbon batteries have inconsistent voltage output that can cause erratic keypad behavior.',
      'The security features of LAXREE electronic safes have been designed to address the specific threat landscape of hotel environments. The auto-lock function engages the locking bolts within 5 seconds of the door being closed, ensuring the safe cannot be accidentally left unlocked by a departing guest. The wrong code penalty system introduces progressively longer lockout periods after consecutive incorrect code entries: after 3 wrong attempts, the keypad is disabled for 3 minutes; after 5 wrong attempts, the lockout extends to 15 minutes; and after 10 consecutive wrong attempts, the safe enters an extended lockout mode requiring master code or override key access. This graduated response prevents both casual tampering by unauthorized individuals and brute-force code attacks. The locking mechanism itself employs two solid steel bolts, each 16mm in diameter, that engage into reinforced steel receptacles in the safe body, providing resistance against pry attacks. The door hinge is internal and not accessible from outside, and the door overlap design prevents wedge attacks.',
      'Construction and material specifications of LAXREE electronic safes reflect our commitment to providing genuine security, not merely the appearance of security. The safe body is constructed from 2mm thick cold-rolled steel sheet, while the door plate uses 3mm thick steel for enhanced resistance against physical attack. All steel components are treated with an anti-corrosion phosphate coating before the final powder coat finish is applied, ensuring long-term rust resistance even in humid tropical environments. The powder coat finish is available in standard colors (matte black, light grey, and dark grey) and can be customized to match specific hotel interior design requirements for orders exceeding 100 units. The interior of the safe is lined with a soft fabric material (velvet or felt, depending on the model) to prevent scratches on valuable items, and includes an interior LED light that illuminates automatically when the door is opened, providing visibility in dark wardrobe environments.',
      'Troubleshooting is an essential skill for hotel maintenance staff and LAXREE sales representatives who may be called upon to assist clients. The most common issue reported is a forgotten guest code. The resolution procedure is straightforward: using the master code, enter the code followed by the # key, and the safe will open. If the master code has been changed and the current code is unknown, use the override key as described in the emergency access section. After opening the safe via master code or override key, the guest code can be reset by pressing the red reset button located on the inside of the door near the hinge, then programming a new code. The second most common issue is a non-responsive keypad, which is almost always caused by depleted batteries. Replace all four AA batteries with fresh alkaline batteries, ensuring correct polarity. If the keypad still does not respond after battery replacement, check the battery contact springs for corrosion — in rare cases of battery leakage, the contacts may need to be cleaned with isopropyl alcohol and a cotton swab.',
      'Additional troubleshooting scenarios include: the safe door will not close properly, which is typically caused by an obstruction in the bolt channel — inspect the locking bolt area for debris or a misaligned interior liner and remove any obstruction; the keypad beeps continuously, which indicates a stuck key — press each key individually to identify and release the stuck key; the display shows error code E1, which indicates a motor or solenoid failure — this requires replacement of the lock mechanism and should be reported to LAXREE technical support; the display shows error code E2, which indicates an internal wiring disconnection — open the safe using the override key and check the wiring harness connection between the keypad and the lock body. For any error condition that cannot be resolved through these basic procedures, contact the LAXREE 24/7 technical support hotline with the safe serial number (located on the rating label inside the door) and a description of the symptoms.',
      'Sales talking points for LAXREE electronic safes must be tailored to the specific hotel segment being addressed. For budget and select-service hotels (2-3 star), the primary selling proposition is value and reliability — emphasize the compact size that fits into limited wardrobe space, the competitive unit price that delivers a strong return on investment, the low maintenance requirements that reduce operational costs, and the guest peace of mind that translates into positive online reviews. For full-service hotels (4 star), the focus shifts to the balance of security and guest experience — highlight the intuitive keypad operation that requires no guest instruction, the laptop-safe capacity that business travelers expect, the master code system that streamlines housekeeping and front desk operations, and the premium finish options that complement room design. For luxury hotels (5 star), the emphasis is on exclusivity and customization — discuss bespoke finishes matching room interiors, RFID-enabled safe access integrated with the room key card, interior lighting and velvet lining as standard, and the dedicated account management that ensures flawless performance.',
      'When positioning LAXREE safe boxes against competitive products, it is important to understand the specific advantages that differentiate our offering. Against European brands such as Saflok and Elsafe (Dormakaba), LAXREE offers equivalent security specifications (steel thickness, bolt diameter, lock mechanism quality) at a price point 15-25% lower, with the added advantage of shorter delivery lead times and more responsive after-sales support in Asian and Middle Eastern markets. Against Chinese budget brands, LAXREE differentiates on material quality (we use thicker steel, higher-grade lock mechanisms, and better surface finishes), software reliability (our firmware has been refined through over 10 years of field deployment and is extremely stable), warranty terms (3 years standard versus the typical 1 year offered by budget brands), and the comprehensive after-sales support infrastructure described earlier. A powerful competitive argument is the total cost of ownership (TCO) analysis, which demonstrates that when maintenance costs, replacement costs for failed units, and the operational cost of guest complaints are factored in, LAXREE safes deliver a lower TCO than both premium and budget competitors over a 7-year product lifecycle.',
      'Warranty and service information for LAXREE electronic safes reflects our confidence in product quality and our commitment to long-term customer satisfaction. The standard warranty period is 3 years from the date of delivery, covering all manufacturing defects in materials and workmanship. This warranty is significantly longer than the industry average of 1-2 years and demonstrates our confidence in the durability of our products. During the warranty period, LAXREE will repair or replace any defective unit at no charge, including shipping costs for replacement units. The warranty does not cover damage caused by misuse, unauthorized modification, or natural disasters. For properties with more than 200 rooms, we offer an optional extended warranty program that extends coverage to 5 years and includes one annual preventive maintenance visit by a certified LAXREE technician. All warranty claims are processed through our dedicated service portal, with a target resolution time of 48 hours for standard claims and 24 hours for urgent claims involving guest-facing impact.',
      'Preventive maintenance best practices for LAXREE electronic safes are designed to maximize product lifespan and minimize guest-facing failures. We recommend the following maintenance schedule: monthly visual inspection of each safe for physical damage, door alignment, and proper closing; quarterly battery testing using a multimeter to verify voltage above 4.8V and proactive replacement of batteries below this threshold; semi-annual lubrication of the locking bolt mechanism using a dry PTFE-based lubricant (never use oil-based lubricants, which attract dust and can cause mechanism sticking); annual comprehensive inspection including keypad responsiveness testing, override key functionality verification, and interior cleaning. Hotels that implement this preventive maintenance program consistently report safe-related guest complaints below 0.1% of occupied room-nights, compared to the industry average of 0.5% for properties without structured maintenance programs.',
      'The ordering and customization process for LAXREE electronic safes is designed to accommodate both standard and bespoke requirements. For standard orders, we maintain inventory of the three primary models in our most popular finishes, with typical delivery times of 2-4 weeks depending on order quantity and destination. Custom orders — including non-standard finishes, branded logo engraving on the keypad surround, custom interior colors, and special firmware configurations — require a minimum order quantity of 100 units and a lead time of 6-8 weeks. Each order includes the safe units, two override keys per unit, four AA batteries per unit (pre-installed), an installation kit with masonry anchors and bolts, and a quick-start guide in multiple languages. Bulk packaging is designed for efficient logistics, with each unit individually boxed in protective foam packaging and palletized for container shipping.',
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
      'LAXREE RFID Door Locks utilize 13.56MHz Mifare technology, the global standard for contactless smart card applications in the hospitality industry. This frequency band offers significant advantages over older 125kHz proximity technology: higher data capacity (1KB or 4KB per card versus 26-40 bits), stronger encryption capabilities (Mifare Classic uses Crypto-1 encryption; Mifare DESFire supports AES-128), and compliance with ISO 14443 Type A standards that ensure interoperability with card readers and encoding equipment worldwide. The 13.56MHz operating frequency also provides an optimal read range of 2-5 centimeters, which is close enough to prevent accidental reads from adjacent doors while allowing guests to simply tap the card without precise alignment — a critical usability consideration for guests carrying luggage or moving through corridors. Our lock firmware supports both Mifare Classic 1K and Mifare DESFire EV1/EV2 card types, providing flexibility in card selection based on the security requirements and budget of each property.',
      'The card hierarchy system is the backbone of LAXREE RFID lock access control, providing granular permission management that mirrors the organizational structure of hotel operations. At the top of the hierarchy is the Master Card, which opens every lock in the entire property. This card is issued exclusively to the General Manager and the Director of Security, and its use is logged with a timestamp in the lock audit trail. The Building Card opens all rooms within a designated building — essential for large resort properties with multiple building clusters. The Floor Card provides access to all rooms on a specific floor, typically issued to floor supervisors and housekeeping managers. The Guest Card is programmed to open only one specific room during a defined time window (check-in date/time to check-out date/time), and can optionally be configured to also open common area locks such as the fitness center, pool, and business center. The Emergency Card overrides all locks immediately, including those in privacy mode, and is intended for use by security personnel in life-safety situations only. Additional card types include the Staff Card for maintenance crew access to service areas, and the Meeting Room Card for conference attendees.',
      'Property Management System (PMS) integration is critical for modern hotel operations, and LAXREE has invested significantly in developing robust, certified integration solutions for all major PMS platforms. For Oracle Opera, the industry-leading PMS used by the majority of luxury and upscale hotel chains, LAXREE provides a certified interface that communicates via the Opera IDS (Integrated Door System) protocol. When a guest checks in at the front desk, Opera generates an encode command that is transmitted to the LAXREE card encoder, which writes the guest access permissions to the RFID card in under 2 seconds. The integration also supports automatic card cancellation at check-out, guest name display on the lock (available on models with LCD display), and real-time lock event logging back to the Opera system. For Protel PMS, integration is achieved through the LAXREE middleware server, which translates Protel encoding commands into the LAXREE lock protocol. The middleware runs as a Windows service and requires minimal configuration — typically 2-4 hours for initial setup and testing. For IDS Next, a popular PMS in the Asian market, LAXREE offers a native API integration that supports all encoding and decoding functions without middleware.',
      'The installation procedure for LAXREE RFID door locks has been designed to be straightforward for qualified carpentry and locksmith contractors, with typical installation time of 20-30 minutes per door for new door preparation and 10-15 minutes for retrofit installations where the door is already prepared. The lock fits standard door preparations with a 60mm backset, which is the most common configuration in hotel doors worldwide. The mortise lock body measures 185mm x 75mm x 20mm and requires a mortise pocket of 190mm x 80mm x 22mm cut into the door edge. The faceplate measures 240mm x 28mm and is fixed to the door edge with four countersunk screws. On the door surface, the outside reader assembly requires a 54mm diameter hole for the handle spindle and a 16mm diameter hole for the lock cylinder, plus four screw holes for the mounting plate. The inside handle assembly requires matching holes and a 12mm hole for the battery compartment access. All mounting hardware, a drilling template, and a detailed installation manual are included with each lock unit.',
      'Battery management for LAXREE RFID door locks is a critical operational consideration, as a dead lock battery directly impacts guest room access. Each lock unit is powered by four AA (1.5V) alkaline batteries housed in a compartment on the inside of the door, accessible without tools by sliding the battery cover downward. Under normal usage conditions (approximately 50-80 card presentations per day in a hotel environment), the batteries provide 12-18 months of operation. The lock firmware includes sophisticated power management features: after each card read, the lock enters a deep sleep mode consuming less than 20 microamps, waking only when the RF antenna detects a card in proximity. When battery voltage drops below the threshold of approximately 4.5V, the lock provides advance warning through two mechanisms: the LED indicator flashes red three times after each successful card read, and the lock emits five short beeps. These warnings begin approximately 4-8 weeks before complete battery failure, depending on usage volume. Importantly, even when the batteries are completely depleted, the lock can always be opened from the inside (anti-panic function) and from the outside using the emergency mechanical key.',
      'The audit trail capability of LAXREE RFID door locks provides hotel management with a comprehensive record of all access events, which is essential for security investigations, liability disputes, and operational analysis. Each lock stores up to 1,000 of the most recent events in non-volatile memory, with each record containing the event timestamp, the card type used (Master, Guest, Staff, Emergency), the card number, and the event type (successful access, access denied, door opened, door closed, low battery warning, privacy mode activated). The audit trail can be retrieved using the LAXREE handheld data collector, which connects to the lock via an infrared port on the inside reader assembly, or through the wireless network interface available on our smart lock models. The data can then be exported to the LAXREE Lock Management Software for analysis, reporting, and archiving. In the event of a security incident such as a theft from a guest room, the audit trail can definitively establish who accessed the room and when, providing evidence that can be critical for insurance claims and law enforcement investigations.',
      'Emergency procedures for LAXREE RFID door locks are designed with guest safety as the paramount priority. The anti-panic exit function is a mandatory safety feature: the inside handle always allows free egress regardless of the lock electronic state, even if the batteries are dead or the lock is in privacy mode. This ensures that a guest can always exit the room in an emergency, including fire situations, without needing any key card or tool. For emergency entry from outside, each lock is equipped with a mechanical key cylinder hidden behind a removable cover plate on the outside reader assembly. The mechanical key uses a high-security dimple key profile that is extremely difficult to duplicate without the original key blank and cutting code. For properties that require centralized emergency override capability, LAXREE offers the Emergency Card system — a special card that immediately overrides any lock in the property, including those in privacy mode, deadbolt engaged, or low battery state. The use of Emergency Cards is logged in the audit trail and should be governed by strict hotel security protocols.',
      'Software configuration and card encoding are managed through the LAXREE Lock Management Software (LMS), a Windows-based application that serves as the central control platform for the entire lock system. The LMS provides the following core functions: property configuration (defining buildings, floors, and rooms in a hierarchical structure), card encoding (writing access permissions to Mifare cards via the USB-connected encoder), card cancellation (invalidating lost or stolen cards without requiring a visit to each lock), lock programming (setting operational parameters such as auto-relock time, privacy mode behavior, and passage mode schedules), audit trail retrieval and analysis, and user account management with role-based access control. The LMS communicates with individual locks through the card encoding process — when a new card is encoded, it carries not only the access permissions for the guest but also any system configuration updates that need to be applied to the lock, which are transmitted when the card is presented to the lock. This card-based update mechanism eliminates the need for physical network connections to each lock.',
      'Troubleshooting LAXREE RFID door locks requires a systematic approach that begins with identifying the symptom category. If a card does not open the lock: first verify the card type and that it has the correct room permissions by reading it on the encoder; check that the card has not expired (guest cards are time-limited); try a different card of the same type to rule out a damaged card; check battery level by observing the LED behavior when a card is presented (no LED response typically indicates dead batteries); if the lock has a mechanical override, test with the emergency key to confirm the mortise mechanism is functioning. If the lock beeps but does not unlock: this typically indicates a valid card read but a mechanical issue with the mortise — check that the door is properly aligned and that the strike plate is correctly positioned; the latch bolt may be obstructed by a misaligned strike plate or a door that has settled out of alignment. If the lock intermittently fails to read cards: clean the card reader surface with a soft dry cloth; check for sources of electromagnetic interference near the lock (fluorescent light ballasts, electric motors); verify that the card type matches the lock firmware configuration.',
      'The sales approach for LAXREE RFID door locks must be calibrated to the size and type of the property. For small properties (under 50 rooms), the key selling points are ease of use (standalone encoding without PMS integration is simple and affordable), the elimination of key management headaches (no more physical key tracking), and the professional guest experience that contactless cards provide. For mid-size properties (50-200 rooms), emphasize the PMS integration capabilities that automate card encoding at check-in, the audit trail that enhances security accountability, and the card hierarchy that simplifies staff access management. For large properties and chains (200+ rooms), the focus shifts to scalability (our system manages properties with over 1,000 rooms), the networked smart lock option with real-time monitoring, the centralized management platform that can control locks across multiple properties, and the total cost of ownership advantage over premium European brands. For every property size, the demonstration of a live card encode-and-open sequence is the most powerful sales tool — watching a card being encoded and immediately opening a lock creates a visceral understanding of the system speed and reliability.',
      'Competitive advantages of LAXREE RFID door locks are substantial and multi-dimensional when compared to both premium and budget alternatives. Against Dormakaba (Saflok) and Assa Abloy (VingCard), LAXREE offers comparable Mifare technology and mortise quality at a significantly lower price point, with faster delivery times in our core markets and more responsive local technical support. Against Onity, LAXREE differentiates through superior PMS integration breadth (we support more PMS platforms out of the box), a more intuitive lock management software interface, and the option for wireless networking that Onity does not offer at comparable price points. Against Chinese budget lock brands, LAXREE provides materially superior mortise mechanism quality (our mortise is tested to over 200,000 cycles versus the typical 50,000 cycles of budget brands), more reliable card read performance, comprehensive PMS integration (most budget brands offer limited or no PMS support), and warranty and support that budget brands simply cannot match. The LAXREE 3-year warranty, 24/7 technical support hotline, and regional spare parts availability provide peace of mind that is invaluable to hotel operators who cannot afford lock system downtime.',
      'The LAXREE RFID door lock product range includes multiple models to suit different door types, design preferences, and budget levels. The LRL-100 is our standard model featuring a polished stainless steel handle and a compact reader assembly with LED indicator — ideal for 3-star and 4-star properties. The LRL-200 adds a backlit LCD display that shows the guest name, room number, and battery status, providing an upscale touch for 4-star and 5-star properties. The LRL-300 is our premium model with a wider reader panel, touch-sensitive keypad for PIN code entry as a backup to card access, and available in satin brass, satin chrome, and PVD gold finishes to complement luxury room interiors. All three models share the same mortise lock body and Mifare technology platform, ensuring that properties can mix models across different room categories while maintaining a unified card and management system. The LRL-500 is our smart lock model with built-in Bluetooth Low Energy and Wi-Fi connectivity, enabling mobile key functionality (guests can open their room using a smartphone app) and real-time lock monitoring through the cloud-based management platform.',
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
      'LAXREE offers minibars based on three distinct cooling technologies, each optimized for specific hotel applications and guest expectations. Understanding these technologies in depth is essential for any LAXREE sales representative, as the choice of cooling technology has significant implications for guest experience, operating costs, and maintenance requirements. Thermoelectric minibars use the Peltier effect — when an electric current passes through a semiconductor junction, heat is transferred from one side to the other, creating a cooling effect on the interior. Thermoelectric units are the most affordable option, have no moving parts (resulting in zero mechanical noise and exceptional reliability), and can achieve cooling of approximately 15-20°C below ambient temperature. However, they have limited cooling capacity and are not suitable for environments where ambient temperature exceeds 30°C or where rapid temperature recovery is required after door opening. They are best suited for budget hotels and properties in temperate climates where the minibar is stocked primarily with non-perishable beverages and snacks.',
      'Absorption minibars are the most popular choice for hotel guest rooms worldwide, and for good reason. The absorption cooling cycle uses a refrigerant mixture of ammonia, water, and hydrogen gas, driven by a gas burner or electric heater element rather than a mechanical compressor. The key advantage is near-silent operation — the absorption cycle produces no mechanical noise, only a very faint gurgling sound that is imperceptible at distances greater than 30 centimeters. This silence is critical in a hotel room environment where guests are sleeping just meters from the minibar. Absorption minibars maintain an internal temperature range of 5-12°C, which is adequate for beverages and most snack items. They are reliable, with a typical operational lifespan of 8-10 years, and have no moving parts to wear out. The primary limitations are slower cooling recovery after door opening (30-45 minutes to return to set temperature) and sensitivity to ambient temperature — in rooms without air conditioning, performance degrades significantly above 32°C ambient. Absorption minibars also require careful installation with minimum 10cm clearance on all vented sides for adequate heat dissipation.',
      'Compressor minibars represent the premium cooling technology and are increasingly popular in 4-star and 5-star properties where guest expectations for cold beverages are highest. The compressor cycle is the same technology used in household refrigerators, employing a hermetically sealed compressor unit, condenser, expansion valve, and evaporator. The primary advantages are superior cooling performance (maintaining 2-8°C even in ambient temperatures up to 43°C), rapid temperature recovery after door opening (10-15 minutes), and precise thermostat control. Compressor minibars can also achieve freezing temperatures if required for mini-freezer compartments. The primary disadvantage is noise — the compressor produces a noticeable humming sound when running (typically 35-40 dB), which may disturb light sleepers in quiet room environments. Modern LAXREE compressor minibars incorporate advanced noise reduction features including vibration-damped compressor mounts, sound-absorbing cabinet insulation, and intelligent compressor cycling algorithms that minimize nighttime operation. For suites and rooms where the minibar is located in a separate living area rather than the bedroom, compressor technology is the clear recommendation.',
      'The detailed comparison between the three minibar technologies is essential knowledge for sales discussions with hotel clients. Thermoelectric models have a noise level of 0 dB (completely silent), temperature range of 10-18°C below ambient, cooling recovery time of 45-60 minutes, power consumption of 65-80W, unit weight of 6-8kg, price range of $45-65 per unit, and are best suited for budget hotels in temperate climates. Absorption models have a noise level of less than 25 dB (near-silent), temperature range of 5-12°C (adjustable), cooling recovery time of 30-45 minutes, power consumption of 70-90W, unit weight of 12-16kg, price range of $75-120 per unit, and are best suited for 3-4 star hotels and all climates with air conditioning. Compressor models have a noise level of 35-40 dB (noticeable hum), temperature range of 2-8°C (adjustable with precision), cooling recovery time of 10-15 minutes, power consumption of 80-100W (but with duty cycling, average consumption is comparable to absorption), unit weight of 14-18kg, price range of $95-150 per unit, and are best suited for 4-5 star hotels, suites, and tropical climates.',
      'The LAXREE minibar model range has been designed to address every room type and application in the hospitality industry. The LMB-20T is a 20-liter thermoelectric minibar with a single tempered glass shelf, available in black or white finish — ideal for budget and select-service hotels. The LMB-30A is our best-selling 30-liter absorption minibar featuring two adjustable glass shelves, LED interior lighting, and a door rack for cans and small bottles — the standard choice for 3-star and 4-star properties. The LMB-40A is a 40-liter absorption minibar with three glass shelves, a dedicated wine bottle rack, and an adjustable thermostat — designed for premium rooms where guests expect a well-stocked minibar experience. The LMB-40C is a 40-liter compressor minibar with the same interior layout as the LMB-40A but with compressor cooling technology — the premium choice for 5-star properties and tropical climate locations. The LMB-50C is our largest unit at 50 liters, featuring a separate mini-freezer compartment and four glass shelves — designed for suites and extended-stay rooms. All models feature reversible door hinges, adjustable leveling feet, and a removable interior shelf system for flexible product arrangement.',
      'Installation requirements for LAXREE minibars must be followed precisely to ensure optimal performance, energy efficiency, and product longevity. For absorption and thermoelectric models, ventilation is the most critical requirement — the heat generated by the cooling process must be able to dissipate freely. The minimum clearance requirements are: 10cm from the back wall, 5cm from each side wall, and 10cm of open space above the unit. Enclosed cabinets without ventilation will cause the minibar to overheat, dramatically reducing cooling performance and potentially shortening the lifespan of the cooling unit. For built-in installations, the cabinet must include ventilation openings at the bottom front and top rear to create natural convection airflow. Compressor models are more tolerant of confined spaces due to the forced-air condenser cooling, but still require a minimum of 5cm clearance on all sides. All minibar models must be placed on a level surface — use the adjustable leveling feet to ensure the unit sits flat, as an angled position can affect door sealing and, for absorption models, impair the cooling cycle efficiency. Electrical requirements are standard: 220-240V AC, 50/60Hz with a grounded outlet accessible within 1.5 meters of the unit location.',
      'Smart minibar technology represents the future of in-room refreshment service and is a powerful differentiator for LAXREE in competitive sales situations. Our smart minibar models are equipped with precision weight sensors on each shelf position that can detect item removal within 10 grams of accuracy. When a guest removes an item from the minibar, the sensor immediately registers the change, and the consumption event is transmitted to the hotel PMS via the LAXREE Smart Minibar Controller (either through a wired RS-485 network or wireless Zigbee mesh). The PMS then automatically posts the charge to the guest folio, eliminating the need for manual minibar checks by housekeeping staff. This automation delivers several operational benefits: housekeeping labor savings of 3-5 minutes per room per day (which across a 300-room property at 70% occupancy equates to approximately 10-17 hours of daily labor saved), elimination of minibar revenue leakage from missed charges (industry studies estimate that manual minibar checking misses 15-25% of actual consumption), and improved guest satisfaction by removing the inconvenience of minibar inspections during room turnover.',
      'Par level management is the operational discipline of ensuring that each minibar is consistently stocked to the predefined product assortment and quantity. A well-designed par level considers the room type, guest profile, and local consumption patterns. For a standard room, a typical par level includes 8-12 items: 2 bottles of still water, 1 bottle of sparkling water, 2 cans of soft drinks (cola and diet cola), 1 can of juice, 2 bottles of beer, 1 small bottle of wine, and 2-3 snack items (chocolate bar, nuts, chips). For suites, the par level expands to 15-20 items with the addition of premium spirits, sparkling wine, and artisanal snack options. Each item has a designated position in the minibar — this is not merely an aesthetic consideration but is essential for the weight sensor system to function correctly. When restocking, housekeeping staff must place each item in its assigned sensor position; items placed in the wrong position will generate incorrect consumption readings. The LAXREE Smart Minibar Software provides a visual par level map for each room type, which can be printed as a quick-reference guide for housekeeping teams.',
      'Maintenance procedures for LAXREE minibars are designed to be straightforward and can be performed by hotel housekeeping and maintenance staff with minimal training. Interior cleaning should be performed monthly or between guest stays: unplug the unit, remove all items and shelves, wipe the interior surfaces with a soft cloth dampened with a mild detergent solution (never use abrasive cleaners, scouring pads, or solvent-based cleaners), clean the shelves separately, and dry all surfaces thoroughly before restocking and reconnecting power. Door seal inspection should be performed quarterly: close the door on a strip of paper at multiple points around the perimeter — the paper should be gripped firmly and require moderate force to pull out; if the paper slides out easily at any point, the seal may need cleaning (wipe with a damp cloth) or replacement. For compressor models with a defrost drain, check the drain channel quarterly and clear any blockages with a pipe cleaner. Descaling is not typically required for minibars, but in areas with very hard water, condensation on interior surfaces may leave mineral deposits over time — these can be removed with a solution of equal parts water and white vinegar.',
      'Energy efficiency is an increasingly important consideration for hotel operators, both from a cost perspective and as part of corporate sustainability commitments. All LAXREE minibars are designed to minimize energy consumption without compromising cooling performance. Our absorption models consume an average of 0.8-1.1 kWh per day, while our compressor models consume 0.7-1.0 kWh per day with their more efficient duty-cycling operation (the compressor runs only when needed, whereas absorption units provide continuous cooling). All models use R600a (isobutane) refrigerant, which has a Global Warming Potential (GWP) of just 3 — compared to R134a (GWP 1,430) used in many older and competitor minibars — and zero Ozone Depletion Potential (ODP). LAXREE minibars meet or exceed Class A+ energy efficiency ratings. For properties seeking maximum energy savings, we offer the LAXREE Energy Management Module, which uses a door-mounted sensor to detect when the room is unoccupied and raises the minibar temperature set-point by 3-4°C, reducing energy consumption by up to 25% without affecting product quality for beverages.',
      'Sales positioning for LAXREE minibars must address the specific priorities of different hotel segments. For budget and select-service hotels, the thermoelectric minibar offers an affordable entry point that provides guests with in-room refreshment storage at the lowest possible capital cost — emphasize the zero noise, zero maintenance, and attractive price point. For full-service hotels, the absorption minibar is the natural choice — the combination of silent operation, reliable cooling, and mid-range pricing makes it the industry standard. Position the absorption model against competitor offerings by highlighting the adjustable thermostat, LED interior lighting, and reversible door hinge as standard features that are often premium upgrades on competitor products. For luxury hotels, the compressor minibar with smart sensor technology delivers the premium guest experience that high-end properties demand — emphasize the rapid cooling, precise temperature control, automatic consumption tracking, and the operational efficiency gains from eliminating manual minibar checks. For every segment, the cross-selling opportunity with LAXREE safe boxes and door locks should be highlighted — a complete LAXREE room package simplifies procurement, reduces vendor management overhead, and often qualifies the property for package pricing discounts.',
      'Troubleshooting LAXREE minibars requires understanding the different failure modes of each cooling technology. For absorption models, the most common issue is insufficient cooling — first check that the ventilation clearances are maintained (a minibar pushed against the wall will not cool properly), verify the thermostat setting, and ensure the door seal is intact. If the exterior of the minibar feels excessively hot, this indicates poor heat dissipation — improve ventilation or move the unit to a location with better airflow. For compressor models, a running compressor that does not cool indicates a refrigerant leak — this requires factory service and the unit should be replaced from spare stock. Unusual compressor noise (clanking, clicking, or grinding) indicates a failing compressor — schedule replacement before complete failure. For thermoelectric models, the most common issue is inadequate cooling in hot ambient conditions — this is a fundamental limitation of the technology, not a defect, and may require upgrading to an absorption or compressor model. For smart minibar models with sensor issues, the most common cause is incorrect item placement — ensure each item is in its designated sensor position and that the weight is within the sensor calibration range.',
    ],
  },
  {
    id: 'ch5',
    title: 'Product Knowledge — Kettle & TCM',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Master safety features, specifications, maintenance, and common customer queries for kettles.',
    content: [
      'LAXREE electric kettles are among the highest-volume products in our portfolio, with over 500,000 units installed in hotel rooms worldwide. The current product range includes five distinct models designed to meet the diverse requirements of different hotel segments, room configurations, and regional preferences. The LKE-06 is our compact 0.6-liter model, designed for budget hotels, airport transit hotels, and small rooms where counter space is limited. It features a 700W heating element that brings 0.6L of water to a rolling boil in approximately 4 minutes, making it one of the fastest kettles in its class. The body is constructed from food-grade polypropylene (PP) plastic with a matte white or black finish, and the kettle weighs just 0.6kg when empty. The LKE-08 is our standard 0.8-liter model, the workhorse of the LAXREE kettle range and our best-selling unit by volume. It features a 900W heating element, food-grade stainless steel interior with a PP exterior in white or black, and boils 0.8L of water in approximately 5 minutes.',
      'The premium kettle models in the LAXREE range cater to upscale and luxury properties where the in-room kettle is a visible element of the room design and guest experience. The LKE-10 is a 1.0-liter stainless steel kettle with a 1000W heating element, featuring a brushed stainless steel body with a cool-touch double-wall design — the outer wall remains safe to touch even when the water inside is at boiling temperature. This model is the standard choice for 4-star and 5-star hotels and is available with optional logo engraving for branded hospitality programs. The LKE-10G is a 1.0-liter glass body kettle with a 1000W heating element and a stainless steel base, featuring a borosilicate glass jug with blue LED illumination during boiling — this model creates a striking visual effect and is popular in design-forward boutique hotels. The LKE-08T is a 0.8-liter travel kettle with a collapsible silicone body that folds flat for storage, designed for cruise ship cabins and compact room configurations. All five models share the same core safety features and operational platform, ensuring consistent guest experience across a property even when different models are deployed in different room categories.',
      'Safety features are the non-negotiable foundation of every LAXREE kettle design, reflecting our understanding that these products will be used by hotel guests of all ages and technical abilities, often in an unfamiliar environment and sometimes after a long journey. The auto shut-off feature is the primary safety mechanism: a precision bimetallic thermostat detects when the water reaches boiling temperature and automatically switches off the heating element within 3 seconds. This feature protects against boil-dry scenarios and ensures energy is not wasted continuing to heat already-boiling water. The boil-dry protection system provides a critical secondary safety layer: if the kettle is switched on with insufficient water (below the minimum mark or completely empty), a separate thermal cut-off switch detects the abnormal temperature rise and disconnects power within 15 seconds, before the heating element can reach dangerous temperatures. This thermal cut-off is a one-time safety device that must be manually reset by allowing the kettle to cool completely — it does not automatically reset, ensuring that the user is aware that the kettle was operated in an unsafe condition. All LAXREE kettles also feature a secure locking lid mechanism that requires a deliberate button press to open, preventing accidental hot water splashes if the kettle is tipped.',
      'The 360-degree rotational base is a standard feature on all LAXREE kettle models and represents a significant usability advantage over corded or fixed-base kettles. The power cord connects to a circular base unit that remains stationary on the countertop, while the kettle jug lifts on and off the base from any angle — there is no need to align a specific connector or orient the kettle in a particular direction. This design is particularly important in hotel rooms where guests may be using the kettle in a dimly lit area or with one hand while preparing a beverage. The concealed heating element is another important design feature: rather than having an exposed heating coil inside the kettle (which can collect mineral deposits, is difficult to clean, and can impart a metallic taste to water), LAXREE kettles have the heating element embedded beneath a flat stainless steel plate at the bottom of the interior. This concealed design provides several benefits: easier cleaning (the flat interior surface can be wiped clean without navigating around a heating coil), no metallic taste transfer to water, faster and more even heat distribution, and reduced mineral deposit accumulation.',
      'Material quality and food safety compliance are paramount for products that heat water for human consumption. All LAXREE kettles that contact water use food-grade stainless steel (AISI 304) for interior surfaces — this grade of stainless steel is non-reactive, does not leach chemicals or metals into the water, and is resistant to corrosion even in hard water conditions. For models with plastic components that contact water or steam, we use only BPA-free polypropylene (PP) that complies with EU Regulation 10/2011 on food contact materials and FDA 21 CFR requirements. The glass used in our LKE-10G model is borosilicate glass — the same material used in laboratory glassware — which is thermally shock resistant (will not crack when exposed to rapid temperature changes) and completely inert (no chemical leaching under any conditions). All LAXREE kettles are certified by independent testing laboratories to comply with CE safety directives (LVD 2014/35/EU and EMC 2014/30/EU), and our manufacturing facility holds ISO 9001 and ISO 14001 certifications. These material and certification standards provide documented assurance that LAXREE kettles are safe for guest use and meet the procurement requirements of international hotel brands.',
      'Maintenance and descaling procedures are essential for preserving kettle performance and extending product lifespan, particularly in regions with hard water. Scale buildup on the heating element (or the concealed heating plate) acts as a thermal insulator, reducing heating efficiency and increasing energy consumption — a kettle with significant scale buildup may take 30-50% longer to boil the same volume of water. Descaling should be performed every 2-3 months in hard water areas and every 4-6 months in soft water areas, or whenever visible scale deposits are observed on the interior surfaces. The recommended descaling procedure: fill the kettle with a solution of equal parts white vinegar and water up to the MAX mark, bring the solution to a boil, allow it to stand for 30 minutes to dissolve scale deposits, pour out the solution, rinse the interior thoroughly with clean water at least three times, and boil a full kettle of clean water once and discard to ensure all vinegar residue is removed. For properties that prefer commercial descaling products, any food-safe descaler suitable for stainless steel kettles may be used following the manufacturer instructions. Never use abrasive scouring pads, steel wool, or chemical cleaners containing chlorine bleach, as these can damage the stainless steel surface.',
      'The LAXREE Tea and Coffee Maker (TCM) tray product line complements our electric kettles and provides a complete in-room beverage solution. The TCM tray is a custom-designed serving tray that integrates a LAXREE kettle with a selection of tea bags, instant coffee sachets, sugar, creamer, and stirrers in a visually appealing presentation. The tray is available in three configurations: the Basic TCM includes a 0.6L or 0.8L kettle, 2 tea bags, 2 instant coffee sachets, sugar, and creamer — designed for budget and select-service hotels; the Premium TCM includes a 1.0L stainless steel kettle, 3 tea bags (including a premium brand), 2 instant coffee sachets, sugar, creamer, and a small biscuit — designed for full-service hotels; and the Luxury TCM includes a 1.0L stainless steel or glass kettle, a curated selection of 4 premium tea bags, 2 specialty coffee sachets, raw sugar, fresh creamer pods, artisan biscuits, and a small chocolate — designed for luxury hotels. Each TCM configuration is available with a melamine tray (standard) or a wooden tray (premium) in various finishes to match room decor. The TCM approach simplifies procurement (one product code for the complete beverage setup), ensures visual consistency across rooms, and creates an attractive first impression when guests enter the room.',
      'Sales positioning for LAXREE kettles and TCM products leverages the universal appeal of in-room hot beverages and the cross-selling opportunities with our broader product portfolio. For budget hotels, the LKE-06 plastic kettle offers the lowest total cost of ownership in the market — combine it with the Basic TCM for a complete in-room beverage solution at a price point that fits the most constrained procurement budgets. For mid-range hotels, the LKE-08 stainless steel interior kettle strikes the optimal balance of quality and affordability, and the Premium TCM presentation elevates the guest experience without a significant cost increase. For luxury hotels, the LKE-10 stainless steel or LKE-10G glass kettle with the Luxury TCM creates a premium in-room coffee and tea experience that matches the expectations of discerning guests. Cross-selling opportunities with LAXREE safe boxes, door locks, and minibars should always be explored — properties that standardize on LAXREE across multiple product categories benefit from simplified vendor management, consolidated warranty support, and package pricing discounts of 5-10% on the total order value.',
      'Troubleshooting common kettle issues is straightforward with LAXREE products due to their robust and simple design. If the kettle does not switch on, check that it is properly seated on the 360-degree base (the kettle must be fully lowered onto the base for the electrical contacts to engage), verify that the lid is fully closed (the safety interlock prevents operation with an open lid), and check that the power outlet is functional. If the kettle switches off before the water boils, this is typically caused by scale buildup on the thermostat sensor — perform the descaling procedure described above, and if the issue persists, the thermostat may need replacement. If water has a metallic taste, this indicates scale buildup on the interior heating plate — descaling will resolve this issue. If the kettle leaks from the bottom, check that the water level has not exceeded the MAX mark (overfilling can cause water to exit through the steam vent and appear to leak from the bottom), and inspect the water level window seal for damage. If the exterior of the kettle becomes uncomfortably hot to touch on stainless steel models, remind the client that our cool-touch LKE-10 model with double-wall construction is available as an upgrade for properties where guest safety is a heightened concern.',
      'Warranty and replacement policies for LAXREE kettles reflect the consumable nature of these products in hotel environments. The standard warranty period is 2 years from the date of delivery, covering manufacturing defects in materials and workmanship. Due to the relatively low unit cost of kettles compared to our other product categories, we recommend that properties maintain a small inventory of spare units (typically 5-10% of total installed quantity) for immediate replacement when a kettle fails, rather than attempting field repairs on individual units. Failed kettles under warranty are replaced with new units shipped within 48 hours of claim approval — the defective unit does not need to be returned, reducing administrative burden for the hotel. For properties that order the TCM package, we offer an automatic replenishment program for the consumable components (tea, coffee, sugar, creamer) with quarterly deliveries based on occupancy forecasts, ensuring that housekeeping never runs out of TCM supplies.',
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
      'The LAXREE sales process is a structured 8-step methodology designed to guide sales representatives from initial prospect identification through to closed deal and long-term account management. This methodology has been refined through thousands of successful hotel engagements and represents best practices from both the hospitality industry and professional selling frameworks. The eight steps are: (1) Territory Planning and Prospecting, (2) Research and Qualification, (3) Initial Contact and Engagement, (4) Discovery Meeting and Needs Analysis, (5) Product Demonstration and Solution Design, (6) Proposal and Quotation, (7) Negotiation and Closing, and (8) Implementation Support and Account Development. Each step has defined objectives, key activities, required tools and resources, and success criteria that must be met before advancing to the next step. Adherence to this structured process ensures consistent sales quality across the team and provides management with clear visibility into pipeline health and forecast accuracy.',
      'Territory planning and prospecting is the foundation of a successful sales pipeline. LAXREE sales representatives are expected to maintain a territory plan that identifies a minimum of 200 potential accounts, categorized by property type (business hotel, resort, serviced apartment, boutique), star rating (3-star through 5-star), and pipeline stage (cold, warm, qualified, active). Prospecting sources include: hotel industry directories such as STR (Smith Travel Research) Global Database, Horwath HTL market reports, and regional hotel association membership lists; trade shows and exhibitions including HOTELEX (Shanghai), Arabian Travel Market (Dubai), ITB Berlin, World Travel Market (London), and HOST (Milan); digital channels including LinkedIn Sales Navigator for identifying hotel General Managers, Directors of Engineering, and Procurement Managers; industry publications and hotel development news tracking new property openings and renovation announcements; and existing customer referrals, which consistently produce the highest conversion rates in our business. Each sales representative should dedicate a minimum of 4 hours per week to pure prospecting activity, with a target of adding 15-20 new prospects to the CRM database weekly.',
      'Research and qualification is the critical step that separates efficient sales professionals from those who waste time on low-probability opportunities. After identifying a potential account, the sales representative must gather intelligence before making any contact. Key research areas include: the property ownership and management company (is it an independent hotel or part of a chain? If part of a chain, is procurement centralized or property-level?), the number of rooms and F&B outlets (determines the scale of the opportunity), the age of the property and date of last renovation (properties approaching a renovation cycle, typically every 7-10 years, represent the best timing for product replacement), the current supplier of in-room amenities (understanding the competitive incumbent helps shape the approach strategy), the property star rating and brand standards (determines which LAXREE product tier is most appropriate), and any recent news about ownership changes, management contracts, or capital expenditure plans. Based on this research, leads are scored as A (high probability, large opportunity, imminent need — contact within 24 hours), B (moderate probability, medium opportunity, developing need — contact within 1 week), or C (low probability or distant need — nurture with periodic touchpoints).',
      'Initial contact and engagement requires a strategic approach that differentiates the LAXREE sales representative from the dozens of other vendor solicitations that hotel decision-makers receive weekly. The preferred first contact method is a personalized email that demonstrates genuine knowledge of the property and its needs, followed by a telephone call 48-72 hours later. The email should be concise (under 200 words), reference a specific aspect of the property (a recent review, a renovation announcement, an industry award), briefly introduce LAXREE with a single compelling differentiator, and propose a specific next step (a 15-minute phone call or a brief site visit). Avoid generic template emails that could apply to any hotel — decision-makers can detect mass mailings instantly and will delete them without reading. For telephone contact, call before 9:00 AM or after 5:00 PM local time when executives are more likely to answer their phones directly. Be prepared with a 30-second value proposition that addresses the three questions every prospect is thinking: Who are you? Why should I care? What do you want from me? Practice until this opening feels natural and confident.',
      'The discovery meeting is where the LAXREE sales representative earns the right to propose a solution by demonstrating deep understanding of the client specific challenges and objectives. This meeting should be structured around six key questions that uncover the information needed to design a tailored proposal. Question 1: What is the current state of your in-room amenities, and what challenges are you experiencing? (This identifies pain points such as frequent safe lockouts, lock battery failures, minibar temperature issues, or guest complaints.) Question 2: What is your renovation or replacement timeline? (This establishes urgency and aligns the sales timeline with the client procurement schedule.) Question 3: What is the approximate budget range for this project? (This allows the representative to recommend the appropriate product tier and avoid wasting time on solutions the client cannot afford.) Question 4: What are your brand standards and specification requirements? (This ensures that any proposal meets mandatory requirements such as specific fire ratings, accessibility standards, or technology integration protocols.) Question 5: Who will be involved in the procurement decision, and what is the approval process? (This identifies all stakeholders and maps the decision-making authority.) Question 6: What would an ideal solution look like for your property? (This invites the client to articulate their vision, which the representative can then align with LAXREE capabilities.)',
      'Product demonstration best practices transform a standard sales presentation into a compelling, experiential showcase of LAXREE capabilities. Always bring physical product samples to the meeting — hotel decision-makers are tactile buyers who want to touch, feel, and operate the products they are considering. For safe boxes, bring a Standard model and demonstrate the code programming sequence, the auto-lock feature, and the override key access — let the client program their own code and experience the intuitive operation. For door locks, bring a complete door mock-up unit with a working RFID reader, and demonstrate the card encode-and-open sequence live, showing how quickly a guest card can be programmed and used. For minibars, if physical samples are impractical due to size and weight, use our professional product video with close-up footage of the interior, the smart sensor system, and the PMS integration workflow. Always demonstrate products in context — explain how each product operates from the guest perspective first, then from the hotel staff perspective, and finally from the management reporting perspective. This three-angle demonstration approach addresses the concerns of all stakeholders who will influence the purchasing decision.',
      'Objection handling is a skill that distinguishes top-performing sales representatives from average ones. At LAXREE, we categorize objections into four types and train specific response strategies for each. Price objections are the most common and should be reframed from cost to value: when a client says your price is too high, respond with "I understand that budget is a critical consideration. Let me show you how LAXREE total cost of ownership over a 7-year period is actually lower than the alternatives." Then present a TCO comparison that factors in warranty coverage, maintenance costs, replacement rates, and operational efficiency gains. Status quo objections ("we are happy with our current supplier") should be addressed by acknowledging the client satisfaction while introducing new capabilities they may be missing: "That is great to hear — a reliable supplier is valuable. Many of our current clients felt the same way until they discovered that LAXREE smart minibar technology could eliminate manual minibar checks entirely, saving their housekeeping team hours every day." Risk objections ("we need to test first") should be embraced: "Absolutely — that is why we offer a pilot program for 5-10 rooms at no commitment, so you can experience the products in your actual operating environment before making a full decision." Authority objections ("I need to check with my boss") should be met with an offer to present to the decision-maker directly.',
      'The proposal and quotation document is the formal articulation of the LAXREE solution and must be professional, comprehensive, and compelling. A LAXREE proposal should include the following sections: Executive Summary (1-page overview of the client situation, proposed solution, and key benefits), Company Profile (brief LAXREE introduction emphasizing relevant experience and credentials), Proposed Solution (detailed product specifications for each item, including model numbers, dimensions, finish options, and technical specifications), Pricing Schedule (unit pricing, volume discount tiers, and total project cost with clear itemization), Delivery and Installation Plan (lead times, delivery schedule, installation services available, and project timeline), Warranty and Support Terms (warranty periods, support channels, and service level commitments), Terms and Conditions (payment terms, validity period, and commercial conditions), and Appendices (product brochures, case studies, certification documents, and reference letters). The proposal should be branded with the LAXREE corporate identity and formatted to the same standard as consulting proposals from firms like McKinsey or Deloitte — the quality of the proposal document signals the quality of the company behind it.',
      'Closing techniques for LAXREE hotel sales must account for the typically long and complex procurement cycles in the hospitality industry. Unlike consumer sales where a single decision-maker can close a deal in minutes, hotel procurement involves multiple stakeholders (General Manager, Director of Engineering, Housekeeping Director, IT Manager, Finance Controller, and sometimes the property owner or asset manager) and a formal approval process that can take 3-6 months from initial contact to signed contract. The assumptive close is effective when the client has expressed clear buying signals: "Based on our discussion, I will prepare the order for 300 LER-30 safe boxes and 300 LRL-100 door locks for delivery in 4 weeks — shall I include the installation service option?" The alternative close gives the client a choice between two LAXREE solutions rather than between LAXREE and a competitor: "Would you prefer the absorption minibar at $95 per unit, or would the compressor model at $120 be more appropriate given your tropical climate?" The urgency close leverages a legitimate time constraint: "Our current production slot can accommodate your order for delivery in 4 weeks, but if we miss this window, the next available slot is 8 weeks out." The value-add close provides a final incentive without discounting price: "If we can finalize the order this week, I will include a 2-year warranty extension at no additional charge and provide complimentary on-site training for your engineering team."',
      'Follow-up systems and CRM usage are essential for managing the extended sales cycles typical of hospitality procurement. LAXREE uses a CRM system to track all prospect interactions, and sales representatives are required to log every contact, meeting, proposal, and follow-up action within 24 hours. The CRM pipeline is organized into stages matching our 8-step sales process, and each opportunity is assigned a probability-weighted forecast value. Sales representatives should implement a structured follow-up cadence: after sending a proposal, follow up within 3 business days to confirm receipt and address any initial questions; if no response, follow up again after 1 week with a relevant case study or product update; continue bi-weekly touchpoints until the client provides a decision timeline. The key to effective follow-up is to provide value in every interaction — never call just to ask "have you made a decision?" Instead, share a relevant industry insight, offer to connect the client with a reference customer, provide a product update, or suggest a site visit to an existing LAXREE installation. This value-added follow-up approach maintains engagement without creating pressure, which is essential for building the trust-based relationships that drive long-term business in hospitality.',
      'Key performance indicators (KPIs) and targets provide objective measures of sales effectiveness and pipeline health. LAXREE sales representatives are evaluated on the following metrics: New Prospects Added per Week (target: 15-20), Qualified Meetings per Month (target: 8-12), Proposals Submitted per Month (target: 4-6), Win Rate on Qualified Proposals (target: 30-40%), Average Deal Size (target: varies by territory but typically $50,000-$200,000), Sales Cycle Length (target: under 120 days from first contact to signed contract), Revenue Attainment versus Quota (target: 100%+ of assigned annual quota), and Customer Satisfaction Score on Closed Deals (target: 4.5 out of 5). These KPIs are reviewed in weekly one-on-one coaching sessions with the sales manager and in monthly team pipeline reviews. Representatives who consistently meet or exceed their KPI targets are eligible for the LAXREE President Club recognition program, which includes accelerated commission rates, an annual incentive trip, and public recognition at the company sales conference.',
      'Pipeline management is the discipline of maintaining a healthy balance of opportunities at each stage of the sales process. A well-managed pipeline should have a minimum of 3x the sales representative quarterly quota in total pipeline value, distributed across the pipeline stages with approximately 40% in early stages (prospecting and qualification), 30% in mid stages (discovery and demonstration), and 30% in late stages (proposal and closing). Pipeline velocity — the speed at which opportunities move through the stages — is a critical metric that should be monitored weekly. If the pipeline is bottlenecked at any stage, the sales manager should work with the representative to identify and address the root cause (insufficient prospecting, weak discovery skills, poor proposal quality, or ineffective closing). Stale opportunities that have not advanced in 60 days should be reviewed and either re-activated with a new approach, downgraded in forecast probability, or removed from the pipeline entirely to maintain forecast accuracy.',
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
      'The global hospitality amenities market is a multi-billion dollar industry characterized by consolidation at the premium end, fragmentation at the budget end, and increasing technology integration across all segments. The market can be broadly divided into three competitive tiers. The premium tier is dominated by European and American brands such as Dormakaba (Saflok, Elsafe), Assa Abloy (VingCard, Timelox), and Dometic, which command high price points based on brand heritage and established relationships with international hotel chains. The mid-market tier includes LAXREE and a handful of other manufacturers that offer quality comparable to premium brands at more competitive price points. The budget tier is populated by numerous Chinese manufacturers that compete primarily on price, often with significant quality and support limitations. Understanding this market structure is essential for LAXREE sales representatives, as the competitive strategy and selling approach must be adapted depending on which tier the current prospect is considering.',
      'European brand competitors represent the most challenging competitive segment because of their established brand recognition and deep relationships with major hotel chains. Dormakaba, through its Saflok and Elsafe brands, is the market leader in electronic hotel locks and safes, particularly in North American and European markets. Their strengths include strong brand recognition, a comprehensive product range, and established integration certifications with all major PMS platforms. Their weaknesses include premium pricing (often 25-40% above LAXREE for comparable specifications), long delivery lead times (8-12 weeks for international orders), and a support infrastructure that is concentrated in Europe and North America with limited coverage in Asia-Pacific, Middle East, and Africa. Assa Abloy, through its VingCard and Timelox brands, occupies the ultra-premium segment of the market. Their products are specified by many luxury hotel brands as standard, and their brand is synonymous with security. However, their price points are the highest in the industry, and their focus on the premium segment leaves significant opportunity in the 3-4 star market where LAXREE competes most effectively. Onity, a UTC Climate, Controls and Security brand, has a strong position in the North American hotel lock market but has limited product breadth beyond locks.',
      'Chinese brand competitors represent a growing competitive force, particularly in price-sensitive markets across Asia, the Middle East, and Africa. These manufacturers typically offer products at price points 30-50% below LAXREE, which can be attractive to budget-conscious hotel developers and operators. However, Chinese budget brands consistently exhibit several critical weaknesses that LAXREE sales representatives should be prepared to articulate: inconsistent material quality (varying steel thickness, lower-grade electronic components, and inferior surface finishes between production batches), limited or no PMS integration capabilities (most budget brands offer standalone encoding only, with no certified PMS interfaces), inadequate warranty and support (typically 1-year warranty with no local technical support infrastructure), unreliable firmware and software (frequent bugs, limited update support, and poor documentation), and questionable certification claims (some Chinese brands display CE markings without actual compliance or independent testing). When competing against Chinese budget brands, the LAXREE strategy should focus on total cost of ownership, not unit price — demonstrate that the higher initial investment in LAXREE products is recovered within 2-3 years through lower maintenance costs, fewer guest complaints, and longer product lifespan.',
      'Local and regional manufacturers exist in many markets and can be formidable competitors due to their proximity, relationships, and understanding of local requirements. In India, companies like Hafele and Godrej offer hotel safes and locks with strong local distribution networks. In Turkey, several manufacturers produce hotel amenities for the domestic and regional market. In Southeast Asia, local assemblers combine imported components with local fabrication. When competing against local manufacturers, LAXREE advantages include superior product engineering (our products are designed from the ground up for hospitality applications, not adapted from residential or commercial products), broader product range (most local manufacturers specialize in one or two product categories), international certifications that local brands may not hold, and the reference credibility that comes from serving international hotel chains. The key competitive strategy against local manufacturers is to position LAXREE as the global-standard choice that delivers the quality and reliability that international hotel guests expect, while offering competitive pricing that makes the quality premium justifiable.',
      'LAXREE competitive advantages can be summarized in a framework that sales representatives should internalize and articulate confidently in every competitive situation. First, the One-Stop Solution advantage: LAXREE is one of very few suppliers that can provide the complete range of in-room amenities from a single source, including safe boxes, door locks, minibars, kettles, and accessory items. This simplifies procurement, reduces vendor management overhead, and ensures product compatibility across the room. Second, the Integrated Technology advantage: when a property deploys LAXREE locks, safes, and smart minibars together, they benefit from a unified management platform that shares data and provides consolidated reporting — a capability that no single-product competitor can match. Third, the Premium Value Positioning advantage: LAXREE delivers product quality comparable to premium European brands at prices 15-25% lower, a value proposition that resonates strongly with procurement decision-makers who must balance quality standards with budget constraints. Fourth, the Global Support advantage: our 24/7 technical support, regional spare parts warehouses, and certified service technician network provide a level of after-sales support that no budget competitor can match and that matches or exceeds the support offered by premium brands in our core markets.',
      'Price positioning is a strategic decision that affects every aspect of the LAXREE go-to-market approach. Our target price positioning is 15-25% below premium European brands for products of comparable specification. This price gap is large enough to be a decisive factor in competitive evaluations, particularly for properties with significant room counts where the total project savings can reach tens of thousands of dollars, but not so large as to raise concerns about quality compromises. When presenting pricing to a prospect, always frame the comparison in terms of total project cost, not just unit price. For example: "For your 300-room property requiring safe boxes, door locks, and minibars, the LAXREE solution is $87,000 compared to $112,000 for the equivalent specification from the European brand — a saving of $25,000 or 22%, with no compromise on product quality, certification compliance, or warranty coverage." This approach shifts the conversation from a price comparison (where lower price can imply lower quality) to a value comparison (where the same quality at a lower price is clearly advantageous).',
      'Total Cost of Ownership (TCO) analysis is LAXREE most powerful competitive tool when competing against both premium and budget alternatives. The TCO model considers all costs associated with in-room amenities over their expected lifecycle, not just the initial purchase price. The TCO components include: acquisition cost (unit price multiplied by quantity, plus shipping and installation), maintenance cost (routine maintenance labor and materials, calculated at the recommended maintenance intervals), replacement cost (the cost of replacing units that fail prematurely, based on the manufacturer warranty and expected failure rate), operational cost (energy consumption, battery replacement, and consumables), and opportunity cost (the revenue impact of guest complaints, negative reviews, and operational disruptions caused by product failures). When applied to a typical 7-year product lifecycle in a 300-room property, the TCO analysis consistently shows that LAXREE products deliver the lowest total cost — lower than premium brands due to our lower acquisition cost, and lower than budget brands due to our lower maintenance, replacement, and opportunity costs. Sales representatives should prepare a TCO comparison for every competitive proposal, using the standard LAXREE TCO calculator tool.',
      'Feature comparison matrices are essential sales tools that allow prospects to evaluate LAXREE products against specific competitors on a feature-by-feature basis. LAXREE maintains comparison matrices for each product category, comparing our products against the top 3-4 competitors on 30-40 individual features and specifications. The matrices are organized into categories: physical specifications (dimensions, weight, materials, finish options), security features (locking mechanism, code capacity, audit trail), technology features (card type, PMS integration, wireless capability), operational features (battery life, low battery warning, emergency access), and warranty and support (warranty period, support channels, spare parts availability). Each feature is rated as Standard, Optional, or Not Available for each competitor, based on publicly available specifications and our competitive intelligence. These matrices should be used selectively in sales situations — present only the features that are most relevant to the client specific requirements, rather than overwhelming them with a comprehensive feature-by-feature walkthrough that can create confusion.',
      'Knowing when to compete on price versus quality versus service is a critical strategic decision that depends on the specific competitive situation, the client priorities, and the stage of the sales process. Compete on price when: the client has explicitly stated that budget is the primary decision criterion, you are competing against a premium brand and the client has not yet experienced LAXREE quality, and the project is for a budget or select-service property where the value gap between LAXREE and budget brands is small. Compete on quality when: the client is a 4-star or 5-star property where guest experience is paramount, you are competing against a budget brand and the client has expressed concerns about reliability, and the project involves critical products like door locks where failure has direct guest-safety implications. Compete on service when: the client has had negative experiences with the support of their current supplier, the property is in a remote location where service response time is a concern, and the project scope is large (200+ rooms) where ongoing support is essential. In most competitive situations, a balanced approach that addresses all three dimensions — demonstrating quality, articulating the value of competitive pricing, and highlighting the LAXREE support advantage — is the most effective strategy.',
      'Handling the "we already have a supplier" objection requires a respectful but persistent approach. Never disparage the current supplier — instead, acknowledge the relationship and gently introduce the possibility of improvement. A recommended response framework: "I completely understand — having a reliable supplier you trust is valuable. Many of our best clients started the conversation the same way. What I would like to do is share some insights from similar properties that switched to LAXREE, and let you decide whether any of those benefits are relevant to your operation." Then share a relevant case study or reference that addresses a challenge the client may not realize they have. Common scenarios where properties benefit from switching include: when the current supplier cannot provide a complete product range (requiring the hotel to manage multiple vendors), when the current supplier response time for support issues has degraded over time, when the hotel is upgrading technology (e.g., migrating from magnetic stripe locks to RFID) and the current supplier migration path is expensive or disruptive, or when the current supplier warranty has expired and renewal costs are increasing. The goal is not to displace the existing supplier overnight but to earn a trial — a small pilot project or a product category where the current supplier is weak.',
      'Reference customers and case studies are among the most persuasive tools in the LAXREE sales arsenal, as they provide third-party validation of our product claims and allow prospects to hear from peers who have already made the decision to choose LAXREE. LAXREE maintains a library of over 50 case studies covering different property types, geographic regions, product configurations, and competitive situations. Each case study follows a standard format: the client challenge, the LAXREE solution, the implementation process, and the measurable results achieved. When selecting a case study to share with a prospect, choose one that closely matches the prospect situation — a similar property type, similar competitive situation, and similar pain points. Even better, offer to arrange a direct conversation between the prospect and a satisfied LAXREE client. Peer references carry enormous credibility because hotel operators trust the opinions of other hotel operators more than any vendor marketing material. LAXREE also maintains a list of reference properties that can be visited for product inspection, allowing prospects to see and operate LAXREE products in a real hotel environment.',
      'Industry trends that are shaping the hospitality amenities market present both opportunities and challenges for LAXREE. The smart room technology trend, driven by guest expectations for connected, personalized experiences, is accelerating the adoption of IoT-enabled room products. LAXREE smart lock and smart minibar products are well-positioned to capitalize on this trend, as they provide the foundation for a connected room ecosystem. The contactless hospitality trend, catalyzed by the COVID-19 pandemic, has made mobile key and contactless check-in a must-have feature for many hotels — our LRL-500 smart lock with Bluetooth capability directly addresses this requirement. The sustainability trend is increasing demand for energy-efficient products with documented environmental credentials — our use of R600a refrigerant, energy-efficient product designs, and corporate sustainability commitments align with this trend. The post-COVID recovery trend is driving hotel renovation activity as properties upgrade to attract guests in a competitive market, creating replacement opportunities for LAXREE products. The luxury democratization trend — where mid-market hotels adopt amenities previously reserved for luxury properties — is expanding the addressable market for our premium product lines.',
      'The LAXREE future product roadmap provides a forward-looking view of the innovations that will strengthen our competitive position in the coming years. In the next 12-18 months, we will launch: the LRL-600 smart lock with integrated fingerprint biometric reader for properties seeking the highest security level, the LMB-40C-5G smart minibar with 5G connectivity for real-time cloud-based inventory management, and the LAXREE Room Hub — a centralized IoT gateway that connects all in-room LAXREE devices to a cloud management platform for predictive maintenance, energy optimization, and guest preference analytics. In the 18-36 month horizon, we are developing: AI-powered predictive maintenance that uses machine learning algorithms trained on sensor data from our installed base to predict component failures before they occur, voice-activated safe access through integration with Amazon Alexa for Hospitality and Google Assistant for Hospitality, and a fully integrated smart room platform that coordinates lighting, climate, entertainment, and LAXREE room amenities through a single guest interface. These roadmap items demonstrate that LAXREE is not merely a product manufacturer but a technology company that is continuously innovating to deliver more value to our hotel partners.',
    ],
  },
]

// Per-chapter gradient + accent styling (derived from each chapter's color family).
// Keeps the existing color theme per chapter but elevates it with a richer gradient + accent tokens.
const CHAPTER_GRADIENTS: Record<string, {
  gradient: string
  accentBorder: string
  numBg: string
  numText: string
  hoverBorder: string
}> = {
  ch1: { gradient: 'from-emerald-500 to-teal-600', accentBorder: 'border-emerald-300', numBg: 'bg-emerald-100', numText: 'text-emerald-700', hoverBorder: 'hover:border-emerald-300' },
  ch2: { gradient: 'from-blue-500 to-indigo-600',  accentBorder: 'border-blue-300',   numBg: 'bg-blue-100',   numText: 'text-blue-700',   hoverBorder: 'hover:border-blue-300' },
  ch3: { gradient: 'from-violet-500 to-purple-600', accentBorder: 'border-violet-300', numBg: 'bg-violet-100', numText: 'text-violet-700', hoverBorder: 'hover:border-violet-300' },
  ch4: { gradient: 'from-teal-500 to-cyan-600',    accentBorder: 'border-teal-300',   numBg: 'bg-teal-100',   numText: 'text-teal-700',   hoverBorder: 'hover:border-teal-300' },
  ch5: { gradient: 'from-orange-500 to-amber-600', accentBorder: 'border-orange-300', numBg: 'bg-orange-100', numText: 'text-orange-700', hoverBorder: 'hover:border-orange-300' },
  ch6: { gradient: 'from-rose-500 to-pink-600',    accentBorder: 'border-rose-300',   numBg: 'bg-rose-100',   numText: 'text-rose-700',   hoverBorder: 'hover:border-rose-300' },
  ch7: { gradient: 'from-amber-500 to-yellow-600', accentBorder: 'border-amber-300',  numBg: 'bg-amber-100',  numText: 'text-amber-700',  hoverBorder: 'hover:border-amber-300' },
  // Roofing segment chapter gradients (amber/orange/emerald/rose/cyan families)
  'r-ch1': { gradient: 'from-amber-500 to-orange-600',   accentBorder: 'border-amber-300',   numBg: 'bg-amber-100',   numText: 'text-amber-700',   hoverBorder: 'hover:border-amber-300' },
  'r-ch2': { gradient: 'from-orange-500 to-amber-600',   accentBorder: 'border-orange-300',  numBg: 'bg-orange-100',  numText: 'text-orange-700',  hoverBorder: 'hover:border-orange-300' },
  'r-ch3': { gradient: 'from-emerald-500 to-teal-600',   accentBorder: 'border-emerald-300', numBg: 'bg-emerald-100', numText: 'text-emerald-700', hoverBorder: 'hover:border-emerald-300' },
  'r-ch4': { gradient: 'from-rose-500 to-pink-600',      accentBorder: 'border-rose-300',    numBg: 'bg-rose-100',    numText: 'text-rose-700',    hoverBorder: 'hover:border-rose-300' },
  'r-ch5': { gradient: 'from-cyan-500 to-blue-500',      accentBorder: 'border-cyan-300',    numBg: 'bg-cyan-100',    numText: 'text-cyan-700',    hoverBorder: 'hover:border-cyan-300' },
}

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

const AMENITIES_VIDEO_LESSONS: VideoLesson[] = [
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
    youtubeId: 'St815eDtI5c',
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
    youtubeId: 'ltARwWOPn6Q',
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
    youtubeId: 'Z-eOuzqM0ns',
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
    youtubeId: '6OwThbSHUzE',
  },
  {
    id: 'v4b',
    title: 'Kettle Tray & Tea Coffee Maker Set',
    duration: '8:00',
    category: 'Kettle',
    image: 'https://sfile.chatglm.cn/images-ppt/2eece29f9d02.jpg',
    description: 'Complete guide to LAXREE tea and coffee maker tray sets including tray setup, pairing with kettles, and room presentation standards.',
    transcript: [
      'Welcome to the LAXREE Kettle Tray and Tea Coffee Maker Set training. The tray set is a critical companion product to the electric kettle, completing the in-room beverage experience for hotel guests.',
      'PRODUCT RANGE: LAXREE offers standard and premium tray sets. The Standard Tray Set includes: stainless steel tray, 2 ceramic cups with saucers, 2 spoons, sugar bowl, and creamer. The Premium Tray Set adds: a glass carafe, tea infuser, and branded coasters. Both sets are designed to fit perfectly alongside LAXREE kettles on the room vanity or desk.',
      'TRAY PRESENTATION: Proper tray setup enhances the guest experience. Place the kettle on the left side of the tray, cups and saucers on the right. The tea/coffee sachets should be arranged in a small basket or holder beside the tray. Ensure the tray is placed on a flat, stable surface near a power outlet. The tray should be cleaned and polished daily during housekeeping.',
      'CROSS-SELLING: The kettle tray set is a natural add-on when selling kettles. Bundle the kettle + tray set for a complete room beverage solution. Many hotels also add the LAXREE water bottle set for a comprehensive hydration package.',
    ],
    keyPoints: [
      'Standard and Premium tray sets available',
      'Designed to pair perfectly with LAXREE kettles',
      'Proper presentation enhances guest experience',
      'Natural cross-sell with kettles and water bottle sets',
    ],
    youtubeId: '4aBfypkw-oY',
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
    youtubeId: '97RFXSbjqyk',
  },
  {
    id: 'v5b',
    title: 'Washroom Amenities Complete Guide',
    duration: '12:00',
    category: 'Washroom',
    image: 'https://sfile.chatglm.cn/images-ppt/683a45ce407a.jpg',
    description: 'Complete overview of LAXREE washroom amenities including dispensers, towel racks, bathroom accessories, and presentation standards.',
    transcript: [
      'Welcome to the LAXREE Washroom Amenities training. A well-appointed bathroom is one of the most important factors in guest satisfaction, and LAXREE provides a complete range of washroom products to create a premium experience.',
      'PRODUCT RANGE: LAXREE washroom amenities include: soap dispensers (2 and 3 chamber), towel racks and rings, toilet brush holders, bathroom shelves, toothbrush holders, shower caddies, and bathroom weigh scales. All products are available in matching finishes — chrome, brushed nickel, and matte black.',
      'PRESENTATION STANDARDS: The bathroom should follow a consistent layout: dispenser on the shower wall at shoulder height, towel rack within arm\'s reach of the shower, scale stored under the vanity, and toiletry tray on the countertop. Premium hotels should include a folded towel art display on the bed or bathroom counter.',
      'QUALITY BENCHMARKS: All LAXREE bathroom hardware undergoes salt spray testing for 96+ hours to ensure corrosion resistance in humid environments. Chrome finishes must maintain their appearance after 10,000 cleaning cycles with standard hotel-grade disinfectants.',
    ],
    keyPoints: [
      'Complete washroom product range with matching finishes',
      'Consistent layout standards for guest comfort',
      '96+ hour salt spray corrosion testing on all hardware',
      'Available in chrome, brushed nickel, and matte black finishes',
    ],
    youtubeId: 'DCbGeH-rF7U',
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
    youtubeId: 'qwdpnZ-5rRE',
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
    youtubeId: '4PYairCeKE4',
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
    youtubeId: 'yVTyegoHfHY',
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
    youtubeId: '16vDMEt2BY8',
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
    youtubeId: 'WDh4zOJjarE',
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
    youtubeId: 'dbf6BYPRxYE',
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
    youtubeId: 'G7a4zQITXTU',
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
    youtubeId: 'Ppk4OoV7hnU',
  },
]

const AMENITIES_FAQ_ITEMS = [
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

// ==================== ROOFING STUDY MATERIALS DATA ====================

const ROOFING_STUDY_CHAPTERS: StudyChapter[] = [
  {
    id: 'r-ch1',
    title: 'Company Introduction — Laxree Roofing',
    icon: Building2,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Learn about Laxree Roofing — a premium roofing solutions brand offering stone-coated, thatch, and asphalt shingle tiles for the Indian and global market.',
    content: [
      `Laxree Roofing Solutions was established with a singular vision: to bring world-class luxury roofing products to the Indian market at competitive price points. Where homeowners, architects, and builders previously had to choose between expensive European imports and cheap local alternatives that compromised on durability and aesthetics, Laxree Roofing eliminated that compromise. The brand's founders brought together decades of experience in building materials, manufacturing excellence, and global supply chain management to deliver roofing tiles that combine premium aesthetics with proven performance in India's demanding climate conditions.`,
      `The Laxree Roofing product portfolio is organized around three primary product lines, each engineered for a distinct aesthetic and functional purpose. Stone-coated metal roof tiles form the flagship — a steel-base tile coated with aluminum-zinc (AZ) for corrosion resistance, layered with acrylic resin adhesive and colored stone chips finished with an overglaze for shine. Artificial thatch tiles made from polyethylene (PE) offer the tropical/resort aesthetic without the maintenance burden of natural thatch. Asphalt shingles provide a versatile, waterproof solution ideal for sloped roofs on residential and commercial projects. Together, these three lines cover virtually every premium roofing application.`,
      `Laxree Roofing products are currently OEM-manufactured in Korea under the Luxury brand, with a manufacturing unit planned in India within 5-6 months to reduce costs and expand color variety. The products have been tested extensively in Rajasthan's harsh climate — characterized by extreme heat (45°C+ summers), heavy monsoon rainfall, and cold desert winters — and installed at resorts and premium properties across India including Jodhpur, Kerala, Lakshadweep, Daman, and Goa. These field-proven installations provide solid selling points for confidence in durability and performance.`,
      `Warehousing and pan-India delivery are managed centrally from Ajmer, with pan-India delivery available even for small orders. This centralized logistics model keeps costs low and ensures consistent availability. The dealership program offers two entry options: a stand-based dealership (₹25,000 refundable deposit for display stands with samples — no warehousing required, suitable for new resellers) and a stock dealership (₹2,00,000 inventory commitment with free stands and full dealership benefits, suitable for experienced dealers with an existing client base).`,
      `The target market for Laxree Roofing is fundamentally different from the hospitality-focused Amenities segment. Roofing customers are primarily homeowners building premium villas, architects specifying roofing for resort and residential projects, and building material dealers serving the construction industry. This means the sales approach is more direct — consultative selling to individual property owners and design professionals — rather than the B2B hospitality procurement model. Sales representatives must be fluent in roofing terminology, coverage calculations, installation requirements, and climate-appropriate product selection.`,
      `Pricing follows a three-tier model: MRP (Maximum Retail Price — the suggested retail, e.g., approx. ₹440 for stone-coated tiles, ₹150 for asphalt shingles), SSP (Suggested Selling Price — dealers are advised not to sell below this for sustainability), and DP (Dealer Price — the fixed cost to the dealer, typically 20% below MRP). Dealers enjoy complete flexibility on final resale pricing with no fixed MRP enforcement, since roofing tiles are bulk building materials. Significant additional discounts are available for large bulk orders exceeding 3,000-4,000 tiles (valued at approximately ₹15 lakhs and above).`,
    ],
  },
  {
    id: 'r-ch2',
    title: 'Stone-Coated Metal Roof Tiles',
    icon: Layers,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'The flagship product — steel-base tiles with aluminum-zinc coating and colored stone chips. 20-30 year lifespan, 90% noise reduction, fire and corrosion resistant.',
    content: [
      `Stone-coated metal roof tiles are Laxree Roofing's flagship product, also called the Classic or European tile. The tile consists fundamentally of a steel base metal sheet sandwiched between corrosion-resistant layers of aluminum-zinc (AZ) coating on both sides. The top surface has an acrylic resin adhesive layer onto which colored stone chips are glued, finished with an overglaze that adds shine and durability. The stone chips not only provide aesthetics but also act as a protective barrier and a sound-dampening layer.`,
      `Two thickness options are offered — 0.4 mm and 0.5 mm — which describe only the metal sheet thickness, excluding the stone chips and coatings. Market misconceptions about intermediate thicknesses like 0.38 mm or 0.42 mm must be firmly corrected: these are not genuine and are often misrepresented for higher pricing. The 0.4 mm tile is more flexible and weighs approximately 2.7 kg; the 0.5 mm tile is stiffer and weighs 3.1-3.2 kg, recommended for areas where roofs are exposed to heavy impacts such as falling coconuts or fruits. Tiles weighing less than approximately 2.4-2.5 kg are considered inferior quality, with fewer stone chips and increased corrosion risk — always verify weight as a quality indicator.`,
      `The AZ coating value refers to the aluminum-zinc coating's weight and protection efficiency, typically offered in 90 AZ and 150 AZ options (also referred to as GSM or GMS). Although 150 AZ is somewhat more durable, the quality differences are minor and the price difference is marginal (approximately ₹20-30 per tile). For most projects, 90 AZ is sufficient; 150 AZ is recommended for coastal or highly corrosive environments. Size-wise, each tile measures approximately 420 mm by 1340 mm (17" x 52"), covering about 6 sq ft before installation, but actual roofing coverage reduces to 5 to 5.5 sq ft after accounting for a mandatory 2-inch overlap on three sides (top, left, right).`,
      `Proper estimation of tile quantity is essential for project quoting. For example, a 1,500 sq ft roof requires roughly 300 tiles (1500 ÷ 5) plus an additional 5-10 tiles as a buffer against damage during installation. The mandatory overlapping ensures a waterproof and secure roof surface and must be maintained as shown in the installation diagrams. Eight standard color options are available: Brown Black, Terracotta, Red Black, Cement Gray, Blue Black, Coffee, Blue White, and a new Green option — enabling clients to select suitable aesthetic finishes for any architectural style.`,
      `Lifespan varies by model and maintenance, ranging from 20 years for the base 0.4 mm / 90 AZ tile to up to 30 years for the premium 0.5 mm / 150 AZ tile. Warranty is 10 years, covering color fading and stone chips fallout only — physical damage, breakage, or tearing from impacts are explicitly excluded. Stone chips falling out typically occurs only after 10-15 years and can be repaired with a repair kit that includes adhesive and matching stone chips for minor repairs. Note that repainting is NOT possible due to the stone-chip surface.`,
      `Key features include UV resistance (protects against color fading), noise reduction by approximately 90% compared to bare tin sheets (the stone chip layer acts as a sound barrier), fire resistance, storm and corrosion resistance, water resistance, and high wind resistance. These features give stone-coated tiles significant advantages over conventional Tata steel sheets in both noise reduction and long-term durability. Stone-coated tiles can be installed directly on MS frames without additional support structures, unlike thatch and shingles which require underlying support.`,
    ],
  },
  {
    id: 'r-ch3',
    title: 'Artificial Thatch Tiles',
    icon: Leaf,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Synthetic polyethylene thatch tiles for tropical/resort aesthetics. UV-resistant, pest-proof, zero maintenance. Fire-retardant variants available for living areas.',
    content: [
      `Artificial thatch tiles are Laxree Roofing's second product line, made primarily from polyethylene (PE) — a recyclable and safe plastic. When speaking with customers, always emphasize 'PE' rather than 'plastic' to avoid negative perceptions. The smaller tile measures 500 mm × 500 mm and the larger variant provides approximate coverage of 4 sq ft. Thickness is secondary but noted at 1.6 mm and 1.2 mm respectively. The smaller tile is heavier due to a galvanized iron binder on top that adds weight and stiffness, whereas the larger tile is lighter and more flexible with only PE profiling on top.`,
      `Coverage typically is around 4 sq ft but varies with installation overlap preferences — greater overlap gives a denser appearance but reduces coverage, demonstrating an inverse relationship between overlap and effective coverage. Two variants exist for both sizes: fire retardant (FR) and non-fire retardant (Non-FR). Fire retardant options are more expensive and strongly preferred in cottages, resorts, or any place used for resting or sleeping, as they do not catch fire, melt, or spread fire. Non-fire retardant versions are still safer than traditional thatch, with slower burning or self-extinguishing features, suitable for less critical applications like cafes and gazebos.`,
      `Other notable features include UV resistance maintaining color integrity over the tile's lifespan, corrosion and rust resistance due to the galvanized binders, and complete avoidance of insect and pest attraction — a major drawback of natural thatch. The tiles are water resistant ensuring minimal maintenance post-rain, and offer high wind resistance. The expected lifespan is 10 to 20 years with a 5-year warranty covering color fading (physical damage is excluded).`,
      `Color options for the smaller tiles include cream and gray, while the larger tiles offer two textures: vertical and leaf patterns. Unlike natural thatch which requires frequent maintenance, replacement, and pest control, artificial thatch is truly zero-maintenance — rain is sufficient to keep it clean. This makes it ideal for resorts, beach properties, and tropical-themed installations where the aesthetic of thatch is desired without the operational burden.`,
      `Installation requires supporting underlying structures such as plywood, OSB boards, RCC slabs, ACP boards, or fiber cement boards to provide rigidity and proper fastening — unlike stone-coated tiles which can be installed directly on MS frames. Insulation is strongly recommended beneath thatch tiles to improve heat resistance, especially in hotter Indian regions. Common insulation methods include spray insulation, bitumen sheets, reflective sheets, and wool insulation.`,
      `The primary use cases for artificial thatch are resort cottages, beachside cabanas, poolside gazebos, garden pergolas, and tropical-themed restaurants. The fire-retardant variant is mandatory for any structure used for sleeping (resort cottages, villas) while non-FR is acceptable for non-residential structures like cafes and shade structures. When pitching thatch tiles, lead with the aesthetic (tropical luxury without maintenance), then address safety (FR certification), then close on the long-term value (zero maintenance vs. natural thatch replacement every 3-5 years).`,
    ],
  },
  {
    id: 'r-ch4',
    title: 'Asphalt Shingles',
    icon: Home,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Asphalt-fiberglass shingles for versatile sloped roofs. Waterproof, algae-resistant, fireproof. -40°C to +100°C temperature tolerance. 10-year warranty.',
    content: [
      `Asphalt shingles are Laxree Roofing's third product line, composed of an asphalt sheet layered with a fiberglass mat for strength and topped with stone granules for texture and aesthetics — similar surface treatment to stone-coated metal tiles. A distinguishing feature is a self-adhesive bitumen strip underneath the upper edge, which thermally bonds when heated during installation, creating a waterproof interlocking seal. Some variants include a bitumen bottom layer enhancing waterproofing further. Asphalt shingles serve as an upgraded, aesthetically pleasing alternative to traditional bitumen waterproofing sheets widely used in roofing.`,
      `Standard dimensions are approximately 1000 mm by 333 mm (3 ft × 1 ft) with a thickness of about 2.7 mm. Due to the approximately 50% overlap during installation, the exposure (coverage) per tile is just 1.3 sq ft — demanding a large number of tiles for bigger roofs. For example, a 1,300 sq ft roof requires approximately 1,000 tiles. This coverage math must be clearly communicated to customers during quoting to avoid quantity shortfalls.`,
      `Asphalt shingles are highly versatile and can be applied on various sloping surfaces, including RCC (Reinforced Cement Concrete), wooden, or fiber cement roofs of varying slopes from 15° to 90°. The self-adhesive strip ensures water-tightness post-installation. The tiles are flexible, unbreakable, and require zero maintenance. They exhibit resistance to algae (important in humid climates), high winds, impacts, fire, and extreme temperatures ranging from -40°C to +100°C — making them suitable for everything from Himalayan winters to Rajasthan summers.`,
      `Four pattern/color options are commonly available: mosaic, fish-scale, three-tab, and laminated architectural shingles. The laminated architectural variant is the premium option, offering a dimensional appearance that mimics wood shake or slate at a fraction of the cost. Three-tab is the economical choice with a flat, uniform appearance. Mosaic and fish-scale patterns are chosen for distinctive aesthetic statements on premium properties.`,
      `Pricing is generally uniform across patterns: MRP approximately ₹150 per tile, SSP ₹135, and dealer price ₹120 per tile. The 10-year warranty covers color fading and stone chips fallout, with physical damage, breakage, or tearing excluded. Installation requires supporting underlying structures (plywood, OSB, RCC slabs, ACP boards, or fiber cement boards) — asphalt shingles cannot be installed directly on MS frames like stone-coated tiles.`,
      `Insulation is strongly recommended beneath asphalt shingles, particularly in hotter Indian regions. The same insulation methods apply: spray insulation (applied beneath tiles post-installation), bitumen sheet insulation (providing both waterproofing and heat resistance), reflective sheets (laid prior to tile installation), and wool insulation. Asphalt shingles are the ideal choice for sloped RCC roofs on premium villas, bungalows, and residential projects where the homeowner wants a clean, modern aesthetic with proven 10+ year performance.`,
    ],
  },
  {
    id: 'r-ch5',
    title: 'Installation, Insulation & Dealership',
    icon: Wrench,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'Installation methods, insulation requirements, warranty terms, and dealership program details. Everything needed to support customers post-sale.',
    content: [
      `Installation requirements differ significantly across the three product lines. Stone-coated metal tiles can be installed directly on MS (Mild Steel) frames without additional support structures — the inherent rigidity of the steel-base tile allows this. In contrast, artificial thatch and asphalt shingles require supporting underlying structures such as cement boards, plywood, RCC slabs, OSB (Oriented Strand Board) boards, or ACP (Aluminum Composite Panel) boards to provide rigidity and proper fastening. Always assess the existing or planned roof structure before recommending a product — recommending thatch or shingles for an MS-frame-only roof will require additional substrate cost.`,
      `Laxree Roofing does not provide direct installation services — this is a deliberate decision to keep customer costs low. Instead, customers are encouraged to hire local fabricators, with references provided where possible. Assistance is limited to phone guidance and the installation videos shared in the team group. Sales representatives should familiarize themselves with the installation process (via the videos pinned in the team group) so they can confidently guide customers and answer basic installation questions during the sales process.`,
      `Insulation is strongly emphasized as a must-have in all regions, particularly in hotter climates (northwestern and southern India), despite the tiles' inherent heat resistance. Four common insulation methods are recommended: (1) Spray insulation — applied beneath tiles post-installation, offers excellent coverage and gap-filling; (2) Bitumen sheet insulation — provides dual benefit of waterproofing and heat resistance, often used in conjunction with shingles; (3) Reflective sheets — laid prior to tile installation, reflects radiant heat; (4) Wool insulation — similar installation to reflective sheets but uses wool for superior thermal performance. The choice depends on budget, roof structure, and climate severity.`,
      `Warranty terms across the three products: Stone-coated metal tile — 10 years covering color fading and stone chips fallout (excludes physical damage, breakage, tearing); Artificial thatch tile — 5 years covering color fading (excludes physical damage); Asphalt shingles — 10 years covering color fading and stone chips fallout (excludes physical damage, breakage). Stone chips falling out typically occurs only after 10-15 years and can be repaired with a free repair kit that includes adhesive and matching stone chips for minor repairs. Note that stone-coated tiles CANNOT be repainted due to the stone-chip surface — only repaired with the matching kit.`,
      `The dealership program offers two entry models. The Basic (Stand-based) dealership requires a ₹25,000 refundable deposit and includes two big display stands with samples, catalogues, and full support — with NO compulsory stock holding. This is suitable for new resellers testing the roofing market. The Stock-based dealership requires a ₹2,00,000 inventory commitment and includes free stands plus full dealership benefits with stock holding — suitable for resellers with an existing client base who can move inventory quickly. Both models include pan-India delivery support from the Ajmer warehouse.`,
      `Dealers enjoy complete pricing flexibility with no strict MRP enforcement — unlike some other Laxree product lines. Margins are significant, sometimes exceeding 50%, and dealers can price above SSP or MRP to increase profitability on premium projects. Cash discounts are typically offered for large orders exceeding 3,000-4,000 tiles (valued at approximately ₹15 lakhs and above). Billing flexibility exists too: dealers can choose whether invoicing is done directly to them or passed on to the end customer, enabling reseller margin protection. This makes the roofing dealership one of the most attractive in the Laxree portfolio for ambitious resellers.`,
    ],
  },
]

const ROOFING_VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'rv1',
    title: 'Stone-Coated Tile Installation — Valley Detail',
    duration: '8:24',
    category: 'Stone-Coated',
    image: '/roofing-products/stone-coated-tile.jpg',
    description: 'Step-by-step installation of stone-coated metal roof tiles in a valley, showing proper overlap and waterproofing technique.',
    transcript: [
      `Welcome to this stone-coated metal roof tile installation tutorial focused on valley detailing. Valleys are one of the most leak-prone areas of any roof, so proper technique here is critical for a waterproof installation.`,
      `PREPARATION: Before laying tiles in the valley, install a pre-fabricated valley flashing made of the same AZ-coated steel as the tiles. The valley flashing should extend at least 100mm under the tiles on each side. Secure the flashing to the MS frame with screws at 200mm intervals.`,
      `TILE LAYOUT: Start from the bottom of the valley and work upward. Each tile must overlap the one below by at least 2 inches (50mm) on three sides — top, left, and right. When two roof planes meet at the valley, the tiles from each plane should converge at the valley centerline with a closed-cut or woven pattern.`,
      `FASTENING & FINISHING: Use the manufacturer-provided screws with EPDM washers to fasten each tile at the corners. Never over-tighten — the washer should be just compressed. After all tiles are laid, apply a bead of acrylic sealant along the valley centerline as a secondary waterproofing measure. Inspect the entire valley from below to confirm no gaps are visible.`,
    ],
    keyPoints: [
      'Install pre-fabricated valley flashing before laying tiles',
      'Maintain 2-inch (50mm) overlap on top, left, and right sides',
      'Use EPDM-washer screws at every corner — never over-tighten',
      'Apply acrylic sealant along valley centerline as secondary waterproofing',
    ],
    youtubeId: 'NcoaiGbEeAI',
  },
  {
    id: 'rv2',
    title: 'DECRA Villa Tile Installation Guide',
    duration: '12:10',
    category: 'Stone-Coated',
    image: '/roofing-products/stone-coated-classic.jpg',
    description: 'Complete installation walkthrough of DECRA-style stone-coated Villa tiles on a residential roof.',
    transcript: [
      `This video walks through a complete DECRA Villa Tile installation on a residential roof. Villa tiles are a premium stone-coated profile with a distinctive scalloped bottom edge that mimics traditional European clay tiles.`,
      `ROOF PREPARATION: Verify the MS frame is solid, properly spaced (typically 600mm centers), and free of rust. Install breathable underlayment across the entire roof deck before laying any tiles. The underlayment provides a secondary weather barrier behind the tiles.`,
      `TILE INSTALLATION: Start at the bottom-left corner and work upward in a diagonal pattern. Each Villa tile interlocks with the next via a left-edge hook. Fasten each tile with 4-6 screws (depending on wind zone) at the marked fastening points. The bottom-edge scallop creates the characteristic shadow line.`,
      `RIDGE & HIP: Finish the roof with matching ridge caps and hip caps. Use ridge vents under the ridge cap to allow attic ventilation. Apply butyl tape at all hip/ridge joints for a watertight seal. Final inspection: walk the roof (carefully, on the screws) and check for any movement or loose tiles.`,
    ],
    keyPoints: [
      'Install breathable underlayment before laying Villa tiles',
      'Start at bottom-left, work diagonally upward',
      'Use 4-6 screws per tile depending on wind zone',
      'Install ridge vents under ridge caps for attic ventilation',
    ],
    youtubeId: 'qaHsC-COyTg',
  },
  {
    id: 'rv3',
    title: 'Stone-Coated Sheet Step-by-Step Install',
    duration: '15:32',
    category: 'Stone-Coated',
    image: '/roofing-products/stone-coated-tudor.jpg',
    description: 'Full step-by-step guide to installing stone-coated roofing sheets — frame, fastening, and finishing.',
    transcript: [
      `This is a complete step-by-step installation guide for stone-coated roofing sheets (Tudor profile). The Tudor profile features a flat-tile appearance with a defined shadow line between tiles for a classic European look.`,
      `FRAME PREPARATION: The MS frame must be welded to specification — typically 50x50x3mm MS tubes at 600mm centers for rafters and 400mm centers for purlins. Apply two coats of red oxide primer followed by one coat of enamel paint to prevent corrosion.`,
      `SHEET LAYOUT & FASTENING: Begin at the bottom eave and work up to the ridge. Each sheet overlaps the one below by 2 inches. Side laps are 1 corrugation. Use AZ-coated screws with EPDM washers, fastening at every purlin intersection. A string line helps keep rows straight.`,
      `FINISHING: Install eave closures (foam or AZ-coated metal) to prevent pest entry. Apply ridge caps with butyl tape sealant. Walk only on the screw lines to avoid denting the flat sections. After installation, sweep the roof with a soft broom to remove any stone chips loosened during handling.`,
    ],
    keyPoints: [
      'MS frame: 50x50x3mm tubes, 600mm rafter centers, 400mm purlin centers',
      'Prime and paint MS frame before installation (2 oxide + 1 enamel)',
      'Maintain 2-inch vertical lap and 1-corrugation side lap',
      'Walk only on screw lines to avoid denting flat sections',
    ],
    youtubeId: 'dPznayY99ec',
  },
  {
    id: 'rv4',
    title: 'Synthetic Thatch — Four-Sided Roof Install',
    duration: '9:45',
    category: 'Thatch',
    image: '/roofing-products/thatch-tile.jpg',
    description: 'Installation tutorial for synthetic thatch tiles on a four-sided roof structure with underlying substrate.',
    transcript: [
      `This tutorial covers synthetic thatch tile installation on a four-sided (hip) roof. The four-sided hip design is common for resort cottages, gazebos, and poolside cabanas.`,
      `SUBSTRATE PREPARATION: Synthetic thatch requires a solid substrate — typically plywood (min 12mm), OSB board, or fiber cement board. Install the substrate over the MS frame, ensuring all joints are taped. Install underlayment over the substrate for additional waterproofing.`,
      `THATCH TILE LAYOUT: Start at the bottom eave and work upward. Each thatch tile (500x500mm) is fastened with 6-8 screws through the pre-marked holes. The tiles should overlap by 50-75mm to achieve a dense, natural appearance. At the hips, cut tiles at the appropriate angle with a utility knife.`,
      `RIDGE FINISH: Install a synthetic thatch ridge roll along the hip ridges. Fasten the ridge roll every 200mm. The ridge roll conceals the top edge of the field tiles and provides a finished appearance. Final inspection: check that no substrate is visible from any angle.`,
    ],
    keyPoints: [
      'Synthetic thatch requires a solid substrate (plywood/OSB/fiber cement)',
      'Install underlayment over substrate for additional waterproofing',
      'Overlap tiles by 50-75mm for dense, natural appearance',
      'Install synthetic thatch ridge roll on all hip ridges',
    ],
    youtubeId: 'ZHPn8ScNz68',
  },
  {
    id: 'rv5',
    title: 'Thatch Tiles — How To Install',
    duration: '6:18',
    category: 'Thatch',
    image: '/roofing-products/thatch-umbrella.jpg',
    description: 'Quick practical demonstration of installing artificial thatch tiles with proper overlap and fastening.',
    transcript: [
      `This is a quick practical demonstration of installing artificial thatch tiles on a small umbrella structure. The same principles apply to larger roofs.`,
      `TILE PREPARATION: Inspect each thatch tile before installation. The PE strands should be uniform in color and length. Reject any tile with visible manufacturing defects.`,
      `FASTENING: Use 25mm AZ-coated screws with washers. Fasten through the pre-marked holes — 4 holes per 500x500mm tile. Do not over-tighten, as this can crack the PE base. The tile should sit flat against the substrate.`,
      `OVERLAP PATTERN: For a natural thatch appearance, overlap tiles so the strands of the upper tile cover the fasteners of the lower tile. This conceals all screws and creates a seamless look. Trim any excess strands with scissors for a clean edge.`,
    ],
    keyPoints: [
      'Inspect each tile for uniform color and length before installation',
      'Use 25mm AZ-coated screws with washers, 4 per 500x500mm tile',
      'Do not over-tighten — PE base can crack',
      'Overlap to conceal fasteners and create a seamless look',
    ],
    youtubeId: 'A1toKD41BAU',
  },
  {
    id: 'rv6',
    title: 'VIVA Palm Thatch — Installation Training',
    duration: '11:22',
    category: 'Thatch',
    image: '/roofing-products/thatch-tile.jpg',
    description: 'Professional installation training for VIVA Palm synthetic thatch on cabana and gazebo structures.',
    transcript: [
      `This professional installation training covers VIVA Palm synthetic thatch on cabana and gazebo structures. VIVA Palm is a premium PE thatch product with a palm-leaf texture, ideal for high-end resort installations.`,
      `STRUCTURE PREP: Ensure the cabana frame is sturdy enough to support the substrate and thatch load (approx 8-10 kg/sqm). Install 15mm marine plywood over the frame, sealed at all joints with butyl tape.`,
      `INSTALLATION PATTERN: VIVA Palm tiles are designed for a staggered installation pattern. Row 1: full tiles. Row 2: half-tile offset. This staggered pattern mimics natural palm thatch and prevents visible seam lines. Fasten each tile with 6 screws at the marked points.`,
      `DETAILING: At the cabana crown (top), install a custom thatch crown piece. At the eave edge, allow the thatch strands to overhang 50mm for a natural drip edge. Inspect the finished roof from all sides — no substrate should be visible. Clean any debris with a leaf blower (low setting).`,
    ],
    keyPoints: [
      'VIVA Palm tiles use a staggered (half-tile offset) installation pattern',
      'Install 15mm marine plywood substrate, sealed with butyl tape',
      'Fasten each tile with 6 screws at marked points',
      'Allow 50mm thatch overhang at eaves for natural drip edge',
    ],
    youtubeId: '5wBuw0gpaUE',
  },
  {
    id: 'rv7',
    title: 'How to Install Roof Shingles — Full Guide',
    duration: '18:05',
    category: 'Shingles',
    image: '/roofing-products/asphalt-shingles.jpg',
    description: 'Complete asphalt shingle installation from underlayment to ridge cap, including flashing details.',
    transcript: [
      `This is a complete asphalt shingle installation guide, covering everything from underlayment to ridge cap. Asphalt shingles are the most versatile residential roofing product, suitable for slopes from 15° to 90°.`,
      `UNDERLAYMENT: Install a self-adhesive modified bitumen underlayment (minimum 2mm thickness) over the prepared substrate (plywood, OSB, or fiber cement board). The underlayment provides the primary waterproofing layer. Overlap each row by 100mm.`,
      `STARTER COURSE: Cut the tabs off a full shingle to create the starter course. Lay the starter course along the eave, with the self-adhesive strip facing up. This provides a sealed edge at the eave.`,
      `FIELD SHINGLES: Start at the bottom-left and work upward in a diagonal pattern. Each shingle overlaps the one below by half its exposure (approx 167mm). Fasten each shingle with 4-6 nails (depending on wind zone) at the marked nail line. Never nail through the self-adhesive strip.`,
      `RIDGE CAP: Cut shingles into thirds along the perforations. Bend each piece over the ridge and fasten with 2 nails per side. Overlay each ridge cap piece by half. Apply a small dab of asphalt cement under each ridge cap for additional wind resistance.`,
    ],
    keyPoints: [
      'Install self-adhesive bitumen underlayment (min 2mm) as primary waterproofing',
      'Use a starter course with tabs removed along the eave',
      'Fasten with 4-6 nails per shingle, never through the adhesive strip',
      'Cut ridge caps from field shingles, fasten with 2 nails per side',
    ],
    youtubeId: '4z0_QHE7a4w',
  },
  {
    id: 'rv8',
    title: 'Shingle Install — Beginners Step-by-Step',
    duration: '14:40',
    category: 'Shingles',
    image: '/roofing-products/asphalt-shingles-3tab.jpg',
    description: 'Beginner-friendly step-by-step guide to installing asphalt roofing shingles correctly the first time.',
    transcript: [
      `This is a beginner-friendly step-by-step guide to installing 3-tab asphalt shingles. 3-tab shingles are the most economical shingle type, with a flat, uniform appearance.`,
      `TOOLS NEEDED: Hammer or nail gun, utility knife with hook blades, chalk line, tape measure, roofing shovel (for tear-offs), and a good pair of gloves.`,
      `CHALK LINES: Snap horizontal chalk lines every 5 inches (the exposure for 3-tab shingles) to keep rows straight. Snap vertical chalk lines every 36 inches to align tab cutouts. These reference lines are critical for a professional-looking installation.`,
      `INSTALLATION: Start at the bottom-left with the starter course. For each subsequent row, offset the cutouts by 6 inches (half a tab) to prevent water migration through the joints. Fasten each shingle with 4 nails — 2 near each end, just above the cutout. Drive nails straight, not angled.`,
      `COMMON MISTAKES: Avoid overdriving nails (which cuts the shingle), underdriving nails (which prevents sealing), nailing too high (above the nail line), and ignoring the offset pattern. Take time to get the first row perfectly straight — it sets the alignment for the entire roof.`,
    ],
    keyPoints: [
      '3-tab shingles have a 5-inch exposure — snap chalk lines for alignment',
      'Offset each row by half a tab (6 inches) to prevent water migration',
      'Use 4 nails per shingle, driven straight (not angled)',
      'Avoid overdriving, underdriving, and high nailing',
    ],
    youtubeId: 'p0VM9L-0SYE',
  },
  {
    id: 'rv9',
    title: 'Shingle Roof Install — Pro Guide',
    duration: '16:12',
    category: 'Shingles',
    image: '/roofing-products/asphalt-shingles-laminated.jpg',
    description: 'Professional shingle roof installation guide covering patterns, sealing, and quality finishing.',
    transcript: [
      `This professional guide covers laminated architectural shingle installation. Laminated shingles have a dimensional, multi-layer appearance that mimics wood shake or slate — they are the premium choice for high-end residential roofs.`,
      `PATTERN LAYOUT: Unlike 3-tab shingles, laminated shingles have a random, multi-layer appearance. The key is to avoid aligning the notch patterns between adjacent rows. Use a 4-row pattern: rows 1-4 use full, half, quarter, three-quarter offsets respectively, then repeat.`,
      `FASTENING: Laminated shingles typically require 6 nails per shingle (vs 4 for 3-tab) due to their larger size. Drive nails at the marked nail line, which is higher than on 3-tab shingles. Use 1.25-inch roofing nails minimum.`,
      `SEALING: The self-adhesive strip activates at temperatures above 25°C. In cooler weather, hand-seal each shingle with a small dab of asphalt cement under each corner. This prevents wind lift-off before the adhesive activates naturally.`,
      `QUALITY FINISHING: Install step flashing at all wall intersections. Install ice and water shield in valleys (under the underlayment). Use a hip/ridge blade in a circular saw for clean ridge cap cuts. Final cleanup: remove all debris, stray nails, and inspect every fastener.`,
    ],
    keyPoints: [
      'Use a 4-row offset pattern (full, half, quarter, three-quarter) for laminated shingles',
      'Laminated shingles need 6 nails per shingle with 1.25-inch roofing nails',
      'Hand-seal corners with asphalt cement in cool weather (< 25°C)',
      'Install step flashing at walls, ice & water shield in valleys',
    ],
    youtubeId: 'd2yMg__T7Cw',
  },
]

const ROOFING_FAQ_ITEMS = [
  {
    q: `Can stone-coated tiles be painted after the warranty period?`,
    a: `No, repainting is not possible due to the stone-chip surface. Repairs involve applying a repair kit with adhesive and matching stone chips for minor stone-fall areas. The repair kit is provided free of charge during the warranty period.`,
  },
  {
    q: `Are the tiles noise-proof during heavy rain?`,
    a: `Yes — stone-coated tiles provide approximately 90% noise reduction compared to plain tin/metal sheets, thanks to the stone-chip layer acting as a sound barrier. Artificial thatch and asphalt shingles also offer good acoustic insulation due to their composition.`,
  },
  {
    q: `Is insulation really needed given the tiles' heat resistance?`,
    a: `Yes, insulation is strongly recommended across all three roof types, especially in hotter Indian regions (Rajasthan, Gujarat, South India). Common methods include spray insulation, bitumen sheets, reflective sheets, and wool insulation. Insulation dramatically improves indoor comfort and reduces cooling costs.`,
  },
  {
    q: `Does Laxree Roofing provide installation services?`,
    a: `No direct installation services are provided — this is a deliberate decision to keep customer costs low. Customers are encouraged to hire local fabricators, with references provided where possible. Phone guidance and installation videos are shared in the team group for self-installation support.`,
  },
  {
    q: `Are the tiles suitable for residential roofs and cottages?`,
    a: `Yes, all three products are suitable for residential use. For cottages and living areas, fire-retardant variants of artificial thatch are strongly recommended. Stone-coated and asphalt shingles are inherently fire-resistant. The products have been tested extensively in Rajasthan's harsh climate and installed at premium properties across India.`,
  },
  {
    q: `What do the warranty terms cover?`,
    a: `Stone-coated metal tile: 10 years covering color fading and stone chips fallout. Artificial thatch tile: 5 years covering color fading. Asphalt shingles: 10 years covering color fading and stone chips fallout. All warranties explicitly exclude physical damage, breakage, or tearing from impacts. Stone-fall typically begins after 10-15 years and is repairable with the free repair kit.`,
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
  'Washroom': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Signage': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Housekeeping': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Dispenser': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Luggage': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Hangers': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'Dustbin': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'Bed': { bg: 'bg-lime-100', text: 'text-lime-700' },
  'Add-ons': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
  // Roofing segment video categories
  'Stone-Coated': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Thatch': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Shingles': { bg: 'bg-rose-100', text: 'text-rose-700' },
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
  // Segment-aware content + accent tokens
  // Roofing (ROOFING company) → amber/orange accents + roofing product data
  // Amenities (default) → teal/emerald accents + hotel amenities data
  const user = useAuthStore((s) => s.user)
  const isRoofing = user?.company === 'ROOFING'
  const STUDY_CHAPTERS = isRoofing ? ROOFING_STUDY_CHAPTERS : AMENITIES_STUDY_CHAPTERS
  const VIDEO_LESSONS = isRoofing ? ROOFING_VIDEO_LESSONS : AMENITIES_VIDEO_LESSONS
  const FAQ_ITEMS = isRoofing ? ROOFING_FAQ_ITEMS : AMENITIES_FAQ_ITEMS

  // Accent token map — keeps the rendering JSX clean
  const accentColor = isRoofing ? 'text-amber-600' : 'text-teal-600'
  const accentBadgeBg = isRoofing ? 'bg-amber-50' : 'bg-teal-50'
  const accentBadgeText = isRoofing ? 'text-amber-700' : 'text-teal-700'
  const accentBadgeBorder = isRoofing ? 'border-amber-200 hover:bg-amber-50' : 'border-teal-200 hover:bg-teal-50'
  const accentHoverText = isRoofing ? 'group-hover:text-amber-700' : 'group-hover:text-emerald-700'
  const accentFaqIconBg = isRoofing ? 'bg-amber-100' : 'bg-teal-100'
  const accentFaqIconText = isRoofing ? 'text-amber-600' : 'text-teal-600'
  const accentSectionGradient = isRoofing
    ? 'from-amber-600 via-orange-600 to-amber-700'
    : 'from-emerald-600 via-teal-600 to-cyan-600'
  const studyGuideTitle = isRoofing ? 'Roofing Product Chapters' : 'Product Knowledge Chapters'
  const studyGuideDesc = isRoofing
    ? 'Master the Laxree Roofing product portfolio — stone-coated tiles, thatch, asphalt shingles, and the dealership program. Tap any chapter to dive in and read at your own pace.'
    : 'Master the LAXREE product portfolio — from company introduction to competitive intelligence. Tap any chapter to dive in and read at your own pace.'
  const videoTitle = isRoofing ? 'Roofing Installation Videos' : 'Product Video Lessons'
  const videoDesc = isRoofing
    ? 'Watch real installation tutorials for stone-coated, thatch, and asphalt shingle roofs.'
    : 'Watch product training lessons with detailed transcripts and key learning points'
  const faqDesc = isRoofing
    ? 'Quick answers to common questions about Laxree Roofing products'
    : 'Quick answers to common questions about LAXREE products'

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
        <div className={`bg-gradient-to-r ${accentSectionGradient} p-5 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{isRoofing ? 'Roofing Learning Center' : 'Study Materials'}</h2>
              <p className="text-white/80 text-sm">{isRoofing ? 'Master Laxree Roofing products, installation, and dealership' : 'Prepare with comprehensive learning resources'}</p>
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
              <div className="mb-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className={`w-5 h-5 ${accentColor}`} />
                      {studyGuideTitle}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                      {studyGuideDesc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`${accentBadgeBg} ${accentBadgeText} ${accentBadgeBorder} px-2.5 py-1 text-xs`}>
                      <BookMarked className="w-3 h-3" />
                      {STUDY_CHAPTERS.length} Chapters
                    </Badge>
                    <Badge variant="outline" className="px-2.5 py-1 text-xs text-gray-600 border-gray-200">
                      <Clock className="w-3 h-3" />
                      {STUDY_CHAPTERS.reduce(
                        (sum, ch) => sum + Math.max(1, Math.ceil(ch.content.join(' ').split(/\s+/).filter(Boolean).length / 200)),
                        0
                      )} min total
                    </Badge>
                  </div>
                </div>
                {/* Visual progress hint — slot reserved for future per-chapter read tracking */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
                    0 of {STUDY_CHAPTERS.length} read
                  </span>
                  <Progress value={0} className="h-1.5 flex-1 max-w-[200px]" />
                </div>
              </div>
              <Accordion type="multiple" className="space-y-2.5">
                {STUDY_CHAPTERS.map((chapter, idx) => {
                  const Icon = chapter.icon
                  const g = CHAPTER_GRADIENTS[chapter.id] ?? CHAPTER_GRADIENTS.ch1
                  const wordCount = chapter.content.join(' ').split(/\s+/).filter(Boolean).length
                  const readMin = Math.max(1, Math.ceil(wordCount / 200))
                  return (
                    <AccordionItem
                      key={chapter.id}
                      value={chapter.id}
                      className={`group border rounded-xl ${chapter.borderColor} ${g.hoverBorder} bg-white hover:shadow-md hover:-translate-y-0.5 data-[state=open]:shadow-sm transition-all duration-200 overflow-hidden`}
                    >
                      <AccordionTrigger className="py-3 px-4 hover:no-underline">
                        <div className="flex items-center gap-3.5 text-left">
                          {/* Gradient icon tile with floating chapter-number badge */}
                          <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${g.gradient} flex items-center justify-center shrink-0 shadow-sm group-data-[state=open]:shadow-md group-data-[state=open]:brightness-110 transition-all duration-200`}>
                            <Icon className="w-5 h-5 text-white" />
                            <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-[10px] font-bold shadow-sm flex items-center justify-center border border-gray-100 ${g.numText}`}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-bold text-base text-gray-900 ${accentHoverText} transition-colors block`}>
                              {chapter.title}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{chapter.description}</p>
                            {/* Meta row — hidden when chapter is expanded to reduce clutter */}
                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400 group-data-[state=open]:hidden">
                              <Clock className="w-3 h-3" />
                              <span>{readMin} min read</span>
                              <span className="text-gray-300">•</span>
                              <BookOpen className="w-3 h-3" />
                              <span>{chapter.content.length} sections</span>
                              <span className="text-gray-300">•</span>
                              <span>{wordCount.toLocaleString()} words</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-1">
                        <div className={`ml-2 mt-2 border-l-2 ${g.accentBorder} pl-4 space-y-3`}>
                          {chapter.content.map((paragraph, pIdx) => (
                            <motion.div
                              key={pIdx}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: pIdx * 0.08 }}
                              className="flex items-start gap-3"
                            >
                              <div className={`w-5 h-5 rounded-full ${g.numBg} ${g.numText} text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5`}>
                                {pIdx + 1}
                              </div>
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
                  <Video className={`w-4 h-4 ${accentColor}`} />
                  {videoTitle}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{videoDesc}</p>
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
                            // Segment-aware fallback gradient — amber for roofing, teal for amenities.
                            // Both branches use literal class strings so Tailwind includes them in the build.
                            if (isRoofing) {
                              ;(e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-amber-800', 'to-orange-900')
                            } else {
                              ;(e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-teal-800', 'to-emerald-900')
                            }
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
                        <h4 className={`text-sm font-semibold text-gray-900 line-clamp-2 ${accentHoverText} transition-colors`}>
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
                  <HelpCircle className={`w-4 h-4 ${accentColor}`} />
                  Frequently Asked Questions
                </h3>
                <p className="text-sm text-gray-500 mt-1">{faqDesc}</p>
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
                        <div className={`w-7 h-7 rounded-lg ${accentFaqIconBg} flex items-center justify-center shrink-0`}>
                          <MessageCircle className={`w-3.5 h-3.5 ${accentFaqIconText}`} />
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
  const [selectedDoc, setSelectedDoc] = useState<DocumentResource | null>(null)
  const [docViewerOpen, setDocViewerOpen] = useState(false)
  const [selectedAcademyVideo, setSelectedAcademyVideo] = useState<VideoLesson | null>(null)
  const user = useAuthStore((s) => s.user)
  // Segment-aware academy cards — roofing users see roofing keywords/titles,
  // amenities users see the original hospitality cards.
  const isRoofing = user?.company === 'ROOFING'
  const ACADEMIES = isRoofing ? ROOFING_ACADEMIES : AMENITIES_ACADEMIES

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
    // If there's an uploaded PDF, check if it exists first
    if (mod.pdfUrl) {
      const properUrl = getProperUrl(mod.pdfUrl)
      // Try to fetch the PDF to check if it exists
      try {
        const checkRes = await fetch(properUrl, { method: 'HEAD' })
        if (checkRes.ok) {
          openPdfViewer(properUrl, mod.title)
          return
        }
      } catch {
        // File doesn't exist, fall through to generate HTML content
      }
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

  // Videos to show inside an academy's "Videos" tab.
  // Roofing segment → roofing YouTube installation videos.
  // Amenities segment → amenities video lessons.
  // All roofing academies get the full roofing video set because installation
  // knowledge is relevant across product, technical, and sales academies.
  const getVideosForAcademy = (type: string): VideoLesson[] => {
    const all = isRoofing ? ROOFING_VIDEO_LESSONS : AMENITIES_VIDEO_LESSONS
    return all
  }

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
                      ? isRoofing
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
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
                      ? isRoofing
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                        : 'bg-teal-600 text-white shadow-lg shadow-teal-600/25'
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
                                  : isRoofing
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
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
                      <div className={`bg-gradient-to-r ${isRoofing ? 'from-amber-600 via-orange-600 to-stone-700' : 'from-emerald-600 via-teal-600 to-cyan-600'} p-4 text-white relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                        <div className="flex items-start justify-between relative z-10">
                          <div>
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2">
                              <BookMarked className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-base">{isRoofing ? 'Roofing Study Materials' : 'Study Materials'}</h3>
                          </div>
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-xs font-medium">4 Sections</span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {isRoofing
                            ? 'Roofing chapters, installation videos, FAQ, and practice quizzes'
                            : 'Study guides, video tutorials, FAQ, and practice quizzes'}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <BookOpen className={`w-3 h-3 ${isRoofing ? 'text-amber-500' : 'text-emerald-500'}`} />
                            <span>{isRoofing ? '5 Chapters' : '7 Chapters'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Video className={`w-3 h-3 ${isRoofing ? 'text-orange-500' : 'text-teal-500'}`} />
                            <span>{isRoofing ? '9 Videos' : '13 Videos'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <HelpCircle className={`w-3 h-3 ${isRoofing ? 'text-stone-500' : 'text-cyan-500'}`} />
                            <span>{isRoofing ? '6 FAQs' : '8 FAQs'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Brain className="w-3 h-3 text-purple-500" />
                            <span>10 Quiz Qs</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={`w-full bg-gradient-to-r ${isRoofing ? 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700' : 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'} text-white`}
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
                      <FolderOpen className={`w-5 h-5 ${isRoofing ? 'text-amber-600' : 'text-emerald-600'}`} /> Catalogues & Resources
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

                  {/* Tabs: Modules, Videos & Catalogues */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="modules" className="flex-1">
                        <BookOpen className="w-4 h-4 mr-1" /> Modules
                      </TabsTrigger>
                      <TabsTrigger value="videos" className="flex-1">
                        <Video className="w-4 h-4 mr-1" /> Videos
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
                                          <motion.div
                                            key={mod.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(mod.order * 0.05, 0.4) }}
                                            whileHover={{ y: -2 }}
                                            className={`p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                                              isCompleted
                                                ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border-emerald-200 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100'
                                                : mod.contentType === 'video'
                                                  ? 'bg-gradient-to-br from-white to-rose-50/30 border-gray-100 hover:border-rose-300 hover:shadow-md hover:shadow-rose-100'
                                                  : 'bg-gradient-to-br from-white to-slate-50/50 border-gray-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100'
                                            }`}
                                            onClick={() => { setSelectedModule(mod); setViewingModule(true) }}
                                          >
                                            {/* Decorative corner accent */}
                                            <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-40 -translate-y-6 translate-x-6 ${
                                              isCompleted ? 'bg-emerald-300' : mod.contentType === 'video' ? 'bg-rose-200' : 'bg-emerald-200'
                                            }`} />
                                            <div className="flex items-center gap-3 relative z-10">
                                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative shadow-sm ${
                                                isCompleted
                                                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                                  : mod.contentType === 'video'
                                                    ? 'bg-gradient-to-br from-rose-400 to-red-500'
                                                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                              }`}>
                                                {isCompleted ? (
                                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                                ) : mod.contentType === 'video' ? (
                                                  <MonitorPlay className="w-5 h-5 text-white" />
                                                ) : (
                                                  <ModIcon className="w-5 h-5 text-white" />
                                                )}
                                                {/* Order number badge */}
                                                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center shadow-sm">
                                                  {mod.order}
                                                </span>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-800' : 'text-gray-800'} group-hover:text-emerald-700 transition-colors`}>
                                                    {mod.title}
                                                  </p>
                                                  {isCompleted && modScore !== null && modScore !== undefined && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs border border-emerald-200">
                                                      <Star className="w-2.5 h-2.5 mr-0.5" />{modScore}%
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                  {mod.duration && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md">
                                                      <Clock2 className="w-3 h-3" />{mod.duration} min
                                                    </span>
                                                  )}
                                                  {mod.contentType && (
                                                    <Badge variant="outline" className={`text-xs px-1.5 py-0 ${mod.contentType === 'video' ? 'border-rose-200 text-rose-600 bg-rose-50' : ''}`}>
                                                      {mod.contentType === 'video' ? '🎬 Video' : mod.contentType}
                                                    </Badge>
                                                  )}
                                                  {/* Show available content types */}
                                                  <div className="flex items-center gap-1">
                                                    {mod.contentType === 'video' && mod.contentUrl && (
                                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-blue-200 text-blue-600 bg-blue-50 font-medium">▶ Watch</Badge>
                                                    )}
                                                    {mod.pdfUrl && (
                                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-amber-200 text-amber-600 bg-amber-50 font-medium">📄 PDF</Badge>
                                                    )}
                                                    {mod.content && (
                                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-teal-200 text-teal-600 bg-teal-50 font-medium">📖 Read</Badge>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                                isCompleted
                                                  ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                                                  : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
                                              }`}>
                                                {isCompleted ? 'Review' : 'Start →'}
                                              </div>
                                            </div>
                                          </motion.div>
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

                    {/* Videos Tab — segment-aware YouTube installation videos */}
                    <TabsContent value="videos" className="mt-4">
                      {(() => {
                        const academyVideos = getVideosForAcademy(selectedAcademy)
                        if (academyVideos.length === 0) {
                          return (
                            <Card className="border-dashed">
                              <CardContent className="py-12 text-center">
                                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-gray-600">No Videos Available Yet</h3>
                                <p className="text-gray-400 mt-1">Videos for this academy will be added soon.</p>
                              </CardContent>
                            </Card>
                          )
                        }
                        return (
                          <div>
                            <div className="mb-4">
                              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <CirclePlay className={`w-4 h-4 ${isRoofing ? 'text-amber-600' : 'text-teal-600'}`} />
                                {isRoofing ? 'Roofing Installation Videos' : 'Product Video Lessons'}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {isRoofing
                                  ? 'Watch real installation tutorials for stone-coated, thatch, and asphalt shingle roofs. Click any video to play the YouTube embed with full transcript and key points.'
                                  : 'Watch product demonstrations and installation tutorials. Click any video to play with full transcript and key points.'}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {academyVideos.map((video, idx) => {
                                const catColor = VIDEO_CATEGORY_COLORS[video.category] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                                return (
                                  <motion.button
                                    key={video.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedAcademyVideo(video)}
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
                                          if (isRoofing) {
                                            ;(e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-amber-800', 'to-orange-900')
                                          } else {
                                            ;(e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-teal-800', 'to-emerald-900')
                                          }
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
                                      <h4 className={`text-sm font-semibold text-gray-900 line-clamp-2 ${isRoofing ? 'group-hover:text-amber-700' : 'group-hover:text-emerald-700'} transition-colors`}>
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
                          </div>
                        )
                      })()}
                    </TabsContent>

                    <TabsContent value="catalogues" className="mt-4">
                      {catalogs.length === 0 && DOCUMENT_RESOURCES.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {DOCUMENT_RESOURCES.map((doc) => {
                            const IconComp = doc.icon
                            return (
                              <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => { setSelectedDoc(doc); setDocViewerOpen(true) }}>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 ${doc.bgColor} rounded-lg flex items-center justify-center shrink-0`}>
                                      <IconComp className={`w-6 h-6 ${doc.color}`} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-700 text-sm group-hover:text-teal-700 transition-colors">{doc.title}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{doc.category}</Badge>
                                        <span className="text-[10px] text-gray-400">{doc.pages} pages</span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{doc.description}</p>
                                  <Button size="sm" variant="outline" className="w-full h-8 text-xs border-teal-200 text-teal-700 hover:bg-teal-50">
                                    <BookOpen className="w-3 h-3 mr-1" /> View Document
                                  </Button>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      ) : catalogs.length === 0 ? (
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

      {/* ==================== ACADEMY VIDEO DIALOG (YouTube embed) ==================== */}
      <Dialog open={!!selectedAcademyVideo} onOpenChange={(open) => { if (!open) setSelectedAcademyVideo(null) }}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Video className={`w-4 h-4 ${isRoofing ? 'text-amber-600' : 'text-teal-600'}`} />
              {selectedAcademyVideo?.title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedAcademyVideo?.category} • {selectedAcademyVideo?.duration} • Video Lesson
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            {selectedAcademyVideo && (
              <>
                {/* YouTube Embed */}
                {selectedAcademyVideo.youtubeId ? (
                  <div className="rounded-xl overflow-hidden aspect-video mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedAcademyVideo.youtubeId}`}
                      title={selectedAcademyVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden mb-4 relative">
                    <img
                      src={selectedAcademyVideo.image}
                      alt={selectedAcademyVideo.title}
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{selectedAcademyVideo.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Transcript */}
                  <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <BookOpen className={`w-4 h-4 ${isRoofing ? 'text-amber-600' : 'text-teal-600'}`} />
                        Lesson Transcript
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {selectedAcademyVideo.transcript.map((para, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isRoofing ? 'bg-amber-400' : 'bg-teal-400'}`} />
                            <p className="text-sm text-gray-700 leading-relaxed">{para}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div>
                    <div className={`rounded-xl border p-4 ${isRoofing ? 'border-amber-200 bg-amber-50/50' : 'border-teal-200 bg-teal-50/50'}`}>
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <Target className={`w-4 h-4 ${isRoofing ? 'text-amber-600' : 'text-teal-600'}`} />
                        Key Points
                      </h3>
                      <ul className="space-y-2">
                        {selectedAcademyVideo.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isRoofing ? 'text-amber-500' : 'text-teal-500'}`} />
                            <span className="text-xs text-gray-700 leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

      {/* ==================== DOCUMENT VIEWER DIALOG ==================== */}
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
                  onClick={() => {
                    if (!selectedDoc) return
                    const htmlContent = `<!DOCTYPE html><html><head><style>body{font-family:'Segoe UI',Tahoma,sans-serif;padding:20px;max-width:900px;margin:0 auto;color:#333;line-height:1.6;font-size:14px}h2{color:#059669;border-bottom:2px solid #059669;padding-bottom:8px;margin-top:24px}h3{color:#0d9488;margin-top:20px}h4{color:#047857;margin-top:16px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:8px;border:1px solid #e5e7eb;text-align:left}th{background:#f0fdf4}ul,ol{padding-left:24px}li{margin-bottom:6px}p{margin-bottom:8px}strong{color:#047857}</style></head><body>${selectedDoc.content}</body></html>`
                    const blob = new Blob([htmlContent], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${selectedDoc.title}.html`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
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
