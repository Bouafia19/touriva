const axios = require('axios')

/**
 * Google Gemini Provider for Touriva Trip Itinerary Generation.
 * Communicates directly with Google Generative AI REST endpoints.
 * Keeps credentials server-side and enforces strict OpenAPI JSON schema.
 */
class GeminiProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY
    // Default to the modern, generally available gemini-3.6-flash model with env override support
    this.model = config.model || process.env.GEMINI_MODEL || 'gemini-3.6-flash'
    this.timeout = config.timeout || parseInt(process.env.GEMINI_TIMEOUT, 10) || 45000
    this.lastUsedModel = null
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0)
  }

  /**
   * Validate that the itinerary JSON matches required Touriva fields before persistence.
   */
  validateItineraryResponse(data, expectedDays = 1) {
    if (!data || typeof data !== 'object') {
      throw new Error('Gemini response is not a valid JSON object.')
    }
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
      throw new Error('Gemini response missing valid itinerary "name".')
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Gemini response missing "items" daily itinerary array.')
    }

    for (const dayEntry of data.items) {
      if (!dayEntry || typeof dayEntry !== 'object') {
        throw new Error('Malformed day entry in Gemini response.')
      }
      const stops = Array.isArray(dayEntry.items) ? dayEntry.items : dayEntry.stops
      if (!Array.isArray(stops) || stops.length === 0) {
        throw new Error(`Day ${dayEntry.day || '?'} contains no itinerary stops.`)
      }
      for (const stop of stops) {
        const title = stop.title || stop.name
        if (!title || typeof title !== 'string' || !title.trim()) {
          throw new Error('Itinerary stop missing required "title".')
        }
      }
    }
    return true
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
You MUST output strictly valid JSON conforming exactly to the responseSchema provided. Do NOT output markdown code blocks, explanations, or prose outside the JSON.`

    const userPrompt = `Generate a ${days}-day itinerary for ${city}.
Travel Party: ${partyType || 'Solo / Travelers'}
Budget Tier: ${budget || 'Medium'}
Traveler Interests: ${preferences.join(', ') || 'Cultural heritage, local cuisine, scenic landmarks'}

Reference local assets if relevant:
- Hotels: ${JSON.stringify((hotels || []).slice(0, 5))}
- Dining / Restaurants: ${JSON.stringify((restaurants || []).slice(0, 5))}
- Attractions / Sites: ${JSON.stringify((sites || []).slice(0, 5))}

Return a comprehensive JSON itinerary for each day from 1 to ${days}.
Ensure each day has at least 2 distinct stops with accurate local coordinates and specific times.`

    // Official Google Gemini OpenAPI 3.0 Structured Output Schema
    const responseSchema = {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING', description: 'Curated title of the itinerary' },
        description: { type: 'STRING', description: 'Overview of the journey' },
        durationDays: { type: 'INTEGER', description: 'Total number of days' },
        price: { type: 'STRING', description: 'Price estimation with currency e.g. 45 000 DZD' },
        rating: { type: 'NUMBER', description: 'Review rating from 1.0 to 5.0' },
        theme: { type: 'STRING', description: 'Trip theme' },
        meetingPoint: { type: 'STRING', description: 'Initial meeting point' },
        cancellationPolicy: { type: 'STRING', description: 'Cancellation terms' },
        inclusions: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Included services and perks'
        },
        exclusions: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Excluded services and personal expenses'
        },
        image: { type: 'STRING', description: 'Cover image asset path' },
        days: {
          type: 'ARRAY',
          items: { type: 'INTEGER' },
          description: 'Sequential array of day numbers'
        },
        items: {
          type: 'ARRAY',
          description: 'Daily itinerary items',
          items: {
            type: 'OBJECT',
            properties: {
              day: { type: 'INTEGER', description: '1-indexed day number' },
              items: {
                type: 'ARRAY',
                description: 'Chronological stops for this day',
                items: {
                  type: 'OBJECT',
                  properties: {
                    title: { type: 'STRING', description: 'Title of the stop or activity' },
                    time: { type: 'STRING', description: 'Time e.g. 09:30 or 14:00' },
                    description: { type: 'STRING', description: 'Engaging description of this stop' },
                    lat: { type: 'NUMBER', description: 'Latitude coordinate' },
                    lng: { type: 'NUMBER', description: 'Longitude coordinate' },
                    image: { type: 'STRING', description: 'Image asset path' }
                  },
                  required: ['title', 'time', 'description', 'lat', 'lng', 'image']
                }
              }
            },
            required: ['day', 'items']
          }
        }
      },
      required: ['name', 'description', 'durationDays', 'days', 'items']
    }

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
        responseMimeType: 'application/json',
        responseSchema
      }
    }

    // Candidate Flash models (prioritizing configured model, with capacity-failover to available Flash versions)
    const candidateModels = [this.model]
    if (this.model === 'gemini-3.8-flash') {
      candidateModels.push('gemini-3.6-flash', 'gemini-3.5-flash')
    }

    let lastError = null

    for (const currentModel of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(currentModel)}:generateContent?key=${this.apiKey}`

      try {
        let response
        try {
          response = await axios.post(endpoint, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: this.timeout
          })
        } catch (postErr) {
          // Safe fallback if an endpoint does not support responseSchema
          const errMsg = postErr.response?.data?.error?.message || ''
          if (postErr.response?.status === 400 && /response_?schema/i.test(errMsg)) {
            const fallbackPayload = {
              ...payload,
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            }
            response = await axios.post(endpoint, fallbackPayload, {
              headers: { 'Content-Type': 'application/json' },
              timeout: this.timeout
            })
          } else {
            throw postErr
          }
        }

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

        // Pre-persistence validation
        this.validateItineraryResponse(parsed, days)

        this.lastUsedModel = currentModel
        parsed._geminiModel = currentModel

        return parsed
      } catch (err) {
        lastError = err
        const status = err.response?.status
        const msg = err.response?.data?.error?.message || err.message

        // If it's a 503 temporary overload or 404 retired model, try next available Flash candidate
        const currentIndex = candidateModels.indexOf(currentModel)
        if ((status === 503 || status === 404) && currentIndex < candidateModels.length - 1) {
          console.warn(`[GeminiProvider] ${currentModel} returned HTTP ${status} (${msg}). Failing over to next Flash candidate (${candidateModels[currentIndex + 1]})...`)
          continue
        }

        if (err.response) {
          console.error(`[GeminiProvider] HTTP ${status} error:`, msg)
          throw new Error(`Google Gemini API error (${status}): ${msg}`)
        }
        throw err
      }
    }

    throw lastError
  }
}

module.exports = GeminiProvider
