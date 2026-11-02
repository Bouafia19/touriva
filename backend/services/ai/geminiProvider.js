const axios = require('axios')

/**
 * Google Gemini Provider for Touriva Trip Itinerary Generation.
 * Communicates directly with Google Generative AI REST endpoints.
 * Keeps credentials server-side and enforces JSON-only output.
 */
class GeminiProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY
    this.model = config.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    this.timeout = config.timeout || 45000
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0)
  }

  async generateItinerary({
    city,
    days,
    budget,
    partyType,
    preferences = [],
    hotels = [],
    restaurants = [],
    sites = []
  }) {
    if (!this.isConfigured()) {
      throw new Error('GEMINI_API_KEY is not configured on the server.')
    }

    const systemPrompt = `You are Touriva's Expert Algerian Travel Concierge.
Touriva is an authentic Algerian travel platform celebrating Algeria's UNESCO World Heritage, Roman ruins, Sahara desert, coastal Mediterranean gems, and culinary traditions.
Your mission is to craft an inspiring, realistic, and culturally rich multi-day itinerary.
You MUST output strictly valid JSON matching the exact schema provided. Do NOT output markdown code blocks, explanations, or prose outside the JSON.`

    const userPrompt = `Generate a ${days}-day itinerary for ${city}.
Travel Party: ${partyType || 'Solo / Travelers'}
Budget Tier: ${budget || 'Medium'}
Traveler Interests: ${preferences.join(', ') || 'Cultural heritage, local cuisine, scenic landmarks'}

Reference local assets if relevant:
- Hotels: ${JSON.stringify((hotels || []).slice(0, 5))}
- Dining / Restaurants: ${JSON.stringify((restaurants || []).slice(0, 5))}
- Attractions / Sites: ${JSON.stringify((sites || []).slice(0, 5))}

Return ONLY a JSON object with this EXACT structure:
{
  "name": "${days}-Day Heritage Expedition in ${city}",
  "description": "Inspiring 2-3 sentence overview of this curated journey.",
  "durationDays": ${days},
  "price": "${days * 15000} DZD",
  "rating": 4.9,
  "theme": "Cultural Heritage & Discovery",
  "meetingPoint": "Central ${city} Historic Center",
  "cancellationPolicy": "Free cancellation up to 48 hours prior to start.",
  "inclusions": [
    "Certified multilingual escort guide",
    "Private air-conditioned transport",
    "Monument and museum entry tickets",
    "Traditional regional lunch each day"
  ],
  "exclusions": [
    "Flights to ${city}",
    "Personal purchases & gratuities",
    "Travel insurance"
  ],
  "image": "/casbah.jpeg",
  "days": [${Array.from({ length: Number(days) || 1 }, (_, i) => i + 1).join(', ')}],
  "items": [
    {
      "day": 1,
      "items": [
        {
          "title": "Title of Morning Stop",
          "time": "09:30",
          "description": "Engaging description of this visit or activity.",
          "lat": 36.75,
          "lng": 3.05,
          "image": "/casbah.jpeg"
        },
        {
          "title": "Title of Afternoon Experience",
          "time": "14:00",
          "description": "Engaging description of the afternoon discovery.",
          "lat": 36.76,
          "lng": 3.06,
          "image": "/monumentMartyrs.jpg"
        }
      ]
    }
  ]
}
IMPORTANT:
- Ensure each day from 1 to ${days} has at least 2-3 distinct, chronologically ordered stops with realistic local coordinates.
- Activity items MUST have "title" (not "name").`

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${this.apiKey}`

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    }

    try {
      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeout
      })

      const candidate = response.data?.candidates?.[0]
      if (!candidate || !candidate.content?.parts?.[0]?.text) {
        throw new Error('Google Gemini returned an empty response candidate.')
      }

      const text = candidate.content.parts[0].text.trim()
      let parsed = null

      try {
        // Strip markdown code fences if model enclosed JSON
        const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
        parsed = JSON.parse(cleaned)
      } catch (parseErr) {
        // Fallback: extract first outermost JSON object
        const match = text.match(/\{[\s\S]*\}/)
        if (match) {
          parsed = JSON.parse(match[0])
        } else {
          throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`)
        }
      }

      return parsed
    } catch (err) {
      if (err.response) {
        const status = err.response.status
        const msg = err.response.data?.error?.message || err.message
        console.error(`[GeminiProvider] HTTP ${status} error:`, msg)
        throw new Error(`Google Gemini API error (${status}): ${msg}`)
      }
      throw err
    }
  }
}

module.exports = GeminiProvider
