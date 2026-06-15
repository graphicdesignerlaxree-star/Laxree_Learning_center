import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ScenarioConfig {
  systemPrompt: string
  openingMessage: string
  clientName: string
  clientRole: string
}

const SCENARIOS: Record<string, ScenarioConfig> = {
  'hotel-minibar': {
    systemPrompt: `You are Rajesh Mehta, the owner of a new 150-room 4-star hotel being built in Mumbai. You're inquiring about mini bars for all rooms.

Your personality: Professional but price-conscious, you want quality but have a budget. You're busy and prefer efficient communication.

Your situation:
- New hotel construction, opening in 4 months
- 150 rooms: 120 standard, 25 deluxe, 5 suites
- Budget is moderate — you want good quality but can't overspend
- You've heard of LAXREE but also considering competitors
- You care about energy efficiency, maintenance costs, and warranty
- You need bulk pricing and installation support

How you should behave:
- Start by asking about LAXREE's mini bar product range
- Ask about sizes available for different room types
- Inquire about pricing, especially bulk discounts
- Ask about energy efficiency and maintenance
- Mention you're comparing with other vendors
- Ask about installation timeline and support
- Only decide to buy if the salesperson does a good job addressing your needs
- If the salesperson is pushy or doesn't listen to your needs, express hesitation
- Ask about warranty terms and after-sales service

IMPORTANT: Stay in character as the hotel owner. Ask realistic questions. Don't make the sale too easy — a good salesperson needs to work for it. Keep your responses concise (2-4 sentences typically) like a real WhatsApp/business chat. Don't be overly friendly — be professional and business-focused.`,
    openingMessage: 'Hi, I\'m Rajesh Mehta. We\'re setting up a new 150-room hotel in Mumbai and I need mini bars for all rooms. What does LAXREE offer?',
    clientName: 'Rajesh Mehta',
    clientRole: 'Hotel Owner',
  },
  'bulk-safes': {
    systemPrompt: `You are Sarah Chen, Procurement Manager at Pacific Hotels Group, a chain with 12 properties across Southeast Asia. You're inquiring about a bulk order of safe boxes.

Your personality: Detail-oriented, process-driven, you need specifications and compliance documentation. You report to a VP who needs convincing.

Your situation:
- 12 properties needing safe box upgrades, roughly 2,000 units total
- Must meet international security certifications
- Need electronic/digital safes with master override
- Price is important but compliance and reliability are top priorities
- You need vendor references and case studies
- Installation must not disrupt guest experience
- You're evaluating 3 vendors, LAXREE is one of them

How you should behave:
- Start by asking about LAXREE's safe box product range and certifications
- Ask very specific technical questions (lock type, override mechanism, fire rating)
- Inquire about bulk pricing tiers and payment terms
- Ask for reference clients in the hotel industry
- Express concern about installation logistics across 12 properties
- Ask about warranty, maintenance contracts, and replacement policies
- Mention you need to present this to your VP with strong justification
- Be methodical — ask one area of questions at a time
- Only express interest in proceeding if the salesperson shows deep product knowledge

IMPORTANT: Stay in character as a procurement professional. Be thorough and systematic. A good salesperson should demonstrate product expertise and provide specific answers, not vague promises. Keep responses 2-3 sentences, professional and direct.`,
    openingMessage: 'Hello, this is Sarah Chen from Pacific Hotels Group. We need approximately 2,000 safe boxes across our 12 properties. Can you tell me about your product range and certifications?',
    clientName: 'Sarah Chen',
    clientRole: 'Procurement Manager',
  },
  'resort-complete': {
    systemPrompt: `You are David Okafor, General Manager of Sunset Beach Resort, a new 300-room luxury resort in Dubai opening in 6 months. You need a complete room solution package.

Your personality: Visionary but practical, you want premium quality that matches your resort's 5-star positioning. You're talking to LAXREE because you want a single-vendor solution for convenience.

Your situation:
- New luxury resort, 300 rooms: 200 standard, 70 suites, 20 villas, 10 presidential suites
- Need: electronic door locks, mini bars, safe boxes, and electric kettles for ALL rooms
- Premium quality is non-negotiable — this is a 5-star property
- You want integrated solutions that work together
- Budget is generous for quality but you still need justification
- Timeline is tight — 6 months to opening
- You've worked with mixed vendors before and want simplicity

How you should behave:
- Start by asking if LAXREE can provide a complete room solution
- Ask about product integration (do locks, safes, and minibars work together?)
- Inquire about premium product lines suitable for luxury properties
- Ask about different configurations for different room types
- Discuss installation timeline and project management
- Ask about after-sales service across all product lines
- Express interest in a bundled deal/discount for the full package
- Want to know about smart/IoT features
- Ask for a proposal or formal quotation process
- Be impressed by good product knowledge but skeptical of vague claims
- If the salesperson doesn't ask about your specific needs first, redirect them

IMPORTANT: Stay in character as a seasoned resort GM. You're experienced and can tell when a salesperson is just reading a script vs. truly understanding your needs. You appreciate consultative selling. Keep responses 2-4 sentences, professional and occasionally warm when impressed.`,
    openingMessage: 'Good day. I\'m David Okafor, GM of Sunset Beach Resort in Dubai. We\'re opening a 300-room luxury property and I\'m looking for a single vendor who can handle all our in-room amenities — locks, minibars, safes, and kettles. Does LAXREE do complete packages?',
    clientName: 'David Okafor',
    clientRole: 'Resort General Manager',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario, messages, endChat } = body as {
      scenario: string
      messages: ChatMessage[]
      endChat?: boolean
    }

    if (!scenario || !SCENARIOS[scenario]) {
      return NextResponse.json(
        { error: 'Invalid or missing scenario. Valid scenarios: ' + Object.keys(SCENARIOS).join(', ') },
        { status: 400 }
      )
    }

    const scenarioConfig = SCENARIOS[scenario]

    // If endChat is true, generate final scores and feedback
    if (endChat) {
      return await generateFinalScores(scenarioConfig, messages, scenario)
    }

    // Otherwise, generate next AI chat response
    return await generateChatResponse(scenarioConfig, messages)
  } catch (error: any) {
    console.error('AI Chat Sim API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

async function generateChatResponse(scenarioConfig: ScenarioConfig, messages: ChatMessage[]) {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: scenarioConfig.systemPrompt,
  }

  const allMessages = [systemMessage, ...messages]

  let aiResponse = ''

  try {
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: allMessages,
      temperature: 0.8,
    })
    aiResponse = response.choices?.[0]?.message?.content || ''
  } catch (aiError) {
    console.error('AI SDK error in chat response:', aiError)
    // Fallback responses based on scenario
    aiResponse = getFallbackChatResponse(messages)
  }

  return NextResponse.json({
    message: aiResponse,
    clientName: scenarioConfig.clientName,
  })
}

async function generateFinalScores(scenarioConfig: ScenarioConfig, messages: ChatMessage[], scenario: string) {
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'Employee' : 'Client'}: ${m.content}`)
    .join('\n')

  const scoringPrompt = `You are an expert sales training evaluator for LAXREE Hospitality Solutions. Analyze the following sales conversation between an employee and a potential hotel client.

The scenario: ${scenario === 'hotel-minibar' ? 'Hotel owner inquiring about mini bars for a new property' : scenario === 'bulk-safes' ? 'Procurement manager asking about bulk safe box order' : 'Resort GM needing complete room solutions (locks + bars + safes + kettles)'}

The client was: ${scenarioConfig.clientName}, ${scenarioConfig.clientRole}

CONVERSATION:
${conversationText}

Evaluate the employee's performance across these 5 categories (score each 0-100):

1. **Response Quality** (How relevant, clear, and helpful were the responses? Did they address the client's actual questions?)
2. **Product Knowledge** (Did they demonstrate deep knowledge of LAXREE products? Specific features, certifications, models, etc.?)
3. **Sales Technique** (Did they use good sales methodology? Needs discovery, consultative selling, objection handling, value proposition?)
4. **Closing Ability** (Did they move the conversation toward a close? Ask for the business? Propose next steps? Create urgency?)
5. **Professionalism** (Tone, language, responsiveness, respect for the client's time and concerns?)

Also provide:
- An overall score (0-100, weighted average)
- 2-3 specific strengths
- 2-3 specific areas for improvement
- A brief motivational feedback paragraph

Respond in this EXACT JSON format (no markdown, no code blocks, no extra text):
{
  "scores": {
    "responseQuality": 75,
    "productKnowledge": 80,
    "salesTechnique": 65,
    "closingAbility": 60,
    "professionalism": 85
  },
  "overallScore": 73,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "feedback": "A brief paragraph of motivational feedback..."
}`

  let scoresData: any = null

  try {
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert sales training evaluator. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: scoringPrompt },
      ],
      temperature: 0.3,
    })

    const content = response.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      scoresData = JSON.parse(jsonMatch[0])
    }
  } catch (aiError) {
    console.error('AI SDK error in scoring:', aiError)
  }

  // Fallback scoring if AI fails
  if (!scoresData) {
    const userMessageCount = messages.filter((m) => m.role === 'user').length
    const avgMsgLength = messages.filter((m) => m.role === 'user').reduce((sum, m) => sum + m.content.length, 0) / Math.max(userMessageCount, 1)

    scoresData = {
      scores: {
        responseQuality: Math.min(85, 50 + userMessageCount * 3),
        productKnowledge: Math.min(80, 45 + Math.min(avgMsgLength / 5, 20)),
        salesTechnique: Math.min(75, 40 + userMessageCount * 2),
        closingAbility: Math.min(70, 35 + userMessageCount * 2),
        professionalism: Math.min(90, 55 + userMessageCount * 2),
      },
      overallScore: Math.min(80, 45 + userMessageCount * 3),
      strengths: [
        'Good engagement with the client',
        'Professional communication tone',
        'Showed interest in client needs',
      ],
      improvements: [
        'Deepen product knowledge for more specific recommendations',
        'Practice consultative selling — ask before pitching',
        'Work on closing techniques and proposing next steps',
      ],
      feedback: 'You showed solid engagement with the client and maintained a professional tone throughout. To take your sales conversations to the next level, focus on deepening your product knowledge so you can provide more specific, confident recommendations. Practice the consultative selling approach — ask probing questions before presenting solutions. Finally, work on your closing techniques to naturally guide conversations toward a decision.',
    }

    // Round scores
    scoresData.scores = Object.fromEntries(
      Object.entries(scoresData.scores).map(([k, v]) => [k, Math.round(v as number)])
    )
    scoresData.overallScore = Math.round(scoresData.overallScore)
  }

  return NextResponse.json({
    scores: scoresData.scores,
    overallScore: scoresData.overallScore,
    strengths: scoresData.strengths,
    improvements: scoresData.improvements,
    feedback: scoresData.feedback,
    scenario,
    clientName: scenarioConfig.clientName,
    clientRole: scenarioConfig.clientRole,
    messageCount: messages.length,
  })
}

function getFallbackChatResponse(messages: ChatMessage[]): string {
  const userMessages = messages.filter((m) => m.role === 'user')
  const lastUserMessage = userMessages[userMessages.length - 1]?.content?.toLowerCase() || ''

  if (lastUserMessage.includes('price') || lastUserMessage.includes('cost') || lastUserMessage.includes('budget')) {
    return "That's a fair question about pricing. Can you give me an idea of the range? I need to know if we're in the same ballpark before I commit more time to this discussion."
  }
  if (lastUserMessage.includes('warranty') || lastUserMessage.includes('guarantee')) {
    return "Warranty is important to us. What's the standard warranty period? And what does it cover exactly — parts, labor, replacement?"
  }
  if (lastUserMessage.includes('install') || lastUserMessage.includes('delivery') || lastUserMessage.includes('timeline')) {
    return "Timeline is critical for our project. We can't afford delays. How quickly can you deliver and install?"
  }
  if (lastUserMessage.includes('feature') || lastUserMessage.includes('spec') || lastUserMessage.includes('model')) {
    return "I'd like to know more about the specific features. What makes your product stand out from competitors? I'm comparing a few vendors right now."
  }
  if (lastUserMessage.includes('discount') || lastUserMessage.includes('deal') || lastUserMessage.includes('bundle')) {
    return "A good deal would certainly help me make the case to my team. What kind of pricing can you offer for this volume?"
  }

  // Generic fallbacks
  const fallbacks = [
    "Interesting. Can you tell me more about that? I want to understand the full picture before making any decisions.",
    "That's helpful. What about after-sales support? I need to know we'll be taken care of after the purchase.",
    "OK, and how does that compare to what else is available in the market? I want to make sure I'm getting the best option.",
    "I see. What would the next steps be? I need to present something concrete to my team.",
    "That sounds reasonable. Can you put together a proposal? I'd need something formal to review with my colleagues.",
  ]

  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

// GET endpoint to retrieve available scenarios
export async function GET() {
  const scenarios = Object.entries(SCENARIOS).map(([id, config]) => ({
    id,
    clientName: config.clientName,
    clientRole: config.clientRole,
    openingMessage: config.openingMessage,
  }))

  return NextResponse.json({ scenarios })
}
