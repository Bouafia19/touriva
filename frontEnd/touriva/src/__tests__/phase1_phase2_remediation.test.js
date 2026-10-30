import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import router from '../router/index'
import { useAuthStore } from '../stores/auth'
import { useAgencyStore } from '../stores/agency'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

describe('Touriva Phase 1 & Phase 2 Remediation Regression Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('WEB-01: Public Catalog Router Access & Route Guard Parity', () => {
    it('allows public access without authentication for trips, sites, hotels, restaurants, and details', () => {
      const publicRouteNames = ['Trips', 'Sites', 'Hotels', 'Restaurants', 'TripDetail']
      const flatRoutes = router.getRoutes()

      publicRouteNames.forEach(name => {
        const found = flatRoutes.find(r => r.name === name)
        expect(found, `Route ${name} should exist in router`).toBeDefined()
        expect(found.meta.requiresAuth, `Route ${name} must NOT require authentication for public discovery`).toBeFalsy()
      })
    })

    it('strictly preserves authentication requirement for protected traveler and account management routes', () => {
      const protectedRouteNames = ['UpdateProfile', 'MyTrips', 'Subscriptions', 'TripSubscription', 'Billing', 'Notifications']
      const flatRoutes = router.getRoutes()

      protectedRouteNames.forEach(name => {
        const found = flatRoutes.find(r => r.name === name)
        expect(found, `Route ${name} should exist in router`).toBeDefined()
        expect(found.meta.requiresAuth, `Route ${name} must require authentication`).toBe(true)
      })
    })

    it('strictly enforces both requiresAuth and requiresAgency on the entire /agency backoffice hierarchy', () => {
      const agencyRoutes = router.getRoutes().filter(r => r.path.startsWith('/agency'))
      expect(agencyRoutes.length).toBeGreaterThan(0)

      agencyRoutes.forEach(r => {
        expect(r.meta.requiresAgency, `Agency route ${r.path} must specify requiresAgency: true`).toBe(true)
        expect(r.meta.requiresAuth, `Agency route ${r.path} must specify requiresAuth: true`).toBe(true)
      })
    })
  })

  describe('WEB-02: Agency Partner Login Redirection', () => {
    it('redirects travel agency partners to /agency/dashboard upon successful credential sign in', async () => {
      const auth = useAuthStore()
      const mockPush = vi.fn()
      auth.router = { push: mockPush }

      const agencyUserData = {
        user: {
          _id: '6ad5eb439093d45f5ec48c51',
          email: 'agence.tassili@touriva.test',
          role: 'partner',
          typeAccount: 'touristAgencies',
          companyName: 'Tassili Voyages & Desert Expeditions'
        },
        token: 'mock-jwt-token-agency'
      }

      vi.spyOn(axios, 'post').mockResolvedValueOnce({
        status: 200,
        data: agencyUserData
      })

      const result = await auth.account_sign_in({
        email: 'agence.tassili@touriva.test',
        password: 'ValidPassword123'
      })

      expect(result).toEqual(agencyUserData)
      expect(auth.user.role).toBe('partner')
      expect(auth.user.typeAccount).toBe('touristAgencies')
      expect(mockPush).toHaveBeenCalledWith('/agency/dashboard')
    })

    it('redirects regular tourist/customer accounts to /tabs upon credential sign in', async () => {
      const auth = useAuthStore()
      const mockPush = vi.fn()
      auth.router = { push: mockPush }

      const customerUserData = {
        user: {
          _id: '6ad5eb439093d45f5ec48c50',
          email: 'lynda.meziani@touriva.test',
          role: 'client',
          typeAccount: 'visitor'
        },
        token: 'mock-jwt-token-customer'
      }

      vi.spyOn(axios, 'post').mockResolvedValueOnce({
        status: 200,
        data: customerUserData
      })

      const result = await auth.account_sign_in({
        email: 'lynda.meziani@touriva.test',
        password: 'ValidPassword123'
      })

      expect(result).toEqual(customerUserData)
      expect(auth.user.role).toBe('client')
      expect(mockPush).toHaveBeenCalledWith('/tabs')
    })
  })

  describe('WEB-03: Authentication Store User Integrity & Session Restoration', () => {
    it('does NOT corrupt auth.user into a raw JWT string when auth.attempt(token) is called', async () => {
      const auth = useAuthStore()
      const sampleUser = {
        _id: '6ad5eb439093d45f5ec48c51',
        email: 'director@agency.test',
        role: 'partner',
        firstName: 'Sofiane'
      }

      // Pre-populate storage
      await auth.setLSUserInfo({ user: sampleUser, token: 'eyMockTokenString' })

      const success = await auth.attempt('eyMockTokenString', sampleUser)

      expect(success).toBe(true)
      expect(auth.token).toBe('eyMockTokenString')
      expect(typeof auth.user).toBe('object')
      expect(auth.user).toEqual(sampleUser)
      expect(auth.user._id).toBe('6ad5eb439093d45f5ec48c51')
      expect(auth.user).not.toBe('eyMockTokenString')
    })

    it('restores the user object from storage if user parameter is not passed to attempt(token)', async () => {
      const auth = useAuthStore()
      const sampleUser = {
        _id: '6ad5eb439093d45f5ec48c50',
        email: 'traveler@test.dz',
        role: 'client'
      }

      await auth.setLSUserInfo({ user: sampleUser, token: 'eyStoredToken' })
      auth.user = undefined

      const success = await auth.attempt('eyStoredToken')

      expect(success).toBe(true)
      expect(auth.token).toBe('eyStoredToken')
      expect(typeof auth.user).toBe('object')
      expect(auth.user._id).toBe('6ad5eb439093d45f5ec48c50')
    })

    it('clears user and token state cleanly when token is null or empty', async () => {
      const auth = useAuthStore()
      auth.user = { _id: '123' }
      auth.token = 'existing'
      auth.auth_login = true

      const success = await auth.attempt(null)

      expect(success).toBe(false)
      expect(auth.token).toBeNull()
      expect(auth.user).toBeUndefined()
      expect(auth.auth_login).toBe(false)
    })
  })

  describe('WEB-04: Passenger Manifest Printing via Authenticated Axios', () => {
    it('fetches server-rendered HTML manifest using authenticated headers and responseType text', async () => {
      const auth = useAuthStore()
      const agency = useAgencyStore()

      await auth.setLSUserInfo({
        user: { role: 'partner', typeAccount: 'touristAgencies' },
        token: 'auth-jwt-token-manifest'
      })

      const sampleHtml = '<!DOCTYPE html><html><body><h1>Manifeste Officiel des Passagers</h1></body></html>'

      const getSpy = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        status: 200,
        data: sampleHtml
      })

      const html = await agency.fetchManifestHtml('dep123')

      expect(getSpy).toHaveBeenCalledWith(
        '/api/agency/departures/dep123/manifest?format=html',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-jwt-token-manifest'
          }),
          responseType: 'text'
        })
      )
      expect(html).toContain('Manifeste Officiel des Passagers')
    })
  })

  describe('WEB-05: Protected Receipt Binary Streaming via Authenticated Blob', () => {
    it('fetches protected payment proof binary with Bearer token and creates local Blob URL', async () => {
      const auth = useAuthStore()
      const agency = useAgencyStore()

      await auth.setLSUserInfo({
        user: { role: 'partner', typeAccount: 'touristAgencies' },
        token: 'auth-jwt-token-proof'
      })

      const mockBlob = new Blob(['%PDF-1.4 simulated binary data'], { type: 'application/pdf' })

      // Mock URL.createObjectURL in happy-dom if needed
      if (!global.URL.createObjectURL) {
        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-proof-uuid')
      } else {
        vi.spyOn(global.URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-proof-uuid')
      }

      const getSpy = vi.spyOn(axios, 'get').mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'application/pdf' },
        data: mockBlob
      })

      const result = await agency.fetchPaymentProofBlob('payment999')

      expect(getSpy).toHaveBeenCalledWith(
        '/api/agency/payments/payment999/proof',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-jwt-token-proof'
          }),
          responseType: 'blob'
        })
      )
      expect(result.url).toBe('blob:http://localhost/mock-proof-uuid')
      expect(result.mimeType).toBe('application/pdf')
    })
  })

  describe('MOB-01: Android Build Versioning & Manifest Integrity', () => {
    it('verifies that android/app/build.gradle is incremented to versionCode 12 and versionName 12.0', () => {
      const buildGradlePath = path.resolve(__dirname, '../../android/app/build.gradle')
      const content = fs.readFileSync(buildGradlePath, 'utf-8')

      expect(content).toMatch(/versionCode\s+12/)
      expect(content).toMatch(/versionName\s+"12\.0"/)
    })
  })
})
