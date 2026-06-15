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

    // Step 2: Analyze the transcription using LLM
    let analysisResult: Record<string, unknown> = {}
    let rawAiResponse = ''

    try {
      const zai = await ZAI.create()
      const response = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert sales call analyst for LAXREE Hospitality Solutions, a luxury hotel amenities company that sells mini bars, safe boxes, RFID locks, kettles, and other hotel room products to hotels and resorts.

Analyze the following sales call transcription and provide a detailed evaluation. The call is between a LAXREE salesperson and a potential hotel client.

Score each category from 0-100 and provide specific feedback.

Categories to evaluate:
1. **Opening** (0-100): Was the greeting professional? Did they introduce themselves and LAXREE properly? Did they establish rapport?
2. **Discovery Questions** (0-100): Did the salesperson ask key property questions like:
   - Average room rent / ADR
   - Number of rooms / scale of property
   - Property stage (under construction / finishing / running hotel)
   - Location of the property
   - Current amenities / competitor products
3. **Product Pitch** (0-100): Did they present LAXREE products effectively? Did they align features with the client's needs? Did they mention relevant products (mini bars, safes, locks, kettles)?
4. **Objection Handling** (0-100): How well did they handle price objections, competition mentions, or hesitation? Did they use feel-felt-found or other techniques?
5. **Closing** (0-100): Did they close with a clear next step? Did they schedule a follow-up, request a site visit, or get a commitment?
6. **Enthusiasm** (0-100): Level of energy, excitement, and engagement throughout the call. Did they sound confident and passionate about LAXREE products?
7. **Overall** (0-100): Weighted overall quality of the call

Also provide:
- Key strengths (what went well)
- Areas for improvement
- Specific improvement suggestions
- A summary of the call

Respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "scores": {
    "opening": 75,
    "discovery": 60,
    "productPitch": 70,
    "objectionHandling": 55,
    "closing": 40,
    "enthusiasm": 80,
    "overall": 65
  },
  "openingFeedback": "Specific feedback about the opening...",
  "discoveryFeedback": "Specific feedback about discovery questions...",
  "productPitchFeedback": "Specific feedback about product pitch...",
  "objectionHandlingFeedback": "Specific feedback about objection handling...",
  "closingFeedback": "Specific feedback about closing...",
  "enthusiasmFeedback": "Specific feedback about enthusiasm level...",
  "overallFeedback": "Overall assessment summary...",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"],
  "callSummary": "Brief summary of what happened in the call..."
}`,
          },
          {
            role: 'user',
            content: `Please analyze this sales call transcription:\n\n${transcription}`,
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
