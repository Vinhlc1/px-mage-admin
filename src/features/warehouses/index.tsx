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
import type { Warehouse, WarehouseRequest } from "@/types";

const EMPTY: WarehouseRequest = { name: "", address: "", city: "", state: "", zipCode: "" };

export function WarehousesFeature() {
  const [items, setItems] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<WarehouseRequest>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await apiClient.get<Warehouse[]>("/api/warehouses");
    if (error) toast.error(error);
    else setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const field = (k: keyof WarehouseRequest, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (w: Warehouse) => {
    setEditing(w);
    setForm({ name: w.name, address: w.address, city: w.city, state: w.state, zipCode: w.zipCode });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = editing
      ? await apiClient.put<Warehouse>(`/api/warehouses/${editing.warehouseId ?? editing.id}`, form)
      : await apiClient.post<Warehouse>("/api/warehouses", form);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(editing ? "Warehouse updated." : "Warehouse created.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/warehouses/${deleteId}`);
    setDeleteId(null);
    if (error) { toast.error(error); return; }
    toast.success("Warehouse deleted.");
    fetchAll();
  };

  const FIELDS: { id: string; label: string; key: keyof WarehouseRequest }[] = [
    { id: "name", label: "Name", key: "name" },
    { id: "address", label: "Address", key: "address" },
    { id: "city", label: "City", key: "city" },
    { id: "state", label: "State", key: "state" },
    { id: "zip", label: "Zip Code", key: "zipCode" },
  ];

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Warehouses</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> Add Warehouse
          </Button>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
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
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Zip</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No warehouses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((w, i) => (
                    <TableRow key={w.warehouseId ?? w.id ?? i}>
                      <TableCell className="font-mono text-sm">{w.warehouseId ?? w.id}</TableCell>
                      <TableCell>{w.name}</TableCell>
                      <TableCell>{w.address}</TableCell>
                      <TableCell>{w.city}</TableCell>
                      <TableCell>{w.state}</TableCell>
                      <TableCell>{w.zipCode}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(w)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(w.warehouseId ?? w.id ?? null)}>
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
            <DialogTitle>{editing ? "Edit Warehouse" : "Create Warehouse"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {FIELDS.map(({ id, label, key }) => (
              <div key={id}>
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} value={form[key]} onChange={(e) => field(key, e.target.value)} />
              </div>
            ))}
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
            <AlertDialogTitle>Delete Warehouse?</AlertDialogTitle>
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
