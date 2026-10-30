# Touriva — Travel Agency Client Demo Presentation Checklist

**Target Audience:** Algerian Travel Agency Owners, General Managers, and Tour Operators  
**Standard Demo Duration:** 20 Minutes  
**Demonstration Budget:** **0 DA (Zero Cost)**  
**Version:** October 2026

---

## 1. Pre-Demo Setup Checklist (T-15 to T-0 Minutes)

Complete these checks prior to welcoming prospective clients:

```
+----------------------------------------------------------------------------------------------------+
|                                      PRE-FLIGHT SETUP TIMELINE                                     |
+-------------+------------------------------------+-------------------------------------------------+
| Time Window | Action                             | Verification Check                              |
+-------------+------------------------------------+-------------------------------------------------+
| T-15 min    | Pre-warm Render Backend            | Open: https://touriva-api.onrender.com/api/health|
|             | (Prevents 45s cold start delay)    | Must return: {"status":"ok","database":"conn.."} |
|             |                                    |                                                 |
| T-10 min    | Prepare Dual Browser Profiles      | Window 1 (Normal): Agency Director Portal       |
|             | (Enables instant role switching)   | Window 2 (Incognito): Traveler / Tourist View   |
|             |                                    |                                                 |
| T-7 min     | Authenticate Agency Account        | Login at: https://touriva-web.onrender.com/agency|
|             |                                    | User: agency@touriva.test | Pass: Password123!   |
|             |                                    |                                                 |
| T-5 min     | Prepare Test Receipt Asset         | Have a sample BaridiMob receipt screenshot      |
|             |                                    | ready on your desktop (e.g., sample_receipt.png)|
|             |                                    |                                                 |
| T-2 min     | Screen & Display Optimization      | Set browser zoom to 100% or 110% on 1080p screen|
|             |                                    | Close personal tabs, notifications & messaging  |
+-------------+------------------------------------+-------------------------------------------------+
```

---

## 2. 20-Minute Structured Client Presentation Script

### Minute 0:00 – 4:00 | The Algerian Tourism Challenge & Discovery Experience
- **Perspective**: Traveler Experience
- **Portal**: Touriva Client Web (`https://touriva-web.onrender.com` or local `http://localhost:2020`)
- **Pitch Dialogue**:
  > *"Bonjour et bienvenue. En tant qu'agence de voyages en Algérie, vous connaissez le défi quotidien : les clients découvrent vos circuits sur les réseaux sociaux, mais la gestion se perd dans des centaines de messages WhatsApp, des captures d'écran de virements introuvables et des tableurs Excel dispersés.*  
  > *Touriva a été conçue sur mesure pour le marché algérien : une plateforme nationale bilingue et souveraine qui valorise votre agence et automatise votre gestion sans dépendre de solutions étrangères inadaptées."*
- **Action on Screen**:
  1. Browse the excursion catalog: filter by **Wilaya (Béchar / Taghit)**.
  2. Open the **"Taghit Dunes & Saoura Valley Cultural Expedition"**.
  3. Highlight:
     - Clear daily itinerary (Dunes, Ksar, Gravures rupestres, Oasis).
     - Package inclusions (Transport 4x4, Pension complète, Guide agréé).
     - Clear pricing in Algerian Dinars (`28 500 DA`).
     - Real-time departure calendar with remaining seats.

---

### Minute 4:00 – 8:00 | Agency Control Room & Operational Manifests
- **Perspective**: Agency Director / Operations Manager
- **Portal**: Touriva Agency Portal (`/agency/dashboard` & `/agency/departures`)
- **Login**: `agency@touriva.test` / `Password123!` (**Numidia Voyages**)
- **Pitch Dialogue**:
  > *"Voyons maintenant votre espace de gestion agence. Dès votre connexion, vous visualisez l'état de vos départs et la rentabilité de chaque expédition.*  
  > *Fini les listes de passagers recopiées à la main pour le chauffeur ou les barrages de contrôle. Touriva génère votre manifeste officiel en un clic."*
- **Action on Screen**:
  1. Open **"Gestion des Départs"** (`/agency/departures`).
  2. Show the upcoming departure: **Capacité 16 places | 12 réservées | 4 disponibles**.
  3. Click **"Voir Manifeste / Liste des Passagers"**:
     - Point out traveler identities, pickup points, phone numbers, and emergency contacts.
     - Click **"Imprimer le Manifeste"** to show the official attendance printout designed for tour leaders and road checkpoint formalities.

---

### Minute 8:00 – 14:00 | Booking Intake & Multi-Channel Algerian Settlement (Phase 4)
- **Perspective**: Dual Role (Traveler Booking -> Agency Financial Audit)
- **Portals**: Traveler Window & Agency Financials (`/agency/financials`)
- **Pitch Dialogue**:
  > *"Voici l'innovation majeure de Touriva : nous ne forçons pas vos clients à posséder une carte de crédit internationale ou un compte bancaire complexe. Touriva gère la réalité du terrain algérien : BaridiMob, CCP, virement bancaire et règlement physique en espèces à votre comptoir."*
- **Action on Screen**:
  1. **Step 1 (Traveler)**: Switch to traveler window. Book 2 seats on the Taghit departure.
     - Show the generated booking reference: `TRV-XXXXXXXX`.
     - Point out the deposit instruction: `Acompte requis : 10 000 DA` via BaridiMob.
  2. **Step 2 (Traveler)**: Click **"Déposer le Reçu BaridiMob"**.
     - Fill in sender phone (`0550000010`) and transaction code (`MOB-882190`).
     - Upload receipt screenshot. Submit.
     - *Demonstrate*: Status is now `deposit_pending`, but authoritative paid total remains 0 DA until agency verification.
  3. **Step 3 (Agency Director)**: Switch back to Agency Portal -> **"Grand Livre & Finances"** (`/agency/financials`).
     - The traveler's receipt appears in **"Règlements en attente de vérification"**.
     - Click **"Auditer le Reçu"** to view uploaded proof and compare reference.
     - Click **"Valider le Paiement"**.
     - Instantly show the booking shift to `deposit_paid` and the 10,000 DA flow into your collected balance.
  4. **Step 4 (In-Agency Cash Desk)**: Click **"Encaisser en Espèces"**.
     - Record `15 000 DA` paid directly in cash at agency desk.
     - The Grand Livre immediately updates with `Méthode : Espèces (Comptoir)`.

---

### Minute 14:00 – 17:00 | The "Grand Livre" Financial Ledger & Security
- **Perspective**: Agency Director / Financial Controller
- **Portal**: `/agency/financials`
- **Pitch Dialogue**:
  > *"Grâce au Grand Livre Touriva, vous avez à chaque instant une visibilité financière absolue. Vous savez exactement combien vous avez encaissé en BaridiMob, combien en espèces au comptoir, et quel solde reste à percevoir avant le départ du bus."*
- **Action on Screen**:
  1. Inspect the four financial KPI cards:
     - **Total Encaissements**: Cumulative verified funds.
     - **Soldes Restants Dus**: Authoritative receivables from travelers.
     - **Règlements en Attente**: Unverified customer submissions.
  2. Demonstrate receipt rejection:
     - Show an invalid or unreadable submission.
     - Click **"Rejeter avec motif"** (e.g., *"Montant incomplet ou référence illisible"*).
     - Note: Touriva logs rejection reasons and notifies the client without corrupting your accounting totals.

---

### Minute 17:00 – 20:00 | Commercial Wrap-up, Accreditation & Q&A
- **Pitch Dialogue**:
  > *"Touriva n'est pas un intermédiaire qui confisque vos fonds. Vous encaissez directement vos paiements sur votre BaridiMob ou à votre agence. Touriva vous fournit l'infrastructure logicielle, la visibilité nationale et la conformité administrative.*  
  > *Nous ouvrons actuellement notre programme pilote réservé à un groupe restreint d'agences agréées. Souhaitez-vous que nous configurions le profil de votre agence dès aujourd'hui ?"*
- **Next Action**:
  - Hand over agency onboarding document.
  - Schedule date for package catalog seeding.

---

## 3. "What to Say" vs. "What NOT to Say" Golden Rules

To maintain credibility and avoid unmet expectations, follow these presentation rules:

| Topic | What to Say (Approved Messaging) | What NOT to Say (Prohibited Claims) |
|:---|:---|:---|
| **Payment Gateways** | *"Touriva supports realistic Algerian settlement methods: BaridiMob, CCP, and direct cash at your desk, verified by your staff."* | *"Touriva has automated SATIM / CIB bank clearing with instant card debits."* (False — SATIM requires interbank contracts). |
| **Payment Proofs** | *"Uploading a screenshot notifies you for review. A receipt never counts as verified revenue until your agency confirms it."* | *"A traveler uploading a screenshot automatically marks the booking as paid."* (Violates financial integrity). |
| **Booking vs. Payment** | *"You can confirm a client's seat immediately while waiting for their deposit, or enforce payment first — the choice is yours."* | *"Bookings must be paid in full at the moment of reservation."* |
| **Maps & Hosting** | *"We use an open-source mapping stack (OpenStreetMap) with zero recurring foreign API costs or data privacy concerns."* | *"We run an enterprise Google Maps / AWS cluster with paid licenses."* |
| **Data Security** | *"All agency booking records and passenger manifests belong exclusively to your agency and are not shared with competitors."* | *"Touriva sells customer data to third-party travel promoters."* |

---

## 4. Troubleshooting & Contingency Protocol

| Incident During Demo | Root Cause | Immediate Action |
|:---|:---|:---|
| **Page hangs on first load** | Render Free instance cold start (container spin-up takes ~40s). | *"The cloud environment is initializing secure container connections..."* Continue verbal introduction while page finishes loading. (Prevent this by pre-warming at T-15 min). |
| **Uploaded receipt shows broken image after restart** | Ephemeral storage on Render Free tier erases `backend/uploads/` when the instance sleeps. | Point to the pre-seeded verified financial ledger records: *"All financial totals, references, and audit timestamps remain permanent in the database."* For live upload demos, keep the session hot. |
| **Client venue has weak Wi-Fi** | Local internet connection drops during presentation. | **Switch instantly to Local Demo**: Open terminal, run `npm run dev` in `backend` and `frontEnd/touriva`, then navigate to `http://localhost:2020`. Zero internet connection required. |
| **Client asks for Arabic interface** | Agency director prefers Arabic. | Click language selector in top navigation bar and select **العربية**. Show that the full layout switches to native Arabic with correct RTL alignment. |

---

## 5. Demonstration Quick Reference Card

```
+----------------------------------------------------------------------------------------------------+
|                                    DEMO QUICK REFERENCE CARD                                       |
+---------------------+------------------------------------------------------------------------------+
| Public Web Client   | https://touriva-web.onrender.com (Local: http://localhost:2020)              |
| Agency Portal       | https://touriva-web.onrender.com/agency (Direct shortcut: /agency/dashboard) |
| Admin Portal        | https://touriva-admin.onrender.com (Local: http://localhost:2021)            |
| Primary Agency User | agency@touriva.test                                                          |
| Primary Tourist User| customer@touriva.test                                                        |
| Universal Password  | Password123!                                                                 |
| Primary Test Trip   | Taghit Dunes & Saoura Valley Cultural Expedition                             |
| Sample BaridiMob Ref| MOB-994821                                                                   |
| Recommended Flow    | Browse Trip -> Book Seats -> Upload Receipt -> Audit & Approve in Ledger     |
+---------------------+------------------------------------------------------------------------------+
```
