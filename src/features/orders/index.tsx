"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type {
  CustomerOrder,
  OrderStatus,
  OrderStatusRequest,
  PaymentStatus,
} from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

function orderStatusVariant(
  status: OrderStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "COMPLETED") return "default";
  if (status === "CANCELLED") return "destructive";
  if (status === "PROCESSING") return "secondary";
  return "outline";
}

function paymentStatusVariant(
  status: PaymentStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PAID") return "default";
  if (status === "FAILED") return "destructive";
  if (status === "REFUNDED") return "secondary";
  return "outline";
}

export function OrdersFeature() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomerOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");
  const [updating, setUpdating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await apiClient.get<CustomerOrder[]>("/api/orders");
    if (error) toast.error(error);
    else setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openDetail = (order: CustomerOrder) => {
    setSelected(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setUpdating(true);
    const body: OrderStatusRequest = { status: newStatus };
    const { error } = await apiClient.put(
      `/api/orders/${selected.orderId}/status`,
      body,
    );
    setUpdating(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Order status updated.");
    setSelected(null);
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Order ID", "Customer", "Amount", "Status", "Payment", "Created", ""].map(
                    (h) => (
                      <TableHead key={h}>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.orderId}>
                      <TableCell className="font-mono text-sm">
                        #{o.orderId}
                      </TableCell>
                      <TableCell>
                        {o.customerName ?? o.customerEmail ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${o.totalAmount?.toFixed(2) ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={orderStatusVariant(o.status)}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant(o.paymentStatus)}>
                          {o.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(o)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>

      {/* Order detail / status dialog */}
      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>Order #{selected?.orderId}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selected.customerName ?? selected.customerEmail ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">
                    ${selected.totalAmount?.toFixed(2) ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <Badge variant={paymentStatusVariant(selected.paymentStatus)}>
                    {selected.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>
                    {selected.createdAt
                      ? new Date(selected.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
              {selected.orderItems && selected.orderItems.length > 0 && (
                <div>
                  <p className="mb-2 font-medium">Items</p>
                  <div className="space-y-1 rounded-md border p-2">
                    {selected.orderItems.map((item) => (
                      <div key={item.orderItemId} className="flex justify-between text-sm">
                        <span>
                          {item.productName ?? item.productId} ×{item.quantity}
                        </span>
                        <span>${item.unitPrice?.toFixed(2) ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Update Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as OrderStatus)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === selected?.status}
            >
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
