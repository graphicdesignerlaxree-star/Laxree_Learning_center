import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json()
    const zai = await ZAI.create()
    
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful AI sales coach for LAXREE Hospitality Solutions, a B2B hospitality products company in India. Help employees practice sales scenarios, learn about products, and improve their selling skills. Be encouraging, professional, and provide specific actionable advice.' },
        ...messages
      ]
    })
    
    return NextResponse.json({ 
      message: response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    })
  } catch (error: any) {
    console.error('LLM error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
