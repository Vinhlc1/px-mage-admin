"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DollarSign, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import type { CustomerOrder } from "@/types";

interface RevenueStats {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  pendingCount: number;
}

function computeStats(orders: CustomerOrder[]): RevenueStats {
  const paid = orders.filter((o) => o.paymentStatus === "PAID");
  const totalRevenue = paid.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  return {
    totalRevenue,
    orderCount: orders.length,
    avgOrderValue: paid.length ? totalRevenue / paid.length : 0,
    pendingCount,
  };
}

export function RevenueFeature() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await apiClient.get<CustomerOrder[]>("/api/orders");
      if (error) {
        toast.error(error);
      } else {
        setStats(computeStats(Array.isArray(data) ? data : []));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    {
      title: "Total Revenue",
      icon: DollarSign,
      value: stats ? `$${stats.totalRevenue.toFixed(2)}` : null,
      sub: "From paid orders",
    },
    {
      title: "Total Orders",
      icon: ShoppingBag,
      value: stats ? String(stats.orderCount) : null,
      sub: "All time",
    },
    {
      title: "Avg. Order Value",
      icon: TrendingUp,
      value: stats ? `$${stats.avgOrderValue.toFixed(2)}` : null,
      sub: "Paid orders only",
    },
    {
      title: "Pending Orders",
      icon: Clock,
      value: stats ? String(stats.pendingCount) : null,
      sub: "Awaiting confirmation",
    },
  ];

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold">Revenue</h1>
        </div>
      </Header>

      <Main>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="size-5 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-1 h-8 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))
            : cards.map((c) => (
                <Card key={c.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {c.title}
                    </CardTitle>
                    <c.icon className="size-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{c.value ?? "—"}</div>
                    <p className="text-xs text-muted-foreground">{c.sub}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </Main>
    </>
  );
}
