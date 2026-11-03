<template>
  <v-container class="py-10 max-w-900">
    <div class="text-center mb-8">
      <span class="editorial-tag text-sand-dark d-block mb-2">REJOINDRE LE MARCHÉ CENTRAL DE L'ARTISANAT</span>
      <h1 class="editorial-heading text-h3 font-weight-bold text-forest mb-3">
        Devenir Vendeur sur Touriva Market
      </h1>
      <p class="text-body-1 text-secondary-editorial max-w-650 mx-auto">
        Développez vos ventes d'artisanat, terroir et équipements de voyage à travers les 58 wilayas d'Algérie sur une plateforme centralisée et professionnelle.
      </p>
    </div>

    <!-- Application Form Card -->
    <v-card class="editorial-card pa-8 border-editorial">
      <div v-if="submitted" class="text-center py-8">
        <v-avatar color="forestGreen" size="80" class="mb-4 text-white">
          <v-icon size="48">mdi-check-circle-outline</v-icon>
        </v-avatar>
        <h2 class="editorial-heading text-h4 text-forest font-weight-bold mb-2">Dossier Déposé avec Succès !</h2>
        <p class="text-body-1 text-secondary-editorial mb-4">
          Votre candidature pour la boutique <strong>{{ form.storeName }}</strong> est en cours d'examen par la direction de Touriva Marketplace.
        </p>
        <p class="text-body-2 text-secondary-editorial mb-6">
          Un email et un SMS de confirmation vous seront envoyés dès validation de votre compte vendeur par l'administrateur.
        </p>
        <v-btn class="btn-editorial-primary px-8" @click="$router.push('/products')">
          Retour au Catalogue
        </v-btn>
      </div>

      <v-form v-else ref="applyForm" v-model="valid" @submit.prevent="submitApplication">
        <h2 class="editorial-heading text-h6 font-weight-bold text-forest mb-4 border-b-editorial pb-2">
          1. Informations sur votre Entreprise / Atelier
        </h2>

        <v-row dense class="mb-4">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.storeName"
              label="Nom de la Boutique / Atelier *"
              placeholder="Ex: Poterie Antique de Guelma"
              variant="outlined"
              color="forestGreen"
              :rules="[v => !!v || 'Nom de boutique requis']"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.legalRepresentativeName"
              label="Nom & Prénom du Gérant / Artisan *"
              placeholder="Ex: Yassine Khelifi"
              variant="outlined"
              color="forestGreen"
              :rules="[v => !!v || 'Nom du gérant requis']"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              v-model="form.businessCategory"
              :items="categories"
              label="Catégorie Principale d'Activité *"
              variant="outlined"
              color="forestGreen"
              :rules="[v => !!v || 'Catégorie requise']"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              v-model="form.wilaya"
              :items="algerianWilayas"
              label="Wilaya du Siège / Atelier *"
              variant="outlined"
              color="forestGreen"
              :rules="[v => !!v || 'Wilaya requise']"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.address"
              label="Adresse Complète de l'Atelier ou Magasin *"
              variant="outlined"
              color="forestGreen"
              :rules="[v => !!v || 'Adresse requise']"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.businessDescription"
              label="Description de vos créations et de votre savoir-faire *"
              placeholder="Décrivez vos spécialités, vos matières premières locales (cuir, laine, argile, dattes...) et votre capacité de production."
              variant="outlined"
              rows="3"
              color="forestGreen"
              :rules="[v => !!v || 'Description requise']"
            />
          </v-col>
        </v-row>

        <h2 class="editorial-heading text-h6 font-weight-bold text-forest mb-4 border-b-editorial pb-2">
          2. Coordonnées & Registre Professionnel
        </h2>

        <v-row dense class="mb-6">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.phone"
              label="Téléphone Professionnel (Mobile / WhatsApp) *"
              placeholder="05 / 06 / 07..."
              variant="outlined"
              color="forestGreen"
              :rules="[v => !!v || 'Téléphone requis']"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.email"
              label="Adresse Email de Contact *"
              type="email"
              variant="outlined"
              color="forestGreen"
              :rules="[v => !!v || 'Email requis', v => /.+@.+\..+/.test(v) || 'Email invalide']"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.rcNumber"
              label="N° Registre de Commerce ou Carte Artisan (Optionnel)"
              placeholder="Ex: 16/00-1234567A26 ou Carte N°..."
              variant="outlined"
              color="forestGreen"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.nifNumber"
              label="NIF / Identifiant Fiscal (Optionnel)"
              variant="outlined"
              color="forestGreen"
            />
          </v-col>
        </v-row>

        <div class="pa-4 bg-warm-ivory rounded-lg mb-6 border-editorial">
          <div class="d-flex align-center mb-1">
            <v-icon color="forestGreen" size="20" class="mr-2">mdi-shield-check-outline</v-icon>
            <span class="text-subtitle-2 font-weight-bold text-forest">Engagement Qualité & Modération</span>
          </div>
          <p class="text-caption text-secondary-editorial mb-0">
            En postulant, vous acceptez que tous les produits soumis fassent l'objet d'une validation préalable par l'administration Touriva avant leur mise en vente publique. La plateforme applique une commission transparente de 10% sur les commandes livrées.
          </p>
        </div>

        <v-btn
          type="submit"
          block
          class="btn-editorial-primary py-3"
          size="large"
          :loading="submitting"
          :disabled="submitting || !valid"
        >
          <v-icon start size="20">mdi-send</v-icon>
          Déposer mon Dossier de Vendeur
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ApplySeller',
  data() {
    return {
      valid: false,
      submitting: false,
      submitted: false,
      form: {
        storeName: '',
        legalRepresentativeName: '',
        businessCategory: 'Artisanat & Terroir',
        wilaya: 'Alger',
        address: '',
        businessDescription: '',
        phone: '',
        email: '',
        rcNumber: '',
        nifNumber: ''
      },
      categories: [
        'Artisanat & Terroir',
        'Céramique & Poterie',
        'Maroquinerie & Cuir',
        'Tissage & Tapis Traditionnels',
        'Équipements de Randonnée & Bivouac',
        'Bijoux Traditionnels & Argent',
        'Produits du Terroir & Dattes Deglet Nour'
      ],
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
  methods: {
    async submitApplication() {
      if (!this.valid) return
      this.submitting = true
      try {
        await axios.post('api/marketplace/sellers/apply', this.form)
        this.submitted = true
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la soumission'
        alert(`Échec de la soumission : ${errorMsg}`)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.max-w-900 {
  max-width: 900px;
  margin: 0 auto;
}
.max-w-650 {
  max-width: 650px;
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
