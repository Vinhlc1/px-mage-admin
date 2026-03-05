"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Skeleton } from "@/components/ui/skeleton";
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
import { apiClient } from "@/lib/api-client";
import type { Inventory, InventoryRequest } from "@/types";

const EMPTY: InventoryRequest = { productId: 0, warehouseId: 0, quantity: 0, lastChecked: new Date().toISOString() };

export function InventoryFeature() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [form, setForm] = useState<InventoryRequest>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await apiClient.get<Inventory[]>("/api/inventory");
    if (error) toast.error(error);
    else setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const field = (k: keyof InventoryRequest, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (inv: Inventory) => {
    setEditing(inv);
    setForm({ productId: inv.productId, warehouseId: inv.warehouseId, quantity: inv.quantity, lastChecked: inv.lastChecked });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = editing
      ? await apiClient.put<Inventory>(`/api/inventory/${editing.inventoryId ?? editing.id}`, form)
      : await apiClient.post<Inventory>("/api/inventory", form);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(editing ? "Inventory updated." : "Inventory created.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/inventory/${deleteId}`);
    setDeleteId(null);
    if (error) { toast.error(error); return; }
    toast.success("Inventory record deleted.");
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Inventory</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> Add Record
          </Button>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
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
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Warehouse ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No records found.</TableCell>
                  </TableRow>
                ) : (
                  items.map((inv, i) => (
                    <TableRow key={inv.inventoryId ?? inv.id ?? i}>
                      <TableCell className="font-mono text-sm">{inv.inventoryId ?? inv.id}</TableCell>
                      <TableCell>{inv.productId}</TableCell>
                      <TableCell>{inv.warehouseId}</TableCell>
                      <TableCell>{inv.quantity}</TableCell>
                      <TableCell>{inv.lastChecked ? new Date(inv.lastChecked).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(inv)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(inv.inventoryId ?? inv.id ?? null)}>
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
            <DialogTitle>{editing ? "Edit Inventory" : "Create Inventory"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="productId">Product ID</Label>
              <Input id="productId" type="number" value={form.productId} onChange={(e) => field("productId", Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="warehouseId">Warehouse ID</Label>
              <Input id="warehouseId" type="number" value={form.warehouseId} onChange={(e) => field("warehouseId", Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" value={form.quantity} onChange={(e) => field("quantity", Number(e.target.value))} />
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
            <AlertDialogTitle>Delete Inventory Record?</AlertDialogTitle>
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
