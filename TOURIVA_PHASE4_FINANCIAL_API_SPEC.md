# Touriva — Phase 4 Financial API Specification

**Specification Version:** 1.0.0  
**Date:** October 29, 2026  
**Status:** PROPOSED CONTRACT (Design Specification Only — Do Not Implement Yet)  
**Base URL:** `/api`  
**Authentication:** Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. Overview & Security Conventions

All Phase 4 endpoints adhere to the Touriva API conventions established in Phases 1–3:
- **Authentication:** All financial endpoints require authentication via `requireAuth` middleware, except where guest phone verification is explicitly permitted.
- **Multi-Tenant Authorization:** Agencies can only access financial records for bookings assigned to their agency (`agency === req.user._id`). Violations return `403 Forbidden`.
- **Tourist Privacy:** Tourists can only access financial records for their own bookings (`customer === req.user._id` or phone-verified guest). Violations return `403 Forbidden`.
- **Data Sanitization:** Internal agency notes (`agencyInternalNote`) and administrative audit history are stripped from tourist responses.
- **Idempotency:** All state-mutating endpoints (`POST`, `PATCH`) accept an optional or required `Idempotency-Key` header / payload field to prevent accidental duplicate charges.

---

## 2. API Endpoints Summary

| Endpoint | Method | Caller Roles | Description |
| :--- | :---: | :--- | :--- |
| **`/api/bookings/:id/payments/submit`** | `POST` | Tourist (Owner / Guest) | Customer submits offline payment proof & claim. |
| **`/api/bookings/:id/financials`** | `GET` | Tourist / Agency / Admin | Retrieves authoritative financial summary for a booking. |
| **`/api/bookings/:id/payments/:paymentId/proof`** | `GET` | Tourist / Agency / Admin | Secure streaming access to payment proof image/PDF. |
| **`/api/agency/bookings/:id/payments`** | `POST` | Agency Manager / Staff | Agency records verified in-person cash or wire payment. |
| **`/api/agency/payments/:id/verify`** | `PATCH` | Agency Manager / Admin | Agency verifies and credits submitted payment proof. |
| **`/api/agency/payments/:id/reject`** | `PATCH` | Agency Manager / Admin | Agency rejects invalid payment proof with reason. |
| **`/api/agency/payments`** | `GET` | Agency / Admin | Lists all payment records with filters & pagination. |
| **`/api/agency/financials/dashboard`** | `GET` | Agency / Admin | Retrieves aggregated financial KPI summary & charts. |
| **`/api/bookings/:id/refunds/request`** | `POST` | Tourist (Owner) | Customer requests a refund for a cancelled booking. |
| **`/api/agency/refunds/:id/approve`** | `PATCH` | Agency Manager / Admin | Agency approves and schedules refund processing. |
| **`/api/agency/refunds/:id/complete`** | `PATCH` | Agency Manager / Admin | Agency marks refund completed (disbursed). |
| **`/api/agency/refunds/:id/reject`** | `PATCH` | Agency Manager / Admin | Agency rejects refund request with policy reason. |
| **`/api/agency/refunds`** | `GET` | Agency / Admin | Lists all refund requests & transactions. |

---

## 3. Endpoint Specifications

### 3.1 Customer Payment Proof Submission
Allows a customer to claim an offline payment and submit proof (CCP slip, BaridiMob screenshot, bank wire receipt).

- **Route:** `POST /api/bookings/:id/payments/submit`
- **Caller Role:** Authenticated Tourist (`client`) or Phone-Verified Guest
- **Content-Type:** `multipart/form-data`
- **Request Fields:**
  - `amountDZD` (Number, required, integer >= 1)
  - `method` (String, required, enum: `['ccp', 'baridimob', 'bank_transfer', 'cash', 'other']`)
  - `transactionReference` (String, optional, e.g. receipt number)
  - `customerNote` (String, optional, max 500 chars)
  - `idempotencyKey` (String, optional)
  - `proofFile` (Binary file, required, max 5MB, MIME: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`)
- **Validation Rules:**
  - Booking must exist and have operational status in `['pending', 'confirmed']`.
  - Amount must not exceed `booking.balanceDueDZD`.
  - File must pass magic-number MIME validation.
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Payment proof submitted successfully. Awaiting agency review.",
    "payment": {
      "_id": "6720f1234567890abcdef123",
      "paymentReference": "TRV-PAY-A1B2C3D4",
      "booking": "6720f9876543210fedcba987",
      "amountDZD": 15000,
      "currency": "DZD",
      "method": "baridimob",
      "status": "submitted",
      "transactionReference": "TXN-98765432",
      "paymentDate": "2026-10-29T14:30:00.000Z",
      "customerNote": "Payé via BaridiMob ce matin"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"error": "Payment amount (25000 DZD) exceeds outstanding balance (15000 DZD)"}`
  - `401 Unauthorized`: `{"error": "Authorization token required"}`
  - `403 Forbidden`: `{"error": "Access forbidden: You cannot submit payments for another customer's booking"}`
  - `404 Not Found`: `{"error": "Booking not found"}`
  - `413 Payload Too Large`: `{"error": "Proof document exceeds 5MB size limit"}`
  - `415 Unsupported Media Type`: `{"error": "Allowed document types: JPEG, PNG, WebP, PDF"}`

---

### 3.2 Agency Direct Payment Recording (In-Person / Verified Offline)
Allows an agency manager or desk staff to record a payment that is immediately verified (e.g. cash at counter, verified agency wire).

- **Route:** `POST /api/agency/bookings/:id/payments`
- **Caller Role:** Authenticated Agency Partner (`partner`, verified) or Administrator
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "amountDZD": 20000,
    "method": "cash",
    "paymentDate": "2026-10-29T10:00:00.000Z",
    "transactionReference": "RECU-ESPECES-0042",
    "agencyInternalNote": "Versé en espèces à l'agence d'Alger",
    "customerNote": "Reçu remis au voyageur",
    "idempotencyKey": "desk-cash-2026-10-29-001"
  }
  ```
- **Authorization & Invariants:**
  - Caller must own the booking (`booking.agency === req.user._id`) or be an admin.
  - Payment is created in status `verified`.
  - `verifiedBy` and `recordedBy` are set to `req.user._id`.
  - Booking's `totalPaidDZD`, `balanceDueDZD`, and `financialStatus` are updated atomically.
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Payment recorded and verified successfully",
    "payment": {
      "_id": "6720f1112223334445556667",
      "paymentReference": "TRV-PAY-E5F6G7H8",
      "amountDZD": 20000,
      "status": "verified",
      "method": "cash",
      "verifiedAt": "2026-10-29T10:05:00.000Z"
    },
    "bookingSummary": {
      "bookingReference": "TRV-BKG-99887766",
      "totalPriceDZD": 40000,
      "totalPaidDZD": 20000,
      "balanceDueDZD": 20000,
      "financialStatus": "partially_paid"
    }
  }
  ```

---

### 3.3 Agency Verifies Submitted Payment Proof
Agency manager verifies a customer's submitted proof against the bank/CCP statement.

- **Route:** `PATCH /api/agency/payments/:id/verify`
- **Caller Role:** Agency Manager / Administrator
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "verifiedAmountDZD": 15000,
    "agencyInternalNote": "Montant vérifié sur le relevé CCP N° 23984",
    "note": "Paiement conforme validé"
  }
  ```
- **Validation & Business Logic:**
  - Payment must be in status `submitted`.
  - Verified amount must be integer >= 1.
  - Transitions payment to `verified`, sets `verifiedAt` and `verifiedBy`.
  - Calls `recalculateBookingFinancials(payment.booking)`.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Payment verified and credited to booking",
    "payment": {
      "_id": "6720f1234567890abcdef123",
      "status": "verified",
      "verifiedAt": "2026-10-29T15:00:00.000Z"
    },
    "booking": {
      "totalPaidDZD": 35000,
      "balanceDueDZD": 5000,
      "financialStatus": "partially_paid"
    }
  }
  ```

---

### 3.4 Agency Rejects Payment Proof
Agency marks a submitted proof invalid (e.g. illegible slip, wrong account, unverified transfer).

- **Route:** `PATCH /api/agency/payments/:id/reject`
- **Caller Role:** Agency Manager / Administrator
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "rejectionReason": "Récépissé CCP illisible. Le numéro de virement et la date ne sont pas visibles.",
    "agencyInternalNote": "Contacté le client par téléphone pour réémission du reçu."
  }
  ```
- **Validation:**
  - `rejectionReason` is mandatory (min 10 characters).
  - Transitions payment to `rejected`.
  - Zero funds are credited to the booking.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Payment proof rejected",
    "payment": {
      "_id": "6720f1234567890abcdef123",
      "status": "rejected",
      "rejectionReason": "Récépissé CCP illisible...",
      "rejectedAt": "2026-10-29T15:10:00.000Z"
    }
  }
  ```

---

### 3.5 Booking Financial Summary & History
Retrieves authoritative financial status, breakdown, payment ledger, and refund history for a booking.

- **Route:** `GET /api/bookings/:id/financials`
- **Caller Role:** Customer Owner / Owning Agency / Administrator
- **Query Params:** none
- **Access Control:**
  - Customer receives sanitized view (agency internal notes omitted).
  - Agency/Admin receives full financial audit detail.
- **Success Response (200 OK):**
  ```json
  {
    "booking": {
      "bookingReference": "TRV-BKG-E12F49AC",
      "status": "confirmed",
      "currency": "DZD",
      "unitPriceDZD": 20000,
      "seats": 2,
      "totalPriceDZD": 40000,
      "totalPaidDZD": 40000,
      "totalRefundedDZD": 0,
      "netPaidDZD": 40000,
      "balanceDueDZD": 0,
      "financialStatus": "paid",
      "paymentDueDate": "2026-11-05T00:00:00.000Z"
    },
    "payments": [
      {
        "_id": "6720f111...",
        "paymentReference": "TRV-PAY-11223344",
        "amountDZD": 20000,
        "method": "ccp",
        "status": "verified",
        "paymentDate": "2026-10-25T10:00:00.000Z",
        "transactionReference": "CCP-87654321",
        "hasProof": true
      },
      {
        "_id": "6720f222...",
        "paymentReference": "TRV-PAY-55667788",
        "amountDZD": 20000,
        "method": "cash",
        "status": "verified",
        "paymentDate": "2026-10-28T14:30:00.000Z",
        "transactionReference": "RECU-0091",
        "hasProof": false
      }
    ],
    "refunds": []
  }
  ```

---

### 3.6 Secure Payment Proof Streaming
Streams the stored payment proof file.

- **Route:** `GET /api/bookings/:bookingId/payments/:paymentId/proof`
- **Caller Role:** Customer Owner, Owning Agency, Administrator
- **Response Headers:**
  - `Content-Type: image/jpeg` (or matching stored MIME)
  - `Content-Disposition: inline; filename="proof-TRV-PAY-XXXXXXXX.jpg"`
  - `Cache-Control: private, no-cache, no-store, must-revalidate`
- **Security:**
  - File stream is piped directly from `backend/uploads/payment_proofs/`.
  - Non-owners receive `403 Forbidden`.

---

### 3.7 Agency Financial Dashboard Aggregation
Provides aggregated financial KPIs for agency reporting and tax compliance.

- **Route:** `GET /api/agency/financials/dashboard`
- **Caller Role:** Authenticated Agency Partner or Administrator
- **Query Params:**
  - `startDate` (ISO Date, optional)
  - `endDate` (ISO Date, optional)
  - `departureId` (ObjectId, optional)
- **Success Response (200 OK):**
  ```json
  {
    "summary": {
      "currency": "DZD",
      "grossBookedValueDZD": 1850000,
      "totalCollectedDZD": 1420000,
      "totalRefundedDZD": 60000,
      "netRevenueDZD": 1360000,
      "outstandingReceivablesDZD": 430000,
      "activeBookingsCount": 42,
      "unpaidBookingsCount": 6,
      "partiallyPaidBookingsCount": 11,
      "fullyPaidBookingsCount": 25
    },
    "byMethod": {
      "cash": { "amountDZD": 650000, "count": 18 },
      "ccp": { "amountDZD": 420000, "count": 12 },
      "baridimob": { "amountDZD": 350000, "count": 10 }
    },
    "recentTransactions": [ ... ]
  }
  ```

---

### 3.8 Refund Management Endpoints

#### 3.8.1 Customer Requests Refund
- **Route:** `POST /api/bookings/:id/refunds/request`
- **Caller Role:** Customer Owner
- **Body:** `{ "amountDZD": 20000, "reason": "Annulation du voyage", "method": "ccp", "customerNote": "RIB CCP: 00213..." }`
- **Constraints:** Booking must be `cancelled` or `rejected`. `amountDZD <= booking.netPaidDZD`.

#### 3.8.2 Agency Approves & Completes Refund
- **Route:** `PATCH /api/agency/refunds/:id/complete`
- **Caller Role:** Agency Manager / Administrator
- **Body:** `{ "amountDZD": 20000, "cancellationFeeDZD": 2000, "transactionReference": "VIR-CCP-9901", "internalNote": "Remboursement déduction faite des frais d'annulation de 10%" }`
- **Effect:** Sets status to `completed`, updates `totalRefundedDZD` and `netPaidDZD`.
