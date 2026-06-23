import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ScenarioConfig {
  id: string
  name: string
  customerPersona: string
  openingMessage: string
  difficulty: string
  focusAreas: string[]
}

interface CallScores {
  communication: number
  salesTechnique: number
  productKnowledge: number
  closingSkills: number
  enthusiasm: number
  overallScore: number
  closingEffectiveness: number
  excitementLevel: number
  keyQuestionsAsked: string[]
  keyQuestionsMissed: string[]
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  nextSteps: string[]
}

type Segment = 'ROOFING' | 'AMENITIES'

function resolveSegment(value: unknown): Segment {
  return value === 'ROOFING' ? 'ROOFING' : 'AMENITIES'
}

// ─── AMENITIES scenarios (LAXREE Hospitality Solutions) ─────────────

const AMENITIES_SCENARIOS: Record<string, ScenarioConfig> = {
  luxury_resort: {
    id: 'luxury_resort',
    name: 'Luxury Resort',
    customerPersona: `You are Mr. Arjun Mehta, the General Manager of "The Royal Palms Resort & Spa", a 5-star luxury resort in Goa with 180 rooms. You are discerning, quality-focused, and expect premium service. You care about aesthetics, guest experience, and brand reputation. You're skeptical about switching suppliers but curious if there's something better. You tend to ask detailed questions about product quality, customization options, and after-sales service. Your resort is currently running and you're considering upgrading the in-room amenities. Your current average room rent is ₹18,000/night. You prefer suppliers who understand luxury hospitality.`,
    openingMessage: `Hello, I'm Arjun Mehta, GM at The Royal Palms Resort & Spa in Goa. I received your email about your hospitality product line. We're currently reviewing our in-room amenities — our current mini bar and safe suppliers haven't been meeting our quality standards. What can you tell me about your products?`,
    difficulty: 'Advanced',
    focusAreas: ['Premium positioning', 'Quality emphasis', 'Customization options', 'Brand alignment'],
  },
  business_hotel: {
    id: 'business_hotel',
    name: 'Business Hotel',
    customerPersona: `You are Priya Sharma, Procurement Manager at "Metro Heights Business Hotel", a 120-room business hotel in Mumbai's financial district. You are cost-conscious but not cheap — you want value for money. You care about durability, ease of maintenance, and ROI. You're practical and direct. You ask pointed questions about pricing, warranty, installation timelines, and bulk discounts. Your hotel is finishing renovation and will open in 3 months. Your projected average room rent is ₹6,500/night. You need products that can handle high occupancy and frequent use.`,
    openingMessage: `Hi, this is Priya Sharma from Metro Heights Business Hotel. We're in the final stages of renovation and I'm looking for in-room amenities — mini bars, safes, and kettles. Our property has 120 rooms and we're targeting corporate clientele. Can you give me a quick overview of what you offer and pricing?`,
    difficulty: 'Intermediate',
    focusAreas: ['Value proposition', 'Bulk pricing', 'Durability & warranty', 'Installation support'],
  },
  budget_hotel_renovation: {
    id: 'budget_hotel_renovation',
    name: 'Budget Hotel Renovation',
    customerPersona: `You are Ramesh Kulkarni, owner of "City Comfort Inn", a 65-room budget hotel near Pune airport. Your hotel has been running for 8 years and you're doing a phased renovation. You are very price-sensitive and need to see clear ROI. You're skeptical about spending on premium amenities for a budget property. You ask tough questions about whether these products are worth it for a budget hotel, payback period, and whether guests even care about these things at this price point. Your average room rent is ₹2,200/night. You need convincing that upgrading amenities will increase occupancy or room rates.`,
    openingMessage: `Hello, I'm Ramesh Kulkarni, owner of City Comfort Inn near Pune airport. One of my friends who runs a hotel suggested I talk to you. Honestly, I'm not sure if we need fancy in-room amenities — we're a budget hotel and our guests just want a clean room. But I'm open to hearing your thoughts. What makes you think your products would work for a property like mine?`,
    difficulty: 'Beginner',
    focusAreas: ['ROI demonstration', 'Budget-friendly options', 'Practical benefits', 'Closing with urgency'],
  },
}

// ─── ROOFING scenarios (Laxree Roofing — stone-coated / thatch / asphalt shingle) ──

const ROOFING_SCENARIOS: Record<string, ScenarioConfig> = {
  homeowner_villa: {
    id: 'homeowner_villa',
    name: 'Homeowner — Premium Villa',
    customerPersona: `You are Vikram Mehta, a successful entrepreneur in Pune building a 5,000 sq ft luxury villa for your family. You are quality-conscious and proud of your home — you want a roof that looks elegant and lasts a lifetime. You have only ever used traditional clay tiles on previous homes and are sceptical about newer materials like stone-coated metal tiles. You worry about whether they look authentic, whether they rust or fade, and whether they justify the premium price. Your budget is flexible for the right product, but you need to be convinced of value. You ask detailed questions about lifespan, warranty, available profiles, and how the tiles handle Pune's hot summers and monsoon. You tend to compare everything to the clay tiles you know.`,
    openingMessage: `Hello, I'm Vikram Mehta. We're building a 5,000 sq ft villa in Pune and our architect suggested premium roofing instead of regular clay tiles. Honestly, I've only ever used clay tiles on previous homes and I'm not familiar with stone-coated roofing. I want something elegant and long-lasting, but I need to understand why I should pay more. What can you tell me about your Laxree tiles?`,
    difficulty: 'Advanced',
    focusAreas: ['Premium positioning', 'Lifespan & warranty', 'Aesthetics & profiles', 'Weather resistance'],
  },
  builder_bulk: {
    id: 'builder_bulk',
    name: 'Builder — 50-Villa Township',
    customerPersona: `You are Rajiv Khanna, Project Director at Skyline Builders, a mid-sized real estate developer in Bangalore. You are currently constructing a 50-villa gated township and need roofing for every villa. You are sharp, experienced, and have already collected quotes from two of Laxree's competitors — one offering clay tiles and one offering concrete tiles. Your approved project budget is ₹1.2 Cr but you have a target to close roofing at ₹1 Cr. You push hard for bulk discounts, extended warranty, and flexible payment milestones tied to construction phases. You evaluate vendors on total cost of ownership, delivery reliability, and post-installation support. You respect vendors who can defend their value but quickly lose patience with vague answers. You are ready to make a decision within two weeks.`,
    openingMessage: `Hi, this is Rajiv Khanna, Project Director at Skyline Builders. We're constructing a 50-villa gated township in Bangalore and we need roofing for every villa. I'm already talking to two of your competitors — one offering clay tiles, one concrete — and I have a budget of around ₹1.2 Cr. I want to close this at ₹1 Cr. If you want this order, you'll need to offer a sharp bulk price, an extended warranty, and flexible payment terms. What's your best offer?`,
    difficulty: 'Intermediate',
    focusAreas: ['Bulk pricing', 'Competitive differentiation', 'Warranty terms', 'Payment flexibility'],
  },
  architect_resort: {
    id: 'architect_resort',
    name: 'Architect — Resort Project',
    customerPersona: `You are Priya Nair, a senior architect at a Kerala-based design firm specialising in hospitality and resort projects. You are currently designing a beachside resort with 20 cottage-style buildings, plus gazebos and poolside cabanas. You came across the Laxree Roofing website and were impressed by the product range — you are considering stone-coated tiles for the main cottage roofs and artificial thatch tiles for the gazebos and cabanas. You are a warm, consultative lead who values technical specification support, design flexibility, and material certification (fire rating, wind uplift, UV resistance). You ask thoughtful questions about tile profiles, colour options, installation details, and whether Laxree can provide architect support like drawings, samples, and site visits. You are not price-sensitive at this stage — you care most about finding the right product and partner.`,
    openingMessage: `Good day. I'm Priya Nair, an architect designing a resort in Kerala with 20 cottage-style buildings. I came across the Laxree Roofing website and I'm quite interested. I'm thinking stone-coated tiles for the main cottage roofs and your artificial thatch for the gazebos and poolside cabanas. Can you walk me through how the two product lines work together and what specification support you provide to architects?`,
    difficulty: 'Beginner',
    focusAreas: ['Consultative discovery', 'Cross-product solutioning', 'Specification support', 'Site visit proposal'],
  },
}

function getScenarioMap(segment: Segment): Record<string, ScenarioConfig> {
  return segment === 'ROOFING' ? ROOFING_SCENARIOS : AMENITIES_SCENARIOS
}

// ─── System prompt builder (segment-aware) ──────────────────────────

function buildSystemPrompt(scenario: ScenarioConfig, isEndCall: boolean, segment: Segment): string {
  const isRoofing = segment === 'ROOFING'

  const brandContext = isRoofing
    ? `You are role-playing as an Indian roofing customer in a sales call simulation for Laxree Roofing. Laxree Roofing sells premium roofing solutions: stone-coated roof tiles (Classic, Classic Pro, Shingle, Nosen, Wood, Tudor Pro profiles), artificial thatch tiles (500mm & 1000mm sizes), and asphalt shingle tiles (Laminated, Mosaic, 3-Tab lines). Laxree tiles are UV-resistant, fire-resistant, weatherproof, and come with a 30+ year service life and strong warranty.`
    : `You are role-playing as a hotel customer in a sales call simulation for LAXREE Hospitality Solutions. LAXREE sells premium in-room amenities for hotels: mini bars, electronic safes, RFID door locks, kettles, hair dryers, and other hospitality products.`

  const qualifyingQuestionsBlock = isRoofing
    ? `Ask relevant questions that a real Indian roofing customer would ask, such as:
  * Is this for a new build, a renovation, or a township / bulk project?
  * What is the total roof area or number of villas / buildings?
  * What is the location? (Climate zone matters — coastal, monsoon, hot/dry, hill station)
  * What is the project timeline and when do you need delivery?
  * What is the budget range and what roofing material are you currently considering (clay, concrete, shingles)?
  * What profiles and colour options are available? Can I see samples?`
    : `Ask relevant questions that a real hotel GM/Procurement Manager would ask, such as:
  * What is the average room rent of properties you typically serve?
  * How many rooms does this product suit?
  * Is this for an under-construction property, finishing stage, or running hotel?
  * What is the location of the property?`

  const basePrompt = `${brandContext}

YOUR CHARACTER:
${scenario.customerPersona}

CONVERSATION RULES:
- Stay in character at all times as this specific ${isRoofing ? 'roofing' : 'hotel'} customer
- ${qualifyingQuestionsBlock}
- Respond naturally to what the salesperson says
- Show appropriate skepticism or interest based on your character
- If the salesperson is good, gradually show more interest
- If the salesperson is poor, show impatience or disinterest
- Don't make it too easy — realistic sales resistance
- Keep responses conversational and concise (2-4 sentences typically)
- After about 6-10 exchanges, naturally wind down the conversation (say you need to think about it, ask for a proposal, or agree to a meeting)`

  if (isEndCall) {
    return basePrompt + `

The salesperson has indicated they want to end the call. Respond with a brief closing statement that feels natural (like thanking them and saying you'll review or get back to them), then provide a DETAILED SCORING in this exact JSON format at the end of your message enclosed in <<<JSON>>> and <<<END>>> markers:

<<<JSON>>>
{
  "communication": <score 0-100>,
  "salesTechnique": <score 0-100>,
  "productKnowledge": <score 0-100>,
  "closingSkills": <score 0-100>,
  "enthusiasm": <score 0-100>,
  "overallScore": <score 0-100>,
  "closingEffectiveness": <score 0-100>,
  "excitementLevel": <score 0-100>,
  "keyQuestionsAsked": ["question1", "question2"],
  "keyQuestionsMissed": ["missed1", "missed2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "detailedFeedback": "A 3-4 sentence comprehensive feedback paragraph",
  "nextSteps": ["step1", "step2"]
}
<<<END>>>

SCORING GUIDELINES:
- Communication (0-100): Clarity, active listening, professional tone, articulation, rapport building
- Sales Technique (0-100): Needs discovery, objection handling, value proposition, questioning strategy, presentation skills
- Product Knowledge (0-100): Accuracy of product info, ability to match products to customer needs, competitive awareness
- Closing Skills (0-100): Trial closes, urgency creation, next steps establishment, call-to-action effectiveness
- Enthusiasm (0-100): Energy level, passion, confidence, engagement, positive attitude
- Closing Effectiveness (0-100): How well they moved toward closing the deal or setting up next steps
- Excitement Level (0-100): How enthusiastic and engaging the salesperson was throughout the call

IMPORTANT: Check if the salesperson asked key qualifying questions. ${
      isRoofing
        ? `For roofing these include:
- Project type (new build / renovation / township)
- Roof area or number of villas / buildings
- Location (climate zone)
- Timeline and budget
- Current roofing material being considered`
        : `For hospitality these include:
- Average room rent / property budget
- Number of rooms
- Property stage (under construction / finishing / running)
- Property location`
    }
These should be reflected in keyQuestionsAsked or keyQuestionsMissed.`
  }

  return basePrompt
}

// ─── Fallback responses (segment-aware) ─────────────────────────────

const AMENITIES_FALLBACKS: Record<string, string[]> = {
  luxury_resort: [
    "That's interesting. Can you tell me more about the quality standards your products meet? Our guests expect nothing but the best.",
    "I see. What about customization options? Our resort has a very specific aesthetic we need to maintain.",
    "What kind of after-sales support do you provide? We've had issues with our current supplier's response times.",
    "How do your mini bars compare to what we currently have? I'd need to see a significant improvement to justify a switch.",
  ],
  business_hotel: [
    "Okay, that's helpful. What's the pricing like for 120 rooms? We need competitive rates.",
    "What about warranty and maintenance? Our last supplier's products kept breaking down.",
    "Installation timeline is critical for us — we open in 3 months. Can you commit to that?",
    "Do you offer bulk discounts? We're looking at a complete package — mini bars, safes, and kettles.",
  ],
  budget_hotel_renovation: [
    "Hmm, but do budget hotel guests really care about mini bars and safes? I'm not sure it's worth the investment.",
    "What's the payback period though? I need to see clear ROI before spending anything.",
    "Our rooms are only ₹2,200/night. Would your products even make sense at that price point?",
    "Look, I appreciate the information, but I need to be practical here. What's the most budget-friendly option you have?",
  ],
}

const ROOFING_FALLBACKS: Record<string, string[]> = {
  homeowner_villa: [
    "That's interesting. But clay tiles have served Indian homes for decades — what makes stone-coated better? I don't want something that fades or rusts after a few monsoons.",
    "Can you walk me through the different profiles? My architect mentioned Classic and Tudor — I'd like to see what each looks like before committing.",
    "What about the warranty? For a premium price, I'd expect at least a 30-year cover. And how does it handle Pune's summer heat?",
    "Honestly, the price feels steep compared to clay. Can you justify the difference? If the lifespan and aesthetics are clearly superior, I'm open to it.",
  ],
  builder_bulk: [
    "Okay, but I already have a clay tile quote at ₹85 per sq ft and a concrete quote at ₹72. You'll need to come in competitively on price — what's your best bulk rate for 50 villas?",
    "Warranty is critical for a township project — the residents' association will hold us accountable. What extended warranty can you offer at this volume?",
    "Payment terms matter. We pay in milestones tied to construction phases. Can you align with that, or do you need a big upfront chunk?",
    "Two of your competitors are offering free site measurement and installer training. If you want this order, you'll need to match that and show me why stone-coated is the better long-term bet for the residents.",
  ],
  architect_resort: [
    "That's helpful. For the main cottage roofs, which stone-coated profile would you recommend for a coastal Kerala climate? I'm concerned about salt air and heavy monsoon.",
    "On the thatch tiles for the cabanas — are they fire-rated? Resorts have strict fire safety norms and I can't specify anything without certification.",
    "Can your team provide detail drawings, BIM objects, and sample tiles for our client presentation? That would make it much easier for me to specify Laxree.",
    "I'd like to propose a site visit so my team can see the products installed. Do you have a reference project in Kerala or Goa we could visit?",
  ],
}

function getFallbackMap(segment: Segment): Record<string, string[]> {
  return segment === 'ROOFING' ? ROOFING_FALLBACKS : AMENITIES_FALLBACKS
}

// ─── POST handler ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, scenarioId, endCall, segment } = body as {
      messages: ChatMessage[]
      scenarioId: string
      endCall?: boolean
      segment?: Segment
    }

    const resolvedSegment = resolveSegment(segment)
    const SCENARIOS = getScenarioMap(resolvedSegment)

    if (!scenarioId || !SCENARIOS[scenarioId]) {
      const validIds = Object.keys(SCENARIOS).join(', ')
      return NextResponse.json(
        {
          error: `Invalid scenario ID for segment ${resolvedSegment}. Use: ${validIds}`,
        },
        { status: 400 }
      )
    }

    const scenario = SCENARIOS[scenarioId]
    const systemPrompt = buildSystemPrompt(scenario, !!endCall, resolvedSegment)

    // Build conversation for AI
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Add conversation history
    if (messages && messages.length > 0) {
      aiMessages.push(...messages)
    }

    let aiContent = ''
    let scores: CallScores | null = null

    try {
      const zai = await ZAI.create()
      const response = await zai.chat.completions.create({
        messages: aiMessages,
        temperature: 0.8,
      })

      aiContent = response.choices?.[0]?.message?.content || ''
    } catch (aiError) {
      console.error('AI SDK error, using fallback:', aiError)

      const isRoofing = resolvedSegment === 'ROOFING'
      const missedQuestions = isRoofing
        ? ['Project type', 'Roof area / number of villas', 'Location', 'Timeline']
        : ['Average room rent', 'Number of rooms', 'Property stage', 'Location']
      const fallbackDetailedFeedback = isRoofing
        ? "The salesperson showed good enthusiasm but needs to improve on needs discovery and qualifying questions. Key project details like roof area, location/climate, project type, and timeline were not addressed. Focus on asking more questions before presenting Laxree Roofing solutions."
        : "The salesperson showed good enthusiasm but needs to improve on needs discovery and qualifying questions. Key property details like room count, budget, and project stage were not addressed. Focus on asking more questions before presenting solutions."

      // Fallback: generate a simple response
      if (endCall) {
        aiContent = `Thank you for the call. I appreciate your time and the information you've shared. Let me review everything with my team and I'll get back to you soon.

<<<JSON>>>
{
  "communication": 65,
  "salesTechnique": 55,
  "productKnowledge": 60,
  "closingSkills": 50,
  "enthusiasm": 70,
  "overallScore": 60,
  "closingEffectiveness": 55,
  "excitementLevel": 65,
  "keyQuestionsAsked": [],
  "keyQuestionsMissed": ${JSON.stringify(missedQuestions)},
  "strengths": ["Polite and professional", "Showed enthusiasm"],
  "improvements": ["Ask more qualifying questions", "Better product positioning", "Work on closing techniques"],
  "detailedFeedback": "${fallbackDetailedFeedback}",
  "nextSteps": ["Practice the SPIN questioning framework", "Review ${isRoofing ? 'roofing project' : 'property'} qualification checklist", "Re-attempt this scenario with focus on discovery"]
}
<<<END>>>`
      } else {
        // Simple fallback responses based on scenario and segment
        const fallbackResponses = getFallbackMap(resolvedSegment)
        const responses = fallbackResponses[scenarioId] || (isRoofing ? ROOFING_FALLBACKS.architect_resort : AMENITIES_FALLBACKS.budget_hotel_renovation)
        const msgCount = messages?.filter(m => m.role === 'user').length || 0
        aiContent = responses[msgCount % responses.length]
      }
    }

    // If end call, try to extract scores from the AI response
    if (endCall) {
      try {
        const jsonMatch = aiContent.match(/<<<JSON>>>([\s\S]*?)<<<END>>>/)
        if (jsonMatch) {
          scores = JSON.parse(jsonMatch[1])
          // Clean the display content by removing the JSON block
          aiContent = aiContent.replace(/<<<JSON>>>[\s\S]*?<<<END>>>/, '').trim()
        }
      } catch (parseError) {
        console.error('Failed to parse scores:', parseError)
      }

      // If scores couldn't be parsed, provide fallback scores (segment-aware)
      if (!scores) {
        const isRoofing = resolvedSegment === 'ROOFING'
        const missedQuestions = isRoofing
          ? ['Project type', 'Roof area / number of villas', 'Location', 'Timeline']
          : ['Average room rent', 'Number of rooms', 'Property stage', 'Location']
        const fallbackDetailedFeedback = isRoofing
          ? 'The conversation needs improvement in several areas. Focus on needs discovery — ask about project type, roof area, location/climate, and timeline — and build a stronger value proposition around Laxree Roofing\'s 30+ year lifecycle, profiles, and weather performance.'
          : 'The conversation needs improvement in several areas. Focus on needs discovery, asking about property details, and building a stronger value proposition.'

        scores = {
          communication: 60,
          salesTechnique: 55,
          productKnowledge: 58,
          closingSkills: 50,
          enthusiasm: 65,
          overallScore: 58,
          closingEffectiveness: 52,
          excitementLevel: 60,
          keyQuestionsAsked: [],
          keyQuestionsMissed: missedQuestions,
          strengths: ['Completed the call', 'Showed interest in the customer'],
          improvements: ['Ask more qualifying questions', 'Improve product knowledge', 'Practice closing techniques'],
          detailedFeedback: fallbackDetailedFeedback,
          nextSteps: ['Review the sales call framework', 'Practice qualifying questions', 'Try this scenario again'],
        }
      }
    }

    return NextResponse.json({
      message: aiContent,
      scores: scores,
      scenario: {
        id: scenario.id,
        name: scenario.name,
        difficulty: scenario.difficulty,
        focusAreas: scenario.focusAreas,
      },
      segment: resolvedSegment,
    })
  } catch (error: unknown) {
    console.error('AI Sales Call API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET endpoint (segment-aware) ───────────────────────────────────

export async function GET(request: NextRequest) {
  const segment = resolveSegment(request.nextUrl.searchParams.get('segment'))
  const SCENARIOS = getScenarioMap(segment)

  const scenarioList = Object.values(SCENARIOS).map(s => ({
    id: s.id,
    name: s.name,
    difficulty: s.difficulty,
    focusAreas: s.focusAreas,
    openingMessage: s.openingMessage,
  }))

  return NextResponse.json({ scenarios: scenarioList, segment })
}
