# Creating Leather Goods — E-Commerce Storefront & Admin Operations Plan

A complete, editorial leather goods storefront and administrative operations dashboard for **Creating Leather Goods**, built with React, Tailwind CSS, Motion, and a Firebase-ready frontend service layer using `localStorage` persistence and PKR Cash on Delivery WhatsApp checkout.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> All Phase 1 product decisions have been incorporated below. Approving this plan authorizes building the complete storefront, bespoke studio photography generation, checkout flow, and admin dashboard prototype.

- **Confirmed Brand Identity**: **Creating Leather Goods** — positioned as an independent luxury leather goods house specializing in Shoes, Jackets, Wallets, and Bags.
- **Confirmed Currency & Delivery Region**: **PKR (Pakistani Rupee)** with local Pakistani delivery cities, configurable delivery fees, and Cash on Delivery (COD) checkout routed through WhatsApp Click-to-Chat.
- **Confirmed Visual Asset Strategy**: **Bespoke Studio Leather Photography** generated directly into local project assets for the split hero, four category showcases, workshop editorial scene, and product catalog views—paired with resilient fallback containers so zero broken images occur.
- **Confirmed Admin Access Model**: **Dedicated Admin Login Page** featuring clearly visible demo credentials, password visibility toggle, validation, and an explicit prototype notice explaining that Firebase Authentication and Firestore security rules will replace mock authentication in a later phase.

---

### 1. Overview & Core Concept

- **What It Does**: Delivers a dual-interface web application consisting of:
  1. **Customer Storefront**: Editorial homepage, four dedicated category catalogs (Shoes, Jackets, Wallets, Bags), live search, multi-attribute filtering and sorting, multi-image product detail pages with variant/stock validation, slide-over shopping bag and cart page, and a PKR Cash on Delivery checkout that saves pending orders locally and launches a pre-formatted WhatsApp order message.
  2. **Admin Dashboard**: Protected operational console with overview statistics, simulated sales analytics, full product CRUD with multi-image preview and primary image selection, category management, order status and internal note management, inventory stock controls, sale pricing controls, and persisted store settings.
- **Target Audience**: Discerning leather goods shoppers across Pakistan ordering via Cash on Delivery and WhatsApp, alongside store administrators managing catalog, stock, pricing, and fulfillment.
- **Key Value**: Combines quiet luxury editorial presentation with practical COD/WhatsApp commerce workflows and a clean asynchronous service boundary that swaps smoothly to Firebase later without rewriting UI components.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  - **Discovery & Filtering**: Shoppers enter through a slim announcement bar and sticky three-zone navigation bar, explore the split-screen hero or four category tiles, hover desktop product cards to preview secondary angles and reveal quick-add bars, or filter category pages by price, color, size, stock availability, and sale status.
  - **Product Selection**: On a product detail view, shoppers inspect up to four studio thumbnails, review material and SKU specs, select required sizes (Shoes, Jackets) or colors (Wallets, Bags), adjust quantity within live stock limits, and either add to the slide-over bag or jump straight to checkout.
  - **COD & WhatsApp Order Flow**: At checkout, shoppers enter Pakistani delivery details, verify itemized PKR totals and delivery charges, and submit. The app generates a unique order ID, records the order as `Pending` in local storage, opens WhatsApp with an `encodeURIComponent`-encoded order summary, and displays a clear post-submission screen explaining that the customer must press Send in WhatsApp to confirm the order.
  - **Admin Operations**: Staff sign in via the dedicated admin login page, navigate a responsive sidebar workspace (collapsing to a mobile drawer), manage products/categories/sales/inventory/settings, and process customer orders or contact buyers directly on WhatsApp.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Minimal, architectural, editorial leather house—rectangular layouts, clean hairline borders (`1px`), generous whitespace, and zero decorative clutter (no gradients, glassmorphism, neon accents, emoji, countdown timers, or entry popups).
  - *Color Palette & Mood*: Driven by CSS variables on a crisp white canvas (`--paper: #FFFFFF`, `--surface: #F3F1ED`, `--warm-beige: #E8DCCB`), deep espresso typography and primary actions (`--ink: #17130F`, `--accent: #241811`, `--on-accent: #FFFFFF`), muted stone metadata (`--muted: #625D57`), hairline dividers (`--line: #E6E2DC`), cognac leather accents (`--leather: #8C5A36`), and crimson sale pricing (`--sale: #B42318`), maintaining ≥ 4.5:1 text contrast.
  - *Typography & Hierarchy*: **Hanken Grotesk** across the entire application—bold editorial hero titles (`40px–88px` responsive), semibold section headings (`28px–36px`), medium `16px` product names, semibold tabular-numeral prices (`tabular-nums`), and `16px` body copy (`1.6` line height, minimum `14px` text everywhere).
  - *Component Styling & Layout*: 1440px max container width with 32px desktop padding, clean rectangular product and category frames, unboxed typographic metadata separators (`·`, `/`) instead of pill badge clusters, and a compact single-elevation admin workspace with tabular data tables.

- **Interactive Feedback & Motion**:
  - Subtle `motion/react` transitions honoring `prefers-reduced-motion`: hero entrance, smooth secondary image crossfade and quick-add bar reveal on card hover, bag count pop, slide-over cart and mobile navigation drawers, toast notifications, and clean route transitions—all animating compositor properties (`transform`, `opacity`) within ≤ 200ms for routine feedback.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Plain ES6+ JavaScript Modules & Single-Page Client Routing**
  - *Chosen Approach*: Implement all application source modules in clean, readable ES6+ JavaScript (`.js`/`.jsx`) with React Router DOM lazy-loaded views, React Hook Form for checkout/admin forms, and React Context for Cart, Auth, Storefront Data, and Toast Notifications.
  - *Why*: Matches project maintainability and simplicity goals while keeping Vite bundling fast and TypeScript compiler compatibility intact via `allowJs`.
  - *Alternatives Considered*: Heavy external state libraries (Redux/Zustand) or TypeScript-only abstractions, which add boilerplate without improving prototype clarity.

- **Decision 2: Asynchronous Service Boundary Over `localStorage`**
  - *Chosen Approach*: Encapsulate all data reads, mutations, stock adjustments, image preview references, and session checks inside async service modules backed by centralized seed data and `localStorage` persistence.
  - *Why*: Components remain completely decoupled from storage mechanics, enabling seamless replacement with Firebase Auth, Cloud Firestore, and Firebase Storage later without restructuring React components.
  - *Alternatives Considered*: Direct `localStorage` calls inside UI components, which would couple presentation to browser storage and complicate future Firebase migration.

- **Decision 3: Ephemeral Object URLs + Curated Studio Assets for Admin Product Images**
  - *Chosen Approach*: Use browser `URL.createObjectURL()` for newly uploaded image previews (validating file type and size, allowing up to 4 images and primary image selection) alongside selectable studio photography assets, explicitly avoiding large base64 strings in `localStorage`.
  - *Why*: Prevents `localStorage` quota exhaustion while faithfully simulating multi-image upload, reordering, and primary selection prior to Firebase Storage integration.

- **Decision 4: Honest Cash on Delivery & WhatsApp Order Lifecycle**
  - *Chosen Approach*: New checkout orders always save as `Pending` with duplicate-submit protection, open WhatsApp Click-to-Chat with a configurable store WhatsApp number, and clearly state that sending the WhatsApp message is required—never falsely marking orders as confirmed upon redirect.
  - *Why*: Prevents phantom confirmed orders and gives admins explicit control to confirm, process, ship, or cancel orders in the Order Management view.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION SHELL & ROUTER                        │
│  Lazy-loaded Customer Storefront  │  Protected Admin Workspace (/admin/*) │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
┌───────────────────▼───────────────────────────────────▼───────────────────┐
│                          REACT CONTEXT PROVIDERS                           │
│   AuthContext (Admin Session)   │   CartContext (Bag, Stock Cap, Totals)  │
│   StoreContext (Settings, Sync) │   ToastContext (Feedback Notifications) │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
┌───────────────────▼───────────────────────────────────▼───────────────────┐
│                    FIREBASE-READY ASYNC SERVICE LAYER                     │
│  authService · productService · categoryService · orderService · storage  │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
┌───────────────────▼───────────────────────────────────▼───────────────────┐
│                      PERSISTENCE & SEED DATA LAYER                        │
│   Initial Catalog, Categories, Testimonials, Orders & Store Settings      │
│   Browser localStorage Synchronization + WhatsApp Click-to-Chat Utility   │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **Products**: `id`, `name`, `slug`, `category` (`shoes`, `jackets`, `wallets`, `bags`), `sku`, `description`, `material`, `specifications`, `originalPrice`, `discountPrice`, `isOnSale`, `isFeatured`, `isBestSeller`, `isPublished`, `stock`, `sizes`, `colors`, `images` (up to 4, with primary index), `createdAt`.
  - **Categories**: `id`, `name`, `slug`, `description`, `image`, `enabled`, `displayOrder`.
  - **Orders**: `id` (`ORD-2026-XXX`), `customer` (`fullName`, `phone`, `whatsapp`, `city`, `area`, `address`, `notes`), `items` (snapshot of `productId`, `name`, `sku`, `size`, `color`, `quantity`, `unitPrice`), `subtotal`, `deliveryFee`, `total`, `paymentMethod` (`Cash on Delivery`), `status` (`Pending` | `Confirmed` | `Processing` | `Shipped` | `Delivered` | `Cancelled`), `internalNotes`, `stockDeducted`, `createdAt`.
  - **Store Settings**: `storeName`, `logoText`, `whatsappNumber`, `contactPhone`, `email`, `deliveryCharge`, `freeDeliveryThreshold`, `currency` (`PKR`), `socialLinks`.

- **Interactive Component & State Mapping**:
  - **Catalog Filters & Search**: Category and catalog views derive filtered/sorted arrays purely from live product state (`search`, `priceRange`, `color`, `size`, `inStockOnly`, `onSaleOnly`, `sortBy`), resetting cleanly when switching categories.
  - **Product Detail & Bag Guardrails**: Variant selection validates required attributes (`size` for Shoes/Jackets, `color` when multiple options exist) before calling `addToCart`; quantity steppers in both Product Details and Cart Drawer enforce `1 <= qty <= availableStock`.
  - **Checkout & Stock Integrity**: Form validation runs via React Hook Form; submission creates a `Pending` order, clears the bag, resets duplicate-submit lock after transition, and exposes both an auto-launched WhatsApp link and a manual retry button on the Order Pending confirmation panel.
  - **Admin CRUD & Inventory Sync**: Saving products, toggling sale/featured/published flags, updating category availability, modifying stock levels (with `stockDeducted` transaction guards on order status transitions), and updating store settings immediately persist via the service layer and propagate to storefront views.
