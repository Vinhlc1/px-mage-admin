"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type { Role } from "@/types";

export function RolesFeature() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await apiClient.get<Role[]>("/api/roles");
    if (error) toast.error(error);
    else setRoles(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const openCreate = () => { setEditing(null); setRoleName(""); setDialogOpen(true); };
  const openEdit = (role: Role) => { setEditing(role); setRoleName(role.roleName); setDialogOpen(true); };

  const handleSave = async () => {
    if (!roleName.trim()) return;
    setSaving(true);
    const payload = { roleName };
    const result = editing
      ? await apiClient.put<Role>(`/api/roles/${editing.roleId}`, payload)
      : await apiClient.post<Role>("/api/roles", payload);
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(editing ? "Role updated." : "Role created.");
    setDialogOpen(false);
    fetchRoles();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const { error } = await apiClient.del(`/api/roles/${deleteId}`);
    setDeleteId(null);
    if (error) { toast.error(error); return; }
    toast.success("Role deleted.");
    fetchRoles();
  };

  return (
    <>
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-lg font-semibold">Roles</h1>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon className="mr-1 size-4" /> Add Role
          </Button>
        </div>
      </Header>

      <Main>
        {loading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 3 }).map((_, j) => (
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
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role, i) => (
                    <TableRow key={role.roleId ?? i}>
                      <TableCell className="font-mono text-sm">{role.roleId}</TableCell>
                      <TableCell>{role.roleName}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(role.roleId)}>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "Create Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. admin"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !roleName.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
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
