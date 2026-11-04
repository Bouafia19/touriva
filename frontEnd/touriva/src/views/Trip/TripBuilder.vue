<template>
  <div class="editorial-trip-builder bg-warm-ivory min-vh-100 pb-16">
    <!-- Header Banner -->
    <div class="catalog-hero py-8 py-md-10 px-4 border-b border-subtle bg-white">
      <v-container class="max-w-container">
        <div class="text-center max-w-content mx-auto">
          <div class="editorial-tag mb-1">
            <img src="/logo.jpg" width="14" height="14" style="vertical-align: middle; border-radius: 2px;" class="mr-1" alt="Touriva" />
            {{ $t('tripBuilder') || 'TOURIVA TRIP BUILDER' }}
          </div>
          <h1 class="text-h3 font-serif font-weight-bold text-forest mb-2">
            Design Your Bespoke Algerian Journey
          </h1>
          <p class="text-secondary-editorial mb-4">
            Create an authentic multi-day travel experience across Algeria's finest heritage and natural landmarks.
          </p>

          <!-- Mode Selector Pill Switcher -->
          <div class="mode-switcher-container d-inline-flex pa-1 rounded-pill bg-light-sand border-subtle elevation-1">
            <v-btn
              :color="builderMode === 'ai' ? '#173F35' : 'transparent'"
              :class="{ 'text-white font-weight-bold': builderMode === 'ai', 'text-forest': builderMode !== 'ai' }"
              rounded="pill"
              variant="flat"
              class="px-5 mode-switch-btn"
              @click="switchMode('ai')"
            >
              <v-icon start size="18" :color="builderMode === 'ai' ? '#D9B98C' : '#173F35'">mdi-creation</v-icon>
              {{ $t('createWithAI') || 'Create with AI' }}
            </v-btn>
            <v-btn
              :color="builderMode === 'manual' ? '#173F35' : 'transparent'"
              :class="{ 'text-white font-weight-bold': builderMode === 'manual', 'text-forest': builderMode !== 'manual' }"
              rounded="pill"
              variant="flat"
              class="px-5 mode-switch-btn"
              @click="switchMode('manual')"
            >
              <v-icon start size="18" :color="builderMode === 'manual' ? '#D9B98C' : '#173F35'">mdi-pencil-ruler</v-icon>
              {{ $t('createManually') || 'Create Manually' }}
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Main Stepper Wizard Container -->
    <v-container class="max-w-container py-8">
      <!-- Where am I & Progress Card -->
      <div class="wizard-header-context mb-6">
        <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-3">
          <div>
            <span class="text-caption font-weight-bold text-sand-dark text-uppercase tracking-wider">
              {{ builderMode === 'ai' ? 'AI CONCIERGE FLOW' : 'CUSTOM ITINERARY BUILDER' }}
            </span>
            <div class="text-h6 font-weight-bold text-forest">
              {{ currentStepTitle }}
            </div>
          </div>
          <div class="text-caption text-secondary-editorial mt-1 mt-sm-0">
            <span class="font-weight-bold text-forest">Step {{ currentStep }} of {{ totalSteps }}</span>
            ({{ Math.round((currentStep / totalSteps) * 100) }}% complete)
          </div>
        </div>

        <v-progress-linear
          :model-value="(currentStep / totalSteps) * 100"
          color="#21866B"
          bg-color="#E7E8E1"
          height="6"
          rounded
        ></v-progress-linear>
      </div>

      <!-- Step Indicator Nodes -->
      <div class="stepper-indicator-bar mb-8 d-flex justify-center align-center">
        <div
          v-for="(stName, stIdx) in stepLabels"
          :key="stIdx"
          class="step-node d-flex align-center"
          :class="{ 'step-active': currentStep === stIdx + 1, 'step-completed': currentStep > stIdx + 1 }"
        >
          <div
            class="step-circle"
            :class="{ 'cursor-pointer': currentStep > stIdx + 1 }"
            @click="currentStep > stIdx + 1 ? currentStep = stIdx + 1 : null"
          >
            <v-icon size="16" v-if="currentStep > stIdx + 1">mdi-check</v-icon>
            <span v-else>{{ stIdx + 1 }}</span>
          </div>
          <span class="step-label d-none d-sm-inline-block ml-2">{{ stName }}</span>
          <div v-if="stIdx < stepLabels.length - 1" class="step-connector mx-2 mx-md-4"></div>
        </div>
      </div>

      <!-- Main Step Card -->
      <v-card class="editorial-card pa-6 pa-md-10" elevation="0">
        <!-- Error Banner if any -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          color="#C24545"
          class="mb-6"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- ============================================================== -->
        <!-- MODE 1: ✨ AI CONCIERGE WIZARD                                 -->
        <!-- ============================================================== -->
        <div v-if="builderMode === 'ai'">
          <!-- AI STEP 1: DESTINATION -->
          <div v-if="currentStep === 1" class="step-content">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 1 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                Where would you like to explore?
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Select an Algerian wilaya or city to begin crafting your itinerary with local verified spots.
              </p>
            </div>

            <v-row justify="center">
              <v-col cols="12" md="8">
                <v-combobox
                  v-model="aiForm.city"
                  v-model:search="citySearchQuery"
                  :items="citySuggestions"
                  item-title="name"
                  item-value="name"
                  :loading="isSearchingCity"
                  :placeholder="$t('search') || 'Enter city or destination (e.g. Algiers, Djanet, Oran, Tlemcen)...'"
                  prepend-inner-icon="mdi-map-marker-outline"
                  append-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  rounded="pill"
                  color="#173F35"
                  class="bg-white elevation-1"
                  clearable
                  no-filter
                  @click:append-inner="triggerExplicitExternalSearch"
                  @keydown.enter.prevent="triggerExplicitExternalSearch"
                  @update:model-value="onAiDestinationSelected"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps" :title="item.raw.name" :subtitle="item.raw.displayName">
                      <template #prepend>
                        <v-icon :color="item.raw.source === 'nominatim' ? '#2B6CB0' : '#21866B'" size="20">
                          {{ item.raw.source === 'nominatim' ? 'mdi-earth' : 'mdi-map-marker' }}
                        </v-icon>
                      </template>
                      <template v-if="item.raw.source === 'nominatim'" #append>
                        <v-chip size="x-small" color="primary" variant="tonal" class="text-caption">OSM</v-chip>
                      </template>
                    </v-list-item>
                  </template>
                </v-combobox>
                <div class="text-caption text-secondary-editorial mt-2 px-2 text-center">
                  Instant Algerian curated destinations. Press Enter or click
                  <v-icon size="14" class="mx-1" color="#173F35">mdi-magnify</v-icon>
                  to query OpenStreetMap.
                </div>
              </v-col>
            </v-row>

            <!-- Popular Destinations Grid -->
            <div class="text-center mt-8">
              <div class="editorial-tag text-secondary-editorial mb-4">
                POPULAR FEATURED DESTINATIONS
              </div>
              <v-row justify="center">
                <v-col
                  v-for="c in popularCities"
                  :key="c.name"
                  cols="6"
                  sm="4"
                  md="2"
                >
                  <v-card
                    class="editorial-card pa-3 text-center cursor-pointer h-100 transition-all"
                    :class="{ 'card-selected': aiForm.city === c.name }"
                    elevation="0"
                    @click="selectAiCity(c)"
                  >
                    <v-icon size="28" :color="aiForm.city === c.name ? '#21866B' : '#173F35'" class="mb-1">
                      mdi-city-variant-outline
                    </v-icon>
                    <div class="font-weight-bold text-forest text-body-2">{{ c.name }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- AI STEP 2: DATES & DURATION -->
          <div v-else-if="currentStep === 2" class="step-content">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 2 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                When will you be traveling?
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Select your intended travel window or choose a standard expedition duration.
              </p>
            </div>

            <!-- Quick Duration Presets -->
            <div class="d-flex justify-center flex-wrap ga-3 mb-8">
              <v-btn
                v-for="preset in durationPresets"
                :key="preset.days"
                rounded="pill"
                variant="outlined"
                :color="aiForm.days === preset.days ? '#173F35' : '#69736E'"
                :class="{ 'btn-preset-active': aiForm.days === preset.days }"
                class="px-4 text-caption font-weight-bold"
                @click="applyDurationPreset(preset.days)"
              >
                <v-icon start size="16">mdi-calendar-clock</v-icon>
                {{ preset.label }} ({{ preset.days }} Days)
              </v-btn>
            </div>

            <v-row justify="center">
              <v-col cols="12" sm="6" md="5">
                <v-text-field
                  v-model="aiForm.startDate"
                  type="date"
                  :min="todayDateStr"
                  label="Departure Date"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                  prepend-inner-icon="mdi-calendar-start"
                  @change="onAiDateChange"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="5">
                <v-text-field
                  v-model="aiForm.endDate"
                  type="date"
                  :min="aiForm.startDate || todayDateStr"
                  label="Return Date"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                  prepend-inner-icon="mdi-calendar-end"
                  @change="onAiDateChange"
                ></v-text-field>
              </v-col>
            </v-row>

            <div class="text-center mt-4">
              <v-chip color="#21866B" variant="flat" class="text-white font-weight-bold px-4 py-2" size="large">
                <v-icon start size="18">mdi-clock-outline</v-icon>
                Itinerary Duration: {{ aiForm.days }} {{ aiForm.days === 1 ? 'Day' : 'Days' }}
              </v-chip>
            </div>
          </div>

          <!-- AI STEP 3: PARTY TYPE & BUDGET -->
          <div v-else-if="currentStep === 3" class="step-content">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 3 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                Who is joining and what is your budget style?
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Customize recommendations to match your traveling party and desired comfort tier.
              </p>
            </div>

            <div class="mb-8">
              <div class="text-subtitle-1 font-weight-bold text-forest mb-4 text-center">
                Select Your Travel Party
              </div>
              <v-row justify="center">
                <v-col
                  v-for="t in partyOptions"
                  :key="t.value"
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <v-card
                    class="editorial-card pa-5 text-center cursor-pointer h-100 transition-all"
                    :class="{ 'card-selected': aiForm.partyType === t.value }"
                    elevation="0"
                    @click="aiForm.partyType = t.value"
                  >
                    <div class="category-icon-box mx-auto mb-3" style="width: 52px; height: 52px; border-radius: 14px; background: rgba(23, 63, 53, 0.06);">
                      <v-icon size="28" :color="aiForm.partyType === t.value ? '#21866B' : '#173F35'">
                        {{ t.icon }}
                      </v-icon>
                    </div>
                    <div class="font-weight-bold text-forest text-body-1 mb-1">{{ t.label }}</div>
                    <div class="text-caption text-secondary-editorial">{{ t.desc }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Budget Tier Selection -->
            <div>
              <div class="text-subtitle-1 font-weight-bold text-forest mb-4 text-center">
                Select Comfort & Budget Tier
              </div>
              <v-row justify="center">
                <v-col
                  v-for="b in budgetOptions"
                  :key="b.value"
                  cols="12"
                  sm="4"
                  md="3"
                >
                  <v-card
                    class="editorial-card pa-5 text-center cursor-pointer h-100 transition-all"
                    :class="{ 'card-selected': aiForm.budget === b.value }"
                    elevation="0"
                    @click="aiForm.budget = b.value"
                  >
                    <v-icon size="26" :color="aiForm.budget === b.value ? '#21866B' : '#173F35'" class="mb-2">
                      {{ b.icon }}
                    </v-icon>
                    <div class="font-weight-bold text-forest text-body-1 mb-1">{{ b.label }}</div>
                    <div class="text-caption text-secondary-editorial">{{ b.desc }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- AI STEP 4: INTERESTS & PREFERENCES -->
          <div v-else-if="currentStep === 4" class="step-content">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 4 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                What interests you most?
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Select the cultural themes and landmark types you wish Touriva AI to prioritize.
              </p>
            </div>

            <v-row>
              <v-col
                v-for="interest in curatedInterests"
                :key="interest.label"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card
                  class="editorial-card pa-4 cursor-pointer d-flex align-center h-100 transition-all"
                  :class="{ 'card-selected': aiForm.preferences.includes(interest.label) }"
                  elevation="0"
                  @click="toggleAiPreference(interest.label)"
                >
                  <v-icon
                    size="22"
                    :color="aiForm.preferences.includes(interest.label) ? '#21866B' : '#69736E'"
                    class="mr-3"
                  >
                    {{ aiForm.preferences.includes(interest.label) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline' }}
                  </v-icon>
                  <div>
                    <div class="font-weight-bold text-forest text-body-2">{{ interest.label }}</div>
                    <div class="text-caption text-secondary-editorial">{{ interest.desc }}</div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Loading overlay or Concierge Generate Button -->
            <div class="text-center mt-10">
              <div v-if="isSubmitting" class="ai-loading-box pa-6 rounded-lg bg-light-sand mx-auto max-w-content">
                <v-progress-circular indeterminate color="#21866B" size="52" width="4" class="mb-4" />
                <h3 class="text-h6 font-serif font-weight-bold text-forest mb-1">
                  Crafting Your Bespoke Itinerary
                </h3>
                <p class="text-body-2 text-secondary-editorial mb-0">
                  {{ activeLoadingMessage }}
                </p>
              </div>

              <div v-else>
                <v-btn
                  color="#173F35"
                  size="x-large"
                  rounded="pill"
                  class="btn-editorial-primary font-weight-bold px-10 elevation-3"
                  :loading="isSubmitting"
                  @click="submitAiTrip"
                >
                  <v-icon start size="22" color="#D9B98C">mdi-creation</v-icon>
                  Generate My Custom Itinerary
                </v-btn>
                <div class="text-caption text-secondary-editorial mt-3">
                  Touriva AI synthesizes verified local landmarks, transit times, and heritage narratives.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- MODE 2: ✎ MANUAL STEP-BY-STEP BUILDER                          -->
        <!-- ============================================================== -->
        <div v-else-if="builderMode === 'manual'">
          <!-- MANUAL STEP 1: TRIP BASICS -->
          <div v-if="currentStep === 1" class="step-content">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 1 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                Trip Essentials & Title
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Name your trip, select the primary destination wilaya, and choose an itinerary theme.
              </p>
            </div>

            <v-row justify="center">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="manualForm.name"
                  label="Trip Name / Title *"
                  placeholder="e.g. 3-Day Heritage & Gastronomy Walk in Tlemcen"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                  class="mb-4"
                  :rules="[v => !!v || 'Trip title is required', v => v.length >= 3 || 'Title must be at least 3 characters']"
                ></v-text-field>

                <v-combobox
                  v-model="manualForm.destination"
                  :items="wilayaList"
                  item-title="name"
                  item-value="name"
                  label="Destination Wilaya / City *"
                  placeholder="Select destination"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                  class="mb-4"
                  prepend-inner-icon="mdi-map-marker"
                  :rules="[v => !!v || 'Destination is required']"
                ></v-combobox>

                <v-select
                  v-model="manualForm.theme"
                  :items="themeOptions"
                  label="Travel Theme"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                  class="mb-4"
                  prepend-inner-icon="mdi-tag-outline"
                ></v-select>

                <v-textarea
                  v-model="manualForm.description"
                  label="Trip Overview / Description"
                  placeholder="A brief overview of what travelers will experience on this trip..."
                  variant="outlined"
                  rows="3"
                  color="#173F35"
                ></v-textarea>
              </v-col>
            </v-row>
          </div>

          <!-- MANUAL STEP 2: DATES, DURATION & PRICING -->
          <div v-else-if="currentStep === 2" class="step-content">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 2 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                Schedule, Duration & Budget
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Set the duration and estimated price per person for this excursion.
              </p>
            </div>

            <v-row justify="center">
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model.number="manualForm.durationDays"
                  type="number"
                  min="1"
                  max="30"
                  label="Duration in Days *"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                  prepend-inner-icon="mdi-calendar-range"
                  @update:model-value="onManualDurationChange"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="manualForm.price"
                  label="Estimated Price (in DZD) *"
                  placeholder="e.g. 24 000 DZD"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                  prepend-inner-icon="mdi-currency-usd"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row justify="center">
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="manualForm.startDate"
                  type="date"
                  :min="todayDateStr"
                  label="Departure Date (Optional)"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="manualForm.endDate"
                  type="date"
                  :min="manualForm.startDate || todayDateStr"
                  label="Return Date (Optional)"
                  variant="outlined"
                  density="comfortable"
                  color="#173F35"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- MANUAL STEP 3: DAILY ITINERARY & STOPS -->
          <div v-else-if="currentStep === 3" class="step-content">
            <div class="text-center mb-6">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 3 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                Daily Itinerary & Planned Stops
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Customize scheduled sightseeing stops, activities, and dining for each day.
              </p>
            </div>

            <!-- Day Tabs Switcher -->
            <div class="d-flex justify-center flex-wrap ga-2 mb-6">
              <v-btn
                v-for="dNum in manualForm.durationDays"
                :key="dNum"
                rounded="pill"
                :color="selectedManualDay === dNum ? '#173F35' : 'white'"
                :class="{ 'text-white font-weight-bold': selectedManualDay === dNum, 'text-forest border-subtle': selectedManualDay !== dNum }"
                variant="flat"
                class="elevation-1"
                @click="selectedManualDay = dNum"
              >
                <v-icon start size="16">mdi-calendar-today</v-icon>
                Day {{ dNum }}
                <v-chip size="x-small" class="ml-2" :color="selectedManualDay === dNum ? '#21866B' : '#E7E8E1'">
                  {{ (getDayStops(dNum)).length }} stops
                </v-chip>
              </v-btn>
            </div>

            <!-- Current Day's Stops Container -->
            <div class="day-stops-box pa-4 pa-md-6 rounded-lg bg-light-sand border-subtle mb-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6 font-weight-bold text-forest">
                  Day {{ selectedManualDay }} Program
                </h3>
                <v-btn
                  color="#21866B"
                  size="small"
                  rounded="pill"
                  variant="flat"
                  class="text-white font-weight-bold"
                  @click="openAddStopDialog(selectedManualDay)"
                >
                  <v-icon start size="16">mdi-plus</v-icon>
                  Add Scheduled Stop
                </v-btn>
              </div>

              <!-- List of Stops for Current Day -->
              <div v-if="getDayStops(selectedManualDay).length === 0" class="text-center py-8">
                <v-icon size="40" color="#69736E" class="mb-2">mdi-map-marker-plus-outline</v-icon>
                <div class="text-body-2 text-secondary-editorial">
                  No stops added for Day {{ selectedManualDay }} yet.
                </div>
                <v-btn
                  color="#173F35"
                  variant="text"
                  class="mt-2 text-capitalize font-weight-bold"
                  @click="openAddStopDialog(selectedManualDay)"
                >
                  + Add First Stop
                </v-btn>
              </div>

              <div v-else>
                <v-card
                  v-for="(stop, sIdx) in getDayStops(selectedManualDay)"
                  :key="sIdx"
                  class="editorial-card pa-4 mb-3 bg-white"
                  elevation="0"
                >
                  <div class="d-flex justify-space-between align-start">
                    <div class="d-flex align-start">
                      <v-avatar color="#173F35" size="32" class="text-white font-weight-bold mr-3 mt-1">
                        {{ sIdx + 1 }}
                      </v-avatar>
                      <div>
                        <div class="d-flex align-center ga-2">
                          <span class="font-weight-bold text-forest text-body-1">{{ stop.title }}</span>
                          <v-chip size="x-small" color="#21866B" variant="tonal" class="font-weight-bold">
                            {{ stop.time || '10:00' }}
                          </v-chip>
                        </div>
                        <p class="text-body-2 text-secondary-editorial mt-1 mb-0">
                          {{ stop.description || 'Sightseeing discovery and local exploration.' }}
                        </p>
                      </div>
                    </div>
                    <v-btn
                      icon="mdi-delete-outline"
                      size="small"
                      variant="text"
                      color="#C24545"
                      @click="removeStop(selectedManualDay, sIdx)"
                    ></v-btn>
                  </div>
                </v-card>
              </div>
            </div>
          </div>

          <!-- MANUAL STEP 4: INCLUSIONS & REVIEW -->
          <div v-else-if="currentStep === 4" class="step-content">
            <div class="text-center mb-8">
              <div class="editorial-tag text-sand mb-1">WHERE AM I? — STEP 4 OF 4</div>
              <h2 class="text-h4 font-serif font-weight-bold text-forest mb-2">
                Inclusions, Cover & Confirmation
              </h2>
              <p class="text-secondary-editorial max-w-prose mx-auto">
                Review your handcrafted trip details and select inclusions before finalizing.
              </p>
            </div>

            <v-row justify="center">
              <v-col cols="12" md="8">
                <!-- Trip Summary Card -->
                <v-card class="editorial-card pa-6 mb-6 bg-light-sand" elevation="0">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <h3 class="text-h6 font-serif font-weight-bold text-forest">
                      {{ manualForm.name || 'Untitled Trip' }}
                    </h3>
                    <v-chip color="#173F35" class="text-white font-weight-bold" size="small">
                      {{ manualForm.durationDays }} Days
                    </v-chip>
                  </div>
                  <div class="text-body-2 text-forest mb-1">
                    <v-icon size="16" color="#21866B" class="mr-1">mdi-map-marker</v-icon>
                    Destination: <strong>{{ manualForm.destination || 'Algeria' }}</strong>
                  </div>
                  <div class="text-body-2 text-forest mb-1">
                    <v-icon size="16" color="#21866B" class="mr-1">mdi-currency-usd</v-icon>
                    Price: <strong>{{ manualForm.price || '18 000 DZD' }}</strong>
                  </div>
                  <div class="text-body-2 text-forest">
                    <v-icon size="16" color="#21866B" class="mr-1">mdi-format-list-numbered</v-icon>
                    Total Scheduled Stops: <strong>{{ totalManualStopsCount }}</strong>
                  </div>
                </v-card>

                <!-- Inclusions Checklist -->
                <div class="mb-6">
                  <div class="text-subtitle-1 font-weight-bold text-forest mb-3">
                    Prestations Incluses (Check all that apply)
                  </div>
                  <v-row dense>
                    <v-col
                      v-for="inc in defaultInclusionOptions"
                      :key="inc"
                      cols="12"
                      sm="6"
                    >
                      <v-checkbox
                        v-model="manualForm.inclusions"
                        :value="inc"
                        :label="inc"
                        color="#21866B"
                        density="compact"
                        hide-details
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </div>

                <!-- Cover Image Choice -->
                <div class="mb-6">
                  <div class="text-subtitle-1 font-weight-bold text-forest mb-3">
                    Cover Photo
                  </div>
                  <v-row dense>
                    <v-col
                      v-for="img in coverImageOptions"
                      :key="img.src"
                      cols="6"
                      sm="3"
                    >
                      <v-card
                        class="pa-1 cursor-pointer transition-all border-subtle"
                        :class="{ 'card-selected': manualForm.image === img.src }"
                        elevation="0"
                        @click="manualForm.image = img.src"
                      >
                        <v-img :src="img.src" height="90" cover rounded />
                        <div class="text-caption text-center font-weight-medium mt-1 text-truncate">
                          {{ img.label }}
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>

                <!-- Save Action Button -->
                <div class="text-center mt-8">
                  <v-btn
                    color="#173F35"
                    size="x-large"
                    rounded="pill"
                    class="btn-editorial-primary font-weight-bold px-10 elevation-3"
                    :loading="isSubmitting"
                    @click="submitManualTrip"
                  >
                    <v-icon start size="22">mdi-content-save-check</v-icon>
                    Save & View My Itinerary
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- NAVIGATION STEP CONTROLS (Back / Continue)                     -->
        <!-- ============================================================== -->
        <v-divider class="my-8 border-subtle"></v-divider>

        <div class="d-flex align-center justify-space-between">
          <v-btn
            v-if="currentStep > 1 && !isSubmitting"
            variant="outlined"
            rounded="pill"
            color="#173F35"
            class="btn-editorial-outline px-6"
            @click="currentStep--"
          >
            <v-icon start size="16">mdi-arrow-left</v-icon>
            {{ $t('previous') || 'Back' }}
          </v-btn>
          <div v-else></div>

          <v-btn
            v-if="currentStep < totalSteps"
            color="#173F35"
            rounded="pill"
            class="btn-editorial-primary px-8 font-weight-bold"
            :disabled="isNextDisabled"
            @click="currentStep++"
          >
            {{ $t('next') || 'Continue' }}
            <v-icon end size="16">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-container>

    <!-- Dialog for Adding a Stop in Manual Flow -->
    <v-dialog v-model="addStopDialog" max-width="500">
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-weight-bold text-forest mb-4">
          Add Stop for Day {{ currentStopDay }}
        </h3>
        <v-text-field
          v-model="newStop.title"
          label="Stop / Landmark Title *"
          placeholder="e.g. Casbah Alleys & Dar Aziza"
          variant="outlined"
          density="comfortable"
          color="#173F35"
          class="mb-3"
        ></v-text-field>

        <v-text-field
          v-model="newStop.time"
          type="time"
          label="Scheduled Time"
          variant="outlined"
          density="comfortable"
          color="#173F35"
          class="mb-3"
        ></v-text-field>

        <v-textarea
          v-model="newStop.description"
          label="Activity Description"
          placeholder="What will travelers see or do during this visit?"
          variant="outlined"
          rows="2"
          color="#173F35"
          class="mb-4"
        ></v-textarea>

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" rounded="pill" @click="addStopDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="#173F35"
            variant="flat"
            rounded="pill"
            class="text-white px-6 font-weight-bold"
            :disabled="!newStop.title.trim()"
            @click="confirmAddStop"
          >
            Add Stop
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTripsStore } from '@/stores/trips'
import { useRestaurantsStore } from '@/stores/restaurants'
import { useHotelsStore } from '@/stores/hotels'
import { useSitesStore } from '@/stores/sites'
import { useAuthStore } from '@/stores/auth'
import { useWilayasStore } from '@/stores/wilaya'
import {
  filterLocalDestinations,
  searchNominatimExternal,
  ALGERIAN_DESTINATIONS
} from '@/utils/geocoding'

const router = useRouter()
const route = useRoute()
const tripStore = useTripsStore()
const restaurants = useRestaurantsStore()
const hotels = useHotelsStore()
const sites = useSitesStore()
const auth = useAuthStore()
const wilayaStore = useWilayasStore()

// State
const builderMode = ref('ai') // 'ai' or 'manual'
const currentStep = ref(1)
const totalSteps = 4
const isSubmitting = ref(false)
const errorMessage = ref('')
const user = ref(null)

// AI Form State
const aiForm = reactive({
  city: '',
  days: 3,
  startDate: '',
  endDate: '',
  partyType: 'SOLO',
  budget: 'medium',
  preferences: ['UNESCO World Heritage', 'Traditional Gastronomy']
})

// Manual Form State
const manualForm = reactive({
  name: '',
  destination: '',
  theme: 'Circuit & Découverte',
  description: '',
  durationDays: 3,
  price: '24 000 DZD',
  startDate: '',
  endDate: '',
  image: '/casbah.jpeg',
  inclusions: [
    'Certified Multilingual Escort Guide',
    'Private Ground Transportation',
    'Monument Entry Passes'
  ],
  items: [
    {
      day: 1,
      items: [
        { title: 'Historic Medina Exploration', time: '09:30', description: 'Guided walking tour through historic city quarters.' },
        { title: 'Regional Gastronomic Lunch', time: '13:00', description: 'Authentic local dining experience.' }
      ]
    },
    {
      day: 2,
      items: [
        { title: 'National Monument & Scenic Viewpoint', time: '10:00', description: 'Panoramic vista and cultural narrative.' }
      ]
    },
    {
      day: 3,
      items: [
        { title: 'Artisanal Souk & Crafts Discovery', time: '10:30', description: 'Meet local craftsmen and explore traditional bazaar.' }
      ]
    }
  ]
})

// Dates & Date Calculations
const todayDateStr = new Date().toISOString().split('T')[0]

const durationPresets = [
  { label: 'Weekend Escapade', days: 2 },
  { label: 'Classic Discovery', days: 3 },
  { label: 'Deep Exploration', days: 5 },
  { label: 'Grand Tour', days: 7 }
]

const applyDurationPreset = (d) => {
  aiForm.days = d
  if (aiForm.startDate) {
    const s = new Date(aiForm.startDate)
    s.setDate(s.getDate() + d)
    aiForm.endDate = s.toISOString().split('T')[0]
  }
}

const onAiDateChange = () => {
  if (aiForm.startDate && aiForm.endDate) {
    const s = new Date(aiForm.startDate)
    const e = new Date(aiForm.endDate)
    if (e > s) {
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24))
      aiForm.days = Math.max(1, diff)
    }
  }
}

// Mode Switching
const switchMode = (mode) => {
  builderMode.value = mode
  currentStep.value = 1
  errorMessage.value = ''
  router.replace({ query: { ...route.query, mode } })
}

// Step Labels
const stepLabels = computed(() => {
  return builderMode.value === 'ai'
    ? ['Destination', 'Dates', 'Party & Budget', 'Interests']
    : ['Trip Basics', 'Schedule & Price', 'Daily Stops', 'Review & Save']
})

const currentStepTitle = computed(() => {
  if (builderMode.value === 'ai') {
    const titles = [
      'Destination & Exploration Region',
      'Travel Dates & Expedition Duration',
      'Party Dynamics & Budget Comfort Tier',
      'Curated Experiences & Interests'
    ]
    return titles[currentStep.value - 1] || ''
  } else {
    const titles = [
      'Trip Basics & Identity',
      'Schedule, Duration & Budget Pricing',
      'Daily Itinerary & Scheduled Stops',
      'Prestations, Cover & Confirmation'
    ]
    return titles[currentStep.value - 1] || ''
  }
})

// Validation per step
const isNextDisabled = computed(() => {
  if (builderMode.value === 'ai') {
    if (currentStep.value === 1) return !aiForm.city.trim()
    if (currentStep.value === 2) return aiForm.days < 1
    if (currentStep.value === 3) return !aiForm.partyType || !aiForm.budget
    return false
  } else {
    if (currentStep.value === 1) return !manualForm.name.trim() || !manualForm.destination
    if (currentStep.value === 2) return !manualForm.durationDays || manualForm.durationDays < 1
    if (currentStep.value === 3) return false
    return false
  }
})

// Options Constants
const partyOptions = [
  { label: 'Solo Traveler', value: 'SOLO', icon: 'mdi-account', desc: 'Independent, flexible exploration' },
  { label: 'Couple / Duo', value: 'COUPLE', icon: 'mdi-account-heart', desc: 'Romantic and scenic encounters' },
  { label: 'Friends Adventure', value: 'FRIENDS', icon: 'mdi-account-group', desc: 'Active excursions & shared memories' },
  { label: 'Family Journey', value: 'FAMILY', icon: 'mdi-account-multiple', desc: 'Comfortable, multigenerational pacing' }
]

const budgetOptions = [
  { label: 'Budget-Friendly', value: 'low', icon: 'mdi-wallet-outline', desc: 'Authentic local stays & economical transit' },
  { label: 'Comfort & Character', value: 'medium', icon: 'mdi-star-outline', desc: 'Boutique hotels & guided comfort' },
  { label: 'Prestige & Bespoke', value: 'high', icon: 'mdi-crown-outline', desc: 'Finest suites, 4x4 private escort & fine dining' }
]

const curatedInterests = [
  { label: 'UNESCO World Heritage', desc: 'Casbah, Timgad, Djémila & Tipasa' },
  { label: 'Traditional Gastronomy', desc: 'Regional culinary tasting and cooking' },
  { label: 'Desert Oases & Dunes', desc: 'Sahara, Taghit, Timimoun & Djanet' },
  { label: 'Guided Hikes & Nature', desc: 'Atlas mountains, coastal parks & canyons' },
  { label: 'Roman & Ottoman Ruins', desc: 'Architectural monuments & ancient history' },
  { label: 'Artisanal Souks & Crafts', desc: 'Traditional carpets, brassware & pottery' }
]

const themeOptions = [
  'Circuit & Découverte',
  'Randonnée & Nature',
  'Culture & Histoire',
  'Gastronomie & Terroir',
  'Aventure & Désert'
]

const defaultInclusionOptions = [
  'Certified Multilingual Escort Guide',
  'Private Ground Transportation with Driver',
  'Monument & Archaeological Passports',
  'Regional Gastronomy Lunch Each Day',
  'Welcome Tea & Traditional Hospitality',
  'Luggage Handling & Transfers'
]

const coverImageOptions = [
  { label: 'Casbah of Algiers', src: '/casbah.jpeg' },
  { label: 'Monument des Martyrs', src: '/monumentMartyrs.jpg' },
  { label: 'Grand Mosque', src: '/grandMosquee.webp' },
  { label: 'Fort Tamentfoust', src: '/fortTamentfoust.webp' }
]

const popularCities = [
  { name: 'Algiers', lat: 36.7538, lng: 3.0588 },
  { name: 'Oran', lat: 35.6971, lng: -0.6308 },
  { name: 'Constantine', lat: 36.3650, lng: 6.6147 },
  { name: 'Tlemcen', lat: 34.8783, lng: -1.3150 },
  { name: 'Djanet', lat: 24.5533, lng: 9.4853 },
  { name: 'Ghardaïa', lat: 32.4833, lng: 3.6667 }
]

const wilayaList = computed(() => {
  return wilayaStore.getWilayas?.map(w => w.name) || popularCities.map(c => c.name)
})

// City Search
const citySearchQuery = ref('')
const isSearchingCity = ref(false)
const citySuggestions = ref(filterLocalDestinations(''))

watch(citySearchQuery, (val) => {
  if (val && val !== aiForm.city) {
    citySuggestions.value = filterLocalDestinations(val)
  } else if (!val) {
    citySuggestions.value = filterLocalDestinations('')
  }
})

const triggerExplicitExternalSearch = async () => {
  const query = (citySearchQuery.value || aiForm.city || '').trim()
  if (!query || query.length < 2) return

  isSearchingCity.value = true
  try {
    const results = await searchNominatimExternal(query)
    if (results && results.length > 0) {
      const merged = [...citySuggestions.value]
      for (const ext of results) {
        if (!merged.some(c => Math.abs(c.lat - ext.lat) < 0.05 && Math.abs(c.lng - ext.lng) < 0.05)) {
          merged.unshift(ext)
        }
      }
      citySuggestions.value = merged
    }
  } catch (err) {
    console.warn('External geocoding search failed:', err)
  } finally {
    isSearchingCity.value = false
  }
}

const onAiDestinationSelected = (val) => {
  if (!val) {
    aiForm.city = ''
    return
  }
  if (typeof val === 'object' && val.name) {
    aiForm.city = val.name
  } else if (typeof val === 'string') {
    aiForm.city = val
  }
}

const selectAiCity = (c) => {
  aiForm.city = c.name
  restaurants.fetchRestaurants(c.lat, c.lng)
  hotels.fetchHotels(c.lat, c.lng)
  sites.fetchSites(c.lat, c.lng)
}

const toggleAiPreference = (label) => {
  const idx = aiForm.preferences.indexOf(label)
  if (idx > -1) {
    aiForm.preferences.splice(idx, 1)
  } else {
    aiForm.preferences.push(label)
  }
}

// AI Animated Loading Messages
const loadingMessages = [
  'Consulting Algerian heritage landmarks and monuments...',
  'Optimizing scenic route pacing and transit corridors...',
  'Curating authentic dining and cultural encounters...',
  'Synthesizing verified Touriva concierge recommendations...'
]
const activeLoadingMessage = ref(loadingMessages[0])
let loadingInterval = null

// Manual Mode Day Management
const selectedManualDay = ref(1)
const addStopDialog = ref(false)
const currentStopDay = ref(1)
const newStop = reactive({
  title: '',
  time: '10:00',
  description: ''
})

const onManualDurationChange = (val) => {
  const d = Math.max(1, parseInt(val, 10) || 1)
  manualForm.durationDays = d
  // Ensure manualForm.items has matching number of days
  while (manualForm.items.length < d) {
    const nextDay = manualForm.items.length + 1
    manualForm.items.push({
      day: nextDay,
      items: [
        { title: `Day ${nextDay} Morning Discovery`, time: '09:30', description: 'Scenic and cultural visit.' }
      ]
    })
  }
  if (manualForm.items.length > d) {
    manualForm.items = manualForm.items.slice(0, d)
  }
  if (selectedManualDay.value > d) {
    selectedManualDay.value = d
  }
}

const getDayStops = (dNum) => {
  const dayObj = manualForm.items.find(d => d.day === dNum)
  return dayObj ? dayObj.items : []
}

const openAddStopDialog = (dNum) => {
  currentStopDay.value = dNum
  newStop.title = ''
  newStop.time = '10:00'
  newStop.description = ''
  addStopDialog.value = true
}

const confirmAddStop = () => {
  if (!newStop.title.trim()) return
  let dayObj = manualForm.items.find(d => d.day === currentStopDay.value)
  if (!dayObj) {
    dayObj = { day: currentStopDay.value, items: [] }
    manualForm.items.push(dayObj)
  }
  dayObj.items.push({
    title: newStop.title.trim(),
    time: newStop.time || '10:00',
    description: newStop.description.trim() || 'Sightseeing discovery.'
  })
  addStopDialog.value = false
}

const removeStop = (dNum, sIdx) => {
  const dayObj = manualForm.items.find(d => d.day === dNum)
  if (dayObj && dayObj.items) {
    dayObj.items.splice(sIdx, 1)
  }
}

const totalManualStopsCount = computed(() => {
  return manualForm.items.reduce((acc, d) => acc + (d.items?.length || 0), 0)
})

// Submissions
const submitAiTrip = async () => {
  if (!aiForm.city.trim()) {
    errorMessage.value = 'Please choose a destination city before continuing.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  let msgIdx = 0
  loadingInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loadingMessages.length
    activeLoadingMessage.value = loadingMessages[msgIdx]
  }, 3500)

  try {
    const payload = {
      creator: user.value?._id,
      city: aiForm.city,
      days: aiForm.days || 3,
      startDate: aiForm.startDate,
      endDate: aiForm.endDate,
      budget: aiForm.budget,
      partyType: aiForm.partyType,
      preferences: aiForm.preferences,
      destination: aiForm.city,
      hotels: (hotels.normalizeHotelsForIA || []).slice(0, 5),
      restaurants: (restaurants.normalizeRestaurantsForIA || []).slice(0, 5),
      sites: (sites.normalizeSitesForIA || []).slice(0, 5)
    }

    const created = await tripStore.generateTripWithAI(payload)
    if (created?._id) {
      router.push({ name: 'TripDetail', params: { id: created._id } })
    } else {
      router.push('/trips')
    }
  } catch (err) {
    console.error('AI trip generation error:', err)
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to generate itinerary. Please try again.'
  } finally {
    if (loadingInterval) clearInterval(loadingInterval)
    isSubmitting.value = false
  }
}

const submitManualTrip = async () => {
  if (!manualForm.name.trim()) {
    errorMessage.value = 'Please provide a trip title.'
    return
  }
  if (!manualForm.destination) {
    errorMessage.value = 'Please select a destination wilaya.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      creator: user.value?._id,
      name: manualForm.name.trim(),
      description: manualForm.description.trim() || `Curated itinerary across ${manualForm.destination}.`,
      destination: manualForm.destination,
      durationDays: manualForm.durationDays,
      days: Array.from({ length: manualForm.durationDays }, (_, i) => i + 1),
      price: manualForm.price,
      theme: manualForm.theme,
      image: manualForm.image,
      inclusions: manualForm.inclusions,
      items: manualForm.items
    }

    const created = await tripStore.createTrip(payload)
    if (created?._id) {
      router.push({ name: 'TripDetail', params: { id: created._id } })
    } else {
      router.push('/trips')
    }
  } catch (err) {
    console.error('Manual trip creation error:', err)
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to save trip. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (route.query.mode === 'manual') {
    builderMode.value = 'manual'
  }
  const ls = await auth.getLSUserInfo()
  user.value = ls?.user
  wilayaStore.fetchWilayas()
})
</script>

<style scoped>
.editorial-trip-builder {
  min-height: 100vh;
}

.max-w-container {
  max-width: 960px;
}

.max-w-content {
  max-width: 720px;
}

.max-w-prose {
  max-width: 580px;
}

.catalog-hero {
  background: #FFFFFF;
}

.bg-light-sand {
  background-color: #FAF8F2 !important;
}

.border-subtle {
  border: 1px solid #E7E8E1 !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Mode Switcher */
.mode-switcher-container {
  border: 1px solid #E7E8E1;
}

.mode-switch-btn {
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 0.95rem;
}

/* Stepper Indicator */
.stepper-indicator-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-node {
  display: flex;
  align-items: center;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 2px solid #E7E8E1;
  color: #69736E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.25s ease;
}

.step-active .step-circle {
  background: #173F35;
  border-color: #173F35;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(23, 63, 53, 0.25);
}

.step-completed .step-circle {
  background: #21866B;
  border-color: #21866B;
  color: #FFFFFF;
}

.step-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #69736E;
  letter-spacing: 0.02em;
}

.step-active .step-label {
  color: #173F35;
  font-weight: 700;
}

.step-connector {
  width: 32px;
  height: 2px;
  background-color: #E7E8E1;
}

.step-completed .step-connector {
  background-color: #21866B;
}

/* Card Selection Highlights */
.card-selected {
  border-color: #173F35 !important;
  background-color: #FAF8F2 !important;
  box-shadow: 0 6px 20px -4px rgba(23, 63, 53, 0.15) !important;
}

.btn-preset-active {
  background-color: #173F35 !important;
  color: #FFFFFF !important;
}

.category-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.transition-all {
  transition: all 0.25s ease;
}
</style>
