<template>
  <div class="agency-financials pa-4 pa-md-8">
    <v-container class="max-w-container pa-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center mb-6 ga-4">
        <div>
          <div class="editorial-tag text-emerald mb-1">SUIVI FINANCIER & TRÉSORERIE SOUVERAINE</div>
          <h1 class="text-h4 font-serif font-weight-bold text-forest mb-1">
            Finances & Règlements
          </h1>
          <p class="text-secondary-editorial text-body-2 mb-0">
            Contrôle des encaissements en Dinars Algériens (DZD), vérification des justificatifs BaridiMob/CCP et gestion des remboursements.
          </p>
        </div>

        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            color="#173F35"
            class="btn-editorial-primary font-weight-bold"
            rounded="pill"
            @click="openRecordPaymentDialog"
          >
            <v-icon start>mdi-cash-plus</v-icon>
            Encaisser un Paiement
          </v-btn>
          <v-btn
            variant="outlined"
            color="#173F35"
            rounded="pill"
            :loading="loading"
            @click="refreshData"
          >
            <v-icon start>mdi-refresh</v-icon>
            Actualiser
          </v-btn>
        </div>
      </div>

      <!-- Financial KPI Cards -->
      <v-row class="mb-6" v-if="dashboardSummary">
        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5 h-100" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Total Encaissé</span>
              <v-avatar color="#E8F4F0" size="36">
                <v-icon color="#21866B" size="20">mdi-cash-check</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-serif font-weight-bold text-emerald">
              {{ formatDZD(dashboardSummary.totalCollectedDZD) }}
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Règlements validés en caisse & comptes
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5 h-100" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Recettes Nettes</span>
              <v-avatar color="#FAF8F2" size="36">
                <v-icon color="#173F35" size="20">mdi-chart-line</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-serif font-weight-bold text-forest">
              {{ formatDZD(dashboardSummary.netRevenueDZD) }}
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Après déduction des remboursements
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5 h-100" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Reste à Recouvrer</span>
              <v-avatar color="#FDF6EB" size="36">
                <v-icon color="#D9943B" size="20">mdi-clock-alert-outline</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-serif font-weight-bold text-amber">
              {{ formatDZD(dashboardSummary.outstandingReceivablesDZD) }}
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Créances ouvertes sur réservations actives
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="editorial-card pa-5 h-100" elevation="0">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-caption font-weight-bold text-secondary-editorial text-uppercase">Remboursements</span>
              <v-avatar color="#FDF0F0" size="36">
                <v-icon color="#C24545" size="20">mdi-keyboard-return</v-icon>
              </v-avatar>
            </div>
            <div class="text-h4 font-serif font-weight-bold text-error">
              {{ formatDZD(dashboardSummary.totalRefundedDZD) }}
            </div>
            <div class="text-caption text-secondary-editorial mt-1">
              Fonds restitués aux voyageurs
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Overdue alert banner if any bookings have passed payment deadline -->
      <v-alert
        v-if="dashboardSummary && dashboardSummary.overdueBookingsCount > 0"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-6 rounded-lg font-weight-medium"
        icon="mdi-alert-circle-outline"
      >
        <div class="d-flex justify-space-between align-center flex-wrap ga-2">
          <div>
            <strong>{{ dashboardSummary.overdueBookingsCount }} réservation(s) avec date limite de paiement dépassée.</strong>
            Consultez le Grand Livre des Réservations pour relancer les voyageurs ou libérer les places.
          </div>
          <v-btn
            size="small"
            color="#D9943B"
            variant="flat"
            class="text-white font-weight-bold"
            @click="activeTab = 'ledger'; bookingStatusFilter = 'overdue'"
          >
            Examiner les retards
          </v-btn>
        </div>
      </v-alert>

      <!-- Main Navigation Tabs -->
      <v-card class="editorial-card mb-6" elevation="0">
        <v-tabs
          v-model="activeTab"
          color="#173F35"
          align-tabs="start"
          class="border-b"
          style="border-color: rgba(23, 63, 53, 0.08) !important;"
        >
          <v-tab value="payments" class="font-weight-bold">
            <v-icon start>mdi-credit-card-outline</v-icon>
            Paiements & Règlements
            <v-badge
              v-if="pendingProofsCount > 0"
              :content="pendingProofsCount"
              color="#D9943B"
              class="ml-2"
              inline
            />
          </v-tab>
          <v-tab value="refunds" class="font-weight-bold">
            <v-icon start>mdi-hand-coin-outline</v-icon>
            Remboursements
            <v-badge
              v-if="pendingRefundsCount > 0"
              :content="pendingRefundsCount"
              color="#C24545"
              class="ml-2"
              inline
            />
          </v-tab>
          <v-tab value="ledger" class="font-weight-bold">
            <v-icon start>mdi-book-open-page-variant-outline</v-icon>
            Grand Livre des Réservations
            <v-badge
              v-if="dashboardSummary && dashboardSummary.overdueBookingsCount > 0"
              :content="dashboardSummary.overdueBookingsCount"
              color="#D9943B"
              class="ml-2"
              inline
            />
          </v-tab>
        </v-tabs>

        <!-- Payments Tab Content -->
        <v-window v-model="activeTab" class="pa-4 pa-md-6">
          <v-window-item value="payments">
            <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-4 ga-3">
              <!-- Filter chips -->
              <v-chip-group v-model="paymentStatusFilter" mandatory selected-class="bg-forest text-white">
                <v-chip value="all" filter size="small">Tous ({{ payments.length }})</v-chip>
                <v-chip value="submitted" filter size="small" color="#D9943B">
                  À Vérifier ({{ submittedCount }})
                </v-chip>
                <v-chip value="verified" filter size="small" color="#21866B">
                  Validés ({{ verifiedCount }})
                </v-chip>
                <v-chip value="rejected" filter size="small" color="#C24545">
                  Rejetés ({{ rejectedCount }})
                </v-chip>
              </v-chip-group>

              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Rechercher réf, client..."
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 280px;"
              />
            </div>

            <v-table class="editorial-table" hover>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">RÉF. PAIEMENT</th>
                  <th class="text-left font-weight-bold">DATE</th>
                  <th class="text-left font-weight-bold">VOYAGEUR & RÉSERVATION</th>
                  <th class="text-left font-weight-bold">MODE</th>
                  <th class="text-right font-weight-bold">MONTANT</th>
                  <th class="text-center font-weight-bold">JUSTIFICATIF</th>
                  <th class="text-center font-weight-bold">STATUT</th>
                  <th class="text-center font-weight-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredPayments.length === 0">
                  <td colspan="8" class="text-center py-8 text-secondary-editorial">
                    <v-icon size="40" color="#B8B2A6" class="mb-2">mdi-receipt-text-outline</v-icon>
                    <div>Aucun règlement ne correspond aux critères sélectionnés.</div>
                  </td>
                </tr>
                <tr v-for="pay in filteredPayments" :key="pay._id">
                  <td class="font-weight-medium text-forest font-mono">
                    {{ pay.paymentReference || '—' }}
                  </td>
                  <td class="text-body-2 text-secondary-editorial">
                    {{ formatDate(pay.paymentDate || pay.createdAt) }}
                  </td>
                  <td>
                    <div class="font-weight-bold text-body-2">
                      {{ pay.customer?.fullName || pay.booking?.customerInfo?.fullName || 'Client' }}
                    </div>
                    <div class="text-caption text-secondary-editorial">
                      Réf : {{ pay.booking?.bookingReference || '—' }}
                      <span v-if="pay.booking?.customerInfo?.phone">({{ pay.booking?.customerInfo?.phone }})</span>
                    </div>
                  </td>
                  <td>
                    <v-chip size="x-small" variant="tonal" class="font-weight-medium">
                      {{ formatMethod(pay.method) }}
                    </v-chip>
                  </td>
                  <td class="text-right font-weight-bold font-mono text-body-1 text-forest">
                    {{ formatDZD(pay.amountDZD) }}
                  </td>
                  <td class="text-center">
                    <v-btn
                      v-if="pay.proofDocument?.filename || pay.hasProof"
                      icon="mdi-paperclip"
                      size="small"
                      variant="text"
                      color="#21866B"
                      @click="previewProof(pay)"
                      title="Examiner la pièce justificative"
                    />
                    <span v-else class="text-caption text-disabled">—</span>
                  </td>
                  <td class="text-center">
                    <v-chip
                      size="small"
                      :color="getStatusColor(pay.status)"
                      variant="flat"
                      class="text-white font-weight-medium"
                    >
                      {{ getStatusLabel(pay.status) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <div class="d-flex justify-center ga-1">
                      <v-btn
                        v-if="pay.status === 'submitted'"
                        size="small"
                        color="#21866B"
                        variant="tonal"
                        class="font-weight-bold"
                        @click="openVerifyDialog(pay)"
                      >
                        Valider
                      </v-btn>
                      <v-btn
                        v-if="pay.status === 'submitted'"
                        size="small"
                        color="#C24545"
                        variant="text"
                        @click="openRejectDialog(pay)"
                      >
                        Rejeter
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>

          <!-- Refunds Tab Content -->
          <v-window-item value="refunds">
            <v-table class="editorial-table" hover>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">RÉF. REMBOURSEMENT</th>
                  <th class="text-left font-weight-bold">DATE</th>
                  <th class="text-left font-weight-bold">VOYAGEUR & RÉSERVATION</th>
                  <th class="text-left font-weight-bold">MOTIF</th>
                  <th class="text-right font-weight-bold">MONTANT</th>
                  <th class="text-center font-weight-bold">STATUT</th>
                  <th class="text-center font-weight-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="refunds.length === 0">
                  <td colspan="7" class="text-center py-8 text-secondary-editorial">
                    <v-icon size="40" color="#B8B2A6" class="mb-2">mdi-hand-coin-outline</v-icon>
                    <div>Aucun dossier de remboursement enregistré.</div>
                  </td>
                </tr>
                <tr v-for="ref in refunds" :key="ref._id">
                  <td class="font-weight-medium text-forest font-mono">
                    {{ ref.refundReference || '—' }}
                  </td>
                  <td class="text-body-2 text-secondary-editorial">
                    {{ formatDate(ref.createdAt) }}
                  </td>
                  <td>
                    <div class="font-weight-bold text-body-2">
                      {{ ref.customer?.fullName || ref.booking?.customerInfo?.fullName || 'Client' }}
                    </div>
                    <div class="text-caption text-secondary-editorial">
                      Réf : {{ ref.booking?.bookingReference || '—' }}
                    </div>
                  </td>
                  <td class="text-body-2">
                    {{ ref.reason }}
                  </td>
                  <td class="text-right font-weight-bold font-mono text-body-1 text-error">
                    {{ formatDZD(ref.amountDZD) }}
                  </td>
                  <td class="text-center">
                    <v-chip
                      size="small"
                      :color="getRefundStatusColor(ref.status)"
                      variant="flat"
                      class="text-white font-weight-medium"
                    >
                      {{ getRefundStatusLabel(ref.status) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <div class="d-flex justify-center ga-1 flex-wrap">
                      <v-btn
                        v-if="ref.status === 'requested'"
                        size="small"
                        color="#21866B"
                        variant="tonal"
                        class="font-weight-bold"
                        :loading="actionLoading"
                        @click="confirmApproveRefund(ref)"
                      >
                        Approuver
                      </v-btn>
                      <v-btn
                        v-if="['requested', 'approved'].includes(ref.status)"
                        size="small"
                        color="#173F35"
                        variant="flat"
                        class="text-white font-weight-bold"
                        @click="openCompleteRefundDialog(ref)"
                      >
                        Rembourser
                      </v-btn>
                      <v-btn
                        v-if="['requested', 'approved'].includes(ref.status)"
                        size="small"
                        color="#C24545"
                        variant="text"
                        @click="openRejectRefundDialog(ref)"
                      >
                        Rejeter
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>

          <!-- Ledger Tab Content (Grand Livre des Réservations) -->
          <v-window-item value="ledger">
            <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-4 ga-3">
              <v-chip-group v-model="bookingStatusFilter" mandatory selected-class="bg-forest text-white">
                <v-chip value="all" filter size="small">Toutes ({{ agencyStore.bookings.length }})</v-chip>
                <v-chip value="unpaid" filter size="small" color="#D9943B">Non Payées</v-chip>
                <v-chip value="partially_paid" filter size="small" color="#21866B">Partiellement Payées</v-chip>
                <v-chip value="paid" filter size="small" color="#173F35">Soldées</v-chip>
                <v-chip value="overdue" filter size="small" color="#C24545">En Retard</v-chip>
              </v-chip-group>

              <v-text-field
                v-model="ledgerSearchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Rechercher réf, client, excursion..."
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 280px;"
              />
            </div>

            <v-table class="editorial-table" hover>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">RÉF. RÉSERVATION</th>
                  <th class="text-left font-weight-bold">CLIENT & CONTACT</th>
                  <th class="text-left font-weight-bold">EXCURSION & DÉPART</th>
                  <th class="text-right font-weight-bold">TOTAL (DZD)</th>
                  <th class="text-right font-weight-bold">ENCAISSÉ</th>
                  <th class="text-right font-weight-bold">SOLDE DÛ</th>
                  <th class="text-center font-weight-bold">ÉCHÉANCE</th>
                  <th class="text-center font-weight-bold">STATUT FINANCIER</th>
                  <th class="text-center font-weight-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredBookings.length === 0">
                  <td colspan="9" class="text-center py-8 text-secondary-editorial">
                    <v-icon size="40" color="#B8B2A6" class="mb-2">mdi-book-remove-outline</v-icon>
                    <div>Aucune réservation ne correspond aux critères du grand livre.</div>
                  </td>
                </tr>
                <tr v-for="b in filteredBookings" :key="b._id">
                  <td class="font-weight-medium text-forest font-mono">
                    {{ b.bookingReference }}
                    <div class="text-caption text-secondary-editorial">
                      {{ formatDate(b.createdAt) }}
                    </div>
                  </td>
                  <td>
                    <div class="font-weight-bold text-body-2">
                      {{ b.customerInfo?.fullName || 'Client' }}
                    </div>
                    <div class="text-caption text-emerald font-weight-medium">
                      {{ b.customerInfo?.phone || '—' }}
                    </div>
                  </td>
                  <td>
                    <div class="font-weight-medium text-body-2 text-truncate" style="max-width: 180px;">
                      {{ b.trip?.name || 'Excursion' }}
                    </div>
                    <div class="text-caption text-secondary-editorial">
                      {{ formatDate(b.departure?.startDate) }}
                    </div>
                  </td>
                  <td class="text-right font-weight-bold font-mono text-body-2 text-forest">
                    {{ formatDZD(b.totalPriceDZD) }}
                  </td>
                  <td class="text-right font-weight-bold font-mono text-body-2 text-emerald">
                    {{ formatDZD(b.totalPaidDZD || 0) }}
                  </td>
                  <td class="text-right font-weight-bold font-mono text-body-2" :class="b.balanceDueDZD > 0 ? 'text-amber' : 'text-forest'">
                    {{ formatDZD(b.balanceDueDZD) }}
                  </td>
                  <td class="text-center">
                    <div v-if="b.paymentDueDate" class="text-caption font-weight-medium">
                      {{ formatDate(b.paymentDueDate) }}
                      <v-chip
                        v-if="isBookingOverdue(b)"
                        size="x-small"
                        color="#C24545"
                        variant="flat"
                        class="text-white d-block mt-1 font-weight-bold"
                      >
                        En Retard
                      </v-chip>
                    </div>
                    <span v-else class="text-caption text-secondary-editorial">—</span>
                  </td>
                  <td class="text-center">
                    <v-chip
                      size="small"
                      :color="getFinancialStatusBadgeColor(b.financialStatus)"
                      variant="flat"
                      class="text-white font-weight-medium"
                    >
                      {{ getFinancialStatusBadgeLabel(b.financialStatus) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-btn
                      v-if="b.balanceDueDZD > 0 && ['pending', 'confirmed'].includes(b.status)"
                      size="small"
                      color="#173F35"
                      variant="tonal"
                      class="font-weight-bold"
                      @click="quickRecordForBooking(b)"
                    >
                      Encaisser
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>
        </v-window>
      </v-card>

      <!-- Proof Inspection & Verification Modal -->
      <v-dialog v-model="proofDialog" max-width="650">
        <v-card class="pa-4 pa-md-6 rounded-lg" v-if="selectedPayment">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6 font-weight-bold font-serif text-forest">
              Justificatif de Paiement — {{ selectedPayment.paymentReference }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="proofDialog = false" />
          </div>

          <div class="mb-4 pa-3 bg-warm-ivory rounded border">
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Montant réclamé :</span>
              <strong class="font-mono text-forest">{{ formatDZD(selectedPayment.amountDZD) }}</strong>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Mode de transfert :</span>
              <strong>{{ formatMethod(selectedPayment.method) }}</strong>
            </div>
            <div class="d-flex justify-space-between text-body-2" v-if="selectedPayment.transactionReference">
              <span>Réf. transaction :</span>
              <span class="font-mono">{{ selectedPayment.transactionReference }}</span>
            </div>
            <div class="text-caption text-secondary-editorial mt-2" v-if="selectedPayment.customerNote">
              <strong>Note du voyageur :</strong> {{ selectedPayment.customerNote }}
            </div>
          </div>

          <!-- Document Preview -->
          <div class="text-center py-4 bg-grey-lighten-4 rounded mb-4" style="min-height: 200px; max-height: 400px; overflow-y: auto;">
            <template v-if="selectedPayment.proofDocument?.mimeType?.includes('pdf')">
              <v-icon size="48" color="#C24545" class="mb-2">mdi-file-pdf-box</v-icon>
              <div class="font-weight-bold text-body-2 mb-2">{{ selectedPayment.proofDocument?.originalName || 'Document PDF' }}</div>
              <v-btn
                color="#173F35"
                variant="outlined"
                size="small"
                :href="getProofStreamUrl(selectedPayment)"
                target="_blank"
              >
                <v-icon start>mdi-open-in-new</v-icon> Ouvrir le PDF
              </v-btn>
            </template>
            <template v-else>
              <img
                :src="getProofStreamUrl(selectedPayment)"
                class="rounded elevation-1"
                style="max-width: 100%; max-height: 380px; object-fit: contain;"
                alt="Justificatif de paiement"
              />
            </template>
          </div>

          <v-divider class="my-4" />

          <!-- Action buttons -->
          <div class="d-flex justify-end ga-2">
            <v-btn
              color="#C24545"
              variant="outlined"
              @click="openRejectDialog(selectedPayment)"
            >
              Rejeter
            </v-btn>
            <v-btn
              color="#21866B"
              class="text-white font-weight-bold"
              @click="openVerifyDialog(selectedPayment)"
            >
              Valider le Paiement
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Verify Dialog -->
      <v-dialog v-model="verifyDialog" max-width="480">
        <v-card class="pa-5 rounded-lg" v-if="selectedPayment">
          <h3 class="text-h6 font-weight-bold font-serif text-forest mb-3">
            Valider l'encaissement
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-4">
            Confirmez la bonne réception des fonds sur votre compte CCP ou BaridiMob. Cette action créditera immédiatement le solde du voyageur.
          </p>

          <v-text-field
            v-model.number="verifyAmount"
            label="Montant exact vérifié (DZD)"
            type="number"
            variant="outlined"
            density="comfortable"
            prefix="DZD"
            class="mb-3"
          />

          <v-textarea
            v-model="verifyNote"
            label="Note interne agence (ex: Relevé CCP N°...)"
            variant="outlined"
            rows="2"
            density="comfortable"
            class="mb-4"
          />

          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="verifyDialog = false">Annuler</v-btn>
            <v-btn
              color="#21866B"
              class="text-white font-weight-bold"
              :loading="actionLoading"
              @click="confirmVerifyPayment"
            >
              Confirmer l'Encaissement
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Reject Dialog -->
      <v-dialog v-model="rejectDialog" max-width="480">
        <v-card class="pa-5 rounded-lg" v-if="selectedPayment">
          <h3 class="text-h6 font-weight-bold font-serif text-forest mb-3">
            Rejeter le justificatif
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-4">
            Indiquez le motif précis pour lequel le justificatif ne peut pas être validé (reçu illisible, montant discordant, etc.).
          </p>

          <v-textarea
            v-model="rejectionReason"
            label="Motif du rejet (obligatoire)"
            variant="outlined"
            rows="3"
            density="comfortable"
            class="mb-4"
            :rules="[v => !!v || 'Le motif est obligatoire']"
          />

          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="rejectDialog = false">Annuler</v-btn>
            <v-btn
              color="#C24545"
              class="text-white font-weight-bold"
              :loading="actionLoading"
              :disabled="!rejectionReason || rejectionReason.trim().length < 5"
              @click="confirmRejectPayment"
            >
              Confirmer le Rejet
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Direct Agency Payment Dialog -->
      <v-dialog v-model="recordDialog" max-width="500">
        <v-card class="pa-5 rounded-lg">
          <h3 class="text-h6 font-weight-bold font-serif text-forest mb-3">
            Encaisser un Règlement
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-4">
            Enregistrez un paiement reçu au comptoir de l'agence (espèces) ou par virement bancaire vérifié.
          </p>

          <v-select
            v-model="recordForm.bookingId"
            :items="activeBookingItems"
            item-title="title"
            item-value="value"
            label="Sélectionner la réservation"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model.number="recordForm.amountDZD"
            label="Montant encaissé (DZD)"
            type="number"
            variant="outlined"
            density="comfortable"
            prefix="DZD"
            class="mb-3"
          />

          <v-select
            v-model="recordForm.method"
            :items="paymentMethodItems"
            label="Mode de paiement"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="recordForm.transactionReference"
            label="Numéro de reçu / Réf. transaction"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-textarea
            v-model="recordForm.agencyInternalNote"
            label="Note interne agence"
            variant="outlined"
            rows="2"
            density="comfortable"
            class="mb-4"
          />

          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="recordDialog = false">Annuler</v-btn>
            <v-btn
              color="#173F35"
              class="text-white font-weight-bold"
              :loading="actionLoading"
              :disabled="!recordForm.bookingId || !recordForm.amountDZD || recordForm.amountDZD <= 0"
              @click="submitDirectPayment"
            >
              Enregistrer le Règlement
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Complete Refund Dialog -->
      <v-dialog v-model="refundDialog" max-width="480">
        <v-card class="pa-5 rounded-lg" v-if="selectedRefund">
          <h3 class="text-h6 font-weight-bold font-serif text-forest mb-3">
            Traiter le Remboursement
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-4">
            Confirmez la restitution des fonds au client via BaridiMob, CCP ou espèces au comptoir.
          </p>

          <v-text-field
            :model-value="formatDZD(selectedRefund.amountDZD)"
            label="Montant demandé par le voyageur"
            variant="outlined"
            density="comfortable"
            readonly
            class="mb-3"
          />

          <v-text-field
            v-model.number="refundCancellationFee"
            label="Frais d'annulation retenus (DZD)"
            type="number"
            variant="outlined"
            density="comfortable"
            prefix="DZD"
            class="mb-3"
          />

          <v-text-field
            v-model="refundTransactionRef"
            label="Réf. virement / Quittance de caisse"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-textarea
            v-model="refundInternalNote"
            label="Note d'audit interne"
            variant="outlined"
            rows="2"
            density="comfortable"
            class="mb-4"
          />

          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="refundDialog = false">Annuler</v-btn>
            <v-btn
              color="#173F35"
              class="text-white font-weight-bold"
              :loading="actionLoading"
              @click="confirmCompleteRefund"
            >
              Confirmer le Remboursement
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Reject Refund Dialog -->
      <v-dialog v-model="rejectRefundDialog" max-width="480">
        <v-card class="pa-5 rounded-lg" v-if="selectedRefund">
          <h3 class="text-h6 font-weight-bold font-serif text-forest mb-3">
            Rejeter la Demande de Remboursement
          </h3>
          <p class="text-body-2 text-secondary-editorial mb-4">
            Indiquez le motif justifiant le rejet de cette demande selon les conditions générales de vente de l'agence.
          </p>

          <v-textarea
            v-model="refundRejectionReason"
            label="Motif du rejet (obligatoire)"
            variant="outlined"
            rows="3"
            density="comfortable"
            class="mb-4"
            :rules="[v => !!v || 'Le motif est obligatoire']"
          />

          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="rejectRefundDialog = false">Annuler</v-btn>
            <v-btn
              color="#C24545"
              class="text-white font-weight-bold"
              :loading="actionLoading"
              :disabled="!refundRejectionReason || refundRejectionReason.trim().length < 5"
              @click="confirmRejectRefund"
            >
              Confirmer le Rejet
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAgencyStore } from '@/stores/agency'

const agencyStore = useAgencyStore()

const loading = ref(false)
const actionLoading = ref(false)
const activeTab = ref('payments')
const paymentStatusFilter = ref('all')
const searchQuery = ref('')
const bookingStatusFilter = ref('all')
const ledgerSearchQuery = ref('')

const dashboardSummary = ref(null)
const payments = ref([])
const refunds = ref([])

// Dialog states
const proofDialog = ref(false)
const verifyDialog = ref(false)
const rejectDialog = ref(false)
const recordDialog = ref(false)
const refundDialog = ref(false)
const rejectRefundDialog = ref(false)

const selectedPayment = ref(null)
const verifyAmount = ref(0)
const verifyNote = ref('')
const rejectionReason = ref('')

const selectedRefund = ref(null)
const refundCancellationFee = ref(0)
const refundTransactionRef = ref('')
const refundInternalNote = ref('')
const refundRejectionReason = ref('')

const recordForm = ref({
  bookingId: null,
  amountDZD: null,
  method: 'cash',
  transactionReference: '',
  agencyInternalNote: ''
})

const paymentMethodItems = [
  { title: 'Espèces (au comptoir)', value: 'cash' },
  { title: 'BaridiMob', value: 'baridimob' },
  { title: 'Virement CCP', value: 'ccp' },
  { title: 'Virement Bancaire', value: 'bank_transfer' },
  { title: 'Autre', value: 'other' }
]

const submittedCount = computed(() => payments.value.filter(p => p.status === 'submitted').length)
const verifiedCount = computed(() => payments.value.filter(p => p.status === 'verified').length)
const rejectedCount = computed(() => payments.value.filter(p => p.status === 'rejected').length)
const pendingProofsCount = computed(() => submittedCount.value)
const pendingRefundsCount = computed(() => refunds.value.filter(r => ['requested', 'approved'].includes(r.status)).length)

const filteredPayments = computed(() => {
  let list = payments.value
  if (paymentStatusFilter.value !== 'all') {
    list = list.filter(p => p.status === paymentStatusFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p => {
      return (
        p.paymentReference?.toLowerCase().includes(q) ||
        p.booking?.bookingReference?.toLowerCase().includes(q) ||
        p.customer?.fullName?.toLowerCase().includes(q) ||
        p.booking?.customerInfo?.fullName?.toLowerCase().includes(q) ||
        p.booking?.customerInfo?.phone?.includes(q)
      )
    })
  }
  return list
})

const activeBookingItems = computed(() => {
  return agencyStore.bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status) && (b.balanceDueDZD > 0 || b.financialStatus !== 'paid'))
    .map(b => ({
      title: `${b.bookingReference} — ${b.customerInfo?.fullName || 'Client'} (Reste : ${formatDZD(b.balanceDueDZD)})`,
      value: b._id
    }))
})

const formatDZD = (val) => {
  if (val === undefined || val === null) return '0 DZD'
  return `${Number(val).toLocaleString('fr-DZ')} DZD`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatMethod = (method) => {
  const map = {
    cash: 'Espèces',
    baridimob: 'BaridiMob',
    ccp: 'CCP Algérie',
    bank_transfer: 'Virement',
    gateway_cib: 'CIB / Edahabia',
    other: 'Autre'
  }
  return map[method] || method || '—'
}

const getStatusColor = (status) => {
  const map = {
    submitted: '#D9943B',
    verified: '#21866B',
    rejected: '#C24545',
    cancelled: '#8F9088'
  }
  return map[status] || '#8F9088'
}

const getStatusLabel = (status) => {
  const map = {
    submitted: 'À Vérifier',
    verified: 'Validé',
    rejected: 'Rejeté',
    cancelled: 'Annulé'
  }
  return map[status] || status
}

const getRefundStatusColor = (status) => {
  const map = {
    requested: '#D9943B',
    approved: '#21866B',
    completed: '#21866B',
    rejected: '#C24545'
  }
  return map[status] || '#8F9088'
}

const getRefundStatusLabel = (status) => {
  const map = {
    requested: 'Demandé',
    approved: 'Approuvé',
    completed: 'Remboursé',
    rejected: 'Rejeté'
  }
  return map[status] || status
}

const getProofStreamUrl = (pay) => {
  if (!pay) return ''
  return `/api/agency/payments/${pay._id}/proof`
}

const isBookingOverdue = (b) => {
  if (!b || !b.paymentDueDate) return false
  if (['paid', 'cancelled', 'cancelled_unpaid', 'refunded'].includes(b.financialStatus)) return false
  return new Date(b.paymentDueDate) < new Date()
}

const getFinancialStatusBadgeColor = (status) => {
  const map = {
    unpaid: '#D9943B',
    partially_paid: '#21866B',
    paid: '#173F35',
    refund_pending: '#D9943B',
    partially_refunded: '#6B7280',
    refunded: '#C24545',
    cancelled_unpaid: '#8F9088'
  }
  return map[status] || '#8F9088'
}

const getFinancialStatusBadgeLabel = (status) => {
  const map = {
    unpaid: 'Non Payé',
    partially_paid: 'Partiellement Payé',
    paid: 'Soldé',
    refund_pending: 'Remboursement En Cours',
    partially_refunded: 'Partiellement Remboursé',
    refunded: 'Remboursé',
    cancelled_unpaid: 'Annulé (Non Payé)'
  }
  return map[status] || status || 'Non Payé'
}

const formatDepartureDates = (startStr, endStr) => {
  if (!startStr) return '—'
  const s = new Date(startStr).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })
  if (!endStr || endStr === startStr) return s
  const e = new Date(endStr).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })
  return `${s} → ${e}`
}

const filteredBookings = computed(() => {
  let list = agencyStore.bookings || []
  if (bookingStatusFilter.value === 'overdue') {
    list = list.filter(b => isBookingOverdue(b))
  } else if (bookingStatusFilter.value !== 'all') {
    list = list.filter(b => b.financialStatus === bookingStatusFilter.value)
  }
  if (ledgerSearchQuery.value.trim()) {
    const q = ledgerSearchQuery.value.trim().toLowerCase()
    list = list.filter(b => {
      return (
        b.bookingReference?.toLowerCase().includes(q) ||
        b.customerInfo?.fullName?.toLowerCase().includes(q) ||
        b.customerInfo?.phone?.includes(q) ||
        b.trip?.name?.toLowerCase().includes(q)
      )
    })
  }
  return list
})

const quickRecordForBooking = (b) => {
  recordForm.value = {
    bookingId: b._id,
    amountDZD: b.balanceDueDZD > 0 ? b.balanceDueDZD : null,
    method: 'cash',
    transactionReference: '',
    agencyInternalNote: ''
  }
  recordDialog.value = true
}

const confirmApproveRefund = async (refItem) => {
  actionLoading.value = true
  try {
    await agencyStore.approveRefund(refItem._id)
    await refreshData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

const openRejectRefundDialog = (refItem) => {
  selectedRefund.value = refItem
  refundRejectionReason.value = ''
  rejectRefundDialog.value = true
}

const confirmRejectRefund = async () => {
  if (!selectedRefund.value || !refundRejectionReason.value) return
  actionLoading.value = true
  try {
    await agencyStore.rejectRefund(selectedRefund.value._id, {
      rejectionReason: refundRejectionReason.value
    })
    rejectRefundDialog.value = false
    await refreshData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    const [dashRes, payRes, refRes] = await Promise.all([
      agencyStore.fetchFinancialDashboard(),
      agencyStore.fetchPayments({ limit: 100 }),
      agencyStore.fetchRefunds({ limit: 100 }),
      agencyStore.fetchBookings({ limit: 100 })
    ])
    dashboardSummary.value = dashRes.summary
    payments.value = payRes.payments || []
    refunds.value = refRes.refunds || []
  } catch (err) {
    console.error('Error refreshing financial data:', err)
  } finally {
    loading.value = false
  }
}

const previewProof = (pay) => {
  selectedPayment.value = pay
  proofDialog.value = true
}

const openVerifyDialog = (pay) => {
  selectedPayment.value = pay
  verifyAmount.value = pay.amountDZD
  verifyNote.value = ''
  proofDialog.value = false
  verifyDialog.value = true
}

const confirmVerifyPayment = async () => {
  if (!selectedPayment.value) return
  actionLoading.value = true
  try {
    await agencyStore.verifyPayment(selectedPayment.value._id, {
      verifiedAmountDZD: verifyAmount.value,
      agencyInternalNote: verifyNote.value
    })
    verifyDialog.value = false
    await refreshData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

const openRejectDialog = (pay) => {
  selectedPayment.value = pay
  rejectionReason.value = ''
  proofDialog.value = false
  rejectDialog.value = true
}

const confirmRejectPayment = async () => {
  if (!selectedPayment.value || !rejectionReason.value) return
  actionLoading.value = true
  try {
    await agencyStore.rejectPayment(selectedPayment.value._id, {
      rejectionReason: rejectionReason.value
    })
    rejectDialog.value = false
    await refreshData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

const openRecordPaymentDialog = () => {
  recordForm.value = {
    bookingId: null,
    amountDZD: null,
    method: 'cash',
    transactionReference: '',
    agencyInternalNote: ''
  }
  recordDialog.value = true
}

const submitDirectPayment = async () => {
  if (!recordForm.value.bookingId || !recordForm.value.amountDZD) return
  actionLoading.value = true
  try {
    await agencyStore.recordPayment(recordForm.value.bookingId, {
      amountDZD: recordForm.value.amountDZD,
      method: recordForm.value.method,
      transactionReference: recordForm.value.transactionReference,
      agencyInternalNote: recordForm.value.agencyInternalNote
    })
    recordDialog.value = false
    await refreshData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

const openCompleteRefundDialog = (refItem) => {
  selectedRefund.value = refItem
  refundCancellationFee.value = 0
  refundTransactionRef.value = ''
  refundInternalNote.value = ''
  refundDialog.value = true
}

const confirmCompleteRefund = async () => {
  if (!selectedRefund.value) return
  actionLoading.value = true
  try {
    await agencyStore.completeRefund(selectedRefund.value._id, {
      cancellationFeeDZD: refundCancellationFee.value,
      transactionReference: refundTransactionRef.value,
      internalNote: refundInternalNote.value
    })
    refundDialog.value = false
    await refreshData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.editorial-card {
  background: #FFFFFF;
  border: 1px solid rgba(23, 63, 53, 0.08);
  border-radius: 12px;
}
.editorial-table th {
  color: #173F35;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  background-color: #FAF8F2;
}
.text-forest {
  color: #173F35;
}
.text-emerald {
  color: #21866B;
}
.text-amber {
  color: #D9943B;
}
.text-error {
  color: #C24545;
}
.text-sand-light {
  color: #D9B98C;
}
.font-mono {
  font-family: monospace, monospace;
}
</style>
