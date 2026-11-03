const axios = require('axios')
const GeminiProvider = require('../services/ai/geminiProvider')
const { AIService } = require('../services/ai/index')
const Wilaya = require('../models/Wilaya')

jest.mock('axios')

describe('Gemini Provider & Fallback Architecture Suite', () => {
  beforeAll(() => {
    jest.spyOn(Wilaya, 'findOne').mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: '507f191e810c19729de860ea' })
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('1. Gemini Configuration & Specification', () => {
    it('1.1: defaults to gemini-3.8-flash and timeout of 45000ms with GEMINI_MODEL env override support', () => {
      const provider = new GeminiProvider({ apiKey: 'mock_test_key' })
      expect(provider.model).toBe('gemini-3.8-flash')
      expect(provider.timeout).toBe(45000)
      expect(provider.isConfigured()).toBe(true)

      const customProvider = new GeminiProvider({ apiKey: 'mock_test_key', model: 'gemini-custom-model' })
      expect(customProvider.model).toBe('gemini-custom-model')
    })

    it('1.2: isConfigured returns false when key is absent or blank', () => {
      const provider1 = new GeminiProvider({ apiKey: '' })
      const provider2 = new GeminiProvider({ apiKey: '   ' })
      expect(provider1.isConfigured()).toBe(false)
      expect(provider2.isConfigured()).toBe(false)
    })

    it('1.3: throws informative error if generateItinerary is called when unconfigured', async () => {
      const provider = new GeminiProvider({ apiKey: '' })
      await expect(provider.generateItinerary({ city: 'Algiers', days: 3 }))
        .rejects.toThrow('GEMINI_API_KEY is not configured on the server.')
    })
  })

  describe('2. Gemini REST API Format & Structured Output (OpenAPI Schema Enforcement)', () => {
    it('2.1: constructs valid REST v1beta request with responseMimeType application/json and responseSchema', async () => {
      const provider = new GeminiProvider({ apiKey: 'valid_mock_key', model: 'gemini-3.8-flash' })

      const mockGeminiResponse = {
        name: '3-Day Cultural Algiers',
        description: 'Exploring the rich Casbah and Mediterranean coast.',
        durationDays: 3,
        days: [1, 2, 3],
        items: [
          {
            day: 1,
            items: [
              { title: 'Casbah Guided Tour', time: '09:30', description: 'Historic alleys and palaces', lat: 36.785, lng: 3.061, image: '/casbah.jpeg' },
              { title: 'Monument des Martyrs', time: '14:30', description: 'Overlooking Algiers bay', lat: 36.745, lng: 3.069, image: '/monumentMartyrs.jpg' }
            ]
          }
        ]
      }

      axios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          candidates: [
            {
              content: {
                parts: [
                  { text: JSON.stringify(mockGeminiResponse) }
                ]
              }
            }
          ]
        }
      })

      const result = await provider.generateItinerary({
        city: 'Algiers',
        days: 3,
        budget: 'Medium',
        partyType: 'Solo',
        preferences: ['Cultural Heritage']
      })

      expect(axios.post).toHaveBeenCalledTimes(1)
      const [url, payload, options] = axios.post.mock.calls[0]

      expect(url).toContain('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=valid_mock_key')
      expect(options.headers['Content-Type']).toBe('application/json')
      expect(options.timeout).toBe(45000)

      // Payload validation
      expect(payload).toHaveProperty('contents')
      expect(payload.contents[0].parts[0].text).toContain('Algiers')
      expect(payload).toHaveProperty('systemInstruction')
      expect(payload.systemInstruction.parts[0].text).toContain("Touriva's Expert Algerian Travel Concierge")

      // Structured output schema validation
      expect(payload.generationConfig.temperature).toBe(0.2)
      expect(payload.generationConfig.responseMimeType).toBe('application/json')
      expect(payload.generationConfig.responseSchema).toBeDefined()
      expect(payload.generationConfig.responseSchema.type).toBe('OBJECT')
      expect(payload.generationConfig.responseSchema.properties.items.type).toBe('ARRAY')
      expect(payload.generationConfig.responseSchema.properties.items.items.properties.items.items.required).toEqual([
        'title', 'time', 'description', 'lat', 'lng', 'image'
      ])

      // Parsed result
      expect(result.name).toBe('3-Day Cultural Algiers')
      expect(result.durationDays).toBe(3)
    })

    it('2.2: successfully parses responses wrapped in markdown ```json code blocks', async () => {
      const provider = new GeminiProvider({ apiKey: 'valid_mock_key' })

      const mockTrip = {
        name: 'Tlemcen Royal Splendors',
        durationDays: 5,
        items: [{ day: 1, items: [{ title: 'El Mechouar', time: '09:30', description: 'Palace', lat: 34.88, lng: -1.31, image: '/casbah.jpeg' }] }]
      }

      axios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          candidates: [
            {
              content: {
                parts: [
                  { text: '```json\n' + JSON.stringify(mockTrip) + '\n```' }
                ]
              }
            }
          ]
        }
      })

      const result = await provider.generateItinerary({ city: 'Tlemcen', days: 5 })
      expect(result.name).toBe('Tlemcen Royal Splendors')
      expect(result.durationDays).toBe(5)
    })

    it('2.3: extracts JSON when enclosed in conversational prose', async () => {
      const provider = new GeminiProvider({ apiKey: 'valid_mock_key' })

      const mockTrip = {
        name: 'Istanbul 7-Day Odyssey',
        durationDays: 7,
        items: [{ day: 1, items: [{ title: 'Hagia Sophia', time: '10:00', description: 'Historic landmark', lat: 41.008, lng: 28.98, image: '/casbah.jpeg' }] }]
      }

      axios.post.mockResolvedValueOnce({
        status: 200,
        data: {
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Here is your curated journey:\n' + JSON.stringify(mockTrip) + '\nHope you enjoy Touriva!' }
                ]
              }
            }
          ]
        }
      })

      const result = await provider.generateItinerary({ city: 'Istanbul', days: 7 })
      expect(result.name).toBe('Istanbul 7-Day Odyssey')
      expect(result.durationDays).toBe(7)
    })
  })

  describe('3. Pre-Persistence Validation & Schema Integrity', () => {
    const provider = new GeminiProvider({ apiKey: 'valid_mock_key' })

    it('3.1: rejects non-object or null Gemini response', () => {
      expect(() => provider.validateItineraryResponse(null)).toThrow('not a valid JSON object')
      expect(() => provider.validateItineraryResponse('string')).toThrow('not a valid JSON object')
    })

    it('3.2: rejects response missing valid itinerary name', () => {
      expect(() => provider.validateItineraryResponse({ name: '   ', items: [] }))
        .toThrow('missing valid itinerary "name"')
    })

    it('3.3: rejects response missing items array', () => {
      expect(() => provider.validateItineraryResponse({ name: 'Valid Trip', items: [] }))
        .toThrow('missing "items" daily itinerary array')
    })

    it('3.4: rejects itinerary days with missing stop titles', () => {
      const invalidData = {
        name: 'Valid Trip',
        items: [
          { day: 1, items: [{ title: '', time: '10:00' }] }
        ]
      }
      expect(() => provider.validateItineraryResponse(invalidData))
        .toThrow('missing required "title"')
    })
  })

  describe('4. Error Handling & HTTP Statuses', () => {
    it('4.1: handles HTTP 400 API_KEY_INVALID cleanly with descriptive message', async () => {
      const provider = new GeminiProvider({ apiKey: 'bad_key' })

      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            error: {
              code: 400,
              message: 'API key not valid. Please pass a valid API key.',
              status: 'INVALID_ARGUMENT'
            }
          }
        }
      })

      await expect(provider.generateItinerary({ city: 'Algiers', days: 3 }))
        .rejects.toThrow('Google Gemini API error (400): API key not valid. Please pass a valid API key.')
    })

    it('4.2: handles HTTP 429 Quota Exceeded cleanly', async () => {
      const provider = new GeminiProvider({ apiKey: 'valid_key' })

      axios.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: {
            error: {
              code: 429,
              message: 'Resource has been exhausted (e.g. check quota).',
              status: 'RESOURCE_EXHAUSTED'
            }
          }
        }
      })

      await expect(provider.generateItinerary({ city: 'Algiers', days: 3 }))
        .rejects.toThrow('Google Gemini API error (429): Resource has been exhausted')
    })

    it('4.3: handles HTTP 503 Service Unavailable / temporary outage', async () => {
      const provider = new GeminiProvider({ apiKey: 'valid_key' })

      axios.post.mockRejectedValueOnce({
        response: {
          status: 503,
          data: {
            error: {
              code: 503,
              message: 'The model is overloaded. Please try again later.',
              status: 'UNAVAILABLE'
            }
          }
        }
      })

      await expect(provider.generateItinerary({ city: 'Algiers', days: 3 }))
        .rejects.toThrow('Google Gemini API error (503): The model is overloaded')
    })
  })

  describe('5. AIService Fallback Chain Resilience', () => {
    it('5.1: when Gemini fails, AIService gracefully falls back to Ollama or Touriva Engine', async () => {
      const service = new AIService()
      service.gemini.isConfigured = () => true
      service.gemini.generateItinerary = jest.fn().mockRejectedValue(new Error('Gemini API quota exhausted'))
      service.ollama.isConfigured = () => false

      const result = await service.generateTripItinerary({
        city: 'Algiers',
        days: 3,
        partyType: 'Solo',
        preferences: ['Heritage']
      })

      expect(result).toHaveProperty('trip')
      expect(result.provider).toBe('touriva-engine')
      expect(result.trip.durationDays).toBe(3)
      expect(result.trip.days).toEqual([1, 2, 3])
      expect(result.trip.items.length).toBe(3)
      expect(result.trip.items[0].items[0].title).toBeDefined()
    })

    it('5.2: when Gemini succeeds, AIService uses Gemini and normalizes output', async () => {
      const service = new AIService()
      service.gemini.isConfigured = () => true
      service.gemini.generateItinerary = jest.fn().mockResolvedValue({
        name: '3-Day Curated Algiers with Gemini',
        durationDays: 3,
        items: [
          {
            day: 1,
            items: [
              { title: 'Casbah Palace Visit', time: '10:00', description: 'Historic Dar Aziza' }
            ]
          }
        ]
      })

      const result = await service.generateTripItinerary({
        city: 'Algiers',
        days: 3
      })

      expect(result.provider).toBe('gemini')
      expect(result.trip.name).toBe('3-Day Curated Algiers with Gemini')
      expect(result.trip.durationDays).toBe(3)
      expect(result.trip.items.length).toBe(3)
      expect(result.trip.items[0].items[0].title).toBe('Casbah Palace Visit')
    })
  })
})
