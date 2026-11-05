<template>
  <v-container class="py-8 max-w-1200">
    <!-- Breadcrumb -->
    <div class="d-flex align-center mb-6">
      <v-btn variant="text" color="forestGreen" class="font-weight-bold px-0" @click="$router.push('/products')">
        <v-icon start size="18">mdi-arrow-left</v-icon>
        {{ $t('continueShopping') || 'Continuer mes achats' }}
      </v-btn>
    </div>

    <!-- Title -->
    <div class="mb-6">
      <span class="editorial-tag text-sand-dark d-block mb-1">COMMANDES SÉCURISÉES • LIVRAISON 58 WILAYAS</span>
      <h1 class="editorial-heading text-h4 font-weight-bold text-forest">
        {{ $t('checkout') || 'Finaliser ma Commande' }}
      </h1>
      <p class="text-body-2 text-secondary-editorial mt-1">
        Touriva Marketplace centralise vos achats artisanaux et assure la coordination avec nos vendeurs agréés.
      </p>
    </div>

    <!-- Empty Cart Alert -->
    <div v-if="!cartStore.items || cartStore.items.length === 0" class="text-center py-12">
      <v-avatar color="sandLight" size="80" class="mb-4">
        <v-icon size="40" color="forestGreen">mdi-cart-outline</v-icon>
      </v-avatar>
      <h2 class="editorial-heading text-h5 text-forest font-weight-bold mb-2">Votre panier est vide</h2>
      <p class="text-body-2 text-secondary-editorial mb-6">Découvrez notre sélection de produits artisanaux et équipements de voyage.</p>
      <v-btn class="btn-editorial-primary px-8" size="large" @click="$router.push('/products')">
        Explorer le Catalogue
      </v-btn>
    </div>

    <!-- Checkout Form & Order Summary -->
    <v-row v-else class="ma-0" justify="space-between">
      <!-- Left Column: Delivery & Payment Details -->
      <v-col cols="12" md="7" class="pl-0 pr-md-6 mb-6">
        <!-- 1. Customer & Shipping Address -->
        <v-card class="editorial-card pa-6 mb-6 border-editorial">
          <div class="d-flex align-center mb-4">
            <v-avatar color="forestGreen" size="32" class="mr-3 text-white font-weight-bold">1</v-avatar>
            <h2 class="editorial-heading text-h6 font-weight-bold text-forest">Adresse de Livraison</h2>
          </div>

          <v-form ref="shippingForm" v-model="formValid">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="customerInfo.fullName"
                  label="Nom & Prénom *"
                  variant="outlined"
                  density="comfortable"
                  color="forestGreen"
                  :rules="[v => !!v || 'Nom requis']"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="customerInfo.phone"
                  label="Numéro de Téléphone (Mobile) *"
                  placeholder="05 / 06 / 07..."
                  variant="outlined"
                  density="comfortable"
                  color="forestGreen"
                  :rules="[v => !!v || 'Téléphone requis']"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="customerInfo.email"
                  label="Adresse Email (Optionnelle)"
                  variant="outlined"
                  density="comfortable"
                  color="forestGreen"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="customerInfo.wilaya"
                  :items="algerianWilayas"
                  label="Wilaya de Livraison *"
                  variant="outlined"
                  density="comfortable"
                  color="forestGreen"
                  :rules="[v => !!v || 'Wilaya requise']"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="customerInfo.shippingAddress"
                  label="Adresse Complète de Livraison (Commune, Rue, Bâtiment) *"
                  variant="outlined"
                  density="comfortable"
                  color="forestGreen"
                  :rules="[v => !!v || 'Adresse requise']"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="customerInfo.notes"
                  label="Instructions de livraison (Point de repère, créneau préféré)"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  color="forestGreen"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>

        <!-- 2. Payment Method -->
        <v-card class="editorial-card pa-6 border-editorial">
          <div class="d-flex align-center mb-4">
            <v-avatar color="forestGreen" size="32" class="mr-3 text-white font-weight-bold">2</v-avatar>
            <h2 class="editorial-heading text-h6 font-weight-bold text-forest">Mode de Paiement</h2>
          </div>

          <v-radio-group v-model="paymentMethod" color="forestGreen">
            <v-radio value="cash_on_delivery" class="mb-3">
              <template #label>
                <div>
                  <div class="font-weight-bold text-forest">Paiement à la Livraison (Espèces)</div>
                  <div class="text-caption text-secondary-editorial">Réglez en espèces directement auprès du livreur à la réception de votre colis.</div>
                </div>
              </template>
            </v-radio>

            <v-radio value="baridimob" class="mb-3">
              <template #label>
                <div>
                  <div class="font-weight-bold text-forest">Virement BaridiMob / RIP Algérie Poste</div>
                  <div class="text-caption text-secondary-editorial">Virez le montant sur notre compte BaridiMob sécurisé et soumettez la capture d'écran.</div>
                </div>
              </template>
            </v-radio>

            <v-radio value="ccp">
              <template #label>
                <div>
                  <div class="font-weight-bold text-forest">Versement CCP Algérie Poste</div>
                  <div class="text-caption text-secondary-editorial">Versement au guichet de poste avec reçu tamponné.</div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </v-card>
      </v-col>

      <!-- Right Column: Order Summary -->
      <v-col cols="12" md="5" class="pr-0 pl-md-4">
        <v-card class="editorial-card pa-6 border-editorial sticky-top">
          <h2 class="editorial-heading text-h6 font-weight-bold text-forest mb-4">Récapitulatif de Commande</h2>

          <!-- Items list -->
          <div class="mb-4 overflow-y-auto" style="max-height: 280px;">
            <div
              v-for="item in cartStore.items"
              :key="item.product._id"
              class="d-flex align-center py-3 border-b-editorial"
            >
              <v-avatar rounded="lg" size="52" color="sandLight" class="mr-3 flex-shrink-0">
                <v-img :src="item.product.img || fallbackImage" cover />
              </v-avatar>
              <div class="flex-grow-1 pr-2">
                <div class="text-body-2 font-weight-bold text-forest text-truncate" style="max-width: 180px;">
                  {{ item.product.name }}
                </div>
                <div class="text-caption text-secondary-editorial">
                  {{ item.quantity }} × {{ item.product.price }} DZD
                </div>
              </div>
              <div class="text-body-2 font-weight-bold text-forest flex-shrink-0">
                {{ (item.product.price || 0) * item.quantity }} DZD
              </div>
            </div>
          </div>

          <!-- Price Calculations -->
          <div class="d-flex justify-space-between text-body-2 text-secondary-editorial mb-2">
            <span>Sous-total articles</span>
            <span class="font-weight-bold text-forest">{{ cartStore.subtotal }} DZD</span>
          </div>
          <div class="d-flex justify-space-between text-body-2 text-secondary-editorial mb-4">
            <span>Frais de livraison standard</span>
            <span class="font-weight-bold text-forest">{{ deliveryFeeDZD }} DZD</span>
          </div>

          <v-divider class="mb-4" />

          <div class="d-flex justify-space-between align-center mb-6">
            <span class="text-subtitle-1 font-weight-bold text-forest">Total à Payer</span>
            <span class="editorial-heading text-h5 font-weight-bold text-forest">
              {{ cartStore.subtotal + deliveryFeeDZD }} DZD
            </span>
          </div>

          <!-- Order Submit Button -->
          <v-btn
            block
            class="btn-editorial-primary py-3"
            size="large"
            :loading="submitting"
            :disabled="submitting || !formValid"
            @click="submitOrder"
          >
            <v-icon start size="20">mdi-shield-check</v-icon>
            Confirmer la Commande
          </v-btn>

          <p class="text-caption text-center text-secondary-editorial mt-3 mb-0">
            En validant, vous acceptez les conditions de vente de Touriva Marketplace.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Modal Dialog -->
    <v-dialog v-model="orderSuccessModal" persistent max-width="540">
      <v-card class="editorial-card pa-6 text-center">
        <v-avatar color="forestGreen" size="72" class="mb-4 mx-auto text-white">
          <v-icon size="40">mdi-check-decagram</v-icon>
        </v-avatar>
        <h2 class="editorial-heading text-h5 font-weight-bold text-forest mb-2">Commande Enregistrée !</h2>
        <p class="text-body-1 font-weight-bold text-forest mb-1">
          N° de Commande : <span class="text-primary">{{ confirmedOrder?.orderNumber }}</span>
        </p>
        <p class="text-body-2 text-secondary-editorial mb-4">
          Montant Total : <strong>{{ confirmedOrder?.totalAmountDZD }} DZD</strong> ({{ confirmedOrder?.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : 'Paiement BaridiMob' }})
        </p>

        <div v-if="confirmedOrder?.paymentMethod === 'baridimob'" class="pa-4 bg-warm-ivory rounded-lg mb-4 text-left border-editorial">
          <div class="text-subtitle-2 font-weight-bold text-forest mb-1">Règlement par BaridiMob / Virement :</div>
          <div class="text-caption text-secondary-editorial mb-2">Les coordonnées officielles de versement postal (RIP Touriva Marketplace) vous seront transmises lors de la confirmation commerciale de votre commande.</div>
          <div class="text-caption text-secondary-editorial">Conservez précieusement votre numéro de commande <strong>{{ confirmedOrder?.orderNumber }}</strong> comme référence de paiement.</div>
        </div>

        <div class="d-flex ga-3 justify-center">
          <v-btn class="btn-editorial-primary px-6" @click="$router.push('/orders')">
            Voir mes Commandes
          </v-btn>
          <v-btn variant="outlined" color="forestGreen" @click="$router.push('/products')">
            Retour au Catalogue
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useCartStore } from '@/stores/cart'
import axios from 'axios'

export default {
  name: 'MarketplaceCheckout',
  data() {
    return {
      cartStore: useCartStore(),
      formValid: false,
      submitting: false,
      orderSuccessModal: false,
      confirmedOrder: null,
      deliveryFeeDZD: 600,
      paymentMethod: 'cash_on_delivery',
      customerInfo: {
        fullName: '',
        email: '',
        phone: '',
        wilaya: 'Alger',
        city: '',
        shippingAddress: '',
        notes: ''
      },
      fallbackImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=400&q=80',
      algerianWilayas: [
        '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', '06 - Béjaïa',
        '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira', '11 - Tamanrasset', '12 - Tébessa',
        '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa', '18 - Jijel',
        '19 - Sétif', '20 - Saïda', '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma',
        '25 - Constantine', '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
        '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arreridj', '35 - Boumerdès',
        '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela', '41 - Souk Ahras',
        '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa',
        '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar', '51 - Ouled Djellal', '52 - Béni Abbès',
        '53 - In Salah', '54 - In Guezzam', '55 - Touggourt', '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa'
      ]
    }
  },
  mounted() {
    // Pre-fill customer info if logged in
    try {
      const stored = localStorage.getItem('userInfo')
      if (stored) {
        const user = JSON.parse(stored).user
        if (user) {
          this.customerInfo.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
          this.customerInfo.phone = user.phone || ''
          this.customerInfo.email = user.email || ''
        }
      }
    } catch (e) {
      console.warn('Could not read user profile for checkout', e)
    }
  },
  methods: {
    async submitOrder() {
      if (!this.formValid) return

      this.submitting = true
      try {
        const itemsPayload = this.cartStore.items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        }))

        const payload = {
          items: itemsPayload,
          customerInfo: this.customerInfo,
          paymentMethod: this.paymentMethod,
          deliveryFeeDZD: this.deliveryFeeDZD
        }

        const res = await axios.post('api/marketplace/orders', payload)
        this.confirmedOrder = res.data.order
        this.cartStore.clearCart()
        this.orderSuccessModal = true
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la commande'
        alert(`Échec de la commande : ${errorMsg}`)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.max-w-1200 {
  max-width: 1200px;
  margin: 0 auto;
}
.sticky-top {
  position: sticky;
  top: 90px;
}
.border-b-editorial {
  border-bottom: 1px solid rgba(23, 63, 53, 0.08);
}
.border-editorial {
  border: 1px solid rgba(23, 63, 53, 0.12);
  border-radius: 12px;
}
.editorial-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.btn-editorial-primary {
  background-color: #173f35 !important;
  color: #faf8f2 !important;
  font-weight: 700;
  border-radius: 28px;
  text-transform: none;
}
</style>
