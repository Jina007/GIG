# Sahakari Gig — Cooperative Gig Services Platform (SIH26089)

> **A Community-Centric Digital Labour Cooperative Marketplace for Household & Community Services**

[![Smart India Hackathon](https://img.shields.io/badge/SIH2026-Problem%20SIH26089-emerald.svg)](https://www.sih.gov.in/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20SQLite%20%7C%20Tailwind-indigo.svg)](#)

---

## 🏛️ 1. Core Concept & Differentiation

Conventional gig platforms (e.g., Urban Company) operate as centralized extractive middlemen charging high commissions (25-35%) without offering social security, long-term welfare, or community governance.

**Sahakari Gig** is a **cooperative-owned platform** that connects households, communities, and institutions with **verified local workers who belong to Labour Cooperative Societies**.

```
                           Tamil Nadu State Labour Apex
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   Coimbatore Labour Coop     Chennai Labour Service     Madurai Labour Coop
     (Reg: TN-CBE-1994)         (Reg: TN-CHN-1988)        (Reg: TN-MDU-2002)
             │                          │                          │
   ┌─────────┴─────────┐        ┌───────┴───────┐          ┌───────┴───────┐
   ▼                   ▼        ▼               ▼          ▼               ▼
Plumbers         Electricians Cleaners      Caregivers  Masons        Painters
   │                   │        │               │          │               │
   └───────────────────┴────────┴───────┬───────┴──────────┴───────────────┘
                                        ▼
                               Local Communities
                     (Peelamedu, RS Puram, Anna Nagar...)
                                        ▼
                                    Customers
```

### Key Differentiators:
1. **Cooperative-Owned Model**: 88% goes directly to the worker, 7% to member healthcare & welfare funds, 5% to platform operations. Zero VC commission extraction.
2. **4-Tier Worker Trust**: Clear visual distinction between **Verified by Cooperative** (Identity, Membership, Skills, Certifications) and **Rated by Customers** (Community score, repeat customers, jobs completed).
3. **Dedicated Worker Welfare Dashboard**: Active health cover (₹3,00,000), PMSBY accident cover, tool purchase grants, and NSDC certified skill courses.
4. **Transparent Smart Worker Matching Engine**: Shows exact recommendation weights (Skill Match 35%, Distance 20%, Availability 15%, Rating 10%, Experience 10%, Workload 10%).
5. **AI Demand Forecasting & Workforce Reallocation**: Predicts seasonal demand surges (e.g. +42% monsoon pipe leakages in Peelamedu) and recommends cross-cooperative workforce rebalancing with admin authorization.
6. **24x7 Rapid Emergency Dispatch**: 15-minute dispatch for water bursts, electrical sparks, door lockouts, and urgent elder care.
7. **Multilingual by Design**: English, தமிழ் (Tamil), and हिन्दी (Hindi).

---

## 👥 2. Four Unified Roles (1-Click Demo Available)

| Role | Demo Persona | Email / Password | Key Capabilities |
|---|---|---|---|
| **Customer** | **Priya Raman** (Coimbatore - Peelamedu) | `priya@example.com` / `password123` | Browse 20+ services, transparent matching, instant booking, live tracking, UPI payment, invoice download, reviews, complaints, favorite workers. |
| **Worker** | **Ravi Kumar** (Plumber, 4.9⭐) | `ravi@example.com` / `password123` | Availability toggle, emergency mode toggle, incoming job alert [Accept/Decline], live status updater, welfare & insurance card, direct earnings. |
| **Coop Admin** | **Meena Sundaram** (Admin, Coimbatore Society) | `meena@example.com` / `password123` | Society profile, 8 KPI cards, 3 Recharts analytics, 4-tier worker verification panel, workforce capacity monitor, dispute mediation, broadcast notices. |
| **Federation Admin** | **Arumugam P.** (Tamil Nadu State Apex) | `arumugam@example.com` / `password123` | **Apex Directorate & Platform Governance**: Cross-cooperative comparative matrix across districts, AI workforce reallocation authorization, escalated dispute arbitration, and master service category registry. |

---

## 🛠️ 3. Quick Start & Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/Jina007/GIG.git
cd GIG

# Install backend dependencies
cd server
npm install

# Seed the database with realistic prototype data
node seed.js

# Install frontend dependencies
cd ../client
npm install
npm run build

# Start the unified application
cd ..
npm run dev
```

The application will be running at:
- **Web App (Frontend & API)**: [http://localhost:5000](http://localhost:5000) or [http://localhost:5173](http://localhost:5173) (Vite Dev)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 4. Automated Test Suite

Run the full end-to-end integration test suite verifying 24 critical platform workflows:
```bash
node server/test-suite.js
```
Expected output:
```text
📊 TEST SUITE SUMMARY: 24/24 TESTS PASSED (100% SUCCESS)
```

---

## 📋 5. System Architecture

```text
├── server/
│   ├── db.js                     # SQLite relational schema with WAL mode & indexes
│   ├── seed.js                   # 55+ workers, 105+ customers, 120+ bookings seeder
│   ├── server.js                 # Express API server & static client provider
│   ├── test-suite.js             # 24 automated verification integration tests
│   ├── middleware/
│   │   └── auth.js               # JWT authentication & RBAC guards
│   ├── services/
│   │   ├── matchingEngine.js     # Transparent smart matching algorithm
│   │   └── aiForecastEngine.js   # Demand forecasting & workforce allocation
│   └── routes/
│       ├── auth.routes.js        # Auth, register, me & 1-click persona switchers
│       ├── workers.routes.js     # Worker trust profiles, availability toggles
│       ├── services.routes.js    # 20+ service categories and sub-services
│       ├── bookings.routes.js    # Smart match, booking creation & state machine
│       ├── payments.routes.js    # Sandbox payment processing & digital invoices
│       ├── reviews.routes.js     # Star reviews & customer favorite workers
│       ├── cooperatives.routes.js# Society KPIs, charts, worker verification
│       ├── federation.routes.js  # Apex dashboard, cross-cooperative matrix
│       ├── complaints.routes.js  # Bilateral dispute mediation workflow
│       ├── welfare.routes.js     # Social security & insurance portal
│       ├── forecast.routes.js    # Demand predictions & surge heatmaps
│       └── geo.routes.js         # Leaflet OpenStreetMap coordinates & boundaries
│
└── client/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.tsx        # Persona switcher, JWT session state
    │   │   └── LanguageContext.tsx    # English, தமிழ் (Tamil), हिन्दी (Hindi)
    │   ├── components/
    │   │   ├── common/                # PersonaBanner, Navbar, TrustBadge, Footer
    │   │   ├── map/MapView.tsx        # Interactive Leaflet Map with custom pins
    │   │   ├── customer/              # ServiceGrid, Matching, Tracking, Invoices
    │   │   ├── worker/                # WorkerDashboard, WelfareView, Earnings
    │   │   ├── cooperative/           # Society KPIs, Verification Table, Mediation
    │   │   ├── federation/            # State Federation Apex & AI Rebalancing
    │   │   └── superadmin/            # Service category governance
    │   ├── types/index.ts             # Complete TypeScript interfaces
    │   ├── App.tsx                    # Top-level routing & role switching
    │   └── main.tsx                   # Entry point
```

---

## 🏆 Smart India Hackathon 2026 — SIH26089 Submission
Developed with pride for the **Ministry of Cooperation & State Labour Welfare Boards**.
