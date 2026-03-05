"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/lib/api-client";
import type { Voucher, VoucherRequest } from "@/types";

const EMPTY: VoucherRequest = {
  code: "",
  discountPercent: 0,
  maxUses: 1,
  active: true,
};

export function VouchersFeature() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherRequest>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await apiClient.get<Voucher[]>("/api/vouchers");
    if (error) toast.error(error);
    else setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const field = <K extends keyof VoucherRequest>(k: K, v: VoucherRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditing(v);
    setForm({
      code: v.code,
      discountAmount: v.discountAmount,
      discountPercent: v.discountPercent,
      maxUses: v.maxUses,
      active: v.active,
      expiresAt: v.expiresAt ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = editing
      ? await apiClient.put<Voucher>(`/api/vouchers/${editing.voucherId}`, form)
      : await apiClient.post<Voucher>("/api/vouchers", form);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Voucher updated." : "Voucher created.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/vouchers/${deleteId}`);
    setDeleteId(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Voucher deleted.");
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Vouchers</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> New Voucher
          </Button>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["ID", "Code", "Discount", "%", "Uses", "Expires", "Active", "Actions"].map(
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
                    {Array.from({ length: 8 }).map((_, j) => (
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
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount $</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No vouchers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((v) => (
                    <TableRow key={v.voucherId}>
                      <TableCell className="font-mono text-sm">
                        {v.voucherId}
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {v.code}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.discountAmount != null ? `$${v.discountAmount}` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.discountPercent != null ? `${v.discountPercent}%` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.usedCount ?? 0} / {v.maxUses}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {v.expiresAt
                          ? new Date(v.expiresAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={v.active ? "default" : "secondary"}>
                          {v.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(v)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(v.voucherId)}
                        >
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
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Voucher" : "Create Voucher"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="v-code">Code</Label>
              <Input
                id="v-code"
                placeholder="SUMMER2025"
                value={form.code}
                onChange={(e) => field("code", e.target.value.toUpperCase())}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="v-amount">Discount Amount ($)</Label>
                <Input
                  id="v-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.discountAmount ?? ""}
                  onChange={(e) =>
                    field(
                      "discountAmount",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="v-pct">Discount Percent (%)</Label>
                <Input
                  id="v-pct"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={form.discountPercent ?? ""}
                  onChange={(e) =>
                    field(
                      "discountPercent",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="v-max">Max Uses</Label>
              <Input
                id="v-max"
                type="number"
                min="1"
                value={form.maxUses ?? 1}
                onChange={(e) =>
                  field("maxUses", e.target.value ? Number(e.target.value) : 1)
                }
              />
            </div>
            <div>
              <Label htmlFor="v-expires">Expires At</Label>
              <Input
                id="v-expires"
                type="datetime-local"
                value={form.expiresAt ?? ""}
                onChange={(e) => field("expiresAt", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="v-active"
                checked={form.active}
                onCheckedChange={(v) => field("active", v)}
              />
              <Label htmlFor="v-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
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
