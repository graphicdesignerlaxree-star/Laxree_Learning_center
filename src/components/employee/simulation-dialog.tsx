'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import {
  Play, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Trophy, MessageSquare, Wrench, Package, DollarSign,
  Sparkles, Clock, ChevronRight, Star, Target
} from 'lucide-react'

// ==================== TYPES ====================

interface CategoryScores {
  communication: number
  technical: number
  productKnowledge: number
  sales: number
}

interface SimulationQuestion {
  question: string
  options: [string, string, string, string]
  correctAnswer: number // 0-3 index
  explanation: string
  categoryScores: CategoryScores // points for correct answer
  categoryMax: CategoryScores // max possible for this question
}

interface SimulationScenario {
  id: string
  title: string
  description: string
  type: string
  difficulty: string
  duration: string
  scenario: string
  questions: SimulationQuestion[]
}

type SimulationPhase = 'intro' | 'question' | 'results'

// ==================== SCENARIO DATA ====================

// AMENITIES scenarios (hospitality — minibars, safes, RFID locks, kettles)
const AMENITIES_DIALOG_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim1',
    title: 'Hotel GM Meeting',
    description: 'Practice making initial contact with potential hospitality clients. Focus on opening statements and needs discovery.',
    type: 'field_sales',
    difficulty: 'Beginner',
    duration: '15 min',
    scenario: 'You are meeting with the General Manager of a 5-star luxury hotel in Dubai. The hotel is undergoing a major renovation of 350 rooms and the GM is evaluating mini bar suppliers. This is your first face-to-face meeting after a brief phone introduction. The GM is busy, focused on budget control, and has expressed interest in energy-efficient solutions. You have 20 minutes to make your pitch.',
    questions: [
      {
        question: 'How do you open the meeting after exchanging greetings?',
        options: [
          'Jump straight into the LAXREE product catalog and start listing mini bar models',
          'Thank them for their time, acknowledge the renovation project, and ask what their top priorities are for the room upgrades',
          'Start by telling them about LAXREE\'s 15+ years of industry experience and global presence',
          'Ask about their current mini bar supplier and what problems they have'
        ],
        correctAnswer: 1,
        explanation: 'Starting with a needs-based approach shows professionalism and customer-centricity. Acknowledging their project shows you\'ve done your homework. Asking about priorities opens the conversation naturally and gives you the information you need to tailor your pitch.',
        categoryScores: { communication: 20, technical: 0, productKnowledge: 5, sales: 10 },
        categoryMax: { communication: 20, technical: 5, productKnowledge: 10, sales: 15 }
      },
      {
        question: 'The GM says: "Our biggest concern is energy costs — our electricity bill is enormous. We need something that won\'t add to that." Which LAXREE mini bar technology do you lead with?',
        options: [
          'The LRMB-A absorption series, since it\'s the most traditional and well-known',
          'The LRMB-C compressor series, highlighting that compressor technology is 40-50% more energy efficient than absorption and ultra-quiet at under 28dB',
          'A thermoelectric model because it has no moving parts',
          'Suggest they don\'t need mini bars at all to save energy'
        ],
        correctAnswer: 1,
        explanation: 'The LRMB-C compressor series is the right choice here. Compressor mini bars are significantly more energy efficient (40-50% less energy consumption) than absorption models. They also operate ultra-quietly (<28dB), which is critical for 5-star hotel rooms. This directly addresses the GM\'s stated concern.',
        categoryScores: { communication: 5, technical: 15, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 20, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'The GM asks: "What about maintenance? Our last supplier\'s mini bars kept breaking down and repairs were a nightmare." How do you respond?',
        options: [
          'Say "LAXREE products never break down" to reassure them',
          'Explain that LAXREE compressor units have fewer moving parts than absorption units, come with a comprehensive warranty, and that you provide local service support with 24-48 hour response times',
          'Tell them they should have chosen LAXREE from the start',
          'Avoid the topic and redirect to pricing'
        ],
        correctAnswer: 1,
        explanation: 'Honesty with concrete facts builds trust. Explaining that compressor technology has fewer failure points, combined with specific warranty and service details, directly addresses the concern while reinforcing LAXREE\'s value proposition. Never make unrealistic claims like "never breaks down."',
        categoryScores: { communication: 15, technical: 10, productKnowledge: 10, sales: 15 },
        categoryMax: { communication: 15, technical: 15, productKnowledge: 15, sales: 15 }
      },
      {
        question: 'The GM says: "Your competitor is offering mini bars at $180 each. Can you match that?" The LRMB-C series is priced at $220. How do you handle this?',
        options: [
          'Immediately drop the price to $180 to win the deal',
          'Say "Our quality is better" without providing specifics',
          'Reframe the conversation: "Let me show you the total cost of ownership. The LRMB-C saves $45-60/year in energy costs per unit. Over 5 years across 350 rooms, that\'s $78,750-$105,000 in savings — making our solution significantly cheaper overall"',
          'Walk away from the deal since they\'re price-focused'
        ],
        correctAnswer: 2,
        explanation: 'Value-based selling is critical here. Instead of competing on unit price, reframe to Total Cost of Ownership (TCO). The energy savings of compressor technology over absorption creates massive long-term value. Using specific numbers for a 350-room hotel makes the case compelling and financial.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 10, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'The meeting is wrapping up. What\'s your closing approach?',
        options: [
          'Say "Thanks for your time" and leave your business card',
          'Push hard for an immediate purchase order',
          'Propose a clear next step: "I\'d like to arrange a demo unit in your hotel for 2 weeks so your team can experience the LRMB-C firsthand. I\'ll also prepare a detailed TCO comparison. Can we schedule a follow-up next Thursday?"',
          'Ask them to call you when they\'re ready to decide'
        ],
        correctAnswer: 2,
        explanation: 'Always close with a specific next step. Proposing a demo unit is powerful because it lets the product speak for itself. Scheduling a specific follow-up date keeps the momentum going. This approach is professional, customer-friendly, and significantly increases close rates.',
        categoryScores: { communication: 15, technical: 0, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim2',
    title: 'Product Demo Presentation',
    description: 'Present LAXREE product features to a prospective hotel chain. Handle technical questions and objections.',
    type: 'field_sales',
    difficulty: 'Intermediate',
    duration: '20 min',
    scenario: 'You are presenting to the procurement team of a large hotel chain (12 properties across the Middle East). They need in-room safes for a new luxury property with 500 rooms. The procurement director, head of security, and operations manager are present. They\'ve shortlisted LAXREE and one competitor. This is your product demo presentation — make it count.',
    questions: [
      {
        question: 'How do you structure the opening of your demo presentation?',
        options: [
          'Start by showing all 8 safe box models LAXREE offers to demonstrate breadth of range',
          'Open with a brief overview of LAXREE, then focus on the specific safe models most relevant to their luxury property needs — the Essential and Laptop series — and explain why these are ideal for 5-star hotels',
          'Begin with pricing to show competitiveness right away',
          'Start with a technical deep-dive into safe lock mechanisms'
        ],
        correctAnswer: 1,
        explanation: 'Tailoring your presentation to the client\'s specific needs (luxury, 500 rooms) shows preparation and respect for their time. Leading with the Essential and Laptop series — which are perfect for hotel rooms and business travelers — demonstrates product knowledge and customer understanding.',
        categoryScores: { communication: 20, technical: 5, productKnowledge: 15, sales: 10 },
        categoryMax: { communication: 20, technical: 10, productKnowledge: 15, sales: 10 }
      },
      {
        question: 'The Head of Security asks: "What locking system do your safes use? We need something tamper-proof but also convenient for guests." What do you highlight?',
        options: [
          'Just say "electronic locks" and move on',
          'Explain LAXREE\'s RFID lock technology (LRFD series): guests can use their room key card to open the safe, it\'s contactless, eliminates forgotten PINs, and the RFID system integrates with hotel property management systems for audit trails',
          'Recommend mechanical key locks as more reliable',
          'Show a video of someone trying to break into the safe'
        ],
        correctAnswer: 1,
        explanation: 'RFID lock integration is a major selling point for hotels. Room key card access is convenient for guests, eliminates the #1 guest complaint about safes (forgotten PINs), and provides security audit trails via PMS integration. This directly addresses both the security and convenience requirements.',
        categoryScores: { communication: 10, technical: 20, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 20, productKnowledge: 20, sales: 10 }
      },
      {
        question: 'The Operations Manager asks: "What about the Laptop Safe? Our business travelers need to secure 17-inch laptops. Does it fit?" How do you respond?',
        options: [
          'Say "Yes, it fits" without providing specifications',
          'Present the Laptop Safe (LRLS series) specifications: interior dimensions accommodate laptops up to 17 inches, features a padded interior, dual locking mechanism (RFID + override key), and USB charging port option for guest convenience',
          'Recommend they buy a larger safe from a different brand',
          'Say you\'ll check and get back to them'
        ],
        correctAnswer: 1,
        explanation: 'Knowing your product specifications cold is essential. The Laptop Safe\'s ability to fit 17-inch laptops, combined with the USB charging port (a huge guest convenience feature), makes it a compelling product. Presenting detailed specs builds credibility and addresses the question completely.',
        categoryScores: { communication: 5, technical: 15, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'The Procurement Director says: "The Orbita series looks interesting for our VIP suites, but it\'s expensive. Is it really worth the premium?" How do you justify it?',
        options: [
          'Agree it\'s expensive and suggest they skip it',
          'Simply state that it\'s the premium model',
          'Explain the Orbita series is a rotary watch winder safe — a unique luxury amenity for VIP suites that watches-loving guests will appreciate. It differentiates their property, justifies higher suite rates, and creates a memorable guest experience that drives loyalty and positive reviews',
          'Offer a discount to make it cheaper'
        ],
        correctAnswer: 2,
        explanation: 'The Orbita series is a distinctive luxury product — a watch winder safe. Positioning it as a unique VIP amenity that justifies higher room rates and creates exceptional guest experiences transforms it from a cost into an investment. This is consultative selling at its best.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 15, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 15, sales: 20 }
      },
      {
        question: 'The team seems impressed but the Procurement Director says: "We need to see references from similar luxury properties before making a decision." How do you handle this?',
        options: [
          'Say you don\'t have references available',
          'Promise to email references later but push for a decision now',
          'Acknowledge this as a reasonable request, share that LAXREE has installed safes in luxury properties across 40+ countries including several in the Middle East, offer to arrange a reference call with a hotel GM in the region, and propose signing a letter of intent conditional on satisfactory references',
          'Tell them references aren\'t necessary because LAXREE is well-known'
        ],
        correctAnswer: 2,
        explanation: 'Viewing reference requests as buying signals (they\'re interested!) rather than obstacles is key. Providing regional references is powerful, and proposing a conditional LOI keeps the deal moving forward while respecting their process. This builds trust and maintains deal momentum.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 10, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim3',
    title: 'Inbound Inquiry Handling',
    description: 'Handle incoming sales inquiries, qualify leads, and guide prospects through the buying process.',
    type: 'inbound_sales',
    difficulty: 'Beginner',
    duration: '12 min',
    scenario: 'You receive an inbound call from the Purchasing Manager of a 4-star business hotel in Riyadh. They saw LAXREE\'s website and are interested in RFID door locks for their 200-room property. They\'re planning a security upgrade and want quotes. This is a warm lead — handle it professionally.',
    questions: [
      {
        question: 'How do you open the call after they state their interest in RFID locks?',
        options: [
          'Immediately quote prices for all LRFD models',
          'Thank them for calling, confirm their interest in RFID locks, and ask qualifying questions: number of rooms, current lock system, timeline for upgrade, and key priorities (security, guest convenience, integration with PMS)',
          'Ask them to send an email with their requirements instead',
          'Transfer them to the technical department'
        ],
        correctAnswer: 1,
        explanation: 'Qualifying the lead properly is essential. Understanding the scope (rooms), current situation (existing locks), timeline, and priorities lets you tailor your response and properly assess the opportunity. Warm leads deserve professional handling — don\'t rush to quote without understanding needs.',
        categoryScores: { communication: 20, technical: 5, productKnowledge: 5, sales: 15 },
        categoryMax: { communication: 20, technical: 10, productKnowledge: 10, sales: 15 }
      },
      {
        question: 'They ask: "What\'s the difference between your LRFD models? Which one would work for us?" How do you respond?',
        options: [
          'Send them the full product catalog by email',
          'Explain the LRFD series range: LRFD-01 (basic RFID with LED indicator), LRFD-02 (RFID with mechanical override), and LRFD-03 (RFID with PMS integration, audit trail, and low battery alert). Recommend the LRFD-03 for their 4-star property since PMS integration and audit trails are essential for business hotels',
          'Recommend the most expensive model without explanation',
          'Say "They\'re all good, pick any one"'
        ],
        correctAnswer: 1,
        explanation: 'Demonstrating detailed product knowledge while making a specific recommendation based on their needs (4-star business hotel) shows expertise and builds confidence. The LRFD-03 with PMS integration is the right choice for business hotels that need audit trails and system integration.',
        categoryScores: { communication: 10, technical: 15, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'The Purchasing Manager mentions: "Our current locks keep malfunctioning and guests are complaining about key cards not working. It\'s hurting our reviews." How do you use this pain point?',
        options: [
          'Say "That\'s too bad" and move on to pricing',
          'Empathize with the problem, then explain how LAXREE\'s RFID technology has a 99.8% read rate, uses encrypted Mifare cards for security, has a mechanical override for emergencies, and the auto-lock feature ensures doors always secure. Share that reducing lock complaints typically improves guest satisfaction scores by 15-20%',
          'Criticize their current lock brand',
          'Tell them all key card systems have the same problems'
        ],
        correctAnswer: 1,
        explanation: 'Empathy followed by specific technical solutions and quantified benefits is the most effective approach. The 99.8% read rate directly addresses their malfunction issue, and tying it to improved guest satisfaction scores connects the solution to their business outcomes.',
        categoryScores: { communication: 15, technical: 10, productKnowledge: 15, sales: 15 },
        categoryMax: { communication: 15, technical: 15, productKnowledge: 15, sales: 15 }
      },
      {
        question: 'They ask: "Can you give me a price for 200 units?" What\'s the best approach?',
        options: [
          'Give the list price per unit immediately',
          'Ask a few more questions first: "To give you the most competitive pricing, can you share — do you need installation services? What\'s your target timeline? Are there any other properties that might need locks?" Then provide a range and explain volume discount tiers',
          'Refuse to give any pricing until a site visit',
          'Give the lowest possible price to win the deal'
        ],
        correctAnswer: 1,
        explanation: 'Asking about installation, timeline, and additional properties expands the opportunity and allows you to offer better volume pricing. Providing a price range with discount tiers shows transparency while keeping negotiation room. This maximizes deal value for both parties.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'Before ending the call, what\'s your closing action?',
        options: [
          'Say "Thanks for calling" and wait for them to call back',
          'Summarize the discussed solution, send a formal quote within 24 hours with LRFD-03 specifications, propose a site visit to assess installation requirements, and schedule a follow-up call for next week — getting their confirmation on the date',
          'Push for an immediate verbal commitment',
          'Just email the quote without any follow-up plan'
        ],
        correctAnswer: 1,
        explanation: 'A professional close includes: summary of agreed points, clear next steps with timelines, and a confirmed follow-up date. This ensures the lead doesn\'t go cold and demonstrates organized, reliable service. The site visit proposal also deepens engagement and moves toward closing.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim4',
    title: 'Negotiation Challenge',
    description: 'Negotiate pricing and contract terms with a budget-conscious client while maintaining value positioning.',
    type: 'negotiation',
    difficulty: 'Advanced',
    duration: '25 min',
    scenario: 'You\'re in a negotiation meeting with a resort group planning to open 3 new properties (total 750 rooms) in the UAE. They want a complete package: mini bars, safes, and kettles for every room. Their procurement VP is pushing hard for a 30% discount, referencing a competitor\'s lower quote. The deal value at list price is approximately $450,000. Your target is to close at no more than 15% discount.',
    questions: [
      {
        question: 'The VP opens with: "We need 30% off. That\'s our budget, and your competitor has already agreed to it." How do you respond?',
        options: [
          'Immediately agree to 30% to avoid losing the deal',
          'Refuse any discount and insist on list price',
          'Acknowledge their budget constraint, ask to understand what\'s included in the competitor\'s quote (often cheaper quotes exclude installation, warranty, or service), and suggest exploring the package scope to find value rather than just cutting price',
          'Offer 25% as a compromise'
        ],
        correctAnswer: 2,
        explanation: 'Never accept the first offer or reflexively discount. Instead, challenge the comparison — competitor quotes often exclude critical items. Shifting from price negotiation to value negotiation is a key skill. Understanding what\'s actually in the competitor\'s quote gives you leverage.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'You discover the competitor\'s quote uses absorption mini bars without installation or warranty. How do you leverage this?',
        options: [
          'Insult the competitor\'s products',
          'Create a side-by-side comparison: show that LAXREE\'s package includes compressor mini bars (50% more energy efficient), full installation, 3-year warranty, and 24/7 service support — making the total cost of ownership 20% lower despite a higher upfront price',
          'Ignore it and focus only on your own products',
          'Match their price by removing warranty and service'
        ],
        correctAnswer: 1,
        explanation: 'A factual side-by-side comparison is the most powerful negotiation tool. It doesn\'t attack the competitor directly — it lets the facts speak. Showing lower TCO reframes the conversation from "price" to "value," which is where LAXREE wins.',
        categoryScores: { communication: 10, technical: 10, productKnowledge: 15, sales: 20 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 15, sales: 20 }
      },
      {
        question: 'The VP says: "I appreciate the comparison, but my board approved a fixed budget. We literally cannot exceed it." What creative solution do you propose?',
        options: [
          'Walk away from the deal',
          'Propose a phased rollout: install premium LAXREE compressor units in the flagship property first (where ROI is highest), use LAXREE absorption units in the other two properties to fit budget, with an upgrade path. Include a volume discount on the full package for committing to all 3 properties',
          'Cut product quality to fit their budget',
          'Suggest they find more budget'
        ],
        correctAnswer: 1,
        explanation: 'Phased rollout is a creative win-win solution. The flagship property gets the best products (impresses guests, highest ROI), while staying within budget using absorption units for other properties. The upgrade path keeps future business coming. This shows flexibility while maintaining brand integrity.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 },
        categoryMax: { communication: 15, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'They ask about payment terms. You typically require 50% upfront, 50% on delivery. They want 30/70. What\'s your response?',
        options: [
          'Refuse any change to payment terms',
          'Agree to 30/70 immediately to close the deal',
          'Propose 40/60 as a middle ground, with the condition of a signed 3-year service contract (recurring revenue). Explain this provides them better cash flow while giving LAXREE the service contract as added value — a win-win structure',
          'Ask for 100% upfront instead'
        ],
        correctAnswer: 2,
        explanation: 'Negotiating payment terms while attaching a service contract creates mutual value. The client gets better cash flow (40/60 vs 50/50), and LAXREE secures recurring service revenue. This is creative deal structuring that expands the pie rather than just splitting it differently.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 }
      },
      {
        question: 'Final terms discussion: they want a 5-year warranty instead of the standard 3 years. How do you handle this?',
        options: [
          'Give the 5-year warranty for free',
          'Refuse any warranty extension',
          'Offer a 5-year warranty as part of the service contract (making it conditional on signing the 3-year service agreement), or offer 4 years standard with an optional extended warranty program. This trades warranty length for contract commitment',
          'Offer 5 years but remove other benefits to compensate'
        ],
        correctAnswer: 2,
        explanation: 'Using warranty as a negotiation lever tied to the service contract is smart deal-making. You give something they want (longer warranty) in exchange for something you want (service contract commitment). Alternatively, offering a middle ground (4 years) with a paid extension shows flexibility without giving away value.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 10, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim5',
    title: 'Customer Discovery Deep Dive',
    description: 'Conduct thorough needs analysis to uncover customer pain points and align with LAXREE solutions.',
    type: 'customer_discovery',
    difficulty: 'Intermediate',
    duration: '18 min',
    scenario: 'You\'re meeting with the Project Director of a new beachfront resort being built in Oman (250 rooms + 50 villas). They\'re at the early specification stage and haven\'t finalized their in-room amenities. This is a discovery meeting — your goal is to understand their needs deeply and position LAXREE as the ideal solutions partner.',
    questions: [
      {
        question: 'How do you approach this discovery meeting differently from a standard sales pitch?',
        options: [
          'Bring product samples and start demonstrating them immediately',
          'Focus on asking open-ended questions about their vision for the guest experience, the property\'s positioning, and what "luxury" means to their target guest profile',
          'Start by asking about their budget',
          'Present a pre-made proposal based on similar resort projects'
        ],
        correctAnswer: 1,
        explanation: 'Discovery meetings are about LISTENING, not presenting. Understanding their guest experience vision and positioning lets you align LAXREE solutions to their specific definition of luxury. This creates deeper engagement and a more tailored — and harder-to-replace — proposal.',
        categoryScores: { communication: 20, technical: 0, productKnowledge: 5, sales: 10 },
        categoryMax: { communication: 20, technical: 5, productKnowledge: 10, sales: 15 }
      },
      {
        question: 'The Project Director mentions: "We want each villa to feel like a private residence, not a hotel room." Which LAXREE products do you recommend for the villas and why?',
        options: [
          'Just mini bars, since that\'s the standard hotel product',
          'Recommend a curated villa package: the LRMB-C compressor mini bar (silent operation), Essential Safe for valuables, an RFID lock system with villa-specific programming, the LAXREE electric kettle in a designer finish, and the Orbita watch winder safe as a signature luxury touch for premium villas',
          'Recommend the cheapest options to keep costs down',
          'Suggest they source from multiple suppliers for variety'
        ],
        correctAnswer: 1,
        explanation: 'A "private residence" feel requires a thoughtful product ecosystem, not individual items. The curated package approach — especially the Orbita watch winder as a signature luxury element — demonstrates deep understanding of their vision and positions LAXREE as a solutions partner, not just a vendor.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 20, sales: 15 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'They ask about hair dryers: "We need something powerful but quiet. Guest complaints about weak hair dryers are common in our other properties." What LAXREE product knowledge do you share?',
        options: [
          'Say LAXREE hair dryers are "very good"',
          'Present the LAXREE professional hair dryer specifications: 1600W motor for powerful airflow, low noise operation (<65dB), wall-mounted option for space saving, auto-shutoff safety feature, and available in finishes matching the room décor. Offer to send sample units for the interior designer to evaluate',
          'Recommend they buy a consumer brand from retail',
          'Only share the price list'
        ],
        correctAnswer: 1,
        explanation: 'Specific product knowledge combined with a practical next step (sample units for the designer) shows professionalism and removes barriers. The 1600W power addresses the "weak dryer" complaint, and the wall-mount option shows awareness of hotel room design considerations.',
        categoryScores: { communication: 10, technical: 10, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'The Director reveals: "Our F&B team wants mini bars with glass doors so guests can see the contents, but our security team wants opaque doors to reduce theft." How do you help resolve this?',
        options: [
          'Pick one side and argue for it',
          'Suggest the LAXREE LRMB-C series with tinted glass doors — which allow content visibility (satisfying F&B) while being dark enough to reduce visual temptation (addressing security concerns). Offer the option of different door styles for rooms vs. suites based on their risk assessment',
          'Tell them to figure it out internally first',
          'Recommend no glass doors at all'
        ],
        correctAnswer: 1,
        explanation: 'Tinted glass is a brilliant compromise that addresses both teams\' concerns. Offering different door styles for different room types adds further flexibility. This demonstrates consultative problem-solving and positions you as a trusted advisor, not just a product vendor.',
        categoryScores: { communication: 15, technical: 10, productKnowledge: 15, sales: 10 },
        categoryMax: { communication: 15, technical: 15, productKnowledge: 15, sales: 15 }
      },
      {
        question: 'At the end of the meeting, the Director says: "This has been very helpful. We\'re still 6 months from final specifications." How do you maintain engagement over this long sales cycle?',
        options: [
          'Say "Call us when you\'re ready" and move on',
          'Establish a structured engagement plan: monthly check-ins, share relevant case studies of similar resort projects, offer to present to their interior design team about product integration, provide sample units for room mock-ups, and create a shared project specification document that evolves with their design',
          'Send generic marketing emails every week',
          'Offer the lowest price now to force an early decision'
        ],
        correctAnswer: 1,
        explanation: 'Long sales cycles require structured nurture. A plan that adds value at every touchpoint — case studies, design team presentations, room mock-up samples, and a collaborative specification document — keeps you engaged and positions LAXREE as the default choice when they\'re ready to buy.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 }
      }
    ]
  }
]

// ROOFING scenarios (premium roofing — stone-coated, thatch, asphalt shingle tiles)
// Same IDs (sim1-sim5) as AMENITIES_DIALOG_SCENARIOS so the SimulationDialog lookup
// stays in sync when an employee in the ROOFING company launches a sim from
// mock-simulations.tsx (which uses the same sim1-sim5 IDs).
const ROOFING_DIALOG_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim1',
    title: 'Homeowner Villa Meeting',
    description: 'Practice making initial contact with a premium-villa homeowner. Focus on opening statements and roofing-needs discovery.',
    type: 'field_sales',
    difficulty: 'Beginner',
    duration: '15 min',
    scenario: 'You are meeting with Vikram Mehta, a homeowner building a premium 5,000 sq ft villa in Pune. His architect suggested premium roofing but Vikram has only ever used traditional clay tiles and has never heard of stone-coated steel tiles. He is budget-conscious but willing to spend for quality and a long-lasting roof. This is your first face-to-face meeting at the construction site. Vikram is busy, focused on budget control, and curious about newer roofing technology. You have 20 minutes to make your pitch.',
    questions: [
      {
        question: 'How do you open the meeting after exchanging greetings with Vikram at his villa site?',
        options: [
          'Jump straight into the Laxree Roofing catalog and start listing tile profiles and prices',
          'Thank him for his time, acknowledge the villa project, and ask what his top priorities are for the roof — aesthetics, lifespan, weather resistance, or budget',
          'Start by telling him about Laxree\'s years of industry experience and global presence',
          'Ask about his current clay tile supplier and what problems he has had'
        ],
        correctAnswer: 1,
        explanation: 'A needs-based opening shows professionalism and customer-centricity. Acknowledging his project shows you\'ve done your homework. Asking about priorities opens the conversation naturally and gives you the information you need to tailor your pitch to stone-coated, thatch, or shingle tiles.',
        categoryScores: { communication: 20, technical: 0, productKnowledge: 5, sales: 10 },
        categoryMax: { communication: 20, technical: 5, productKnowledge: 10, sales: 15 }
      },
      {
        question: 'Vikram says: "Our biggest concern is longevity — I want a roof that lasts my lifetime. Clay tiles crack and need replacement." Which Laxree Roofing product do you lead with?',
        options: [
          'The asphalt shingle series, since it\'s the cheapest and most common',
          'The stone-coated tile series, highlighting the 50-year lifespan, steel core, stone-chip coating, and Class-A fire rating — explicitly contrasting with clay tile cracking and concrete\'s weight issues',
          'A thatch tile because it looks tropical',
          'Suggest he doesn\'t need a premium roof at all to save money'
        ],
        correctAnswer: 1,
        explanation: 'The stone-coated tile is the right lead. Its 50-year lifespan directly answers Vikram\'s longevity concern. The steel core + stone-chip coating makes it crack-resistant (unlike clay) and lightweight (unlike concrete). This positioning addresses his stated pain point precisely.',
        categoryScores: { communication: 5, technical: 15, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 20, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'Vikram asks: "What about weather performance? Pune gets heavy monsoon rain and some hail." How do you respond?',
        options: [
          'Say "Laxree tiles never leak" to reassure him',
          'Explain that stone-coated tiles are interlocking, tested for wind uplift up to 190 km/h, the stone-chip coating absorbs hail impact, and the steel core won\'t crack under thermal cycling. Mention the 50-year warranty covers manufacturing defects',
          'Tell him he should have chosen Laxree from the start',
          'Avoid the topic and redirect to pricing'
        ],
        correctAnswer: 1,
        explanation: 'Honesty with concrete facts builds trust. Explaining the interlocking design, wind uplift rating, hail-resistant stone-chip coating, and thermal-cycle resistance — combined with specific warranty details — directly addresses the monsoon and hail concern without making unrealistic claims.',
        categoryScores: { communication: 15, technical: 10, productKnowledge: 10, sales: 15 },
        categoryMax: { communication: 15, technical: 15, productKnowledge: 15, sales: 15 }
      },
      {
        question: 'Vikram says: "Your competitor is offering clay tiles at ₹350 per sq ft. Your stone-coated tile is ₹520. Can you match the clay price?" How do you handle this?',
        options: [
          'Immediately drop the price to ₹350 to win the deal',
          'Say "Our quality is better" without providing specifics',
          'Reframe the conversation: "Let me show you total cost of ownership. Stone-coated lasts 50 years vs clay\'s 15-20. Over 50 years, that\'s 2-3 clay replacements. Add the steel core\'s crack resistance and zero-maintenance finish, and our lifetime cost is actually 30-40% lower than clay."',
          'Walk away from the deal since he\'s price-focused'
        ],
        correctAnswer: 2,
        explanation: 'Value-based selling is critical here. Instead of competing on per-sq-ft price, reframe to Total Cost of Ownership. The 50-year lifespan vs clay\'s 15-20 years means 2-3 replacement cycles avoided, plus zero maintenance. Using specific numbers for his villa makes the case compelling and financial.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 10, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'The meeting is wrapping up. What\'s your closing approach?',
        options: [
          'Say "Thanks for your time" and leave your business card',
          'Push hard for an immediate purchase order',
          'Propose a clear next step: "I\'d like to arrange a sample installation on a small porch section of your villa so you can see the profile and color in natural light. I\'ll also prepare a TCO comparison vs clay. Can we schedule a follow-up next Thursday?"',
          'Ask him to call you when he\'s ready to decide'
        ],
        correctAnswer: 2,
        explanation: 'Always close with a specific next step. Proposing a sample installation is powerful because it lets the product speak for itself in real light. Scheduling a specific follow-up date keeps momentum. This approach is professional, customer-friendly, and significantly increases close rates.',
        categoryScores: { communication: 15, technical: 0, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim2',
    title: 'Roofing Product Demo',
    description: 'Present Laxree tile profiles to a prospective builder. Handle technical questions and objections.',
    type: 'field_sales',
    difficulty: 'Intermediate',
    duration: '20 min',
    scenario: 'You are presenting to the procurement team of Skyline Builders, constructing a 50-villa gated township in Bangalore. They need roofing for all 50 villas. The procurement director, head of design, and project manager are present. They\'ve shortlisted Laxree Roofing and one competitor (a clay tile supplier). This is your product demo presentation — make it count.',
    questions: [
      {
        question: 'How do you structure the opening of your demo presentation?',
        options: [
          'Start by showing all 6 stone-coated profiles Laxree offers to demonstrate breadth of range',
          'Open with a brief overview of Laxree Roofing, then focus on the profiles most relevant to their 50-villa township — Classic, Shingle, and Tudor Pro — explaining why these fit premium residential use',
          'Begin with pricing to show competitiveness right away',
          'Start with a technical deep-dive into steel core metallurgy'
        ],
        correctAnswer: 1,
        explanation: 'Tailoring your presentation to the client\'s specific needs (premium residential, 50 villas) shows preparation and respect for their time. Leading with Classic, Shingle, and Tudor Pro — ideal profiles for premium villas — demonstrates product knowledge and customer understanding.',
        categoryScores: { communication: 20, technical: 5, productKnowledge: 15, sales: 10 },
        categoryMax: { communication: 20, technical: 10, productKnowledge: 15, sales: 10 }
      },
      {
        question: 'The Head of Design asks: "What profiles do you have? We need something that looks premium but isn\'t generic." What do you highlight?',
        options: [
          'Just say "we have several profiles" and move on',
          'Explain Laxree\'s 6 stone-coated profiles: Classic (timeless), Classic Pro (enhanced), Shingle (modern flat), Nosen (cedar shake look), Wood (rustic wood texture), and Tudor Pro (European elegance). Recommend Tudor Pro and Wood for premium villas to differentiate the township aesthetically',
          'Recommend only the cheapest profile',
          'Show a video of a clay tile roof instead'
        ],
        correctAnswer: 1,
        explanation: 'Showing the full 6-profile range (Classic, Classic Pro, Shingle, Nosen, Wood, Tudor Pro) demonstrates breadth while specific recommendations (Tudor Pro and Wood for premium villas) demonstrate consultative selling. This addresses both the "premium look" and "not generic" requirements.',
        categoryScores: { communication: 10, technical: 20, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 20, productKnowledge: 20, sales: 10 }
      },
      {
        question: 'The Project Manager asks: "These look like clay tiles visually — what\'s actually different? Why stone-coated steel?" How do you respond?',
        options: [
          'Say "it\'s just better" without specifics',
          'Present the technical specs: steel core (strength + crack resistance vs clay), stone-chip coating (UV-stable color, doesn\'t fade), lightweight (60% lighter than concrete, no structural reinforcement needed), Class-A fire rating, and 50-year lifespan vs clay\'s 15-20',
          'Recommend they buy clay from the competitor instead',
          'Say you\'ll check and get back to them'
        ],
        correctAnswer: 1,
        explanation: 'Knowing your product specs cold is essential. The steel core + stone-chip coating differentiates from clay on every dimension: strength, weight, fire, lifespan. Presenting these specs builds credibility and addresses the comparison question completely.',
        categoryScores: { communication: 5, technical: 15, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'The Procurement Director says: "Tudor Pro looks beautiful for the show villas, but it\'s expensive. Is it really worth the premium over Classic?" How do you justify it?',
        options: [
          'Agree it\'s expensive and suggest they skip it',
          'Simply state that it\'s the premium model',
          'Explain Tudor Pro\'s European elegance differentiates their township from competitors, justifies a higher villa selling price, creates a memorable streetscape that drives faster sales, and the 50-year warranty means zero replacement cost for the homeowner — a powerful marketing story',
          'Offer a discount to make it cheaper'
        ],
        correctAnswer: 2,
        explanation: 'Tudor Pro is a distinctive premium profile. Positioning it as a marketing differentiator that justifies higher villa prices and faster sales transforms it from a cost into an investment. This is consultative selling at its best.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 15, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 15, sales: 20 }
      },
      {
        question: 'The team seems impressed but the Procurement Director says: "We need to see installed references from similar township projects before deciding." How do you handle this?',
        options: [
          'Say you don\'t have references available',
          'Promise to email references later but push for a decision now',
          'Acknowledge this as a reasonable request, share that Laxree Roofing has installed tiles in premium villa projects across India including several in Bangalore, offer to arrange a site visit to a completed township nearby, and propose signing a letter of intent conditional on satisfactory references',
          'Tell them references aren\'t necessary because Laxree is well-known'
        ],
        correctAnswer: 2,
        explanation: 'Viewing reference requests as buying signals (they\'re interested!) rather than obstacles is key. Providing local references is powerful, and proposing a conditional LOI keeps the deal moving forward while respecting their process. This builds trust and maintains deal momentum.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 10, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim3',
    title: 'Inbound Roofing Inquiry',
    description: 'Handle incoming roofing inquiries, qualify leads, and guide prospects through the buying process.',
    type: 'inbound_sales',
    difficulty: 'Beginner',
    duration: '12 min',
    scenario: 'You receive an inbound call from Priya Nair, an architect designing a resort in Kerala with 20 cottage buildings. She saw Laxree Roofing\'s website and is interested in stone-coated tiles for the main buildings, and possibly thatch tiles for gazebos and poolside cabanas. She\'s planning the roofing selection now and wants quotes. This is a warm lead — handle it professionally.',
    questions: [
      {
        question: 'How do you open the call after she states her interest in Laxree Roofing?',
        options: [
          'Immediately quote prices for all stone-coated profiles',
          'Thank her for calling, confirm her interest in Laxree Roofing, and ask qualifying questions: number of buildings, total roof area, slope style, timeline, and key priorities (aesthetics, weather resistance, fire rating, budget)',
          'Ask her to send an email with her requirements instead',
          'Transfer her to the technical department'
        ],
        correctAnswer: 1,
        explanation: 'Qualifying the lead properly is essential. Understanding the scope (20 cottages), roof area, slope style, timeline, and priorities lets you tailor your response and properly assess the opportunity. Warm leads deserve professional handling — don\'t rush to quote without understanding needs.',
        categoryScores: { communication: 20, technical: 5, productKnowledge: 5, sales: 15 },
        categoryMax: { communication: 20, technical: 10, productKnowledge: 10, sales: 15 }
      },
      {
        question: 'She asks: "What\'s the difference between your stone-coated profiles? Which would work for resort cottages?" How do you respond?',
        options: [
          'Send her the full product catalog by email',
          'Explain the 6 profile range: Classic, Classic Pro, Shingle, Nosen, Wood, Tudor Pro. Recommend Wood or Nosen for resort cottages since their organic textures blend beautifully with Kerala\'s natural surroundings and resort aesthetic. Mention both come in earth-tone colors',
          'Recommend the most expensive model without explanation',
          'Say "They\'re all good, pick any one"'
        ],
        correctAnswer: 1,
        explanation: 'Demonstrating detailed product knowledge while making a specific recommendation based on her project (resort in Kerala) shows expertise and builds confidence. Wood and Nosen profiles\' organic textures genuinely suit resort aesthetics.',
        categoryScores: { communication: 10, technical: 15, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'Priya mentions: "We also have gazebos, a poolside cabana, and a tiki bar. I\'m worried stone-coated might look too formal for those spaces." How do you use this pain point?',
        options: [
          'Say "That\'s too bad" and move on to pricing',
          'Empathize with the design concern, then introduce Laxree Artificial Thatch Tiles — UV-stable, fire-resistant, 30+ year lifespan, no maintenance, and available in 500mm and 1000mm sizes. Share that resorts across India use thatch for gazebos and cabanas to create that relaxed tropical vibe without natural thatch\'s fire risk',
          'Criticize her design sense',
          'Tell her all roofing has the same look'
        ],
        correctAnswer: 1,
        explanation: 'Empathy followed by a specific complementary product (artificial thatch) and quantified benefits (30+ year lifespan, fire-resistant, no maintenance) is the most effective approach. This directly addresses her aesthetic concern while creating a cross-sell opportunity.',
        categoryScores: { communication: 15, technical: 10, productKnowledge: 15, sales: 15 },
        categoryMax: { communication: 15, technical: 15, productKnowledge: 15, sales: 15 }
      },
      {
        question: 'She asks: "Can you give me a price for 20 buildings plus the thatch areas?" What\'s the best approach?',
        options: [
          'Give the list price per sq ft immediately',
          'Ask a few more questions first: "To give you the most competitive pricing, can you share — do you need installation services? What\'s your target timeline? Are there other resort projects in your portfolio that might need roofing?" Then provide a range with volume discount tiers',
          'Refuse to give any pricing until a site visit',
          'Give the lowest possible price to win the deal'
        ],
        correctAnswer: 1,
        explanation: 'Asking about installation, timeline, and additional properties expands the opportunity and allows you to offer better volume pricing. Providing a price range with discount tiers shows transparency while keeping negotiation room. This maximizes deal value for both parties.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'Before ending the call, what\'s your closing action?',
        options: [
          'Say "Thanks for calling" and wait for her to call back',
          'Summarize the discussed solution, send a formal quote within 24 hours with Wood profile + thatch specifications, propose a site visit to assess roof slopes and installation requirements, and schedule a follow-up call for next week — getting her confirmation on the date',
          'Push for an immediate verbal commitment',
          'Just email the quote without any follow-up plan'
        ],
        correctAnswer: 1,
        explanation: 'A professional close includes: summary of agreed points, clear next steps with timelines, and a confirmed follow-up date. This ensures the lead doesn\'t go cold and demonstrates organized, reliable service. The site visit proposal also deepens engagement and moves toward closing.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim4',
    title: 'Roofing Negotiation Challenge',
    description: 'Negotiate pricing and contract terms with a budget-conscious builder while maintaining value positioning.',
    type: 'negotiation',
    difficulty: 'Advanced',
    duration: '25 min',
    scenario: 'You\'re in a negotiation meeting with Skyline Builders, constructing a 50-villa gated township in Bangalore. They want stone-coated tiles for all 50 villas plus thatch tiles for the clubhouse gazebo and poolside cabanas. Their procurement VP is pushing hard for a 30% discount, referencing a clay tile competitor\'s lower quote. The deal value at list price is approximately ₹1.2 crore. Your target is to close at no more than 15% discount.',
    questions: [
      {
        question: 'The VP opens with: "We need 30% off. That\'s our budget, and your clay tile competitor has already agreed to it." How do you respond?',
        options: [
          'Immediately agree to 30% to avoid losing the deal',
          'Refuse any discount and insist on list price',
          'Acknowledge their budget constraint, ask to understand what\'s included in the competitor\'s quote (cheaper clay quotes often exclude installation, warranty, or proper underlayment), and suggest exploring the package scope to find value rather than just cutting price',
          'Offer 25% as a compromise'
        ],
        correctAnswer: 2,
        explanation: 'Never accept the first offer or reflexively discount. Instead, challenge the comparison — competitor quotes often exclude critical items. Shifting from price negotiation to value negotiation is a key skill. Understanding what\'s actually in the competitor\'s quote gives you leverage.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'You discover the clay competitor\'s quote excludes installation, underlayment, and warranty. How do you leverage this?',
        options: [
          'Insult the competitor\'s products',
          'Create a side-by-side comparison: show that Laxree\'s package includes stone-coated tiles, full installation, ridge accessories, underlayment, 50-year warranty, and 24/7 service support — making the total cost of ownership over 50 years actually lower than clay despite a higher upfront price',
          'Ignore it and focus only on your own products',
          'Match their price by removing warranty and service'
        ],
        correctAnswer: 1,
        explanation: 'A factual side-by-side comparison is the most powerful negotiation tool. It doesn\'t attack the competitor directly — it lets the facts speak. Showing lower TCO over 50 years (clay needs 2-3 replacements) reframes the conversation from "price" to "value," which is where Laxree Roofing wins.',
        categoryScores: { communication: 10, technical: 10, productKnowledge: 15, sales: 20 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 15, sales: 20 }
      },
      {
        question: 'The VP says: "I appreciate the comparison, but my board approved a fixed budget. We literally cannot exceed it." What creative solution do you propose?',
        options: [
          'Walk away from the deal',
          'Propose a phased rollout: install premium Tudor Pro stone-coated tiles in the 10 show villas first (where marketing ROI is highest), use Classic profile in the other 40 to fit budget, with an upgrade path. Include a volume discount on the full 50-villa package and the thatch clubhouse package for committing to all of it',
          'Cut product quality to fit their budget',
          'Suggest they find more budget'
        ],
        correctAnswer: 1,
        explanation: 'Phased rollout is a creative win-win solution. The 10 show villas get the premium Tudor Pro profile (impresses buyers, highest ROI), while staying within budget using Classic for other 40. The upgrade path keeps future business coming. This shows flexibility while maintaining brand integrity.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 },
        categoryMax: { communication: 15, technical: 10, productKnowledge: 10, sales: 20 }
      },
      {
        question: 'They ask about payment terms. You typically require 50% upfront, 50% on delivery. They want 30/70. What\'s your response?',
        options: [
          'Refuse any change to payment terms',
          'Agree to 30/70 immediately to close the deal',
          'Propose 40/60 as a middle ground, with the condition of a signed 5-year service contract (recurring revenue for warranty maintenance visits). Explain this provides them better cash flow while giving Laxree the service contract as added value — a win-win structure',
          'Ask for 100% upfront instead'
        ],
        correctAnswer: 2,
        explanation: 'Negotiating payment terms while attaching a service contract creates mutual value. The client gets better cash flow (40/60 vs 50/50), and Laxree secures recurring service revenue. This is creative deal structuring that expands the pie rather than just splitting it differently.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 }
      },
      {
        question: 'Final terms discussion: they want a 50-year warranty instead of the standard 30 years on the stone-coated tiles. How do you handle this?',
        options: [
          'Give the 50-year warranty for free',
          'Refuse any warranty extension',
          'Acknowledge that the stone-coated tiles ARE rated for 50 years lifespan, offer to extend the formal warranty from 30 to 50 years as part of the service contract (making it conditional on signing the 5-year service agreement), or offer 40 years standard with a paid extended warranty program',
          'Offer 50 years but remove other benefits to compensate'
        ],
        correctAnswer: 2,
        explanation: 'Using warranty length as a negotiation lever tied to the service contract is smart deal-making. Since the tiles genuinely last 50 years, extending the formal warranty is low-cost to you but high-value to the client. Trading warranty length for service contract commitment is a win-win.',
        categoryScores: { communication: 10, technical: 5, productKnowledge: 10, sales: 20 },
        categoryMax: { communication: 10, technical: 10, productKnowledge: 10, sales: 20 }
      }
    ]
  },
  {
    id: 'sim5',
    title: 'Roofing Customer Discovery',
    description: 'Conduct a thorough needs analysis for a new resort project and align with Laxree Roofing solutions across the product portfolio.',
    type: 'customer_discovery',
    difficulty: 'Intermediate',
    duration: '18 min',
    scenario: 'You\'re meeting with Priya Nair, the architect for a luxury beachfront resort in Kerala. The resort has 20 main cottage buildings, a central clubhouse, a spa, 8 gazebos, 4 poolside cabanas, and a tiki bar. Priya is in the design specification phase — 6 months from final roofing decisions. The owner wants a cohesive aesthetic across all structures while respecting the beachfront setting. This is a discovery meeting, not a sales pitch.',
    questions: [
      {
        question: 'How do you open this discovery meeting with Priya the architect?',
        options: [
          'Start by showing the Laxree Roofing catalog and walking through every profile',
          'Begin by asking Priya about her design vision for the resort — what aesthetic is she trying to achieve, what\'s the architectural style, how does she want each structure (cottages, clubhouse, spa, gazebos) to feel to guests',
          'Open with pricing to set expectations',
          'Skip discovery and ask for the contract'
        ],
        correctAnswer: 1,
        explanation: 'Discovery meetings are about understanding the client\'s vision first. Starting with Priya\'s design intent shows you respect her role as architect and want to be a design partner, not just a tile vendor. This builds the trust needed for a long-term project.',
        categoryScores: { communication: 20, technical: 0, productKnowledge: 5, sales: 10 },
        categoryMax: { communication: 20, technical: 5, productKnowledge: 10, sales: 15 }
      },
      {
        question: 'Priya shares that she wants the main cottages to feel "modern coastal" but the gazebos and tiki bar to feel "tropical rustic." Which Laxree products do you propose for each?',
        options: [
          'Recommend the same stone-coated profile everywhere for consistency',
          'Recommend Shingle or Classic profile stone-coated tiles in sea-tone colors for the modern coastal cottages and clubhouse, and Artificial Thatch tiles (1000mm size) for the gazebos, cabanas, and tiki bar to deliver the tropical rustic look without natural thatch\'s fire risk',
          'Recommend only thatch everywhere',
          'Recommend asphalt shingles for everything to save money'
        ],
        correctAnswer: 1,
        explanation: 'A multi-product solution matches each structure\'s design intent perfectly. Shingle/Classic stone-coated for modern coastal, thatch for tropical rustic — this is exactly the kind of consultative cross-product solution Laxree Roofing is uniquely positioned to deliver. It also deepens the account.',
        categoryScores: { communication: 10, technical: 10, productKnowledge: 20, sales: 15 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'Priya asks about fire safety for the beachfront thatch structures: "Natural thatch is banned in our coastal zone. Will artificial thatch pass fire codes?" How do you respond?',
        options: [
          'Say Laxree thatch "is probably fine"',
          'Present the Laxree Artificial Thatch certifications: Class-A fire rating, UV-stable for 30+ years, no maintenance, available in 500mm and 1000mm sizes. Offer to send the fire-rating certificate and arrange a sample for the local fire marshal to approve',
          'Recommend she use natural thatch anyway',
          'Only share the price list'
        ],
        correctAnswer: 1,
        explanation: 'Specific certifications combined with a practical next step (sample for the fire marshal) shows professionalism and removes a critical barrier. The Class-A fire rating directly addresses the coastal ban, and the 30+ year lifespan beats natural thatch\'s 5-7 years.',
        categoryScores: { communication: 10, technical: 15, productKnowledge: 20, sales: 10 },
        categoryMax: { communication: 10, technical: 15, productKnowledge: 20, sales: 15 }
      },
      {
        question: 'Priya reveals: "The owner wants the main cottage roofs to have visible texture from a distance — smooth profiles won\'t work." How do you help?',
        options: [
          'Pick one profile and argue for it',
          'Suggest the Wood or Nosen profile stone-coated tiles — both have rich surface textures (wood grain or cedar shake look) that are visible from a distance, come in earth-tone colors that complement the coastal setting, and offer different visual weights for variety across the 20 cottages',
          'Tell her to figure it out internally first',
          'Recommend smooth profiles anyway'
        ],
        correctAnswer: 1,
        explanation: 'Wood and Nosen profiles\' textured surfaces directly address the "visible texture from distance" requirement. Offering two textured options (Wood for grain, Nosen for cedar shake) with different visual weights adds design flexibility. This demonstrates consultative problem-solving.',
        categoryScores: { communication: 15, technical: 10, productKnowledge: 15, sales: 10 },
        categoryMax: { communication: 15, technical: 15, productKnowledge: 15, sales: 15 }
      },
      {
        question: 'At the end of the meeting, Priya says: "This has been very helpful. We\'re still 6 months from final specifications." How do you maintain engagement over this long sales cycle?',
        options: [
          'Say "Call us when you\'re ready" and move on',
          'Establish a structured engagement plan: monthly check-ins, share case studies of similar resort projects, offer to present to the owner about ROI of premium roofing, provide sample tiles for the design team\'s mock-up cottage, and create a shared project specification document that evolves with the design',
          'Send generic marketing emails every week',
          'Offer the lowest price now to force an early decision'
        ],
        correctAnswer: 1,
        explanation: 'Long sales cycles require structured nurture. A plan that adds value at every touchpoint — case studies, owner presentations, mock-up samples, and a collaborative specification document — keeps you engaged and positions Laxree Roofing as the default choice when they\'re ready to buy.',
        categoryScores: { communication: 15, technical: 5, productKnowledge: 5, sales: 20 },
        categoryMax: { communication: 15, technical: 5, productKnowledge: 10, sales: 20 }
      }
    ]
  }
]

// ==================== DIFFICULTY CONFIG ====================

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
}

// ==================== HELPER FUNCTIONS ====================

function generateAIFeedback(scores: CategoryScores, overall: number, isRoofing = false): string {
  const parts: string[] = []
  const brand = isRoofing ? 'Laxree Roofing' : 'LAXREE'
  const catalogContext = isRoofing
    ? 'knowing specs, technologies (stone-coated vs clay vs concrete, fire ratings, thatch materials) and competitive differentiators is essential'
    : 'knowing specs, technologies (compressor vs absorption, RFID features), and competitive differentiators is essential'
  const rangeContext = isRoofing
    ? 'learning the full Laxree Roofing range (stone-coated profiles, thatch tiles, asphalt shingles) and when to recommend each'
    : 'learning the full LAXREE range and when to recommend each model'

  if (overall >= 90) {
    parts.push('Outstanding performance! You demonstrated exceptional sales acumen and product mastery.')
  } else if (overall >= 75) {
    parts.push('Strong performance! You showed solid skills across most areas with room for refinement.')
  } else if (overall >= 60) {
    parts.push('Good effort! You have a solid foundation but some key areas need development.')
  } else if (overall >= 40) {
    parts.push('You\'re building your skills. Focus on the weaker areas identified below to improve significantly.')
  } else {
    parts.push('This is a learning opportunity. Review the feedback carefully and practice the key concepts.')
  }

  if (scores.communication >= 80) {
    parts.push('Your communication skills are excellent — you naturally build rapport and ask the right questions.')
  } else if (scores.communication >= 60) {
    parts.push('Communication is decent but could be sharper. Practice active listening and needs-based opening approaches.')
  } else {
    parts.push('Communication needs significant improvement. Focus on asking open-ended questions, active listening, and avoiding jumping to product pitches too early.')
  }

  if (scores.technical >= 80) {
    parts.push(`Your technical knowledge is impressive — you clearly understand ${brand} product specifications and technology.`)
  } else if (scores.technical >= 60) {
    parts.push('Technical knowledge is adequate but deeper product understanding would strengthen your credibility. Review the Product Academy modules.')
  } else {
    parts.push(`Technical knowledge needs work. Study the ${brand} product catalog thoroughly — ${catalogContext}.`)
  }

  if (scores.productKnowledge >= 80) {
    parts.push('Product knowledge is a clear strength — you match the right products to the right scenarios naturally.')
  } else if (scores.productKnowledge >= 60) {
    parts.push('Product knowledge is functional but could be more nuanced. Practice matching specific models to customer needs.')
  } else {
    parts.push(`Product knowledge needs significant improvement. Spend time in the Product Academy ${rangeContext}.`)
  }

  if (scores.sales >= 80) {
    parts.push('Your sales technique is top-notch — you handle objections, negotiate skillfully, and close effectively.')
  } else if (scores.sales >= 60) {
    parts.push('Sales skills are developing well. Work on value-based selling, TCO framing, and creative deal structuring.')
  } else {
    parts.push('Sales approach needs the most attention. Practice value-based selling over price-based, learn TCO calculations, and work on closing with specific next steps rather than leaving things open-ended.')
  }

  return parts.join(' ')
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

function getProgressColor(score: number): string {
  if (score >= 80) return '[&>div]:bg-emerald-500'
  if (score >= 60) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-red-500'
}

// ==================== COMPONENT ====================

interface SimulationDialogProps {
  simulationId: string | null
  open: boolean
  onClose: () => void
  onComplete: (attempt: SimulationAttempt) => void
}

interface SimulationAttempt {
  id: string
  score: number
  communicationScore: number
  technicalScore: number
  productKnowledgeScore: number
  salesScore: number
  feedback: string | null
  aiFeedback: string | null
  completedAt: string
}

export function SimulationDialog({ simulationId, open, onClose, onComplete }: SimulationDialogProps) {
  const user = useAuthStore((s) => s.user)
  const isRoofing = user?.company === 'ROOFING'
  const SIMULATION_SCENARIOS = isRoofing ? ROOFING_DIALOG_SCENARIOS : AMENITIES_DIALOG_SCENARIOS
  const scenario = SIMULATION_SCENARIOS.find((s) => s.id === simulationId)
  // Theme tokens — amber/orange for Roofing, emerald/teal for Amenities
  const accentBg = isRoofing ? 'bg-amber-100' : 'bg-emerald-100'
  const accentText = isRoofing ? 'text-amber-600' : 'text-emerald-600'
  const accentTextStrong = isRoofing ? 'text-amber-700' : 'text-emerald-700'
  const accentBtn = isRoofing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
  const accentProgress = isRoofing ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
  const accentScenarioCard = isRoofing
    ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
    : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
  const accentFeedbackCard = isRoofing
    ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50'
    : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'

  const [phase, setPhase] = useState<SimulationPhase>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [scores, setScores] = useState<CategoryScores>({ communication: 0, technical: 0, productKnowledge: 0, sales: 0 })
  const [maxScores, setMaxScores] = useState<CategoryScores>({ communication: 0, technical: 0, productKnowledge: 0, sales: 0 })
  const [saving, setSaving] = useState(false)

  const resetSimulation = useCallback(() => {
    setPhase('intro')
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers([])
    setScores({ communication: 0, technical: 0, productKnowledge: 0, sales: 0 })
    setMaxScores({ communication: 0, technical: 0, productKnowledge: 0, sales: 0 })
    setSaving(false)
  }, [])

  const handleClose = useCallback(() => {
    resetSimulation()
    onClose()
  }, [resetSimulation, onClose])

  const startSimulation = useCallback(() => {
    if (!scenario) return
    const max = { communication: 0, technical: 0, productKnowledge: 0, sales: 0 }
    scenario.questions.forEach((q) => {
      max.communication += q.categoryMax.communication
      max.technical += q.categoryMax.technical
      max.productKnowledge += q.categoryMax.productKnowledge
      max.sales += q.categoryMax.sales
    })
    setMaxScores(max)
    setPhase('question')
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers([])
    setScores({ communication: 0, technical: 0, productKnowledge: 0, sales: 0 })
  }, [scenario])

  const handleAnswerSelect = useCallback((index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
  }, [selectedAnswer])

  const handleNextQuestion = () => {
    if (!scenario || selectedAnswer === null) return

    const question = scenario.questions[currentQuestion]
    const isCorrect = selectedAnswer === question.correctAnswer

    const newScores = { ...scores }
    if (isCorrect) {
      newScores.communication += question.categoryScores.communication
      newScores.technical += question.categoryScores.technical
      newScores.productKnowledge += question.categoryScores.productKnowledge
      newScores.sales += question.categoryScores.sales
    }

    const newAnswers = [...answers, selectedAnswer]

    if (currentQuestion < scenario.questions.length - 1) {
      setScores(newScores)
      setAnswers(newAnswers)
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      // Last question - go to results
      setScores(newScores)
      setAnswers(newAnswers)
      setPhase('results')
    }
  }

  const saveAttempt = useCallback(async () => {
    if (!user?.id || !scenario) return

    const commPct = maxScores.communication > 0 ? Math.round((scores.communication / maxScores.communication) * 100) : 0
    const techPct = maxScores.technical > 0 ? Math.round((scores.technical / maxScores.technical) * 100) : 0
    const prodPct = maxScores.productKnowledge > 0 ? Math.round((scores.productKnowledge / maxScores.productKnowledge) * 100) : 0
    const salesPct = maxScores.sales > 0 ? Math.round((scores.sales / maxScores.sales) * 100) : 0
    const overall = Math.round((commPct + techPct + prodPct + salesPct) / 4)

    const aiFeedback = generateAIFeedback(
      { communication: commPct, technical: techPct, productKnowledge: prodPct, sales: salesPct },
      overall,
      isRoofing
    )

    const attempt: SimulationAttempt = {
      id: `sim_${Date.now()}`,
      score: overall,
      communicationScore: commPct,
      technicalScore: techPct,
      productKnowledgeScore: prodPct,
      salesScore: salesPct,
      feedback: `Completed ${scenario.title} simulation`,
      aiFeedback,
      completedAt: new Date().toISOString(),
    }

    setSaving(true)
    try {
      await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          simulationTitle: scenario.title,
          simulationType: scenario.type,
          score: overall,
          communicationScore: commPct,
          technicalScore: techPct,
          productKnowledgeScore: prodPct,
          salesScore: salesPct,
          feedback: attempt.feedback,
          aiFeedback,
          answers: JSON.stringify(answers),
        }),
      })
    } catch (err) {
      console.error('Failed to save simulation attempt:', err)
    } finally {
      setSaving(false)
    }

    onComplete(attempt)
  }, [user, scenario, scores, maxScores, answers, onComplete])

  if (!scenario) return null

  const question = scenario.questions[currentQuestion]
  const isCorrect = selectedAnswer !== null && question && selectedAnswer === question.correctAnswer

  // Results calculations
  const commPct = maxScores.communication > 0 ? Math.round((scores.communication / maxScores.communication) * 100) : 0
  const techPct = maxScores.technical > 0 ? Math.round((scores.technical / maxScores.technical) * 100) : 0
  const prodPct = maxScores.productKnowledge > 0 ? Math.round((scores.productKnowledge / maxScores.productKnowledge) * 100) : 0
  const salesPct = maxScores.sales > 0 ? Math.round((scores.sales / maxScores.sales) * 100) : 0
  const overallPct = Math.round((commPct + techPct + prodPct + salesPct) / 4)

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && phase !== 'question') handleClose() }}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={phase !== 'question'}
        onPointerDownOutside={(e) => { e.preventDefault() }}
        onInteractOutside={(e) => { e.preventDefault() }}
      >
        {/* ==================== INTRO PHASE ==================== */}
        {phase === 'intro' && (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className={`w-10 h-10 ${accentBg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Play className={`w-5 h-5 ${accentText}`} />
                </div>
                {scenario.title}
              </DialogTitle>
              <DialogDescription className="text-sm">{scenario.description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge className={difficultyColors[scenario.difficulty]}>
                {scenario.difficulty}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {scenario.duration}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> {scenario.questions.length} Questions
              </Badge>
              <Badge variant="outline" className="capitalize">
                {scenario.type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Scenario Description */}
            <Card className={accentScenarioCard}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`w-4 h-4 ${accentText}`} />
                  <span className={`text-sm font-semibold ${accentTextStrong}`}>Scenario</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{scenario.scenario}</p>
              </CardContent>
            </Card>

            {/* Scoring Info */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Communication', icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Technical', icon: Wrench, color: 'text-teal-600 bg-teal-50' },
                { label: 'Product', icon: Package, color: 'text-amber-600 bg-amber-50' },
                { label: 'Sales', icon: DollarSign, color: 'text-rose-600 bg-rose-50' },
              ].map((cat) => (
                <div key={cat.label} className={`p-2 rounded-lg ${cat.color.split(' ')[1]} text-center`}>
                  <cat.icon className={`w-4 h-4 mx-auto mb-1 ${cat.color.split(' ')[0]}`} />
                  <p className="text-xs font-medium text-gray-700">{cat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={startSimulation}
                className={`${accentBtn} text-white gap-2`}
              >
                <Play className="w-4 h-4" /> Begin Simulation
              </Button>
            </div>
          </div>
        )}

        {/* ==================== QUESTION PHASE ==================== */}
        {phase === 'question' && question && (
          <div className="space-y-5">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base">
                  Question {currentQuestion + 1} of {scenario.questions.length}
                </DialogTitle>
                <Badge className={difficultyColors[scenario.difficulty]}>
                  {scenario.title}
                </Badge>
              </div>
              <div className="w-full">
                <Progress
                  value={((currentQuestion + (selectedAnswer !== null ? 1 : 0)) / scenario.questions.length) * 100}
                  className={`h-2 ${accentProgress}`}
                />
              </div>
            </DialogHeader>

            <p className="text-sm font-medium text-gray-800 leading-relaxed">{question.question}</p>

            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx
                const isCorrectOption = idx === question.correctAnswer
                const showResult = selectedAnswer !== null

                let optionStyle = isRoofing
                  ? 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer'
                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'border-red-300 bg-red-50 ring-1 ring-red-200'
                  } else {
                    optionStyle = 'border-gray-200 opacity-60'
                  }
                } else if (isSelected) {
                  optionStyle = isRoofing
                    ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300'
                    : 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!showResult ? { scale: 1.01 } : undefined}
                    whileTap={!showResult ? { scale: 0.99 } : undefined}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={showResult}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${optionStyle} ${showResult ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        showResult && isCorrectOption
                          ? 'bg-emerald-500 text-white'
                          : showResult && isSelected && !isCorrectOption
                          ? 'bg-red-400 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {showResult && isCorrectOption ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : showResult && isSelected && !isCorrectOption ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          optionLabels[idx]
                        )}
                      </span>
                      <span className="text-sm text-gray-700 pt-0.5">{option}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Feedback after answering */}
            {selectedAnswer !== null && (
              <div>
                <Card className={`border-l-4 ${isCorrect ? 'border-l-emerald-500 bg-emerald-50' : 'border-l-amber-500 bg-amber-50'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isCorrect ? 'Correct!' : 'Not Quite — See Explanation'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{question.explanation}</p>
                  </CardContent>
                </Card>
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={handleNextQuestion}
                    className={`${accentBtn} text-white gap-2`}
                  >
                    {currentQuestion < scenario.questions.length - 1 ? (
                      <>Next Question <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>See Results <Trophy className="w-4 h-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== RESULTS PHASE ==================== */}
        {phase === 'results' && (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className={`w-5 h-5 ${accentText}`} />
                Simulation Results
              </DialogTitle>
              <DialogDescription>{scenario.title} — Performance Summary</DialogDescription>
            </DialogHeader>

            {/* Overall Score */}
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center"
              >
                <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${
                  overallPct >= 80 ? 'border-emerald-400 bg-emerald-50' :
                  overallPct >= 60 ? 'border-amber-400 bg-amber-50' :
                  'border-red-400 bg-red-50'
                }`}>
                  <div>
                    <p className={`text-3xl font-bold ${getScoreColor(overallPct)}`}>{overallPct}%</p>
                    <p className="text-xs text-gray-500">Overall</p>
                  </div>
                </div>
              </motion.div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {overallPct >= 80 && <span className="text-sm text-emerald-600 font-medium">Excellent Performance!</span>}
                {overallPct >= 60 && overallPct < 80 && <span className="text-sm text-amber-600 font-medium">Good Effort — Keep Improving!</span>}
                {overallPct < 60 && <span className="text-sm text-red-500 font-medium">Room for Growth — Practice More!</span>}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Communication', score: commPct, icon: MessageSquare, color: 'emerald' },
                { label: 'Technical', score: techPct, icon: Wrench, color: 'teal' },
                { label: 'Product', score: prodPct, icon: Package, color: 'amber' },
                { label: 'Sales', score: salesPct, icon: DollarSign, color: 'rose' },
              ].map((cat) => (
                <Card key={cat.label} className="text-center p-3">
                  <cat.icon className={`w-5 h-5 mx-auto mb-1 text-${cat.color}-600`} />
                  <p className={`text-2xl font-bold ${getScoreColor(cat.score)}`}>{cat.score}%</p>
                  <p className="text-xs text-gray-500 mb-2">{cat.label}</p>
                  <Progress value={cat.score} className={`h-1.5 ${getProgressColor(cat.score)}`} />
                </Card>
              ))}
            </div>

            {/* Correct Answers Summary */}
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-600">
                  {answers.filter((a, i) => a === scenario.questions[i]?.correctAnswer).length} Correct
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-600">
                  {answers.filter((a, i) => a !== scenario.questions[i]?.correctAnswer).length} Incorrect
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-600">{scenario.questions.length} Total</span>
              </div>
            </div>

            {/* AI Feedback */}
            <Card className={accentFeedbackCard}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`w-4 h-4 ${accentText}`} />
                  <span className={`text-sm font-semibold ${accentTextStrong}`}>AI Performance Feedback</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {generateAIFeedback(
                    { communication: commPct, technical: techPct, productKnowledge: prodPct, sales: salesPct },
                    overallPct,
                    isRoofing
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Question-by-Question Review */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <ChevronRight className="w-4 h-4" /> Question Review
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {scenario.questions.map((q, i) => {
                  const userAnswer = answers[i]
                  const wasCorrect = userAnswer === q.correctAnswer
                  return (
                    <div key={i} className={`p-2 rounded-lg text-xs border-l-3 ${wasCorrect ? 'border-l-emerald-400 bg-emerald-50/50' : 'border-l-red-300 bg-red-50/50'}`}>
                      <div className="flex items-start gap-2">
                        {wasCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-gray-700 font-medium">Q{i + 1}: {q.question.slice(0, 80)}...</p>
                          {!wasCorrect && (
                            <p className="text-gray-500 mt-0.5">
                              Your answer: {optionLabels[userAnswer]} — Correct: {optionLabels[q.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPhase('intro')
                  setCurrentQuestion(0)
                  setSelectedAnswer(null)
                  setAnswers([])
                  setScores({ communication: 0, technical: 0, productKnowledge: 0, sales: 0 })
                  setMaxScores({ communication: 0, technical: 0, productKnowledge: 0, sales: 0 })
                }}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
              <Button
                onClick={async () => {
                  await saveAttempt()
                  handleClose()
                }}
                disabled={saving}
                className={`${accentBtn} text-white gap-2`}
              >
                {saving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Star className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save & Close'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
