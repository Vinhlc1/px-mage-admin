"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { Account, AccountRequest, Role } from "@/types";

const EMPTY: AccountRequest = { email: "", password: "", name: "", phoneNumber: "", roleId: 0 };

export function AccountsFeature() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState<AccountRequest>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [accRes, roleRes] = await Promise.all([
      apiClient.get<Account[]>("/api/accounts"),
      apiClient.get<Role[]>("/api/roles"),
    ]);
    if (accRes.error) toast.error(accRes.error);
    else setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
    if (!roleRes.error) setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const field = (k: keyof AccountRequest, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (acc: Account) => {
    setEditing(acc);
    setForm({
      email: acc.email, password: "", name: acc.name,
      phoneNumber: acc.phoneNumber, roleId: acc.role?.roleId ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = editing
      ? await apiClient.put<Account>(`/api/accounts/${editing.customerId}`, form)
      : await apiClient.post<Account>("/api/accounts", form);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(editing ? "Account updated." : "Account created.");
    setDialogOpen(false);
    fetchAll();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/accounts/${deleteId}`);
    setDeleteId(null);
    if (error) { toast.error(error); return; }
    toast.success("Account deleted.");
    fetchAll();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Accounts</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> Add Account
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((acc, i) => (
                    <TableRow key={acc.customerId ?? i}>
                      <TableCell className="font-mono text-sm">{acc.customerId}</TableCell>
                      <TableCell>{acc.name}</TableCell>
                      <TableCell>{acc.email}</TableCell>
                      <TableCell>{acc.phoneNumber}</TableCell>
                      <TableCell>
                        {acc.role && <Badge variant="secondary">{acc.role.roleName}</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(acc)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(acc.customerId)}>
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
            <DialogTitle>{editing ? "Edit Account" : "Create Account"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { id: "name", label: "Name", key: "name" as const },
              { id: "email", label: "Email", key: "email" as const },
              { id: "phone", label: "Phone", key: "phoneNumber" as const },
            ].map(({ id, label, key }) => (
              <div key={id}>
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} value={form[key] as string} onChange={(e) => field(key, e.target.value)} />
              </div>
            ))}
            {!editing && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => field("password", e.target.value)} />
              </div>
            )}
            <div>
              <Label>Role</Label>
              <Select
                value={form.roleId ? String(form.roleId) : ""}
                onValueChange={(v) => field("roleId", Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.roleId} value={String(r.roleId)}>{r.roleName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
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
