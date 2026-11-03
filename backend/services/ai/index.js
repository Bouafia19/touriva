const GeminiProvider = require('./geminiProvider')
const OllamaProvider = require('./ollamaProvider')
const { normalizeTripData } = require('./tripNormalizer')

/**
 * Touriva AI Concierge Orchestrator
 * Seamlessly manages Google Gemini (primary) with Ollama (fallback).
 * Applies strict schema normalization and validation before database persistence.
 */
class AIService {
  constructor() {
    this.gemini = new GeminiProvider()
    this.ollama = new OllamaProvider()
  }

  getPreferredProvider() {
    return (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  }

  async generateTripItinerary(params) {
    const preferred = this.getPreferredProvider()
    let rawOutput = null
    let usedProvider = null
    let lastError = null

    // Strategy 1: Attempt preferred provider
    if (preferred === 'gemini') {
      if (this.gemini.isConfigured()) {
        try {
          rawOutput = await this.gemini.generateItinerary(params)
          usedProvider = 'gemini'
        } catch (err) {
          console.warn('[AIService] Gemini provider encountered error, attempting Ollama fallback:', err.message)
          lastError = err
        }
      } else {
        console.warn('[AIService] GEMINI_API_KEY is not configured, checking Ollama fallback.')
      }

      // Fallback to Ollama if Gemini failed or was unconfigured
      if (!rawOutput && this.ollama.isConfigured()) {
        try {
          rawOutput = await this.ollama.generateItinerary(params)
          usedProvider = 'ollama'
        } catch (ollamaErr) {
          console.error('[AIService] Ollama fallback failed:', ollamaErr.message)
          lastError = ollamaErr
        }
      }
    } else {
      // Preferred is Ollama
      if (this.ollama.isConfigured()) {
        try {
          rawOutput = await this.ollama.generateItinerary(params)
          usedProvider = 'ollama'
        } catch (err) {
          console.warn('[AIService] Ollama provider encountered error, attempting Gemini fallback:', err.message)
          lastError = err
        }
      }

      if (!rawOutput && this.gemini.isConfigured()) {
        try {
          rawOutput = await this.gemini.generateItinerary(params)
          usedProvider = 'gemini'
        } catch (geminiErr) {
          console.error('[AIService] Gemini fallback failed:', geminiErr.message)
          lastError = geminiErr
        }
      }
    }

    // Strategy 2: If external models are unreachable or unconfigured,
    // construct a high-quality deterministic itinerary based on authentic Touriva knowledge
    if (!rawOutput) {
      if (!this.gemini.isConfigured() && !this.ollama.isConfigured()) {
        console.info('[AIService] No external AI API keys configured. Generating deterministic Touriva itinerary.')
      } else if (lastError) {
        console.warn('[AIService] External AI providers failed. Generating fallback Touriva itinerary.')
      }
      rawOutput = this.generateDeterministicItinerary(params)
      usedProvider = 'touriva-engine'
    }

    // Strict normalization & validation layer
    const normalizedTrip = await normalizeTripData(rawOutput, params)

    const modelUsed = usedProvider === 'gemini'
      ? (this.gemini.lastUsedModel || this.gemini.model)
      : (usedProvider === 'ollama' ? this.ollama.model : 'touriva-engine')

    return {
      trip: normalizedTrip,
      provider: usedProvider,
      model: modelUsed
    }
  }

  /**
   * High-quality deterministic itinerary synthesizer when external AI is offline or keys are absent.
   * Guarantees realistic schedules, coordinates, and cultural stops across Algerian destinations.
   */
  generateDeterministicItinerary({ city = 'Algiers', days = 3, partyType = 'Solo', preferences = [] }) {
    const numDays = Math.max(1, Math.min(parseInt(days, 10) || 3, 30))
    const cityName = city.trim() || 'Algiers'

    // Authentic Algerian sightseeing presets
    const destinationHighlights = {
      algiers: [
        { title: 'Casbah Historical Quarter & Palaces', time: '09:30', desc: 'UNESCO World Heritage Ottoman medina, Dar Aziza, and artisan brass smiths.', lat: 36.785, lng: 3.061, img: '/casbah.jpeg' },
        { title: 'Monument des Martyrs & Riadh El Feth', time: '14:00', desc: 'Iconic Algerian landmark overlooking the Bay of Algiers and El Hamma gardens.', lat: 36.745, lng: 3.069, img: '/monumentMartyrs.jpg' },
        { title: 'Djamaa El-Djazair (Great Mosque)', time: '16:30', desc: 'Architectural marvel with the worlds tallest minaret overlooking the Mediterranean.', lat: 36.733, lng: 3.141, img: '/grandMosquee.webp' },
        { title: 'Fort Tamentfoust & Coastal Promenade', time: '10:00', desc: 'Seventeenth-century coastal defensive bastion and Roman Rusguniae remnants.', lat: 36.792, lng: 3.238, img: '/fortTamentfoust.webp' }
      ],
      oran: [
        { title: 'Fort and Chapel of Santa Cruz', time: '09:30', desc: 'Spanish-Ottoman fortress towering over the Gulf of Oran from Mount Murdjadjo.', lat: 35.709, lng: -0.665, img: '/casbah.jpeg' },
        { title: 'Le Front de Mer & Place du 1er Novembre', time: '14:30', desc: 'French colonial boulevards, iconic municipal theater, and Mediterranean panorama.', lat: 35.701, lng: -0.643, img: '/monumentMartyrs.jpg' }
      ],
      tlemcen: [
        { title: 'El Mechouar Royal Palace', time: '09:30', desc: 'Zianid dynasty royal residence featuring Moorish arches, courtyards, and gardens.', lat: 34.882, lng: -1.314, img: '/casbah.jpeg' },
        { title: 'Mansourah Minaret & Medieval Walls', time: '14:00', desc: 'Towering 14th-century Marinid minaret and archeological ruins.', lat: 34.872, lng: -1.341, img: '/monumentMartyrs.jpg' }
      ]
    }

    const key = cityName.toLowerCase()
    const cityStops = destinationHighlights[key] || [
      { title: `Historical Center & Medina of ${cityName}`, time: '09:30', desc: `Guided walking expedition through ${cityName}'s historic quarters.`, lat: 36.75, lng: 3.05, img: '/casbah.jpeg' },
      { title: `Local Artisanal Souk & Gastronomic Tasting`, time: '14:00', desc: `Discover traditional regional culinary specialties and handcrafted goods.`, lat: 36.76, lng: 3.06, img: '/monumentMartyrs.jpg' }
    ]

    const items = []
    for (let d = 1; d <= numDays; d++) {
      const stop1 = cityStops[(d * 2 - 2) % cityStops.length]
      const stop2 = cityStops[(d * 2 - 1) % cityStops.length]

      items.push({
        day: d,
        items: [
          {
            title: stop1.title,
            time: stop1.time || '09:30',
            description: stop1.desc,
            lat: stop1.lat,
            lng: stop1.lng,
            image: stop1.img || '/casbah.jpeg'
          },
          {
            title: stop2.title,
            time: stop2.time || '14:30',
            description: stop2.desc,
            lat: stop2.lat,
            lng: stop2.lng,
            image: stop2.img || '/monumentMartyrs.jpg'
          }
        ]
      })
    }

    return {
      name: `${numDays}-Day Curated Journey in ${cityName}`,
      description: `Bespoke multi-day exploration of ${cityName} tailored for ${partyType || 'travelers'}, blending historical architecture, scenic panoramas, and regional gastronomy.`,
      durationDays: numDays,
      days: Array.from({ length: numDays }, (_, i) => i + 1),
      price: `${(numDays * 15000).toLocaleString('fr-DZ')} DZD`,
      rating: 4.9,
      theme: preferences.length ? preferences[0] : 'Circuit & Découverte',
      image: '/casbah.jpeg',
      items
    }
  }
}

const defaultAIService = new AIService()

module.exports = {
  AIService,
  aiService: defaultAIService,
  generateTripAI: async (params) => {
    const result = await defaultAIService.generateTripItinerary(params)
    return result.trip
  },
  generateTripAIResult: async (params) => {
    return defaultAIService.generateTripItinerary(params)
  }
}
