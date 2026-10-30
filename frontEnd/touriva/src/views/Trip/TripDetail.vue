<template>
  <div class="editorial-trip-detail bg-warm-ivory min-vh-100 pb-16">
    <!-- HERO SECTION -->
    <div class="position-relative trip-hero">
      <v-img
        :src="heroImage"
        height="55vh"
        min-height="420px"
        cover
        class="trip-hero-img"
      >
        <template #placeholder>
          <div class="d-flex fill-height align-center justify-center bg-deep-green">
            <v-progress-circular indeterminate color="#D9B98C" size="48" />
          </div>
        </template>
      </v-img>

      <div class="trip-hero-scrim"></div>

      <!-- Top Back Navigation -->
      <div class="position-absolute top-0 left-0 right-0 pa-4 pa-md-6 z-10">
        <v-container class="max-w-container pa-0">
          <v-btn
            variant="flat"
            color="rgba(16, 45, 39, 0.75)"
            rounded="pill"
            class="text-white text-capitalize backdrop-blur font-weight-medium"
            @click="router.push('/trips')"
          >
            <v-icon start size="18">mdi-arrow-left</v-icon>
            {{ $t('Return') || 'Back to Excursions' }}
          </v-btn>
        </v-container>
      </div>

      <!-- Hero Header Info -->
      <div class="position-absolute bottom-0 left-0 right-0 pa-6 pa-md-10 text-white z-10">
        <v-container class="max-w-container pa-0">
          <div class="d-flex align-center ga-2 mb-3">
            <span class="trip-tag-pill">
              <v-icon size="14" color="#D9B98C" class="mr-1">mdi-clock-outline</v-icon>
              {{ tripDays.length }} Days Itinerary
            </span>
            <span class="trip-tag-pill bg-emerald text-white">
              <v-icon size="14" color="white" class="mr-1">mdi-compass</v-icon>
              Guided Expedition
            </span>
          </div>

          <h1 class="text-h3 font-serif font-weight-bold text-white mb-2">
            {{ tripTitle }}
          </h1>

          <div class="d-flex align-center flex-wrap ga-4 text-sand-light text-body-2">
            <div class="d-flex align-center">
              <v-icon size="16" color="#D9B98C" class="mr-1">mdi-map-marker</v-icon>
              {{ destinationText }}
            </div>
            <div class="d-flex align-center">
              <v-icon size="16" color="#D9B98C" class="mr-1">mdi-account-tie</v-icon>
              Led by {{ guideName }}
            </div>
          </div>
        </v-container>
      </div>
    </div>

    <!-- MAIN BODY CONTENT -->
    <v-container class="max-w-container mt-8">
      <v-row>
        <!-- LEFT COLUMN: ITINERARY TIMELINE & INCLUSIONS -->
        <v-col cols="12" md="8">
          <!-- Overview Card -->
          <v-card class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <h2 class="text-h5 font-serif font-weight-bold text-forest mb-4">
              Journey Overview
            </h2>
            <p class="text-body-1 text-secondary-editorial line-height-relaxed mb-6">
              {{ tripDescription }}
            </p>

            <v-divider class="my-6 border-subtle"></v-divider>

            <!-- Dynamic Inclusions -->
            <div v-if="tripInclusions.length" class="mb-4">
              <h3 class="text-h6 font-weight-bold text-forest mb-3">Prestations Incluses</h3>
              <v-row dense>
                <v-col
                  v-for="(inc, iIdx) in tripInclusions"
                  :key="iIdx"
                  cols="12"
                  sm="6"
                  class="d-flex align-center mb-2"
                >
                  <v-icon color="#21866B" class="mr-2" size="20">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2 text-forest font-weight-medium">{{ inc }}</span>
                </v-col>
              </v-row>
            </div>

            <!-- Dynamic Exclusions -->
            <div v-if="tripExclusions.length" class="mb-4">
              <h3 class="text-h6 font-weight-bold text-forest mb-3">Non Inclus</h3>
              <v-row dense>
                <v-col
                  v-for="(exc, eIdx) in tripExclusions"
                  :key="eIdx"
                  cols="12"
                  sm="6"
                  class="d-flex align-center mb-2"
                >
                  <v-icon color="#C24545" class="mr-2" size="20">mdi-close-circle-outline</v-icon>
                  <span class="text-body-2 text-secondary-editorial">{{ exc }}</span>
                </v-col>
              </v-row>
            </div>

            <!-- Fallback Inclusions if not explicitly set -->
            <div v-if="!tripInclusions.length && !tripExclusions.length">
              <h3 class="text-h6 font-weight-bold text-forest mb-4">Included in This Expedition</h3>
              <v-row dense>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#21866B" class="mr-3" size="22">mdi-account-check</v-icon>
                  <div>
                    <div class="text-caption font-weight-bold text-forest">CERTIFIED LOCAL GUIDE</div>
                    <div class="text-caption text-secondary-editorial">Full-time licensed cultural escort</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#21866B" class="mr-3" size="22">mdi-bus</v-icon>
                  <div>
                    <div class="text-caption font-weight-bold text-forest">GROUND TRANSPORTATION</div>
                    <div class="text-caption text-secondary-editorial">4x4 desert or comfortable private coach</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#21866B" class="mr-3" size="22">mdi-food-fork-drink</v-icon>
                  <div>
                    <div class="text-caption font-weight-bold text-forest">AUTHENTIC MEALS</div>
                    <div class="text-caption text-secondary-editorial">Traditional regional breakfast & dinner</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" class="d-flex align-center mb-3">
                  <v-icon color="#21866B" class="mr-3" size="22">mdi-ticket-percent</v-icon>
                  <div>
                    <div class="text-caption font-weight-bold text-forest">LANDMARK ACCESS</div>
                    <div class="text-caption text-secondary-editorial">All national park and museum entries included</div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card>

          <!-- SCHEDULED DEPARTURES SECTION -->
          <v-card class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <div class="editorial-tag text-emerald mb-1">DÉPARTS PROGRAMMÉS</div>
                <h2 class="text-h5 font-serif font-weight-bold text-forest mb-0">
                  Sessions & Dates de Départ
                </h2>
              </div>
              <v-chip size="small" color="#173F35" variant="tonal" class="font-weight-bold">
                {{ departures.length }} Départs
              </v-chip>
            </div>

            <div v-if="loadingDepartures" class="py-8 text-center">
              <v-progress-circular indeterminate color="#21866B" size="32" />
            </div>

            <div v-else-if="!departures.length" class="pa-5 rounded-lg bg-warm-ivory border-subtle text-center">
              <v-icon size="32" color="#B89564" class="mb-2">mdi-calendar-question</v-icon>
              <div class="font-weight-bold text-forest text-body-2 mb-1">Départs sur demande & personnalisés</div>
              <div class="text-caption text-secondary-editorial max-w-md mx-auto">
                Cette excursion est organisée à la demande pour des groupes constitués. Réservez ou contactez directement l'organisateur pour définir vos dates.
              </div>
            </div>

            <div v-else class="departures-grid">
              <div
                v-for="dep in departures"
                :key="dep._id"
                class="pa-4 mb-3 rounded-lg bg-warm-ivory border-subtle d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center ga-3"
              >
                <div>
                  <div class="d-flex align-center ga-2 mb-1">
                    <span class="font-weight-bold text-forest text-body-1">
                      <v-icon size="16" color="#21866B" class="mr-1">mdi-calendar-check</v-icon>
                      {{ formatDateRange(dep.startDate, dep.endDate) }}
                    </span>
                    <v-chip
                      size="x-small"
                      :color="dep.status === 'guaranteed' ? '#173F35' : '#21866B'"
                      class="text-white font-weight-bold"
                    >
                      {{ dep.status === 'guaranteed' ? 'Départ Garanti' : 'Confirmé' }}
                    </v-chip>
                  </div>

                  <div class="d-flex align-center text-caption text-secondary-editorial ga-3">
                    <span :class="dep.availableSeats > 0 ? 'text-emerald font-weight-bold' : 'text-error font-weight-bold'">
                      {{ dep.availableSeats }} places disponibles (sur {{ dep.capacity }})
                    </span>
                    <span v-if="dep.meetingPoint">• Rdv : {{ dep.meetingPoint }}</span>
                  </div>
                </div>

                <div class="d-flex align-center ga-3 w-100 w-sm-auto justify-space-between justify-sm-end">
                  <div class="text-sm-right">
                    <div class="text-body-1 font-weight-bold text-forest">
                      {{ formatPrice(dep.priceDZD || tripPrice) }}
                    </div>
                  </div>

                  <v-btn
                    color="#173F35"
                    size="small"
                    rounded="pill"
                    class="btn-editorial-primary font-weight-bold"
                    :disabled="dep.availableSeats <= 0"
                    @click="selectDepartureAndBook(dep)"
                  >
                    {{ dep.availableSeats > 0 ? 'Choisir cette date' : 'Complet' }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>

          <!-- CANCELLATION POLICY -->
          <v-card v-if="tripCancellationPolicy" class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <h2 class="text-h6 font-serif font-weight-bold text-forest mb-2">
              Conditions d'Annulation & Remboursement
            </h2>
            <p class="text-body-2 text-secondary-editorial mb-0">
              {{ tripCancellationPolicy }}
            </p>
          </v-card>

          <!-- DAY-BY-DAY ITINERARY TIMELINE -->
          <v-card class="editorial-card pa-6 pa-md-8 mb-6" elevation="0">
            <h2 class="text-h5 font-serif font-weight-bold text-forest mb-6">
              Day-by-Day Program
            </h2>

            <div v-if="tripDays.length > 0">
              <div
                v-for="(day, dIdx) in tripDays"
                :key="dIdx"
                class="itinerary-day-block mb-6 pa-5 rounded-lg border-subtle bg-warm-ivory"
              >
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center">
                    <v-avatar color="#173F35" size="36" class="mr-3 text-white font-weight-bold">
                      {{ day.day || (dIdx + 1) }}
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold text-forest">
                        Day {{ day.day || (dIdx + 1) }}: {{ day.title || 'Exploration & Cultural Immersion' }}
                      </div>
                      <div class="text-caption text-secondary-editorial" v-if="day.date">
                        {{ day.date }}
                      </div>
                    </div>
                  </div>
                  <v-chip size="x-small" color="#21866B" variant="tonal" class="font-weight-bold">
                    {{ day.items?.length || 2 }} Scheduled Stops
                  </v-chip>
                </div>

                <!-- Stops List -->
                <div v-if="day.items && day.items.length > 0" class="pl-4 border-s-timeline">
                  <div v-for="(stop, sIdx) in day.items" :key="sIdx" class="timeline-stop py-2">
                    <div class="d-flex align-center font-weight-medium text-body-2 text-forest">
                      <v-icon size="14" color="#21866B" class="mr-2">mdi-circle-medium</v-icon>
                      <span class="mr-2">{{ stop.title || stop.name || 'Sightseeing Discovery' }}</span>
                      <span v-if="stop.time" class="text-caption text-sand-dark font-weight-bold">({{ stop.time }})</span>
                    </div>
                    <p v-if="stop.description" class="text-caption text-secondary-editorial ml-5 mb-0">
                      {{ stop.description }}
                    </p>
                  </div>
                </div>
                <div v-else class="text-caption text-secondary-editorial pl-2">
                  Full day excursion program, scenic viewpoints, guided cultural narratives, and local encounters.
                </div>
              </div>
            </div>

            <!-- Fallback day items if empty -->
            <div v-else class="text-body-2 text-secondary-editorial">
              This journey features an intensive 3-day itinerary with daily desert hikes, historical walks, and authentic hospitality stops.
            </div>
          </v-card>
        </v-col>

        <!-- RIGHT COLUMN: STICKY RESERVATION CARD -->
        <v-col cols="12" md="4">
          <v-card class="editorial-card pa-6 sticky-card" elevation="0">
            <div class="text-caption text-secondary-editorial mb-1">RESERVATION & PRICING</div>
            <div class="text-h4 font-weight-bold text-forest mb-1">
              {{ formatPrice(tripPrice) }}
            </div>
            <div class="text-caption text-sand-dark font-weight-bold mb-4">
              Per Traveler • All Taxes Included
            </div>

            <div v-if="trip?.requiresDeposit" class="pa-2 px-3 bg-warm-ivory rounded border-subtle mb-3 text-caption text-forest">
              <v-icon size="16" color="#21866B" start>mdi-shield-check</v-icon>
              <strong>Acompte requis :</strong>
              <span v-if="trip.depositType === 'percentage'"> {{ trip.depositPercentage }}% à la réservation</span>
              <span v-else> {{ formatPrice(trip.depositAmountDZD) }}</span>
            </div>

            <v-divider class="my-4 border-subtle"></v-divider>

            <!-- Guide / Agency Details -->
            <div class="d-flex align-center mb-4">
              <v-avatar size="48" color="#F5EDE0" class="mr-3 border-sand">
                <v-icon size="26" color="#173F35">
                  {{ isAgencyTrip ? 'mdi-domain' : 'mdi-account' }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold text-forest">
                  {{ organizerName }}
                </div>
                <div v-if="isVerifiedAgency" class="text-caption text-emerald font-weight-bold d-flex align-center">
                  <v-icon size="14" color="#21866B" class="mr-1">mdi-check-decagram</v-icon>
                  Agence Agréée Ministère du Tourisme
                </div>
                <div v-else class="text-caption text-emerald font-weight-medium d-flex align-center">
                  <v-icon size="14" color="#21866B" class="mr-1">mdi-check-circle</v-icon>
                  Guide Touristique Agréé
                </div>
              </div>
            </div>

            <!-- WhatsApp Direct Contact for Agencies -->
            <v-btn
              v-if="agencyWhatsAppUrl"
              :href="agencyWhatsAppUrl"
              target="_blank"
              block
              variant="outlined"
              color="#21866B"
              rounded="pill"
              class="mb-3 font-weight-medium"
            >
              <v-icon start color="#21866B">mdi-whatsapp</v-icon>
              Contacter l'Agence
            </v-btn>

            <!-- Action Button -->
            <v-btn
              block
              color="#173F35"
              size="large"
              rounded="pill"
              class="btn-editorial-primary font-weight-bold mb-3"
              @click="openReservationDialog"
            >
              <v-icon start size="20">mdi-ticket-confirmation-outline</v-icon>
              {{ $t('Subscribe') || 'Réserver cette excursion' }}
            </v-btn>

            <!-- Custom Trip Quotation Enquiry -->
            <v-btn
              block
              variant="text"
              color="#21866B"
              rounded="pill"
              class="font-weight-bold mb-2"
              @click="openEnquiryDialog"
            >
              <v-icon start size="18">mdi-file-document-edit-outline</v-icon>
              Demander un Devis Sur-Mesure
            </v-btn>

            <!-- Booking & Payment Tracker -->
            <v-btn
              block
              variant="outlined"
              color="#173F35"
              rounded="pill"
              class="font-weight-medium mb-3"
              @click="openLookupFinancialTracker"
            >
              <v-icon start size="18">mdi-receipt-text-check-outline</v-icon>
              Suivi Réservation & Paiements
            </v-btn>

            <div class="text-center text-caption text-secondary-editorial mt-3">
              <v-icon size="16" color="#21866B" class="mr-1">mdi-lock-outline</v-icon>
              Instant verified reservation confirmation
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- RESERVATION DIALOG MODAL -->
    <v-dialog v-model="reservationDialog" max-width="520" persistent>
      <v-card class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="editorial-tag text-sand mb-1">CONFIRM RESERVATION</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              {{ tripTitle }}
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="reservationDialog = false"></v-btn>
        </div>

        <p class="text-caption text-secondary-editorial mb-4">
          Please provide your contact information to reserve your seats on this excursion. The organizer will reach out to confirm your itinerary schedule.
        </p>

        <v-alert v-if="reservationError" type="error" variant="tonal" class="mb-4" density="compact">
          {{ reservationError }}
        </v-alert>

        <v-form @submit.prevent="submitReservation">
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">FULL NAME *</div>
            <v-text-field
              v-model="bookingForm.fullName"
              placeholder="e.g. Amina Benali"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              required
              color="#173F35"
              hide-details
            />
          </div>

          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">PHONE NUMBER *</div>
            <v-text-field
              v-model="bookingForm.phone"
              placeholder="e.g. 0550 12 34 56"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              type="tel"
              required
              color="#173F35"
              hide-details
            />
          </div>

          <!-- Select Departure Session if available -->
          <div v-if="departures.length" class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">DATE DE DÉPART SOUHAITÉE</div>
            <v-select
              v-model="bookingForm.departureId"
              :items="departureSelectItems"
              item-title="label"
              item-value="id"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              placeholder="Sélectionnez une session de départ"
              hide-details
            />
          </div>

          <div class="mb-4">
            <div class="text-caption font-weight-bold text-forest mb-1">NUMBER OF TRAVELERS</div>
            <v-select
              v-model="bookingForm.seats"
              :items="[1, 2, 3, 4, 5, 6, 8, 10]"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="#173F35"
              hide-details
            />
          </div>

          <div class="d-flex ga-3 mt-6">
            <v-btn
              variant="outlined"
              rounded="pill"
              class="flex-grow-1"
              @click="reservationDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              type="submit"
              color="#173F35"
              class="btn-editorial-primary flex-grow-1 font-weight-bold"
              rounded="pill"
              :loading="submitting"
            >
              Confirm Booking
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- BOOKING CONFIRMED VOUCHER MODAL -->
    <v-dialog v-model="confirmedBookingDialog" max-width="500">
      <v-card v-if="confirmedBooking" class="editorial-card pa-6 text-center">
        <v-icon size="56" color="#21866B" class="mb-3">mdi-check-decagram</v-icon>
        <div class="editorial-tag text-emerald mb-1">RÉSERVATION ENREGISTRÉE</div>
        <h3 class="text-h5 font-serif font-weight-bold text-forest mb-2">
          Place(s) Réservée(s) avec Succès !
        </h3>
        <p class="text-caption text-secondary-editorial mb-4">
          Votre demande a été transmise à l'agence organisatrice. Conservez votre référence de réservation :
        </p>

        <div class="pa-4 bg-sand-light rounded-lg mb-4 border-subtle">
          <div class="text-caption text-secondary-editorial">RÉFÉRENCE OFFICIELLE</div>
          <div class="text-h6 font-monospace font-weight-bold text-forest">
            {{ confirmedBooking.bookingReference }}
          </div>
          <div class="text-caption text-emerald font-weight-bold mt-1">
            {{ confirmedBooking.seats }} place(s) • {{ formatPrice(confirmedBooking.totalPriceDZD) }}
          </div>
          <div v-if="confirmedBooking.requiresDeposit" class="text-caption text-amber font-weight-bold mt-1">
            <v-icon size="14" start color="#D9943B">mdi-information-outline</v-icon>
            Acompte demandé : {{ formatPrice(confirmedBooking.depositAmountDZD) }}
          </div>
        </div>

        <p class="text-caption text-secondary-editorial mb-4">
          Votre place est enregistrée. L'agence vous contactera au <strong>{{ confirmedBooking.customerInfo?.phone }}</strong>. Vous pouvez transmettre dès à présent votre reçu de versement (BaridiMob / CCP).
        </p>

        <div class="d-flex flex-column ga-2">
          <v-btn
            color="#21866B"
            block
            rounded="pill"
            class="text-white font-weight-bold"
            @click="openProofSubmission(confirmedBooking)"
          >
            <v-icon start>mdi-upload</v-icon>
            Transmettre un Justificatif de Paiement
          </v-btn>
          <v-btn
            variant="outlined"
            color="#173F35"
            block
            rounded="pill"
            class="font-weight-bold"
            @click="openBookingFinancialTracker(confirmedBooking)"
          >
            <v-icon start>mdi-receipt-text-outline</v-icon>
            Suivi des Paiements & Justificatifs
          </v-btn>
          <v-btn
            variant="text"
            block
            rounded="pill"
            class="text-forest font-weight-bold"
            @click="confirmedBookingDialog = false"
          >
            Fermer
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- PAYMENT PROOF SUBMISSION DIALOG -->
    <v-dialog v-model="proofSubmitDialog" max-width="500">
      <v-card class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <div>
            <div class="editorial-tag text-emerald mb-1">RÈGLEMENT DE LA RÉSERVATION</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              Transmettre mon justificatif
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="proofSubmitDialog = false" />
        </div>

        <p class="text-caption text-secondary-editorial mb-3">
          Transmettez une capture d'écran ou un reçu de votre virement <strong>BaridiMob</strong> ou <strong>CCP</strong> pour faire créditer votre réservation auprès de l'agence.
        </p>

        <v-alert v-if="proofSubmitSuccess" type="success" variant="tonal" class="mb-3" density="comfortable">
          Votre justificatif a été transmis avec succès. L'agence vérifiera et validera votre paiement.
        </v-alert>

        <v-alert v-if="proofSubmitError" type="error" variant="tonal" class="mb-3" density="comfortable">
          {{ proofSubmitError }}
        </v-alert>

        <div v-if="!proofSubmitSuccess">
          <div class="pa-3 bg-warm-ivory rounded mb-3 text-caption text-forest">
            <div><strong>Réf. Réservation :</strong> {{ activeBookingForProof?.bookingReference }}</div>
            <div><strong>Montant Total :</strong> {{ formatPrice(activeBookingForProof?.totalPriceDZD) }}</div>
            <div v-if="activeBookingForProof?.depositAmountDZD">
              <strong>Acompte demandé :</strong> {{ formatPrice(activeBookingForProof.depositAmountDZD) }}
            </div>
          </div>

          <v-text-field
            v-model.number="proofForm.amountDZD"
            label="Montant versé (DZD)"
            type="number"
            variant="outlined"
            density="comfortable"
            class="mb-2"
          />

          <v-select
            v-model="proofForm.method"
            :items="[
              { title: 'BaridiMob', value: 'baridimob' },
              { title: 'Virement CCP', value: 'ccp' },
              { title: 'Virement Bancaire', value: 'bank_transfer' },
              { title: 'Autre', value: 'other' }
            ]"
            label="Mode de paiement"
            variant="outlined"
            density="comfortable"
            class="mb-2"
          />

          <v-text-field
            v-model="proofForm.transactionReference"
            label="Numéro de transaction / bordereau (optionnel)"
            variant="outlined"
            density="comfortable"
            class="mb-2"
          />

          <div class="mb-3">
            <div class="text-caption font-weight-bold text-forest mb-1">REÇU OU CAPTURE D'ÉCRAN (JPG, PNG, PDF &lt; 5Mo)</div>
            <v-file-input
              v-model="proofForm.file"
              label="Sélectionner le justificatif"
              variant="outlined"
              density="comfortable"
              prepend-icon="mdi-paperclip"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              @change="handleProofFileChange"
              class="mb-1"
            />
          </div>

          <v-btn
            color="#173F35"
            block
            rounded="pill"
            class="text-white font-weight-bold"
            :loading="proofSubmitting"
            :disabled="!proofForm.amountDZD || !proofForm.base64Data"
            @click="submitProof"
          >
            Envoyer le Justificatif
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- CUSTOM ENQUIRY DIALOG -->
    <v-dialog v-model="enquiryDialog" max-width="540">
      <v-card class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-3">
          <div>
            <div class="editorial-tag text-sand mb-1">DEVIS SUR-MESURE</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              Demande d'Excursion Personnalisée
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="enquiryDialog = false" />
        </div>

        <p class="text-caption text-secondary-editorial mb-4">
          Vous souhaitez privatiser ce circuit ou organiser un voyage sur-mesure pour un groupe ou en famille ? Remplissez ce formulaire et l'agence vous transmettra une cotation détaillée.
        </p>

        <v-alert v-if="enquiryError" type="error" variant="tonal" class="mb-3" density="compact">
          {{ enquiryError }}
        </v-alert>

        <v-form @submit.prevent="submitEnquiry">
          <v-row class="mb-1">
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">VOTRE NOM COMPLET *</div>
              <v-text-field
                v-model="enquiryForm.fullName"
                placeholder="Amina Benali"
                variant="outlined"
                density="compact"
                rounded="lg"
                color="#102D27"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">N° DE TÉLÉPHONE *</div>
              <v-text-field
                v-model="enquiryForm.phone"
                placeholder="0550 12 34 56"
                variant="outlined"
                density="compact"
                rounded="lg"
                color="#102D27"
                required
              />
            </v-col>
          </v-row>

          <v-row class="mb-1">
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">DATE DE DÉPART SOUHAITÉE *</div>
              <v-text-field
                v-model="enquiryForm.startDate"
                type="date"
                variant="outlined"
                density="compact"
                rounded="lg"
                color="#102D27"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">DATE DE RETOUR SOUHAITÉE *</div>
              <v-text-field
                v-model="enquiryForm.endDate"
                type="date"
                variant="outlined"
                density="compact"
                rounded="lg"
                color="#102D27"
                required
              />
            </v-col>
          </v-row>

          <v-row class="mb-1">
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">NOMBRE DE VOYAGEURS *</div>
              <v-select
                v-model="enquiryForm.groupSize"
                :items="[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30]"
                variant="outlined"
                density="compact"
                rounded="lg"
                color="#102D27"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption font-weight-bold text-forest mb-1">BUDGET TOTAL ESTIMÉ (DZD)</div>
              <v-text-field
                v-model="enquiryForm.budgetDZD"
                type="number"
                placeholder="Ex: 150000"
                variant="outlined"
                density="compact"
                rounded="lg"
                color="#102D27"
              />
            </v-col>
          </v-row>

          <div class="mb-4">
            <div class="text-caption font-weight-bold text-forest mb-1">PRÉCISIONS & SOUHAITS PARTICULIERS</div>
            <v-textarea
              v-model="enquiryForm.specialRequests"
              rows="3"
              placeholder="Hébergement préféré, régime alimentaire, enfants en bas âge..."
              variant="outlined"
              density="compact"
              rounded="lg"
              color="#102D27"
            />
          </div>

          <v-btn
            type="submit"
            color="#102D27"
            block
            rounded="pill"
            class="text-white font-weight-bold"
            :loading="submittingEnquiry"
          >
            Envoyer ma Demande de Devis
          </v-btn>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- CUSTOMER BOOKING & FINANCIAL TRACKER MODAL -->
    <v-dialog v-model="customerTrackerDialog" max-width="680" scrollable>
      <v-card class="editorial-card pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="editorial-tag text-emerald mb-1">SUIVI FINANCIER DU VOYAGEUR</div>
            <h3 class="text-h6 font-serif font-weight-bold text-forest">
              Suivi de Réservation & Règlements
            </h3>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="customerTrackerDialog = false" />
        </div>

        <!-- Lookup form if no booking currently active -->
        <div v-if="!currentTrackerBooking" class="mb-4">
          <p class="text-caption text-secondary-editorial mb-3">
            Saisissez votre référence de réservation officielle et votre numéro de téléphone pour consulter l'état de vos règlements.
          </p>
          <v-row dense class="mb-3">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="trackerLookupRef"
                label="Référence (ex: TRV-BKG-XXXX)"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="trackerLookupPhone"
                label="Téléphone de contact"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
          <v-btn
            color="#173F35"
            block
            rounded="pill"
            class="text-white font-weight-bold"
            :loading="trackerLoading"
            @click="lookupBookingTracker"
          >
            Consulter ma Réservation
          </v-btn>
          <v-alert v-if="trackerError" type="error" variant="tonal" class="mt-3" density="comfortable">
            {{ trackerError }}
          </v-alert>
        </div>

        <!-- Active Tracker View -->
        <div v-else>
          <!-- Top Info Card -->
          <div class="pa-4 bg-sand-light rounded-lg mb-4 border-subtle">
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-h6 font-monospace font-weight-bold text-forest">
                {{ currentTrackerBooking.bookingReference }}
              </div>
              <v-chip
                size="small"
                :color="getCustomerFinancialStatusColor(currentTrackerBooking.financialStatus)"
                class="text-white font-weight-bold"
              >
                {{ getCustomerFinancialStatusLabel(currentTrackerBooking.financialStatus) }}
              </v-chip>
            </div>
            <div class="text-body-2 font-weight-medium text-forest mb-1">
              {{ currentTrackerBooking.trip?.name || tripTitle }} • {{ currentTrackerBooking.seats }} place(s)
            </div>
            <div class="text-caption text-secondary-editorial" v-if="currentTrackerBooking.paymentDueDate">
              <strong>Échéance de règlement :</strong> {{ formatDate(currentTrackerBooking.paymentDueDate) }}
              <span v-if="isTrackerOverdue(currentTrackerBooking)" class="text-error font-weight-bold ml-1">
                (Échéance dépassée)
              </span>
            </div>
          </div>

          <!-- Financial Breakdown Cards -->
          <v-row dense class="mb-4">
            <v-col cols="6" sm="3">
              <div class="pa-3 bg-white rounded border text-center">
                <div class="text-caption text-secondary-editorial">Total</div>
                <div class="font-weight-bold font-mono text-forest">{{ formatPrice(currentTrackerBooking.totalPriceDZD) }}</div>
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="pa-3 bg-white rounded border text-center">
                <div class="text-caption text-secondary-editorial">Acompte requis</div>
                <div class="font-weight-bold font-mono text-amber">{{ formatPrice(currentTrackerBooking.depositAmountDZD || 0) }}</div>
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="pa-3 bg-white rounded border text-center">
                <div class="text-caption text-secondary-editorial">Encaissé Vérifié</div>
                <div class="font-weight-bold font-mono text-emerald">{{ formatPrice(currentTrackerBooking.totalPaidDZD || 0) }}</div>
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="pa-3 bg-white rounded border text-center">
                <div class="text-caption text-secondary-editorial">Reste à Régler</div>
                <div class="font-weight-bold font-mono text-forest">{{ formatPrice(currentTrackerBooking.balanceDueDZD) }}</div>
              </div>
            </v-col>
          </v-row>

          <!-- Payment Instructions -->
          <div class="pa-3 bg-warm-ivory rounded-lg mb-4 border-subtle">
            <div class="font-weight-bold text-forest text-body-2 mb-1 d-flex align-center">
              <v-icon size="16" color="#21866B" class="mr-1">mdi-information</v-icon>
              Modalités de Paiement de l'Agence
            </div>
            <p class="text-caption text-secondary-editorial mb-0">
              Réglez par <strong>BaridiMob</strong> ou <strong>CCP</strong> vers le compte de l'agence, ou en espèces au comptoir. Transmettez la capture d'écran du reçu ci-dessous pour faire valider et créditer vos fonds.
            </p>
          </div>

          <!-- Payments List -->
          <div class="mb-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-caption font-weight-bold text-forest text-uppercase">Historique des Règlements & Justificatifs</div>
              <v-btn
                v-if="currentTrackerBooking.balanceDueDZD > 0 && ['pending', 'confirmed'].includes(currentTrackerBooking.status)"
                size="small"
                color="#21866B"
                variant="flat"
                class="text-white font-weight-bold"
                @click="openProofSubmission(currentTrackerBooking)"
              >
                <v-icon start size="16">mdi-upload</v-icon>
                Transmettre un Justificatif
              </v-btn>
            </div>

            <div v-if="!trackerPayments.length" class="text-center py-4 text-caption text-secondary-editorial bg-grey-lighten-4 rounded">
              Aucun justificatif ni paiement enregistré pour le moment.
            </div>

            <v-list v-else density="compact" class="bg-transparent pa-0">
              <v-list-item
                v-for="p in trackerPayments"
                :key="p._id"
                class="bg-white rounded border mb-2 pa-3"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="font-weight-bold font-mono text-forest text-body-2">{{ formatPrice(p.amountDZD) }}</span>
                  <v-chip
                    size="x-small"
                    :color="getPaymentItemStatusColor(p.status)"
                    variant="flat"
                    class="text-white font-weight-medium"
                  >
                    {{ getPaymentItemStatusLabel(p.status) }}
                  </v-chip>
                </div>
                <div class="text-caption text-secondary-editorial d-flex justify-space-between">
                  <span>{{ formatMethodName(p.method) }} • {{ formatDate(p.paymentDate || p.createdAt) }}</span>
                  <span v-if="p.transactionReference" class="font-mono">Réf: {{ p.transactionReference }}</span>
                </div>
                <div v-if="p.status === 'submitted'" class="text-caption text-amber mt-1">
                  <v-icon size="14" color="#D9943B">mdi-clock-outline</v-icon>
                  Justificatif transmis — En cours d'examen par l'agence (non encore crédité).
                </div>
                <div v-if="p.status === 'rejected' && p.rejectionReason" class="text-caption text-error mt-1">
                  <v-icon size="14" color="#C24545">mdi-alert-circle</v-icon>
                  Motif du rejet : {{ p.rejectionReason }}
                </div>
              </v-list-item>
            </v-list>
          </div>

          <!-- Refund Section -->
          <div v-if="['cancelled', 'rejected'].includes(currentTrackerBooking.status) || trackerRefunds.length" class="mb-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-caption font-weight-bold text-forest text-uppercase">Dossier de Remboursement</div>
              <v-btn
                v-if="['cancelled', 'rejected'].includes(currentTrackerBooking.status) && (currentTrackerBooking.netPaidDZD > 0 || currentTrackerBooking.totalPaidDZD > 0)"
                size="small"
                color="#C24545"
                variant="outlined"
                class="font-weight-bold"
                @click="openCustomerRefundDialog"
              >
                Demander un Remboursement
              </v-btn>
            </div>

            <div v-for="r in trackerRefunds" :key="r._id" class="pa-3 bg-white rounded border mb-2">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="font-weight-bold font-mono text-error text-body-2">{{ formatPrice(r.amountDZD) }}</span>
                <v-chip size="x-small" :color="getRefundItemStatusColor(r.status)" class="text-white font-weight-medium">
                  {{ getRefundItemStatusLabel(r.status) }}
                </v-chip>
              </div>
              <div class="text-caption text-secondary-editorial">
                Motif : {{ r.reason }}
              </div>
            </div>
          </div>

          <v-divider class="my-4" />
          <div class="d-flex justify-end">
            <v-btn variant="text" @click="customerTrackerDialog = false">Fermer</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- CUSTOMER REFUND REQUEST DIALOG -->
    <v-dialog v-model="customerRefundDialog" max-width="480">
      <v-card class="editorial-card pa-6">
        <h3 class="text-h6 font-serif font-weight-bold text-forest mb-2">
          Demande de Remboursement
        </h3>
        <p class="text-caption text-secondary-editorial mb-4">
          Votre réservation a été annulée. Saisissez le montant demandé et vos coordonnées de virement (ex: CCP ou BaridiMob).
        </p>

        <v-alert v-if="refundSubmitError" type="error" variant="tonal" class="mb-3" density="compact">
          {{ refundSubmitError }}
        </v-alert>

        <v-text-field
          v-model.number="refundRequestForm.amountDZD"
          label="Montant du remboursement (DZD)"
          type="number"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-select
          v-model="refundRequestForm.method"
          :items="[
            { title: 'Virement CCP', value: 'ccp' },
            { title: 'BaridiMob', value: 'baridimob' },
            { title: 'Virement Bancaire', value: 'bank_transfer' },
            { title: 'Espèces au comptoir', value: 'cash' }
          ]"
          label="Mode de restitution souhaité"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-textarea
          v-model="refundRequestForm.reason"
          label="Motif de la demande"
          variant="outlined"
          rows="2"
          density="comfortable"
          class="mb-3"
        />

        <v-textarea
          v-model="refundRequestForm.customerNote"
          label="Coordonnées de virement (RIB, CCP ou RIP BaridiMob)"
          variant="outlined"
          rows="2"
          density="comfortable"
          class="mb-4"
        />

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="customerRefundDialog = false">Annuler</v-btn>
          <v-btn
            color="#C24545"
            class="text-white font-weight-bold"
            :loading="refundSubmitting"
            :disabled="!refundRequestForm.amountDZD || !refundRequestForm.reason"
            @click="submitRefundRequest"
          >
            Transmettre la Demande
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- SUCCESS NOTIFICATION SNACKBAR -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="#173F35"
      location="top"
      rounded="pill"
      :timeout="4000"
    >
      <div class="d-flex align-center">
        <v-icon color="#D9B98C" class="mr-2">mdi-check-decagram</v-icon>
        <span class="font-weight-bold">Reservation confirmed successfully! View in My Reservations.</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useTripsStore } from '@/stores/trips'
import { getResolvedImage } from '@/config/curatedImages'

const router = useRouter()
const route = useRoute()
const tripsStore = useTripsStore()

const reservationDialog = ref(false)
const submitting = ref(false)
const reservationError = ref('')
const showSuccessSnackbar = ref(false)
const departures = ref([])
const loadingDepartures = ref(false)

const confirmedBookingDialog = ref(false)
const confirmedBooking = ref(null)

const enquiryDialog = ref(false)
const enquiryError = ref('')
const submittingEnquiry = ref(false)
const enquiryForm = ref({
  fullName: '',
  phone: '',
  startDate: '',
  endDate: '',
  groupSize: 2,
  budgetDZD: '',
  specialRequests: ''
})

const bookingForm = ref({
  fullName: '',
  phone: '',
  seats: 1,
  departureId: null
})

const trip = computed(() => tripsStore.getCurrentTrip)

const tripTitle = computed(() => {
  return trip.value?.name || trip.value?.title || 'Algerian Excursion'
})

const tripDescription = computed(() => {
  return trip.value?.description || 
    'An extraordinary journey exploring the natural grandeur, architectural heritage, and hospitable communities of Algeria with curated daily excursions.'
})

const tripDays = computed(() => {
  return trip.value?.days || trip.value?.items || []
})

const tripPrice = computed(() => {
  return trip.value?.price || 15000
})

const destinationText = computed(() => {
  return trip.value?.destination?.name || trip.value?.destination || trip.value?.wilaya?.name || 'Algeria'
})

const isAgencyTrip = computed(() => {
  return trip.value?.creator?.typeAccount === 'touristAgencies'
})

const isVerifiedAgency = computed(() => {
  return isAgencyTrip.value && trip.value?.creator?.fileStatus === 'confirmed'
})

const organizerName = computed(() => {
  if (trip.value?.creator?.companyName) {
    return trip.value.creator.companyName
  }
  return guideName.value
})

const guideName = computed(() => {
  if (trip.value?.creator?.firstName) {
    return `${trip.value.creator.firstName} ${trip.value.creator.lastName || ''}`.trim()
  }
  return 'Certified Algerian Guide'
})

const tripInclusions = computed(() => {
  return Array.isArray(trip.value?.inclusions) ? trip.value.inclusions : []
})

const tripExclusions = computed(() => {
  return Array.isArray(trip.value?.exclusions) ? trip.value.exclusions : []
})

const tripCancellationPolicy = computed(() => {
  return trip.value?.cancellationPolicy || ''
})

const agencyWhatsAppUrl = computed(() => {
  const rawPhone = trip.value?.creator?.phone
  if (!rawPhone || !isAgencyTrip.value) return null
  const cleaned = String(rawPhone).replace(/[^\d+]/g, '')
  let digits = cleaned.replace(/^\+/, '')
  if (digits.startsWith('0')) digits = '213' + digits.slice(1)
  if (!digits.startsWith('213')) digits = '213' + digits
  const text = encodeURIComponent(`Bonjour, je vous contacte depuis Touriva au sujet de l'excursion "${tripTitle.value}".`)
  return `https://wa.me/${digits}?text=${text}`
})

const formatDateRange = (start, end) => {
  if (!start) return ''
  const s = new Date(start).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })
  const e = end ? new Date(end).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  return e ? `${s} — ${e}` : s
}

const selectDepartureAndBook = (dep) => {
  bookingForm.value.departureId = dep._id
  openReservationDialog()
}

const departureSelectItems = computed(() => {
  return departures.value.map(d => ({
    id: d._id,
    label: `${formatDateRange(d.startDate, d.endDate)} • ${d.availableSeats} places dispo (${formatPrice(d.priceDZD || tripPrice.value)})`
  }))
})

const fetchDepartures = async () => {
  const id = route.params.id
  if (!id) return
  loadingDepartures.value = true
  try {
    const res = await axios.get(`/api/trips/${id}/departures`)
    departures.value = res.data || []
    if (departures.value.length && !bookingForm.value.departureId) {
      bookingForm.value.departureId = departures.value[0]._id
    }
  } catch (e) {
    console.error('Error loading departures:', e)
  } finally {
    loadingDepartures.value = false
  }
}

const heroImage = computed(() => {
  return getResolvedImage(trip.value, 'trip')
})

const formatPrice = (price) => {
  const num = Number(price)
  return isNaN(num) ? `${price} DZD` : `${num.toLocaleString()} DZD`
}

const openReservationDialog = () => {
  reservationError.value = ''
  reservationDialog.value = true
}

const submitReservation = async () => {
  if (!bookingForm.value.fullName || !bookingForm.value.phone) {
    reservationError.value = 'Veuillez saisir votre nom complet et numéro de téléphone.'
    return
  }

  submitting.value = true
  reservationError.value = ''

  try {
    let res
    if (bookingForm.value.departureId) {
      // Secure Phase 3 Booking with atomic capacity protection
      res = await axios.post('/api/bookings', {
        departureId: bookingForm.value.departureId,
        seats: bookingForm.value.seats,
        customerInfo: {
          fullName: bookingForm.value.fullName,
          phone: bookingForm.value.phone
        }
      })
      if (res.status === 200 || res.status === 201) {
        reservationDialog.value = false
        confirmedBooking.value = res.data.booking
        confirmedBookingDialog.value = true
        bookingForm.value = { fullName: '', phone: '', seats: 1, departureId: departures.value[0]?._id || null }
        await fetchDepartures()
      }
    } else {
      // Legacy Trip Subscription fallback
      res = await axios.post('/api/tripSubscriptions', {
        tripId: trip.value?._id || route.params.id,
        fullName: bookingForm.value.fullName,
        phone: bookingForm.value.phone,
        seats: bookingForm.value.seats
      })
      if (res.status === 200 || res.status === 201) {
        reservationDialog.value = false
        showSuccessSnackbar.value = true
        bookingForm.value = { fullName: '', phone: '', seats: 1, departureId: null }
      }
    }
  } catch (err) {
    console.error('Reservation error:', err)
    reservationError.value = err.response?.data?.error || 'Échec de la réservation. Veuillez vérifier la disponibilité.'
  } finally {
    submitting.value = false
  }
}

const openEnquiryDialog = () => {
  enquiryError.value = ''
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  enquiryForm.value = {
    fullName: bookingForm.value.fullName || '',
    phone: bookingForm.value.phone || '',
    startDate: tomorrow,
    endDate: nextWeek,
    groupSize: 2,
    budgetDZD: '',
    specialRequests: ''
  }
  enquiryDialog.value = true
}

const submitEnquiry = async () => {
  if (!enquiryForm.value.fullName || !enquiryForm.value.phone) {
    enquiryError.value = 'Nom complet et téléphone requis.'
    return
  }
  if (!enquiryForm.value.startDate || !enquiryForm.value.endDate) {
    enquiryError.value = 'Dates de départ et de retour requises.'
    return
  }
  submittingEnquiry.value = true
  enquiryError.value = ''
  try {
    await axios.post('/api/enquiries', {
      destination: destinationText.value,
      agencyId: trip.value?.creator?._id || undefined,
      startDate: enquiryForm.value.startDate,
      endDate: enquiryForm.value.endDate,
      groupSize: enquiryForm.value.groupSize,
      budgetDZD: enquiryForm.value.budgetDZD ? Number(enquiryForm.value.budgetDZD) : undefined,
      specialRequests: enquiryForm.value.specialRequests,
      customerInfo: {
        fullName: enquiryForm.value.fullName,
        phone: enquiryForm.value.phone
      }
    })
    enquiryDialog.value = false
    showSuccessSnackbar.value = true
  } catch (err) {
    enquiryError.value = err.response?.data?.error || 'Échec de la transmission de votre demande de devis.'
  } finally {
    submittingEnquiry.value = false
  }
}

const proofSubmitDialog = ref(false)
const activeBookingForProof = ref(null)
const proofSubmitting = ref(false)
const proofSubmitSuccess = ref(false)
const proofSubmitError = ref('')

const proofForm = ref({
  amountDZD: 0,
  method: 'baridimob',
  transactionReference: '',
  file: null,
  base64Data: '',
  originalName: ''
})

const openProofSubmission = (booking) => {
  activeBookingForProof.value = booking
  proofSubmitSuccess.value = false
  proofSubmitError.value = ''
  proofForm.value = {
    amountDZD: booking.depositAmountDZD || booking.totalPriceDZD,
    method: 'baridimob',
    transactionReference: '',
    file: null,
    base64Data: '',
    originalName: ''
  }
  confirmedBookingDialog.value = false
  proofSubmitDialog.value = true
}

const handleProofFileChange = (e) => {
  const file = e.target.files ? e.target.files[0] : (Array.isArray(proofForm.value.file) ? proofForm.value.file[0] : proofForm.value.file)
  if (!file) return
  proofForm.value.originalName = file.name
  const reader = new FileReader()
  reader.onload = (event) => {
    proofForm.value.base64Data = event.target.result
  }
  reader.readAsDataURL(file)
}

const submitProof = async () => {
  if (!activeBookingForProof.value || !proofForm.value.amountDZD || !proofForm.value.base64Data) {
    proofSubmitError.value = 'Veuillez saisir le montant et joindre votre justificatif.'
    return
  }
  proofSubmitting.value = true
  proofSubmitError.value = ''
  try {
    const bookingId = activeBookingForProof.value._id
    await axios.post(`/api/bookings/${bookingId}/payments/submit`, {
      amountDZD: proofForm.value.amountDZD,
      method: proofForm.value.method,
      transactionReference: proofForm.value.transactionReference,
      proofData: proofForm.value.base64Data,
      originalName: proofForm.value.originalName,
      phone: activeBookingForProof.value.customerInfo?.phone
    })
    proofSubmitSuccess.value = true
  } catch (err) {
    proofSubmitError.value = err.response?.data?.error || 'Échec de la transmission du justificatif.'
  } finally {
    proofSubmitting.value = false
  }
}

const customerTrackerDialog = ref(false)
const currentTrackerBooking = ref(null)
const trackerLookupRef = ref('')
const trackerLookupPhone = ref('')
const trackerLoading = ref(false)
const trackerError = ref('')
const trackerPayments = ref([])
const trackerRefunds = ref([])

const customerRefundDialog = ref(false)
const refundRequestForm = ref({
  amountDZD: 0,
  method: 'ccp',
  reason: '',
  customerNote: ''
})
const refundSubmitting = ref(false)
const refundSubmitError = ref('')

const openLookupFinancialTracker = () => {
  currentTrackerBooking.value = null
  trackerLookupRef.value = ''
  trackerLookupPhone.value = ''
  trackerError.value = ''
  trackerPayments.value = []
  trackerRefunds.value = []
  customerTrackerDialog.value = true
}

const openBookingFinancialTracker = async (booking) => {
  confirmedBookingDialog.value = false
  currentTrackerBooking.value = booking
  customerTrackerDialog.value = true
  await loadBookingFinancialDetails(booking._id, booking.customerInfo?.phone)
}

const loadBookingFinancialDetails = async (bookingId, phone = '') => {
  trackerLoading.value = true
  trackerError.value = ''
  try {
    const config = phone ? { params: { phone } } : {}
    const res = await axios.get(`/api/bookings/${bookingId}/financials`, config)
    if (res.data) {
      if (res.data.booking) {
        currentTrackerBooking.value = {
          ...currentTrackerBooking.value,
          ...res.data.booking
        }
      }
      trackerPayments.value = res.data.payments || []
      trackerRefunds.value = res.data.refunds || []
    }
  } catch (err) {
    trackerError.value = err.response?.data?.error || 'Échec du chargement des données financières.'
  } finally {
    trackerLoading.value = false
  }
}

const lookupBookingTracker = async () => {
  if (!trackerLookupRef.value.trim()) {
    trackerError.value = 'Veuillez saisir votre référence de réservation.'
    return
  }
  trackerLoading.value = true
  trackerError.value = ''
  try {
    const config = trackerLookupPhone.value ? { params: { phone: trackerLookupPhone.value.trim() } } : {}
    const refRes = await axios.get(`/api/bookings/reference/${trackerLookupRef.value.trim().toUpperCase()}`, config)
    const booking = refRes.data
    currentTrackerBooking.value = booking
    await loadBookingFinancialDetails(booking._id, trackerLookupPhone.value.trim())
  } catch (err) {
    trackerError.value = err.response?.data?.error || 'Réservation introuvable ou numéro de téléphone non correspondant.'
  } finally {
    trackerLoading.value = false
  }
}

const openCustomerRefundDialog = () => {
  if (!currentTrackerBooking.value) return
  refundRequestForm.value = {
    amountDZD: currentTrackerBooking.value.netPaidDZD || currentTrackerBooking.value.totalPaidDZD || 0,
    method: 'ccp',
    reason: '',
    customerNote: ''
  }
  refundSubmitError.value = ''
  customerRefundDialog.value = true
}

const submitRefundRequest = async () => {
  if (!currentTrackerBooking.value) return
  refundSubmitting.value = true
  refundSubmitError.value = ''
  try {
    await axios.post(`/api/bookings/${currentTrackerBooking.value._id}/refunds/request`, {
      amountDZD: refundRequestForm.value.amountDZD,
      method: refundRequestForm.value.method,
      reason: refundRequestForm.value.reason,
      customerNote: refundRequestForm.value.customerNote
    })
    customerRefundDialog.value = false
    await loadBookingFinancialDetails(currentTrackerBooking.value._id, currentTrackerBooking.value.customerInfo?.phone)
  } catch (err) {
    refundSubmitError.value = err.response?.data?.error || 'Échec de la transmission de la demande de remboursement.'
  } finally {
    refundSubmitting.value = false
  }
}

const getCustomerFinancialStatusColor = (st) => {
  const map = {
    unpaid: '#D9943B',
    partially_paid: '#21866B',
    paid: '#173F35',
    refund_pending: '#D9943B',
    partially_refunded: '#6B7280',
    refunded: '#C24545',
    cancelled_unpaid: '#8F9088'
  }
  return map[st] || '#8F9088'
}

const getCustomerFinancialStatusLabel = (st) => {
  const map = {
    unpaid: 'En Attente de Paiement',
    partially_paid: 'Acompte / Paiement Partiel Vérifié',
    paid: 'Intégralement Réglé',
    refund_pending: 'Remboursement En Cours',
    partially_refunded: 'Partiellement Remboursé',
    refunded: 'Intégralement Remboursé',
    cancelled_unpaid: 'Annulée (Non Réglée)'
  }
  return map[st] || st || 'Non Réglée'
}

const getPaymentItemStatusColor = (st) => {
  const map = {
    submitted: '#D9943B',
    verified: '#21866B',
    rejected: '#C24545',
    cancelled: '#8F9088'
  }
  return map[st] || '#8F9088'
}

const getPaymentItemStatusLabel = (st) => {
  const map = {
    submitted: 'Justificatif Reçu — En Attente de Validation',
    verified: 'Vérifié & Encaissé par l\'Agence',
    rejected: 'Justificatif Non Validé',
    cancelled: 'Annulé'
  }
  return map[st] || st
}

const getRefundItemStatusColor = (st) => {
  const map = {
    requested: '#D9943B',
    approved: '#21866B',
    completed: '#21866B',
    rejected: '#C24545'
  }
  return map[st] || '#8F9088'
}

const getRefundItemStatusLabel = (st) => {
  const map = {
    requested: 'Demande en attente d\'examen agence',
    approved: 'Demande validée — Virement en cours',
    completed: 'Fonds restitués',
    rejected: 'Demande non approuvée'
  }
  return map[st] || st
}

const formatMethodName = (m) => {
  const map = {
    baridimob: 'BaridiMob',
    ccp: 'CCP Algérie',
    bank_transfer: 'Virement Bancaire',
    cash: 'Espèces au comptoir',
    other: 'Autre'
  }
  return map[m] || m || 'Paiement'
}

const isTrackerOverdue = (b) => {
  if (!b || !b.paymentDueDate) return false
  if (['paid', 'cancelled', 'cancelled_unpaid', 'refunded'].includes(b.financialStatus)) return false
  return new Date(b.paymentDueDate) < new Date()
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await Promise.all([
      tripsStore.fetchTripById(id),
      fetchDepartures()
    ])
  }
})
</script>

<style scoped>
.editorial-trip-detail {
  min-height: 100vh;
}

.max-w-container {
  max-width: 1280px;
}

.trip-hero {
  position: relative;
  overflow: hidden;
}

.trip-hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(16, 45, 39, 0.6) 0%,
    rgba(16, 45, 39, 0.2) 40%,
    rgba(16, 45, 39, 0.95) 100%
  );
  pointer-events: none;
}

.trip-tag-pill {
  background: rgba(16, 45, 39, 0.85);
  backdrop-filter: blur(6px);
  color: #FAF8F2;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(217, 185, 140, 0.3);
  display: inline-flex;
  align-items: center;
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}

.sticky-card {
  position: sticky;
  top: 100px;
}

.border-subtle {
  border-color: #E7E8E1 !important;
}

.border-s-timeline {
  border-left: 2px solid #21866B;
}

.line-height-relaxed {
  line-height: 1.8;
}

.z-10 {
  z-index: 10;
}
</style>
