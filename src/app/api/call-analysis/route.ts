import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const fileName = formData.get('fileName') as string | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert file to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Determine audio format from file extension
    const ext = (fileName || audioFile.name || 'audio.wav').split('.').pop()?.toLowerCase() || 'wav'
    const formatMap: Record<string, string> = {
      mp3: 'mp3',
      wav: 'wav',
      m4a: 'm4a',
      ogg: 'ogg',
      flac: 'flac',
      webm: 'webm',
      aac: 'aac',
    }
    const format = formatMap[ext] || 'wav'

    // Step 1: Transcribe the audio using ASR
    let transcription = ''
    try {
      const zai = await ZAI.create()
      const asrResult = await zai.asr({
        audio: base64Audio,
        format,
      })
      transcription = asrResult.text || ''
    } catch (asrError) {
      console.error('ASR error:', asrError)
      return NextResponse.json(
        { error: 'Failed to transcribe audio. Please try again with a clearer recording.', stage: 'transcription' },
        { status: 500 }
      )
    }

    if (!transcription || transcription.trim().length < 10) {
      return NextResponse.json(
        { error: 'Audio transcription was too short or empty. Please ensure the recording contains clear speech.', stage: 'transcription', transcription },
        { status: 422 }
      )
    }

    // Step 2: Analyze the transcription using LLM — Expert AI Sales Assistant for Hotel Amenities
    let analysisResult: Record<string, unknown> = {}
    let rawAiResponse = ''

    try {
      const zai = await ZAI.create()
      const response = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an Expert AI Sales Assistant for LAXREE Hospitality Solutions — a premium hotel amenities brand selling mini bars, safe boxes, RFID door locks, electric kettles, digital signage, dispensers, housekeeping trolleys, mirrors, hair dryers, and other in-room products to hotels, resorts, and serviced apartments.

Your job is to analyze a REAL sales call recording (transcribed) between a LAXREE salesperson and a hotel client, and provide coaching that is:
- SHORT & SWEET (no long paragraphs — easy to understand, presentable)
- HOTEL-INDUSTRY AWARE (you understand ARR / Average Room Rent, property types, property stages, locations)
- ACTIONABLE (specific things the salesperson can say next time)

## HOTEL INDUSTRY CONTEXT YOU MUST USE
When evaluating discovery, check whether the salesperson uncovered:
- **ARR (Average Room Rent)**: The per-night average room rate. Critical for pricing tier recommendations. Budget (<₹2,000), Mid-scale (₹2,000–5,000), Upper Mid (₹5,000–10,000), Luxury (>₹10,000).
- **Property Type**: Business hotel, Resort, Boutique, Budget/Economy, Serviced Apartments, Heritage.
- **Property Stage**: Pre-opening (under construction), Finishing phase ( interiors being done), Running operational hotel, Renovation/refurbishment.
- **Location**: Metro city, Tier-2 city, Holiday destination, Pilgrimage town, Highway/motorway.
- **Room Count**: Total keys — determines deal size.
- **Current Competitor Products**: Quba, MiniBar Systems, Cobalt, Hafele, Godrej, etc.

## SCORING (0-100 per category)
1. **Opening** — Greeting, self intro, LAXREE intro, rapport. Was it warm and brief?
2. **Discovery** — Did they ask about ARR, property type, stage, location, room count, current products? This is THE most important category.
3. **Product Pitch** — Did they pitch the RIGHT product for the client's tier? Was the pitch SHORT & SWEET (not a long company history)? Did they lead with guest-experience benefits + ROI?
4. **Objection Handling** — Price, competition ("we already use Quba"), timing. Did they reframe value vs cost?
5. **Closing** — Clear next step? Site visit, sample demo, proposal, follow-up call?
6. **Enthusiasm** — Energy, confidence, passion for LAXREE products.
7. **Overall** — Weighted total.

## SPECIAL HANDLING: Client Cut the Call
If the transcription suggests the client cut/disconnected the call abruptly (short call, client said "I'll call you back" / "send details on WhatsApp" / hung up mid-sentence), DO NOT blame the salesperson. Instead:
- Acknowledge it may not be their mistake (client could be busy, not the right time, already has a vendor)
- Provide "Interest-Building Techniques" — short, specific things to say in the follow-up that rebuild interest WITHOUT being pushy
- Suggest a crisp WhatsApp/ SMS follow-up message template (under 100 words)

## PITCH GUIDANCE
Provide a "recommendedPitch" — a SHORT & SWEET, presentable, easy-to-understand pitch the salesperson can use for THIS client type. Maximum 3-4 sentences. Must mention:
- One guest-experience benefit (e.g., "guests love the silent cooling minibar")
- One ROI / commercial benefit (e.g., "payback in 8 months via minibar sales")
- One differentiator vs competitors (e.g., "5-year warranty vs Quba's 2-year")
NO long company history. NO long feature lists. Just the hook.

## RESPONSE FORMAT — return ONLY raw JSON, no markdown, no code fences:
{
  "scores": {
    "opening": 0,
    "discovery": 0,
    "productPitch": 0,
    "objectionHandling": 0,
    "closing": 0,
    "enthusiasm": 0,
    "overall": 0
  },
  "openingFeedback": "1-2 short sentences",
  "discoveryFeedback": "1-2 short sentences — mention which of ARR/property type/stage/location they missed",
  "productPitchFeedback": "1-2 short sentences",
  "objectionHandlingFeedback": "1-2 short sentences",
  "closingFeedback": "1-2 short sentences",
  "enthusiasmFeedback": "1 short sentence",
  "overallFeedback": "2-3 short sentences summary",
  "keyStrengths": ["short strength 1", "short strength 2"],
  "improvements": ["short improvement 1", "short improvement 2"],
  "suggestions": ["specific actionable suggestion 1", "specific actionable suggestion 2", "specific actionable suggestion 3"],
  "callSummary": "2-3 sentences: what happened, client type, outcome",
  "clientProfile": {
    "detected": true,
    "propertyType": "Business hotel / Resort / Boutique / Budget / Unknown",
    "propertyStage": "Pre-opening / Finishing / Operational / Renovation / Unknown",
    "location": "Metro / Tier-2 / Holiday destination / Unknown",
    "arrRange": "Budget / Mid-scale / Upper Mid / Luxury / Unknown",
    "roomCount": "approx number or 'Not asked'"
  },
  "recommendedPitch": "Short & sweet 3-4 sentence pitch tailored to this client type — presentable and easy to understand",
  "interestBuildingTips": ["short tip 1 — what to say to rebuild interest if client seems disengaged", "short tip 2", "short tip 3"],
  "followUpMessage": "A crisp WhatsApp-ready follow-up message under 100 words the salesperson can send",
  "clientCutCall": false,
  "clientCutReason": "If client cut the call, briefly say why it's NOT the salesperson's fault + what to do next. Otherwise null."
}`,
          },
          {
            role: 'user',
            content: `Please analyze this LAXREE hotel-amenities sales call transcription:\n\n${transcription}`,
          },
        ],
      })

      rawAiResponse = response.choices?.[0]?.message?.content || ''

      // Parse JSON from AI response
      try {
        const jsonMatch = rawAiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0])
        }
      } catch {
        analysisResult = { parseError: true, rawResponse: rawAiResponse }
      }
    } catch (llmError) {
      console.error('LLM error:', llmError)
      // Provide fallback analysis if LLM fails
      analysisResult = {
        scores: { opening: 50, discovery: 50, productPitch: 50, objectionHandling: 50, closing: 50, enthusiasm: 50, overall: 50 },
        openingFeedback: 'AI analysis unavailable. Please try again.',
        discoveryFeedback: 'AI analysis unavailable.',
        productPitchFeedback: 'AI analysis unavailable.',
        objectionHandlingFeedback: 'AI analysis unavailable.',
        closingFeedback: 'AI analysis unavailable.',
        enthusiasmFeedback: 'AI analysis unavailable.',
        overallFeedback: 'AI analysis was unavailable due to a processing error. Your transcription was captured successfully.',
        keyStrengths: ['Transcription completed successfully'],
        improvements: ['Re-upload the recording for full AI analysis'],
        suggestions: ['Try again in a moment'],
        callSummary: 'Analysis unavailable - transcription captured.',
        clientProfile: { detected: false, propertyType: 'Unknown', propertyStage: 'Unknown', location: 'Unknown', arrRange: 'Unknown', roomCount: 'Not asked' },
        recommendedPitch: 'AI pitch guidance unavailable. Please retry.',
        interestBuildingTips: ['Retry analysis for tailored interest-building tips'],
        followUpMessage: 'Hello! Thanks for your time earlier. Sharing our LAXREE hotel amenities catalog as requested. Happy to answer any questions. — [Your Name]',
        clientCutCall: false,
        clientCutReason: null,
      }
    }

    return NextResponse.json({
      transcription,
      analysis: analysisResult,
      metadata: {
        fileName: fileName || audioFile.name || 'unknown',
        fileSize: audioFile.size,
        format,
        analyzedAt: new Date().toISOString(),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Call Analysis API error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET endpoint to retrieve past analyses (stored client-side for now)
export async function GET() {
  return NextResponse.json({ analyses: [] })
}
