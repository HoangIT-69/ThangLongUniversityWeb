import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, StatCard } from "@/components/ui/page-header";
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
import { GraduationCap, Pencil, Plus, User, UserRound, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type AdminUserRow = {
  id: string;
  numericId?: number;
  profileId?: number;
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
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [toDelete, setToDelete] = useState<AdminUserRow | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "ADMIN" as Role,
    password: "password123",
    teacherCode: "",
    studentCode: "",
    majorId: "",
    academicYear: String(new Date().getFullYear()),
  });
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    fullName: "",
  });

  const query = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.listUsers,
  });

  const majorsQuery = useQuery({
    queryKey: ["admin", "majors"],
    queryFn: adminApi.listMajors,
  });

  const rows = useMemo(() => {
    if (query.data?.length) return query.data.map(mapApiUser);
    return mockUsers.map((user) => ({
      id: user.id,
      numericId: Number(user.id),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      lastLogin: "Chua dang nhap",
      source: "Mock" as const,
    }));
  }, [query.data]);

  const filteredRows = useMemo(() => {
    if (roleFilter === "ALL") return rows;
    return rows.filter((row) => row.role === roleFilter);
  }, [roleFilter, rows]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      admins: rows.filter((row) => row.role === "ADMIN").length,
      teachers: rows.filter((row) => row.role === "TEACHER").length,
      students: rows.filter((row) => row.role === "STUDENT").length,
    }),
    [rows],
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (form.role === "ADMIN") {
        return adminApi.createAdmin({
          username: form.username,
          email: form.email,
          password: form.password,
        });
      }

      if (form.role === "TEACHER") {
        if (!form.teacherCode.trim() || !form.fullName.trim()) {
          throw new Error("Vui long nhap ma giang vien va ho ten");
        }
        return adminApi.createTeacher({
          username: form.username,
          email: form.email,
          password: form.password,
          teacherCode: form.teacherCode.trim(),
          fullName: form.fullName.trim(),
        });
      }

      if (!form.studentCode.trim() || !form.fullName.trim()) {
        throw new Error("Vui long nhap ma sinh vien va ho ten");
      }
      if (!form.majorId) {
        throw new Error("Vui long chon nganh cho sinh vien");
      }

      return adminApi.createStudent({
        username: form.username,
        email: form.email,
        password: form.password,
        studentCode: form.studentCode.trim(),
        fullName: form.fullName.trim(),
        dob: "2000-01-01",
        majorId: Number(form.majorId),
        academicYear: Number(form.academicYear) || new Date().getFullYear(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Da tao tai khoan");
      setForm({
        username: "",
        email: "",
        fullName: "",
        role: "ADMIN",
        password: "password123",
        teacherCode: "",
        studentCode: "",
        majorId: "",
        academicYear: String(new Date().getFullYear()),
      });
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

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { username: string; email: string; fullName: string };
    }) => adminApi.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Da cap nhat tai khoan");
      setEditingUser(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (user: AdminUserRow) => {
      if (user.role === "ADMIN") {
        if (!user.numericId) throw new Error("Khong tim thay id tai khoan ADMIN");
        return adminApi.deleteAdminUser(user.numericId);
      }
      if (user.role === "STUDENT") {
        if (!user.profileId) throw new Error("Khong tim thay student id de xoa");
        return adminApi.deleteStudent(user.profileId);
      }
      if (!user.profileId) throw new Error("Khong tim thay teacher id de xoa");
      return adminApi.deleteTeacher(user.profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Da xoa tai khoan");
      setToDelete(null);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Khong xoa duoc tai khoan"),
  });

  const submit = async () => {
    await createMutation.mutateAsync();
  };

  const submitEdit = async () => {
    if (!editingUser?.numericId) {
      toast.error("Khong tim thay tai khoan can cap nhat");
      return;
    }
    await updateMutation.mutateAsync({
      id: editingUser.numericId,
      payload: {
        username: editForm.username,
        email: editForm.email,
        fullName: editForm.fullName,
      },
    });
  };

  const openEditDialog = (user: AdminUserRow) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    });
  };

  return (
    <div>
      <PageHeader title="Quan ly tai khoan" />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tai khoan trong he thong"
          value={stats.total}
          icon={Users}
          tone="primary"
        />
        <StatCard label="TK admin" value={stats.admins} icon={User} tone="warning" />
        <StatCard
          label="Tai khoan giang vien"
          value={stats.teachers}
          icon={GraduationCap}
          tone="info"
        />
        <StatCard
          label="Tai khoan sinh vien"
          value={stats.students}
          icon={UserRound}
          tone="success"
        />
      </div>

      <DataTable
        data={filteredRows}
        rowKey={(user) => user.id}
        searchPlaceholder="Tim theo username, ho ten, email, role..."
        searchSlot={
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(toRoleFilter(value))}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Loc vai tro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tat ca vai tro</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
            </SelectContent>
          </Select>
        }
        toolbar={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Them tai khoan
          </Button>
        }
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
              <div className="min-w-44 space-y-1">
                <div className="font-medium">{user.fullName}</div>
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
          {
            key: "actions",
            header: "",
            className: "w-32 text-right",
            searchable: false,
            render: (user) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!user.numericId}
                  onClick={() => openEditDialog(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-3 text-destructive"
                  disabled={!user.numericId || deleteMutation.isPending}
                  onClick={() => setToDelete(user)}
                >
                  <Trash2 className="h-4 w-4" />
                  Xoa
                </Button>
              </div>
            ),
          },
        ]}
      />

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Them tai khoan"
        description="Ho tro tao tai khoan ADMIN, TEACHER, STUDENT tu mot form"
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
              onValueChange={(value) =>
                setForm({
                  ...form,
                  role: toRole(value),
                  teacherCode: "",
                  studentCode: "",
                  majorId: "",
                })
              }
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
          {form.role !== "ADMIN" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Ho ten hien thi</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
          )}
          {form.role === "TEACHER" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Ma giang vien</Label>
              <Input
                value={form.teacherCode}
                onChange={(e) => setForm({ ...form, teacherCode: e.target.value })}
                required
              />
            </div>
          )}
          {form.role === "STUDENT" && (
            <>
              <div className="space-y-1.5">
                <Label>Ma sinh vien</Label>
                <Input
                  value={form.studentCode}
                  onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nien khoa</Label>
                <Input
                  type="number"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Nganh</Label>
                <Select
                  value={form.majorId}
                  onValueChange={(value) => setForm({ ...form, majorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon nganh" />
                  </SelectTrigger>
                  <SelectContent>
                    {(majorsQuery.data ?? []).map((major) => (
                      <SelectItem key={major.id} value={String(major.id)}>
                        {major.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </EntityFormDialog>

      <EntityFormDialog
        open={!!editingUser}
        onOpenChange={(value) => !value && setEditingUser(null)}
        title="Sua tai khoan"
        description="Cap nhat username, email va ho ten hien thi"
        onSubmit={submitEdit}
        submitText="Luu thay doi"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Ho ten hien thi</Label>
            <Input
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              required
            />
          </div>
        </div>
      </EntityFormDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(value) => !value && setToDelete(null)}
        title="Xoa tai khoan?"
        description={`Hanh dong nay khong the hoan tac. Tai khoan: ${toDelete?.username}. Neu tai khoan da phat sinh du lieu lien ket (hoc phi, diem, dang ky mon), he thong se tu choi xoa va tra ve ly do cu the.`}
        destructive
        confirmText="Xoa"
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete);
        }}
      />
    </div>
  );
}

function mapApiUser(user: AdminUserResponse): AdminUserRow {
  return {
    id: String(user.id),
    numericId: user.id,
    profileId: user.profileId ?? undefined,
    username: user.username,
    email: user.email,
    fullName: user.fullName?.trim() || `${roleLabels[user.role]} ${user.username}`,
    role: user.role,
    active: user.active,
    createdAt: formatDateTime(user.createdAt),
    lastLogin: formatDateTime(user.lastLoginAt, "Chua dang nhap"),
    source: "API",
  };
}

function toRole(value: string): Role {
  return value === "TEACHER" || value === "STUDENT" ? value : "ADMIN";
}

function toRoleFilter(value: string): "ALL" | Role {
  return value === "ALL" || value === "TEACHER" || value === "STUDENT" || value === "ADMIN"
    ? value
    : "ALL";
}

function formatDateTime(value?: string | null, fallback = "-") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
