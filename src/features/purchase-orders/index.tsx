"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { PurchaseOrder, PurchaseOrderRequest, Supplier, Warehouse } from "@/types";

const STATUSES = ["PENDING", "APPROVED", "RECEIVED", "CANCELLED"];

const EMPTY: PurchaseOrderRequest = {
  warehouseId: 0, supplierId: 0, poNumber: "", status: "PENDING",
  orderDate: new Date().toISOString(), expectedDelivery: new Date().toISOString(),
};

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "RECEIVED") return "default";
  if (status === "APPROVED") return "secondary";
  if (status === "CANCELLED") return "destructive";
  return "outline";
}

export function PurchaseOrdersFeature() {
  const [items, setItems] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<PurchaseOrderRequest>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [poRes, supRes, whRes] = await Promise.all([
      apiClient.get<PurchaseOrder[]>("/api/purchase-orders"),
      apiClient.get<Supplier[]>("/api/suppliers"),
      apiClient.get<Warehouse[]>("/api/warehouses"),
    ]);
    if (poRes.error) toast.error(poRes.error);
    else setItems(Array.isArray(poRes.data) ? poRes.data : []);
    if (!supRes.error) setSuppliers(Array.isArray(supRes.data) ? supRes.data : []);
    if (!whRes.error) setWarehouses(Array.isArray(whRes.data) ? whRes.data : []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const field = (k: keyof PurchaseOrderRequest, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (po: PurchaseOrder) => {
    setEditing(po);
    setForm({
      warehouseId: po.warehouseId, supplierId: po.supplierId, poNumber: po.poNumber,
      status: po.status, orderDate: po.orderDate, expectedDelivery: po.expectedDelivery,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = editing
      ? await apiClient.put<PurchaseOrder>(`/api/purchase-orders/${editing.poId}`, form)
      : await apiClient.post<PurchaseOrder>("/api/purchase-orders", form);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(editing ? "Purchase order updated." : "Purchase order created.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/purchase-orders/${deleteId}`);
    setDeleteId(null);
    if (error) { toast.error(error); return; }
    toast.success("Purchase order deleted.");
    fetchAll();
  };

  const supplierName = (id: number) => suppliers.find((s) => s.supplierId === id)?.name ?? id;
  const warehouseName = (id: number) => warehouses.find((w) => w.warehouseId === id)?.name ?? id;

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Purchase Orders</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> New PO
          </Button>
        </div>
      </Header>

      <Main>
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No purchase orders found.</TableCell>
                  </TableRow>
                ) : (
                  items.map((po, i) => (
                    <TableRow key={po.poId ?? i}>
                      <TableCell className="font-mono text-sm">{po.poId}</TableCell>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(po.status)}>{po.status}</Badge>
                      </TableCell>
                      <TableCell>{supplierName(po.supplierId)}</TableCell>
                      <TableCell>{warehouseName(po.warehouseId)}</TableCell>
                      <TableCell>{po.orderDate ? new Date(po.orderDate).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(po)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(po.poId)}>
                          <Trash2 className="size-4 text-destructive" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="poNumber">PO Number</Label>
              <Input id="poNumber" value={form.poNumber} onChange={(e) => field("poNumber", e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => field("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Supplier</Label>
              <Select value={form.supplierId ? String(form.supplierId) : ""} onValueChange={(v) => field("supplierId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => <SelectItem key={s.supplierId} value={String(s.supplierId)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select value={form.warehouseId ? String(form.warehouseId) : ""} onValueChange={(v) => field("warehouseId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w.warehouseId} value={String(w.warehouseId)}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="orderDate">Order Date</Label>
              <Input id="orderDate" type="date" value={form.orderDate?.split("T")[0] ?? ""} onChange={(e) => field("orderDate", new Date(e.target.value).toISOString())} />
            </div>
            <div>
              <Label htmlFor="expectedDelivery">Expected Delivery</Label>
              <Input id="expectedDelivery" type="date" value={form.expectedDelivery?.split("T")[0] ?? ""} onChange={(e) => field("expectedDelivery", new Date(e.target.value).toISOString())} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
