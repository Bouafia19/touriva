<template>
  <div class="editorial-home bg-warm-ivory">
    <!-- ======================================================================
         1. HERO SECTION: IMMERSIVE EDITORIAL PHOTOGRAPHY & DISCOVERY DOCK
         ====================================================================== -->
    <section class="editorial-hero position-relative">
      <v-img
        :src="heroImage"
        height="78vh"
        min-height="560px"
        cover
        eager
        class="hero-img"
      >
        <template #placeholder>
          <div class="d-flex fill-height align-center justify-center bg-deep-green">
            <v-progress-circular indeterminate color="#D9B98C" size="48" />
          </div>
        </template>
      </v-img>

      <!-- Gradient Scrim for Editorial Typography -->
      <div class="hero-scrim"></div>

      <!-- Hero Overlay Content -->
      <v-container class="hero-content fill-height d-flex flex-column justify-center align-center text-center px-4 max-w-container">
        <!-- Subheading Tag -->
        <div class="hero-pill mb-3">
          <v-icon size="14" color="#D9B98C" class="mr-2">mdi-compass</v-icon>
          <span>{{ $t('DiscoverAlgeria') || 'EXPEDITIONS & CULTURAL ODYSSEYS' }}</span>
        </div>

        <!-- Grand Editorial Headline -->
        <h1 class="hero-headline text-white font-serif mb-4">
          Unveil the Timeless Horizons of North Africa
        </h1>

        <!-- Supporting Editorial Copy -->
        <p class="hero-subtext text-sand-light mx-auto mb-8">
          From the golden crests of the Great Western Erg to sun-drenched Mediterranean terraces and Roman antiquities.
          Discover verified excursions, heritage landmarks, and authentic hospitality.
        </p>

        <!-- Floating Search & Discovery Dock -->
        <v-card class="search-dock elevation-8 rounded-xl px-4 py-3" width="100%" max-width="960">
          <v-row align="center" dense>
            <!-- Destination / City Input -->
            <v-col cols="12" sm="5" md="4">
              <v-text-field
                v-model="searchQuery"
                :placeholder="$t('SearchPlaceholder') || 'Where to explore? (e.g. Algiers, Djanet, Oran)'"
                prepend-inner-icon="mdi-map-marker-outline"
                variant="plain"
                hide-details
                density="comfortable"
                class="search-dock-input"
                @keyup.enter="performSearch"
              />
            </v-col>

            <v-divider vertical class="d-none d-sm-block my-2 border-subtle" />

            <!-- Service Category Selector -->
            <v-col cols="12" sm="4" md="4">
              <v-select
                v-model="selectedCategory"
                :items="categoryOptions"
                item-title="title"
                item-value="value"
                variant="plain"
                hide-details
                density="comfortable"
                prepend-inner-icon="mdi-shape-outline"
                class="search-dock-select"
              />
            </v-col>

            <v-divider vertical class="d-none d-md-block my-2 border-subtle" />

            <!-- Search Action Button -->
            <v-col cols="12" sm="3" md="4" class="text-end">
              <v-btn
                block
                color="#173F35"
                size="large"
                rounded="pill"
                class="btn-editorial-primary font-weight-bold"
                @click="performSearch"
              >
                <v-icon start size="18">mdi-magnify</v-icon>
                {{ $t('ExploreNow') || 'Explore Directory' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- B2B Quick Callout Pill in Hero -->
        <div
          tabindex="0"
          role="button"
          :aria-label="$t('b2bHeroCallout')"
          class="hero-b2b-pill mt-5 px-4 py-2 rounded-pill d-inline-flex align-center cursor-pointer"
          @click="scrollToAgency"
          @keydown.enter.prevent="scrollToAgency"
          @keydown.space.prevent="scrollToAgency"
        >
          <v-icon size="16" color="#D9B98C" class="mr-2">mdi-domain</v-icon>
          <span class="text-caption text-sand font-weight-medium mr-2">
            {{ $t('b2bHeroCallout') }}
          </span>
          <span class="text-caption text-white font-weight-bold text-decoration-underline d-inline-flex align-center">
            {{ $t('b2bHeroCalloutAction') }}
            <v-icon size="14" class="ml-1">mdi-arrow-down</v-icon>
          </span>
        </div>
      </v-container>
    </section>

    <!-- ======================================================================
         2. CATEGORY QUICK EXPLORATION BAR
         ====================================================================== -->
    <section class="py-10 border-b border-subtle bg-white">
      <v-container class="max-w-container">
        <v-row justify="center" align="stretch">
          <v-col
            v-for="cat in quickCategories"
            :key="cat.title"
            cols="6"
            sm="6"
            md="3"
          >
            <v-card
              class="category-quick-card h-100 pa-4 d-flex align-center cursor-pointer"
              elevation="0"
              @click="router.push(cat.route)"
            >
              <div class="category-icon-box mr-3">
                <v-icon size="24" color="#173F35">{{ cat.icon }}</v-icon>
              </div>
              <div>
                <div class="font-weight-bold text-forest text-body-1">
                  {{ cat.title }}
                </div>
                <div class="text-caption text-secondary-editorial">
                  {{ cat.count }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ======================================================================
         3. FEATURED EXCURSIONS & GUIDED EXPEDITIONS (REAL TRIPS DATA)
         ====================================================================== -->
    <section class="py-16">
      <v-container class="max-w-container">
        <!-- Section Header -->
        <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-end mb-8">
          <div>
            <div class="editorial-tag mb-1">{{ $t('HandcraftedJourneys') || 'CURATED ADVENTURES' }}</div>
            <h2 class="text-h4 font-serif font-weight-bold text-forest">
              Featured Excursions & Guided Trips
            </h2>
            <p class="text-secondary-editorial mt-1 max-w-prose">
              Immersive travel itineraries organized by certified Algerian tour guides and recognized local agencies.
            </p>
          </div>
          <v-btn
            to="/trips"
            variant="text"
            color="#173F35"
            class="font-weight-bold text-capitalize mt-3 mt-sm-0"
            rounded="pill"
          >
            {{ $t('ViewAllTrips') || 'All Journeys' }}
            <v-icon end size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <!-- Trips Loading Skeletons -->
        <v-row v-if="tripsLoading">
          <v-col v-for="n in 3" :key="n" cols="12" md="4">
            <v-card class="editorial-card pa-4">
              <v-skeleton-loader type="image, heading, text, button" height="360" />
            </v-card>
          </v-col>
        </v-row>

        <!-- Trips Grid -->
        <v-row v-else-if="featuredTrips.length > 0">
          <v-col
            v-for="trip in featuredTrips"
            :key="trip._id"
            cols="12"
            sm="6"
            md="4"
          >
            <TripCard :trip="trip" />
          </v-col>
        </v-row>

        <!-- Empty State Fallback -->
        <v-card v-else class="editorial-card pa-8 text-center my-6">
          <v-icon size="48" color="#D9B98C" class="mb-3">mdi-compass-off-outline</v-icon>
          <h3 class="text-h6 font-weight-bold text-forest mb-2">Upcoming Excursions Being Scheduled</h3>
          <p class="text-caption text-secondary-editorial mb-4">
            New seasonal desert treks and coastal expeditions are being finalized with local guides.
          </p>
          <v-btn to="/sites" color="#173F35" class="btn-editorial-primary" rounded="pill">
            Explore Cultural Sites
          </v-btn>
        </v-card>
      </v-container>
    </section>

    <!-- ======================================================================
         B2B AGENCY MANAGEMENT PLATFORM: ESPACE AGENCES DE VOYAGES
         ====================================================================== -->
    <section id="agency-space" class="b2b-agency-section py-20 text-white position-relative">
      <!-- Background Ambient Glow -->
      <div class="b2b-ambient-glow"></div>

      <v-container class="max-w-container position-relative z-index-2">
        <!-- Section Header -->
        <div class="text-center max-w-content mx-auto mb-14">
          <div class="b2b-pill mb-4">
            <v-icon size="16" color="#D9B98C" class="mr-2">mdi-office-building-outline</v-icon>
            <span>{{ $t('b2bSectionTag') }}</span>
          </div>

          <h2 class="b2b-headline font-serif font-weight-bold text-white mb-4">
            {{ $t('b2bSectionTitle') }}
          </h2>

          <p class="b2b-subtext text-sand-light mx-auto">
            {{ $t('b2bSectionSubtitle') }}
          </p>
        </div>

        <!-- 4 Main Value Propositions (Pillars Grid) -->
        <v-row class="mb-12" align="stretch">
          <!-- Pillar 1: Gestion des circuits -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="b2b-pillar-card pa-6" elevation="0">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="b2b-pillar-icon-box">
                  <v-icon size="26" color="#D9B98C">mdi-map-marker-path</v-icon>
                </div>
                <span class="b2b-pillar-tag">{{ $t('b2bPillar1Tag') }}</span>
              </div>

              <h3 class="text-h6 font-weight-bold text-white mb-2">
                {{ $t('b2bPillar1Title') }}
              </h3>

              <p class="text-caption text-sand-light mb-4 line-height-relaxed">
                {{ $t('b2bPillar1Desc') }}
              </p>

              <v-divider class="border-dark mb-4 mt-auto"></v-divider>

              <div class="d-flex flex-column ga-2">
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar1Feature1') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar1Feature2') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar1Feature3') }}</span>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Pillar 2: Départs et réservations -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="b2b-pillar-card pa-6" elevation="0">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="b2b-pillar-icon-box">
                  <v-icon size="26" color="#D9B98C">mdi-calendar-clock</v-icon>
                </div>
                <span class="b2b-pillar-tag">{{ $t('b2bPillar2Tag') }}</span>
              </div>

              <h3 class="text-h6 font-weight-bold text-white mb-2">
                {{ $t('b2bPillar2Title') }}
              </h3>

              <p class="text-caption text-sand-light mb-4 line-height-relaxed">
                {{ $t('b2bPillar2Desc') }}
              </p>

              <v-divider class="border-dark mb-4 mt-auto"></v-divider>

              <div class="d-flex flex-column ga-2">
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar2Feature1') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar2Feature2') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar2Feature3') }}</span>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Pillar 3: Gestion des voyageurs -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="b2b-pillar-card pa-6" elevation="0">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="b2b-pillar-icon-box">
                  <v-icon size="26" color="#D9B98C">mdi-clipboard-account-outline</v-icon>
                </div>
                <span class="b2b-pillar-tag">{{ $t('b2bPillar3Tag') }}</span>
              </div>

              <h3 class="text-h6 font-weight-bold text-white mb-2">
                {{ $t('b2bPillar3Title') }}
              </h3>

              <p class="text-caption text-sand-light mb-4 line-height-relaxed">
                {{ $t('b2bPillar3Desc') }}
              </p>

              <v-divider class="border-dark mb-4 mt-auto"></v-divider>

              <div class="d-flex flex-column ga-2">
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar3Feature1') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar3Feature2') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar3Feature3') }}</span>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Pillar 4: Suivi financier -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="b2b-pillar-card pa-6" elevation="0">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="b2b-pillar-icon-box">
                  <v-icon size="26" color="#D9B98C">mdi-cash-register</v-icon>
                </div>
                <span class="b2b-pillar-tag">{{ $t('b2bPillar4Tag') }}</span>
              </div>

              <h3 class="text-h6 font-weight-bold text-white mb-2">
                {{ $t('b2bPillar4Title') }}
              </h3>

              <p class="text-caption text-sand-light mb-3 line-height-relaxed">
                {{ $t('b2bPillar4Desc') }}
              </p>

              <!-- Honest Technical Boundary Disclaimer -->
              <div class="b2b-disclaimer-box mb-4">
                <v-icon size="13" color="#D9B98C" class="mr-1">mdi-information-outline</v-icon>
                {{ $t('b2bPillar4Disclaimer') }}
              </div>

              <v-divider class="border-dark mb-4 mt-auto"></v-divider>

              <div class="d-flex flex-column ga-2">
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar4Feature1') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar4Feature2') }}</span>
                </div>
                <div class="d-flex align-center text-caption text-grey-lighten-1">
                  <v-icon size="14" color="#D9B98C" class="mr-2">mdi-check-circle-outline</v-icon>
                  <span>{{ $t('b2bPillar4Feature3') }}</span>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Highlights & Interactive Live Showcase Strip -->
        <div class="b2b-showcase-box pa-6 pa-md-8 mb-12">
          <v-row align="center">
            <!-- Left: Highlights Badges -->
            <v-col cols="12" md="6">
              <div class="text-caption text-sand font-weight-bold text-uppercase mb-3">
                {{ $t('b2bLivePreviewTitle') }}
              </div>
              <h3 class="text-h5 font-serif font-weight-bold text-white mb-4">
                {{ $t('b2bLivePreviewHeadline') }}
              </h3>
              <div class="d-flex flex-wrap ga-2">
                <div class="b2b-badge-chip">
                  <v-icon size="16" color="#D9B98C" class="mr-2">mdi-check-decagram</v-icon>
                  <span>{{ $t('b2bHighlight1') }}</span>
                </div>
                <div class="b2b-badge-chip">
                  <v-icon size="16" color="#D9B98C" class="mr-2">mdi-printer</v-icon>
                  <span>{{ $t('b2bHighlight2') }}</span>
                </div>
                <div class="b2b-badge-chip">
                  <v-icon size="16" color="#D9B98C" class="mr-2">mdi-receipt-text-check</v-icon>
                  <span>{{ $t('b2bHighlight3') }}</span>
                </div>
                <div class="b2b-badge-chip">
                  <v-icon size="16" color="#D9B98C" class="mr-2">mdi-shield-lock-outline</v-icon>
                  <span>{{ $t('b2bHighlight4') }}</span>
                </div>
              </div>
            </v-col>

            <!-- Right: Live Demo Snapshot Stats -->
            <v-col cols="12" md="6" class="mt-6 mt-md-0">
              <v-card class="pa-4 bg-deep-green border-sand-subtle rounded-xl" elevation="0">
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="text-caption font-weight-bold text-sand">
                    {{ $t('b2bLivePreviewBadge') }}
                  </span>
                  <v-chip size="x-small" color="#21866B" variant="flat" class="font-weight-bold text-white">
                    {{ $t('b2bLiveDemoChip') }}
                  </v-chip>
                </div>
                <v-row dense>
                  <v-col cols="6" sm="3" class="text-center pa-2 border-subtle-box">
                    <div class="text-h6 font-weight-bold text-white">3</div>
                    <div class="text-caption text-sand-light text-xs">{{ $t('b2bLiveStatPackages') }}</div>
                  </v-col>
                  <v-col cols="6" sm="3" class="text-center pa-2 border-subtle-box">
                    <div class="text-h6 font-weight-bold text-white">4</div>
                    <div class="text-caption text-sand-light text-xs">{{ $t('b2bLiveStatDepartures') }}</div>
                  </v-col>
                  <v-col cols="6" sm="3" class="text-center pa-2 border-subtle-box">
                    <div class="text-h6 font-weight-bold text-white">4</div>
                    <div class="text-caption text-sand-light text-xs">{{ $t('b2bLiveStatBookings') }}</div>
                  </v-col>
                  <v-col cols="6" sm="3" class="text-center pa-2">
                    <div class="text-h6 font-weight-bold text-sand">100%</div>
                    <div class="text-caption text-sand-light text-xs">{{ $t('b2bLiveStatLedger') }}</div>
                  </v-col>
                </v-row>
                <!-- Explicit Fictional Demo Data Disclaimer -->
                <div class="text-caption text-sand-light text-xs mt-3 text-center font-italic opacity-80">
                  {{ $t('b2bLiveDemoDataNote') }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Prominent Agency Demo Call to Action Dock -->
        <div class="text-center">
          <div class="d-flex flex-column flex-sm-row justify-center align-center ga-4 mb-3">
            <v-btn
              to="/login?demo=agency"
              size="x-large"
              rounded="pill"
              color="#D9B98C"
              class="btn-b2b-primary font-weight-bold elevation-4 px-8 py-3"
            >
              <v-icon start size="22" color="#102D27">mdi-office-building-cog-outline</v-icon>
              <span class="text-forest font-weight-bold">{{ $t('b2bCtaDemo') }}</span>
              <v-icon end size="20" color="#102D27" class="b2b-arrow-icon">mdi-arrow-right</v-icon>
            </v-btn>

            <v-btn
              to="/contactSupport"
              variant="outlined"
              size="large"
              rounded="pill"
              class="border-sand-btn text-sand font-weight-bold px-6"
            >
              <v-icon start size="18">mdi-email-outline</v-icon>
              {{ $t('b2bCtaContact') }}
            </v-btn>
          </div>

          <p class="text-caption text-sand-light">
            {{ $t('b2bCtaDemoSub') }}
          </p>
        </div>
      </v-container>
    </section>

    <!-- ======================================================================
         4. EDITORIAL DESTINATION COLLECTIONS
         ====================================================================== -->
    <section class="py-16 bg-white border-y border-subtle">
      <v-container class="max-w-container">
        <!-- Section Header -->
        <div class="text-center max-w-content mx-auto mb-12">
          <div class="editorial-tag mb-2">{{ $t('Regions') || 'ICONIC ALGERIAN REGIONS' }}</div>
          <h2 class="text-h4 font-serif font-weight-bold text-forest mb-3">
            Destinations of Extraordinary Character
          </h2>
          <p class="text-secondary-editorial">
            Journey across 2.38 million square kilometers of dramatic contrasts, ancient Roman crossroads, and Saharan wonders.
          </p>
        </div>

        <!-- Editorial Asymmetrical Grid -->
        <v-row>
          <v-col
            v-for="(dest, idx) in curatedDestinations"
            :key="dest.name"
            cols="12"
            :sm="idx === 0 || idx === 1 ? 6 : 6"
            :md="idx === 0 || idx === 1 ? 6 : 4"
          >
            <v-card
              class="editorial-card destination-tile h-100 cursor-pointer position-relative overflow-hidden"
              elevation="0"
              @click="filterByDestination(dest.name)"
            >
              <v-img
                :src="dest.image"
                :height="idx === 0 || idx === 1 ? 340 : 280"
                cover
                eager
                class="img-editorial-zoom"
              >
                <template #placeholder>
                  <div class="d-flex fill-height align-center justify-center bg-deep-green">
                    <v-progress-circular indeterminate color="#D9B98C" size="32" />
                  </div>
                </template>
              </v-img>

              <div class="destination-scrim"></div>

              <div class="position-absolute bottom-0 left-0 right-0 pa-5 text-white">
                <span class="destination-region-tag">{{ dest.tag }}</span>
                <h3 class="text-h5 font-serif font-weight-bold text-white mb-1">
                  {{ dest.name }}
                </h3>
                <p class="text-caption text-sand-light line-clamp-2 mb-0">
                  {{ dest.description }}
                </p>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ======================================================================
         5. MUST-VISIT HISTORICAL SITES & ATTRACTIONS (REAL SITES DATA)
         ====================================================================== -->
    <section class="py-16">
      <v-container class="max-w-container">
        <!-- Section Header -->
        <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-end mb-8">
          <div>
            <div class="editorial-tag mb-1">{{ $t('HeritageAttractions') || 'HERITAGE & MONUMENTS' }}</div>
            <h2 class="text-h4 font-serif font-weight-bold text-forest">
              Must-Visit Cultural Sites & Landmarks
            </h2>
            <p class="text-secondary-editorial mt-1 max-w-prose">
              Centuries of archaeological wonder, Ottoman architecture, and UNESCO World Heritage treasures.
            </p>
          </div>
          <v-btn
            to="/sites"
            variant="text"
            color="#173F35"
            class="font-weight-bold text-capitalize mt-3 mt-sm-0"
            rounded="pill"
          >
            {{ $t('ViewAllSites') || 'All Cultural Sites' }}
            <v-icon end size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <!-- Sites Loading Skeletons -->
        <v-row v-if="sitesLoading">
          <v-col v-for="n in 3" :key="n" cols="12" md="4">
            <v-card class="editorial-card pa-4">
              <v-skeleton-loader type="image, heading, text" height="340" />
            </v-card>
          </v-col>
        </v-row>

        <!-- Sites Grid -->
        <v-row v-else-if="featuredSites.length > 0">
          <v-col
            v-for="site in featuredSites"
            :key="site._id || site.name"
            cols="12"
            sm="6"
            md="4"
          >
            <SiteCard :site="site" />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ======================================================================
         6. STAYS & CULINARY EXPERIENCES PREVIEW
         ====================================================================== -->
    <section class="py-16 bg-white border-y border-subtle">
      <v-container class="max-w-container">
        <v-row>
          <!-- Left Column: Handpicked Accommodations -->
          <v-col cols="12" md="6" class="pr-md-6 border-e-md border-subtle">
            <div class="d-flex justify-space-between align-center mb-6">
              <div>
                <div class="editorial-tag mb-1">{{ $t('Stays') || 'HOSPITALITY' }}</div>
                <h3 class="text-h5 font-serif font-weight-bold text-forest">
                  Handpicked Stays & Retreats
                </h3>
              </div>
              <v-btn to="/hotels" variant="text" color="#173F35" size="small" class="font-weight-bold">
                {{ $t('ViewAll') || 'View All' }}
              </v-btn>
            </div>

            <v-row v-if="hotelsLoading">
              <v-col cols="12" sm="6" v-for="n in 2" :key="n">
                <v-skeleton-loader type="image, heading, text" height="280" />
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col cols="12" sm="6" v-for="hotel in featuredHotels" :key="hotel._id">
                <HotelCard :hotel="hotel" />
              </v-col>
            </v-row>
          </v-col>

          <!-- Right Column: Culinary Traditions -->
          <v-col cols="12" md="6" class="pl-md-6 mt-10 mt-md-0">
            <div class="d-flex justify-space-between align-center mb-6">
              <div>
                <div class="editorial-tag mb-1">{{ $t('Gastronomy') || 'DINING & FLAVORS' }}</div>
                <h3 class="text-h5 font-serif font-weight-bold text-forest">
                  Authentic Culinary Encounters
                </h3>
              </div>
              <v-btn to="/restaurants" variant="text" color="#173F35" size="small" class="font-weight-bold">
                {{ $t('ViewAll') || 'View All' }}
              </v-btn>
            </div>

            <v-row v-if="restaurantsLoading">
              <v-col cols="12" sm="6" v-for="n in 2" :key="n">
                <v-skeleton-loader type="image, heading, text" height="280" />
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col cols="12" sm="6" v-for="resto in featuredRestaurants" :key="resto._id">
                <RestaurantCard :restaurant="resto" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ======================================================================
         7. TRUST & EDITORIAL STORYTELLING SECTION
         ====================================================================== -->
    <section class="py-16 bg-warm-ivory">
      <v-container class="max-w-container">
        <v-card class="editorial-card pa-8 pa-md-12 bg-deep-green text-white" elevation="0">
          <v-row align="center">
            <v-col cols="12" md="6">
              <div class="editorial-tag text-sand mb-2">THE TOURIVA PROMISE</div>
              <h2 class="text-h4 font-serif font-weight-bold text-white mb-4">
                Travel With Authenticity, Safety & Purpose
              </h2>
              <p class="text-sand-light text-body-1 mb-6">
                Touriva bridges travelers directly with certified local tourism guides, licensed hospitality operators,
                and national parks across Algeria. Every journey contributes directly to local heritage preservation.
              </p>

              <v-row dense>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#D9B98C" class="mr-3" size="24">mdi-shield-check</v-icon>
                  <span class="text-body-2 font-weight-medium">Authorized Tourism Guides</span>
                </v-col>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#D9B98C" class="mr-3" size="24">mdi-map-clock</v-icon>
                  <span class="text-body-2 font-weight-medium">Day-by-Day Curated Itineraries</span>
                </v-col>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#D9B98C" class="mr-3" size="24">mdi-database-check</v-icon>
                  <span class="text-body-2 font-weight-medium">Verified Reservations</span>
                </v-col>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#D9B98C" class="mr-3" size="24">mdi-hand-heart</v-icon>
                  <span class="text-body-2 font-weight-medium">Community Empowerment</span>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="6" class="text-center mt-6 mt-md-0">
              <v-img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
                cover
                eager
                height="340"
                class="rounded-xl border-sand shadow-lg"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </section>

    <!-- ======================================================================
         8. REFINED EDITORIAL FOOTER
         ====================================================================== -->
    <footer class="editorial-footer bg-deep-green text-sand-light pt-16 pb-8 border-t border-sand-subtle">
      <v-container class="max-w-container">
        <v-row class="mb-12">
          <!-- Col 1: Brand & Tagline -->
          <v-col cols="12" md="4" class="mb-6 mb-md-0">
            <v-img
              src="/logo-dark.svg"
              alt="Touriva"
              width="160"
              height="45"
              contain
              class="mb-4"
            />
            <p class="text-body-2 text-sand-light font-serif italic mb-4" style="font-size: 1.05rem !important;">
              "Discover More. Travel Better."
            </p>
            <p class="text-caption text-grey-lighten-1 line-height-relaxed max-w-prose">
              The premier national tourism and travel discovery platform for Algeria. Curating extraordinary journeys,
              safeguarding heritage, and connecting world travelers with passionate certified local guides.
            </p>
          </v-col>

          <!-- Col 2: Directory Links -->
          <v-col cols="6" sm="4" md="2">
            <div class="footer-col-title text-sand mb-4">EXPLORE</div>
            <ul class="footer-links-list">
              <li><router-link to="/trips">Guided Excursions</router-link></li>
              <li><router-link to="/sites">Historical Sites</router-link></li>
              <li><router-link to="/hotels">Hotels & Stays</router-link></li>
              <li><router-link to="/restaurants">Dining & Cafés</router-link></li>
              <li><router-link to="/subscriptions">My Reservations</router-link></li>
            </ul>
          </v-col>

          <!-- Col 3: Tourism Regions -->
          <v-col cols="6" sm="4" md="3">
            <div class="footer-col-title text-sand mb-4">REGIONS</div>
            <ul class="footer-links-list">
              <li><a href="#" @click.prevent="filterByDestination('Algiers')">Algiers & Central Coast</a></li>
              <li><a href="#" @click.prevent="filterByDestination('Djanet')">Djanet & Tassili n’Ajjer</a></li>
              <li><a href="#" @click.prevent="filterByDestination('Constantine')">Constantine Highlands</a></li>
              <li><a href="#" @click.prevent="filterByDestination('Taghit')">Taghit & Grand Erg</a></li>
              <li><a href="#" @click.prevent="filterByDestination('Oran')">Oran & Western Coast</a></li>
            </ul>
          </v-col>

          <!-- Col 4: Platform & Support -->
          <v-col cols="12" sm="4" md="3" class="mt-4 mt-sm-0">
            <div class="footer-col-title text-sand mb-4">CONTACT & SUPPORT</div>
            <div class="text-caption text-grey-lighten-1 mb-2">
              <v-icon size="16" color="#D9B98C" class="mr-2">mdi-email-outline</v-icon>
              support@touriva.com
            </div>
            <div class="text-caption text-grey-lighten-1 mb-2">
              <v-icon size="16" color="#D9B98C" class="mr-2">mdi-phone-outline</v-icon>
              +213 (0) 550 000 000
            </div>
            <div class="text-caption text-grey-lighten-1 mb-4">
              <v-icon size="16" color="#D9B98C" class="mr-2">mdi-map-marker-outline</v-icon>
              Algiers, People’s Democratic Republic of Algeria
            </div>
            <v-btn
              to="/contactSupport"
              variant="outlined"
              size="small"
              rounded="pill"
              class="border-sand-btn text-sand font-weight-bold"
            >
              Contact Support
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-6 border-dark"></v-divider>

        <!-- Copyright & Bottom Bar -->
        <div class="d-flex flex-column flex-sm-row justify-space-between align-center text-caption text-grey-lighten-2 ga-2">
          <div>
            &copy; 2026 Touriva Tourism Platform. All rights reserved.
          </div>
          <div class="d-flex ga-4">
            <router-link to="/terms&conditions" class="text-grey-lighten-2 hover-sand">Terms & Conditions</router-link>
            <router-link to="/contactSupport" class="text-grey-lighten-2 hover-sand">Support</router-link>
            <a href="http://localhost:2021/admin/" class="text-sand hover-sand">Agency & Admin Portal</a>
          </div>
        </div>
      </v-container>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTripsStore } from '@/stores/trips'
import { useSitesStore } from '@/stores/sites'
import { useHotelsStore } from '@/stores/hotels'
import { useRestaurantsStore } from '@/stores/restaurants'
import { CURATED_PHOTOGRAPHY } from '@/config/curatedImages'

import TripCard from '@/components/TripCard.vue'
import SiteCard from '@/components/SiteCard.vue'
import HotelCard from '@/components/HotelCard.vue'
import RestaurantCard from '@/components/RestaurantCard.vue'

const router = useRouter()
const route = useRoute()

const tripsStore = useTripsStore()
const sitesStore = useSitesStore()
const hotelsStore = useHotelsStore()
const restaurantsStore = useRestaurantsStore()

const heroImage = CURATED_PHOTOGRAPHY.hero.saharaSunset
const curatedDestinations = CURATED_PHOTOGRAPHY.destinations

const searchQuery = ref('')
const selectedCategory = ref('trips')

const categoryOptions = [
  { title: 'Guided Excursions', value: 'trips' },
  { title: 'Historical Sites', value: 'sites' },
  { title: 'Hotels & Lodges', value: 'hotels' },
  { title: 'Dining & Flavors', value: 'restaurants' }
]

const quickCategories = CURATED_PHOTOGRAPHY.categories

const tripsLoading = computed(() => tripsStore.isLoading)
const sitesLoading = computed(() => sitesStore.isLoading)
const hotelsLoading = computed(() => hotelsStore.isLoading)
const restaurantsLoading = computed(() => restaurantsStore.isLoading)

const featuredTrips = computed(() => {
  return (tripsStore.getTrips || []).slice(0, 6)
})

const featuredSites = computed(() => {
  return (sitesStore.getSites || []).slice(0, 6)
})

const featuredHotels = computed(() => {
  return (hotelsStore.getHotels || []).slice(0, 2)
})

const featuredRestaurants = computed(() => {
  return (restaurantsStore.getRestaurants || []).slice(0, 2)
})

const performSearch = () => {
  const targetRoute = selectedCategory.value === 'trips' ? '/trips'
    : selectedCategory.value === 'sites' ? '/sites'
    : selectedCategory.value === 'hotels' ? '/hotels'
    : '/restaurants'

  router.push({
    path: targetRoute,
    query: searchQuery.value ? { q: searchQuery.value } : {}
  })
}

const filterByDestination = (name) => {
  router.push({
    path: '/trips',
    query: { destination: name }
  })
}

const scrollToAgency = () => {
  const el = document.getElementById('agency-space')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(async () => {
  // Fetch real catalog data across all tourism resources
  tripsStore.fetchTrips()
  sitesStore.fetchCatalogSites()
  hotelsStore.fetchCatalogHotels()
  restaurantsStore.fetchCatalogRestaurants()

  // Smooth-scroll to agency section if target hash is present
  if (route.hash === '#agency-space') {
    setTimeout(() => {
      scrollToAgency()
    }, 350)
  }
})
</script>

<style scoped>
.editorial-home {
  overflow-x: hidden;
}

.max-w-container {
  max-width: 1360px;
}

.max-w-content {
  max-width: 760px;
}

.max-w-prose {
  max-width: 580px;
}

/* Hero Section */
.editorial-hero {
  position: relative;
  overflow: hidden;
}

.hero-img {
  filter: brightness(0.92);
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(16, 45, 39, 0.4) 0%,
    rgba(16, 45, 39, 0.65) 50%,
    rgba(16, 45, 39, 0.9) 100%
  );
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  margin-top: -30px;
}

.hero-pill {
  background: rgba(16, 45, 39, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(217, 185, 140, 0.4);
  color: #FAF8F2;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 6px 18px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
}

.hero-headline {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  max-width: 950px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-subtext {
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  line-height: 1.6;
  max-width: 780px;
  font-weight: 400;
  opacity: 0.95;
}

/* Search Dock */
.search-dock {
  background: #FFFFFF !important;
  border: 1px solid rgba(231, 232, 225, 0.8) !important;
  box-shadow: 0 20px 45px -10px rgba(16, 45, 39, 0.25) !important;
}

.search-dock-input,
.search-dock-select {
  font-size: 0.95rem;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

/* Category Quick Card */
.category-quick-card {
  background: #FAF8F2 !important;
  border: 1px solid #E7E8E1 !important;
  border-radius: 12px !important;
  transition: all 0.25s ease !important;
}

.category-quick-card:hover {
  background: #FFFFFF !important;
  border-color: #D9B98C !important;
  box-shadow: 0 10px 24px -6px rgba(16, 45, 39, 0.08) !important;
  transform: translateY(-2px);
}

.category-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #F5EDE0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Destination Tiles */
.destination-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(16, 45, 39, 0.2) 0%,
    transparent 40%,
    rgba(16, 45, 39, 0.88) 100%
  );
  pointer-events: none;
}

.destination-region-tag {
  background: rgba(217, 185, 140, 0.9);
  color: #102D27;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 6px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer Styling */
.filter-brightness {
  filter: brightness(0) invert(1);
}

.border-sand-subtle {
  border-color: rgba(217, 185, 140, 0.2) !important;
}

.border-dark {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.border-sand-btn {
  border-color: rgba(217, 185, 140, 0.5) !important;
}

.border-sand-btn:hover {
  background-color: rgba(217, 185, 140, 0.15) !important;
}

.footer-col-title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links-list li {
  margin-bottom: 10px;
}

.footer-links-list a {
  color: #FAF8F2;
  opacity: 0.8;
  font-size: 0.88rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.footer-links-list a:hover,
.hover-sand:hover {
  color: #D9B98C !important;
  opacity: 1;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 600px) {
  .hero-img {
    height: 580px !important;
    min-height: 520px !important;
  }
  .hero-content {
    margin-top: 0 !important;
    padding-top: 24px !important;
    padding-bottom: 24px !important;
  }
  .hero-headline {
    font-size: 1.85rem !important;
    line-height: 1.25 !important;
  }
  .hero-subtext {
    font-size: 0.95rem !important;
    line-height: 1.45 !important;
    margin-bottom: 1.25rem !important;
  }
  .search-dock {
    padding: 12px !important;
  }
}

/* ==========================================================================
   B2B Travel Agency Space Styling
   ========================================================================== */
.hero-b2b-pill {
  background: rgba(23, 63, 53, 0.88);
  border: 1px solid rgba(217, 185, 140, 0.45);
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
  max-width: 960px;
}

.hero-b2b-pill:hover {
  background: rgba(16, 45, 39, 0.98);
  border-color: #D9B98C;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.b2b-agency-section {
  background: linear-gradient(180deg, #102D27 0%, #173F35 50%, #102D27 100%);
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(217, 185, 140, 0.25);
  border-bottom: 1px solid rgba(217, 185, 140, 0.25);
}

.b2b-ambient-glow {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 500px;
  background: radial-gradient(circle, rgba(217, 185, 140, 0.12) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.z-index-2 {
  position: relative;
  z-index: 2;
}

.b2b-pill {
  background: rgba(217, 185, 140, 0.15);
  border: 1px solid rgba(217, 185, 140, 0.4);
  color: #D9B98C;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 6px 20px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
}

.b2b-headline {
  font-size: clamp(2rem, 3.8vw, 3rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.b2b-subtext {
  font-size: clamp(1rem, 1.4vw, 1.18rem);
  line-height: 1.65;
  max-width: 820px;
  font-weight: 400;
  opacity: 0.95;
}

.b2b-pillar-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(217, 185, 140, 0.25) !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.b2b-pillar-card:hover {
  background: rgba(255, 255, 255, 0.09) !important;
  border-color: #D9B98C !important;
  transform: translateY(-6px);
  box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.4) !important;
}

.b2b-pillar-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(217, 185, 140, 0.18);
  border: 1px solid rgba(217, 185, 140, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.b2b-pillar-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #D9B98C;
}

.b2b-disclaimer-box {
  background: rgba(217, 185, 140, 0.08);
  border: 1px dashed rgba(217, 185, 140, 0.35);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.72rem;
  color: #F5EDE0;
  line-height: 1.4;
}

.b2b-showcase-box {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(217, 185, 140, 0.2);
  border-radius: 20px;
}

.b2b-badge-chip {
  background: rgba(217, 185, 140, 0.12);
  border: 1px solid rgba(217, 185, 140, 0.3);
  color: #FAF8F2;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.border-subtle-box {
  border-right: 1px solid rgba(217, 185, 140, 0.18);
}

[dir="rtl"] .border-subtle-box {
  border-right: none;
  border-left: 1px solid rgba(217, 185, 140, 0.18);
}

.btn-b2b-primary {
  background-color: #D9B98C !important;
  color: #102D27 !important;
  transition: all 0.25s ease;
}

.btn-b2b-primary:hover {
  background-color: #E2C9A5 !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35) !important;
}

[dir="rtl"] .b2b-arrow-icon {
  transform: scaleX(-1);
}
</style>