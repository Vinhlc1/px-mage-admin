"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Input } from "@/components/ui/input";
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
import type {
  CardCondition,
  CardProduct,
  CardProductBindRequest,
  CardProductRequest,
  CardProductStatus,
  CardTemplate,
} from "@/types";

const CONDITIONS: CardCondition[] = ["NEW", "GOOD", "DAMAGED"];

const STATUS_FILTERS: Array<CardProductStatus | "ALL"> = [
  "ALL",
  "PENDING_BIND",
  "READY",
  "SOLD",
  "LINKED",
  "DEACTIVATED",
];

const EMPTY_CREATE: CardProductRequest = {
  cardTemplateId: 0,
  serialNumber: "",
  productionBatch: "",
  condition: "NEW",
};

function statusVariant(
  status: CardProductStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "READY" || status === "LINKED") return "default";
  if (status === "SOLD") return "secondary";
  if (status === "DEACTIVATED") return "destructive";
  return "outline";
}

export function CardProductsFeature() {
  const [items, setItems] = useState<CardProduct[]>([]);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CardProductStatus | "ALL">("ALL");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CardProductRequest>(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);

  // Bind dialog
  const [bindId, setBindId] = useState<number | null>(null);
  const [nfcUid, setNfcUid] = useState("");
  const [binding, setBinding] = useState(false);

  // Deactivate confirm
  const [deactivateId, setDeactivateId] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [cpRes, tplRes] = await Promise.all([
      apiClient.get<CardProduct[]>("/api/card-products"),
      apiClient.get<CardTemplate[]>("/api/card-templates"),
    ]);
    if (cpRes.error) toast.error(cpRes.error);
    else setItems(Array.isArray(cpRes.data) ? cpRes.data : []);
    if (!tplRes.error) setTemplates(Array.isArray(tplRes.data) ? tplRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered =
    statusFilter === "ALL" ? items : items.filter((i) => i.status === statusFilter);

  const handleCreate = async () => {
    setCreating(true);
    const { error } = await apiClient.post<CardProduct>(
      "/api/card-products",
      createForm,
    );
    setCreating(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Card product created.");
    setCreateOpen(false);
    setCreateForm(EMPTY_CREATE);
    fetchAll();
  };

  const handleBind = async () => {
    if (bindId === null || !nfcUid.trim()) return;
    setBinding(true);
    const body: CardProductBindRequest = { nfcUid: nfcUid.trim() };
    const { error } = await apiClient.put<CardProduct>(
      `/api/card-products/${bindId}/bind`,
      body,
    );
    setBinding(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("NFC UID bound.");
    setBindId(null);
    setNfcUid("");
    fetchAll();
  };

  const handleDeactivate = async () => {
    if (deactivateId === null) return;
    const { error } = await apiClient.put<CardProduct>(
      `/api/card-products/${deactivateId}`,
      { status: "DEACTIVATED" },
    );
    setDeactivateId(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Card deactivated.");
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">NFC Card Products</h1>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as CardProductStatus | "ALL")
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => {
                setCreateForm(EMPTY_CREATE);
                setCreateOpen(true);
              }}
            >
              <PlusIcon className="mr-1 size-4" /> Add Card
            </Button>
          </div>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["ID", "Template", "Serial #", "Batch", "Condition", "Status", "NFC UID", "Actions"].map(
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
                  <TableHead>Template</TableHead>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>NFC UID</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No card products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cp) => (
                    <TableRow key={cp.cardProductId}>
                      <TableCell className="font-mono text-sm">
                        {cp.cardProductId}
                      </TableCell>
                      <TableCell>
                        {cp.template?.name ??
                          templates.find(
                            (t) => t.cardTemplateId === cp.cardTemplateId,
                          )?.name ??
                          cp.cardTemplateId}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {cp.serialNumber ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cp.productionBatch ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cp.condition}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(cp.status)}>
                          {cp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {cp.nfcUid ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {cp.status === "PENDING_BIND" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Bind NFC UID"
                            onClick={() => {
                              setBindId(cp.cardProductId);
                              setNfcUid("");
                            }}
                          >
                            <Link2 className="size-4" />
                          </Button>
                        )}
                        {cp.status !== "DEACTIVATED" &&
                          cp.status !== "SOLD" &&
                          cp.status !== "LINKED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Deactivate"
                              onClick={() =>
                                setDeactivateId(cp.cardProductId)
                              }
                            >
                              <span className="size-4 text-destructive text-xs font-bold">✕</span>
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Card Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Card Template</Label>
              <Select
                value={
                  createForm.cardTemplateId ? String(createForm.cardTemplateId) : ""
                }
                onValueChange={(v) =>
                  setCreateForm((f) => ({ ...f, cardTemplateId: Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem
                      key={t.cardTemplateId}
                      value={String(t.cardTemplateId)}
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cp-serial">Serial Number</Label>
                <Input
                  id="cp-serial"
                  value={createForm.serialNumber ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, serialNumber: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="cp-batch">Production Batch</Label>
                <Input
                  id="cp-batch"
                  value={createForm.productionBatch ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      productionBatch: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Condition</Label>
              <Select
                value={createForm.condition}
                onValueChange={(v) =>
                  setCreateForm((f) => ({ ...f, condition: v as CardCondition }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bind NFC dialog */}
      <Dialog open={bindId !== null} onOpenChange={() => setBindId(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Bind NFC UID</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="nfc-uid">NFC UID</Label>
            <Input
              id="nfc-uid"
              placeholder="Scan or enter NFC chip UID"
              value={nfcUid}
              onChange={(e) => setNfcUid(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindId(null)}>
              Cancel
            </Button>
            <Button onClick={handleBind} disabled={binding || !nfcUid.trim()}>
              {binding ? "Binding..." : "Bind"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirm */}
      <AlertDialog
        open={deactivateId !== null}
        onOpenChange={() => setDeactivateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the card as DEACTIVATED. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
