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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { Product, ProductRequest, ProductType } from "@/types";

const PRODUCT_TYPES: ProductType[] = ["BUNDLE", "BLIND_BOX", "SINGLE_EVENT"];

const EMPTY: ProductRequest = {
  name: "",
  productType: "SINGLE_EVENT",
  isActive: true,
};

function typeLabel(type: ProductType): string {
  if (type === "BLIND_BOX") return "Blind Box";
  if (type === "SINGLE_EVENT") return "Single / Event";
  return "Bundle";
}

export function ProductsFeature() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductRequest>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await apiClient.get<Product[]>("/api/products");
    if (error) toast.error(error);
    else setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const field = <K extends keyof ProductRequest>(k: K, v: ProductRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      productType: p.productType,
      isActive: p.isActive,
      description: p.description ?? "",
      price: p.price,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = editing
      ? await apiClient.put<Product>(`/api/products/${editing.productId}`, form)
      : await apiClient.post<Product>("/api/products", form);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Product updated." : "Product created.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/products/${deleteId}`);
    setDeleteId(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Product deleted.");
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Products</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> Add Product
          </Button>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["ID", "Name", "Type", "Price", "Active", "Actions"].map((h) => (
                    <TableHead key={h}>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
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
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((p) => (
                    <TableRow key={p.productId}>
                      <TableCell className="font-mono text-sm">
                        {p.productId}
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {typeLabel(p.productType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.price != null
                          ? `$${p.price.toFixed(2)}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.isActive ? "default" : "secondary"}>
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(p.productId)}
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
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="prod-name">Name</Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
              />
            </div>
            <div>
              <Label>Product Type</Label>
              <Select
                value={form.productType}
                onValueChange={(v) => field("productType", v as ProductType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prod-price">Price ($)</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                value={form.price ?? ""}
                onChange={(e) =>
                  field("price", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div>
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                rows={3}
                value={form.description ?? ""}
                onChange={(e) => field("description", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="prod-active"
                checked={form.isActive}
                onCheckedChange={(v) => field("isActive", v)}
              />
              <Label htmlFor="prod-active">Active (visible in shop)</Label>
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
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
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
