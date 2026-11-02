import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Touriva Trip Builder UX & Mode Convergence Verification', () => {
  const tripBuilderPath = path.resolve(__dirname, '../views/Trip/TripBuilder.vue')
  const myTripsPath = path.resolve(__dirname, '../views/Trip/MyTrips.vue')
  const tripDetailPath = path.resolve(__dirname, '../views/Trip/TripDetail.vue')

  const tripBuilderContent = fs.readFileSync(tripBuilderPath, 'utf8')
  const myTripsContent = fs.readFileSync(myTripsPath, 'utf8')
  const tripDetailContent = fs.readFileSync(tripDetailPath, 'utf8')

  describe('1. Trip Builder Dual-Mode Architecture', () => {
    it('1.1: TripBuilder contains mode switcher between AI Concierge and Manual Builder', () => {
      expect(tripBuilderContent).toContain('mode-switcher-container')
      expect(tripBuilderContent).toContain('switchMode(\'ai\')')
      expect(tripBuilderContent).toContain('switchMode(\'manual\')')
      expect(tripBuilderContent).toContain('Create with AI')
      expect(tripBuilderContent).toContain('Create Manually')
    })

    it('1.2: Reads and respects route query param ?mode=manual', () => {
      expect(tripBuilderContent).toContain('route.query.mode === \'manual\'')
      expect(tripBuilderContent).toContain('builderMode.value = \'manual\'')
    })

    it('1.3: Provides clear progress context: Where am I, What to provide, and % complete', () => {
      expect(tripBuilderContent).toContain('WHERE AM I?')
      expect(tripBuilderContent).toContain('currentStepTitle')
      expect(tripBuilderContent).toContain('v-progress-linear')
      expect(tripBuilderContent).toContain('Step {{ currentStep }} of {{ totalSteps }}')
    })
  })

  describe('2. AI Concierge Wizard Implementation', () => {
    it('2.1: Step 1 contains Algerian destination search and popular wilayas', () => {
      expect(tripBuilderContent).toContain('Where would you like to explore?')
      expect(tripBuilderContent).toContain('POPULAR FEATURED DESTINATIONS')
      expect(tripBuilderContent).toContain('popularCities')
      expect(tripBuilderContent).toContain('triggerExplicitExternalSearch')
    })

    it('2.2: Step 2 contains date selection, duration calculation, and duration presets', () => {
      expect(tripBuilderContent).toContain('When will you be traveling?')
      expect(tripBuilderContent).toContain('durationPresets')
      expect(tripBuilderContent).toContain('Departure Date')
      expect(tripBuilderContent).toContain('Return Date')
      expect(tripBuilderContent).toContain('onAiDateChange')
    })

    it('2.3: Step 3 contains travel party type and budget tier selection', () => {
      expect(tripBuilderContent).toContain('partyOptions')
      expect(tripBuilderContent).toContain('budgetOptions')
      expect(tripBuilderContent).toContain('Solo Traveler')
      expect(tripBuilderContent).toContain('Budget-Friendly')
    })

    it('2.4: Step 4 contains curated cultural interests and animated concierge loading', () => {
      expect(tripBuilderContent).toContain('curatedInterests')
      expect(tripBuilderContent).toContain('ai-loading-box')
      expect(tripBuilderContent).toContain('activeLoadingMessage')
      expect(tripBuilderContent).toContain('loadingMessages')
      expect(tripBuilderContent).toContain('Generate My Custom Itinerary')
    })
  })

  describe('3. Manual Step-by-Step Custom Builder Implementation', () => {
    it('3.1: Step 1 captures trip title, destination wilaya, theme, and overview', () => {
      expect(tripBuilderContent).toContain('Trip Essentials & Title')
      expect(tripBuilderContent).toContain('manualForm.name')
      expect(tripBuilderContent).toContain('manualForm.destination')
      expect(tripBuilderContent).toContain('manualForm.theme')
    })

    it('3.2: Step 2 captures duration in days, pricing in DZD, and synchronizes days', () => {
      expect(tripBuilderContent).toContain('Schedule, Duration & Budget')
      expect(tripBuilderContent).toContain('manualForm.durationDays')
      expect(tripBuilderContent).toContain('manualForm.price')
      expect(tripBuilderContent).toContain('onManualDurationChange')
    })

    it('3.3: Step 3 supports daily itinerary with scheduled stops per day', () => {
      expect(tripBuilderContent).toContain('Daily Itinerary & Planned Stops')
      expect(tripBuilderContent).toContain('getDayStops')
      expect(tripBuilderContent).toContain('openAddStopDialog')
      expect(tripBuilderContent).toContain('removeStop')
      expect(tripBuilderContent).toContain('Add Scheduled Stop')
    })

    it('3.4: Step 4 includes prestations checklist, cover image selection, and submission', () => {
      expect(tripBuilderContent).toContain('Inclusions, Cover & Confirmation')
      expect(tripBuilderContent).toContain('defaultInclusionOptions')
      expect(tripBuilderContent).toContain('coverImageOptions')
      expect(tripBuilderContent).toContain('submitManualTrip')
      expect(tripBuilderContent).toContain('tripStore.createTrip')
    })
  })

  describe('4. MyTrips & Navigation Convergence', () => {
    it('4.1: MyTrips routes "Create a new trip" to manual builder and "Build with AI" to AI concierge', () => {
      expect(myTripsContent).toContain("router.push('/tripBuilder?mode=manual')")
      expect(myTripsContent).toContain("router.push('/tripBuilder?mode=ai')")
    })

    it('4.2: MyTrips sets the created trip object instead of the method reference', () => {
      expect(myTripsContent).toContain('tripStore.setTrip(createdTrip)')
      expect(myTripsContent).not.toContain('tripStore.setTrip(createTrip)')
    })

    it('4.3: TripDetail displays stops with title, time, and days properly', () => {
      expect(tripDetailContent).toContain('stop.title')
      expect(tripDetailContent).toContain('stop.time')
      expect(tripDetailContent).toContain('tripDays')
    })
  })
})
