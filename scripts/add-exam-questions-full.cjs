// =====================================================================
// LAXREE LEARNING CENTER — Add 800 Exam Questions
// 8 exams × (75 MCQ + 25 SHORT_ANSWER) = 800 questions
// Exams: INBOUND_SALES × {PRE,MID,HARD,EXTRA_HARD}, FIELD_SALES × {...}
// =====================================================================

process.env.DATABASE_URL =
  'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.DIRECT_URL =
  'postgresql://neondb_owner:npg_vRfGm1u6XDtq@ep-fragrant-brook-adhkdpuc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ---------------------------------------------------------------------
// PRODUCT CATALOG
// ---------------------------------------------------------------------
const PRODUCTS = [
  {
    name: 'Minibar',
    models: ['LRMB-126 (20L)', 'LRMB-128 (40L)', 'LRMB-129 (40L Glass)', 'LRMB-131 (35L)', 'LRMB-132 (45L Compressor)'],
    priceRange: 'Rs.6,700 - Rs.9,800',
    headlineFeature: 'silent thermoelectric cooling',
    features: ['silent thermoelectric cooling', 'energy-efficient compressor', 'LED interior light', 'glass door for visibility', 'auto-defrost', 'adjustable thermostat'],
    benefits: ['additional guest revenue', 'silent operation for guest comfort', 'energy savings vs older models', 'premium in-room experience'],
    competitionEdge: 'silent operation vs noisy compressor minibars',
  },
  {
    name: 'Safe Box',
    models: ['LRSB-201 (Essential)', 'LRSB-206 (Standard)', 'LRSB-209 (Orbita)', 'LRSB-214 (Premium Laptop)'],
    priceRange: 'Rs.1,700 - Rs.5,220',
    headlineFeature: 'electronic keypad with master code',
    features: ['electronic keypad lock', '4x AA battery powered', 'laptop-sized interior', 'LED display', 'dual lock system', 'emergency override key', 'bolt-down kit'],
    benefits: ['guest peace of mind', 'reduces hotel liability for lost valuables', 'easy code reset per guest', 'premium brand positioning'],
    competitionEdge: 'bolt-down security and audit-ready master codes',
  },
  {
    name: 'RFID Door Lock',
    models: ['LRFD-609 (Aluminium)', 'LRFD-610 (Zinc Alloy)', 'LRFD-611 (Stainless Steel)'],
    priceRange: 'Rs.4,110 - Rs.8,320',
    headlineFeature: 'keyless RFID card entry',
    features: ['RFID card/keyfob entry', 'mechanical key override', 'low battery indicator', 'audit trail of entries', 'master key for housekeeping', 'toughened steel body'],
    benefits: ['enhanced security vs traditional keys', 'guest convenience (keyless)', 'operational efficiency for staff', 'eliminates key cutting costs'],
    competitionEdge: 'audit trail + master key system vs simple card locks',
  },
  {
    name: 'Electric Kettle',
    models: ['LRWT-143 (0.6L)', 'LRWT-145 (0.6L Matt)', 'LRWT-150 (0.8L Strix)', 'LRWT-155 (1L)', 'LRWT-156 (1L SS 304)'],
    priceRange: 'Rs.560 - Rs.1,400',
    headlineFeature: 'auto-shut off safety',
    features: ['auto-shut off', 'Strix UK-made controller', 'SS 304 body', 'matt finish', 'anti-theft tether tray (LRWT-158)', 'boil-dry protection'],
    benefits: ['guest safety via auto-shut off', 'premium look and feel', 'long-lasting durability', 'anti-theft protection'],
    competitionEdge: 'Strix controller + anti-theft tray vs generic kettles',
  },
  {
    name: 'Hair Dryer',
    models: ['LRHD-276 (Wall Mount)', 'LRHD-278 (Foldable)'],
    priceRange: 'Rs.1,035 - Rs.1,744',
    headlineFeature: 'wall mount with shaver socket',
    features: ['1300W power', 'wall mount with shaver socket', 'foldable handle', 'two heat/speed settings', 'overheat protection'],
    benefits: ['space-saving for hotel bathrooms', 'guest convenience', 'energy-efficient', 'eliminates need for personal dryers'],
    competitionEdge: 'shaver socket + wall mount combo vs consumer dryers',
  },
  {
    name: 'Soap Dispenser',
    models: ['LRWA-373 (Automatic ABS)', 'LRWA-374 (Manual SS)'],
    priceRange: 'Rs.780 - Rs.1,136',
    headlineFeature: 'touchless sensor operation',
    features: ['automatic sensor operation', 'ABS / SS body', 'refillable reservoir', 'wall-mounted', 'low-battery indicator'],
    benefits: ['hygienic touchless operation', 'reduces amenity waste by 40%', 'lower cost per room-night', 'eco-friendly'],
    competitionEdge: 'sensor hygiene + 40% waste reduction vs bottles',
  },
  {
    name: 'Digital Signage',
    models: ['LRDS-101 (10in)', 'LRDS-155 (15in)', 'LRDS-215 (21in)'],
    priceRange: 'Rs.8,500 - Rs.22,000',
    headlineFeature: 'centralized content management',
    features: ['HD display', 'centralized content management', 'Wi-Fi enabled', 'schedule-based playlists', 'remote update', 'cloud dashboard'],
    benefits: ['advertising revenue', 'modern guest communication', 'reduced printing costs', 'brand consistency across properties'],
    competitionEdge: 'cloud CMS + ad-revenue model vs static signage',
  },
  {
    name: 'Housekeeping Trolley',
    models: ['LRHT-200 (Standard)', 'LRHT-250 (Large)'],
    priceRange: 'Rs.14,000 - Rs.22,000',
    headlineFeature: 'modular folding shelves',
    features: ['foldable shelves', 'waste bag holder', 'locking cabinet', 'smooth-rolling castors', 'modular design'],
    benefits: ['improved housekeeping efficiency', 'professional appearance in corridors', 'reduced staff fatigue', 'secure linen storage'],
    competitionEdge: 'locking cabinet + modular design vs basic carts',
  },
  {
    name: 'LED Mirror',
    models: ['LRM-301 (Round)', 'LRM-302 (Square)'],
    priceRange: 'Rs.3,200 - Rs.5,800',
    headlineFeature: 'anti-fog + LED lighting',
    features: ['LED lighting', 'anti-fog function', 'touch sensor switch', 'energy-efficient', 'IP44 water resistance'],
    benefits: ['premium bathroom aesthetic', 'guest convenience (no fog after shower)', 'energy savings', 'long LED lifespan (50,000 hrs)'],
    competitionEdge: 'anti-fog + 50,000 hr LED vs plain mirrors',
  },
  {
    name: 'Luggage Rack',
    models: ['LRLR-401 (Folding Wood)', 'LRLR-402 (Steel)'],
    priceRange: 'Rs.1,100 - Rs.1,850',
    headlineFeature: 'foldable space-saving design',
    features: ['foldable for storage', 'sturdy straps', 'non-slip feet', 'premium wood finish'],
    benefits: ['guest convenience', 'protects luggage from floor dirt', 'space-saving storage', 'durability'],
    competitionEdge: 'folding + premium finish vs fixed racks',
  },
  {
    name: 'Hangers',
    models: ['LRH-501 (Wooden)', 'LRH-502 (Velvet)'],
    priceRange: 'Rs.90 - Rs.180',
    headlineFeature: 'anti-theft detachable ring',
    features: ['anti-theft ring', 'velvet non-slip surface', 'wooden construction', 'chrome hook'],
    benefits: ['uniform closet appearance', 'reduces theft via detachable ring', 'premium guest experience', 'durability'],
    competitionEdge: 'detachable anti-theft ring vs plain hangers',
  },
  {
    name: 'Rollaway Bed',
    models: ['LRRB-601 (Standard)'],
    priceRange: 'Rs.6,500 - Rs.8,200',
    headlineFeature: 'folding frame with wheels',
    features: ['folding frame', 'comfortable mattress', 'wheels for mobility', 'storage-friendly'],
    benefits: ['extra guest accommodation', 'revenue from extra-bed charge', 'space-efficient storage', 'quick deployment'],
    competitionEdge: 'folding + wheel mobility vs cots',
  },
  {
    name: 'Washroom Amenities',
    models: ['LRWA-700 (Soap 25g)', 'LRWA-701 (Shampoo 30ml)', 'LRWA-702 (Lotion 30ml)'],
    priceRange: 'Rs.18 - Rs.45 per piece',
    headlineFeature: 'custom-branded packaging',
    features: ['branded packaging', 'custom logo option', 'eco-friendly formulations', 'tamper-evident seal'],
    benefits: ['brand reinforcement', 'guest satisfaction', 'recurring revenue stream', 'custom branding'],
    competitionEdge: 'custom branding + tamper-evident vs generic amenities',
  },
  {
    name: 'Add-on Tray',
    models: ['LRWT-158 (Anti-theft Tray)', 'LRWT-162 (Leatherette Tray)', 'LRDB-801 (Dustbin 12L)'],
    priceRange: 'Rs.706 - Rs.1,425',
    headlineFeature: 'anti-theft tethering',
    features: ['anti-theft tethering', 'premium leatherette finish', 'steel/plastic construction'],
    benefits: ['completes room aesthetic', 'reduces theft losses', 'added perceived value', 'low-cost upsell opportunity'],
    competitionEdge: 'tethered anti-theft vs loose trays',
  },
];

const HOTEL_TYPES = [
  { type: '5-star business hotel', arr: 'Rs.8,000+', rooms: '150-300', priority: 'premium guest experience' },
  { type: '4-star business hotel', arr: 'Rs.4,500-7,000', rooms: '100-200', priority: 'value with quality' },
  { type: 'luxury resort', arr: 'Rs.12,000+', rooms: '80-200', priority: 'wow factor and exclusivity' },
  { type: 'boutique hotel', arr: 'Rs.5,000-9,000', rooms: '30-80', priority: 'design-led uniqueness' },
  { type: 'budget business hotel', arr: 'Rs.2,000-3,500', rooms: '60-150', priority: 'cost optimization' },
  { type: 'airport transit hotel', arr: 'Rs.3,500-6,000', rooms: '80-200', priority: 'durability and quick turnaround' },
];

const BUYER_PERSONAS = [
  { role: 'Hotel Owner', concern: 'ROI and payback period', decisionPower: 'final decision on budget' },
  { role: 'General Manager (GM)', concern: 'guest satisfaction scores and ops', decisionPower: 'recommends to owner' },
  { role: 'Procurement Manager', concern: 'vendor comparison and price', decisionPower: 'evaluates and negotiates' },
  { role: 'Interior Designer', concern: 'aesthetics and design fit', decisionPower: 'specifies products in design' },
  { role: 'Housekeeping Manager', concern: 'staff efficiency and maintenance', decisionPower: 'influences ops products' },
  { role: 'Project Manager (pre-opening)', concern: 'timeline and single-vendor convenience', decisionPower: 'coordinates during build' },
];

const OBJECTIONS = [
  { objection: 'Your minibar is too expensive compared to local brands', topic: 'price' },
  { objection: 'We already use a competitor for RFID locks', topic: 'incumbent' },
  { objection: 'We need time to think about it', topic: 'stall' },
  { objection: 'Your safe box prices are higher than what we saw online', topic: 'price' },
  { objection: 'Our current kettle supplier offers 30% discount', topic: 'price' },
  { objection: 'We had a bad experience with another vendor last year', topic: 'trust' },
  { objection: 'Management has frozen all capex this quarter', topic: 'budget' },
  { objection: 'We want to standardize across 10 properties, can you match competitor pricing?', topic: 'volume' },
  { objection: 'The dispenser looks complicated for housekeeping staff', topic: 'usability' },
  { objection: 'We need 5-year warranty instead of 1-year', topic: 'warranty' },
  { objection: 'Payment terms of 30 days are too short for us', topic: 'payment' },
  { objection: 'Your lead time of 3 weeks is too long for our renovation', topic: 'delivery' },
];

const COMPETITORS = [
  { name: 'Quba', strength: 'established hotel supplier', weakness: 'limited to a few categories' },
  { name: 'local generic brands', strength: 'lowest upfront price', weakness: 'no service network or warranty' },
  { name: 'imported brands like Orbita', strength: 'international brand recognition', weakness: 'high import cost and slow spares' },
  { name: 'online marketplace sellers', strength: 'wide variety and quick delivery', weakness: 'no after-sales support or commercial grade' },
];

// ---------------------------------------------------------------------
// STAGE CONFIG — each stage has its own scenario framing
// ---------------------------------------------------------------------
const STAGE_CONFIG = {
  PRE: {
    label: 'Foundation',
    difficulty: 'easy',
    scenarioPrefix: '',
    questionStyle: 'basic recall',
    framing: 'At a foundational level, ',
    scenario: 'in your first conversation',
  },
  MID: {
    label: 'Intermediate',
    difficulty: 'medium',
    scenarioPrefix: 'In a typical mid-stage evaluation, ',
    questionStyle: 'application and structured pitching',
    framing: 'When the buyer is mid-funnel, ',
    scenario: 'after they have shortlisted Laxree',
  },
  HARD: {
    label: 'Advanced',
    difficulty: 'hard',
    scenarioPrefix: 'In a competitive bid situation, ',
    questionStyle: 'complex scenarios and competitive positioning',
    framing: 'When competing head-to-head, ',
    scenario: 'against two other vendors',
  },
  EXTRA_HARD: {
    label: 'Expert',
    difficulty: 'hard',
    scenarioPrefix: 'In a multi-property, multi-stakeholder negotiation, ',
    questionStyle: 'high-stakes negotiation and strategic accounts',
    framing: 'In a high-stakes strategic account, ',
    scenario: 'across 5+ properties with owner + GM + procurement + designer in the room',
  },
};

const EXAM_TYPE_CONTEXT = {
  INBOUND_SALES: {
    label: 'Inbound (phone-based)',
    shortContext: 'on an inbound call',
    longContext: 'during a phone inquiry from the hotel',
    followupContext: 'on a follow-up call',
    channel: 'phone',
    skillFocus: 'phone etiquette and quick qualification',
  },
  FIELD_SALES: {
    label: 'Field (on-site)',
    shortContext: 'during an on-site hotel visit',
    longContext: 'in a face-to-face meeting at the hotel',
    followupContext: 'on a follow-up site visit',
    channel: 'in-person meeting',
    skillFocus: 'reading body language and on-site demos',
  },
};

// ---------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------
function pick(arr, idx) {
  return arr[((idx % arr.length) + arr.length) % arr.length];
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ---------------------------------------------------------------------
// MCQ GENERATORS — each returns a question object
// Each generator weaves stage + examType context into question text,
// ensuring uniqueness across (examType, stage) combinations.
//
// Each generator takes: (examType, stage, p, persona, hotel, comboIdx)
//   comboIdx: a global index that ensures variation across calls
// ---------------------------------------------------------------------

const MCQ_GENERATORS = [
  // ====== TOPIC 1: Product Knowledge (5 generators) ======
  (et, st, p, persona, hotel, ci) => {
    const f = pick(p.features, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, a ${persona.role} from a ${hotel.type} asks about Laxree ${p.name}. Which feature should you highlight to address their concern about ${persona.concern.toLowerCase()}?`,
        `${STAGE_CONFIG[st].framing}what is the headline feature of Laxree ${p.name} that you would emphasise ${EXAM_TYPE_CONTEXT[et].longContext}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which Laxree ${p.name} feature directly supports ${hotel.priority} for a ${hotel.type}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} wants to understand ${p.name} capabilities. ${EXAM_TYPE_CONTEXT[et].shortContext}, which feature do you lead with?`,
        `${STAGE_CONFIG[st].framing}which ${p.name} feature differentiates Laxree from generic alternatives ${EXAM_TYPE_CONTEXT[et].longContext}?`,
      ],
      ci
    );
    const wrong = ['Wi-Fi connectivity module', 'Bluetooth speaker add-on', 'Voice assistant integration', 'Augmented reality display'];
    return {
      question: v,
      optionA: f,
      optionB: pick(wrong, ci),
      optionC: pick(wrong, ci + 1),
      optionD: pick(wrong, ci + 2),
      correctAnswer: 'A',
      explanation: `${cap(f)} is the right Laxree ${p.name} feature to highlight for a ${persona.role} whose concern is ${persona.concern.toLowerCase()}.`,
      category: 'Product Knowledge',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const model = pick(p.models, ci);
    const wrong = ['LR-GENERIC-001', 'NonBrand-XYZ', 'IMPORTED-X9', 'LOCAL-CHEAP-3', 'FakeModel-99'];
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, which of these is a valid Laxree ${p.name} model?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} asks for the ${p.name} model list. Which designation is correct?`,
        `${STAGE_CONFIG[st].scenarioPrefix}when quoting ${p.name} for a ${hotel.type}, which model number should appear on the formal quote?`,
        `${STAGE_CONFIG[st].framing}which Laxree ${p.name} model is appropriate to recommend ${EXAM_TYPE_CONTEXT[et].longContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: model,
      optionB: pick(wrong, ci),
      optionC: pick(wrong, ci + 1),
      optionD: pick(wrong, ci + 2),
      correctAnswer: 'A',
      explanation: `${model} is a current Laxree ${p.name} SKU. Always use exact model designations on quotes.`,
      category: 'Product Knowledge',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const benefit = pick(p.benefits, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}what is the PRIMARY guest-facing benefit of Laxree ${p.name}?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} at a ${hotel.type} asks: "Why should guests care about your ${p.name}?" Best answer?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which benefit of ${p.name} resonates MOST with a ${persona.role} of a ${hotel.type}?`,
        `${STAGE_CONFIG[st].framing}${EXAM_TYPE_CONTEXT[et].shortContext}, how do you frame the ${p.name} benefit for a buyer focused on ${hotel.priority}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: 'Lower warehouse cost for Laxree',
      optionB: benefit,
      optionC: 'Faster delivery to distributor',
      optionD: 'Higher distributor margin',
      correctAnswer: 'B',
      explanation: `${cap(benefit)} is the primary guest-facing benefit of Laxree ${p.name}, especially for a ${hotel.type} focused on ${hotel.priority}.`,
      category: 'Product Knowledge',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}what is the price band of the Laxree ${p.name} range that you would quote ${EXAM_TYPE_CONTEXT[et].longContext}?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} wants a quick price band for ${p.name} budgeting. What do you share?`,
        `${STAGE_CONFIG[st].scenarioPrefix}when asked about ${p.name} pricing for a ${hotel.type}, what is the accurate answer?`,
        `${STAGE_CONFIG[st].framing}which price range should you cite for Laxree ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: p.priceRange,
      optionB: 'Rs.50 - Rs.100 (consumer grade)',
      optionC: 'Rs.1,00,000+ (luxury import only)',
      optionD: 'Free with subscription',
      correctAnswer: 'A',
      explanation: `Laxree ${p.name} ranges ${p.priceRange}, positioning it as commercial-grade hotel equipment.`,
      category: 'Product Knowledge',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}Laxree ${p.name} is engineered for which market segment?`,
        `${STAGE_CONFIG[st].framing}why is Laxree ${p.name} NOT sold via retail supermarkets?`,
        `${STAGE_CONFIG[st].scenarioPrefix}what differentiates Laxree ${p.name} from a consumer-grade equivalent ${EXAM_TYPE_CONTEXT[et].longContext}?`,
        `${STAGE_CONFIG[st].framing}how would you position ${p.name} as commercial-grade ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: 'Households only',
      optionB: 'Commercial hotel use (hospitality-grade, with service network)',
      optionC: 'Office breakrooms only',
      optionD: 'Hospital ICUs only',
      correctAnswer: 'B',
      explanation: `Laxree ${p.name} is hospitality-grade — commercial durability, safety certifications, and PAN-India service network.`,
      category: 'Product Knowledge',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },

  // ====== TOPIC 2: Sales Process — Opening & Discovery (4 generators) ======
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, a ${persona.role} from a ${hotel.type} asks about ${p.name}. What is your opening move?`,
        `${STAGE_CONFIG[st].framing}what is the FIRST thing you should establish when a ${persona.role} inquires about ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} from a ${hotel.type} says "I want ${p.name}." ${EXAM_TYPE_CONTEXT[et].shortContext}, how do you respond?`,
        `${STAGE_CONFIG[st].framing}which opening line builds the MOST rapport with a ${persona.role} ${EXAM_TYPE_CONTEXT[et].longContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: 'Jump straight into price',
      optionB: 'Acknowledge their interest, introduce yourself, and ask one qualifying question about their property',
      optionC: 'Read the entire product catalog',
      optionD: 'Put them on hold',
      correctAnswer: 'B',
      explanation: `A strong opening acknowledges, introduces, and qualifies. This works for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext} too.`,
      category: 'Sales Process - Opening & Discovery',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, what is the BEST discovery question to ask a ${persona.role} inquiring about ${p.name}?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} from a ${hotel.type} with ${hotel.rooms} rooms inquires about ${p.name}. Which discovery question sizes the deal?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which ${p.name} qualifying question reveals the decision-making process of a ${persona.role}?`,
        `${STAGE_CONFIG[st].framing}how would you uncover a ${persona.role}'s urgency for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: '"When can you pay?"',
      optionB: `"How many rooms does your property have, and what is your current solution for ${p.name.toLowerCase()}?"`,
      optionC: '"Do you know our company?"',
      optionD: '"Can I get your email?"',
      correctAnswer: 'B',
      explanation: `Discovery questions about room count and current solution reveal budget, urgency, and competitive landscape for ${p.name}.`,
      category: 'Sales Process - Opening & Discovery',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, the ${persona.role} is hesitant to share their budget for ${p.name}. What is the BEST way to uncover it?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} from a ${hotel.type} asks about ${p.name}. How do you uncover budget without asking directly?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which approach BEST surfaces the ${persona.role}'s ${p.name} budget ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].framing}what is the WEAKEST way to uncover budget for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: '"Tell me your budget or I disconnect"',
      optionB: `"Typically our ${p.name} projects for a ${hotel.type} range from ${p.priceRange} per room — does that align with what you had in mind?"`,
      optionC: '"Budget does not matter"',
      optionD: '"I will charge whatever I want"',
      correctAnswer: 'B',
      explanation: `Anchoring with a ${hotel.type}-specific range (${p.priceRange}) softens the budget question.`,
      category: 'Sales Process - Opening & Discovery',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} from a ${hotel.type} says "We might need ${p.name} sometime next year." ${EXAM_TYPE_CONTEXT[et].shortContext}, what is your BEST follow-up?`,
        `${STAGE_CONFIG[st].framing}what should you AVOID in the first 60 seconds ${EXAM_TYPE_CONTEXT[et].shortContext} for ${p.name}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which ${p.name} follow-up question uncovers the project trigger ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].framing}how do you keep a "maybe next year" ${p.name} inquiry warm ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: '"Call me when you are ready"',
      optionB: `"What triggers the project next year — budget cycle, renovation phase, or vendor contract expiry?"`,
      optionC: '"Next year is too far"',
      optionD: '"I will not follow up"',
      correctAnswer: 'B',
      explanation: `Identifying the trigger event (budget/renovation/vendor expiry) lets you time ${p.name} follow-ups effectively.`,
      category: 'Sales Process - Opening & Discovery',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },

  // ====== TOPIC 3: Pitching & Value Proposition (4 generators) ======
  (et, st, p, persona, hotel, ci) => {
    const benefit = pick(p.benefits, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}how should you pitch ${p.name} to a ${persona.role} at a ${hotel.type} ${EXAM_TYPE_CONTEXT[et].longContext}?`,
        `${STAGE_CONFIG[st].framing}which is the BEST value proposition for ${p.name} targeted at a ${hotel.type}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, the ${persona.role} asks why Laxree ${p.name} over a cheaper alternative. Best response?`,
        `${STAGE_CONFIG[st].framing}what is the WEAKEST pitch opener for ${p.name} to a ${hotel.type} ${persona.role}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: 'Read spec sheets word-for-word',
      optionB: `Lead with ${benefit} for ${hotel.priority}, backed by ${p.competitionEdge}`,
      optionC: 'Open with the lowest price',
      optionD: 'List every model number',
      correctAnswer: 'B',
      explanation: `A value-led pitch aligns ${benefit} with ${hotel.priority} of a ${hotel.type}. Feature-dumps lose buyers.`,
      category: 'Pitching & Value Proposition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const comp = pick(COMPETITORS, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}when differentiating Laxree ${p.name} from ${comp.name}, what should you emphasise to a ${persona.role}?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} mentions ${comp.name} offers ${p.name}-like products cheaper. How do you respond?`,
        `${STAGE_CONFIG[st].scenarioPrefix}what is Laxree ${p.name}'s strongest competitive advantage vs ${comp.name} for a ${hotel.type}?`,
        `${STAGE_CONFIG[st].framing}how do you counter a ${persona.role} who is comparing Laxree ${p.name} vs ${comp.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `Badmouth ${comp.name} aggressively`,
      optionB: `Position Laxree's ${p.competitionEdge} against ${comp.name}'s ${comp.weakness}`,
      optionC: `Claim ${comp.name} is going bankrupt`,
      optionD: 'Refuse to discuss competitors',
      correctAnswer: 'B',
      explanation: `Factual differentiation (${p.competitionEdge} vs ${comp.weakness}) keeps the conversation professional and credible.`,
      category: 'Pitching & Value Proposition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const benefit = pick(p.benefits, ci);
    const feature = pick(p.features, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}which is the BEST elevator pitch for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].framing}how do you tailor a ${p.name} pitch to a ${persona.role} whose primary concern is ${persona.concern}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which is the BEST 30-second ${p.name} opener for a ${hotel.type}?`,
        `${STAGE_CONFIG[st].framing}draft the strongest ${p.name} pitch for ${hotel.priority} at a ${hotel.type}.`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'We make ${p.name.toLowerCase()} and you should buy'`,
      optionB: `'Laxree ${p.name} delivers ${benefit} through ${feature} — purpose-built for commercial hotel use across India.'`,
      optionC: `'Our company was founded in...'`,
      optionD: `'${p.name} is a product we sell'`,
      correctAnswer: 'B',
      explanation: `A 30-second pitch needs benefit + differentiator + segment-fit: ${benefit} + ${feature} + commercial hotel use.`,
      category: 'Pitching & Value Proposition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, what is the BEST way to handle the ${persona.role}'s attention span during a ${p.name} pitch?`,
        `${STAGE_CONFIG[st].framing}which technique maintains engagement on ${p.name} ${EXAM_TYPE_CONTEXT[et].longContext}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}how do you keep a ${persona.role} engaged while explaining ${p.name} specs ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].framing}what is the WORST way to pace a ${p.name} pitch ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: 'Talk for 20 minutes non-stop',
      optionB: 'Open with a 30-second hook on benefits, then check in with a question every 60-90 seconds',
      optionC: 'Send a 200-page catalog and wait',
      optionD: 'Wait for them to ask each question',
      correctAnswer: 'B',
      explanation: `A 30-second hook + frequent check-ins maintains ${p.name} engagement without overwhelming.`,
      category: 'Pitching & Value Proposition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },

  // ====== TOPIC 4: Objection Handling (4 generators) ======
  (et, st, p, persona, hotel, ci) => {
    const obj = pick(OBJECTIONS, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, a ${persona.role} says: "${obj.objection}" about ${p.name}. What is the BEST response?`,
        `${STAGE_CONFIG[st].framing}when a ${persona.role} raises "${obj.objection}" about ${p.name}, what is the FIRST step?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which technique is MOST effective for handling "${obj.objection}" for ${p.name}?`,
        `${STAGE_CONFIG[st].framing}if "${obj.objection}" comes up about ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}, what is your WORST response?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'You are wrong'`,
      optionB: `'I understand — let me address that. Could we look at the total cost of ownership over 3 years?'`,
      optionC: `'We never compromise on price'`,
      optionD: `'Buy from someone else then'`,
      correctAnswer: 'B',
      explanation: `Acknowledge the (${obj.topic}) concern and pivot to TCO. Never argue directly for ${p.name}.`,
      category: 'Objection Handling',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} says: "Send me your best price for ${p.name} and I will compare." ${EXAM_TYPE_CONTEXT[et].shortContext}, how do you handle this?`,
        `${STAGE_CONFIG[st].framing}what is the BEST response to a ${persona.role} asking for a ${p.name} quote without context?`,
        `${STAGE_CONFIG[st].scenarioPrefix}how do you turn a "send me the price" ${p.name} request into a discovery opportunity?`,
        `${STAGE_CONFIG[st].framing}which is the WEAKEST response to a "send me pricing" request for ${p.name}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'Here is our lowest price — bye'`,
      optionB: `'Happy to send pricing. To make it meaningful, can you share room count, project timeline, and what you are comparing us on?'`,
      optionC: `'We don't share prices'`,
      optionD: `'Our price is final'`,
      correctAnswer: 'B',
      explanation: `Reframing "send me your best price" as discovery prevents ${p.name} commoditisation and gathers intel.`,
      category: 'Objection Handling',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} asks for a 40% discount on ${p.name}. What is the BEST response?`,
        `${STAGE_CONFIG[st].framing}when a ${persona.role} demands 40% off ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}, how do you respond?`,
        `${STAGE_CONFIG[st].scenarioPrefix}what is your counter to an aggressive ${p.name} discount demand?`,
        `${STAGE_CONFIG[st].framing}which is the WORST way to handle a 40%-off ${p.name} demand?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'Yes, sure'`,
      optionB: `'A 40% discount is not viable for commercial-grade ${p.name}. However, I can explore volume pricing or extended warranty bundles.'`,
      optionC: `'No discounts ever'`,
      optionD: `'I will check with my boss and call back'`,
      correctAnswer: 'B',
      explanation: `Decline politely, anchor on commercial-grade value, offer alternative value (volume/warranty) for ${p.name}.`,
      category: 'Objection Handling',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const feature = pick(p.features, ci);
    const benefit = pick(p.benefits, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} says: "Your ${p.name} has the same features as a cheaper brand." How do you respond ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].framing}if a ${persona.role} says "We tried Laxree ${p.name} 5 years ago and didn't like it," what is the BEST response?`,
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} pushes back: "Why should I trust Laxree for ${p.name}?" ${EXAM_TYPE_CONTEXT[et].shortContext}, best response?`,
        `${STAGE_CONFIG[st].framing}how do you counter a ${persona.role}'s claim that ${p.name} "is the same as cheaper brands" ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'No it doesn't'`,
      optionB: `'On paper some features overlap. The difference is ${feature} delivers ${benefit} in commercial use — cheaper brands fail within 6-12 months in hotels.'`,
      optionC: `'You don't know what you are talking about'`,
      optionD: `'Yes you are right'`,
      correctAnswer: 'B',
      explanation: `Acknowledge overlap on paper, then anchor on ${feature} → ${benefit} → commercial durability.`,
      category: 'Objection Handling',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },

  // ====== TOPIC 5: Negotiation & Closing (4 generators) ======
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, a ${persona.role} from a ${hotel.type} wants to close ${p.name} but asks for one last concession. What is the BEST approach?`,
        `${STAGE_CONFIG[st].framing}when negotiating ${p.name} price with a ${persona.role}, what is the WORST tactic?`,
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} insists on payment terms of 90 days for ${p.name}. What is your BEST counter?`,
        `${STAGE_CONFIG[st].framing}what is the MOST effective closing technique for ${p.name} with a ${hotel.type} ${persona.role}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'No more concessions'`,
      optionB: `'I can include free installation OR extend warranty by 6 months — which would you prefer?'`,
      optionC: `'I will give 30% off'`,
      optionD: `'Let me check and revert next week'`,
      correctAnswer: 'B',
      explanation: `Offering a value-add choice (installation vs warranty) instead of price discount preserves ${p.name} margin.`,
      category: 'Negotiation & Closing',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} wants a 3-year warranty on ${p.name} (standard is 1 year). How do you handle it?`,
        `${STAGE_CONFIG[st].framing}${EXAM_TYPE_CONTEXT[et].shortContext}, what is the BEST way to confirm a ${p.name} order with a ${persona.role}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}when closing ${p.name} for a ${hotel.type} renovation with a ${persona.role}, what additional element should you secure besides the order?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} says "I will sign the PO next month" for ${p.name}. What is your BEST closing tactic?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'No, 1 year only'`,
      optionB: `'3 years is unusual — I can offer 2 years if you commit to Laxree as single-vendor across ${p.name} plus 2 other categories, AND pay a 7% premium.'`,
      optionC: `'Sure, free 3-year warranty'`,
      optionD: `'We don't do warranties'`,
      correctAnswer: 'B',
      explanation: `Trade extended warranty for single-vendor commitment + premium. This grows the ${p.name} deal size and locks in the account.`,
      category: 'Negotiation & Closing',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}what is the BEST negotiation posture for ${p.name} with a ${persona.role} who is price-shopping ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} wants ${p.name} for 5 properties but wants per-property pricing. What is the BEST response?`,
        `${STAGE_CONFIG[st].scenarioPrefix}when finalising ${p.name} pricing for a ${hotel.type}, what should be EXPLICITLY stated in the proposal?`,
        `${STAGE_CONFIG[st].framing}which is the WEAKEST negotiation posture for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: 'Open at your lowest price',
      optionB: 'Open at full price with full value, trade concessions only against commitments (volume, multi-property, single-vendor)',
      optionC: 'Match competitor price blindly',
      optionD: 'Refuse to negotiate at all',
      correctAnswer: 'B',
      explanation: `Opening at full price + trading concessions for commitments keeps ${p.name} margin intact and grows deal size.`,
      category: 'Negotiation & Closing',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}which closing question BEST moves a ${persona.role} from "interested" to "committed" for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].framing}when securing a ${p.name} PO from a ${persona.role}, what written artefact should follow the verbal close?`,
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} wants to "sleep on" the ${p.name} decision. What is your BEST assumptive close?`,
        `${STAGE_CONFIG[st].framing}which closing technique PRESERVES ${p.name} margin while moving the deal forward?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'Buy now or never'`,
      optionB: `'Shall I schedule the ${p.name} delivery for the week of your renovation start, or the week after?'`,
      optionC: `'Begging them to sign'`,
      optionD: `'Wait for them to ask'`,
      correctAnswer: 'B',
      explanation: `Assumptive closing on ${p.name} delivery timing moves the conversation from "if" to "when" naturally.`,
      category: 'Negotiation & Closing',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },

  // ====== TOPIC 6: Industry Context & Competition (3 generators) ======
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}for a ${hotel.type} (ARR ${hotel.arr}, ${hotel.rooms} rooms) evaluating ${p.name}, what ROI angle resonates MOST?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} at a ${hotel.type} asks: "How does ${p.name} fit our property positioning?" Best answer?`,
        `${STAGE_CONFIG[st].scenarioPrefix}when a ${persona.role} mentions a ${hotel.type} is in pre-opening phase, what is the BEST angle for ${p.name}?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} of a ${hotel.type} is replacing an old ${p.name} setup. What is your BEST positioning?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'It looks nice'`,
      optionB: `Anchor on ${hotel.priority} and calculate payback vs current solution — energy savings, reduced amenity waste, or extra revenue per room-night`,
      optionC: `'It is trendy'`,
      optionD: `'Everyone is buying it'`,
      correctAnswer: 'B',
      explanation: `A ${hotel.type} at ARR ${hotel.arr} cares about ROI tied to ${hotel.priority}. Show payback in months.`,
      category: 'Industry Context & Competition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const comp = pick(COMPETITORS, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}what is the BEST way to handle a ${persona.role} comparing Laxree ${p.name} vs ${comp.name}?`,
        `${STAGE_CONFIG[st].framing}when the ${persona.role} mentions ${comp.name} offers ${p.name} alternatives at lower price, what is the BEST differentiator?`,
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} asks: "Why should I switch from ${comp.name} to Laxree ${p.name}?" Best response?`,
        `${STAGE_CONFIG[st].framing}how do you counter the "we are happy with ${comp.name}" objection for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'${cap(comp.name)} is terrible'`,
      optionB: `'I respect ${comp.name} for ${comp.strength}. For your ${hotel.type}, Laxree ${p.name} wins on ${p.competitionEdge} and PAN-India service.'`,
      optionC: `'Do not buy from them'`,
      optionD: `'I have never heard of them'`,
      correctAnswer: 'B',
      explanation: `Acknowledge competitor strength, then differentiate on ${p.competitionEdge} + service. Buyers distrust badmouthing.`,
      category: 'Industry Context & Competition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}how does ARR (${hotel.arr} for a ${hotel.type}) influence your ${p.name} pitch?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} at a ${hotel.type} (renovating ${hotel.rooms} rooms) asks about ${p.name} for partial rollout. What is your BEST advice?`,
        `${STAGE_CONFIG[st].scenarioPrefix}when discussing ${p.name} with a ${persona.role} of a budget business hotel (ARR Rs.2,000-3,500), what angle wins?`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} mentions their ${hotel.type} competes on ${hotel.priority}. How do you position ${p.name} to support that strategy?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'ARR is irrelevant'`,
      optionB: `Higher ARR = guest experience priority; lower ARR = ROI/cost priority. For a ${hotel.type} at ${hotel.arr}, lead with ${hotel.priority}.`,
      optionC: `'Always pitch the same way'`,
      optionD: `'Higher ARR means always discount'`,
      correctAnswer: 'B',
      explanation: `ARR shapes pitch angle: high-ARR properties value experience; budget properties value ROI.`,
      category: 'Industry Context & Competition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },

  // ====== TOPIC 7: Customer Service & After-Sales (3 generators) ======
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} asks about after-sales support for ${p.name}. What is the BEST response?`,
        `${STAGE_CONFIG[st].framing}how do you position Laxree's PAN-India service network for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which after-sales commitment MOST reassures a ${persona.role} buying ${p.name}?`,
        `${STAGE_CONFIG[st].framing}what is the WORST after-sales promise to make for ${p.name}?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'We don't offer service'`,
      optionB: `'Laxree offers PAN-India service with 48-hour response for ${p.name}, dedicated service coordinator, and spares inventory in 12 regional hubs.'`,
      optionC: `'We will figure it out if something breaks'`,
      optionD: `'Service is the hotel's responsibility'`,
      correctAnswer: 'B',
      explanation: `PAN-India service + 48-hour SLA + spares inventory is the strongest after-sales position for ${p.name}.`,
      category: 'Customer Service & After-Sales',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} reports a ${p.name} issue at a ${hotel.type}. What is the BEST first response?`,
        `${STAGE_CONFIG[st].framing}how do you handle a warranty claim for ${p.name} ${EXAM_TYPE_CONTEXT[et].shortContext}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}what is the BEST way to convert a ${p.name} service issue into a long-term relationship?`,
        `${STAGE_CONFIG[st].framing}which after-sales metric should you track for ${p.name} accounts?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'Call us next month'`,
      optionB: `'Acknowledge within 2 hours, dispatch technician within 48 hours, and follow up post-resolution to confirm satisfaction with ${p.name}.'`,
      optionC: `'It is not our problem'`,
      optionD: `'Replace the entire order'`,
      correctAnswer: 'B',
      explanation: `Rapid acknowledge + dispatch + post-resolution follow-up turns ${p.name} issues into trust-builders.`,
      category: 'Customer Service & After-Sales',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}what is the BEST proactive after-sales touchpoint for ${p.name} at a ${hotel.type}?`,
        `${STAGE_CONFIG[st].framing}how do you structure a ${p.name} preventive maintenance plan for a ${hotel.type}?`,
        `${STAGE_CONFIG[st].scenarioPrefix}which after-sales initiative reduces ${p.name} warranty claims MOST?`,
        `${STAGE_CONFIG[st].framing}how do you upsell ${p.name} upgrades via after-sales touchpoints?`,
      ],
      ci
    );
    return {
      question: v,
      optionA: `'Wait for complaints to come in'`,
      optionB: `Quarterly preventive maintenance visit + annual product-health audit + housekeeping retraining refresh on ${p.name}.`,
      optionC: `'Annual phone call only'`,
      optionD: `'Send an email and hope'`,
      correctAnswer: 'B',
      explanation: `Quarterly preventive maintenance + annual audit + retraining reduces ${p.name} claims and surfaces upsell opportunities.`,
      category: 'Customer Service & After-Sales',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
];

// ---------------------------------------------------------------------
// SHORT ANSWER GENERATORS (5 generators)
// ---------------------------------------------------------------------
const SA_GENERATORS = [
  (et, st, p, persona, hotel, ci) => {
    const feature = pick(p.features, ci);
    const benefit = pick(p.benefits, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}${EXAM_TYPE_CONTEXT[et].shortContext}, explain the headline feature of Laxree ${p.name} and why it matters to a ${persona.role} in 1-2 sentences.`,
        `${STAGE_CONFIG[st].framing}a ${persona.role} asks about ${p.name} feature-to-benefit mapping. Respond in 2 sentences.`,
        `${STAGE_CONFIG[st].scenarioPrefix}describe how Laxree ${p.name} addresses ${hotel.priority} for a ${hotel.type}. 2 sentences.`,
        `${STAGE_CONFIG[st].framing}in 1-2 sentences, connect ${p.name}'s ${feature} to a tangible benefit for ${persona.role}.`,
      ],
      ci
    );
    return {
      question: v,
      correctAnswer: `Laxree ${p.name} offers ${p.headlineFeature}, which delivers ${benefit} — directly supporting ${hotel.priority} for a ${hotel.type}.`,
      acceptableAnswers: JSON.stringify([p.headlineFeature.split(' ')[0], benefit.split(' ')[0], hotel.priority.split(' ')[0], 'guest', 'hotel']),
      explanation: `Always translate ${p.name} features into guest-experience benefits for the ${persona.role}.`,
      category: 'Product Knowledge',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} from a ${hotel.type} calls ${EXAM_TYPE_CONTEXT[et].shortContext} inquiring about ${p.name}. Write your opening 2 sentences.`,
        `${STAGE_CONFIG[st].framing}draft a discovery question for ${p.name} to a ${persona.role} at a ${hotel.type}.`,
        `${STAGE_CONFIG[st].scenarioPrefix}write your response to "send me a quote for ${p.name}" that qualifies without refusing.`,
        `${STAGE_CONFIG[st].framing}draft a budget-discovery question for ${p.name} without asking for budget directly.`,
      ],
      ci
    );
    return {
      question: v,
      correctAnswer: `Thank you for reaching out. To recommend the right ${p.name} model for your ${hotel.type} with ${hotel.rooms} rooms, may I know if this is for renovation, pre-opening, or replacement — and what timeline you are targeting?`,
      acceptableAnswers: JSON.stringify(['thank you', 'rooms', 'renovation', 'pre-opening', 'replacement', 'timeline', p.name.toLowerCase()]),
      explanation: `Discovery for ${p.name} should qualify room count, project driver, and timeline — never send a blind quote.`,
      category: 'Sales Process - Opening & Discovery',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const benefit = pick(p.benefits, ci);
    const feature = pick(p.features, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}draft a 30-second elevator pitch for Laxree ${p.name} to a ${persona.role} at a ${hotel.type}.`,
        `${STAGE_CONFIG[st].framing}write the opening line of a ${p.name} pitch ${EXAM_TYPE_CONTEXT[et].shortContext} with a ${hotel.type} ${persona.role}.`,
        `${STAGE_CONFIG[st].scenarioPrefix}in 2 sentences, explain why Laxree ${p.name} over a cheaper alternative.`,
        `${STAGE_CONFIG[st].framing}draft a ${p.name} value-prop tailored to ${persona.concern} for a ${persona.role}.`,
      ],
      ci
    );
    return {
      question: v,
      correctAnswer: `Laxree ${p.name} delivers ${benefit} through ${feature} — purpose-built for commercial hotel use across India. For a ${hotel.type} prioritising ${hotel.priority}, this means higher guest satisfaction with lower TCO.`,
      acceptableAnswers: JSON.stringify([benefit.split(' ')[0], feature.split(' ')[0], 'commercial', 'hotel', hotel.priority.split(' ')[0], 'TCO']),
      explanation: `Pitch ${p.name} by translating ${feature} into ${benefit} for the ${persona.role}'s ${persona.concern.toLowerCase()}.`,
      category: 'Pitching & Value Proposition',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const obj = pick(OBJECTIONS, ci);
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} says: "${obj.objection}" about ${p.name}. Write a 2-sentence Feel-Felt-Found response.`,
        `${STAGE_CONFIG[st].framing}the ${persona.role} says "We need to think about it" after a ${p.name} pitch. Write your follow-up question.`,
        `${STAGE_CONFIG[st].scenarioPrefix}draft your counter-response to "Your ${p.name} is too expensive."`,
        `${STAGE_CONFIG[st].framing}write a response to a ${persona.role} who says "We are happy with our current ${p.name} supplier."`,
      ],
      ci
    );
    return {
      question: v,
      correctAnswer: `I understand how you feel — other ${hotel.type} owners felt the same initially. What they found was that Laxree ${p.name}'s ${p.competitionEdge} delivers lower TCO over 3 years, with PAN-India service that cheaper alternatives cannot match.`,
      acceptableAnswers: JSON.stringify(['feel', 'felt', 'found', 'total cost', 'ownership', '3 years', 'service', p.competitionEdge.split(' ')[0]]),
      explanation: `For ${p.name} objections: acknowledge → reframe → anchor on TCO + service.`,
      category: 'Objection Handling',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
  (et, st, p, persona, hotel, ci) => {
    const v = pick(
      [
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} wants 30% off ${p.name}. Write your counter proposing a value trade.`,
        `${STAGE_CONFIG[st].framing}draft the closing question for ${p.name} with a ${hotel.type} ${persona.role} who is ready to proceed.`,
        `${STAGE_CONFIG[st].scenarioPrefix}a ${persona.role} insists on 90-day payment terms for ${p.name}. Write your counter-proposal.`,
        `${STAGE_CONFIG[st].framing}write the LOI request to lock in ${p.name} pricing while the ${persona.role} finalises internal approvals.`,
      ],
      ci
    );
    return {
      question: v,
      correctAnswer: `I cannot do 30% off, but I can include free installation OR extend warranty by 6 months — which would you prefer? Alternatively, a multi-property commitment unlocks volume pricing tier for ${p.name}.`,
      acceptableAnswers: JSON.stringify(['installation', 'warranty', 'multi-property', 'volume', 'commitment', 'prefer', 'tier']),
      explanation: `Negotiate ${p.name} by trading value (install/warranty/terms/multi-property) — never concede price without a commitment.`,
      category: 'Negotiation & Closing',
      difficulty: STAGE_CONFIG[st].difficulty,
    };
  },
];

// ---------------------------------------------------------------------
// Generate questions for an exam, ensuring global uniqueness
// ---------------------------------------------------------------------
function generateExamQuestions(examType, stage, globalSeen) {
  const out = [];
  const localSeen = new Set();

  function tryAdd(q) {
    if (localSeen.has(q.question)) return false;
    if (globalSeen.has(q.question)) return false;
    localSeen.add(q.question);
    globalSeen.add(q.question);
    out.push({ ...q, questionType: 'MCQ', moduleType: examType });
    return true;
  }

  // Generate 75 unique MCQs
  // Strategy: iterate over (generator × product × persona × hotel × variant)
  let attempts = 0;
  const maxAttempts = 5000;
  while (out.length < 75 && attempts < maxAttempts) {
    const genIdx = attempts % MCQ_GENERATORS.length;
    const productIdx = Math.floor(attempts / MCQ_GENERATORS.length) % PRODUCTS.length;
    const personaIdx = Math.floor(attempts / (MCQ_GENERATORS.length * PRODUCTS.length)) % BUYER_PERSONAS.length;
    const hotelIdx = Math.floor(attempts / (MCQ_GENERATORS.length * PRODUCTS.length * BUYER_PERSONAS.length)) % HOTEL_TYPES.length;
    const comboIdx = Math.floor(attempts / (MCQ_GENERATORS.length * PRODUCTS.length * BUYER_PERSONAS.length * HOTEL_TYPES.length)) + (stage === 'PRE' ? 0 : stage === 'MID' ? 100 : stage === 'HARD' ? 200 : 300) + (examType === 'FIELD_SALES' ? 400 : 0);

    const p = PRODUCTS[productIdx];
    const persona = BUYER_PERSONAS[personaIdx];
    const hotel = HOTEL_TYPES[hotelIdx];
    const q = MCQ_GENERATORS[genIdx](examType, stage, p, persona, hotel, comboIdx);
    if (q) tryAdd(q);
    attempts++;
  }
  const mcqCount = out.length;

  // Generate 25 unique SAs
  attempts = 0;
  while (out.length < mcqCount + 25 && attempts < maxAttempts) {
    const genIdx = attempts % SA_GENERATORS.length;
    const productIdx = Math.floor(attempts / SA_GENERATORS.length) % PRODUCTS.length;
    const personaIdx = Math.floor(attempts / (SA_GENERATORS.length * PRODUCTS.length)) % BUYER_PERSONAS.length;
    const hotelIdx = Math.floor(attempts / (SA_GENERATORS.length * PRODUCTS.length * BUYER_PERSONAS.length)) % HOTEL_TYPES.length;
    const comboIdx = Math.floor(attempts / (SA_GENERATORS.length * PRODUCTS.length * BUYER_PERSONAS.length * HOTEL_TYPES.length)) + (stage === 'PRE' ? 0 : stage === 'MID' ? 100 : stage === 'HARD' ? 200 : 300) + (examType === 'FIELD_SALES' ? 400 : 0) + 1000;

    const p = PRODUCTS[productIdx];
    const persona = BUYER_PERSONAS[personaIdx];
    const hotel = HOTEL_TYPES[hotelIdx];
    const q = SA_GENERATORS[genIdx](examType, stage, p, persona, hotel, comboIdx);
    if (q) {
      if (!localSeen.has(q.question) && !globalSeen.has(q.question)) {
        localSeen.add(q.question);
        globalSeen.add(q.question);
        out.push({ ...q, questionType: 'SHORT_ANSWER', moduleType: examType });
      }
    }
    attempts++;
  }

  return out;
}

// ---------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------
async function main() {
  console.log('=== Laxree Exam Questions Seeding ===\n');

  // 1. Generate all questions first (with global uniqueness)
  console.log('Generating questions for all 8 exams (with global uniqueness)...');
  const examOrder = [
    { examType: 'INBOUND_SALES', stage: 'PRE' },
    { examType: 'INBOUND_SALES', stage: 'MID' },
    { examType: 'INBOUND_SALES', stage: 'HARD' },
    { examType: 'INBOUND_SALES', stage: 'EXTRA_HARD' },
    { examType: 'FIELD_SALES', stage: 'PRE' },
    { examType: 'FIELD_SALES', stage: 'MID' },
    { examType: 'FIELD_SALES', stage: 'HARD' },
    { examType: 'FIELD_SALES', stage: 'EXTRA_HARD' },
  ];
  const globalSeen = new Set();
  const examToQuestions = new Map();
  for (const e of examOrder) {
    const qs = generateExamQuestions(e.examType, e.stage, globalSeen);
    if (qs.length < 100) {
      throw new Error(`Only ${qs.length} questions generated for ${e.examType}-${e.stage} (need 100).`);
    }
    const mcqs = qs.filter(q => q.questionType === 'MCQ').length;
    const sas = qs.filter(q => q.questionType === 'SHORT_ANSWER').length;
    console.log(`  ${e.examType} × ${e.stage}: ${qs.length} questions (${mcqs} MCQ + ${sas} SA). Global unique pool now: ${globalSeen.size}`);
    examToQuestions.set(`${e.examType}-${e.stage}`, qs);
  }

  const totalGenerated = Array.from(examToQuestions.values()).reduce((s, q) => s + q.length, 0);
  console.log(`\nTotal unique questions generated: ${totalGenerated}`);
  if (totalGenerated !== 800) {
    throw new Error(`Expected 800 total, got ${totalGenerated}`);
  }
  if (globalSeen.size !== 800) {
    throw new Error(`Expected 800 unique, got ${globalSeen.size}`);
  }
  console.log(`All 800 questions are unique.`);

  // 2. Fetch all exams
  const exams = await prisma.exam.findMany();
  console.log(`\nFound ${exams.length} exams in DB`);
  if (exams.length !== 8) {
    throw new Error(`Expected 8 exams, found ${exams.length}.`);
  }

  // 3. Delete existing ExamQuestion records
  console.log('\nDeleting existing ExamQuestion records...');
  const delEq = await prisma.examQuestion.deleteMany({});
  console.log(`  Deleted ${delEq.count} ExamQuestion records`);

  // 4. Delete existing exam QuestionBank records
  console.log('Deleting existing exam QuestionBank records (INBOUND_SALES, FIELD_SALES)...');
  const delQb = await prisma.questionBank.deleteMany({
    where: { moduleType: { in: ['INBOUND_SALES', 'FIELD_SALES'] } },
  });
  console.log(`  Deleted ${delQb.count} QuestionBank records`);

  // 5. Insert all 800 QuestionBank records in batches
  console.log('\nInserting 800 QuestionBank records in batches of 100...');
  const allQuestionsFlat = [];
  for (const e of examOrder) {
    const qs = examToQuestions.get(`${e.examType}-${e.stage}`);
    for (let i = 0; i < qs.length; i++) {
      allQuestionsFlat.push({ ...qs[i], order: i + 1, examType: e.examType, stage: e.stage });
    }
  }

  const BATCH = 100;
  const qbByText = new Map();
  for (let i = 0; i < allQuestionsFlat.length; i += BATCH) {
    const batch = allQuestionsFlat.slice(i, i + BATCH);
    const created = await prisma.$transaction(
      batch.map(q =>
        prisma.questionBank.create({
          data: {
            question: q.question,
            questionType: q.questionType,
            optionA: q.optionA || null,
            optionB: q.optionB || null,
            optionC: q.optionC || null,
            optionD: q.optionD || null,
            correctAnswer: q.correctAnswer,
            acceptableAnswers: q.acceptableAnswers || null,
            explanation: q.explanation,
            category: q.category,
            difficulty: q.difficulty,
            moduleType: q.moduleType,
          },
        })
      )
    );
    for (let j = 0; j < created.length; j++) {
      qbByText.set(batch[j].question, created[j].id);
    }
    console.log(`  Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(allQuestionsFlat.length / BATCH)}: inserted ${created.length} (running total: ${qbByText.size})`);
  }

  // 6. Link questions to exams via ExamQuestion
  console.log('\nLinking questions to exams via ExamQuestion...');
  let totalLinked = 0;
  for (const exam of exams) {
    const examKey = `${exam.examType}-${exam.stage}`;
    const qs = examToQuestions.get(examKey);
    if (!qs) throw new Error(`No questions found for exam ${examKey}`);

    const eqData = [];
    for (let i = 0; i < qs.length; i++) {
      const qbId = qbByText.get(qs[i].question);
      if (!qbId) throw new Error(`Missing QB id for question: ${qs[i].question.substring(0, 80)}`);
      eqData.push({ examId: exam.id, questionBankId: qbId, order: i + 1, marks: 1 });
    }

    for (let i = 0; i < eqData.length; i += BATCH) {
      await prisma.examQuestion.createMany({ data: eqData.slice(i, i + BATCH) });
    }
    totalLinked += eqData.length;

    await prisma.exam.update({ where: { id: exam.id }, data: { totalQuestions: 100 } });
    console.log(`  ${examKey}: linked ${eqData.length} questions, totalQuestions updated to 100`);
  }
  console.log(`\nTotal ExamQuestion records linked: ${totalLinked}`);

  // 7. Verify counts
  console.log('\n=== VERIFICATION ===');
  const finalEqCount = await prisma.examQuestion.count();
  const finalQbCount = await prisma.questionBank.count();
  const finalQbInbound = await prisma.questionBank.count({ where: { moduleType: 'INBOUND_SALES' } });
  const finalQbField = await prisma.questionBank.count({ where: { moduleType: 'FIELD_SALES' } });
  console.log(`ExamQuestion total: ${finalEqCount}`);
  console.log(`QuestionBank total: ${finalQbCount}`);
  console.log(`QuestionBank (INBOUND_SALES): ${finalQbInbound}`);
  console.log(`QuestionBank (FIELD_SALES): ${finalQbField}`);

  console.log('\nPer-exam breakdown:');
  const examsFinal = await prisma.exam.findMany({ include: { questions: true } });
  let allGood = true;
  for (const exam of examsFinal) {
    const mcqs = await prisma.examQuestion.count({
      where: { examId: exam.id, question: { questionType: 'MCQ' } },
    });
    const sas = await prisma.examQuestion.count({
      where: { examId: exam.id, question: { questionType: 'SHORT_ANSWER' } },
    });
    const ok = exam.questions.length === 100 && mcqs === 75 && sas === 25 && exam.totalQuestions === 100;
    if (!ok) allGood = false;
    console.log(`  ${exam.examType} × ${exam.stage}: total=${exam.questions.length} (MCQ=${mcqs}, SA=${sas}), totalQuestions field=${exam.totalQuestions} ${ok ? '✓' : '✗'}`);
  }

  if (finalEqCount !== 800 || !allGood) {
    throw new Error(`Verification failed: ExamQuestion=${finalEqCount}, allGood=${allGood}`);
  }
  console.log('\n=== SUCCESS: 800 questions seeded across 8 exams ===');
}

main()
  .catch(e => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
