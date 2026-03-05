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
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api-client";
import type {
  ArcanaType,
  CardFramework,
  CardRarity,
  CardSuit,
  CardTemplate,
  CardTemplateRequest,
} from "@/types";

const ARCANA_TYPES: ArcanaType[] = ["MAJOR", "MINOR"];
const SUITS: CardSuit[] = ["WANDS", "CUPS", "SWORDS", "PENTACLES"];
const RARITIES: CardRarity[] = ["COMMON", "UNCOMMON", "RARE", "ULTRA_RARE"];

const EMPTY: CardTemplateRequest = {
  name: "",
  arcanaType: "MAJOR",
  rarity: "COMMON",
  active: true,
};

function rarityVariant(
  rarity: CardRarity,
): "default" | "secondary" | "outline" {
  if (rarity === "ULTRA_RARE") return "default";
  if (rarity === "RARE") return "secondary";
  return "outline";
}

export function CardTemplatesFeature() {
  const [items, setItems] = useState<CardTemplate[]>([]);
  const [frameworks, setFrameworks] = useState<CardFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<CardTemplate | null>(null);
  const [form, setForm] = useState<CardTemplateRequest>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [tplRes, fwRes] = await Promise.all([
      apiClient.get<CardTemplate[]>("/api/card-templates"),
      apiClient.get<CardFramework[]>("/api/card-frameworks"),
    ]);
    if (tplRes.error) toast.error(tplRes.error);
    else setItems(Array.isArray(tplRes.data) ? tplRes.data : []);
    if (!fwRes.error) setFrameworks(Array.isArray(fwRes.data) ? fwRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const field = <K extends keyof CardTemplateRequest>(
    k: K,
    v: CardTemplateRequest[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };
  const openEdit = (t: CardTemplate) => {
    setEditing(t);
    setForm({
      name: t.name,
      arcanaType: t.arcanaType,
      suit: t.suit,
      cardNumber: t.cardNumber,
      rarity: t.rarity,
      description: t.description ?? "",
      frameworkId: t.frameworkId,
      active: t.active,
      imagePath: t.imagePath ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = editing
      ? await apiClient.put<CardTemplate>(
          `/api/card-templates/${editing.cardTemplateId}`,
          form,
        )
      : await apiClient.post<CardTemplate>("/api/card-templates", form);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Card template updated." : "Card template created.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/card-templates/${deleteId}`);
    setDeleteId(null);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Card template deleted.");
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Card Templates</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> Add Template
          </Button>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["ID", "Name", "Arcana", "Suit", "Rarity", "Framework", "Active", "Actions"].map(
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
                  <TableHead>Name</TableHead>
                  <TableHead>Arcana</TableHead>
                  <TableHead>Suit</TableHead>
                  <TableHead>Rarity</TableHead>
                  <TableHead>Framework</TableHead>
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
                      No card templates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((t) => (
                    <TableRow key={t.cardTemplateId}>
                      <TableCell className="font-mono text-sm">
                        {t.cardTemplateId}
                      </TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.arcanaType}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.suit ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rarityVariant(t.rarity)}>
                          {t.rarity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {frameworks.find((f) => f.cardFrameworkId === t.frameworkId)
                          ?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.active ? "default" : "secondary"}>
                          {t.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(t.cardTemplateId)}
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
        <DialogContent aria-describedby={undefined} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Card Template" : "Create Card Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="ct-name">Name</Label>
              <Input
                id="ct-name"
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Arcana Type</Label>
                <Select
                  value={form.arcanaType}
                  onValueChange={(v) => field("arcanaType", v as ArcanaType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARCANA_TYPES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rarity</Label>
                <Select
                  value={form.rarity}
                  onValueChange={(v) => field("rarity", v as CardRarity)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RARITIES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.arcanaType === "MINOR" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Suit</Label>
                  <Select
                    value={form.suit ?? ""}
                    onValueChange={(v) => field("suit", v as CardSuit)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select suit" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUITS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ct-num">Card Number</Label>
                  <Input
                    id="ct-num"
                    type="number"
                    value={form.cardNumber ?? ""}
                    onChange={(e) =>
                      field("cardNumber", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>
            )}
            <div>
              <Label>Framework</Label>
              <Select
                value={form.frameworkId ? String(form.frameworkId) : ""}
                onValueChange={(v) => field("frameworkId", v ? Number(v) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((fw) => (
                    <SelectItem key={fw.cardFrameworkId} value={String(fw.cardFrameworkId)}>
                      {fw.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ct-img">Image Path (Cloudinary URL)</Label>
              <Input
                id="ct-img"
                placeholder="https://res.cloudinary.com/..."
                value={form.imagePath ?? ""}
                onChange={(e) => field("imagePath", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ct-desc">Description</Label>
              <Textarea
                id="ct-desc"
                rows={3}
                value={form.description ?? ""}
                onChange={(e) => field("description", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="ct-active"
                checked={form.active}
                onCheckedChange={(v) => field("active", v)}
              />
              <Label htmlFor="ct-active">Active (visible in shop)</Label>
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
            <AlertDialogTitle>Delete Card Template?</AlertDialogTitle>
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
