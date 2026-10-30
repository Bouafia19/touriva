import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import router from '../router/index'
import fr from '../lang/fr'
import ar from '../lang/ar'
import en from '../lang/en'

describe('Touriva B2B Homepage Conversion & Agency Space Verification', () => {
  const b2bKeys = [
    'b2bNavTitle',
    'b2bHeroCallout',
    'b2bHeroCalloutAction',
    'b2bSectionTag',
    'b2bSectionTitle',
    'b2bSectionSubtitle',
    'b2bCtaDemo',
    'b2bCtaDemoSub',
    'b2bCtaContact',
    'b2bPillar1Title',
    'b2bPillar1Tag',
    'b2bPillar1Desc',
    'b2bPillar1Feature1',
    'b2bPillar1Feature2',
    'b2bPillar1Feature3',
    'b2bPillar2Title',
    'b2bPillar2Tag',
    'b2bPillar2Desc',
    'b2bPillar2Feature1',
    'b2bPillar2Feature2',
    'b2bPillar2Feature3',
    'b2bPillar3Title',
    'b2bPillar3Tag',
    'b2bPillar3Desc',
    'b2bPillar3Feature1',
    'b2bPillar3Feature2',
    'b2bPillar3Feature3',
    'b2bPillar4Title',
    'b2bPillar4Tag',
    'b2bPillar4Desc',
    'b2bPillar4Feature1',
    'b2bPillar4Feature2',
    'b2bPillar4Feature3',
    'b2bPillar4Disclaimer',
    'b2bHighlight1',
    'b2bHighlight2',
    'b2bHighlight3',
    'b2bHighlight4',
    'b2bLivePreviewTitle',
    'b2bLivePreviewHeadline',
    'b2bLivePreviewBadge',
    'b2bLiveDemoChip',
    'b2bLiveDemoDataNote',
    'b2bLiveStatPackages',
    'b2bLiveStatDepartures',
    'b2bLiveStatBookings',
    'b2bLiveStatLedger'
  ]

  it('provides complete French translations for all B2B agency section keys', () => {
    b2bKeys.forEach((key) => {
      expect(fr[key], `Missing French translation for ${key}`).toBeDefined()
      expect(typeof fr[key]).toBe('string')
      expect(fr[key].trim().length).toBeGreaterThan(0)
    })
    expect(fr.b2bSectionTitle).toBe('Pilotez votre agence de voyages depuis une seule plateforme.')
    expect(fr.b2bCtaDemo).toBe('Découvrir la démo agence')
  })

  it('provides complete Arabic translations for all B2B agency section keys', () => {
    b2bKeys.forEach((key) => {
      expect(ar[key], `Missing Arabic translation for ${key}`).toBeDefined()
      expect(typeof ar[key]).toBe('string')
      expect(ar[key].trim().length).toBeGreaterThan(0)
    })
    expect(ar.b2bSectionTitle).toBe('أدر وكالة سفرك من منصة واحدة.')
    expect(ar.b2bCtaDemo).toBe('اكتشف العرض التجريبي للوكالة')
  })

  it('provides complete English translations for all B2B agency section keys', () => {
    b2bKeys.forEach((key) => {
      expect(en[key], `Missing English translation for ${key}`).toBeDefined()
      expect(typeof en[key]).toBe('string')
      expect(en[key].trim().length).toBeGreaterThan(0)
    })
    expect(en.b2bSectionTitle).toBe('Manage your travel agency from a single platform.')
    expect(en.b2bCtaDemo).toBe('Explore Agency Demo')
  })

  it('strictly includes the manual payment recording disclaimer across all translations', () => {
    expect(fr.b2bPillar4Disclaimer).toContain('manuel')
    expect(ar.b2bPillar4Disclaimer).toContain('يدوي')
    expect(en.b2bPillar4Disclaimer.toLowerCase()).toContain('manual')
  })

  it('verifies that the Home.vue template contains the dedicated B2B section and CTA', () => {
    const homeContent = fs.readFileSync(path.resolve(__dirname, '../views/Home.vue'), 'utf-8')
    expect(homeContent).toContain('id="agency-space"')
    expect(homeContent).toContain('class="b2b-agency-section')
    expect(homeContent).toContain('to="/login?demo=agency"')
    expect(homeContent).toContain('$t(\'b2bSectionTitle\')')
    expect(homeContent).toContain('$t(\'b2bCtaDemo\')')
    expect(homeContent).toContain('hero-b2b-pill')
  })

  it('verifies that MainLayout.vue provides navigation to the agency space', () => {
    const layoutContent = fs.readFileSync(path.resolve(__dirname, '../layouts/MainLayout.vue'), 'utf-8')
    expect(layoutContent).toContain('to="/#agency-space"')
    expect(layoutContent).toContain('$t(\'b2bNavTitle\')')
    expect(layoutContent).toContain('scrollToAgencySection')
  })

  it('verifies that index.html contains updated SEO meta tags for travel agency management', () => {
    const htmlContent = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8')
    expect(htmlContent).toContain('Plateforme Digitale pour Agences de Voyages')
    expect(htmlContent).toContain('Pilotez vos circuits')
    expect(htmlContent).toContain('manifestes passagers')
  })

  it('strictly communicates that demo statistics represent fictional demonstration data', () => {
    expect(fr.b2bLivePreviewBadge).toContain('Fictives')
    expect(ar.b2bLivePreviewBadge).toContain('توضيحية')
    expect(en.b2bLivePreviewBadge).toContain('Fictional')
    expect(fr.b2bLiveDemoDataNote.length).toBeGreaterThan(15)
    expect(ar.b2bLiveDemoDataNote.length).toBeGreaterThan(15)
    expect(en.b2bLiveDemoDataNote.length).toBeGreaterThan(15)
  })

  it('ensures the hero B2B quick link provides full keyboard and ARIA accessibility', () => {
    const homeContent = fs.readFileSync(path.resolve(__dirname, '../views/Home.vue'), 'utf-8')
    expect(homeContent).toContain('tabindex="0"')
    expect(homeContent).toContain('role="button"')
    expect(homeContent).toContain(':aria-label="$t(\'b2bHeroCallout\')"')
    expect(homeContent).toContain('@keydown.enter.prevent="scrollToAgency"')
  })

  it('ensures Login.vue handles ?demo=agency through existing quickDemoSignIn without bypassing auth', () => {
    const loginContent = fs.readFileSync(path.resolve(__dirname, '../views/user/Login.vue'), 'utf-8')
    expect(loginContent).toContain('route.query?.demo === \'agency\'')
    expect(loginContent).toContain('quickDemoSignIn(\'agency\')')
    expect(loginContent).toContain('quickDemoSignIn(\'customer\')')
  })

  it('ensures the agency authentication route /login and /agency/dashboard exist in router', () => {
    const routes = router.getRoutes().map(r => r.path)
    expect(routes).toContain('/login')
    expect(routes).toContain('/agency/dashboard')
  })
})
