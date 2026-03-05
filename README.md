# PixelMage — Admin Portal

Full-featured back-office management dashboard for the PixelMage trading-card platform. Provides CRUD operations across every business domain, with real-time data fetched from the Spring Boot backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 + TypeScript 5.9 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Forms | React Hook Form 7 + Zod 4 |
| Charts | Recharts 2 |
| Date handling | date-fns 4 |
| Linter / formatter | Biome 2.2 |
| Package manager | pnpm |

---

## Architecture

### Authentication

- Login POSTs credentials to the Next.js API route `/api/auth/login`, which forwards to the backend and sets **two cookies**:
  - `pm_token` — httpOnly, used by the Next.js proxy; never accessible to client JS.
  - `pm_user` — plain JSON cookie holding username / role for the UI.
- A **middleware** (`src/proxy.ts`) validates `pm_token` on every request, redirecting to `/login` if expired or missing.
- All admin pages live under `/admin/*` and are protected by the middleware.

### API Proxy Pattern

All backend calls are routed through Next.js API routes under `src/app/api/`. The client never contacts `http://localhost:8386` directly.

```
Browser → /api/<resource>  →  Next.js proxy route  →  http://localhost:8386/api/<resource>
                                    (attaches httpOnly token from cookie)
```

The proxy layer lives in `src/app/api/orchestra.ts`, which provides `proxyGet`, `proxyPost`, `proxyPut`, `proxyDelete`, `proxyPatch` helpers that forward the request with the `Authorization: Bearer <token>` header.

Client-side code calls `apiClient.get|post|put|delete|patch` from `src/lib/api-client.ts`, which calls the local `/api/*` proxy routes — never the backend directly.

---

## Pages & Features

### Dashboard — `/admin`
- Summary cards showing live counts for all 13 resource types (accounts, roles, warehouses, inventory, suppliers, purchase orders, card frameworks, card templates, NFC products, products, collections, vouchers, customer orders).
- All counts fetched in parallel on mount via `apiClient.get`.

### Accounts — `/admin/accounts`
- List all customer accounts with role badge.
- Create, edit (name, email, phone, role), delete with confirmation dialog.
- Inline skeleton loading.

### Roles — `/admin/roles`
- List all roles.
- Create and delete roles.

### Warehouses — `/admin/warehouses`
- List warehouses with address details.
- Full CRUD: create / edit / delete.

### Inventory — `/admin/inventory`
- Associate products with warehouses and track quantity.
- Full CRUD.

### Suppliers — `/admin/suppliers`
- Manage supplier master data (name, contact person, email, phone, address).
- Full CRUD.

### Purchase Orders — `/admin/purchase-orders`
- List all purchase orders with status badge (`PENDING`, `APPROVED`, `RECEIVED`, `CANCELLED`).
- View line items per order.
- Create orders with dynamic line-item builder.
- Approve and receive orders via status transitions.
- Skeleton loading while fetching.

### Card Frameworks — `/admin/card-frameworks`
- List card frameworks (the structural templates that card designs are based on).
- Full CRUD with name + description fields.

### Card Templates — `/admin/cards`
- List card templates with tier and price.
- Full CRUD.

### NFC Products — `/admin/nfc`
- List all physical NFC card products with bind-status badges (`READY`, `PENDING_BIND`, `LINKED`, `SOLD`, `DEACTIVATED`).
- Bind an NFC tag to a physical card via a modal dialog (enter NFC serial).

### Products — `/admin/products`
- Price-tier products linked to card templates.
- Full CRUD.

### Collections — `/admin/collections`
- Curated collections that group multiple card templates.
- Full CRUD.

### Vouchers — `/admin/vouchers`
- Discount voucher management (code, discount %, expiry, usage limits).
- Full CRUD.

### Orders — `/admin/orders`
- List all customer orders with status and payment-status badges.
- View order line items inline.
- Update order status.

### Revenue — `/admin/revenue`
- Revenue summary cards (total, monthly, average order value).
- Bar chart of revenue by month using Recharts.
- Data fetched from `GET /api/analytics/revenue`.

### Analytics — `/admin/analytics`
- Order count and conversion metrics.
- Line chart of daily orders.
- Data fetched from `GET /api/analytics/orders`.

---

## Project Structure

```
src/
  app/
    admin/            # Protected admin pages (one folder per domain)
    api/              # Next.js proxy routes
      orchestra.ts    # Shared proxy helpers (proxyGet, proxyPost, …)
      auth/           # Login / logout / session endpoints
      accounts/       # CRUD proxy
      card-frameworks/
      card-products/
      card-templates/
      collections/
      inventory/
      orders/
      products/
      purchase-orders/
      roles/
      suppliers/
      vouchers/
      warehouse-transactions/
      warehouses/
    login/            # Public login page
    layout.tsx        # Root layout (fonts, providers)
    globals.css
  components/
    layout/           # AppSidebar, Header, Main, TeamSwitcher, nav-group
      data/
        sidebar-data.ts   # All sidebar nav items and groups
    ui/               # shadcn/ui component library
    search.tsx
    skip-to-main.tsx
  context/
    auth-context.tsx      # Provides useAuth() — user info from cookie
    layout-provider.tsx   # SidebarProvider wrapper
    search-provider.tsx   # Global search state
    theme-provider.tsx    # next-themes dark/light mode
  features/             # Feature modules (each exports a React component)
    account/
    accounts/
    analytics/
    card-frameworks/
    card-products/     # NFC product list + bind dialog
    card-templates/
    collections/
    dashboard/         # Live summary card grid
    inventory/
    orders/            # Customer order list + status update
    products/
    purchase-orders/   # PO list + create + approve + receive
    revenue/
    roles/
    suppliers/
    vouchers/
    warehouses/
  hooks/
    use-auth.ts
    use-dialog-state.ts
    use-mobile.ts
  lib/
    api-client.ts      # apiClient.get|post|put|delete|patch → /api/*
    auth-utils.ts      # Token / cookie constants and JWT decode helpers
    auth.ts            # Server-side auth helpers
    cookies.ts         # Cookie read/write utilities
    utils.ts           # cn(), formatVND()
  proxy.ts             # Next.js middleware (token validation + redirect)
  types/
    index.ts           # All BE DTO interfaces
```

---

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8386   # Spring Boot backend
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Auto-format with Biome |

## PX Mage Admin Portal

Full-featured admin portal for managing the PX Mage tarot card platform.

### Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Biome 2.2.0** — linting & formatting (replaces ESLint/Prettier)
- **shadcn/ui** — component library (radix-ui based)
- **Sonner** — toast notifications
- **Recharts** — analytics chart

### Architecture
- Two-tier proxy: `Browser → Next.js API Routes → Spring Boot :8386/api`
- API routes add the Bearer token from httpOnly cookies server-side so credentials never surface to the browser
- Feature components use `"use client"` + `useEffect` + `useState` — no TanStack Query

### Feature Areas

#### Management (existing)
| Route | Feature |
|---|---|
| `/admin` | Dashboard — entity count summary cards |
| `/admin/accounts` | Account CRUD (email, name, phone, role) |
| `/admin/roles` | Role CRUD |
| `/admin/warehouses` | Warehouse CRUD |
| `/admin/inventory` | Inventory CRUD |
| `/admin/suppliers` | Supplier CRUD |
| `/admin/purchase-orders` | Purchase Order CRUD |

#### Catalog (new)
| Route | Feature |
|---|---|
| `/admin/card-frameworks` | Card Framework CRUD — design file URL, name, description |
| `/admin/cards` | Card Template CRUD — 78 tarot templates, arcana/suit/rarity, active toggle |
| `/admin/nfc` | NFC Card Product management — physical card tracking, NFC UID binding |

#### Commerce (new)
| Route | Feature |
|---|---|
| `/admin/products` | Product CRUD — BUNDLE / BLIND_BOX / SINGLE_EVENT types |
| `/admin/collections` | Collection CRUD — STANDARD / LIMITED / ACHIEVEMENT / HIDDEN types |
| `/admin/vouchers` | Voucher CRUD — fixed $ discount or % discount, expiry, max uses |
| `/admin/orders` | Order management — read-only list + status update |

#### Analytics (new)
| Route | Feature |
|---|---|
| `/admin/revenue` | Revenue summary — total revenue, order count, avg value, pending orders |
| `/admin/analytics` | Traffic chart (area chart via Recharts) |

### Development

```bash
# Dev server
npm run dev

# Lint + format (Biome)
npx biome check --write src/

# Single file
npx biome check --write src/features/orders/index.tsx
```

### Proxy API Routes

All routes live under `src/app/api/` and forward to `localhost:8386/api` with the Bearer token injected server-side.

| Proxy path | Methods | BE endpoint |
|---|---|---|
| `/api/accounts` | GET, POST | `/accounts` |
| `/api/roles` | GET, POST | `/roles` |
| `/api/warehouses` | GET, POST | `/warehouses` |
| `/api/inventory` | GET, POST | `/inventory` |
| `/api/suppliers` | GET, POST | `/suppliers` |
| `/api/purchase-orders` | GET, POST | `/purchase-orders` |
| `/api/card-frameworks` | GET, POST | `/card-frameworks` |
| `/api/card-frameworks/[id]` | GET, PUT, DELETE | `/card-frameworks/{id}` |
| `/api/card-templates` | GET, POST | `/card-templates` |
| `/api/card-templates/[id]` | GET, PUT, DELETE | `/card-templates/{id}` |
| `/api/card-products` | GET, POST | `/card-products` |
| `/api/card-products/[id]` | GET, PUT, DELETE | `/card-products/{id}` |
| `/api/card-products/[id]/bind` | PATCH | `/card-products/{id}/bind` |
| `/api/products` | GET, POST | `/products` |
| `/api/products/[id]` | GET, PUT, DELETE | `/products/{id}` |
| `/api/collections` | GET, POST | `/collections` |
| `/api/collections/[id]` | GET, PUT, DELETE | `/collections/{id}` |
| `/api/vouchers` | GET, POST | `/vouchers` |
| `/api/vouchers/[id]` | GET, PUT, DELETE | `/vouchers/{id}` |
| `/api/orders` | GET | `/orders` |
| `/api/orders/[id]` | GET | `/orders/{id}` |
| `/api/orders/[id]/status` | PATCH | `/orders/{id}/status` |

### UI/UX Conventions
- **Loading state**: Skeleton table rows (never "Loading..." text)
- **Empty state**: Single table row with muted "No X found." text
- **Create/Edit**: Dialog with form fields; scrollable (`max-h-[90vh] overflow-y-auto`) for complex forms
- **Delete**: AlertDialog confirmation before deletion
- **Toasts**: `sonner` — `toast.success()` / `toast.error()`


```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
