'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowLeft, Play, FileText, Download, Video, BookOpen,
  Coffee, Thermometer, Snowflake, Wind, Zap, ShieldCheck,
  Star, CheckCircle2, ChevronRight, Lightbulb, HelpCircle,
  ExternalLink, Volume2, Maximize2, Pause, RotateCcw,
  Sparkles, Target, Award, TrendingUp, Layers, Settings,
  Lock, Shirt, Hanger, BedDouble, Fingerprint, Puzzle,
  Trash2, ShoppingCart, Luggage, Monitor,
} from 'lucide-react'

// ==================== PRODUCT DATA CONFIG ====================

interface ProductFAQ {
  question: string
  answer: string
}

interface ProductData {
  id: string
  title: string
  subtitle: string
  videoFile: string
  pdfFile?: string
  pdfTitle?: string
  icon: any
  gradient: string
  bgLight: string
  color: string
  badge: string
  description: string
  keyFeatures: string[]
  specs: { label: string; value: string }[]
  faq: ProductFAQ[]
  chapters: {
    title: string
    content: string
  }[]
}

const PRODUCTS: ProductData[] = [
  {
    id: 'minibar',
    title: 'Minibar',
    subtitle: 'Hotel Room Refrigeration Solutions',
    videoFile: 'Minibar (1).mp4',
    pdfFile: 'Mini Bar.pdf',
    pdfTitle: 'Mini Bar Product Guide',
    icon: Coffee,
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    color: 'teal',
    badge: '3 Types Available',
    description: 'LAXREE offers three cutting-edge minibar technologies — Thermoelectric, Absorption, and Compressor — each designed for specific hotel needs, from silent operation to rapid cooling.',
    keyFeatures: [
      'Ultra-quiet absorption technology for peaceful guest sleep',
      'Rapid cooling compressor models for high-demand rooms',
      'Energy-efficient thermoelectric for eco-conscious hotels',
      'Adjustable shelves and LED interior lighting',
      'Key lock system for secure inventory management',
      'Zero CFC/HCFC eco-friendly refrigerants',
    ],
    specs: [
      { label: 'Capacity', value: '20L – 60L options' },
      { label: 'Cooling Tech', value: 'Thermoelectric / Absorption / Compressor' },
      { label: 'Temperature Range', value: '2°C – 12°C' },
      { label: 'Noise Level', value: '0 dB (Absorption) / <39 dB (Compressor)' },
      { label: 'Power Consumption', value: '45W – 90W' },
      { label: 'Finish Options', value: 'Mirror, Wooden, Painted Glass' },
    ],
    faq: [
      {
        question: 'What is the difference between Thermoelectric, Absorption, and Compressor minibars?',
        answer: 'Thermoelectric minibars use solid-state cooling with no moving parts — silent and lightweight, ideal for short stays. Absorption minibars use a heat-driven cycle with zero noise, perfect for luxury suites. Compressor minibars use the same tech as home fridges — fastest cooling and lowest temperature, ideal for high-demand or tropical climates.',
      },
      {
        question: 'Which minibar is best for a 5-star luxury hotel?',
        answer: 'The Absorption minibar is the preferred choice for 5-star properties because it operates at 0 dB noise level, ensuring guests enjoy uninterrupted sleep. Its elegant mirror/wooden finish options also complement premium room interiors.',
      },
      {
        question: 'Can minibars be customized to match room interiors?',
        answer: 'Yes! LAXREE minibars come in multiple finish options — mirror glass, wooden panel, and painted glass. You can also choose custom colors and door styles to perfectly match your hotel room décor.',
      },
      {
        question: 'How energy-efficient are LAXREE minibars?',
        answer: 'Very efficient! Thermoelectric models consume just 45W, while absorption models use 60W. Our compressor models, despite faster cooling, use advanced inverter technology to keep consumption under 90W — saving hotels significant electricity costs annually.',
      },
      {
        question: 'What warranty and after-sales support is provided?',
        answer: 'All LAXREE minibars come with a comprehensive 2-year warranty covering all manufacturing defects. We also provide pan-India service support with 48-hour response time and readily available spare parts.',
      },
    ],
    chapters: [
      {
        title: 'Introduction to LAXREE Minibars',
        content: `<p>LAXREE minibars are engineered specifically for the hospitality industry, combining elegant design with cutting-edge cooling technology. Whether your property is a boutique hotel or a 5-star luxury resort, we have the perfect minibar solution.</p>
<p>Our minibar portfolio is organized by <strong>cooling technology priority</strong>:</p>
<ul>
<li><strong>🔴 Priority 1 — Thermoelectric:</strong> Silent, lightweight, eco-friendly. Best for short-stay and business hotels.</li>
<li><strong>🟡 Priority 2 — Absorption:</strong> Zero-noise operation. Best for luxury suites and premium rooms.</li>
<li><strong>🟢 Priority 3 — Compressor:</strong> Fastest cooling, lowest temperature. Best for tropical climates and high-usage scenarios.</li>
</ul>`,
      },
      {
        title: 'Thermoelectric Minibars (Priority 1)',
        content: `<p>The <strong>Thermoelectric Minibar</strong> uses the Peltier effect — a solid-state cooling method with <strong>no compressor, no refrigerant, and no moving parts</strong>.</p>
<h4>🎯 Key Selling Points</h4>
<ul>
<li><strong>Whisper-quiet operation</strong> — No vibration, no motor noise</li>
<li><strong>Lightweight & compact</strong> — Easy to install, fits in any room layout</li>
<li><strong>Eco-friendly</strong> — Zero CFC/HCFC emissions</li>
<li><strong>Low maintenance</strong> — No mechanical parts to wear out</li>
<li><strong>Affordable price point</strong> — Best value for budget-conscious properties</li>
</ul>
<h4>💡 When to Pitch Thermoelectric</h4>
<p>Ideal for <strong>business hotels, airport hotels, and 3-4 star properties</strong> where guests stay 1-3 nights and need basic refrigeration for beverages and snacks.</p>`,
      },
      {
        title: 'Absorption Minibars (Priority 2)',
        content: `<p>The <strong>Absorption Minibar</strong> is the <strong>gold standard for luxury hospitality</strong>. It uses a heat-driven refrigeration cycle with absolutely zero moving parts.</p>
<h4>🎯 Key Selling Points</h4>
<ul>
<li><strong>0 dB noise level</strong> — Completely silent, no vibration whatsoever</li>
<li><strong>Premium finishes</strong> — Mirror glass, wooden panel, painted glass options</li>
<li><strong>Long lifespan</strong> — No mechanical wear = 15+ year operational life</li>
<li><strong>Consistent cooling</strong> — Maintains steady 5°C temperature</li>
<li><strong>Guest satisfaction</strong> — Zero disturbance = better reviews & repeat bookings</li>
</ul>
<h4>💡 When to Pitch Absorption</h4>
<p>Perfect for <strong>5-star hotels, luxury resorts, and premium suites</strong> where guest comfort is paramount. The 0 dB noise level is the #1 differentiator — no other technology can match this.</p>`,
      },
      {
        title: 'Compressor Minibars (Priority 3)',
        content: `<p>The <strong>Compressor Minibar</strong> delivers the most powerful cooling performance, using the same technology as household refrigerators but optimized for hotel environments.</p>
<h4>🎯 Key Selling Points</h4>
<ul>
<li><strong>Fastest cooling</strong> — Reaches set temperature 3x faster than absorption</li>
<li><strong>Lowest temperature</strong> — Can maintain 2°C, ideal for perishables</li>
<li><strong>Tropical rated</strong> — Performs perfectly in ambient temperatures up to 43°C</li>
<li><strong>Inverter technology</strong> — Smart power saving with variable speed compressor</li>
<li><strong>Auto-defrost</strong> — Maintenance-free operation</li>
</ul>
<h4>💡 When to Pitch Compressor</h4>
<p>Best for <strong>resorts in tropical/hot climates, properties with high minibar usage, and hotels needing rapid room turnover</strong>. The fast cooling means the minibar is ready for the next guest in minutes.</p>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Positioning Framework</h4>
<p>Always position by <strong>hotel tier</strong>:</p>
<table>
<tr><th>Hotel Tier</th><th>Recommended Minibar</th><th>Why</th></tr>
<tr><td>3-Star / Business</td><td>Thermoelectric</td><td>Best value, quiet enough, eco-friendly</td></tr>
<tr><td>4-Star / Premium</td><td>Absorption</td><td>Silent luxury, premium finishes, long life</td></tr>
<tr><td>5-Star / Ultra Luxury</td><td>Absorption</td><td>0 dB = unmatched guest experience</td></tr>
<tr><td>Tropical Resort</td><td>Compressor</td><td>Fastest cooling in hot climates</td></tr>
</table>
<h4>🛡️ Common Objections & Responses</h4>
<p><strong>"Minibars are too expensive"</strong></p>
<p>→ "A quality minibar pays for itself within 12-18 months through F&B revenue. Our absorption model lasts 15+ years — that's exceptional ROI."</p>
<p><strong>"Our current minibars work fine"</strong></p>
<p>→ "Are your guests complaining about noise? 73% of luxury hotel complaints relate to in-room noise. Our 0 dB absorption minibar eliminates this issue entirely."</p>`,
      },
    ],
  },
  {
    id: 'kettle',
    title: 'Electric Kettle',
    subtitle: 'Premium In-Room Beverage Solutions',
    videoFile: 'kettle (1).mp4',
    pdfFile: 'Electric Kettle.pdf',
    pdfTitle: 'Electric Kettle Product Guide',
    icon: Thermometer,
    gradient: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50',
    color: 'orange',
    badge: 'SS & Plastic Models',
    description: 'LAXREE electric kettles combine safety, style, and performance. Featuring Strix controllers for auto shut-off, food-grade stainless steel, and sleek designs that complement any hotel room.',
    keyFeatures: [
      'Strix controller for reliable auto shut-off and boil-dry protection',
      'Food-grade 304 stainless steel inner body',
      'Concealed heating element for easy cleaning',
      '360° rotational base with cord storage',
      'Double-wall insulation for safe touch exterior',
      '1.0L – 1.8L capacity options',
    ],
    specs: [
      { label: 'Capacity', value: '1.0L / 1.5L / 1.7L / 1.8L' },
      { label: 'Material', value: 'SS304 / BPA-Free Plastic' },
      { label: 'Power', value: '1000W – 2200W' },
      { label: 'Controller', value: 'Strix (UK) / Otter' },
      { label: 'Safety Features', value: 'Auto shut-off, Boil-dry protection, Locking lid' },
      { label: 'Finish', value: 'Brushed SS / White / Black' },
    ],
    faq: [
      {
        question: 'Why is the Strix controller important?',
        answer: 'Strix is the world\'s leading kettle controller manufacturer from the UK. It ensures precise temperature control, reliable auto shut-off, and boil-dry protection. Hotels using Strix-equipped kettles report 90% fewer safety incidents and longer product lifespan.',
      },
      {
        question: 'Stainless steel or plastic — which should we choose?',
        answer: 'For 4-5 star hotels, stainless steel (SS304) is recommended for its premium look, durability, and food safety. For 3-star and business hotels, BPA-free plastic kettles offer great value with lighter weight and lower cost.',
      },
      {
        question: 'What safety certifications do LAXREE kettles have?',
        answer: 'All LAXREE kettles carry ISI, CE, and RoHS certifications. They undergo rigorous 10,000-cycle testing for the controller and 2,000-hour continuous operation testing.',
      },
      {
        question: 'Can the kettles be branded with our hotel logo?',
        answer: 'Yes! We offer custom branding with silkscreen or laser engraving on the kettle body. Minimum order quantities apply — contact your LAXREE representative for details.',
      },
    ],
    chapters: [
      {
        title: 'Introduction to LAXREE Electric Kettles',
        content: `<p>LAXREE electric kettles are designed for the hospitality industry, where <strong>safety, reliability, and aesthetics</strong> matter equally. Every kettle is built with premium components to withstand the demands of daily hotel use.</p>
<p>Our kettle lineup is organized by material:</p>
<ul>
<li><strong>🥇 Stainless Steel Series:</strong> Premium look, maximum durability, food-grade SS304</li>
<li><strong>🥈 Plastic Series:</strong> Lightweight, budget-friendly, BPA-free construction</li>
</ul>`,
      },
      {
        title: 'Safety Features Deep Dive',
        content: `<p>Safety is the #1 priority for in-room kettles. LAXREE kettles come with <strong>multiple safety layers</strong>:</p>
<ul>
<li><strong>Auto Shut-Off:</strong> Kettle turns off automatically within 30 seconds of boiling</li>
<li><strong>Boil-Dry Protection:</strong> If the kettle is accidentally switched on with no water, it shuts off immediately to prevent damage</li>
<li><strong>Locking Lid:</strong> Prevents hot water splashes during pouring</li>
<li><strong>Concealed Heating Element:</strong> No exposed heating coil — safer and easier to clean</li>
<li><strong>Cool-Touch Exterior:</strong> Double-wall design keeps the outside safe to touch</li>
</ul>
<h4>💡 Sales Tip</h4>
<p>Always highlight the <strong>Strix controller</strong> — it's the same controller used by premium brands like Bosch and Philips. This builds instant credibility.</p>`,
      },
      {
        title: 'Model Range & Positioning',
        content: `<h4>Stainless Steel Series</h4>
<table>
<tr><th>Model</th><th>Capacity</th><th>Power</th><th>Best For</th></tr>
<tr><td>LK-SS10</td><td>1.0L</td><td>1000W</td><td>Standard rooms, compact spaces</td></tr>
<tr><td>LK-SS15</td><td>1.5L</td><td>1500W</td><td>Deluxe rooms, suites</td></tr>
<tr><td>LK-SS18</td><td>1.8L</td><td>2200W</td><td>Premium suites, multi-guest</td></tr>
</table>
<h4>Plastic Series</h4>
<table>
<tr><th>Model</th><th>Capacity</th><th>Power</th><th>Best For</th></tr>
<tr><td>LK-PL10</td><td>1.0L</td><td>1000W</td><td>Budget hotels, transit stays</td></tr>
<tr><td>LK-PL17</td><td>1.7L</td><td>1850W</td><td>Business hotels, 3-star</td></tr>
</table>`,
      },
      {
        title: 'Sales Strategy & FAQ',
        content: `<h4>🎯 Pitch Framework</h4>
<ul>
<li><strong>For Luxury Hotels:</strong> Lead with SS304 material + Strix controller = "The safest, most premium kettle your guests will ever use"</li>
<li><strong>For Business Hotels:</strong> Lead with durability + fast boiling = "1.7L boils in under 4 minutes, and it lasts 5+ years with daily use"</li>
<li><strong>For Budget Hotels:</strong> Lead with value = "ISI-certified safety at the most competitive price in the market"</li>
</ul>
<h4>🛡️ Objection Handling</h4>
<p><strong>"Guests don't use room kettles"</strong></p>
<p>→ "Our data shows 68% of hotel guests make at least one hot beverage per stay. In-room kettles also reduce room service calls by 30%, saving your operations team significant effort."</p>
<p><strong>"We've had kettles break within months"</strong></p>
<p>→ "That's typically due to low-quality controllers. Our Strix-equipped kettles are tested for 10,000+ cycles — that's over 5 years of daily use. We also provide a 2-year replacement warranty."</p>`,
      },
    ],
  },
  {
    id: 'kettle-tray',
    title: 'Kettle Tray',
    subtitle: 'In-Room Beverage Station Setup',
    videoFile: 'Kettle tray (1).mp4',
    pdfFile: 'Kettle Tray.pdf',
    pdfTitle: 'Kettle Tray Product Guide',
    icon: Layers,
    gradient: 'from-amber-500 to-yellow-500',
    bgLight: 'bg-amber-50',
    color: 'amber',
    badge: 'Complete Set',
    description: 'The LAXREE Kettle Tray is a complete in-room beverage station solution — elegantly designed tray with matching kettle, cups, saucers, and condiment organizers. It transforms any room into a premium tea & coffee experience.',
    keyFeatures: [
      'Complete beverage set: tray + kettle + cups + saucers + condiment holder',
      'Heat-resistant melamine tray with anti-slip feet',
      'Coordinated design matching kettle and accessories',
      'Easy to clean and replace individual components',
      'Multiple finish options to match room décor',
      'Compact footprint fits standard room desks and tables',
    ],
    specs: [
      { label: 'Tray Material', value: 'Melamine / Wooden / Glass' },
      { label: 'Tray Size', value: '35cm x 25cm (standard)' },
      { label: 'Cups Included', value: '2 porcelain cups + saucers' },
      { label: 'Condiment Holder', value: '3-compartment organizer' },
      { label: 'Kettle Compatibility', value: 'All LAXREE kettle models' },
      { label: 'Color Options', value: 'White / Black / Wooden / Custom' },
    ],
    faq: [
      {
        question: 'What is included in the kettle tray set?',
        answer: 'Each set includes: 1 heat-resistant tray, 1 LAXREE electric kettle (your choice of model), 2 porcelain cups with saucers, 1 condiment organizer (sugar/sachet holder), and optional tea/coffee sachet holders.',
      },
      {
        question: 'Can we buy the tray separately without the kettle?',
        answer: 'Yes! The tray, cups, and accessories are available as standalone items. However, the bundled set offers the best value and ensures a perfectly coordinated look.',
      },
      {
        question: 'Is the tray heat-resistant?',
        answer: 'Absolutely. Our melamine trays withstand temperatures up to 120°C, and our wooden trays are treated with heat-resistant coating. The kettle can be placed directly on the tray while hot.',
      },
      {
        question: 'How do we maintain the tray set?',
        answer: 'All components are designed for easy hotel housekeeping — wipe-clean surfaces, dishwasher-safe cups, and stain-resistant tray material. We also offer replacement parts for individual items.',
      },
    ],
    chapters: [
      {
        title: 'Complete Beverage Station Overview',
        content: `<p>The LAXREE Kettle Tray transforms any hotel room into a <strong>premium beverage experience</strong>. It's not just a tray — it's a thoughtfully designed station that enhances guest satisfaction and room aesthetics.</p>
<h4>✨ Why Kettle Trays Matter</h4>
<ul>
<li><strong>First Impression:</strong> A well-arranged beverage station signals quality and attention to detail</li>
<li><strong>Guest Convenience:</strong> Everything in one place — no searching for cups or sugar</li>
<li><strong>Housekeeping Efficiency:</strong> Standardized sets make room setup faster and consistent</li>
<li><strong>Brand Image:</strong> Coordinated accessories elevate the room's perceived value</li>
</ul>`,
      },
      {
        title: 'Tray Materials & Design',
        content: `<h4>Melamine Trays</h4>
<p>Our most popular option — lightweight, durable, and available in <strong>white, black, and custom colors</strong>. Heat-resistant up to 120°C with anti-slip rubber feet.</p>
<h4>Wooden Trays</h4>
<p>Premium option for luxury properties — crafted from sustainable timber with heat-resistant lacquer finish. Available in <strong>natural, walnut, and mahogany</strong> tones.</p>
<h4>Glass Trays</h4>
<p>Modern and elegant — tempered glass with silicone anti-slip feet. Perfect for contemporary hotel designs. Available in <strong>clear, frosted, and tinted</strong> options.</p>`,
      },
      {
        title: 'Sales Positioning',
        content: `<h4>🎯 How to Sell Kettle Trays</h4>
<p>Always sell the <strong>complete experience</strong>, not just individual items:</p>
<ul>
<li><strong>Budget Pitch:</strong> "A complete beverage station at just ₹___ per room — cheaper than 2 room service coffees"</li>
<li><strong>Value Pitch:</strong> "Guests rate rooms with organized beverage stations 23% higher on cleanliness and comfort"</li>
<li><strong>Premium Pitch:</strong> "Our coordinated sets create a luxury boutique experience — the kind guests photograph and share on social media"</li>
</ul>
<h4>🔄 Bundle Strategy</h4>
<p>Always pair the kettle tray with a matching LAXREE kettle. The bundle discount (typically 15-20%) makes it an easy upsell, and the coordinated look is impossible to achieve with mix-and-match brands.</p>`,
      },
    ],
  },
  {
    id: 'hanger',
    title: 'Hotel Hangers',
    subtitle: 'Wardrobe & Closet Solutions',
    videoFile: 'hanger (1).mp4',
    pdfFile: 'Hotel Hangers.pdf',
    pdfTitle: 'Hotel Hangers Product Guide',
    icon: Shirt,
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    color: 'violet',
    badge: '5 Styles',
    description: 'LAXREE hotel hangers are built for durability, security, and style. From anti-theft locked hangers to premium wooden designs, we provide the complete wardrobe solution for every hotel tier.',
    keyFeatures: [
      'Anti-theft ring hangers with locking mechanism for wardrobes',
      'Premium wooden hangers with non-slip bar and trouser clamp',
      'Slimline velvet hangers that maximize closet space',
      'Matching hanger sets for consistent room appearance',
      'Custom hotel logo branding available on all models',
      'Break-resistant ABS plastic for housekeeping durability',
    ],
    specs: [
      { label: 'Material', value: 'Wood / Velvet / ABS Plastic / Metal' },
      { label: 'Hanger Type', value: 'Ring / Notch / Clip / Pant / Suit' },
      { label: 'Anti-theft', value: 'Yes — locking ring design' },
      { label: 'Branding', value: 'Laser / Silkscreen / Embossed' },
      { label: 'Per Room Set', value: '8-12 hangers (standard)' },
      { label: 'Color Options', value: 'Natural Wood / Black / White / Walnut' },
    ],
    faq: [
      {
        question: 'Why do hotels need special hangers?',
        answer: 'Hotel hangers serve a dual purpose: they need to look premium for guests while being theft-resistant for the hotel. Our anti-theft ring hangers only work with the matching wardrobe rod, preventing guests from accidentally (or intentionally) taking them. This saves hotels significant replacement costs.',
      },
      {
        question: 'What material is best for luxury hotels?',
        answer: 'For 5-star properties, our premium wooden hangers with satin-finish hook and non-slip bar are the top choice. They offer the best combination of aesthetics, durability, and guest satisfaction. For modern/boutique hotels, velvet slimline hangers are increasingly popular.',
      },
      {
        question: 'Can hangers be branded with our hotel logo?',
        answer: 'Yes! We offer three branding methods: laser engraving (best for wood), silkscreen printing (best for plastic), and embossing (best for velvet). Minimum order of 500 hangers for custom branding.',
      },
      {
        question: 'How long do LAXREE hotel hangers last?',
        answer: 'Our wooden hangers last 7-10 years in regular hotel use. ABS plastic hangers last 5+ years. Velvet hangers last 3-5 years. All come with a 1-year replacement warranty against manufacturing defects.',
      },
    ],
    chapters: [
      {
        title: 'LAXREE Hanger Collection',
        content: `<p>Hotel hangers may seem like a small detail, but they have an <strong>outsized impact on guest perception</strong>. A well-stocked, organized wardrobe with quality hangers signals attention to detail — a poorly equipped closet suggests neglect.</p>
<h4>Our Hanger Categories</h4>
<ul>
<li><strong>🔒 Anti-Theft Ring Hangers:</strong> The industry standard — can only be used with matching wardrobe rod</li>
<li><strong>🪵 Premium Wooden Hangers:</strong> For luxury suites — wide shoulder, trouser clamp, non-slip bar</li>
<li><strong>✨ Velvet Slimline Hangers:</strong> Modern, space-saving, non-slip — gaining popularity in boutique hotels</li>
<li><strong>💪 ABS Plastic Hangers:</strong> Budget-friendly, break-resistant, consistent look</li>
<li><strong>👔 Suit Hangers:</strong> Wide-body hangers with contour shape for jackets and blazers</li>
</ul>`,
      },
      {
        title: 'Anti-Theft System Deep Dive',
        content: `<p>The <strong>anti-theft ring hanger system</strong> is one of the most requested products by hotel operations managers. Here's why:</p>
<h4>How It Works</h4>
<p>The hanger features a small ring (or hook) that can only slide onto a specially designed wardrobe rod with a corresponding groove. Standard hangers cannot be used on the rod, and the ring hangers cannot be easily removed without the proper technique.</p>
<h4>💰 Cost Savings</h4>
<ul>
<li>Hotels lose an average of <strong>15-20% of hangers per year</strong> to guest removal</li>
<li>For a 200-room hotel, that's 240-320 hangers replaced annually</li>
<li>Anti-theft hangers reduce replacement rate to <strong>under 2% per year</strong></li>
<li>ROI within the first year for most properties</li>
</ul>`,
      },
      {
        title: 'Sales Strategy for Hangers',
        content: `<h4>🎯 Selling by Hotel Tier</h4>
<table>
<tr><th>Hotel Type</th><th>Recommended Set</th><th>Pitch Angle</th></tr>
<tr><td>3-Star / Budget</td><td>ABS Plastic Ring Set</td><td>"Anti-theft savings pay for the hangers"</td></tr>
<tr><td>4-Star / Business</td><td>Wooden Ring Set</td><td>"Premium look with theft protection"</td></tr>
<tr><td>5-Star / Luxury</td><td>Wooden Premium + Suit Set</td><td>"Boutique wardrobe experience"</td></tr>
<tr><td>Boutique / Modern</td><td>Velvet Slimline Set</td><td>"Space-saving luxury"</td></tr>
</table>
<h4>🔄 Cross-Sell Opportunities</h4>
<p>Always pair hangers with our <strong>wardrobe accessories</strong>: luggage racks, shoe racks, ironing boards, and laundry bags. A complete wardrobe package increases order value by 40-60%.</p>`,
      },
    ],
  },
  // ==================== NEW PRODUCTS ====================
  {
    id: 'safe-box',
    title: 'Safe Box',
    subtitle: 'In-Room Security Solutions',
    videoFile: 'Safe_box.mp4',
    pdfFile: 'Safe Box.pdf',
    pdfTitle: 'Safe Box Product Guide',
    icon: ShieldCheck,
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    color: 'sky',
    badge: '4 Series Available',
    description: 'LAXREE Safe Boxes provide hotel guests with secure in-room storage for valuables. From compact personal safes to laptop-sized models, our range covers every hotel security need with advanced digital locks and audit trail capability.',
    keyFeatures: [
      'Digital keypad with 3-6 digit PIN code and master override key',
      'Auto-lockout after 3-5 wrong attempts for enhanced security',
      'Audit trail: Last 100-200 opening records accessible via manager',
      'Laptop-size options for business travelers with 15.6" & 17" capacity',
      'Emergency battery backup for power failure access',
      'Pre-drilled mounting holes for floor or wall anchoring',
    ],
    specs: [
      { label: 'Series', value: 'Orbita / Elite / Essential / Valor' },
      { label: 'Capacity', value: '15L – 50L options' },
      { label: 'Lock Type', value: 'Digital Keypad + Master Key Override' },
      { label: 'Power', value: '4x AA batteries (12-18 month life)' },
      { label: 'Construction', value: 'Solid steel body, double-wall door' },
      { label: 'Finish', value: 'Black powder coat / Graphite / Custom' },
    ],
    faq: [
      {
        question: 'What happens if the guest forgets their PIN code?',
        answer: 'Hotel staff can use the master override key to open the safe. Additionally, the safe has an emergency external battery terminal — if the internal batteries die, a 9V battery can be touched to the external contacts to power the keypad for one-time opening.',
      },
      {
        question: 'What is the audit trail feature and why does it matter?',
        answer: 'The audit trail records the last 100-200 safe openings with timestamps and method (PIN or master key). This is critical for resolving disputes — e.g., if a guest claims valuables went missing, management can check exactly when the safe was opened and by whom.',
      },
      {
        question: 'Can the safe be bolted to the wall or floor?',
        answer: 'Yes! All LAXREE safes come with pre-drilled mounting holes and included anchoring hardware. We recommend bolting safes in at least 80% of rooms to prevent theft of the entire safe unit. Wall mounting also allows easy access for housekeeping inspection.',
      },
      {
        question: 'What is the auto-lockout feature?',
        answer: 'After 3-5 consecutive wrong PIN attempts (configurable), the safe automatically locks the keypad for 3-15 minutes. This prevents brute-force attacks and protects guest belongings. The master key still works during lockout for hotel staff.',
      },
      {
        question: 'Which safe series is best for different hotel tiers?',
        answer: 'Orbita is our premium line with leather-finish exterior and backlit keypad — perfect for 5-star properties. Elite offers the best balance of features and price for 4-star hotels. Essential is the budget-friendly workhorse for 3-star properties. Valor is designed specifically for resort/casino environments with heavy-duty construction.',
      },
    ],
    chapters: [
      {
        title: 'Introduction to LAXREE Safe Boxes',
        content: `<p>LAXREE safe boxes are the <strong>most trusted in-room security solution</strong> in the Indian hospitality market. Every safe is designed with three priorities: guest convenience, hotel management control, and maximum security.</p>
<p>Our safe box portfolio includes <strong>4 distinct series</strong>:</p>
<ul>
<li><strong>🔵 Orbita Series:</strong> Premium luxury with leather finish, backlit keypad, top-of-line</li>
<li><strong>🟠 Elite Series:</strong> Best value — feature-rich at competitive pricing</li>
<li><strong>🟢 Essential Series:</strong> Budget-friendly, reliable, most popular for 3-star</li>
<li><strong>🔴 Valor Series:</strong> Heavy-duty for resorts, casinos, and high-security environments</li>
</ul>`,
      },
      {
        title: 'Orbita & Elite Series (Premium)',
        content: `<h4>Orbita Series — The Statement Safe</h4>
<p>The Orbita is more than a safe — it's a <strong>room accessory that signals luxury</strong>. With its genuine leather exterior and soft-glow backlit keypad, it complements premium room interiors.</p>
<ul>
<li><strong>Leather exterior:</strong> Black, brown, or custom color options</li>
<li><strong>Backlit keypad:</strong> Blue LED glow for easy night-time use</li>
<li><strong>Interior LED light:</strong> Illuminates contents when door opens</li>
<li><strong>USB charging port:</strong> Guest can charge phone inside the safe!</li>
<li><strong>Carpet-lined interior:</strong> Protects valuables from scratches</li>
</ul>
<h4>Elite Series — The Best-Seller</h4>
<p>The Elite is our <strong>most popular model</strong> across 4-star and 5-star properties. It offers 90% of the Orbita's features at a significantly lower price point.</p>
<ul>
<li><strong>LCD display:</strong> Shows lock status, battery level, and time</li>
<li><strong>Motorized lock:</strong> Auto-opens after correct PIN — no handle pulling</li>
<li><strong>Manager mode:</strong> Separate management PIN with full audit access</li>
<li><strong>Dual lock mode:</strong> Requires both PIN + key for maximum security</li>
</ul>`,
      },
      {
        title: 'Essential & Valor Series',
        content: `<h4>Essential Series — The Workhorse</h4>
<p>Reliable, affordable, and built to last. The Essential series is the <strong>go-to choice for 3-star hotels and serviced apartments</strong>.</p>
<ul>
<li><strong>Mechanical override:</strong> Master key always works — no electronic dependency</li>
<li><strong>LED indicator:</strong> Simple lock/unlock/low-battery indicators</li>
<li><strong>Compact size:</strong> 15L and 20L options fit standard nightstand furniture</li>
<li><strong>Competitive pricing:</strong> Up to 40% less than Orbita/Elite models</li>
</ul>
<h4>Valor Series — Heavy Duty Security</h4>
<p>Built for environments where security is <strong>non-negotiable</strong> — casinos, luxury resorts, and high-value properties.</p>
<ul>
<li><strong>Double-wall steel:</strong> 4mm outer + 2mm inner = 6mm total thickness</li>
<li><strong>Anti-pry door:</strong> Recessed door with 3 active locking bolts</li>
<li><strong>Tamper alarm:</strong> Audible alarm on vibration or wrong PIN attempts</li>
<li><strong>Laptop capacity:</strong> 40L and 50L options fit 17" laptops easily</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Positioning by Hotel Type</h4>
<table>
<tr><th>Hotel Type</th><th>Recommended Series</th><th>Key Pitch</th></tr>
<tr><td>5-Star Luxury</td><td>Orbita</td><td>"The only safe that matches your room's premium interiors"</td></tr>
<tr><td>4-Star Premium</td><td>Elite</td><td>"Audit trail + motorized lock at the best price"</td></tr>
<tr><td>3-Star / Service Apt</td><td>Essential</td><td>"Reliable security at the most competitive rate"</td></tr>
<tr><td>Resort / Casino</td><td>Valor</td><td>"Heavy-duty anti-pry, tamper alarm, laptop size"</td></tr>
</table>
<h4>🛡️ Common Objections</h4>
<p><strong>"Safes are a liability — guests blame us for missing items"</strong></p>
<p>→ "Actually, safes <em>reduce</em> your liability. Our audit trail records every opening — so if a guest makes a claim, you have evidence. Hotels without safes face 3x more theft-related disputes."</p>
<p><strong>"Our rooms don't have space for safes"</strong></p>
<p>→ "Our compact Essential series fits inside standard nightstands or wardrobe bottom shelves. We also offer wall-mounted models that take zero floor space."</p>`,
      },
    ],
  },
  {
    id: 'rfid-lock',
    title: 'RFID Door Lock',
    subtitle: 'Smart Access Control for Hotels',
    videoFile: 'Rfid.mp4',
    pdfFile: 'RFID Door Lock.pdf',
    pdfTitle: 'RFID Door Lock Product Guide',
    icon: Fingerprint,
    gradient: 'from-indigo-500 to-violet-600',
    bgLight: 'bg-indigo-50',
    color: 'indigo',
    badge: 'PMS Compatible',
    description: 'LAXREE RFID Door Locks bring contactless, keyless entry to hotel rooms. Compatible with all major PMS systems, our locks support card, fob, and mobile key access — giving hotels the flexibility to modernize guest experience.',
    keyFeatures: [
      'Contactless RFID card/fob access — tap to unlock in <0.5 seconds',
      'PMS integration: Opera, Cloudbeds, Mews, and 20+ systems supported',
      'Mobile key ready: Guests can use their smartphone as room key',
      'Anti-peek password: Enter random digits before/after PIN to prevent shoulder surfing',
      'Low battery alarm: 100+ openings warning before battery depletion',
      'Fire-rated stainless steel construction with IP65 weather resistance',
    ],
    specs: [
      { label: 'Access Methods', value: 'RFID Card / Fob / PIN / Mobile Key' },
      { label: 'Card Type', value: 'Mifare / T5577 / EM4100' },
      { label: 'Response Time', value: '<0.5 seconds' },
      { label: 'Battery Life', value: '12-18 months (4x AA)' },
      { label: 'PMS Compatible', value: 'Opera, Cloudbeds, Mews, IDS, +20' },
      { label: 'Finish', value: 'SS304 / Matte Black / Gold / Rose Gold' },
    ],
    faq: [
      {
        question: 'How does RFID lock integration with our PMS work?',
        answer: 'LAXREE RFID locks connect to your Property Management System via our middleware software. When a guest checks in at the front desk, the PMS automatically encodes a key card with the room number, check-in/check-out dates, and access permissions. When the guest checks out, the card is automatically deactivated. No manual encoding needed.',
      },
      {
        question: 'What happens if the lock battery dies?',
        answer: 'The lock gives a low-battery warning for the last 100+ openings. If the battery is somehow not replaced, there are three backup methods: (1) Emergency external power terminal — touch a 9V battery to the contacts outside the door, (2) Mechanical master key — always works regardless of power, (3) Mobile app override — hotel engineering can unlock via Bluetooth from outside.',
      },
      {
        question: 'Can we upgrade from mechanical locks to RFID without changing doors?',
        answer: 'Yes! LAXREE offers retrofit models that fit standard Indian door preparations (60mm backset, 54mm cross bore). In most cases, we can upgrade a floor of 30 rooms in a single day without replacing the doors. Our installation team handles the complete migration.',
      },
      {
        question: 'Is mobile key access available? How does it work?',
        answer: 'Yes! Our locks support BLE (Bluetooth Low Energy) mobile key access. Guests receive a digital key via the hotel\'s app or email at check-in. They simply hold their phone near the lock to open. This is especially popular with luxury and tech-forward hotels looking to eliminate plastic key cards.',
      },
      {
        question: 'What is the anti-peek password feature?',
        answer: 'When entering a PIN code on the keypad, you can add random digits before and after your actual PIN. For example, if your PIN is 1234, you could enter 88123499 and the lock will still recognize 1234. This prevents anyone watching from seeing your actual code.',
      },
    ],
    chapters: [
      {
        title: 'Introduction to LAXREE RFID Locks',
        content: `<p>LAXREE RFID Door Locks represent the <strong>future of hotel room access</strong>. Moving beyond traditional mechanical keys, our RFID solutions offer contactless entry, PMS integration, and mobile key capability — all while maintaining robust security.</p>
<h4>Why Hotels Are Switching to RFID</h4>
<ul>
<li><strong>Guest Experience:</strong> Tap-to-enter is 3x faster than mechanical key</li>
<li><strong>Security:</strong> Cards deactivate automatically at checkout — no re-keying needed</li>
<li><strong>Operations:</strong> Audit trail of every door opening — who, when, how</li>
<li><strong>Cost Savings:</strong> Reusable cards vs. replacing lost mechanical keys</li>
<li><strong>Modern Image:</strong> Keyless entry is now expected by luxury travelers</li>
</ul>`,
      },
      {
        title: 'PMS Integration Deep Dive',
        content: `<p>The #1 concern hotel IT departments have about RFID locks is <strong>PMS compatibility</strong>. Here's how LAXREE solves this:</p>
<h4>Supported PMS Platforms</h4>
<table>
<tr><th>PMS</th><th>Integration Type</th><th>Setup Time</th></tr>
<tr><td>Oracle Opera</td><td>Direct API</td><td>2-3 days</td></tr>
<tr><td>Cloudbeds</td><td>Cloud API</td><td>1 day</td></tr>
<tr><td>Mews</td><td>Cloud API</td><td>1 day</td></tr>
<tr><td>IDS Fortune</td><td>Direct API</td><td>2-3 days</td></tr>
<tr><td>WinHMS</td><td>Middleware</td><td>3-5 days</td></tr>
</table>
<h4>💡 How It Works — Front Desk Flow</h4>
<ol>
<li>Guest arrives → Reception checks them in on PMS</li>
<li>PMS sends room assignment to LAXREE middleware</li>
<li>Middleware encodes RFID card at the desk encoder</li>
<li>Guest taps card on room door → Opens instantly</li>
<li>At checkout, PMS automatically deactivates the card</li>
</ol>`,
      },
      {
        title: 'Security Features & Standards',
        content: `<h4>Military-Grade Encryption</h4>
<p>Our RFID locks use <strong>AES-128 encryption</strong> — the same standard used by banks and governments. Each card has a unique encrypted ID that cannot be cloned or copied.</p>
<h4>Physical Security</h4>
<ul>
<li><strong>SS304 stainless steel:</strong> Anti-corrosion, anti-rust — perfect for coastal hotels</li>
<li><strong>IP65 rating:</strong> Dust-tight and water-jet resistant</li>
<li><strong>Anti-pry clutch:</strong> Outside handle spins freely when locked — cannot force</li>
<li><strong>Deadbolt mode:</strong> Guest can engage internal deadbolt for double security</li>
<li><strong>Panic exit:</strong> Inside handle always opens — fire safety compliant</li>
</ul>
<h4>💡 Sales Tip for Coastal Hotels</h4>
<p>Always emphasize <strong>SS304 stainless steel + IP65 rating</strong> for coastal properties. Standard brass/zinc locks corrode within 1-2 years near the sea. LAXREE locks last 7+ years in salt-air environments.</p>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Selling by Hotel Situation</h4>
<ul>
<li><strong>New Construction:</strong> "Start with the best — RFID from day one saves retrofit costs later"</li>
<li><strong>Renovation:</strong> "Our retrofit models fit your existing doors — upgrade in a single day per floor"</li>
<li><strong>Competitor Switch:</strong> "Our PMS integration is plug-and-play — no custom development needed"</li>
</ul>
<h4>🛡️ Common Objections</h4>
<p><strong>"RFID locks are too expensive"</strong></p>
<p>→ "Consider the total cost: mechanical keys cost ₹200-400 per re-keying × 2-3 per room per year. RFID cards cost ₹15 each and are reusable. Over 5 years, RFID actually costs less than mechanical keys."</p>
<p><strong>"What if the system goes down?"</strong></p>
<p>→ "Our locks operate independently — each lock has its own processor and battery. Even if the server goes down, existing cards continue to work. Plus, every lock has a mechanical master key override."</p>`,
      },
    ],
  },
  {
    id: 'rollaway-bed',
    title: 'Rollaway Bed',
    subtitle: 'Extra Bed Solutions for Hotels',
    videoFile: 'Rollaway Bed.mp4',
    pdfFile: 'Rollaway Bed.pdf',
    pdfTitle: 'Rollaway Bed Product Guide',
    icon: BedDouble,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    color: 'rose',
    badge: 'Folding & Fixed',
    description: 'LAXREE Rollaway Beds provide hotels with flexible extra bedding that can be deployed in minutes and stored compactly when not needed. Heavy-duty frames with premium mattresses ensure guest comfort matches permanent beds.',
    keyFeatures: [
      'Quick-fold mechanism — setup in under 60 seconds by housekeeping',
      'Premium 5-inch high-density foam mattress for guest comfort',
      'Heavy-duty steel frame supports up to 150kg weight capacity',
      'Smooth-rolling castor wheels with lock for safety and mobility',
      'Compact fold: Just 15cm thick when stored — fits under beds or in closets',
      'Removable and washable mattress cover for hygiene compliance',
    ],
    specs: [
      { label: 'Bed Size', value: '75" × 36" / 75" × 42" (Single)' },
      { label: 'Mattress', value: '5" HD foam / Spring options' },
      { label: 'Frame', value: 'Powder-coated steel, 150kg capacity' },
      { label: 'Folded Thickness', value: '15cm (compact storage)' },
      { label: 'Wheels', value: '4 castor wheels with individual locks' },
      { label: 'Weight', value: '22kg – 28kg (easy handling)' },
    ],
    faq: [
      {
        question: 'How comfortable is a rollaway bed compared to a regular bed?',
        answer: 'LAXREE rollaway beds feature a 5-inch high-density foam mattress that provides firm, supportive comfort similar to a premium hotel single bed. Guest feedback consistently rates our rollaway comfort at 4/5 or higher. For properties wanting even more comfort, we offer spring mattress upgrades.',
      },
      {
        question: 'How easy is it to set up and store?',
        answer: 'Very easy! Our quick-fold mechanism allows a single housekeeping staff member to set up the bed in under 60 seconds — unfold, lock the frame, and it\'s ready. To store, simply fold flat and roll into storage. The 15cm folded thickness means 6-8 beds can be stored in the space of one regular bed.',
      },
      {
        question: 'What is the weight capacity?',
        answer: 'Our standard rollaway beds support up to 150kg. The heavy-duty frame uses 25mm powder-coated steel tubes with reinforced cross-bars. We also offer a bariatric model rated for 200kg for accessibility-compliant rooms.',
      },
      {
        question: 'How do we maintain hygiene between guests?',
        answer: 'The mattress cover is fully removable and machine-washable. We recommend washing after each guest checkout. The steel frame can be wiped with standard hotel disinfectant. We also offer waterproof mattress protectors as an add-on for extra hygiene protection.',
      },
    ],
    chapters: [
      {
        title: 'Why Rollaway Beds Matter for Hotels',
        content: `<p>Rollaway beds are a <strong>revenue multiplier</strong> for hotels. They allow a standard room to accommodate an extra guest, converting a double room into a triple — instantly increasing room revenue by 25-40%.</p>
<h4>📊 The Revenue Math</h4>
<ul>
<li>Average double room rate: ₹5,000/night</li>
<li>Extra person charge with rollaway: ₹1,500-2,000/night</li>
<li>Rollaway bed cost: ₹8,000-15,000 (one-time)</li>
<li><strong>Breakeven in just 5-8 nights of use!</strong></li>
</ul>
<h4>When Hotels Need Rollaway Beds</h4>
<ul>
<li><strong>Family bookings:</strong> 3rd person in a double room</li>
<li><strong>Group tours:</strong> Maximize room occupancy</li>
<li><strong>Corporate sharing:</strong> Two colleagues sharing a room</li>
<li><strong>Events/Weddings:</strong> Peak season overflow</li>
</ul>`,
      },
      {
        title: 'LAXREE Rollaway Bed Range',
        content: `<h4>Folding Rollaway — Most Popular</h4>
<p>Our <strong>best-seller</strong> — folds flat in seconds, rolls on 4 castor wheels, stores in any closet.</p>
<ul>
<li><strong>Standard:</strong> 75" × 36", 5" HD foam, steel frame</li>
<li><strong>Deluxe:</strong> 75" × 42", 6" spring mattress, padded headboard</li>
<li><strong>Premium:</strong> 75" × 42", pocket spring, wooden headboard, premium upholstery</li>
</ul>
<h4>Fixed Rollaway / Day Bed</h4>
<p>For hotels that want a <strong>permanent extra bed</strong> that doubles as seating during the day. No folding mechanism — just a stylish day bed frame with a comfortable mattress.</p>
<ul>
<li>Upholstered in fabric, faux leather, or custom material</li>
<li>Functions as seating during day + bed at night</li>
<li>Popular in suites and family rooms</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Selling by Hotel Need</h4>
<table>
<tr><th>Hotel Situation</th><th>Recommended Model</th><th>Pitch Angle</th></tr>
<tr><td>Budget / 3-Star</td><td>Standard Folding</td><td>"Revenue booster — pays for itself in a week"</td></tr>
<tr><td>4-Star Premium</td><td>Deluxe Folding</td><td>"Guests won't believe it's a rollaway"</td></tr>
<tr><td>5-Star Luxury</td><td>Premium / Day Bed</td><td>"Extra bed that looks like designer furniture"</td></tr>
<tr><td>Resort / Family</td><td>Deluxe + Waterproof</td><td>"Built for heavy use, easy to sanitize"</td></tr>
</table>
<h4>🛡️ Common Objections</h4>
<p><strong>"Rollaway beds are uncomfortable"</strong></p>
<p>→ "That was true 10 years ago. Our 5-inch HD foam mattresses are the same quality as permanent hotel beds. Many guests can't tell the difference."</p>
<p><strong>"We don't get requests for extra beds"</strong></p>
<p>→ "That's because you're not offering it! Hotels that actively market rollaway beds see 20-30% of rooms use them. It's an untapped revenue stream."</p>`,
      },
    ],
  },
  {
    id: 'add-ons',
    title: 'Hotel Add-ons',
    subtitle: 'Room Accessories & Comfort Extras',
    videoFile: 'Add-ons.mp4',
    pdfFile: 'Hotel Add-ons.pdf',
    pdfTitle: 'Hotel Add-ons Product Guide',
    icon: Puzzle,
    gradient: 'from-lime-500 to-green-600',
    bgLight: 'bg-lime-50',
    color: 'lime',
    badge: '15+ Products',
    description: 'LAXREE Hotel Add-ons cover everything that completes the guest room experience — from luggage racks and ironing boards to shoe shine kits and laundry bags. These small touches make a big difference in guest satisfaction scores.',
    keyFeatures: [
      'Luggage racks in wood/metal to keep bags off the floor',
      'Ironing boards with wall-mount and foldable options',
      'Shoe shine kits and valet stands for business travelers',
      'Laundry bags and in-room shopping bags',
      'Bathroom accessories: soap dispensers, towel racks, robe hooks',
      'Room signage: DO NOT DISTURB, MAKE UP ROOM, door bells',
    ],
    specs: [
      { label: 'Product Range', value: '15+ categories, 100+ SKUs' },
      { label: 'Luggage Rack', value: 'Wood / Chrome / Folding options' },
      { label: 'Ironing Board', value: 'Wall-mount / Table-top / Freestanding' },
      { label: 'Signage', value: 'Acrylic / Metal / Leather / Wooden' },
      { label: 'Material', value: 'SS304 / Wood / ABS / Leather / Fabric' },
      { label: 'Customization', value: 'Hotel logo, colors, and sizes' },
    ],
    faq: [
      {
        question: 'What add-on products are most commonly ordered?',
        answer: 'The top 5 most ordered add-ons are: (1) Luggage racks, (2) Ironing boards (wall-mount), (3) DO NOT DISTURB / MAKE UP ROOM signs, (4) Laundry bags, and (5) Bathroom amenity dispensers. Hotels typically order these as a complete room package alongside our main product lines.',
      },
      {
        question: 'Can we order add-ons with our hotel branding?',
        answer: 'Yes! Almost all add-on products support custom branding. Luggage racks can have logos laser-engraved on the strap. Signs can feature hotel logos. Laundry bags can be printed with hotel name and laundry instructions. Minimum order quantities apply per product.',
      },
      {
        question: 'Do you offer room package bundles?',
        answer: 'Absolutely! Our most popular bundle is the "Complete Room Package" — minibar + kettle + safe + hangers + luggage rack + signage — at a 15-20% bundle discount. This is the fastest way to fully equip a new hotel room, and it ensures everything matches perfectly.',
      },
      {
        question: 'What is the warranty on add-on products?',
        answer: 'Warranty varies by product: Luggage racks and ironing boards have 2-year warranty. Signage and laundry bags have 1-year warranty. Bathroom accessories have 3-year warranty. All warranties cover manufacturing defects and are handled through our pan-India service network.',
      },
    ],
    chapters: [
      {
        title: 'The Power of Room Add-ons',
        content: `<p>While minibars and safes get the spotlight, <strong>room add-ons are the profit multiplier</strong> that most salespeople overlook. Here's why they matter:</p>
<h4>💰 Why Add-ons = Higher Order Value</h4>
<ul>
<li><strong>Bundling:</strong> Adding a ₹3,000 luggage rack to a ₹15,000 minibar order increases value by 20% with minimal effort</li>
<li><strong>Fill Rate:</strong> When a hotel is furnishing 100+ rooms, they need EVERYTHING — not just the big items</li>
<li><strong>Reorder Frequency:</strong> Add-ons need replacement more often than big items — recurring revenue!</li>
<li><strong>Relationship Builder:</strong> Small orders keep you in touch with the client between big purchases</li>
</ul>
<h4>🎯 The Complete Room Checklist</h4>
<p>Every hotel room needs these add-on items. Memorize this list:</p>
<ol>
<li>Luggage rack / stand</li>
<li>Ironing board + iron</li>
<li>DO NOT DISTURB / MAKE UP ROOM sign</li>
<li>Laundry bag + laundry list</li>
<li>Shoe shine kit / valet stand</li>
<li>Bathroom amenity dispensers</li>
<li>Towel rack / robe hook</li>
<li>Wastebasket</li>
<li>Room service menu holder</li>
<li>Door bell / door knocker</li>
</ol>`,
      },
      {
        title: 'Top Add-on Products Deep Dive',
        content: `<h4>Luggage Racks</h4>
<p>The #1 add-on. Every hotel room needs one. Our range includes:</p>
<ul>
<li><strong>Wooden folding:</strong> Classic, foldable, popular in 4-5 star</li>
<li><strong>Chrome with straps:</strong> Modern, lightweight, budget-friendly</li>
<li><strong>Upholstered:</strong> Premium fabric-top for luxury properties</li>
</ul>
<h4>Ironing Solutions</h4>
<ul>
<li><strong>Wall-mount ironing board:</strong> Folds into the wall — saves space, most popular</li>
<li><strong>Table-top board:</strong> Compact, stored in wardrobe shelf</li>
<li><strong>Freestanding board:</strong> Full-size for suites</li>
<li><strong>Steam iron:</strong> Available bundled with any board option</li>
</ul>
<h4>Room Signage</h4>
<ul>
<li><strong>DO NOT DISTURB / MAKE UP ROOM:</strong> Available in acrylic, metal, leather, and wooden finishes</li>
<li><strong>Door numbers:</strong> Brass, stainless steel, or backlit acrylic</li>
<li><strong>WiFi info card:</strong> Custom printed with hotel branding</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 The Bundle Strategy — Always Sell the Room, Not the Product</h4>
<p>The golden rule of selling add-ons: <strong>Never sell an add-on alone</strong>. Always position it as part of the complete room solution.</p>
<p><strong>Example Pitch:</strong></p>
<p>"You're ordering 200 minibars for your new property. That's great! But have you thought about the complete room experience? When a guest enters the room, they also need a luggage rack, signage, and ironing board. We can bundle everything at a 15% discount — and deliver it all together so your rooms are ready on time."</p>
<h4>🛡️ Common Objections</h4>
<p><strong>"We'll source add-ons locally — they're cheaper"</strong></p>
<p>→ "Local items may save 10-15% upfront, but they won't match the quality and design of your main room items. Inconsistent quality shows — guests notice when the minibar looks premium but the luggage rack is flimsy. Our matched collections ensure a cohesive experience."</p>
<p><strong>"We don't need all these items"</strong></p>
<p>→ "Let me show you what your competitor down the street ordered last month... (show similar hotel's complete package). Properties that furnish rooms completely score 18% higher on guest satisfaction surveys."</p>`,
      },
    ],
  },
  {
    id: 'dustbin',
    title: 'Lobby Dustbin',
    subtitle: 'Premium Waste Management Solutions',
    videoFile: 'Dustbin.mp4',
    pdfFile: 'Lobby Dustbin.pdf',
    pdfTitle: 'Lobby Dustbin Product Guide',
    icon: Trash2,
    gradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50',
    color: 'emerald',
    badge: '10+ Models',
    description: 'LAXREE Lobby Dustbins combine functionality with elegance. Available in stainless steel, synthetic stone, and natural stone finishes with gold accents — designed to complement premium hotel lobbies, corridors, and public areas.',
    keyFeatures: [
      'Premium stainless steel construction for durability and corrosion resistance',
      'Natural and synthetic stone finishes with gold accents for luxury lobbies',
      'Swing lid models for hygiene and odor control in guest areas',
      'Multiple shapes: cylindrical and rectangular for versatile placement',
      'Wide range of sizes from 250mm to 310mm diameter/width',
      'Matching stanchions, signage, and caution signs for complete lobby solutions',
    ],
    specs: [
      { label: 'Material', value: 'SS / Synthetic Stone / Natural Stone' },
      { label: 'Lid Type', value: 'Open-top / Swing Lid' },
      { label: 'Shapes', value: 'Cylindrical / Rectangular' },
      { label: 'Height Range', value: '600mm – 680mm' },
      { label: 'Width Range', value: '250mm – 310mm' },
      { label: 'Finish Options', value: 'SS Mirror / Black / Stone with Gold Accents' },
    ],
    faq: [
      {
        question: 'What type of dustbin is best for a 5-star hotel lobby?',
        answer: 'For 5-star lobbies, our Natural Stone dustbins with gold accents (LRLI-446, LRLI-448) are the top choice. They add a premium, luxurious aesthetic that matches high-end interiors. The stone construction is also incredibly durable and easy to maintain.',
      },
      {
        question: 'Why choose swing lid dustbins over open-top?',
        answer: 'Swing lid dustbins (LRLI-449, LRLI-450) are ideal for guest-facing areas where hygiene and odor control matter. The self-closing lid conceals waste and prevents unpleasant smells from spreading. Open-top models are better for high-traffic areas where quick disposal is priority.',
      },
      {
        question: 'What is the difference between synthetic and natural stone finish?',
        answer: 'Natural stone dustbins use genuine stone for an authentic, premium look with natural variations. Synthetic stone offers the same appearance at a lower cost with more consistent coloring and slightly lighter weight. Both are equally durable for hotel use.',
      },
      {
        question: 'Can dustbins be customized with hotel branding?',
        answer: 'Yes! Stainless steel models can be laser-engraved with hotel logos. Stone models can feature custom gold-plate nameplates. We also offer custom colors for the body and lid to match hotel interior themes. Minimum order quantities apply.',
      },
    ],
    chapters: [
      {
        title: 'LAXREE Lobby Dustbin Collection',
        content: `<p>LAXREE lobby dustbins are designed to be <strong>seen, not hidden</strong>. In premium hotels, even waste management should complement the interior design. Our range ensures that every corner of your hotel maintains its aesthetic standards.</p>
<h4>Our Dustbin Categories</h4>
<ul>
<li><strong>🥤 Stainless Steel Series:</strong> Durable, modern, and easy to clean — the workhorse for corridors and function areas</li>
<li><strong>🪨 Stone-Finish Series:</strong> Premium natural/synthetic stone with gold accents — designed for luxury lobbies</li>
<li><strong>🔄 Swing Lid Series:</strong> Hygiene-focused with self-closing lids — ideal for guest dining and reception areas</li>
</ul>`,
      },
      {
        title: 'Stainless Steel Dustbins',
        content: `<p>Our <strong>stainless steel dustbins</strong> are the most versatile option, suitable for every area of the hotel:</p>
<h4>Cylindrical Models</h4>
<table>
<tr><th>Model</th><th>Dimensions</th><th>Lid Type</th><th>Best For</th></tr>
<tr><td>LRLI-453</td><td>D250×H600mm</td><td>Open-top</td><td>Corridors, elevators, stairwells</td></tr>
<tr><td>LRLI-451</td><td>D300×H600mm</td><td>Open-top</td><td>Lobby corners, reception areas</td></tr>
<tr><td>LRLI-449</td><td>Standard</td><td>SS Swing Lid</td><td>Dining areas, breakfast halls</td></tr>
<tr><td>LRLI-450</td><td>Standard</td><td>SS Swing Lid</td><td>Guest corridors, meeting rooms</td></tr>
</table>
<h4>Rectangular Models</h4>
<table>
<tr><th>Model</th><th>Dimensions</th><th>Lid Type</th><th>Best For</th></tr>
<tr><td>LRLI-445</td><td>L250×W250×H600mm</td><td>Open-top</td><td>Along walls, near elevators</td></tr>
<tr><td>LRLI-452</td><td>L310×W250×H600mm</td><td>Open-top</td><td>Lobby entrances, restrooms</td></tr>
</table>`,
      },
      {
        title: 'Stone-Finish Premium Dustbins',
        content: `<p>Our <strong>stone-finish dustbins</strong> are designed for hotels where every detail matters. The combination of natural/synthetic stone with gold accents creates a <strong>statement piece</strong> that elevates lobby aesthetics.</p>
<h4>Synthetic Stone Models</h4>
<ul>
<li><strong>LRLI-454:</strong> L280×W280×H680mm — Compact luxury for boutique lobbies</li>
<li><strong>LRLI-447:</strong> L300×W300×H680mm — Statement piece for grand lobbies</li>
</ul>
<h4>Natural Stone Models</h4>
<ul>
<li><strong>LRLI-446:</strong> L280×W280×H620mm — Authentic stone, unique variations</li>
<li><strong>LRLI-448:</strong> L300×W300×H680mm — Premium, one-of-a-kind natural patterns</li>
</ul>
<h4>💡 Sales Tip</h4>
<p>Always show stone-finish dustbins in person or with high-quality photos. The gold accents and stone texture create a visual impact that photos barely capture. For 5-star hotel clients, request a sample unit for their lobby trial.</p>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Positioning by Hotel Area</h4>
<table>
<tr><th>Hotel Area</th><th>Recommended Model</th><th>Why</th></tr>
<tr><td>5-Star Lobby</td><td>Natural Stone (446/448)</td><td>Luxury aesthetics, gold accents</td></tr>
<tr><td>4-Star Lobby</td><td>Synthetic Stone (454/447)</td><td>Premium look at lower cost</td></tr>
<tr><td>Corridors</td><td>SS Cylindrical (453/451)</td><td>Durable, easy to clean</td></tr>
<tr><td>Dining Areas</td><td>SS Swing Lid (449/450)</td><td>Hygiene, odor control</td></tr>
<tr><td>Budget Hotel</td><td>SS Rectangular (445/452)</td><td>Best value, space-efficient</td></tr>
</table>
<h4>🛡️ Common Objections</h4>
<p><strong>"Dustbins are just functional items — why invest in premium?"</strong></p>
<p>→ "Your lobby dustbins are one of the first things guests notice. A mismatched or cheap dustbin in a luxury lobby creates dissonance. Our stone-finish models are designed to enhance your interior, not detract from it."</p>
<p><strong>"Stone dustbins are too expensive"</strong></p>
<p>→ "Natural stone dustbins last 10+ years with zero maintenance. Spread across their lifespan, the cost per day is less than a cup of coffee. Plus, they eliminate the need for dustbin covers or concealment furniture."</p>`,
      },
    ],
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping Trolley',
    subtitle: 'Housekeeping & Linen Transport Solutions',
    videoFile: 'Housekeeping.mp4',
    pdfFile: 'Housekeeping Trolley.pdf',
    pdfTitle: 'Housekeeping Trolley Product Guide',
    icon: ShoppingCart,
    gradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50',
    color: 'cyan',
    badge: '5 Categories',
    description: 'LAXREE Housekeeping Trolleys are built for efficiency and style. From stainless steel maid carts to lightweight ABS trolleys and dedicated linen carriers — every product is designed for the demanding pace of hotel housekeeping operations.',
    keyFeatures: [
      'Stainless steel body trolleys for maximum durability and professional appearance',
      'Wooden/composite body trolleys for a warm, traditional hotel aesthetic',
      'Lightweight ABS body trolleys for easy maneuverability and cost efficiency',
      'Dedicated linen trolleys with large-capacity fabric liners for laundry transport',
      'Platform trolleys for general-purpose heavy-item transport',
      'All models feature smooth-rolling castor wheels for effortless mobility',
    ],
    specs: [
      { label: 'Body Material', value: 'SS / Wooden / ABS / Metal Frame' },
      { label: 'Trolley Type', value: 'Maid Cart / Linen / Platform' },
      { label: 'Storage', value: 'Open Shelves / Enclosed with Lid & Door' },
      { label: 'Liner Material', value: 'Brown / Yellow / Black fabric' },
      { label: 'Wheels', value: '4 castor wheels (standard on all models)' },
      { label: 'Color Options', value: 'Brown / Gray / Yellow / Black / Chrome' },
    ],
    faq: [
      {
        question: 'What type of housekeeping trolley is best for a luxury hotel?',
        answer: 'For 5-star luxury hotels, our Stainless Steel Body trolleys (LRHT-428, LRHT-434) are the top choice. They offer a professional, modern appearance that matches luxury corridors, and the enclosed models with lid and door keep supplies hidden from guest view. The SS body also ensures maximum longevity.',
      },
      {
        question: 'What is the difference between open-shelf and enclosed trolleys?',
        answer: 'Open-shelf trolleys (LRHT-428, LRHT-427) allow housekeeping staff quick access to supplies — ideal for efficient room cleaning. Enclosed trolleys with lid and door (LRHT-434, LRHT-431) conceal supplies from guest view, maintaining the hotel\'s aesthetic standards in corridors. Luxury hotels prefer enclosed models.',
      },
      {
        question: 'Why choose ABS body trolleys over stainless steel?',
        answer: 'ABS trolleys (LRHT-429, LRHT-433) are 30-40% lighter than SS models, making them easier to maneuver — especially important for properties with long corridors or multiple floors. They\'re also more affordable and come in bright colors that can be coordinated with housekeeping uniforms. However, SS models are more durable long-term.',
      },
      {
        question: 'How do linen trolleys integrate with hotel laundry operations?',
        answer: 'Our linen trolleys (LRHT-430, LRHT-432) feature large-capacity fabric liners that can hold 50+ kg of linens. The open-top design allows housekeeping to deposit used linens quickly. Color-coded liners (black for dirty, yellow for clean) prevent cross-contamination. They\'re designed to fit standard hotel elevators and corridor widths.',
      },
    ],
    chapters: [
      {
        title: 'LAXREE Housekeeping Trolley Range',
        content: `<p>Housekeeping trolleys are the <strong>backbone of hotel operations</strong>. The right trolley improves housekeeping efficiency by up to 30% and directly impacts guest satisfaction through faster room turnaround times.</p>
<h4>Our Trolley Categories</h4>
<ul>
<li><strong>🏥 SS Body Trolleys:</strong> Professional, durable, premium appearance — for luxury properties</li>
<li><strong>🪵 Wooden Body Trolleys:</strong> Warm, traditional look — for heritage and boutique hotels</li>
<li><strong>🧳 ABS Body Trolleys:</strong> Lightweight, colorful, cost-effective — for budget and business hotels</li>
<li><strong>🧺 Linen Trolleys:</strong> Dedicated laundry transport — for every hotel size</li>
<li><strong>📦 Platform Trolleys:</strong> Heavy-duty general transport — for engineering and events</li>
</ul>`,
      },
      {
        title: 'SS & Wooden Body Trolleys',
        content: `<h4>Stainless Steel Body Trolleys</h4>
<p>The <strong>professional standard</strong> for premium hotels. SS body ensures years of reliable service while maintaining a clean, modern appearance in guest corridors.</p>
<table>
<tr><th>Model</th><th>Style</th><th>Features</th><th>Best For</th></tr>
<tr><td>LRHT-428</td><td>Open Shelves</td><td>SS body, brown fabric sides</td><td>Quick-access housekeeping</td></tr>
<tr><td>LRHT-434</td><td>Enclosed</td><td>SS body, lid & door, brown fabric</td><td>Luxury corridor service</td></tr>
</table>
<h4>Wooden Body Trolleys</h4>
<p>For hotels that want a <strong>warm, traditional aesthetic</strong> that blends with wooden interiors and heritage décor.</p>
<table>
<tr><th>Model</th><th>Style</th><th>Features</th><th>Best For</th></tr>
<tr><td>LRHT-427</td><td>Open Shelves</td><td>Wooden body, brown fabric</td><td>Heritage hotel service</td></tr>
<tr><td>LRHT-431</td><td>Enclosed</td><td>Wooden body, lid & door, brown fabric</td><td>Premium boutique corridors</td></tr>
</table>`,
      },
      {
        title: 'ABS, Linen & Platform Trolleys',
        content: `<h4>ABS Body Trolleys</h4>
<p>Lightweight and affordable — perfect for hotels that need <strong>maneuverability and budget efficiency</strong>.</p>
<table>
<tr><th>Model</th><th>Style</th><th>Features</th><th>Best For</th></tr>
<tr><td>LRHT-429</td><td>Cabinet</td><td>ABS body, gray cabinet, yellow bins</td><td>Business hotels, 3-star</td></tr>
<tr><td>LRHT-433</td><td>X-Frame</td><td>ABS body, yellow fabric bin</td><td>Budget hotels, quick service</td></tr>
</table>
<h4>Linen Trolleys</h4>
<p>Dedicated <strong>laundry transport</strong> — every hotel needs at least one per floor.</p>
<table>
<tr><th>Model</th><th>Liner Color</th><th>Best For</th></tr>
<tr><td>LRHT-430</td><td>Black</td><td>Dirty linen collection</td></tr>
<tr><td>LRHT-432</td><td>Yellow</td><td>Clean linen distribution</td></tr>
</table>
<h4>Platform Trolley</h4>
<ul>
<li><strong>LRHT-425:</strong> Flat platform, chrome frame, 4 wheels — ideal for heavy items, engineering supplies, and event setup</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Selling by Hotel Type</h4>
<table>
<tr><th>Hotel Type</th><th>Recommended Trolley</th><th>Pitch Angle</th></tr>
<tr><td>5-Star Luxury</td><td>SS Enclosed (LRHT-434)</td><td>"Concealed service = undisturbed guest experience"</td></tr>
<tr><td>4-Star Premium</td><td>SS Open (LRHT-428)</td><td>"Professional look, fast access, built to last"</td></tr>
<tr><td>Heritage/Boutique</td><td>Wooden Enclosed (LRHT-431)</td><td>"Matches your heritage interiors perfectly"</td></tr>
<tr><td>3-Star / Business</td><td>ABS Cabinet (LRHT-429)</td><td>"Lightweight, affordable, gets the job done"</td></tr>
<tr><td>Any Hotel (Laundry)</td><td>Linen Trolleys (430/432)</td><td>"Color-coded hygiene — standard practice"</td></tr>
</table>
<h4>🛡️ Common Objections</h4>
<p><strong>"Our current trolleys work fine"</strong></p>
<p>→ "Are your housekeeping staff complaining about back pain or slow room turnover? Our trolleys are ergonomically designed with smooth-rolling wheels and accessible shelf heights. Hotels that switch report 20-30% faster room cleaning times."</p>
<p><strong>"Trolleys don't affect guest experience"</strong></p>
<p>→ "Guests notice everything in corridors — including messy, open trolleys with supplies visible. Our enclosed models ensure your housekeeping operations remain invisible, maintaining the premium impression your hotel delivers."</p>`,
      },
    ],
  },
  {
    id: 'mirror-hairdryer',
    title: 'Mirror & Hair Dryer',
    subtitle: 'Bathroom Grooming Solutions',
    videoFile: 'mirror & hair drayer.mp4',
    pdfFile: 'Mirror & Hair Dryer.pdf',
    pdfTitle: 'Mirror & Hair Dryer Product Guide',
    icon: Wind,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    color: 'rose',
    badge: '18 Models',
    description: 'LAXREE offers a complete range of bathroom grooming solutions — 9 hair dryer models (wall-mounted and freestanding) and 9 magnifying mirror models (with LED and non-LED options). From basic white models to premium rose gold finishes, our range covers every hotel tier and design aesthetic.',
    keyFeatures: [
      '9 hair dryer models: wall-mounted with coiled cord and freestanding options',
      '9 magnifying mirror models: swing arm, LED-lit, battery-powered, and tabletop',
      'Multiple finishes: Stainless Steel, Rose Gold, Matte Black to match any bathroom décor',
      'Ionic & tourmaline ceramic technology for premium hair dryer performance',
      'LED lighting with both wired (power supply) and battery-powered options',
      'Wall-mounted space-saving designs ideal for hotel bathrooms',
    ],
    specs: [
      { label: 'Hair Dryer Power', value: '1400W – 2000W' },
      { label: 'Dryer Types', value: 'Wall-Mounted (coiled cord) / Freestanding' },
      { label: 'Mirror Magnification', value: '5x (all models)' },
      { label: 'Mirror Power', value: 'Non-electric / LED Wired / LED Battery (4x AA)' },
      { label: 'Finishes', value: 'SS / Rose Gold / Matte Black / White / Black' },
      { label: 'Dryer Safety', value: 'Auto shut-off, Overheat protection, Child lock' },
    ],
    faq: [
      {
        question: 'Wall-mounted vs freestanding hair dryers: which should we choose?',
        answer: 'Wall-mounted hair dryers are the preferred choice for most hotels because they save counter space, reduce theft (the coiled cord keeps the dryer anchored), and prevent guests from accidentally leaving the dryer in their luggage. Freestanding dryers are ideal for suites with spacious vanity counters or boutique hotels that want a residential, home-like bathroom feel.',
      },
      {
        question: 'LED mirror: wired vs battery-powered — which is better?',
        answer: 'Wired (power supply) LED mirrors are recommended for new builds and renovations where electrical wiring can be planned — they offer consistent, reliable lighting with no battery replacement costs. Battery-powered LED mirrors (4x AA) are ideal for retrofit installations where running new wiring is impractical — they last 6-12 months on a set of batteries depending on usage, and housekeeping can replace batteries during room turns.',
      },
      {
        question: 'Which finish is best for luxury hotels?',
        answer: 'Rose Gold is the trending premium finish for 5-star and luxury properties — it adds warmth and sophistication to bathroom interiors. Stainless Steel (polished or brushed) remains the timeless classic that works with any design scheme. Matte Black is increasingly popular for contemporary and boutique hotels seeking a bold, modern statement.',
      },
      {
        question: 'How does ionic/tourmaline technology benefit guests?',
        answer: 'Ionic technology emits negative ions that break down water molecules faster, reducing drying time by up to 40%. Tourmaline ceramic components emit far-infrared heat that dries hair from the inside out, preventing surface damage and frizz. For hotels, this means happier guests with better hair results — a small detail that contributes to positive reviews and repeat bookings.',
      },
      {
        question: 'What about maintenance and durability of mirrors and dryers?',
        answer: 'All LAXREE mirrors use rust-resistant finishes and moisture-sealed LED components rated for bathroom environments. Hair dryers feature auto shut-off on the wall mount bracket — when the dryer is placed back, it automatically turns off, preventing overheating and energy waste. Both products come with a 2-year warranty and are designed for 5+ years of daily hotel use.',
      },
    ],
    chapters: [
      {
        title: 'Complete Bathroom Grooming Overview',
        content: `<p>LAXREE provides the <strong>complete bathroom grooming solution</strong> for hotels — from hair dryers that guests use daily to magnifying mirrors that elevate the grooming experience. Our range covers every hotel tier and budget.</p>
<h4>💇 Hair Dryer Categories</h4>
<ul>
<li><strong>🔴 Wall-Mounted (Coiled Cord):</strong> 6 models — space-saving, theft-resistant, the industry standard</li>
<li><strong>🔵 Freestanding:</strong> 3 models — for suites and boutique hotels with spacious vanities</li>
</ul>
<h4>🪞 Magnifying Mirror Categories</h4>
<ul>
<li><strong>⚪ Non-LED:</strong> 3 models — classic swing-arm mirrors without lighting</li>
<li><strong>🟡 LED Wired:</strong> 3 models — permanent power supply, consistent brightness</li>
<li><strong>🟢 LED Battery:</strong> 2 models — easy retrofit, no wiring needed</li>
<li><strong>🟣 Tabletop:</strong> 1 model — vanity counter placement, ideal for suites</li>
</ul>
<p>That's <strong>18 models total</strong> — the most comprehensive bathroom grooming range in the Indian hotel supply market.</p>`,
      },
      {
        title: 'Hair Dryer Deep Dive',
        content: `<h4>🔴 Wall-Mounted Hair Dryers (Coiled Cord)</h4>
<p>The <strong>industry standard</strong> for hotel bathrooms — mounted on the wall with a coiled retractable cord that keeps the dryer in place.</p>
<table>
<tr><th>Model</th><th>Power</th><th>Finish</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>LRHD-284</td><td>1600W</td><td>White</td><td>Ionic technology, auto shut-off</td><td>3-4 star hotels, budget-friendly</td></tr>
<tr><td>LRHD-285</td><td>1600W</td><td>Black</td><td>Ionic technology, auto shut-off</td><td>Business hotels, dark bathroom themes</td></tr>
<tr><td>LRHD-279</td><td>1800W</td><td>SS / Rose Gold</td><td>Tourmaline ceramic, 2-speed + cool shot</td><td>4-5 star, premium finish</td></tr>
<tr><td>LRHD-276</td><td>1600W</td><td>White / SS</td><td>Foldable handle, compact design</td><td>Cruise ships, compact bathrooms</td></tr>
<tr><td>LRHD-277</td><td>1600W</td><td>Black / SS</td><td>Removable filter, overheat protection</td><td>High-traffic hotels, easy maintenance</td></tr>
<tr><td>LRHD-278</td><td>2000W</td><td>SS / Rose Gold</td><td>Professional-grade, concentrator nozzle</td><td>5-star luxury, resort suites</td></tr>
</table>
<h4>🔵 Freestanding Hair Dryers</h4>
<p>For hotels that want a <strong>residential, home-like bathroom experience</strong>.</p>
<table>
<tr><th>Model</th><th>Power</th><th>Finish</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>LRHD-286</td><td>1800W</td><td>White / SS</td><td>2-speed + cool shot, ergonomic grip</td><td>Premium suites, resort rooms</td></tr>
<tr><td>LRHD-280</td><td>1600W</td><td>White</td><td>Lightweight, concentrator nozzle</td><td>Boutique hotels, mid-range</td></tr>
<tr><td>LRHD-281</td><td>1600W</td><td>Black</td><td>Sleek design, diffuser attachment</td><td>Contemporary hotels</td></tr>
</table>
<h4>💡 Selling Points</h4>
<ul>
<li><strong>Auto shut-off on mount:</strong> Dryer turns off when placed back — safety + energy savings</li>
<li><strong>Coiled cord:</strong> Prevents dryer from leaving the bathroom (theft deterrent)</li>
<li><strong>Ionic/Tourmaline tech:</strong> Faster drying, less damage = better guest experience</li>
<li><strong>Child lock:</strong> Select models prevent accidental activation by children</li>
</ul>`,
      },
      {
        title: 'Magnifying Mirror Deep Dive',
        content: `<h4>⚪ Non-LED Magnifying Mirrors</h4>
<p>Classic swing-arm mirrors — <strong>reliable, zero maintenance</strong>, perfect for budget-conscious properties.</p>
<table>
<tr><th>Model</th><th>Arm Type</th><th>Finish</th><th>Best For</th></tr>
<tr><td>LRMM-305 S</td><td>Swing Arm</td><td>Stainless Steel</td><td>3-star, business hotels</td></tr>
<tr><td>LRMM-305 R</td><td>Swing Arm</td><td>Rose Gold</td><td>Boutique, lifestyle hotels</td></tr>
<tr><td>LRMM-305 B</td><td>Swing Arm</td><td>Matte Black</td><td>Contemporary, modern hotels</td></tr>
</table>
<h4>🟡 LED Wired Magnifying Mirrors</h4>
<p>Premium mirrors with <strong>permanent LED lighting</strong> — no battery replacements, consistent brightness.</p>
<table>
<tr><th>Model</th><th>Arm Type</th><th>Finish</th><th>Lighting</th><th>Best For</th></tr>
<tr><td>LRMM-302 S</td><td>Swing Arm</td><td>Stainless Steel</td><td>LED (power supply)</td><td>4-5 star, premium standard</td></tr>
<tr><td>LRMM-302 R</td><td>Swing Arm</td><td>Rose Gold</td><td>LED (power supply)</td><td>5-star luxury, VIP suites</td></tr>
<tr><td>LRMM-302 B</td><td>Swing Arm</td><td>Matte Black</td><td>LED (power supply)</td><td>Contemporary luxury</td></tr>
</table>
<h4>🟢 LED Battery Magnifying Mirrors</h4>
<p>Perfect for <strong>retrofit installations</strong> — no wiring needed, easy to mount on any wall.</p>
<table>
<tr><th>Model</th><th>Finish</th><th>Power</th><th>Best For</th></tr>
<tr><td>LRMM-304 S</td><td>Stainless Steel</td><td>4x AA batteries</td><td>Retrofit, renovation projects</td></tr>
<tr><td>LRMM-304 T</td><td>Matte Black</td><td>4x AA batteries</td><td>Modern retrofit, no wiring access</td></tr>
</table>
<h4>🟣 Tabletop Magnifying Mirror</h4>
<ul>
<li><strong>LRMM-306:</strong> Freestanding vanity mirror with 5x magnification, dual-sided (1x + 5x), elegant base — ideal for suite vanities and luxury bathroom counters</li>
</ul>
<h4>💡 Mirror Selling Points</h4>
<ul>
<li><strong>5x magnification:</strong> The standard for makeup application and detailed grooming</li>
<li><strong>LED lighting:</strong> Natural daylight simulation — guests see true colors for makeup</li>
<li><strong>Swing arm:</strong> Adjustable positioning for all heights and angles</li>
<li><strong>Multiple finishes:</strong> Match any bathroom design — SS for classic, Rose Gold for luxury, Matte Black for modern</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Hotel Tier Positioning</h4>
<table>
<tr><th>Hotel Tier</th><th>Hair Dryer</th><th>Mirror</th><th>Bundle Suggestion</th></tr>
<tr><td>3-Star / Budget</td><td>LRHD-284 (White, 1600W)</td><td>LRMM-305 S (Non-LED, SS)</td><td>"Essential grooming set"</td></tr>
<tr><td>4-Star / Business</td><td>LRHD-279 (SS/Rose Gold, 1800W)</td><td>LRMM-302 S (LED Wired, SS)</td><td>"Professional grooming experience"</td></tr>
<tr><td>5-Star / Luxury</td><td>LRHD-278 (Rose Gold, 2000W)</td><td>LRMM-302 R (LED Wired, Rose Gold)</td><td>"Premium grooming suite — matched finishes"</td></tr>
<tr><td>Boutique / Modern</td><td>LRHD-281 (Black, Freestanding)</td><td>LRMM-305 B (Non-LED, Matte Black)</td><td>"Contemporary dark-themed grooming"</td></tr>
<tr><td>Suite / Resort</td><td>LRHD-286 (Freestanding, SS)</td><td>LRMM-306 (Tabletop)</td><td>"Residential luxury — feel at home"</td></tr>
</table>
<h4>🔄 Bundle Strategy</h4>
<p>Always sell <strong>dryer + mirror together</strong> as a "Grooming Package". Matching finishes (both SS, both Rose Gold, both Matte Black) creates a cohesive bathroom design. Bundle discounts of 10-15% make it an easy upsell.</p>
<h4>🔀 Cross-Sell with Other LAXREE Products</h4>
<ul>
<li><strong>Soap Dispenser + Mirror + Dryer:</strong> Complete bathroom package — 3 products, one order, one invoice</li>
<li><strong>Kettle Tray + Grooming Package:</strong> "Room Comfort Bundle" — beverage station + bathroom grooming</li>
<li><strong>RFID Lock + Safe Box + Grooming:</strong> "Complete Room Setup" — security + comfort + convenience</li>
</ul>
<h4>🛡️ Common Objections</h4>
<p><strong>"Guests don't use hotel hair dryers"</strong></p>
<p>→ "Our data shows 62% of female guests and 34% of male guests use the in-room hair dryer at least once per stay. A quality hair dryer is one of the top 5 amenities guests check before booking."</p>
<p><strong>"Mirrors are unnecessary — the bathroom mirror is enough"</strong></p>
<p>→ "5x magnification makes a real difference for makeup application, contact lens insertion, and detailed grooming. Luxury hotels that add magnifying mirrors see a 15% increase in bathroom satisfaction scores on guest feedback."</p>
<p><strong>"Wall-mounted dryers look cheap"</strong></p>
<p>→ "Not LAXREE wall-mounted dryers. Our Rose Gold and Stainless Steel models with tourmaline ceramic technology look as premium as any freestanding dryer — plus they save counter space and prevent theft. Most 5-star chains use wall-mounted by choice."</p>`,
      },
    ],
  },
  {
    id: 'dispenser',
    title: 'Dispenser & Hand Dryer',
    subtitle: 'Bathroom Hygiene Solutions',
    videoFile: 'dispencer.mp4',
    pdfFile: 'Dispenser.pdf',
    pdfTitle: 'Dispenser & Hand Dryer Product Guide',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    color: 'emerald',
    badge: '27+ Models',
    description: 'LAXREE offers the complete bathroom hygiene solution — soap dispensers (manual and automatic), hand dryers, and paper dispensers. With 27+ models across three categories, our range provides touchless hygiene for luxury hotels and practical value for budget properties.',
    keyFeatures: [
      '10 soap dispenser models: manual push-button and automatic sensor-activated',
      '9 hand dryer models: plastic and stainless steel body options, all sensor-activated',
      '8 paper dispenser models: N-Fold, JTR (Jumbo Toilet Roll), and SS recessed designs',
      'Touchless automatic dispensers for maximum hygiene compliance',
      'Stainless steel and plastic body options for durability and budget flexibility',
      'Visible soap level indicators on select models for easy maintenance monitoring',
    ],
    specs: [
      { label: 'Soap Dispenser Type', value: 'Manual (push-button) / Automatic (sensor)' },
      { label: 'Hand Dryer Power', value: 'Sensor-activated, electric (wall-mounted)' },
      { label: 'Paper Dispenser Type', value: 'N-Fold / JTR (Jumbo Toilet Roll) / Recessed' },
      { label: 'Body Materials', value: 'Stainless Steel / ABS Plastic / Transparent' },
      { label: 'Dispenser Capacity', value: '300ml – 1000ml (model dependent)' },
      { label: 'Finishes', value: 'Polished SS / Matte Black / White / Transparent' },
    ],
    faq: [
      {
        question: 'Automatic vs manual dispensers: which is better for hotels?',
        answer: 'Automatic (sensor-activated) dispensers are recommended for 4-5 star and luxury hotels where touchless hygiene is a guest expectation — especially post-pandemic. They reduce cross-contamination, provide a premium feel, and use precise portion control (saving soap). Manual (push-button) dispensers are ideal for 3-star, budget, and high-traffic properties where durability and cost-efficiency matter most.',
      },
      {
        question: 'What hand dryer power is needed for high-traffic bathrooms?',
        answer: 'For high-traffic hotel lobbies and public restrooms, we recommend our stainless steel body hand dryers (LRWA-393/394/396) with higher wattage (1400W+) and fast drying times under 10 seconds. For standard room bathrooms or low-traffic areas, our plastic body models (LRWA-376/377) offer excellent value with 15-20 second drying times.',
      },
      {
        question: 'Paper dispenser vs hand dryer: what should we recommend?',
        answer: 'It depends on the hotel tier and location. Hand dryers are more sustainable (zero paper waste), more cost-effective long-term (no recurring paper costs), and preferred by eco-conscious brands. Paper dispensers are preferred in luxury hotels where guests expect premium paper towels, and in areas where electricity is unreliable. Many hotels install both — hand dryers as primary, paper dispensers as backup.',
      },
      {
        question: 'How do sensor dispensers improve hygiene compliance?',
        answer: 'Sensor-activated dispensers eliminate the need to touch any surface — the guest simply places their hand underneath and soap is dispensed automatically. This is critical for post-pandemic hygiene standards and is increasingly required by hotel hygiene certifications. Studies show touchless dispensers reduce bathroom surface contamination by up to 80%.',
      },
      {
        question: 'What about maintenance and refilling of automatic dispensers?',
        answer: 'Our automatic dispensers feature visible soap level indicators (transparent windows on select models) so housekeeping can check levels at a glance without opening the unit. Refilling is simple — unlock, open the top, pour in liquid soap, close and lock. Battery life is 6-12 months depending on usage. We recommend quarterly maintenance checks as part of the housekeeping schedule.',
      },
    ],
    chapters: [
      {
        title: 'Complete Hygiene Solutions Overview',
        content: `<p>LAXREE provides the <strong>complete bathroom hygiene ecosystem</strong> — from the moment a guest washes their hands to how they dry them. Our range covers every touchpoint in the bathroom hygiene journey.</p>
<h4>🧴 Soap Dispensers (10 Models)</h4>
<ul>
<li><strong>Manual (Push-Button):</strong> 5 models — LRWA-388, LRWA-375, LRWA-358, LRWA-382, LRWA-383</li>
<li><strong>Automatic (Sensor):</strong> 5 models — LRWA-384, LRWA-373, LRWA-372, LRWA-374, LRWA-385</li>
</ul>
<h4>🌬️ Hand Dryers (9 Models)</h4>
<ul>
<li><strong>Plastic Body:</strong> 2 models — LRWA-376, LRWA-377</li>
<li><strong>Stainless Steel Body:</strong> 7 models — LRWA-395, LRWA-393, LRWA-394, LRWA-396, LRWA-397, LRWA-398, LRWA-399</li>
</ul>
<h4>📄 Paper Dispensers (8 Models)</h4>
<ul>
<li><strong>N-Fold:</strong> LRWA-390, LRWA-391, LRWA-392, LRWA-389</li>
<li><strong>JTR (Jumbo Toilet Roll):</strong> LRWA-378, LRWA-398</li>
<li><strong>SS Recessed:</strong> LRWA-404, LRWA-405</li>
</ul>
<p>Plus: <strong>Lobby Luggage Cart</strong> — a complementary lobby amenity for complete hotel solutions.</p>
<p>That's <strong>27+ models</strong> — the most comprehensive bathroom hygiene range for the Indian hospitality market.</p>`,
      },
      {
        title: 'Soap Dispenser Deep Dive',
        content: `<h4>🟤 Manual Soap Dispensers (Push-Button)</h4>
<p>Reliable, durable, and <strong>budget-friendly</strong> — the workhorse of hotel bathrooms everywhere.</p>
<table>
<tr><th>Model</th><th>Capacity</th><th>Body</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>LRWA-388</td><td>500ml</td><td>ABS Plastic</td><td>Push-button, lockable, refillable</td><td>3-star, budget hotels</td></tr>
<tr><td>LRWA-375</td><td>500ml</td><td>Transparent</td><td>Visible soap level, easy refill</td><td>Housekeeping-friendly properties</td></tr>
<tr><td>LRWA-358</td><td>300ml</td><td>ABS Plastic</td><td>Compact design, wall-mounted</td><td>Small bathrooms, compact spaces</td></tr>
<tr><td>LRWA-382</td><td>800ml</td><td>Stainless Steel</td><td>Premium look, large capacity</td><td>4-star, public restrooms</td></tr>
<tr><td>LRWA-383</td><td>1000ml</td><td>Stainless Steel</td><td>Large capacity, heavy-duty</td><td>High-traffic, lobby restrooms</td></tr>
</table>
<h4>🔵 Automatic Soap Dispensers (Sensor)</h4>
<p><strong>Touchless hygiene</strong> — the post-pandemic standard for premium hotels.</p>
<table>
<tr><th>Model</th><th>Capacity</th><th>Body</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>LRWA-384</td><td>400ml</td><td>ABS Plastic</td><td>Infrared sensor, no-touch</td><td>4-star, business hotels</td></tr>
<tr><td>LRWA-373</td><td>500ml</td><td>Transparent</td><td>Sensor + visible soap level</td><td>Hygiene-conscious, modern hotels</td></tr>
<tr><td>LRWA-372</td><td>600ml</td><td>ABS Plastic</td><td>Larger capacity, LED indicator</td><td>Mid-range hotels, resorts</td></tr>
<tr><td>LRWA-374</td><td>800ml</td><td>Stainless Steel</td><td>Premium sensor, SS body</td><td>5-star luxury, premium public</td></tr>
<tr><td>LRWA-385</td><td>1000ml</td><td>Stainless Steel</td><td>Large capacity + sensor + SS</td><td>High-traffic luxury, lobby</td></tr>
</table>
<h4>💡 Selling Points</h4>
<ul>
<li><strong>Visible soap level:</strong> Transparent models let housekeeping check without opening — saves 5 min per room</li>
<li><strong>Sensor precision:</strong> Dispenses exact portion (1-2ml) — reduces soap waste by up to 30%</li>
<li><strong>Lockable refills:</strong> Prevents tampering and ensures only correct soap is used</li>
<li><strong>Multi-liquid compatibility:</strong> Works with liquid soap, sanitizer, and lotion</li>
</ul>`,
      },
      {
        title: 'Hand Dryer & Paper Dispenser Deep Dive',
        content: `<h4>🌬️ Hand Dryers</h4>
<p>All LAXREE hand dryers are <strong>sensor-activated</strong> — hands in, dry hands out, zero touch required.</p>
<h5>Plastic Body Hand Dryers</h5>
<table>
<tr><th>Model</th><th>Power</th><th>Body</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>LRWA-376</td><td>1200W</td><td>White ABS</td><td>Compact, lightweight, quiet</td><td>3-star, in-room bathrooms</td></tr>
<tr><td>LRWA-377</td><td>1200W</td><td>White ABS</td><td>High-speed motor, fast dry</td><td>Business hotels, public restrooms</td></tr>
</table>
<h5>Stainless Steel Body Hand Dryers</h5>
<table>
<tr><th>Model</th><th>Power</th><th>Body</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>LRWA-395</td><td>1400W</td><td>Polished SS</td><td>High-speed, HEPA filter</td><td>5-star, premium public</td></tr>
<tr><td>LRWA-393</td><td>1400W</td><td>Polished SS</td><td>Fast dry <10s, low noise</td><td>4-5 star lobbies</td></tr>
<tr><td>LRWA-394</td><td>1400W</td><td>Matte Black SS</td><td>Premium dark finish, fast dry</td><td>Boutique, contemporary</td></tr>
<tr><td>LRWA-396</td><td>1500W</td><td>Polished SS</td><td>Extra power, heavy-duty</td><td>High-traffic public areas</td></tr>
<tr><td>LRWA-397</td><td>1400W</td><td>Polished SS</td><td>Compact SS, space-saving</td><td>Smaller restrooms</td></tr>
<tr><td>LRWA-398</td><td>1500W</td><td>Brushed SS</td><td>Brushed finish, modern look</td><td>Modern luxury hotels</td></tr>
<tr><td>LRWA-399</td><td>1600W</td><td>Brushed SS</td><td>Maximum power, ultra-fast</td><td>Airports, convention centers</td></tr>
</table>
<h4>📄 Paper Dispensers</h4>
<table>
<tr><th>Type</th><th>Model</th><th>Body</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>N-Fold</td><td>LRWA-390</td><td>ABS Plastic</td><td>Wall-mounted, easy load</td><td>Standard hotel bathrooms</td></tr>
<tr><td>N-Fold</td><td>LRWA-391</td><td>ABS Plastic</td><td>Larger capacity, transparent window</td><td>High-traffic restrooms</td></tr>
<tr><td>N-Fold</td><td>LRWA-392</td><td>Stainless Steel</td><td>Premium SS body</td><td>4-5 star public restrooms</td></tr>
<tr><td>N-Fold</td><td>LRWA-389</td><td>Stainless Steel</td><td>Compact SS, sleek design</td><td>Premium compact bathrooms</td></tr>
<tr><td>JTR</td><td>LRWA-378</td><td>ABS Plastic</td><td>Jumbo toilet roll, high capacity</td><td>Every hotel, toilet stalls</td></tr>
<tr><td>JTR</td><td>LRWA-398</td><td>Stainless Steel</td><td>SS body jumbo roll</td><td>Premium toilet stalls</td></tr>
<tr><td>SS Recessed</td><td>LRWA-404</td><td>Stainless Steel</td><td>Recessed mount, flush wall</td><td>Luxury bathrooms, hidden install</td></tr>
<tr><td>SS Recessed</td><td>LRWA-405</td><td>Stainless Steel</td><td>Recessed mount, larger capacity</td><td>High-traffic luxury</td></tr>
</table>
<h4>🧳 Lobby Amenity</h4>
<ul>
<li><strong>Luggage Cart:</strong> Heavy-duty chrome frame luggage cart for lobby — completes the hotel entrance experience alongside bathroom hygiene</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Hotel Tier Positioning</h4>
<table>
<tr><th>Hotel Tier</th><th>Soap Dispenser</th><th>Hand Dryer</th><th>Paper Dispenser</th><th>Hygiene Pitch</th></tr>
<tr><td>3-Star / Budget</td><td>LRWA-388 (Manual, ABS)</td><td>LRWA-376 (Plastic)</td><td>LRWA-390 (N-Fold, ABS)</td><td>"Complete hygiene at budget-friendly prices"</td></tr>
<tr><td>4-Star / Business</td><td>LRWA-384 (Auto, ABS)</td><td>LRWA-393 (SS, Fast)</td><td>LRWA-392 (N-Fold, SS)</td><td>"Touchless hygiene meets professional style"</td></tr>
<tr><td>5-Star / Luxury</td><td>LRWA-374 (Auto, SS)</td><td>LRWA-395 (SS, HEPA)</td><td>LRWA-404 (SS Recessed)</td><td>"Premium touchless — hygiene meets luxury"</td></tr>
<tr><td>Boutique / Modern</td><td>LRWA-373 (Auto, Transparent)</td><td>LRWA-394 (Matte Black)</td><td>LRWA-389 (SS, Compact)</td><td>"Contemporary hygiene with designer finishes"</td></tr>
<tr><td>Resort / High-Traffic</td><td>LRWA-385 (Auto, SS, 1000ml)</td><td>LRWA-396 (SS, 1500W)</td><td>LRWA-391 (N-Fold, Large)</td><td>"Heavy-duty hygiene for peak demand"</td></tr>
</table>
<h4>🧴 Hygiene Compliance Pitch</h4>
<p>Post-pandemic, <strong>touchless hygiene is no longer optional</strong> — it's expected. Hotels that invest in automatic dispensers and sensor hand dryers see:</p>
<ul>
<li><strong>40% reduction</strong> in bathroom-related guest complaints</li>
<li><strong>Higher hygiene audit scores</strong> from certification bodies (HACCP, ISO 22000)</li>
<li><strong>Increased guest confidence</strong> — visible touchless tech reassures health-conscious travelers</li>
<li><strong>Lower operational costs</strong> — sensor dispensers use precise portions, reducing soap consumption by 25-30%</li>
</ul>
<h4>🔄 Bundle Strategy</h4>
<ul>
<li><strong>"Hygiene Station" Bundle:</strong> Soap Dispenser + Hand Dryer + Paper Dispenser — complete bathroom hygiene in one order</li>
<li><strong>"Public Restroom" Bundle:</strong> Auto Dispenser (1000ml) + SS Hand Dryer + JTR Dispenser — for lobbies and restaurants</li>
<li><strong>"In-Room" Bundle:</strong> Manual Dispenser + Mirror + Hair Dryer — complete room bathroom package</li>
<li><strong>Cross-sell with LAXREE:</strong> Dispensers + Dustbins + Trolleys = "Complete Hotel Operations Package"</li>
</ul>
<h4>🛡️ Common Objections</h4>
<p><strong>"Hand dryers are too noisy for hotel bathrooms"</strong></p>
<p>→ "Our premium SS hand dryers (LRWA-393/395) feature noise-reduction technology operating at under 65dB — comparable to normal conversation volume. For in-room bathrooms, our compact plastic models (LRWA-376) are even quieter at under 60dB."</p>
<p><strong>"Automatic dispensers are too expensive"</strong></p>
<p>→ "The upfront cost difference is recovered within 6-8 months through soap savings. Sensor dispensers use 25-30% less soap per dispense vs. manual. Plus, touchless hygiene is now a guest expectation — properties without it receive lower hygiene ratings online."</p>
<p><strong>"Paper dispensers create more waste"</strong></p>
<p>→ "True, which is why we recommend hand dryers as the primary solution. However, paper dispensers are still essential as a backup and for guests who prefer paper towels. Our N-Fold dispensers use interfold paper that dispenses one sheet at a time — reducing waste by 40% vs. C-fold."</p>`,
      },
    ],
  },
  // ==================== WASHROOM AMENITIES ====================
  {
    id: 'washroom-amenities',
    title: 'Washroom Amenities',
    subtitle: 'In-Room Bathroom Essentials',
    videoFile: 'Washroom aminities.mp4',
    pdfFile: 'Washroom Amenities.pdf',
    pdfTitle: 'Washroom Amenities Product Guide',
    icon: Lightbulb,
    gradient: 'from-lime-500 to-green-600',
    bgLight: 'bg-lime-50',
    color: 'lime',
    badge: '21 Models',
    description: 'LAXREE Washroom Amenities cover every in-room bathroom need — from electronic weighing scales and in-room soap dispensers to premium bathtubs and coordinated amenity tray sets. With 21+ models across 4 categories, our range provides the complete bathroom experience for every hotel tier.',
    keyFeatures: [
      '4 electronic weighing scale models: glass top, matte gray, circular, and ultra-slim designs',
      '9 in-room soap dispenser models: twin packs, quad packs, singles in white/amber/red/silver/black',
      '2 premium clawfoot bathtubs: red body with gold feet and white body with silver feet',
      '6 amenity tray sets: teal, teal-gold, brown wood, two-tone, light wood, dark wood finishes',
      'Capacities from 260ml to 400ml for dispensers to suit every bathroom configuration',
      'Coordinated tray sets include tissue boxes, amenity holders, and soap dishes',
    ],
    specs: [
      { label: 'Scale Models', value: 'LRWS-330/329/327/331 (Glass, Gray, Round, Black)' },
      { label: 'Dispenser Capacity', value: '260ml – 400ml (model dependent)' },
      { label: 'Dispenser Types', value: 'Twin Pack / Quad Pack / Single / Wall-Mounted' },
      { label: 'Bathtub Models', value: 'LRBT-311 (Red/Gold) / LRBT-312 (White/Silver)' },
      { label: 'Tray Set Finishes', value: 'Teal / Teal-Gold / Brown / Two-tone / Light Wood / Dark Wood' },
      { label: 'Scale Certification', value: 'LRWS-330 "APPROVED" certified' },
    ],
    faq: [
      {
        question: 'Which weighing scale model is best for luxury hotels?',
        answer: 'The LRWS-330 with its glass top design and "APPROVED" certification is the top choice for luxury properties. It combines a sleek, modern aesthetic with certified accuracy, making it the perfect complement to premium bathroom interiors.',
      },
      {
        question: 'Twin vs quad dispenser packs: which should we choose?',
        answer: 'Twin packs are ideal for standard rooms with a single sink area — they provide shampoo and body wash in a compact format. Quad packs are best for suites or rooms with separate shower and tub areas, offering shampoo, body wash, conditioner, and lotion all in one organized unit.',
      },
      {
        question: 'Are the amenity tray sets customizable?',
        answer: 'Yes! You can mix and match individual components (tissue boxes, amenity holders, soap dishes) within each tray set collection. For orders of 500+ sets, we also offer custom color options to match your hotel brand palette.',
      },
      {
        question: 'What bathtub options are available?',
        answer: 'We offer two premium clawfoot bathtub models: LRBT-311 with a red body and gold feet for luxury hotels seeking a bold statement piece, and LRBT-312 with a white body and silver feet for classic, timeless elegance. Both feature durable acrylic construction with easy-clean surfaces.',
      },
      {
        question: 'How do in-room dispensers reduce hotel operating costs?',
        answer: 'In-room soap dispensers eliminate the need for single-use miniature bottles, reducing plastic waste by up to 80%. They also lower housekeeping labor costs — one refill lasts 30-50 guest-nights vs. replacing tiny bottles daily. Hotels typically save 40-60% on amenity costs after switching to dispensers.',
      },
    ],
    chapters: [
      {
        title: 'Complete Washroom Amenities Overview',
        content: `<p>LAXREE Washroom Amenities provide the <strong>complete in-room bathroom experience</strong> — every product a guest touches in the bathroom, we make it exceptional. From the moment they step on a precision weighing scale to the luxury of a clawfoot bath, every detail matters.</p>
<h4>🏠 4 Product Categories</h4>
<ul>
<li><strong>⚖️ Electronic Weighing Scales:</strong> 4 models — glass top, matte gray, circular, ultra-slim</li>
<li><strong>🧴 In-Room Soap Dispensers:</strong> 9 models — twin/quad/single packs in multiple colors</li>
<li><strong>🛁 Premium Clawfoot Bathtubs:</strong> 2 models — red/gold and white/silver</li>
<li><strong>🎁 Amenity Tray Sets:</strong> 6 models — coordinated sets in teal, wood, two-tone finishes</li>
</ul>
<h4>💡 Why Washroom Amenities Matter</h4>
<p>The bathroom is the <strong>#2 most-photographed space</strong> in hotel rooms (after the view). Guests notice every detail — from the quality of the soap dispenser to the elegance of the tray set. A well-appointed bathroom directly impacts online reviews and repeat bookings.</p>`,
      },
      {
        title: 'Weighing Scales & Dispensers Deep Dive',
        content: `<h4>⚖️ Electronic Weighing Scales</h4>
<table>
<tr><th>Model</th><th>Design</th><th>Key Feature</th><th>Best For</th></tr>
<tr><td>LRWS-330</td><td>Glass Top</td><td>"APPROVED" certified, tempered glass</td><td>5-Star Luxury</td></tr>
<tr><td>LRWS-329</td><td>Matte Gray</td><td>Anti-slip rubber feet, slim profile</td><td>4-Star Premium</td></tr>
<tr><td>LRWS-327</td><td>Circular</td><td>Compact round design, digital display</td><td>Boutique Hotels</td></tr>
<tr><td>LRWS-331</td><td>Ultra-Slim Black</td><td>Low-profile, under-bathroom-vanity storage</td><td>3-Star / Budget</td></tr>
</table>
<h4>🧴 In-Room Soap Dispensers</h4>
<table>
<tr><th>Model</th><th>Type</th><th>Capacity</th><th>Color Options</th></tr>
<tr><td>LRWA-360</td><td>Twin Pack</td><td>2x 300ml</td><td>White</td></tr>
<tr><td>LRWA-365</td><td>Twin Pack</td><td>2x 300ml</td><td>Amber</td></tr>
<tr><td>LRWA-362</td><td>Quad Pack</td><td>4x 260ml</td><td>White</td></tr>
<tr><td>LRWA-363</td><td>Quad Pack</td><td>4x 260ml</td><td>Red</td></tr>
<tr><td>LRWA-364</td><td>Single</td><td>400ml</td><td>White</td></tr>
<tr><td>LRWA-361</td><td>Single</td><td>400ml</td><td>Silver</td></tr>
<tr><td>LRWA-359</td><td>Single</td><td>400ml</td><td>Black</td></tr>
<tr><td>LRWA-386</td><td>Single</td><td>300ml</td><td>White</td></tr>
<tr><td>LRWA-387</td><td>Single</td><td>300ml</td><td>Amber</td></tr>
</table>
<h4>🎯 Selling Points by Tier</h4>
<ul>
<li><strong>5-Star:</strong> LRWS-330 glass scale + LRWA-360 twin pack white = premium bathroom suite</li>
<li><strong>4-Star:</strong> LRWS-329 matte gray + LRWA-365 twin pack amber = modern elegance</li>
<li><strong>3-Star:</strong> LRWS-331 ultra-slim + LRWA-364 single = practical value</li>
</ul>`,
      },
      {
        title: 'Bathtubs & Amenity Tray Sets Deep Dive',
        content: `<h4>🛁 Premium Clawfoot Bathtubs</h4>
<table>
<tr><th>Model</th><th>Body Color</th><th>Feet Finish</th><th>Style</th><th>Best For</th></tr>
<tr><td>LRBT-311</td><td>Red</td><td>Gold</td><td>Luxury Statement</td><td>5-Star Suites, Boutique Hotels</td></tr>
<tr><td>LRBT-312</td><td>White</td><td>Silver</td><td>Classic Elegance</td><td>4-5 Star Premium Rooms</td></tr>
</table>
<p>Both models feature <strong>durable acrylic construction</strong> with easy-clean surfaces, integrated overflow drainage, and comfortable ergonomic design. The clawfoot design is a timeless symbol of luxury that transforms any bathroom into a spa-like retreat.</p>
<h4>🎁 Amenity Tray Sets</h4>
<table>
<tr><th>Model</th><th>Finish</th><th>Components</th><th>Room Style Match</th></tr>
<tr><td>LRAT-366</td><td>Teal</td><td>Tissue box + amenity holder + soap dish</td><td>Modern / Contemporary</td></tr>
<tr><td>LRAT-367</td><td>Teal-Gold</td><td>Tissue box + amenity holder + soap dish</td><td>Luxury / Art Deco</td></tr>
<tr><td>LRAT-368</td><td>Brown Wood</td><td>Tissue box + amenity holder + soap dish</td><td>Classic / Traditional</td></tr>
<tr><td>LRAT-369</td><td>Two-tone</td><td>Tissue box + amenity holder + soap dish</td><td>Boutique / Eclectic</td></tr>
<tr><td>LRAT-370</td><td>Light Wood</td><td>Tissue box + amenity holder + soap dish</td><td>Scandinavian / Minimalist</td></tr>
<tr><td>LRAT-371</td><td>Dark Wood</td><td>Tissue box + amenity holder + soap dish</td><td>Heritage / Colonial</td></tr>
</table>
<h4>💡 How to Match Tray Sets to Room Design</h4>
<ul>
<li><strong>Teal/Teal-Gold:</strong> Pairs beautifully with white marble countertops and chrome fixtures</li>
<li><strong>Brown/Dark Wood:</strong> Perfect for warm-toned rooms with brass or gold fixtures</li>
<li><strong>Light Wood:</strong> Ideal for minimalist rooms with matte black or brushed nickel hardware</li>
<li><strong>Two-tone:</strong> Versatile — works with both warm and cool color palettes</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Hotel Tier Positioning</h4>
<table>
<tr><th>Hotel Tier</th><th>Scale</th><th>Dispenser</th><th>Bathtub</th><th>Tray Set</th></tr>
<tr><td>5-Star Ultra Luxury</td><td>LRWS-330 Glass</td><td>LRWA-360 Twin White</td><td>LRBT-311 Red/Gold</td><td>LRAT-367 Teal-Gold</td></tr>
<tr><td>5-Star</td><td>LRWS-330 Glass</td><td>LRWA-362 Quad White</td><td>LRBT-312 White/Silver</td><td>LRAT-368 Brown Wood</td></tr>
<tr><td>4-Star Premium</td><td>LRWS-329 Matte Gray</td><td>LRWA-365 Twin Amber</td><td>—</td><td>LRAT-370 Light Wood</td></tr>
<tr><td>3-Star / Business</td><td>LRWS-331 Ultra-Slim</td><td>LRWA-364 Single White</td><td>—</td><td>LRAT-366 Teal</td></tr>
<tr><td>Boutique / Resort</td><td>LRWS-327 Circular</td><td>LRWA-363 Quad Red</td><td>LRBT-311 Red/Gold</td><td>LRAT-369 Two-tone</td></tr>
</table>
<h4>🔄 Complete Bathroom Bundle Strategy</h4>
<p>Always sell the <strong>complete bathroom package</strong>, not individual items:</p>
<ul>
<li><strong>"Royal Suite" Bundle:</strong> Glass scale + Quad dispenser + Clawfoot tub + Teal-Gold tray set = the ultimate bathroom</li>
<li><strong>"Executive" Bundle:</strong> Matte gray scale + Twin dispenser + Light wood tray set = modern business hotel</li>
<li><strong>"Essentials" Bundle:</strong> Ultra-slim scale + Single dispenser + Teal tray set = practical value</li>
</ul>
<h4>🌱 Sustainability Pitch for Dispensers</h4>
<p>In-room dispensers vs. single-use miniature bottles:</p>
<ul>
<li><strong>80% less plastic waste</strong> — no more throwing away hundreds of tiny bottles monthly</li>
<li><strong>40-60% cost savings</strong> on amenity replenishment after switching</li>
<li><strong>Guest preference shift:</strong> 72% of travelers now prefer properties with sustainable practices</li>
<li><strong>Green certification:</strong> Helps hotels earn LEED/EarthCheck points for sustainability</li>
</ul>
<h4>🛡️ Common Objections</h4>
<p><strong>"Dispensers look cheap compared to branded bottles"</strong></p>
<p>→ "Our premium dispensers in silver, black, and amber finishes actually look <em>more</em> upscale than rows of mini bottles. Plus, they never look half-empty and messy — always a clean, consistent presentation."</p>
<p><strong>"Bathtubs take up too much space"</strong></p>
<p>→ "Clawfoot tubs are a revenue driver — rooms with premium bathtubs command 15-25% higher ADR. Our compact models fit in standard bathroom footprints while delivering maximum visual impact."</p>`,
      },
    ],
  },
  // ==================== LUGGAGE TROLLEY ====================
  {
    id: 'luggage',
    title: 'Luggage Trolley',
    subtitle: 'Bellman & Portage Solutions',
    videoFile: 'Luggage.mp4',
    pdfFile: 'Luggage.pdf',
    pdfTitle: 'Luggage Trolley Product Guide',
    icon: Luggage,
    gradient: 'from-amber-600 to-orange-700',
    bgLight: 'bg-amber-50',
    color: 'amber',
    badge: '3 Models',
    description: 'LAXREE Luggage Trolleys are the first impression of hotel service — elegant bellman carts that combine classic hospitality aesthetics with robust construction. Available in 3 models ranging from cage-style to compact upright, each features a gold-finished frame, red platform with "WELCOME" branding, and smooth-rolling rubber wheels.',
    keyFeatures: [
      '3 distinct models: Cage-style, Compact upright, and Standard low-profile',
      'Gold powder-coated steel frames for luxury lobby aesthetics',
      'Red HDPE/vinyl platforms with gold "WELCOME" branding',
      'Non-marking rubber wheels: 2 swivel + 2 fixed for smooth maneuverability',
      'Capacity range: 100-200 lbs to handle any luggage load',
      'Classic birdcage design with ornate finial for 5-star properties',
    ],
    specs: [
      { label: 'Models', value: 'LRLT-401 (Cage) / LRLT-402 (Compact) / LRLT-403 (Standard)' },
      { label: 'Frame Material', value: 'Powder-coated steel, gold finish' },
      { label: 'Platform', value: 'Red HDPE/Vinyl with gold "WELCOME" text' },
      { label: 'Wheels', value: 'Rubber tires, gold metal hubs (2 swivel + 2 fixed)' },
      { label: 'Capacity', value: '100-200 lbs (model dependent)' },
      { label: 'Finish', value: 'Gold frame / Red platform / Orange rubber wheels' },
    ],
    faq: [
      {
        question: 'Which trolley model is best for luxury hotels?',
        answer: 'The LRLT-401 cage-style trolley with its ornate finial and classic birdcage design is the ideal choice for grand lobbies and 5-star properties. It makes a powerful first impression and communicates luxury from the moment guests arrive.',
      },
      {
        question: 'Can trolleys fit in standard hotel elevators?',
        answer: 'The LRLT-402 compact model was designed specifically for narrow elevators and hallways. Its upright, space-efficient profile fits easily in standard hotel elevators while still carrying 100-150 lbs of luggage. The cage-style and standard models also fit most modern elevator cabins.',
      },
      {
        question: 'What is the weight capacity?',
        answer: 'LRLT-401 (Cage): 150-200 lbs, LRLT-402 (Compact): 100-150 lbs, LRLT-403 (Standard): 120-180 lbs. All models feature robust steel frames that handle typical luggage loads with ease.',
      },
      {
        question: 'Are custom colors available?',
        answer: 'Yes! The frame can be finished in brass, copper, or chrome instead of gold. The platform is available in burgundy, navy, or black for minimum orders of 20+ units. Custom branding on the platform is also available for orders of 50+ units.',
      },
    ],
    chapters: [
      {
        title: 'LAXREE Luggage Trolley Collection',
        content: `<p>LAXREE Luggage Trolleys are <strong>the first impression of hotel service</strong>. When a guest arrives, the bellman cart they see sets their expectations for the entire stay. Our trolleys combine classic hospitality aesthetics with robust construction to deliver that premium first impression every time.</p>
<h4>🛎️ First Impressions Matter</h4>
<p>Studies show that guests form their opinion of a hotel within the <strong>first 7 seconds</strong>. The bellman cart is often the first piece of hotel equipment they interact with — make it count with LAXREE's elegant gold-finished trolleys.</p>
<h4>🎯 The Bellman Cart as a Brand Statement</h4>
<ul>
<li><strong>Visual Impact:</strong> Gold frame + red "WELCOME" platform = instant luxury signaling</li>
<li><strong>Operational Reliability:</strong> Smooth-rolling wheels, stable platform, easy to maneuver</li>
<li><strong>Brand Consistency:</strong> Coordinate with lobby dustbins, stanchions, and signage for a cohesive look</li>
</ul>`,
      },
      {
        title: 'Model Deep Dive',
        content: `<h4>LRLT-401 — Cage-Style Bellman Cart</h4>
<p>The flagship model. Classic birdcage design with ornate finial top — the <strong>gold standard for 5-star lobbies</strong>.</p>
<ul>
<li>Full cage surround protects luggage during transport</li>
<li>Ornate finial on top adds vertical grandeur</li>
<li>Largest capacity: 150-200 lbs</li>
<li>Best for: Grand hotel lobbies, luxury resorts, heritage properties</li>
</ul>
<h4>LRLT-402 — Compact Upright Trolley</h4>
<p>Designed for <strong>modern hotels with space constraints</strong> — narrow elevators, tight hallways, compact lobbies.</p>
<ul>
<li>Upright profile minimizes footprint</li>
<li>Lighter and more maneuverable</li>
<li>Capacity: 100-150 lbs</li>
<li>Best for: Business hotels, urban boutique properties, airports</li>
</ul>
<h4>LRLT-403 — Standard Low-Profile Trolley</h4>
<p>The <strong>versatile workhorse</strong> — balances capacity, style, and practicality.</p>
<ul>
<li>Low-profile design for easy luggage loading</li>
<li>Open platform with optional side rails</li>
<li>Capacity: 120-180 lbs</li>
<li>Best for: 3-4 star hotels, conference centers, serviced apartments</li>
</ul>
<h4>📊 Comparison Table</h4>
<table>
<tr><th>Feature</th><th>LRLT-401 (Cage)</th><th>LRLT-402 (Compact)</th><th>LRLT-403 (Standard)</th></tr>
<tr><td>Capacity</td><td>150-200 lbs</td><td>100-150 lbs</td><td>120-180 lbs</td></tr>
<tr><td>Profile</td><td>Full cage</td><td>Upright compact</td><td>Low-profile open</td></tr>
<tr><td>Elevator Fit</td><td>Standard</td><td>Excellent</td><td>Good</td></tr>
<tr><td>Aesthetic</td><td>Classic luxury</td><td>Modern minimal</td><td>Practical versatile</td></tr>
<tr><td>Best Use</td><td>5-Star grand lobbies</td><td>Urban/compact hotels</td><td>3-4 Star properties</td></tr>
</table>`,
      },
      {
        title: 'Materials & Construction',
        content: `<h4>🏗️ Powder-Coated Steel Frame</h4>
<p>Every LAXREE trolley frame is built from <strong>heavy-gauge steel</strong> with powder-coated gold finish:</p>
<ul>
<li><strong>Corrosion-resistant:</strong> Powder coating prevents rust even in humid coastal climates</li>
<li><strong>Chip-resistant:</strong> Harder finish than traditional paint — withstands daily bellman use</li>
<li><strong>Color consistency:</strong> Uniform gold finish that won't fade or discolor over time</li>
<li><strong>Easy maintenance:</strong> Wipe-clean surface, no polishing required</li>
</ul>
<h4>🟥 HDPE/Vinyl Platform</h4>
<ul>
<li><strong>High-Density Polyethylene (HDPE):</strong> Impact-resistant, waterproof, won't warp or crack</li>
<li><strong>Gold "WELCOME" text:</strong> Heat-transferred branding that won't peel or fade</li>
<li><strong>Non-slip surface:</strong> Textured finish keeps luggage secure during transport</li>
<li><strong>Easy to clean:</strong> Wipe down with any standard cleaner</li>
</ul>
<h4>🛞 Rubber Wheels</h4>
<ul>
<li><strong>Non-marking rubber tires:</strong> Won't leave scuff marks on marble or tile floors</li>
<li><strong>Gold metal hubs:</strong> Match the frame for cohesive aesthetics</li>
<li><strong>2 swivel + 2 fixed:</strong> Optimal combination for maneuverability and stability</li>
<li><strong>Bearing system:</strong> Smooth, quiet rolling even with maximum load</li>
</ul>
<h4>🔧 Maintenance Tips</h4>
<ul>
<li>Wipe frame weekly with damp cloth — no abrasive cleaners</li>
<li>Check wheel bearings monthly — lubricate if squeaking</li>
<li>Inspect platform for cracks annually — HDPE is extremely durable</li>
<li>Touch up any frame chips immediately with matching gold paint</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Hotel Tier Positioning</h4>
<table>
<tr><th>Hotel Tier</th><th>Recommended Model</th><th>Key Pitch</th></tr>
<tr><td>5-Star Luxury</td><td>LRLT-401 Cage-Style</td><td>"The first impression your guests deserve"</td></tr>
<tr><td>4-Star Premium</td><td>LRLT-403 Standard</td><td>"Professional service, premium look"</td></tr>
<tr><td>3-Star / Business</td><td>LRLT-402 Compact</td><td>"Fits your elevators, fits your budget"</td></tr>
<tr><td>Urban Boutique</td><td>LRLT-402 Compact</td><td>"Sleek, modern, space-efficient"</td></tr>
<tr><td>Resort / Heritage</td><td>LRLT-401 Cage-Style</td><td>"Classic elegance meets durability"</td></tr>
</table>
<h4>🔄 Lobby Bundle Strategy</h4>
<p>Always sell bellman carts as part of a <strong>complete lobby solution</strong>:</p>
<ul>
<li><strong>"Grand Entrance" Bundle:</strong> LRLT-401 cage trolley + SS lobby dustbin + gold stanchions = cohesive luxury lobby</li>
<li><strong>"Business Efficient" Bundle:</strong> LRLT-402 compact trolley + swing-lid dustbin + floor signage = practical, professional</li>
<li><strong>"Welcome Package" Bundle:</strong> LRLT-403 standard trolley + matching lobby furniture = complete arrival experience</li>
</ul>
<h4>💰 ROI Calculation for Bellman Carts</h4>
<p>A quality bellman cart is a <strong>one-time investment with 10+ year lifespan</strong>:</p>
<ul>
<li><strong>Cost per use:</strong> Over 10 years with 20 uses/day = less than ₹1 per use</li>
<li><strong>Labor savings:</strong> One cart carries 8-10 bags vs. 2-3 trips by hand = 60% less bellman time</li>
<li><strong>Guest satisfaction:</strong> Properties with professional bellman carts report 12% higher service ratings</li>
<li><strong>Brand protection:</strong> No more guests struggling with luggage through your lobby — everything looks organized and premium</li>
</ul>
<h4>🛡️ Common Objections</h4>
<p><strong>"We don't need bellman carts — guests carry their own luggage"</strong></p>
<p>→ "That's exactly the impression you <em>don't</em> want to give. A bellman cart signals full-service hospitality. Even if guests carry their own bags, seeing the cart tells them you're ready to help — and that perception alone increases satisfaction scores."</p>
<p><strong>"The gold finish will look tacky in our modern lobby"</strong></p>
<p>→ "We offer chrome, copper, and brass finishes as alternatives for contemporary spaces. The LRLT-402 compact model in chrome is our most popular choice for modern boutique hotels."</p>`,
      },
    ],
  },
  // ==================== DIGITAL SIGNAGE ====================
  {
    id: 'digital-signage',
    title: 'Digital Signage',
    subtitle: 'Smart Display Solutions',
    videoFile: 'Digital Signage_1.mp4',
    pdfFile: 'Digital Signage.pdf',
    pdfTitle: 'Digital Signage Product Guide',
    icon: Monitor,
    gradient: 'from-slate-600 to-zinc-800',
    bgLight: 'bg-slate-50',
    color: 'slate',
    badge: '8 Models',
    description: 'LAXREE Digital Signage brings immersive visual communication to hotel spaces — from grand lobby totems to wall-mounted menu boards and portable easel displays. With 8 models across 3 form factors (freestanding, portable, wall-mounted), our signage solutions transform guest communication and drive F&B revenue.',
    keyFeatures: [
      '8 models across 3 form factors: Totem, T Stand/Easel, and Wall Hanging',
      'Screen sizes from 32" to 55" with Full HD (1920x1080) resolution',
      'Commercial-grade 24/7 operation with 50,000-hour display lifespan',
      'Integrated Android media player with HDMI, USB, and WiFi connectivity',
      'Cloud-based CMS optional for centralized content management across properties',
      'Premium glass screen option with anti-reflective coating for luxury applications',
    ],
    specs: [
      { label: 'Screen Sizes', value: '32" / 43" / 50" / 55"' },
      { label: 'Resolution', value: '1920x1080 Full HD (all models)' },
      { label: 'Brightness', value: '400-500 nits (model dependent)' },
      { label: 'Mounting', value: 'Freestanding / Portable Easel / Wall-Mounted' },
      { label: 'Connectivity', value: 'HDMI, USB, WiFi, Android Media Player' },
      { label: 'Warranty', value: '3-year limited warranty' },
    ],
    faq: [
      {
        question: 'Which signage type is best for a hotel lobby?',
        answer: 'For grand hotel lobbies, the Totem 55" is the ideal choice — its freestanding design creates a stunning focal point visible from the entrance. For standard lobbies with limited floor space, the Totem 43" offers the same premium experience in a more compact footprint.',
      },
      {
        question: 'How does the cloud CMS work?',
        answer: 'Our cloud-based Content Management System allows you to manage all screens across all your properties from a single dashboard. Schedule content by time of day (breakfast menu in the morning, dinner specials in the evening), push real-time updates instantly, and monitor screen status remotely. No on-site IT team required.',
      },
      {
        question: 'Can wall-mounted signage be installed on any wall?',
        answer: 'Yes! All wall-mounted models include a VESA 200x200 bracket compatible with standard wall types. The lightweight aluminum frame means no structural reinforcement is needed. You just need a standard electrical connection nearby — our installation team handles everything else.',
      },
      {
        question: 'What content can be displayed?',
        answer: 'Our Android media player supports HTML5, MP4 video, image slideshows, live news feeds, social media walls, restaurant menus, event schedules, and weather widgets. The cloud CMS lets you create custom playlists with drag-and-drop scheduling.',
      },
      {
        question: 'What is the expected lifespan?',
        answer: 'All LAXREE digital signage uses commercial-grade panels rated for 50,000 hours of operation. That equals 5.7 years of continuous 24/7 use — significantly longer than consumer-grade displays. With typical hotel usage (16 hours/day), expect 8+ years of reliable service.',
      },
    ],
    chapters: [
      {
        title: 'Digital Signage Overview',
        content: `<p>LAXREE Digital Signage transforms <strong>how hotels communicate with guests</strong>. From the moment they walk into the lobby to their restaurant experience, dynamic digital displays replace static signage with engaging, updatable, revenue-driving content.</p>
<h4>📱 3 Form Factors</h4>
<ul>
<li><strong>🏛️ Totem (Freestanding):</strong> 3 models — 43", 50", 55" — grand lobby statement pieces</li>
<li><strong>🧳 T Stand & Easel (Portable):</strong> 2 models — 32" — flexible placement for events and restaurants</li>
<li><strong>🖼️ Wall Hanging (Mounted):</strong> 3 models — 32", 43", 43" Glass — space-efficient displays</li>
</ul>
<h4>💰 Why Digital Signage Matters for Hotels</h4>
<ul>
<li><strong>F&B Revenue Impact:</strong> Digital menu boards increase average order value by 15-25%</li>
<li><strong>Operational Efficiency:</strong> Update menus, events, and promotions instantly — no printing costs</li>
<li><strong>Guest Experience:</strong> 68% of guests say digital displays improve their hotel experience</li>
<li><strong>Brand Image:</strong> Modern, tech-forward properties attract the growing premium traveler segment</li>
</ul>`,
      },
      {
        title: 'Totem & Portable Series Deep Dive',
        content: `<h4>🏛️ Totem Series — Freestanding Lobby Displays</h4>
<table>
<tr><th>Model</th><th>Screen</th><th>Height</th><th>Brightness</th><th>Best For</th></tr>
<tr><td>Totem 43"</td><td>43" FHD</td><td>~150cm</td><td>400 nits</td><td>Standard lobbies, reception areas</td></tr>
<tr><td>Totem 50"</td><td>50" FHD</td><td>~170cm</td><td>450 nits</td><td>Premium lobbies, conference centers</td></tr>
<tr><td>Totem 55"</td><td>55" FHD</td><td>~180cm</td><td>500 nits</td><td>Grand lobbies, resort entrances</td></tr>
</table>
<h4>🎯 Totem Key Features</h4>
<ul>
<li><strong>Freestanding design:</strong> No wall mounting needed — place anywhere in the lobby</li>
<li><strong>Vertical or horizontal orientation:</strong> Display content in the format that works best</li>
<li><strong>Integrated Android media player:</strong> No external device needed</li>
<li><strong>Tempered glass front:</strong> Durable and elegant, easy to clean</li>
</ul>
<h4>🧳 T Stand 32" — Portable Display</h4>
<ul>
<li>32" Full HD screen on adjustable T-shaped stand</li>
<li>Easy to move between locations (lobby, restaurant, conference room)</li>
<li>Perfect for: Event signage, wayfinding, pop-up promotions</li>
</ul>
<h4>🎨 Easel 32" — Portable Display</h4>
<ul>
<li>32" Full HD screen in easel-style frame</li>
<li>Elegant, gallery-like presentation</li>
<li>Perfect for: Restaurant menu boards, spa treatment displays, art exhibitions</li>
</ul>`,
      },
      {
        title: 'Wall Hanging Series Deep Dive',
        content: `<h4>🖼️ Wall Hanging Series</h4>
<table>
<tr><th>Model</th><th>Screen</th><th>Special Feature</th><th>Best For</th></tr>
<tr><td>Wall 32"</td><td>32" FHD</td><td>Compact, lightweight aluminum frame</td><td>Elevator lobbies, hallways, small restaurants</td></tr>
<tr><td>Wall 43"</td><td>43" FHD</td><td>Standard wall mount, VESA 200x200</td><td>Restaurant menus, conference rooms, reception</td></tr>
<tr><td>Wall 43" Glass</td><td>43" FHD</td><td>Premium glass screen, anti-reflective coating</td><td>Luxury restaurants, VIP lounges, premium spaces</td></tr>
</table>
<h4>🔧 Installation Guide</h4>
<ul>
<li><strong>Mounting:</strong> VESA 200x200 bracket included with every unit</li>
<li><strong>Weight:</strong> Lightweight aluminum frame — no structural reinforcement needed</li>
<li><strong>Power:</strong> Standard electrical connection required (concealed cable management)</li>
<li><strong>Installation time:</strong> 30-45 minutes per unit by our team</li>
</ul>
<h4>✨ Premium Glass Screen Option</h4>
<p>The Wall 43" Glass model features a <strong>premium anti-reflective glass panel</strong> that eliminates glare from lobby lighting and windows. This is essential for luxury applications where display quality must be impeccable.</p>
<ul>
<li>Anti-reflective coating reduces glare by 95%</li>
<li>Edge-to-edge glass design for seamless aesthetics</li>
<li>Enhanced color accuracy and contrast</li>
<li>Easy-clean fingerprint-resistant surface</li>
</ul>
<h4>🗺️ Placement Strategy</h4>
<ul>
<li><strong>Lobby entrance:</strong> Totem 55" for maximum impact as guests arrive</li>
<li><strong>Elevator banks:</strong> Wall 32" for floor directories and announcements</li>
<li><strong>Restaurant entrance:</strong> Easel 32" or Wall 43" for menus and daily specials</li>
<li><strong>Conference floor:</strong> T Stand 32" outside each meeting room for event info</li>
<li><strong>Pool/Spa:</strong> Wall 43" Glass for premium treatment menus</li>
</ul>`,
      },
      {
        title: 'Sales Strategy & Objection Handling',
        content: `<h4>🎯 Hotel Tier Positioning</h4>
<table>
<tr><th>Hotel Tier</th><th>Recommended Signage</th><th>Key Pitch</th></tr>
<tr><td>5-Star Ultra Luxury</td><td>Totem 55" + Wall 43" Glass</td><td>"Cinematic guest experience from arrival to dining"</td></tr>
<tr><td>5-Star</td><td>Totem 50" + Wall 43"</td><td>"Professional displays that match your brand"</td></tr>
<tr><td>4-Star Premium</td><td>Totem 43" + Easel 32"</td><td>"Dynamic menus that drive F&B revenue"</td></tr>
<tr><td>3-Star / Business</td><td>Wall 32" + Wall 43"</td><td>"Affordable digital transformation"</td></tr>
<tr><td>Resort</td><td>Totem 55" + T Stand 32"</td><td>"Guide guests across your property"</td></tr>
</table>
<h4>💰 F&B ROI Calculation</h4>
<p>Digital signage pays for itself through increased restaurant revenue:</p>
<ul>
<li><strong>15-25% increase</strong> in average order value with digital menu boards</li>
<li><strong>Zero printing costs:</strong> Save ₹50,000-2,00,000/year on menu reprinting</li>
<li><strong>Real-time updates:</strong> Change prices and items instantly — no waiting for print runs</li>
<li><strong>Dayparting:</strong> Breakfast menu → Lunch → Dinner → Late night — all automatic</li>
</ul>
<h4>☁️ Content Management Pitch</h4>
<ul>
<li><strong>Cloud CMS:</strong> Manage all screens from one dashboard, from anywhere</li>
<li><strong>Scheduling:</strong> Set content playlists weeks in advance</li>
<li><strong>Multi-property:</strong> Push the same campaign to 10 hotels simultaneously</li>
<li><strong>No IT needed:</strong> Drag-and-drop interface, anyone can use it</li>
</ul>
<h4>🔄 Bundle with Lobby Furniture</h4>
<ul>
<li><strong>"Smart Lobby" Bundle:</strong> Totem 55" + LRLT-401 bellman cart + SS lobby dustbins + stanchions = complete modern lobby</li>
<li><strong>"Restaurant Upgrade" Bundle:</strong> Easel 32" + Wall 43" Glass = complete digital restaurant experience</li>
<li><strong>"Conference Ready" Bundle:</strong> T Stand 32" (multiple units) + Wall displays = wayfinding + info system</li>
</ul>
<h4>🛡️ Common Objections</h4>
<p><strong>"Digital signage is too expensive for our property"</strong></p>
<p>→ "The Wall 32" starts at an accessible price point, and with 15-25% F&B revenue uplift, most hotels see full ROI within 6-8 months. Plus, you eliminate printing costs entirely."</p>
<p><strong>"We don't have staff to manage content"</strong></p>
<p>→ "That's exactly why we offer the cloud CMS — it's as easy as posting on social media. You can also pre-schedule all content for the month in one 30-minute session. Or we can manage it for you with our content management service."</p>`,
      },
    ],
  },
]

// ==================== HELPER COMPONENTS ====================

function VideoPlayer({ videoFile, title }: { videoFile: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative bg-black rounded-xl overflow-hidden group">
        <video
          ref={videoRef}
          className="w-full rounded-xl"
          controls
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={`/api/uploads?file=${encodeURIComponent(videoFile)}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Video className="w-4 h-4" />
        <span>{title} — Product Video</span>
      </div>
    </div>
  )
}

function PDFDownloadTab({ pdfFile, pdfTitle, title }: { pdfFile?: string; pdfTitle?: string; title: string }) {
  if (!pdfFile) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-400">PDF Coming Soon</h3>
        <p className="text-gray-400 text-sm mt-1">The product guide PDF for {title} will be available shortly.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{pdfTitle || `${title} Product Guide`}</h3>
              <p className="text-white/80 mt-1">Complete product specifications, features, and pricing</p>
              <div className="flex items-center gap-3 mt-3">
                <Badge className="bg-white/20 text-white border-0">PDF Document</Badge>
                <span className="text-sm text-white/70">Download & share with your team</span>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`/api/uploads?file=${encodeURIComponent(pdfFile)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base">
                <ExternalLink className="w-5 h-5 mr-2" /> View PDF
              </Button>
            </a>
            <a
              href={`/api/uploads?file=${encodeURIComponent(pdfFile)}`}
              download
              className="flex-1"
            >
              <Button variant="outline" className="w-full h-12 text-base border-emerald-200 hover:bg-emerald-50">
                <Download className="w-5 h-5 mr-2" /> Download PDF
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm bg-emerald-50/50">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-800">Certified Quality</p>
            <p className="text-xs text-emerald-600 mt-1">ISI, CE & RoHS certified</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-teal-50/50">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-teal-800">2-Year Warranty</p>
            <p className="text-xs text-teal-600 mt-1">Full replacement coverage</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-cyan-50/50">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-cyan-800">Custom Branding</p>
            <p className="text-xs text-cyan-600 mt-1">Logo & color options</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TextContentTab({ product }: { product: ProductData }) {
  return (
    <div className="space-y-8">
      {/* Hero Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-16 -translate-x-12" />
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-3">{product.badge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">{product.title}</h2>
          <p className="text-lg text-white/70 mb-4">{product.subtitle}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Key Features */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Key Features</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent ml-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {product.keyFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50/80 to-white rounded-lg border border-emerald-100/50 hover:shadow-sm transition-shadow"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{feature}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Specifications Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Specifications</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent ml-2" />
        </div>
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="divide-y divide-gray-50">
            {product.specs.map((spec, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                }`}
              >
                <span className="text-sm font-medium text-gray-500">{spec.label}</span>
                <span className="text-sm font-semibold text-gray-800">{spec.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Chapters / Deep Dive Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Deep Dive Content</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-200 to-transparent ml-2" />
        </div>
        <div className="space-y-4">
          {product.chapters.map((chapter, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-white border-emerald-200 text-emerald-700">
                    Chapter {i + 1}
                  </Badge>
                  <h4 className="font-bold text-gray-800">{chapter.title}</h4>
                </div>
              </div>
              <CardContent className="p-5">
                <div
                  className="prose prose-sm max-w-none
                    prose-headings:text-gray-800
                    prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-2
                    prose-h3:text-lg prose-h3:font-semibold prose-h3:text-gray-700
                    prose-h4:text-base prose-h4:font-semibold prose-h4:text-emerald-700
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-li:text-gray-600
                    prose-strong:text-gray-800
                    prose-table:text-sm prose-th:bg-emerald-50 prose-th:text-emerald-800 prose-th:font-semibold prose-th:p-2
                    prose-td:p-2 prose-td:border-gray-100
                    prose-ul:my-2 prose-ol:my-2
                  "
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent ml-2" />
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-2">
            <Accordion type="single" collapsible className="w-full">
              {product.faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-100 last:border-0">
                  <AccordionTrigger className="text-left text-sm font-semibold text-gray-800 hover:text-emerald-600 hover:no-underline px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">Q{i + 1}.</span>
                      <span>{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100/50">
                      <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ==================== PRODUCT CARD ====================

function ProductCard({ product, onSelect }: { product: ProductData; onSelect: (p: ProductData) => void }) {
  const Icon = product.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group border-0"
        onClick={() => onSelect(product)}
      >
        <div className={`bg-gradient-to-r ${product.gradient} p-5 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-6" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{product.title}</h3>
                <p className="text-sm text-white/80">{product.subtitle}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
          </div>
          <Badge className="mt-3 bg-white/20 text-white border-0">{product.badge}</Badge>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs gap-1 border-emerald-200 text-emerald-700 bg-emerald-50/50">
              <Video className="w-3 h-3" /> Video
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 border-amber-200 text-amber-700 bg-amber-50/50">
              <FileText className="w-3 h-3" /> PDF
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 border-cyan-200 text-cyan-700 bg-cyan-50/50">
              <BookOpen className="w-3 h-3" /> Content
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== PRODUCT DETAIL VIEW ====================

function ProductDetailView({ product, onBack }: { product: ProductData; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('video')
  const Icon = product.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Product Header */}
      <div className={`bg-gradient-to-r ${product.gradient} rounded-xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-14 -translate-x-10" />
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10 mb-3 -ml-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
        </Button>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <Badge className="bg-white/20 text-white border-0 mb-2">{product.badge}</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">{product.title}</h2>
            <p className="text-white/80 mt-1 text-sm sm:text-base">{product.subtitle}</p>
          </div>
        </div>
      </div>

      {/* 3-Option Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-auto p-1 bg-gray-100/80 rounded-xl">
          <TabsTrigger
            value="video"
            className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg data-[state=active]:text-emerald-700"
          >
            <Play className="w-4 h-4 mr-2" /> Watch Video
          </TabsTrigger>
          <TabsTrigger
            value="pdf"
            className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg data-[state=active]:text-amber-700"
          >
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg data-[state=active]:text-cyan-700"
          >
            <BookOpen className="w-4 h-4 mr-2" /> Read Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
          <VideoPlayer videoFile={product.videoFile} title={product.title} />
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          <PDFDownloadTab pdfFile={product.pdfFile} pdfTitle={product.pdfTitle} title={product.title} />
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <TextContentTab product={product} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

// ==================== MAIN COMPONENT ====================

export function ProductAcademy() {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!selectedProduct ? (
          <motion.div
            key="product-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package2 className="w-6 h-6 text-teal-600" />
                LAXREE Product Academy
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Select a product to explore — watch videos, download PDFs, and read detailed content
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
              ))}
            </div>

            {/* More products coming soon */}
            <Card className="mt-4 border-dashed border-2 border-gray-200 bg-gray-50/50">
              <CardContent className="py-8 text-center">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-500">More Products Coming Soon</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Additional product videos and guides will be added regularly
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <ProductDetailView
            key={selectedProduct.id}
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Package2 icon
function Package2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  )
}
