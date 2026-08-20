import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
// import { ImportContactsButton } from "@/components/crm/ImportContactsButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportContactsButton } from "@/components/crm/ImportContactsButton";
import { contactsQuery, displayName, profilesQuery, rolesQuery } from "@/lib/crm";
import { useCrmAuth } from "@/hooks/use-crm-auth";
import { adminCreateUser, adminDeleteUser, adminUpdateUser } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "Team management — LeadPilot CRM" },
      { name: "description", content: "Create teammates, set roles, reset passwords and control access." },
      { property: "og:title", content: "Team management — LeadPilot CRM" },
      { property: "og:description", content: "Create teammates, set roles and control access." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { isAdmin, loading, userId } = useCrmAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery(profilesQuery);
  const { data: roles = [] } = useQuery(rolesQuery);
  const { data: contacts = [] } = useQuery(contactsQuery);

  const createUser = useServerFn(adminCreateUser);
  const updateUser = useServerFn(adminUpdateUser);
  const deleteUser = useServerFn(adminDeleteUser);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "user" });
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    queryClient.invalidateQueries({ queryKey: ["user-roles"] });
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
  };

  const create = useMutation({
    mutationFn: () =>
      createUser({
        data: {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role as "admin" | "user",
        },
      }),
    onSuccess: () => {
      toast.success("User created");
      setOpen(false);
      setForm({ fullName: "", email: "", password: "", role: "user" });
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (input: {
      userId: string;
      role?: "admin" | "user";
      isActive?: boolean;
      password?: string;
    }) => updateUser({ data: input }),
    onSuccess: () => {
      toast.success("User updated");
      setResetFor(null);
      setNewPassword("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser({ data: { userId: id } }),
    onSuccess: () => {
      toast.success("User deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return null;

  const roleOf = (id: string) =>
    roles.find((r) => r.user_id === id)?.role ?? ("user" as "admin" | "user");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profiles.length} members</p>
        </div>
        <div className="flex gap-2">
          <ImportContactsButton />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-1.5 h-4 w-4" />
                New user
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create user</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full name</Label>
                <Input
                  className="mt-1.5"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-1.5"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Temporary password</Label>
                <Input
                  className="mt-1.5"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                Create user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="surface-panel shadow-card mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{displayName(p)}</TableCell>
                <TableCell className="text-muted-foreground">{p.email}</TableCell>
                <TableCell>
                  <Select
                    value={roleOf(p.id)}
                    onValueChange={(v) =>
                      update.mutate({ userId: p.id, role: v as "admin" | "user" })
                    }
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{contacts.filter((c) => c.assigned_to === p.id).length}</TableCell>
                <TableCell>
                  <Switch
                    checked={p.is_active}
                    onCheckedChange={(checked) =>
                      update.mutate({ userId: p.id, isActive: checked })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Reset password"
                      onClick={() => setResetFor(p.id)}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete user"
                      disabled={p.id === userId}
                      onClick={() => remove.mutate(p.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!resetFor} onOpenChange={(o) => !o && setResetFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
          </DialogHeader>
          <div>
            <Label>New password</Label>
            <Input
              className="mt-1.5"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => resetFor && update.mutate({ userId: resetFor, password: newPassword })}
              disabled={update.isPending || newPassword.length < 8}
            >
              Update password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}