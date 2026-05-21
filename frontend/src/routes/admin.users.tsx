import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/api/admin";
import type { AdminUserResponse, Role } from "@/lib/api/types";
import { users as mockUsers } from "@/data/mock";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type AdminUserRow = {
  id: string;
  numericId?: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: string;
  lastLogin: string;
  source: "API" | "Mock";
};

const roleLabels: Record<Role, string> = {
  ADMIN: "Quan tri he thong",
  TEACHER: "Giang vien",
  STUDENT: "Sinh vien",
};

function UsersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "ADMIN" as Role,
    password: "password123",
  });

  const query = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.listUsers,
  });

  const rows = useMemo(() => {
    if (query.data?.length) return query.data.map(mapApiUser);
    return mockUsers.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      lastLogin: "Chua co API",
      source: "Mock" as const,
    }));
  }, [query.data]);

  const createMutation = useMutation({
    mutationFn: adminApi.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Da tao tai khoan admin");
      setForm({ username: "", email: "", fullName: "", role: "ADMIN", password: "password123" });
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Da cap nhat trang thai tai khoan");
    },
    onError: (error) => toast.error(error.message),
  });

  const submit = () => {
    if (form.role !== "ADMIN") {
      toast.info(
        "Backend hien chi co API tao tai khoan admin. Student/Teacher tao tai trang quan ly rieng.",
      );
      return;
    }
    createMutation.mutate({ username: form.username, email: form.email, password: form.password });
  };

  return (
    <div>
      <PageHeader
        title="Quan ly tai khoan"
        description={`${rows.length} tai khoan trong he thong${query.isError ? " - dang dung du lieu mau" : ""}`}
        actions={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Them tai khoan
          </Button>
        }
      />

      <DataTable
        data={rows}
        rowKey={(user) => user.id}
        searchPlaceholder="Tim theo username, ho ten, email, role..."
        columns={[
          {
            key: "username",
            header: "Username",
            render: (user) => <span className="font-mono text-xs">{user.username}</span>,
          },
          {
            key: "fullName",
            header: "Ho ten",
            render: (user) => (
              <div className="min-w-44">
                <div className="font-medium">{user.fullName}</div>
                <div className="mt-1 flex gap-1">
                  <Badge variant={user.source === "API" ? "secondary" : "outline"}>
                    {user.source}
                  </Badge>
                  {user.source === "API" && <Badge variant="outline">Can BE: fullName</Badge>}
                </div>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (user) => <span className="text-sm text-muted-foreground">{user.email}</span>,
          },
          {
            key: "role",
            header: "Vai tro",
            accessor: (user) => `${user.role} ${roleLabels[user.role]}`,
            render: (user) => (
              <div className="space-y-1">
                <StatusBadge value={user.role} />
                <div className="text-xs text-muted-foreground">{roleLabels[user.role]}</div>
              </div>
            ),
          },
          {
            key: "active",
            header: "Trang thai",
            render: (user) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={user.active}
                  disabled={!user.numericId || toggleMutation.isPending}
                  onCheckedChange={() => user.numericId && toggleMutation.mutate(user.numericId)}
                />
                <span className="text-xs text-muted-foreground">
                  {user.active ? "Active" : "Inactive"}
                </span>
              </div>
            ),
          },
          {
            key: "createdAt",
            header: "Tao luc",
            render: (user) => (
              <div className="text-xs text-muted-foreground">
                <div>{user.createdAt}</div>
                {user.source === "API" && <div>Can BE: createdAt</div>}
              </div>
            ),
          },
          {
            key: "lastLogin",
            header: "Dang nhap gan nhat",
            render: (user) => (
              <span className="text-xs text-muted-foreground">{user.lastLogin}</span>
            ),
          },
        ]}
      />

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Them tai khoan"
        description="Backend hien ho tro tao nhanh tai khoan ADMIN. Mat khau mac dinh co the doi trong form."
        onSubmit={submit}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Mat khau</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vai tro</Label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm({ ...form, role: toRole(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Ho ten hien thi</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Can BE: users.fullName"
            />
          </div>
        </div>
      </EntityFormDialog>
    </div>
  );
}

function mapApiUser(user: AdminUserResponse): AdminUserRow {
  return {
    id: String(user.id),
    numericId: user.id,
    username: user.username,
    email: user.email,
    fullName: `${roleLabels[user.role]} ${user.username}`,
    role: user.role,
    active: user.active,
    createdAt: `2026-05-${String((user.id % 20) + 1).padStart(2, "0")}`,
    lastLogin: "Can BE: lastLoginAt",
    source: "API",
  };
}

function toRole(value: string): Role {
  return value === "TEACHER" || value === "STUDENT" ? value : "ADMIN";
}
