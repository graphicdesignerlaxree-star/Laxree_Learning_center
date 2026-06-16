// ============================================================
// LAXREE EXAM CENTER — 50 MCQ + 50 SHORT ANSWER QUESTIONS
// Covers ALL product categories and sales methodology
// ============================================================

export interface MCQQuestion {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  productCategory: string
}

export interface ShortAnswerQuestion {
  question: string
  correctAnswer: string
  acceptableAnswers: string[]  // keywords/phrases that count as correct
  explanation: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  productCategory: string
}

// ============================================================
// 50 ABCD MULTIPLE CHOICE QUESTIONS
// ============================================================

export const MCQ_QUESTIONS: MCQQuestion[] = [
  // ===== SAFE BOXES (7 questions) =====
  {
    question: 'What is the model number of the LAXREE Essential series safe box?',
    optionA: 'LRSB-206',
    optionB: 'LRSB-201',
    optionC: 'LRSB-214',
    optionD: 'LRSB-209',
    correctAnswer: 'B',
    explanation: 'LRSB-201 is the Essential series safe box priced at ₹1,700, ideal for budget rooms.',
    category: 'Safe Boxes',
    difficulty: 'easy',
    productCategory: 'safe'
  },
  {
    question: 'Which LAXREE safe box model is designed for premium suites with a laptop-sized interior?',
    optionA: 'LRSB-201',
    optionB: 'LRSB-206',
    optionC: 'LRSB-214',
    optionD: 'LRSB-209',
    correctAnswer: 'C',
    explanation: 'LRSB-214 is the Premium safe with laptop-sized interior, LED display, and dual lock system.',
    category: 'Safe Boxes',
    difficulty: 'easy',
    productCategory: 'safe'
  },
  {
    question: 'What is the default master code for LAXREE electronic safe boxes?',
    optionA: '0000',
    optionB: '1234',
    optionC: '9999',
    optionD: '1111',
    correctAnswer: 'B',
    explanation: 'The default master code is 1234, which should be changed during installation for security.',
    category: 'Safe Boxes',
    difficulty: 'easy',
    productCategory: 'safe'
  },
  {
    question: 'What power source do LAXREE electronic safe boxes primarily use?',
    optionA: 'AC mains power only',
    optionB: 'Rechargeable lithium battery',
    optionC: '4x AA alkaline batteries',
    optionD: 'Solar panel backup',
    correctAnswer: 'C',
    explanation: 'LAXREE electronic safes run on 4x AA alkaline batteries, with an external emergency battery contact for lockout situations.',
    category: 'Safe Boxes',
    difficulty: 'medium',
    productCategory: 'safe'
  },
  {
    question: 'Which safe box feature allows hotel management to override a guest-forgotten code?',
    optionA: 'Bluetooth override',
    optionB: 'Master code and override key',
    optionC: 'Voice recognition',
    optionD: 'Fingerprint scan',
    correctAnswer: 'B',
    explanation: 'LAXREE safes have both a master code and an override key for emergency access when guests forget their PIN.',
    category: 'Safe Boxes',
    difficulty: 'medium',
    productCategory: 'safe'
  },
  {
    question: 'What is the SSP of the LRSB-206 safe box?',
    optionA: '₹1,700',
    optionB: '₹2,100',
    optionC: '₹2,600',
    optionD: '₹3,000',
    correctAnswer: 'B',
    explanation: 'LRSB-206 is the Standard series safe box priced at ₹2,100 with keypad entry and carpeted interior.',
    category: 'Safe Boxes',
    difficulty: 'medium',
    productCategory: 'safe'
  },


  // ===== RFID DOOR LOCKS (7 questions) =====
  {
    question: 'What frequency does the LAXREE RFID door lock system operate on?',
    optionA: '125 kHz',
    optionB: '13.56 MHz Mifare',
    optionC: '2.4 GHz',
    optionD: '900 MHz',
    correctAnswer: 'B',
    explanation: 'LAXREE RFID locks use 13.56 MHz Mifare technology, which is the global hospitality standard for secure card access.',
    category: 'RFID Door Locks',
    difficulty: 'easy',
    productCategory: 'rfid'
  },
  {
    question: 'What is the model number of the LAXREE RFID lock with SS Body and 5 Latch Mortise?',
    optionA: 'LRFD-606',
    optionB: 'LRFD-607',
    optionC: 'LRFD-608',
    optionD: 'LRFD-609',
    correctAnswer: 'C',
    explanation: 'LRFD-608 is the SS Body, 5 Latch Mortise RFID lock priced at ₹3,337.',
    category: 'RFID Door Locks',
    difficulty: 'easy',
    productCategory: 'rfid'
  },
  {
    question: 'Which card hierarchy level in LAXREE RFID locks allows access to ALL rooms?',
    optionA: 'Guest card',
    optionB: 'Floor master card',
    optionC: 'Building master card',
    optionD: 'Emergency card',
    correctAnswer: 'C',
    explanation: 'The Building master card provides access to all rooms in the property, used by senior management.',
    category: 'RFID Door Locks',
    difficulty: 'medium',
    productCategory: 'rfid'
  },
  {
    question: 'What is a key benefit of LAXREE RFID locks integrating with hotel PMS systems?',
    optionA: 'Only remote locking',
    optionB: 'Automatic card encoding at check-in and real-time audit trails',
    optionC: 'Only guest tracking',
    optionD: 'Video surveillance integration',
    correctAnswer: 'B',
    explanation: 'PMS integration enables automatic card encoding at check-in, real-time audit trails, and automatic deactivation at check-out.',
    category: 'RFID Door Locks',
    difficulty: 'medium',
    productCategory: 'rfid'
  },
  {
    question: 'What happens to a guest card when a new guest checks into the same room?',
    optionA: 'Old card continues to work',
    optionB: 'Old card is automatically invalidated',
    optionC: 'Both cards work simultaneously',
    optionD: 'Old card works only during daytime',
    correctAnswer: 'B',
    explanation: 'When a new guest card is encoded, the previous guest card is automatically invalidated for security.',
    category: 'RFID Door Locks',
    difficulty: 'medium',
    productCategory: 'rfid'
  },
  {
    question: 'What type of mortise lock mechanism does the LRFD-608 use?',
    optionA: '3-latch',
    optionB: '5-latch',
    optionC: '7-latch',
    optionD: 'Single deadbolt',
    correctAnswer: 'B',
    explanation: 'LRFD-608 uses a 5-latch mortise mechanism providing superior security with anti-panic exit function.',
    category: 'RFID Door Locks',
    difficulty: 'hard',
    productCategory: 'rfid'
  },


  // ===== MINIBARS (6 questions) =====
  {
    question: 'Which type of LAXREE minibar is completely silent during operation?',
    optionA: 'Compressor type',
    optionB: 'Thermoelectric type',
    optionC: 'Absorption type',
    optionD: 'Dual-zone type',
    correctAnswer: 'C',
    explanation: 'Absorption minibars have no moving parts (no compressor), making them completely silent — essential for guest rooms.',
    category: 'Minibars',
    difficulty: 'easy',
    productCategory: 'minibar'
  },
  {
    question: 'What is the capacity of the LRMB-132 compressor minibar?',
    optionA: '30L',
    optionB: '40L',
    optionC: '45L',
    optionD: '50L',
    correctAnswer: 'C',
    explanation: 'LRMB-132 is the 45L Compressor minibar — the largest capacity in the LAXREE minibar range.',
    category: 'Minibars',
    difficulty: 'easy',
    productCategory: 'minibar'
  },
  {
    question: 'Which minibar type provides the fastest cooling and lowest temperature?',
    optionA: 'Absorption',
    optionB: 'Thermoelectric',
    optionC: 'Compressor',
    optionD: 'Passive cooling',
    correctAnswer: 'C',
    explanation: 'Compressor minibars provide the fastest cooling and can reach the lowest temperatures (2-8°C), ideal for high-end properties.',
    category: 'Minibars',
    difficulty: 'medium',
    productCategory: 'minibar'
  },
  {
    question: 'What is the SSP of the LRMB-126 thermoelectric minibar?',
    optionA: '₹6,200',
    optionB: '₹8,400',
    optionC: '₹10,500',
    optionD: '₹12,800',
    correctAnswer: 'B',
    explanation: 'LRMB-126 is a 30L Solid Door Thermoelectric minibar priced at ₹8,400 — the budget-friendly option.',
    category: 'Minibars',
    difficulty: 'medium',
    productCategory: 'minibar'
  },
  {
    question: 'Which LAXREE minibar is best suited for luxury suites requiring silent operation and premium presentation?',
    optionA: 'LRMB-126 thermoelectric',
    optionB: 'LRMB-132 compressor',
    optionC: 'LRMB-128 absorption with glass door',
    optionD: 'Any minibar with a sticker',
    correctAnswer: 'C',
    explanation: 'The LRMB-128 absorption model with glass door offers silent operation and premium product display — perfect for luxury suites.',
    category: 'Minibars',
    difficulty: 'hard',
    productCategory: 'minibar'
  },
  {
    question: 'How does the auto-defrost feature in LAXREE compressor minibars benefit hotel operations?',
    optionA: 'It increases energy consumption',
    optionB: 'It reduces the need for manual defrosting and prevents ice buildup',
    optionC: 'It makes the minibar louder',
    optionD: 'It has no operational benefit',
    correctAnswer: 'B',
    explanation: 'Auto-defrost eliminates manual defrosting, prevents ice buildup, and ensures consistent cooling performance — reducing housekeeping workload.',
    category: 'Minibars',
    difficulty: 'hard',
    productCategory: 'minibar'
  },

  // ===== ELECTRIC KETTLES (6 questions) =====
  {
    question: 'How many electric kettle models does LAXREE offer in its product line?',
    optionA: '3',
    optionB: '4',
    optionC: '5',
    optionD: '6',
    correctAnswer: 'C',
    explanation: 'LAXREE offers 5 electric kettle models: LRWT-143, LRWT-145, LRWT-155, LRWT-150, and LRWT-156.',
    category: 'Electric Kettles',
    difficulty: 'easy',
    productCategory: 'kettle'
  },
  {
    question: 'What is the SSP of the LRWT-143 electric kettle?',
    optionA: '₹488',
    optionB: '₹560',
    optionC: '₹1,104',
    optionD: '₹1,320',
    correctAnswer: 'B',
    explanation: 'LRWT-143 is the 0.6L, 1000W, SS 201 kettle with auto-shut off priced at ₹560.',
    category: 'Electric Kettles',
    difficulty: 'easy',
    productCategory: 'kettle'
  },
  {
    question: 'Which safety feature is standard across all LAXREE electric kettles?',
    optionA: 'WiFi connectivity',
    optionB: 'Auto shut-off and boil-dry protection',
    optionC: 'LED temperature display',
    optionD: 'Voice control',
    correctAnswer: 'B',
    explanation: 'All LAXREE kettles feature auto shut-off and boil-dry protection as standard safety features.',
    category: 'Electric Kettles',
    difficulty: 'easy',
    productCategory: 'kettle'
  },
  {
    question: 'What is the capacity and power of the LRWT-155 electric kettle?',
    optionA: '0.6L, 800W',
    optionB: '0.8L, 1000W',
    optionC: '1.0L, 1350W',
    optionD: '1.5L, 1500W',
    correctAnswer: 'C',
    explanation: 'LRWT-155 is a 1.0L, 1350W SS 304 kettle with variable temperature, priced at ₹1,320.',
    category: 'Electric Kettles',
    difficulty: 'medium',
    productCategory: 'kettle'
  },
  {
    question: 'What is the purpose of the LRWT-158 Anti Theft Tray?',
    optionA: 'Water filtration for the kettle',
    optionB: 'Decorative presentation stand',
    optionC: 'Prevent kettle theft in hotel rooms',
    optionD: 'Extra tea bag storage',
    correctAnswer: 'C',
    explanation: 'LRWT-158 is the Anti Theft Tray made of ABS material, designed to secure kettles and prevent theft in hotel rooms, priced at ₹706.',
    category: 'Electric Kettles',
    difficulty: 'medium',
    productCategory: 'kettle'
  },
  {
    question: 'Which LAXREE kettle model is the most premium with SS 304 body and variable temperature control?',
    optionA: 'LRWT-143',
    optionB: 'LRWT-145',
    optionC: 'LRWT-155',
    optionD: 'LRWT-150',
    correctAnswer: 'C',
    explanation: 'LRWT-155 features SS 304 construction and variable temperature control, making it the premium kettle at ₹1,320.',
    category: 'Electric Kettles',
    difficulty: 'hard',
    productCategory: 'kettle'
  },

  // ===== HAIR DRYERS & MIRRORS (6 questions) =====
  {
    question: 'Which LAXREE hair dryer is the foldable model?',
    optionA: 'LRHD-276',
    optionB: 'LRHD-287',
    optionC: 'LRHD-280',
    optionD: 'LRHD-290',
    correctAnswer: 'C',
    explanation: 'LRHD-280 is the Foldable hair dryer at 2100W with ionized air, priced at ₹1,744 — great for space-saving in rooms.',
    category: 'Hair Dryers',
    difficulty: 'easy',
    productCategory: 'hair_dryer'
  },
  {
    question: 'What is the key feature of LAXREE LED mirrors for hotel bathrooms?',
    optionA: 'Only magnification',
    optionB: 'Anti-fog technology with LED lighting',
    optionC: 'Bluetooth speaker only',
    optionD: 'Touchless activation only',
    correctAnswer: 'B',
    explanation: 'LAXREE LED mirrors feature anti-fog technology with adjustable LED lighting — eliminating fog after hot showers.',
    category: 'Mirrors',
    difficulty: 'easy',
    productCategory: 'mirror'
  },
  {
    question: 'What is the wattage of the LRHD-287 wall-mounted hair dryer?',
    optionA: '1200W',
    optionB: '1600W',
    optionC: '1800W',
    optionD: '2100W',
    correctAnswer: 'B',
    explanation: 'LRHD-287 is a 1600W wall-mounted hair dryer priced at ₹1,168 — the budget wall-mount option.',
    category: 'Hair Dryers',
    difficulty: 'medium',
    productCategory: 'hair_dryer'
  },
  {
    question: 'Why are wall-mounted hair dryers preferred by hotels over handheld models?',
    optionA: 'They look more decorative',
    optionB: 'They reduce theft and save drawer space',
    optionC: 'They are louder so guests know they work',
    optionD: 'They use more electricity',
    correctAnswer: 'B',
    explanation: 'Wall-mounted dryers reduce theft risk, save bathroom counter/drawer space, and provide a clean organized look.',
    category: 'Hair Dryers',
    difficulty: 'medium',
    productCategory: 'hair_dryer'
  },
  {
    question: 'What is the anti-fog feature in LAXREE LED mirrors technically called and how does it work?',
    optionA: 'Chemical coating that repels water',
    optionB: 'Heated demister pad behind the mirror surface',
    optionC: 'Motorized wiper blade',
    optionD: 'UV light treatment',
    correctAnswer: 'B',
    explanation: 'A heated demister pad behind the mirror gently warms the surface to prevent condensation after hot showers.',
    category: 'Mirrors',
    difficulty: 'hard',
    productCategory: 'mirror'
  },
  {
    question: 'What is the SSP of the LRHD-276 wall-mounted hair dryer?',
    optionA: '₹1,168',
    optionB: '₹1,300',
    optionC: '₹1,744',
    optionD: '₹2,100',
    correctAnswer: 'B',
    explanation: 'LRHD-276 is the 1800W wall-mounted hair dryer priced at ₹1,300 — the mid-range wall-mount option.',
    category: 'Hair Dryers',
    difficulty: 'hard',
    productCategory: 'hair_dryer'
  },

  // ===== DIGITAL SIGNAGE (5 questions) =====
  {
    question: 'What are the three main types of LAXREE digital signage for hotels?',
    optionA: 'Indoor, outdoor, and mobile',
    optionB: 'Lobby displays, room door signs, and wayfinding kiosks',
    optionC: 'Projector, LED wall, and LCD screen',
    optionD: 'Touchscreen, voice-activated, and gesture-controlled',
    correctAnswer: 'B',
    explanation: 'LAXREE digital signage includes lobby displays (guest info), room door signs (room status), and wayfinding kiosks (navigation).',
    category: 'Digital Signage',
    difficulty: 'easy',
    productCategory: 'digital_signage'
  },
  {
    question: 'How does LAXREE digital room signage integrate with hotel operations?',
    optionA: 'It only shows room numbers',
    optionB: 'It displays real-time room status (Do Not Disturb, Make Up Room) linked to PMS',
    optionC: 'It only shows guest names',
    optionD: 'It works independently without PMS',
    correctAnswer: 'B',
    explanation: 'LAXREE room signage integrates with PMS to display real-time room status like DND, MUR, and occupancy — streamlining housekeeping.',
    category: 'Digital Signage',
    difficulty: 'medium',
    productCategory: 'digital_signage'
  },
  {
    question: 'What is the primary ROI benefit of digital signage in hotel lobbies?',
    optionA: 'Reduced electricity bills',
    optionB: 'Elimination of printed material costs and real-time content updates',
    optionC: 'Increased room service orders only',
    optionD: 'No measurable benefit',
    correctAnswer: 'B',
    explanation: 'Digital signage eliminates recurring printing costs and enables instant content updates for promotions, events, and wayfinding.',
    category: 'Digital Signage',
    difficulty: 'medium',
    productCategory: 'digital_signage'
  },
  {
    question: 'What display technology do LAXREE digital signage products use?',
    optionA: 'CRT monitors',
    optionB: 'E-ink displays',
    optionC: 'High-brightness LCD/LED panels',
    optionD: 'Projection mapping',
    correctAnswer: 'C',
    explanation: 'LAXREE uses high-brightness LCD/LED panels for clear visibility even in well-lit hotel environments.',
    category: 'Digital Signage',
    difficulty: 'hard',
    productCategory: 'digital_signage'
  },
  {
    question: 'How does wayfinding digital signage improve the guest experience in large hotels?',
    optionA: 'It replaces all hotel staff',
    optionB: 'It provides interactive maps and directions to amenities, reducing confusion',
    optionC: 'It only shows advertisements',
    optionD: 'It plays background music',
    correctAnswer: 'B',
    explanation: 'Wayfinding kiosks provide interactive maps, directions to rooms/restaurants/amenities, and event schedules — reducing guest frustration.',
    category: 'Digital Signage',
    difficulty: 'hard',
    productCategory: 'digital_signage'
  },

  // ===== DISPENSERS (5 questions) =====
  {
    question: 'Which LAXREE soap dispenser model is automatic with 304 SS construction?',
    optionA: 'LRWA-362',
    optionB: 'LRWA-373',
    optionC: 'LRWA-374',
    optionD: 'LRWA-375',
    correctAnswer: 'C',
    explanation: 'LRWA-374 is the Automatic 304 SS soap dispenser with 800ml capacity and anti-theft feature, priced at ₹4,170.',
    category: 'Dispensers',
    difficulty: 'easy',
    productCategory: 'dispenser'
  },
  {
    question: 'What are the available chamber configurations for LAXREE shower dispensers?',
    optionA: 'Single chamber only',
    optionB: '2 and 3 chamber',
    optionC: '4 and 5 chamber',
    optionD: '6 chamber only',
    correctAnswer: 'B',
    explanation: 'LAXREE dispensers come in 2-chamber (shampoo + body wash) and 3-chamber (shampoo + conditioner + body wash) configurations.',
    category: 'Dispensers',
    difficulty: 'easy',
    productCategory: 'dispenser'
  },
  {
    question: 'What is the primary cost savings benefit of LAXREE dispensers over single-use amenity bottles?',
    optionA: 'They use cheaper chemicals',
    optionB: 'They reduce per-room amenity cost by up to 70% through bulk refilling',
    optionC: 'They require no maintenance',
    optionD: 'They use less water',
    correctAnswer: 'B',
    explanation: 'Bulk dispensers reduce per-room amenity cost by up to 70% compared to single-use bottles — significant savings for large properties.',
    category: 'Dispensers',
    difficulty: 'medium',
    productCategory: 'dispenser'
  },
  {
    question: 'What sustainability benefit do LAXREE dispensers offer to hotels?',
    optionA: 'They use solar power',
    optionB: 'They eliminate single-use plastic waste from mini bottles',
    optionC: 'They purify the water supply',
    optionD: 'They recycle old soap',
    correctAnswer: 'B',
    explanation: 'Dispensers eliminate thousands of single-use plastic bottles per year per property, supporting hotel sustainability goals.',
    category: 'Dispensers',
    difficulty: 'medium',
    productCategory: 'dispenser'
  },
  {
    question: 'How does the anti-theft feature in the LRWA-374 dispenser work?',
    optionA: 'Alarm system only',
    optionB: 'Locking mechanism that requires a key for refill access',
    optionC: 'GPS tracking',
    optionD: 'Weight sensor alarm',
    correctAnswer: 'B',
    explanation: 'The LRWA-374 has a locking mechanism that requires a proprietary key to open for refilling — preventing unauthorized removal of product or the unit.',
    category: 'Dispensers',
    difficulty: 'hard',
    productCategory: 'dispenser'
  },

  // ===== HOUSEKEEPING TROLLEYS (3 questions) =====
  {
    question: 'What types of housekeeping trolleys does LAXREE offer?',
    optionA: 'Only plastic trolleys',
    optionB: 'Metal frame and aluminum trolleys in multiple configurations',
    optionC: 'Only wooden trolleys',
    optionD: 'Motorized trolleys only',
    correctAnswer: 'B',
    explanation: 'LAXREE offers metal frame and aluminum housekeeping trolleys in various configurations for different hotel sizes and needs.',
    category: 'Housekeeping Trolleys',
    difficulty: 'easy',
    productCategory: 'trolley'
  },
  {
    question: 'What is the key benefit of LAXREE housekeeping trolleys for hotel operations?',
    optionA: 'They are decorative only',
    optionB: 'They improve housekeeping efficiency with organized storage and easy mobility',
    optionC: 'They automatically clean rooms',
    optionD: 'They track guest movements',
    correctAnswer: 'B',
    explanation: 'LAXREE trolleys feature organized compartment storage, smooth-rolling casters, and ergonomic design for maximum housekeeping efficiency.',
    category: 'Housekeeping Trolleys',
    difficulty: 'medium',
    productCategory: 'trolley'
  },
  {
    question: 'What customization options are available for LAXREE housekeeping trolleys?',
    optionA: 'No customization available',
    optionB: 'Color, bag configuration, and accessories can be customized per property needs',
    optionC: 'Only size can be changed',
    optionD: 'Only color can be changed',
    correctAnswer: 'B',
    explanation: 'LAXREE trolleys offer customization in color, bag configuration (open/closed), and accessories like mop holders and waste bins.',
    category: 'Housekeeping Trolleys',
    difficulty: 'hard',
    productCategory: 'trolley'
  },

  // ===== CROSS-SELLING STRATEGIES (4 questions) =====
  {
    question: 'What is cross-selling in the context of LAXREE hotel products?',
    optionA: 'Selling the same product at different prices',
    optionB: 'Recommending complementary products that a customer did not initially inquire about',
    optionC: 'Discounting products to clear inventory',
    optionD: 'Selling only one product category per hotel',
    correctAnswer: 'B',
    explanation: 'Cross-selling means recommending complementary products — e.g., if a hotel buys kettles, suggest minibars and dispensers for a complete room setup.',
    category: 'Cross-Selling',
    difficulty: 'easy',
    productCategory: 'sales'
  },
  {
    question: 'When a hotel inquires about safe boxes, which LAXREE product is the most logical cross-sell?',
    optionA: 'Hair dryer',
    optionB: 'RFID door lock',
    optionC: 'Minibar only',
    optionD: 'Digital signage only',
    correctAnswer: 'B',
    explanation: 'RFID door locks are the most logical cross-sell with safe boxes — both are room security products and can share the same card system.',
    category: 'Cross-Selling',
    difficulty: 'medium',
    productCategory: 'sales'
  },
  {
    question: 'What is the "complete room package" cross-selling strategy?',
    optionA: 'Selling only kettles',
    optionB: 'Bundling safe + kettle + hair dryer + minibar for a discounted room-ready price',
    optionC: 'Selling one product at a time over months',
    optionD: 'Only selling to the hotel GM',
    correctAnswer: 'B',
    explanation: 'The complete room package bundles multiple products (safe, kettle, hair dryer, minibar) at a bundled price — increasing order value while offering per-room savings.',
    category: 'Cross-Selling',
    difficulty: 'medium',
    productCategory: 'sales'
  },


  // ===== SALES METHODOLOGY — 8 STEPS TO CLOSE (4 questions) =====
  {
    question: 'What is the first step in the LAXREE 8-step sales process?',
    optionA: 'Present the product',
    optionB: 'Research and prepare before the call/meeting',
    optionC: 'Negotiate the price',
    optionD: 'Close the deal',
    correctAnswer: 'B',
    explanation: 'Step 1 is Research & Preparation — understand the hotel property, their current suppliers, and pain points before making contact.',
    category: 'Sales Methodology',
    difficulty: 'easy',
    productCategory: 'sales'
  },
  {
    question: 'In the LAXREE sales process, what comes immediately after identifying customer needs?',
    optionA: 'Closing the deal',
    optionB: 'Presenting the solution matched to those needs',
    optionC: 'Handling objections',
    optionD: 'Sending an invoice',
    correctAnswer: 'B',
    explanation: 'After identifying needs (Step 3), the next step is Presenting the Solution (Step 4) — matching specific LAXREE products to the customer\'s identified needs.',
    category: 'Sales Methodology',
    difficulty: 'medium',
    productCategory: 'sales'
  },

  {
    question: 'What is the correct order of the first 4 steps in the LAXREE sales methodology?',
    optionA: 'Present → Research → Needs → Solution',
    optionB: 'Research → Approach → Needs → Solution',
    optionC: 'Close → Negotiate → Present → Research',
    optionD: 'Needs → Research → Solution → Close',
    correctAnswer: 'B',
    explanation: 'The correct order: 1) Research & Prepare, 2) Approach & Build Rapport, 3) Identify Needs, 4) Present Solution.',
    category: 'Sales Methodology',
    difficulty: 'hard',
    productCategory: 'sales'
  },

  // ===== OBJECTION HANDLING (2 questions) =====
  {
    question: 'When a hotel says "Your prices are too high," what is the best LAXREE response strategy?',
    optionA: 'Immediately offer the lowest possible discount',
    optionB: 'Present total cost of ownership: durability, warranty, energy savings, and reduced replacement costs',
    optionC: 'Agree and walk away',
    optionD: 'Ignore the objection and continue presenting',
    correctAnswer: 'B',
    explanation: 'The best strategy is to shift from price to value — highlight durability, warranty savings, energy efficiency, and reduced total cost of ownership over 5+ years.',
    category: 'Objection Handling',
    difficulty: 'medium',
    productCategory: 'sales'
  },

]

// ============================================================
// 50 SHORT ANSWER QUESTIONS
// ============================================================

export const SHORT_ANSWER_QUESTIONS: ShortAnswerQuestion[] = [
  // ===== SAFE BOXES (7 questions) =====
  {
    question: 'What is the default master code for LAXREE electronic safe boxes?',
    correctAnswer: '1234',
    acceptableAnswers: ['1234', 'default master code 1234'],
    explanation: 'The default master code is 1234, which must be changed during installation.',
    category: 'Safe Boxes',
    difficulty: 'easy',
    productCategory: 'safe'
  },
  {
    question: 'Name two security access methods available on LAXREE safe boxes for override when a guest forgets their code.',
    correctAnswer: 'master code and override key',
    acceptableAnswers: ['master code and override key', 'master code override key', 'override key and master code', 'master code and key', 'key and master code'],
    explanation: 'LAXREE safes provide both a master code and a physical override key for emergency access.',
    category: 'Safe Boxes',
    difficulty: 'easy',
    productCategory: 'safe'
  },
  {
    question: 'What type of batteries power LAXREE electronic safe boxes?',
    correctAnswer: '4 AA alkaline batteries',
    acceptableAnswers: ['4 AA alkaline batteries', 'AA alkaline batteries', '4 AA batteries', 'AA batteries'],
    explanation: 'LAXREE safes use 4 AA alkaline batteries, with an external emergency battery contact for lockout situations.',
    category: 'Safe Boxes',
    difficulty: 'medium',
    productCategory: 'safe'
  },
  {
    question: 'What is the model number and SSP of the LAXREE Essential series safe box?',
    correctAnswer: 'LRSB-201 priced at ₹1,700',
    acceptableAnswers: ['LRSB-201 ₹1700', 'LRSB-201 1700', 'LRSB-201 at 1700', 'LRSB-201 ₹1,700', 'LRSB-201 priced at 1700'],
    explanation: 'LRSB-201 is the Essential series safe box priced at ₹1,700.',
    category: 'Safe Boxes',
    difficulty: 'medium',
    productCategory: 'safe'
  },
  {
    question: 'Name the LAXREE safe box model designed for premium suites with laptop-sized interior.',
    correctAnswer: 'LRSB-214',
    acceptableAnswers: ['LRSB-214', 'LRSB 214'],
    explanation: 'LRSB-214 is the Premium safe with laptop-sized interior and LED display.',
    category: 'Safe Boxes',
    difficulty: 'medium',
    productCategory: 'safe'
  },
  {
    question: 'What are the three LAXREE safe box series and their target room types?',
    correctAnswer: 'Essential for budget rooms, Standard for mid-range rooms, Premium for suites',
    acceptableAnswers: ['Essential budget Standard mid-range Premium suites', 'Essential Standard Premium', 'Essential for budget Standard for mid-range Premium for suites'],
    explanation: 'Essential (LRSB-201) for budget, Standard (LRSB-206) for mid-range, Premium (LRSB-214) for suites.',
    category: 'Safe Boxes',
    difficulty: 'hard',
    productCategory: 'safe'
  },
  {
    question: 'Describe the external emergency battery contact feature on LAXREE safes.',
    correctAnswer: 'External battery contact on the front panel allows connecting batteries from outside when internal batteries are dead',
    acceptableAnswers: ['external battery contact front panel connecting batteries outside dead batteries', 'external battery contact outside panel', 'front panel external battery contact'],
    explanation: 'When internal batteries die, the external emergency battery contact on the front panel allows temporary power from outside to open the safe.',
    category: 'Safe Boxes',
    difficulty: 'hard',
    productCategory: 'safe'
  },

  // ===== RFID DOOR LOCKS (7 questions) =====
  {
    question: 'What frequency and card technology does the LAXREE RFID lock system use?',
    correctAnswer: '13.56 MHz Mifare',
    acceptableAnswers: ['13.56 MHz Mifare', '13.56MHz Mifare', 'Mifare 13.56 MHz', '13.56 MHz'],
    explanation: 'LAXREE RFID locks use 13.56 MHz Mifare technology, the global hospitality standard.',
    category: 'RFID Door Locks',
    difficulty: 'easy',
    productCategory: 'rfid'
  },
  {
    question: 'Name the four card hierarchy levels in LAXREE RFID lock systems from lowest to highest access.',
    correctAnswer: 'Guest card, Floor master, Building master, Emergency',
    acceptableAnswers: ['Guest Floor master Building master Emergency', 'guest card floor master building master emergency', 'Guest Floor Building Emergency'],
    explanation: 'Card hierarchy: Guest (single room) → Floor master (one floor) → Building master (all rooms) → Emergency (all doors anytime).',
    category: 'RFID Door Locks',
    difficulty: 'easy',
    productCategory: 'rfid'
  },
  {
    question: 'What happens to a previous guest card when a new guest checks into the same room?',
    correctAnswer: 'Previous card is automatically invalidated',
    acceptableAnswers: ['automatically invalidated', 'invalidated automatically', 'previous card stops working', 'old card deactivated', 'auto invalidated'],
    explanation: 'When a new card is encoded, the previous guest card is automatically invalidated for security.',
    category: 'RFID Door Locks',
    difficulty: 'easy',
    productCategory: 'rfid'
  },
  {
    question: 'What are the key benefits of PMS integration with LAXREE RFID locks?',
    correctAnswer: 'Automatic card encoding at check-in, real-time audit trails, and automatic deactivation at check-out',
    acceptableAnswers: ['automatic card encoding check-in real-time audit trails automatic deactivation check-out', 'card encoding audit trails deactivation', 'PMS integration card encoding audit deactivation'],
    explanation: 'PMS integration enables automatic card encoding, real-time audit trails, and automatic card deactivation at check-out.',
    category: 'RFID Door Locks',
    difficulty: 'medium',
    productCategory: 'rfid'
  },
  {
    question: 'What is the SSP of the LRFD-608 RFID lock and what material is its body made of?',
    correctAnswer: '₹3,337 with SS body',
    acceptableAnswers: ['3337 SS body', '₹3,337 SS body', '3337 stainless steel body', '₹3,337 stainless steel'],
    explanation: 'LRFD-608 is the SS Body, 5 Latch Mortise RFID lock priced at ₹3,337.',
    category: 'RFID Door Locks',
    difficulty: 'medium',
    productCategory: 'rfid'
  },
  {
    question: 'What is the anti-panic exit function in LAXREE RFID locks?',
    correctAnswer: 'Inside lever always allows free exit from the room even when locked from outside',
    acceptableAnswers: ['inside lever free exit even when locked', 'anti-panic exit inside lever always works', 'inside lever always allows exit', 'free exit from inside always'],
    explanation: 'The anti-panic function ensures the inside lever always opens the door for emergency exit, even when the door is locked from outside.',
    category: 'RFID Door Locks',
    difficulty: 'hard',
    productCategory: 'rfid'
  },
  {
    question: 'Describe how LAXREE RFID locks handle a low battery situation.',
    correctAnswer: 'Lock alerts with beep and LED indicator before battery dies, and external power can be applied via emergency contact',
    acceptableAnswers: ['beep LED indicator low battery external power emergency contact', 'alert beep LED low battery external power', 'low battery warning external power contact'],
    explanation: 'The lock provides audible and visual low battery warnings. If batteries die completely, external power can be applied through the emergency contact.',
    category: 'RFID Door Locks',
    difficulty: 'hard',
    productCategory: 'rfid'
  },

  // ===== MINIBARS (7 questions) =====
  {
    question: 'Name the three types of cooling technology used in LAXREE minibars.',
    correctAnswer: 'Absorption, compressor, and thermoelectric',
    acceptableAnswers: ['absorption compressor thermoelectric', 'absorption compressor and thermoelectric', 'absorption, compressor, thermoelectric'],
    explanation: 'LAXREE minibars come in three cooling types: absorption (silent), compressor (fast cooling), and thermoelectric (budget).',
    category: 'Minibars',
    difficulty: 'easy',
    productCategory: 'minibar'
  },
  {
    question: 'Why is the absorption minibar recommended for hotel guest rooms?',
    correctAnswer: 'Completely silent operation with no moving parts',
    acceptableAnswers: ['completely silent operation no moving parts', 'silent operation', 'no compressor silent', 'silent no moving parts'],
    explanation: 'Absorption minibars have no compressor or moving parts, making them completely silent — essential for guest comfort.',
    category: 'Minibars',
    difficulty: 'easy',
    productCategory: 'minibar'
  },
  {
    question: 'What is the capacity of the LRMB-126 minibar and what type is it?',
    correctAnswer: '30L solid door thermoelectric',
    acceptableAnswers: ['30L solid door thermoelectric', '30L thermoelectric solid door', '30 liter thermoelectric'],
    explanation: 'LRMB-126 is a 30L Solid Door Thermoelectric minibar priced at ₹8,400.',
    category: 'Minibars',
    difficulty: 'easy',
    productCategory: 'minibar'
  },
  {
    question: 'What is the largest capacity minibar in the LAXREE range and what type is it?',
    correctAnswer: 'LRMB-132 45L compressor type',
    acceptableAnswers: ['LRMB-132 45L compressor', 'LRMB-132 45 liter compressor', 'LRMB-132 45L compressor type', '45L compressor LRMB-132'],
    explanation: 'LRMB-132 is the 45L Compressor minibar — the largest capacity in the LAXREE range.',
    category: 'Minibars',
    difficulty: 'medium',
    productCategory: 'minibar'
  },
  {
    question: 'What is the key advantage of a glass door minibar over a solid door model?',
    correctAnswer: 'Glass door allows guests to see products without opening, reducing cold air loss and increasing sales',
    acceptableAnswers: ['see products without opening reducing cold air loss increasing sales', 'display products without opening less energy loss', 'glass door visibility increases sales'],
    explanation: 'Glass door minibars showcase products visually, reducing door openings (less cold loss) and increasing impulse purchases.',
    category: 'Minibars',
    difficulty: 'medium',
    productCategory: 'minibar'
  },
  {
    question: 'Calculate the annual electricity cost for an absorption minibar consuming 0.8 kWh/day at ₹8 per kWh.',
    correctAnswer: '₹2,336',
    acceptableAnswers: ['₹2336', '2336', '₹2,336', '2,336'],
    explanation: '0.8 kWh/day × 365 days × ₹8/kWh = ₹2,336 per year.',
    category: 'Minibars',
    difficulty: 'hard',
    productCategory: 'minibar'
  },
  {
    question: 'How does auto-defrost in compressor minibars reduce hotel maintenance workload?',
    correctAnswer: 'Eliminates manual defrosting and prevents ice buildup that reduces cooling efficiency',
    acceptableAnswers: ['eliminates manual defrosting prevents ice buildup', 'no manual defrosting prevents ice', 'auto defrost reduces maintenance prevents ice'],
    explanation: 'Auto-defrost prevents ice buildup automatically, eliminating manual defrosting by housekeeping and maintaining consistent cooling.',
    category: 'Minibars',
    difficulty: 'hard',
    productCategory: 'minibar'
  },

  // ===== ELECTRIC KETTLES (6 questions) =====
  {
    question: 'How many electric kettle models does LAXREE offer?',
    correctAnswer: '5',
    acceptableAnswers: ['5', 'five', '5 models'],
    explanation: 'LAXREE offers 5 electric kettle models: LRWT-143, LRWT-145, LRWT-155, LRWT-150, and LRWT-156.',
    category: 'Electric Kettles',
    difficulty: 'easy',
    productCategory: 'kettle'
  },
  {
    question: 'What two standard safety features do all LAXREE kettles have?',
    correctAnswer: 'Auto shut-off and boil-dry protection',
    acceptableAnswers: ['auto shut-off and boil-dry protection', 'auto shut off boil dry protection', 'auto shut-off boil-dry', 'auto shut off and boil dry protection'],
    explanation: 'All LAXREE kettles feature auto shut-off (turns off when water boils) and boil-dry protection (turns off if no water).',
    category: 'Electric Kettles',
    difficulty: 'easy',
    productCategory: 'kettle'
  },
  {
    question: 'What is the SSP of the LRWT-143 kettle and what is its capacity?',
    correctAnswer: '₹560 for 0.6L capacity',
    acceptableAnswers: ['₹560 0.6L', '560 0.6L', '₹560 for 0.6L', '560 rupees 0.6 liter'],
    explanation: 'LRWT-143 is the 0.6L, 1000W, SS 201 kettle priced at ₹560.',
    category: 'Electric Kettles',
    difficulty: 'medium',
    productCategory: 'kettle'
  },
  {
    question: 'What is the purpose of the LRWT-158 Anti Theft Tray and what material is it made of?',
    correctAnswer: 'Prevent kettle theft in hotel rooms, made of ABS material',
    acceptableAnswers: ['prevent kettle theft ABS material', 'anti-theft ABS tray', 'prevent theft ABS', 'kettle security ABS tray'],
    explanation: 'LRWT-158 Anti Theft Tray is made of ABS material and secures the kettle to prevent theft in hotel rooms.',
    category: 'Electric Kettles',
    difficulty: 'medium',
    productCategory: 'kettle'
  },
  {
    question: 'Which LAXREE kettle has variable temperature control and what is its model number?',
    correctAnswer: 'LRWT-155 with variable temperature control',
    acceptableAnswers: ['LRWT-155 variable temperature', 'LRWT-155', 'LRWT 155 variable temp'],
    explanation: 'LRWT-155 features variable temperature control, SS 304 body, 1.0L capacity, priced at ₹1,320.',
    category: 'Electric Kettles',
    difficulty: 'hard',
    productCategory: 'kettle'
  },
  {
    question: 'Explain the difference between SS 201 and SS 304 stainless steel used in LAXREE kettles.',
    correctAnswer: 'SS 201 is budget-grade with lower corrosion resistance, SS 304 is premium-grade with superior corrosion resistance and durability',
    acceptableAnswers: ['SS 201 budget lower corrosion SS 304 premium superior corrosion durability', '201 budget 304 premium corrosion resistance', 'SS 201 lower grade SS 304 higher grade'],
    explanation: 'SS 201 is a budget-grade stainless steel suitable for standard use, while SS 304 is premium-grade with better corrosion resistance and longevity.',
    category: 'Electric Kettles',
    difficulty: 'hard',
    productCategory: 'kettle'
  },

  // ===== HAIR DRYERS & MIRRORS (6 questions) =====
  {
    question: 'Name the LAXREE foldable hair dryer model and its wattage.',
    correctAnswer: 'LRHD-280 foldable at 2100W',
    acceptableAnswers: ['LRHD-280 2100W', 'LRHD-280 foldable 2100W', 'LRHD-280 2100'],
    explanation: 'LRHD-280 is the Foldable hair dryer at 2100W with ionized air, priced at ₹1,744.',
    category: 'Hair Dryers',
    difficulty: 'easy',
    productCategory: 'hair_dryer'
  },
  {
    question: 'What are the two key features of LAXREE LED bathroom mirrors?',
    correctAnswer: 'Anti-fog technology and adjustable LED lighting',
    acceptableAnswers: ['anti-fog and LED lighting', 'anti-fog LED', 'anti fog and LED', 'LED lighting and anti-fog'],
    explanation: 'LAXREE LED mirrors feature anti-fog technology and adjustable LED lighting for clear visibility after hot showers.',
    category: 'Mirrors',
    difficulty: 'easy',
    productCategory: 'mirror'
  },
  {
    question: 'Why do hotels prefer wall-mounted hair dryers over portable models?',
    correctAnswer: 'Reduce theft risk and save bathroom counter or drawer space',
    acceptableAnswers: ['reduce theft save space', 'anti-theft space saving', 'less theft more space', 'reduce theft and save space'],
    explanation: 'Wall-mounted dryers reduce theft risk and save counter/drawer space in hotel bathrooms.',
    category: 'Hair Dryers',
    difficulty: 'medium',
    productCategory: 'hair_dryer'
  },
  {
    question: 'How does the anti-fog feature in LAXREE LED mirrors work technically?',
    correctAnswer: 'Heated demister pad behind the mirror gently warms the surface to prevent condensation',
    acceptableAnswers: ['heated demister pad behind mirror warms surface prevents condensation', 'demister pad heating prevents fog', 'heated pad prevents condensation'],
    explanation: 'A heated demister pad behind the mirror gently warms the surface, preventing condensation from forming after hot showers.',
    category: 'Mirrors',
    difficulty: 'medium',
    productCategory: 'mirror'
  },
  {
    question: 'What is ionized air technology in LAXREE hair dryers and what benefit does it provide?',
    correctAnswer: 'Negative ions break down water molecules faster reducing drying time and frizz',
    acceptableAnswers: ['negative ions break water molecules faster drying less frizz', 'ionized air reduces drying time and frizz', 'negative ions faster drying less frizz'],
    explanation: 'Ionized air technology emits negative ions that break down water molecules, reducing drying time and minimizing frizz for smoother hair.',
    category: 'Hair Dryers',
    difficulty: 'hard',
    productCategory: 'hair_dryer'
  },
  {
    question: 'What are the installation options for LAXREE LED mirrors in hotel bathrooms?',
    correctAnswer: 'Surface-mounted or recessed installation with hardwired electrical connection',
    acceptableAnswers: ['surface-mounted recessed hardwired', 'surface mount or recessed hardwired', 'surface mounted recessed hardwired connection'],
    explanation: 'LAXREE LED mirrors support surface-mounted (on top of wall) or recessed (built into wall) installation, both requiring hardwired electrical connection.',
    category: 'Mirrors',
    difficulty: 'hard',
    productCategory: 'mirror'
  },

  // ===== DIGITAL SIGNAGE (5 questions) =====
  {
    question: 'Name the three types of LAXREE digital signage products for hotels.',
    correctAnswer: 'Lobby displays, room door signs, and wayfinding kiosks',
    acceptableAnswers: ['lobby displays room door signs wayfinding kiosks', 'lobby displays door signs wayfinding', 'lobby room signage wayfinding kiosks'],
    explanation: 'LAXREE digital signage includes lobby displays, room door signs, and wayfinding kiosks.',
    category: 'Digital Signage',
    difficulty: 'easy',
    productCategory: 'digital_signage'
  },
  {
    question: 'How does LAXREE digital room signage integrate with hotel operations?',
    correctAnswer: 'Displays real-time room status like Do Not Disturb and Make Up Room linked to PMS',
    acceptableAnswers: ['real-time room status DND MUR linked to PMS', 'room status PMS integration DND MUR', 'PMS linked room status display'],
    explanation: 'LAXREE room signage integrates with PMS to display real-time room status (DND, MUR) and streamline housekeeping.',
    category: 'Digital Signage',
    difficulty: 'medium',
    productCategory: 'digital_signage'
  },
  {
    question: 'What is the primary cost saving benefit of digital lobby signage over printed materials?',
    correctAnswer: 'Eliminates recurring printing costs and enables instant content updates without reprinting',
    acceptableAnswers: ['eliminates printing costs instant updates', 'no printing costs real-time updates', 'save printing costs instant content changes'],
    explanation: 'Digital signage eliminates recurring printing costs and allows instant content updates for promotions and events.',
    category: 'Digital Signage',
    difficulty: 'medium',
    productCategory: 'digital_signage'
  },
  {
    question: 'What display technology do LAXREE digital signage products use for visibility in hotel environments?',
    correctAnswer: 'High-brightness LCD or LED panels',
    acceptableAnswers: ['high-brightness LCD LED panels', 'LCD LED panels', 'high brightness LCD LED', 'LED LCD panels high brightness'],
    explanation: 'LAXREE uses high-brightness LCD/LED panels for clear visibility even in well-lit hotel environments.',
    category: 'Digital Signage',
    difficulty: 'hard',
    productCategory: 'digital_signage'
  },
  {
    question: 'Describe how wayfinding kiosks improve guest experience in large hotel properties.',
    correctAnswer: 'Provide interactive maps and directions to rooms restaurants and amenities reducing guest confusion',
    acceptableAnswers: ['interactive maps directions rooms restaurants amenities reduce confusion', 'interactive directions reduce confusion', 'maps and navigation for guests'],
    explanation: 'Wayfinding kiosks provide interactive maps and directions to rooms, restaurants, and amenities — reducing guest frustration in large properties.',
    category: 'Digital Signage',
    difficulty: 'hard',
    productCategory: 'digital_signage'
  },

  // ===== DISPENSERS (5 questions) =====
  {
    question: 'What chamber configurations are available for LAXREE shower dispensers?',
    correctAnswer: '2-chamber and 3-chamber',
    acceptableAnswers: ['2 and 3 chamber', '2-chamber 3-chamber', '2 and 3', 'two and three chamber'],
    explanation: 'LAXREE dispensers come in 2-chamber (shampoo + body wash) and 3-chamber (shampoo + conditioner + body wash) configurations.',
    category: 'Dispensers',
    difficulty: 'easy',
    productCategory: 'dispenser'
  },
  {
    question: 'Which LAXREE dispenser model is automatic with 304 SS construction?',
    correctAnswer: 'LRWA-374',
    acceptableAnswers: ['LRWA-374', 'LRWA 374'],
    explanation: 'LRWA-374 is the Automatic 304 SS soap dispenser with 800ml capacity and anti-theft feature.',
    category: 'Dispensers',
    difficulty: 'easy',
    productCategory: 'dispenser'
  },
  {
    question: 'What percentage cost savings can hotels achieve by switching from single-use bottles to LAXREE dispensers?',
    correctAnswer: 'Up to 70%',
    acceptableAnswers: ['70%', 'up to 70%', '70 percent', '70'],
    explanation: 'Bulk dispensers reduce per-room amenity cost by up to 70% compared to single-use bottles.',
    category: 'Dispensers',
    difficulty: 'medium',
    productCategory: 'dispenser'
  },
  {
    question: 'What environmental benefit do LAXREE dispensers provide to hotels?',
    correctAnswer: 'Eliminate single-use plastic waste from mini bottles',
    acceptableAnswers: ['eliminate single-use plastic waste', 'reduce plastic waste', 'no plastic bottles', 'eliminate plastic mini bottles'],
    explanation: 'Dispensers eliminate thousands of single-use plastic bottles per year per property, supporting sustainability goals.',
    category: 'Dispensers',
    difficulty: 'medium',
    productCategory: 'dispenser'
  },
  {
    question: 'How does the anti-theft mechanism on the LRWA-374 dispenser work?',
    correctAnswer: 'Locking mechanism requires a proprietary key for refill access',
    acceptableAnswers: ['locking mechanism key for refill', 'key required for refill access', 'lock and key refill system', 'proprietary key lock mechanism'],
    explanation: 'The LRWA-374 has a locking mechanism that requires a proprietary key to open for refilling, preventing unauthorized access.',
    category: 'Dispensers',
    difficulty: 'hard',
    productCategory: 'dispenser'
  },

  // ===== HOUSEKEEPING TROLLEYS (3 questions) =====
  {
    question: 'What material types are LAXREE housekeeping trolleys available in?',
    correctAnswer: 'Metal frame and aluminum',
    acceptableAnswers: ['metal frame and aluminum', 'metal frame aluminum', 'metal and aluminum'],
    explanation: 'LAXREE offers metal frame and aluminum housekeeping trolleys in various configurations.',
    category: 'Housekeeping Trolleys',
    difficulty: 'easy',
    productCategory: 'trolley'
  },
  {
    question: 'What are three key design features that make LAXREE trolleys efficient for housekeeping?',
    correctAnswer: 'Organized compartment storage, smooth-rolling casters, and ergonomic design',
    acceptableAnswers: ['organized compartments smooth casters ergonomic', 'compartment storage casters ergonomic design', 'organized storage smooth casters ergonomic'],
    explanation: 'LAXREE trolleys feature organized compartment storage, smooth-rolling casters, and ergonomic design for efficiency.',
    category: 'Housekeeping Trolleys',
    difficulty: 'medium',
    productCategory: 'trolley'
  },
  {
    question: 'What customization options does LAXREE offer for housekeeping trolleys?',
    correctAnswer: 'Color, bag configuration, and accessories like mop holders and waste bins',
    acceptableAnswers: ['color bag configuration accessories mop holders waste bins', 'color bags accessories', 'color configuration accessories'],
    explanation: 'LAXREE trolleys can be customized in color, bag configuration (open/closed), and accessories like mop holders and waste bins.',
    category: 'Housekeeping Trolleys',
    difficulty: 'hard',
    productCategory: 'trolley'
  },

  // ===== CROSS-SELLING (2 questions) =====
  {
    question: 'When a hotel buys LAXREE safe boxes, which product is the most logical cross-sell and why?',
    correctAnswer: 'RFID door locks because both are room security products sharing the same card system',
    acceptableAnswers: ['RFID door locks room security same card system', 'RFID locks security products card system', 'RFID locks because same card system'],
    explanation: 'RFID door locks are the most logical cross-sell with safe boxes — both are security products and can share the same card technology.',
    category: 'Cross-Selling',
    difficulty: 'medium',
    productCategory: 'sales'
  },
  {
    question: 'Describe the complete room package cross-selling strategy for LAXREE products.',
    correctAnswer: 'Bundling safe, kettle, hair dryer, and minibar at a discounted room-ready price to increase order value',
    acceptableAnswers: ['bundle safe kettle hair dryer minibar discounted room-ready price', 'complete room package bundle discount', 'safe kettle hair dryer minibar bundle'],
    explanation: 'The complete room package bundles multiple products at a bundled price, increasing order value while offering per-room savings.',
    category: 'Cross-Selling',
    difficulty: 'hard',
    productCategory: 'sales'
  },

  // ===== SALES METHODOLOGY (2 questions) =====
  {
    question: 'What is the first step in the LAXREE 8-step sales process?',
    correctAnswer: 'Research and prepare before the call or meeting',
    acceptableAnswers: ['research and prepare', 'research and preparation', 'research prepare before call', 'research the customer'],
    explanation: 'Step 1 is Research & Preparation — understand the hotel, current suppliers, and pain points before contact.',
    category: 'Sales Methodology',
    difficulty: 'easy',
    productCategory: 'sales'
  },
  {
    question: 'What is a trial close in the LAXREE sales process and when is it used?',
    correctAnswer: 'Testing customer readiness to buy before the final close, used after handling objections',
    acceptableAnswers: ['testing readiness to buy before final close after objections', 'gauge buying readiness before closing', 'test readiness after objections'],
    explanation: 'A trial close tests the customer\'s buying readiness after handling objections but before the final close.',
    category: 'Sales Methodology',
    difficulty: 'hard',
    productCategory: 'sales'
  },
]

// ============================================================
// VALIDATION — Ensure exact counts
// ============================================================
if (MCQ_QUESTIONS.length !== 50) {
  throw new Error(`Expected exactly 50 MCQ questions, got ${MCQ_QUESTIONS.length}`)
}
if (SHORT_ANSWER_QUESTIONS.length !== 50) {
  throw new Error(`Expected exactly 50 SHORT_ANSWER questions, got ${SHORT_ANSWER_QUESTIONS.length}`)
}
