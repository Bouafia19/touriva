import { describe, it, expect } from 'vitest'
import { BRANDING } from '../config/branding'
import router from '../router/index'

describe('Touriva Brand Identity & Configuration', () => {
  it('defines the official Touriva branding metadata', () => {
    expect(BRANDING.appName).toBe('Touriva')
    expect(BRANDING.tagline.en).toBe('Discover More. Travel Better.')
    expect(BRANDING.tagline.fr).toBe('Explorez plus. Voyagez mieux.')
    expect(BRANDING.tagline.ar).toBe('اكتشف المزيد. سافر بشكل أفضل.')
  })

  it('defines the premium tourism color palette tokens', () => {
    expect(BRANDING.colors.primary).toBe('#0f766e')   // Oceanic Emerald
    expect(BRANDING.colors.secondary).toBe('#0f172a') // Deep Slate
    expect(BRANDING.colors.accent).toBe('#f59e0b')    // Sunrise Amber
  })

  it('configures all required tourism core routes', () => {
    const routeNames = router.getRoutes().map(r => r.name)
    expect(routeNames).toContain('Trips')
    expect(routeNames).toContain('Hotels')
    expect(routeNames).toContain('Restaurants')
    expect(routeNames).toContain('Sites')
    expect(routeNames).toContain('Subscriptions')
    expect(routeNames).toContain('TripDetail')
    expect(routeNames).toContain('TripSubscription')
    expect(routeNames).toContain('Login')
    expect(routeNames).toContain('Signup')
  })
})
