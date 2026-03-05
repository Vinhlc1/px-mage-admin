This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
