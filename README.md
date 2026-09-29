# PackPramana (SIH26236)
### AI-Based Intelligent Food Packaging Material Recommendation System

> **A decision studio for small food processors and produce packers in India.**  
> Delivering transparent, explainable packaging recommendations based on physical barrier requirements, ambient supply chain stresses, and verified unit economics.

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🌟 Key Features

1. **Deterministic Knowledge-Based AI Engine (`rules-1.0`):**
   * Multi-attribute linear scoring across Requirement Fit ($F$), Budget Fit ($C$), Transport Margin ($M$), Temperature Margin ($E$), and End-of-Life route ($R$).
   * Hard gating ensures physical integrity and food safety: unprotective packs are rejected with clear, auditable reasons ($F=100$ for all survivors).
2. **Scenario Formulation Wizard:**
   * 3-step structured input (Food Commodity, Environmental & Transit Conditions, Commercial Economics & Composition).
   * Covers 8 seed commodities: Strawberry, Tomato, Spinach, Turmeric, Peanuts, Rice, Potato Chips, and Biscuits.
3. **Transparent Shortlist & Alternatives:**
   * Displays top recommendation with exact mathematical contribution formulas.
   * Deterministic tie-breaking (price-first, followed by catalogue ID).
   * Full disclosure of rejected packaging formats and failure criteria.
4. **Side-by-Side Comparison Studio:**
   * Compare 2 or 3 packaging candidates across structure, pack format, thickness, seal method, mechanical resistance, and end-of-life routes.
   * Unmeasured laboratory parameters explicitly read `not measured` (never padded with zeros).
5. **What-If Sensitivity Simulation:**
   * Interactive perturbation controls for Relative Humidity (% RH), target budget (₹), transit distance (km), and storage temperature (°C).
   * Live diff showing derived target shifts, eligibility changes, and ranking modifications.
6. **Local & Cloud Persistence (Supabase):**
   * Offline-first local storage repository with immutable snapshots, duplicate prevention, and deletion Undo.
   * Built-in Supabase cloud synchronization for collaborative audit trails and remote access.
7. **Printable Decision Report:**
   * High-contrast, black-and-white `@media print` layout ready for browser Print or Save as PDF.
8. **Catalogue & Scientific Glossary:**
   * Searchable library of commodities and packaging formats.
   * Authoritative glossary defining OTR, WVTR, produce respiration dynamics, and food contact standards with direct external citations (FAO, UC Davis, FSSAI).

---

## 🚀 Quick Start & Local Development

```powershell
# 1. Clone repository
git clone https://github.com/shivanik10980-web/packpramana.git
cd packpramana

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run automated test suite (Vitest)
npm run test

# 5. Run TypeScript check
npm run typecheck

# 6. Build production bundle
npm run build
```

---

## ☁️ Supabase Cloud Integration Setup

PackPramana supports cloud persistence via Supabase. To connect your Supabase database:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL schema found in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor.
3. Configure your environment variables in `.env` (or in Vercel project settings):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. In the **History** view, click **Sync to Cloud** or **Pull from Cloud** to synchronize your scenarios.

---

## 🚢 Deploying to Vercel

The repository includes `vercel.json` configured for single-page application (SPA) routing with Vite:

```powershell
# Deploy with Vercel CLI
npx vercel --prod
```

Or connect the GitHub repository in your Vercel Dashboard for automated continuous deployment on `git push`.

---

## ⚖️ Scientific Evidence Disclosures & Limitations

* **Synthetic Fixtures:** All numerical values for candidate capabilities, barrier ratings, prices, and coverage limits are authored demonstration fixtures (`demo-1.0`, `rules-1.0`).
* **Unmeasured Parameters:** OTR (Oxygen Transmission Rate) and WVTR (Water Vapor Transmission Rate) are marked as `not measured` because standardized laboratory testing under controlled temperature, relative humidity, and thickness is required before numerical comparisons can be made.
* **Produce Respiration:** Vented punnets and micro-perforated pouches require whole-pack gas exchange validation with specific commodity respiration curves.
* **No Predictive Shelf Life:** The system does not output simulated shelf-life numbers or modified atmosphere gas percentages.
