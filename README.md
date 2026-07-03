# 🚀 Infistyle India — Premium Custom Printing E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-DB%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

An end-to-end, production-ready, custom online printing e-commerce platform designed for **Infistyle India**. It implements a high-contrast, premium signature Yellow (`#F5B800`) and White design language. The platform empowers corporate clients and retail customers to seamlessly design, preview, and order custom business cards, apparel, drinkware, stationery, and marketing materials directly inside their browser.

### 🌐 Live Links
* **Live Web Application:** [https://infistyle-prints.vercel.app/](https://infistyle-prints.vercel.app/)
* **Admin Dashboard:** [https://infistyle-prints.vercel.app/admin](https://infistyle-prints.vercel.app/admin)

---

## 🎨 Key Features & Functional Phases

### 🛠️ Phase 1: Catalog & Google Authentication
* **Unified Brand Design System:** Clean outline aesthetics, custom interactive cards, and responsive mega-menu navigation implementing `#F5B800` borders and typography.
* **Google OAuth Integration:** Secure user authentication managed via Supabase Auth ("Continue with Google") with route guards.
* **Smart Catalog Grid:** Multi-criteria search and filter panel displaying products across 11 major categories (Visiting Cards, Apparel, Mugs, Stationery, Stamps, Signs, Stickers, Pens, Drinkware, Custom Polo shirts, Umbrellas).

### 📐 Phase 2: Interactive 3D Editor & QR Engine
* **Fabric.js (v6) Design Engine:** Full-screen vector graphics editor supporting custom text, shapes, layers, image uploads, and customizable safety/bleed grids.
* **Scannable QR Generator:** Real-time client-side generation of custom QR codes (URLs, text, contact vCards) embedded directly onto print layers.
* **Buttery-Smooth 3D CSS Card Preview:** Real-time 3D rotation of designed canvases (front and back) with cursor drag-state tracking and lag-free transitions.
* **High-Res PDF Proof Exporter:** Client-side generation of high-resolution vector PDF proofs using `jsPDF`.

### 🛒 Phase 3: Smart Cart, Google Maps, & Razorpay Gateway
* **Interactive Shopping Cart:** Real-time volume discount pricing calculator, tax configuration (18% GST), and customizable item parameter updates.
* **Google Maps Autocomplete & GPS Lookup:** Deep integration of Google Places API for address autofill alongside a "Detect My Location" button to map shipping coordinates.
* **Dual Payment System:** Secure payment integration via Razorpay SDK (UPI, Card, Netbanking) alongside Cash on Delivery (COD) workflows.

### 📊 Phase 4: User & Admin Portals
* **User Dashboard:** Order tracking timeline, previous project re-editor, saved delivery locations, and quick single-click reorder buttons.
* **Admin Console:** Key metrics tracking (Revenue, Active Orders, Catalog size), order management panel with live shipping coordinates on Google Maps, and instant base-price editing tools.

### 📁 Phase 5: Device File Upload & Dynamic Showcases
* **Native Device Uploader:** High-performance, lag-free uploader in the admin panel converting local files to persistent storage with preview cards and deletion controls.
* **Merged Local & Remote Showcase:** Merges live PostgreSQL database items with cached custom products stored in client-side `localStorage`.

### 🗂️ Phase 6: Product-Specific Template Manager
* **Admin Template Studio:** Full CRUD management of customizable design templates. Admins can upload thumbnails from local devices, configure dimensions, set industries/themes, and paste JSON canvas states.

---

## 📁 Repository Directory Structure

The project is structured as a unified monorepo hosting both the **Next.js Frontend** and the **NestJS Backend**:

```
infistyle-prints/
├── backend/                  # NestJS Backend Service
│   ├── prisma/               # Prisma Database Schema & Seed Script
│   │   ├── schema.prisma     # PostgreSQL database models
│   │   └── seed.ts           # Seeding script for catalog data
│   ├── src/                  # NestJS controllers, services, and modules
│   └── package.json          # Backend dependencies & build configurations
├── public/                   # Static assets (mockups, logos, favicons)
├── src/                      # Next.js Frontend Application
│   ├── app/                  # App Router Pages, API routes, and layouts
│   ├── components/           # Reusable UI components (Editor, Cart, Showcase)
│   ├── lib/                  # Helper utilities, Supabase client, and static catalog data
│   └── globals.css           # Global styles and Tailwind CSS v4 design system
├── vercel.json               # Vercel Services multi-project configuration
└── package.json              # Monorepo/Root configuration
```

---

## 🛠️ Environment Variables Configuration

To run the application locally or deploy it on Vercel, create a `.env.local` file in the root directory (and add them under Environment Variables in your Vercel Project Settings):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Razorpay Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your-google-maps-api-key"

# Site URL (For OAuth Redirect callback)
NEXT_PUBLIC_SITE_URL="https://your-deployment-url.vercel.app"
```

---

## 🚀 Local Development Setup

Follow these simple steps to spin up the local development environment:

### Prerequisites
Make sure you have [Node.js (v18+)](https://nodejs.org/) and `npm` installed.

### 1. Install dependencies
Install all packages for both the frontend and backend services:
```bash
# Install root/frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Generate Prisma Client & Database Models
If you are running the backend service locally, ensure the Prisma models are compiled:
```bash
cd backend
npx prisma generate
cd ..
```

### 3. Start the Development Servers
Launch both the Next.js frontend and NestJS backend development environments:
```bash
# In the root directory:
npm run dev

# In a separate terminal (for the backend):
cd backend
npm run start:dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🖥️ Production Build & Verification

To verify that the entire codebase compiles successfully for production deployment:
```bash
# Verify Frontend compilation
npm run build

# Verify Backend compilation
cd backend
npm run build
```

---

## 📦 Vercel Deployment Settings

The repository is fully pre-configured for Vercel's **Multi-Service (Monorepo) Deployments** via the root `vercel.json` file. 

1. Create a new project on Vercel and import the `infistyle-prints` repository.
2. Vercel will automatically read `vercel.json` and configure two separate deployments:
   * **Frontend Service** located at `/` (built using Next.js).
   * **Backend Service** located at `/backend` (built using NestJS).
3. **Environment Variables:** Insert all keys listed in the `Environment Variables` section in the Vercel Dashboard under **Settings ➔ Environment Variables**.
4. **Supabase Auth Redirects:** Add `https://your-vercel-domain.vercel.app/auth/callback` to the Redirect URLs list in your **Supabase Dashboard ➔ Authentication ➔ URL Configuration** to enable Google Login.
5. Click **Deploy**. Vercel will build, optimize, and launch both services on the same unified domain!
