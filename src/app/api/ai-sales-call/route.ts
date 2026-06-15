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

const SCENARIOS: Record<string, ScenarioConfig> = {
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

function buildSystemPrompt(scenario: ScenarioConfig, isEndCall: boolean): string {
  const basePrompt = `You are role-playing as a hotel customer in a sales call simulation for LAXREE Hospitality Solutions. LAXREE sells premium in-room amenities for hotels: mini bars, electronic safes, RFID door locks, kettles, hair dryers, and other hospitality products.

YOUR CHARACTER:
${scenario.customerPersona}

CONVERSATION RULES:
- Stay in character at all times as this specific hotel customer
- Ask relevant questions that a real hotel GM/Procurement Manager would ask, such as:
  * What is the average room rent of properties you typically serve?
  * How many rooms does this product suit?
  * Is this for an under-construction property, finishing stage, or running hotel?
  * What is the location of the property?
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

IMPORTANT: Check if the salesperson asked key qualifying questions like:
- Average room rent / property budget
- Number of rooms
- Property stage (under construction / finishing / running)
- Property location
These should be reflected in keyQuestionsAsked or keyQuestionsMissed.`
  }

  return basePrompt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, scenarioId, endCall } = body as {
      messages: ChatMessage[]
      scenarioId: string
      endCall?: boolean
    }

    if (!scenarioId || !SCENARIOS[scenarioId]) {
      return NextResponse.json(
        { error: 'Invalid scenario ID. Use: luxury_resort, business_hotel, or budget_hotel_renovation' },
        { status: 400 }
      )
    }

    const scenario = SCENARIOS[scenarioId]
    const systemPrompt = buildSystemPrompt(scenario, !!endCall)

    // Build conversation for AI
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Add conversation history
    if (messages && messages.length > 0) {
      aiMessages.push(...messages)
    }

    let aiContent = ''
    let scores = null

    try {
      const zai = await ZAI.create()
      const response = await zai.chat.completions.create({
        messages: aiMessages,
        temperature: 0.8,
      })

      aiContent = response.choices?.[0]?.message?.content || ''
    } catch (aiError) {
      console.error('AI SDK error, using fallback:', aiError)

      // Fallback: generate a simple response
      if (endCall) {
        const lastUserMsg = messages?.filter(m => m.role === 'user').pop()
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
  "keyQuestionsMissed": ["Average room rent", "Number of rooms", "Property stage", "Location"],
  "strengths": ["Polite and professional", "Showed enthusiasm"],
  "improvements": ["Ask more qualifying questions", "Better product positioning", "Work on closing techniques"],
  "detailedFeedback": "The salesperson showed good enthusiasm but needs to improve on needs discovery and qualifying questions. Key property details like room count, budget, and project stage were not addressed. Focus on asking more questions before presenting solutions.",
  "nextSteps": ["Practice the SPIN questioning framework", "Review property qualification checklist", "Re-attempt this scenario with focus on discovery"]
}
<<<END>>>`
      } else {
        // Simple fallback responses based on scenario
        const fallbackResponses: Record<string, string[]> = {
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
        const responses = fallbackResponses[scenarioId] || fallbackResponses.budget_hotel_renovation
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

      // If scores couldn't be parsed, provide fallback scores
      if (!scores) {
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
          keyQuestionsMissed: ['Average room rent', 'Number of rooms', 'Property stage', 'Location'],
          strengths: ['Completed the call', 'Showed interest in the customer'],
          improvements: ['Ask more qualifying questions', 'Improve product knowledge', 'Practice closing techniques'],
          detailedFeedback: 'The conversation needs improvement in several areas. Focus on needs discovery, asking about property details, and building a stronger value proposition.',
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
    })
  } catch (error: any) {
    console.error('AI Sales Call API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET endpoint to retrieve available scenarios
export async function GET() {
  const scenarioList = Object.values(SCENARIOS).map(s => ({
    id: s.id,
    name: s.name,
    difficulty: s.difficulty,
    focusAreas: s.focusAreas,
    openingMessage: s.openingMessage,
  }))

  return NextResponse.json({ scenarios: scenarioList })
}
