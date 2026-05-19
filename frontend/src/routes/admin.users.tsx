import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { users as initialUsers, type User } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EntityFormDialog } from "@/components/forms/EntityFormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const [data, setData] = useState<User[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", fullName: "", role: "ADMIN" as User["role"] });

  const toggle = (id: string) => {
    setData((d) => d.map((u) => u.id === id ? { ...u, active: !u.active } : u));
    toast.success("Đã cập nhật trạng thái");
  };

  return (
    <div>
      <PageHeader
        title="Quản lý tài khoản"
        description={`${data.length} tài khoản trong hệ thống`}
        actions={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Thêm tài khoản</Button>}
      />

      <DataTable
        data={data}
        rowKey={(u) => u.id}
        searchPlaceholder="Tìm theo tên, email, role…"
        columns={[
          { key: "username", header: "Username", render: (u) => <span className="font-mono text-xs">{u.username}</span> },
          { key: "fullName", header: "Họ tên", render: (u) => <span className="font-medium">{u.fullName}</span> },
          { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
          { key: "role", header: "Role", render: (u) => <StatusBadge value={u.role} /> },
          { key: "active", header: "Trạng thái", render: (u) => (
            <div className="flex items-center gap-2">
              <Switch checked={u.active} onCheckedChange={() => toggle(u.id)} />
              <span className="text-xs text-muted-foreground">{u.active ? "Active" : "Inactive"}</span>
            </div>
          )},
          { key: "createdAt", header: "Tạo lúc", render: (u) => <span className="text-xs text-muted-foreground">{u.createdAt}</span> },
        ]}
      />

      <EntityFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Thêm tài khoản"
        description="Tạo tài khoản admin demo (chưa lưu thật)."
        onSubmit={() => {
          setData((d) => [{ id: `u${Date.now()}`, active: true, createdAt: new Date().toISOString().slice(0, 10), ...form }, ...d]);
          toast.success("Đã tạo tài khoản mới");
          setForm({ username: "", email: "", fullName: "", role: "ADMIN" });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Họ tên</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Vai trò</Label>
            <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </EntityFormDialog>
    </div>
  );
}
