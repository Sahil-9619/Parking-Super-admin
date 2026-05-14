# ParkPal — Project Context for AI Assistant

You are working on **ParkPal**, a unified smart parking marketplace app. Always refer to this document before writing any code, suggesting architecture, or answering questions about the project.

---

## 1. Project Overview

**App Name:** ParkPal – Smart Parking Marketplace  
**Type:** Mobile app (Flutter) + Admin web panel (React.js)  
**Backend:** Node.js + Express REST API  
**Database:** PostgreSQL + PostGIS extension  
**Maps:** Google Maps API  
**Payments:** Razorpay (wallet top-up + Razorpay Payouts for owner settlements)  
**Push Notifications:** Firebase FCM  
**SMS / OTP:** MSG91  
**File Storage:** AWS S3 (presigned URL upload pattern)  
**Cache:** Redis (slot count cache, session cache)

---

## 2. Three Panels — Scope

### Panel 1 — User App (Flutter)
Driver-facing. Search map, book slot, pay via wallet, QR check-in, rate parking.

### Panel 2 — Owner App (Flutter — separate binary)
All parking providers use this one app. Owner type selected at onboarding:
- `home` — private home owner
- `society` — apartment/housing society admin
- `commercial` — parking lot business
- `govt` — government institution / college (off-peak hours)
- `municipality` — road/street parking managed by municipal body

Add-on services (car wash, EV charging) are managed directly by the parking owner. There are no third-party partner accounts.

### Panel 3 — Admin Panel (React.js web)
Internal ParkPal team only. Approves listings, manages disputes, runs payouts, views reports.  
Roles: `super_admin` (full access) and `ops_staff` (read + dispute resolve only). All admins reside in the unified `users` table with `user_type = 'admin'`.

---

## 3. Parking Types on Map

| Type | Owner Type | Map Pin | Phase |
|------|-----------|---------|-------|
| Home parking | `home` | Blue | Phase 1 |
| Society parking | `society` | Teal | Phase 1 |
| Commercial parking | `commercial` | Purple | Phase 1 |
| Govt / College | `govt` | Orange | Phase 2 |
| Road / Municipality | `municipality` | Red | Phase 2 |

Each type has a **different map pin icon and color**. Implemented via Google Maps custom markers.

---

## 4. Key Design Decisions — Never Deviate From These

1. **Municipality is NOT a separate panel.** Municipality officers use the Owner app with `owner_type = municipality`. No separate app or portal.

2. **Add-on services are entirely owner-provided per listing.** Owner toggles which services (car wash, EV charging, tyre inflation) are available and provided directly by them at their parking lot. Users see these on the booking screen. There are no external third-party add-on partners.

3. **Vehicle type is owner-defined.** Owner selects which vehicle types their parking accepts: `bike`, `car`, `commercial` — any combination. Each enabled type has its own slot count and per-hour price. Users are filtered accordingly on map search.

4. **Wallet is the only payment method.** Users must add money to wallet first. All bookings deduct from wallet. No direct card/UPI payment at booking time.

5. **All booking creation is atomic.** One DB transaction: wallet deduct + slot decrement + commission split + QR generate. Rollback on any failure. Use PostgreSQL `FOR UPDATE` lock on slot row to prevent race conditions.

6. **20% commission on every transaction.** App takes 20% of booking amount and 20% of every add-on amount. Owner gets 80%. Configurable by super_admin. Per-owner override possible.

7. **Weekly payout every Wednesday.** Covers Mon–Sun of previous week. Mon–Tue = reconciliation window. Minimum payout ₹100 (carry forward if below). Via Razorpay Payouts API → NEFT/IMPS to owner bank.

8. **PostGIS is mandatory for geo queries.** Location stored as PostGIS `GEOGRAPHY(POINT)`. Nearby search uses `ST_DWithin`. Never use manual lat/lon math.

9. **QR-based check-in/out.** Owner scans user QR at entry (check-in) and exit (check-out). QR encodes `booking_id + qr_token`. Backend validates both. This is the only proof-of-attendance mechanism.

10. **No negative wallet balance ever.** If overstay charge exceeds balance → flag booking for admin, notify both parties. Do not go negative.

11. **Unified User Authentication.** Drivers, Owners, and Admins share a single `users` table. Registration requires Name, Email, Password, Phone Number, and OTP verification. Logging in can be done seamlessly via direct Mobile Number + OTP verification or Email + Password.

---

## 5. Database Schema

### Core Tables

```sql
-- All users (drivers, owners, admin)
users (
  id UUID PK,
  phone VARCHAR UNIQUE,   -- OTP login identifier
  email VARCHAR UNIQUE,
  password_hash VARCHAR,  -- Secure hash for email+password login
  name VARCHAR,
  user_type ENUM('driver','owner','admin'),
  admin_role ENUM('super_admin','ops_staff'), -- Nullable, used only if user_type = 'admin'
  wallet_balance DECIMAL DEFAULT 0,
  status ENUM('active','suspended','banned') DEFAULT 'active',
  created_at TIMESTAMP
)

-- Owner-specific profile
owner_profiles (
  id UUID PK,
  user_id UUID FK → users,
  owner_type ENUM('home','society','commercial','govt','municipality'),
  bank_account VARCHAR,   -- AES-256 encrypted
  bank_ifsc VARCHAR,      -- AES-256 encrypted
  account_holder_name VARCHAR,
  gst_number VARCHAR,
  strike_count INT DEFAULT 0
)

-- User vehicles
vehicles (
  id UUID PK,
  user_id UUID FK → users,
  vehicle_type ENUM('bike','car','commercial'),
  reg_number VARCHAR,
  is_active BOOLEAN DEFAULT false
)

-- Parking listings
parkings (
  id UUID PK,
  owner_id UUID FK → users,
  name VARCHAR,
  parking_type ENUM('home','society','commercial','govt','municipality'),
  location GEOGRAPHY(POINT,4326),  -- PostGIS. INDEX: GIST
  address TEXT,
  photos TEXT[],           -- S3 URLs array
  open_time TIME,
  close_time TIME,
  is_24hr BOOLEAN DEFAULT false,
  status ENUM('pending','active','paused','banned') DEFAULT 'pending',
  avg_rating DECIMAL DEFAULT 0,
  addons_enabled TEXT[],   -- ['car_wash','ev_charging']
  is_full BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  reopen_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Slots per vehicle type per parking
parking_slots (
  id UUID PK,
  parking_id UUID FK → parkings,
  vehicle_type ENUM('bike','car','commercial'),
  total_slots INT,
  available_slots INT      -- decremented on booking, incremented on checkout/cancel
)

-- Dynamic pricing rules
pricing_rules (
  id UUID PK,
  parking_id UUID FK → parkings,
  vehicle_type ENUM('bike','car','commercial'),
  weekday_price DECIMAL,
  weekend_price DECIMAL,
  peak_rules JSONB         -- [{"start_time":"09:00","end_time":"11:00","price":80}] max 3
)

-- Core booking record
bookings (
  id UUID PK,
  user_id UUID FK → users,
  parking_id UUID FK → parkings,
  vehicle_type ENUM('bike','car','commercial'),
  start_time TIMESTAMP,
  end_time TIMESTAMP,      -- original booked end
  actual_end TIMESTAMP,    -- real checkout time
  gross_amount DECIMAL,
  commission DECIMAL,      -- 20% of gross
  owner_share DECIMAL,     -- 80% of gross
  overstay_amount DECIMAL DEFAULT 0,
  total_charged DECIMAL,   -- gross + overstay
  status ENUM('confirmed','active','completed','cancelled'),
  checkin_at TIMESTAMP,
  checkout_at TIMESTAMP,
  qr_token VARCHAR UNIQUE,
  created_at TIMESTAMP
)

-- Wallet ledger — every credit/debit
wallet_txns (
  id UUID PK,
  user_id UUID FK → users,
  type ENUM('credit','debit','refund','overstay_charge','payout'),
  amount DECIMAL,
  reference_id UUID,       -- booking_id or payout_id
  reference_type VARCHAR,
  description VARCHAR,     -- human-readable label shown to user
  balance_after DECIMAL,
  created_at TIMESTAMP
)

-- Weekly owner payouts
payouts (
  id UUID PK,
  owner_id UUID FK → users,
  week_start DATE,
  week_end DATE,
  gross_amount DECIMAL,
  commission DECIMAL,
  net_amount DECIMAL,
  dispute_hold DECIMAL DEFAULT 0,
  final_payout DECIMAL,    -- net - dispute_hold
  status ENUM('pending','processing','transferred','failed'),
  utr_number VARCHAR,
  processed_at TIMESTAMP
)

-- Disputes
disputes (
  id UUID PK,
  booking_id UUID FK → bookings,
  raised_by UUID FK → users,
  raised_by_type ENUM('driver','owner'),
  reason VARCHAR,
  description TEXT,
  status ENUM('open','reviewing','resolved'),
  resolution ENUM('full_refund','partial_refund','no_refund','owner_penalty'),
  refund_amount DECIMAL,
  admin_note TEXT,
  created_at TIMESTAMP,
  resolved_at TIMESTAMP
)

-- Add-on service bookings (Owner provided)
addon_bookings (
  id UUID PK,
  booking_id UUID FK → bookings,
  addon_type ENUM('car_wash','ev_charging','tyre_inflation'),
  service_level VARCHAR,   -- 'basic','premium' etc
  amount DECIMAL,
  commission DECIMAL,      -- 20% of amount
  owner_share DECIMAL,     -- 80% of amount credited to parking owner
  status ENUM('pending','in_progress','completed'),
  created_at TIMESTAMP
)

-- Reviews
reviews (
  id UUID PK,
  booking_id UUID FK → bookings,
  reviewer_id UUID FK → users,
  target_id UUID,          -- parking_id or addon_booking_id
  target_type ENUM('parking','addon'),
  rating INT,              -- 1 to 5
  comment TEXT,
  created_at TIMESTAMP
)
```

---

## 6. Complete API Reference

### Base URL
```
https://api.parkpal.in/v1
```

### Auth Headers
```
Authorization: Bearer <access_token>   # all protected endpoints
Content-Type: application/json
```

### Response Envelope
```json
// Success
{ "success": true, "data": { ... }, "message": "ok" }

// Error
{ "success": false, "error": { "code": "ERR_CODE", "message": "Human readable" } }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150 } }
```

---

### MODULE 1 — Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Step 1 Registration: `{name, email, password, phone, user_type}` → sends OTP |
| POST | `/auth/verify-register-otp` | Public | Step 2 Registration: verify OTP `{phone, otp}` → activates account & returns tokens |
| POST | `/auth/login-otp/send` | Public | Direct Mobile Login: `{phone}` → sends OTP |
| POST | `/auth/login-otp/verify` | Public | Verify Mobile Login: `{phone, otp}` → returns `access_token`, `refresh_token`, `user` |
| POST | `/auth/login-password` | Public | Email/Password Login: `{email, password}` → returns tokens |
| POST | `/auth/refresh-token` | Refresh token | Get new access token. Body: `{refresh_token}` |
| POST | `/auth/logout` | Bearer | Invalidate refresh token session |

---

### MODULE 2 — User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/profile` | Bearer | Get own profile + wallet balance |
| PUT | `/user/profile` | Bearer | Update name, email |
| GET | `/user/vehicles` | Bearer | List all vehicles |
| POST | `/user/vehicles` | Bearer | Add vehicle. Body: `{reg_number, vehicle_type}` |
| PUT | `/user/vehicles/:id` | Bearer | Update reg number |
| PUT | `/user/vehicles/:id/set-active` | Bearer | Set as active vehicle (affects map filter) |
| DELETE | `/user/vehicles/:id` | Bearer | Remove vehicle |

---

### MODULE 3 — Owner Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/owner/profile` | Bearer | Owner profile including owner_type, strike_count |
| PUT | `/owner/profile` | Bearer | Update name, owner_type (before first listing approved), gst_number |
| PUT | `/owner/bank-details` | Bearer | Set bank account + IFSC (encrypted). Required before listing goes live. |
| GET | `/owner/bank-details` | Bearer | Get bank details (last4 digits only) |

---

### MODULE 4 — Parking Listings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/owner/parkings` | Bearer | Create listing (status=pending). Body: `{name, parking_type, address, lat, lon, open_time, close_time, is_24hr}` |
| GET | `/owner/parkings` | Bearer | List own parkings. Query: `?status&page&limit` |
| GET | `/owner/parkings/:id` | Bearer | Full listing detail |
| PUT | `/owner/parkings/:id` | Bearer | Update listing info |
| DELETE | `/owner/parkings/:id` | Bearer | Soft delete (only if no future bookings) |
| PUT | `/owner/parkings/:id/mark-full` | Bearer | Body: `{is_full: true/false}`. Instantly hides/shows on map. |
| PUT | `/owner/parkings/:id/mark-closed` | Bearer | Body: `{is_closed: true, reopen_at: "ISO datetime"}` |
| PUT | `/owner/parkings/:id/addons` | Bearer | Body: `{addons_enabled: ["car_wash"]}`. Enable add-ons for this parking. |
| POST | `/owner/parkings/:id/photos/presign` | Bearer | Get S3 presigned URLs. Body: `{file_count, file_types:[]}` |
| POST | `/owner/parkings/:id/photos/confirm` | Bearer | Confirm S3 upload. Body: `{keys:[]}` |
| DELETE | `/owner/parkings/:id/photos/:photo_id` | Bearer | Remove a photo |

---

### MODULE 5 — Slots & Pricing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/owner/parkings/:id/slots` | Bearer | Get slot config |
| PUT | `/owner/parkings/:id/slots` | Bearer | Set slots per vehicle type. Body: `{slots: [{vehicle_type, total_slots}]}`. total_slots=0 = not accepted. |
| GET | `/owner/parkings/:id/slots/live` | Bearer | Real-time available counts |
| GET | `/owner/parkings/:id/pricing` | Bearer | Full pricing config |
| PUT | `/owner/parkings/:id/pricing` | Bearer | Set pricing rules. Body: `{pricing: [{vehicle_type, weekday_price, weekend_price, peak_rules:[{start_time, end_time, price}]}]}` |
| GET | `/owner/parkings/:id/pricing/preview` | Bearer | Price at a given moment. Query: `?vehicle_type&date&time` |

---

### MODULE 6 — User Map & Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/parkings/nearby` | Bearer | PostGIS radius search. Query: `?lat&lon&radius&vehicle_type&type&sort&page&limit` |
| GET | `/parkings/:id` | Bearer | Full parking detail + per-vehicle-type slots and current price |
| GET | `/parkings/:id/slots/live` | Bearer | Real-time slot availability. Call fresh on booking screen open. |
| GET | `/parkings/:id/price-estimate` | Bearer | Price estimate for a time window. Query: `?vehicle_type&start&end` |
| GET | `/parkings/:id/addons` | Bearer | Available add-on services for this parking |
| GET | `/parkings/:id/reviews` | Bearer | Public reviews. Query: `?page&limit` |

---

### MODULE 7 — Wallet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/wallet` | Bearer | Current balance |
| GET | `/user/wallet/transactions` | Bearer | Ledger. Query: `?page&limit&type` |
| POST | `/user/wallet/topup/initiate` | Bearer | Step 1: Create Razorpay order. Body: `{amount}`. Min ₹100, max ₹10,000. |
| POST | `/user/wallet/topup/verify` | Bearer | Step 2: Verify Razorpay HMAC. Body: `{razorpay_order_id, razorpay_payment_id, razorpay_signature}`. Credits wallet. |

---

### MODULE 8 — Booking

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookings` | Bearer | **Atomic:** wallet deduct + slot lock + commission split + QR generate. Body: `{parking_id, vehicle_type, start_time, end_time, addons:[{addon_type, service_level}]}` |
| GET | `/bookings` | Bearer | User's bookings. Query: `?status&page&limit` |
| GET | `/bookings/:id` | Bearer | Full booking detail |
| GET | `/bookings/:id/qr` | Bearer | QR token + base64 image for display |
| POST | `/bookings/:id/cancel` | Bearer | Auto-applies refund policy. Cannot cancel if already checked in. |
| POST | `/bookings/:id/extend` | Bearer | Body: `{extra_hours}`. Checks slot, deducts wallet, updates end_time. |
| POST | `/bookings/:id/end-early` | Bearer | Refund unused full hours only. |

---

### MODULE 9 — Owner QR & Booking Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/owner/checkin` | Bearer | Scan QR at entry. Body: `{qr_token, parking_id}`. Sets checkin_at, status=active. |
| POST | `/owner/checkout` | Bearer | Scan QR at exit. Body: `{qr_token, parking_id}`. Sets checkout_at, triggers overstay check, increments slot. |
| GET | `/owner/bookings/active` | Bearer | Currently checked-in vehicles. Query: `?parking_id` |
| GET | `/owner/bookings/pending-checkin` | Bearer | Confirmed but not yet checked in. Query: `?parking_id` |
| GET | `/owner/bookings` | Bearer | Booking history. Query: `?parking_id&status&date&page` |

---

### MODULE 10 — Owner Earnings & Payouts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/owner/earnings/summary` | Bearer | Today / this week / all time. Query: `?parking_id` |
| GET | `/owner/earnings/ledger` | Bearer | Per-booking breakdown. Query: `?parking_id&from&to&page` |
| GET | `/owner/payouts` | Bearer | Payout history list |
| GET | `/owner/payouts/:id` | Bearer | Full payout detail with booking list |
| POST | `/owner/disputes` | Bearer | Raise dispute within 48hr of checkout. Body: `{booking_id, reason, description}` |
| GET | `/owner/disputes` | Bearer | Owner dispute history |

---

### MODULE 11 — Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | Bearer | Body: `{booking_id, target_type, target_id, rating, comment}`. One per booking per target. |
| GET | `/owner/parkings/:id/reviews` | Bearer | Reviews for owner's listing |

---

### MODULE 12 — Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user/device-token` | Bearer | Register FCM token. Body: `{fcm_token, platform}` |
| DELETE | `/user/device-token` | Bearer | Deregister on logout. Body: `{fcm_token}` |

---

### MODULE 13 — Admin: Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | Admin token | List users. Query: `?type&search&status&page` |
| GET | `/admin/users/:id` | Admin token | Full user profile |
| PUT | `/admin/users/:id/status` | Admin token | Ban/suspend. Body: `{status, reason}` |
| POST | `/admin/users/:id/wallet-adjust` | Admin token | Manual wallet credit/debit. Body: `{type, amount, reason}` |
| GET | `/admin/users/:id/bookings` | Admin token | User's booking history |
| GET | `/admin/users/:id/wallet-transactions` | Admin token | User's wallet ledger |

---

### MODULE 14 — Admin: Listings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/parkings` | Admin token | All listings. Query: `?status&type&search&page` |
| GET | `/admin/parkings/pending` | Admin token | Approval queue (oldest first) |
| GET | `/admin/parkings/:id` | Admin token | Full listing + owner + stats |
| PUT | `/admin/parkings/:id/approve` | Admin token | Body: `{note}`. Goes live on map. |
| PUT | `/admin/parkings/:id/reject` | Admin token | Body: `{reason}`. Reason sent to owner. |
| PUT | `/admin/parkings/:id` | Admin token | Edit any listing data (audit logged) |
| PUT | `/admin/parkings/:id/pause` | Admin token | Body: `{reason}`. Removes from map. |
| PUT | `/admin/parkings/:id/reinstate` | Admin token | Body: `{note}`. Restores to map. |

---

### MODULE 15 — Admin: Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/bookings` | Admin token | All bookings. Query: `?status&parking_id&user_id&from&to&page` |
| GET | `/admin/bookings/:id` | Admin token | Full booking record with QR scan log |
| POST | `/admin/bookings/:id/force-cancel` | Admin token | Override cancel. Body: `{refund_type, refund_amount, reason}` |
| GET | `/admin/reports/overstay` | Admin token | Overstay incidents. Query: `?from&to&page` |
| GET | `/admin/reports/no-show` | Admin token | No-show auto-cancels |
| GET | `/admin/bookings/export` | Admin token | CSV export. Query: `?from&to&format=csv` |

---

### MODULE 16 — Admin: Disputes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/disputes` | Admin token | Dispute queue. Query: `?status&page` |
| GET | `/admin/disputes/:id` | Admin token | Full dispute with evidence |
| PUT | `/admin/disputes/:id/resolve` | Admin token | Body: `{resolution, refund_amount, admin_note}` |
| POST | `/admin/disputes/:id/request-info` | Admin token | Ask user/owner for more info. Body: `{from, message}` |

---

### MODULE 17 — Admin: Commission & Payouts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/commission` | Admin token | Current commission rates |
| PUT | `/admin/commission/global` | Super Admin | Body: `{rate}`. Changes global %. |
| POST | `/admin/commission/override` | Super Admin | Body: `{owner_id, rate, reason}`. Per-owner rate. |
| DELETE | `/admin/commission/override/:owner_id` | Super Admin | Remove per-owner override |
| GET | `/admin/payouts/queue` | Admin token | Wednesday payout queue. Query: `?week_start` |
| POST | `/admin/payouts/:id/approve` | Admin token | Trigger Razorpay transfer for one owner |
| POST | `/admin/payouts/approve-batch` | Admin token | Body: `{payout_ids:[]}`. Batch approve. |
| GET | `/admin/payouts` | Admin token | Payout history. Query: `?owner_id&status&from&to` |
| POST | `/admin/payouts/:id/retry` | Admin token | Retry failed payout |

---

### MODULE 18 — Admin: Dashboard & Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin token | Live stats: bookings, revenue, pending approvals, open disputes |
| GET | `/admin/reports/revenue` | Admin token | Revenue report. Query: `?period&from&to&format` |
| GET | `/admin/reports/bookings` | Admin token | Booking analytics. Query: `?from&to&group_by` |
| GET | `/admin/reports/occupancy` | Admin token | Occupancy % by type and listing |
| GET | `/admin/reports/users` | Admin token | User growth report |
| POST | `/admin/broadcast/push` | Admin token | Body: `{title, body, target, filters}`. Broadcast push notification. |

---

### MODULE 19 — Add-on Services (Phase 2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bookings/:id/addon-status` | Bearer | Live add-on status for a booking |
| GET | `/owner/addons/bookings` | Bearer (owner) | List of add-on jobs booked at owner's parking. Query: `?status&date` |
| PUT | `/owner/addons/bookings/:id/status` | Bearer (owner) | Update status: `pending/in_progress/completed` |

---

### MODULE 20 — Webhooks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/webhooks/razorpay` | Razorpay HMAC signature | Handles: `payment.captured`, `payment.failed`, `payout.processed`, `payout.failed`, `payout.reversed` |

---

### CRON Jobs (Background — Not User-Facing)

| Job | Schedule | What it does |
|-----|----------|-------------|
| No-show check | Every 15 min | Auto-cancel bookings 30min past start with no check-in. No refund to user. |
| Overstay check | Every 5 min | Charge 1.5× rate per extra hour for active bookings past end_time + 15min grace. |
| Reopen parking | Every 15 min | Auto-reopen parkings where `reopen_at` has passed. |
| Weekly payout | Wednesday 9AM IST | Aggregate Mon–Sun earnings, create payout records, queue Razorpay transfers. |

---

## 7. Business Rules — Always Enforce These

### Commission
- Platform takes **20%** of every booking and every add-on amount
- Owner receives **80%**
- Configurable by `super_admin`. Per-owner override possible.

### Cancellation Refund Policy
| Scenario | Refund to User | Credit to Owner |
|----------|---------------|-----------------|
| Cancel 1hr+ before start | 100% | 0% |
| Cancel 30–60 min before | 50% | 50% |
| Cancel < 30 min before | 0% | 100% |
| No-show (30-min grace) | 0% | 100% |
| Owner cancels | 100% | 0% + penalty flag |

- Refund credited to wallet within **2 minutes** (automated)
- 3 owner penalty flags in 30 days → admin mandatory review trigger

### Overstay Billing
- **Grace period:** 15 minutes after `end_time`
- **Rate:** 1.5× the original per-hour rate for the booking's vehicle type
- **Interval:** Charged per completed extra hour only
- **Collection:** Auto-deducted from user wallet
- **Owner share:** 80% of overstay charge

### Payout Cycle
- **Payout day:** Every Wednesday
- **Period:** Mon–Sun of previous week
- **Reconciliation window:** Mon–Tue (disputes settled before payout)
- **Minimum payout:** ₹100 (carry forward if below)
- **Method:** Razorpay Payouts → NEFT/IMPS to registered bank account

### Rating / Auto-Flag Rules
- Parking auto-flagged for admin review if: avg_rating < 2.5 stars
- Parking auto-flagged if: 3+ disputes against it in 30 days
- Owner strike added for each owner-initiated cancellation
- 3 strikes in 30 days → auto-flag for mandatory admin review

### Dispute SLA
- Admin must resolve within **48 hours**
- Unresolved after 48hr → auto-escalated to super_admin

---

## 8. Notification Events

| Event | Recipients | Channel |
|-------|-----------|---------|
| `booking_confirmed` | User | Push + SMS |
| `owner_new_booking` | Owner | Push + SMS |
| `booking_reminder_10min` | User | Push |
| `booking_ending_owner` | Owner | Push |
| `overstay_started` | User + Owner | Push |
| `overstay_charged` | User | Push |
| `booking_cancelled_user` | User | Push |
| `booking_cancelled_owner` | User | Push + SMS |
| `listing_approved` | Owner | Push + SMS |
| `listing_rejected` | Owner | Push + SMS |
| `payout_processed` | Owner | Push + SMS |
| `dispute_resolved` | User + Owner | Push + SMS |
| `wallet_low` | User (balance < ₹200) | Push |

---

## 9. Build Order (Dependency Chain)

```
Auth → User/Owner Profile → Parking CRUD → Slots & Pricing
     → User Map Search → Wallet → Booking (atomic)
     → QR Check-in/out → Overstay/Cancel CRON
     → Reviews + Disputes → Admin Panel → Payouts
```

### Sprint Sequence
| Sprint | Modules | Dependency |
|--------|---------|------------|
| 1 | Auth, User Profile, Owner Profile | None — start here |
| 2 | Parking CRUD, Slots, Pricing, Photo upload (S3) | Sprint 1 |
| 3 | User Map Search, Wallet (Razorpay), Booking (atomic) | Sprint 2 |
| 4 | QR Check-in/out, Overstay CRON, Cancel Engine, Reviews, Disputes | Sprint 3 |
| 5 | Admin Panel (all modules), Payouts (Razorpay Payouts API) | Sprints 1–4 |

**Notifications (FCM + MSG91):** Can be set up from Sprint 3 onwards in parallel.  
**S3 Photo upload:** Set up in Sprint 2 alongside parking listing.

---

## 10. Security Requirements

| Requirement | Detail |
|------------|--------|
| Auth method | Mobile OTP login or Email+Password. Secure password hashing (bcrypt/argon2). |
| JWT | Access token: 1hr expiry. Refresh token: 30 days. |
| Admin auth | Unified login via Email+Password or Mobile OTP. |
| Payment escrow | Booking amounts held in Razorpay escrow until checkout. |
| Encryption | Bank account + IFSC encrypted AES-256 at rest. |
| HTTPS | All endpoints HTTPS only. HTTP rejected. |
| Rate limiting | OTP: max 5 attempts/phone/hour. API: 100 req/min/user. |
| Audit log | All admin actions logged: admin_id, timestamp, before/after. Non-deletable. |
| Atomic booking | PostgreSQL transaction with `FOR UPDATE` lock on `parking_slots` row. |
| Webhook validation | Razorpay HMAC-SHA256 signature verified before processing. |
| Idempotency | Wallet top-up verify is idempotent — same `payment_id` returns same result. |

---

## 11. Tech Stack Quick Reference

| Layer | Technology | Notes |
|-------|-----------|-------|
| User App | Flutter | Android + iOS. Separate build from Owner app. |
| Owner App | Flutter | Same codebase, different build flavor. |
| Admin Panel | React.js | Desktop web only. |
| Backend API | Node.js + Express | REST. JWT auth on mobile, session on admin. |
| Database | PostgreSQL + PostGIS | PostGIS mandatory for geo queries. |
| Cache | Redis | Slot count cache, OTP session, rate limiting. |
| File Storage | AWS S3 | Presigned URL pattern — Flutter uploads directly to S3. |
| Maps | Google Maps API | Maps SDK (Flutter) + Maps JS API (React admin). |
| Payments | Razorpay | User top-up (Orders API) + Owner payout (Payouts API). |
| Push | Firebase FCM | Both Android and iOS. |
| SMS / OTP | MSG91 | OTP + critical SMS notifications. |
| Geo queries | PostGIS ST_DWithin | Nearby search within radius in meters. |

---

## 12. Phase-wise Feature Scope

### Phase 1 — MVP (Build Now)
- User app: full booking flow, wallet, QR, reviews
- Owner app: home + society + commercial + municipality listing, dynamic pricing, slot management, QR scan, earnings
- Admin panel: approvals, disputes, payouts, reports
- Cancellation engine + overstay billing (automated)
- Weekly payout system

### Phase 2 — Post-MVP
- Car wash add-on flow (Owner provided)
- EV charging add-on (Owner provided)
- Govt / college parking type
- Advance booking (7 days)
- KYC verification
- Promo / offer engine
- PDF receipts

### Phase 3 — Growth
- Multi-city expansion
- Loyalty / cashback program
- Valet service add-on
- ML-based price suggestions

---

*This file is the single source of truth for ParkPal. Always refer to it before writing code or making architectural decisions.*