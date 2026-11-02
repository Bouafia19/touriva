const { Ollama } = require('ollama')

/**
 * Ollama Provider for Touriva Trip Itinerary Generation.
 * Provides fallback / secondary AI model execution.
 */
class OllamaProvider {
  constructor(config = {}) {
    this.host = config.host || process.env.OLLAMA_HOST || 'https://ollama.com'
    this.apiKey = config.apiKey || process.env.OLLAMA_API_KEY
    this.model = config.model || process.env.OLLAMA_MODEL || 'gpt-oss:20b-cloud'

    const headers = {}
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    this.client = new Ollama({
      host: this.host,
      headers
    })
  }

  isConfigured() {
    // If hosted on ollama.com, requires API key; if local localhost, key is optional
    if (this.host.includes('ollama.com')) {
      return Boolean(this.apiKey && this.apiKey.trim().length > 0)
    }
    return Boolean(this.host)
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
    const H = (hotels || []).slice(0, 5)
    const R = (restaurants || []).slice(0, 5)
    const S = (sites || []).slice(0, 5)

    const prompt = `Return ONLY valid JSON.
City: ${city}
Days: ${days}
Budget: ${budget}
Party: ${partyType || 'Solo'}
Preferences: ${(preferences || []).join(', ')}

Hotels: ${JSON.stringify(H)}
Restaurants: ${JSON.stringify(R)}
Sites: ${JSON.stringify(S)}

JSON FORMAT (DO NOT CHANGE SCHEMA):
{
  "name": "${days}-Day Tour in ${city}",
  "description": "Itinerary overview for ${city}",
  "durationDays": ${days},
  "price": "${days * 15000} DZD",
  "rating": 4.8,
  "theme": "Circuit & Découverte",
  "days": [${Array.from({ length: Number(days) || 1 }, (_, i) => i + 1).join(', ')}],
  "items": [
    {
      "day": 1,
      "items": [
        {
          "title": "Sightseeing Attraction",
          "time": "09:30",
          "description": "Visit description",
          "lat": 36.75,
          "lng": 3.05,
          "image": "/casbah.jpeg"
        }
      ]
    }
  ]
}`

    const response = await this.client.chat({
      model: this.model,
      format: 'json',
      messages: [
        {
          role: 'system',
          content: 'You MUST output ONLY valid JSON conforming to the requested schema. Use "title" for activities. Do not include markdown or explanations.'
        },
        { role: 'user', content: prompt }
      ],
      stream: false
    })

    const raw = response.message?.content
    if (!raw || typeof raw !== 'string') {
      throw new Error('Ollama AI did not return text content.')
    }

    try {
      const match = raw.trim().match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No JSON object found in Ollama output.')
      return JSON.parse(match[0])
    } catch (err) {
      console.error('Failed to parse Ollama JSON:', raw)
      throw new Error(`Invalid JSON from Ollama: ${err.message}`)
    }
  }
}

module.exports = OllamaProvider
