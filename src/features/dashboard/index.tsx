"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { apiClient } from "@/lib/api-client";
import type {
  Account,
  Inventory,
  Supplier,
  PurchaseOrder,
  Warehouse,
  Role,
  CardFramework,
  CardTemplate,
  CardProduct,
  Product,
  Collection,
  Voucher,
  CustomerOrder,
} from "@/types";
import {
  Users,
  ShieldCheck,
  Warehouse as WarehouseIcon,
  Package,
  Truck,
  ShoppingCart,
  Layers,
  CreditCard,
  Nfc,
  Boxes,
  Library,
  TicketPercent,
  ClipboardList,
} from "lucide-react";

interface SummaryCard {
  title: string;
  Icon: React.ElementType;
  count: number | null;
  href: string;
}

export function Dashboard() {
  const [counts, setCounts] = useState<{
    accounts: number | null;
    roles: number | null;
    warehouses: number | null;
    inventory: number | null;
    suppliers: number | null;
    purchaseOrders: number | null;
    cardFrameworks: number | null;
    cardTemplates: number | null;
    cardProducts: number | null;
    products: number | null;
    collections: number | null;
    vouchers: number | null;
    orders: number | null;
  }>({
    accounts: null,
    roles: null,
    warehouses: null,
    inventory: null,
    suppliers: null,
    purchaseOrders: null,
    cardFrameworks: null,
    cardTemplates: null,
    cardProducts: null,
    products: null,
    collections: null,
    vouchers: null,
    orders: null,
  });

  useEffect(() => {
    async function load() {
      const [
        accounts,
        roles,
        warehouses,
        inventory,
        suppliers,
        purchaseOrders,
        cardFrameworks,
        cardTemplates,
        cardProducts,
        products,
        collections,
        vouchers,
        orders,
      ] = await Promise.all([
          apiClient.get<Account[]>("/api/accounts"),
          apiClient.get<Role[]>("/api/roles"),
          apiClient.get<Warehouse[]>("/api/warehouses"),
          apiClient.get<Inventory[]>("/api/inventory"),
          apiClient.get<Supplier[]>("/api/suppliers"),
          apiClient.get<PurchaseOrder[]>("/api/purchase-orders"),
          apiClient.get<CardFramework[]>("/api/card-frameworks"),
          apiClient.get<CardTemplate[]>("/api/card-templates"),
          apiClient.get<CardProduct[]>("/api/card-products"),
          apiClient.get<Product[]>("/api/products"),
          apiClient.get<Collection[]>("/api/collections"),
          apiClient.get<Voucher[]>("/api/vouchers"),
          apiClient.get<CustomerOrder[]>("/api/orders"),
        ]);

      setCounts({
        accounts: accounts.data?.length ?? null,
        roles: roles.data?.length ?? null,
        warehouses: warehouses.data?.length ?? null,
        inventory: inventory.data?.length ?? null,
        suppliers: suppliers.data?.length ?? null,
        purchaseOrders: purchaseOrders.data?.length ?? null,
        cardFrameworks: cardFrameworks.data?.length ?? null,
        cardTemplates: cardTemplates.data?.length ?? null,
        cardProducts: cardProducts.data?.length ?? null,
        products: products.data?.length ?? null,
        collections: collections.data?.length ?? null,
        vouchers: vouchers.data?.length ?? null,
        orders: orders.data?.length ?? null,
      });
    }

    load();
  }, []);

  const cards: SummaryCard[] = [
    { title: "Accounts", Icon: Users, count: counts.accounts, href: "/admin/accounts" },
    { title: "Roles", Icon: ShieldCheck, count: counts.roles, href: "/admin/roles" },
    { title: "Warehouses", Icon: WarehouseIcon, count: counts.warehouses, href: "/admin/warehouses" },
    { title: "Inventory Items", Icon: Package, count: counts.inventory, href: "/admin/inventory" },
    { title: "Suppliers", Icon: Truck, count: counts.suppliers, href: "/admin/suppliers" },
    { title: "Purchase Orders", Icon: ShoppingCart, count: counts.purchaseOrders, href: "/admin/purchase-orders" },
    { title: "Card Frameworks", Icon: Layers, count: counts.cardFrameworks, href: "/admin/card-frameworks" },
    { title: "Card Templates", Icon: CreditCard, count: counts.cardTemplates, href: "/admin/cards" },
    { title: "NFC Products", Icon: Nfc, count: counts.cardProducts, href: "/admin/nfc" },
    { title: "Products", Icon: Boxes, count: counts.products, href: "/admin/products" },
    { title: "Collections", Icon: Library, count: counts.collections, href: "/admin/collections" },
    { title: "Vouchers", Icon: TicketPercent, count: counts.vouchers, href: "/admin/vouchers" },
    { title: "Orders", Icon: ClipboardList, count: counts.orders, href: "/admin/orders" },
  ];

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
        </div>
      </Header>

      <Main>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your administration data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ title, Icon, count, href }) => (
            <a key={title} href={href} className="block group">
              <Card className="transition-shadow group-hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {count === null ? (
                      <span className="text-muted-foreground animate-pulse">—</span>
                    ) : (
                      count
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total {title.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </Main>
    </>
  );
}
