import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, IdCard, Building2 } from "lucide-react";

export function ProfileView({ subtitle }: { subtitle: string }) {
  const { name, role } = useAuth();
  const initials = (name ?? "?").split(" ").slice(-2).map((s) => s[0]).join("").toUpperCase();
  const [form, setForm] = useState({
    fullName: name ?? "",
    email: role === "ADMIN" ? "admin@tlu.edu.vn" : role === "TEACHER" ? "teacher@tlu.edu.vn" : "student@tlu.edu.vn",
    phone: "0987 654 321",
    address: "Nghiêm Xuân Yêm, Hoàng Mai, Hà Nội",
    code: role === "ADMIN" ? "ADMIN-001" : role === "TEACHER" ? "GV-101" : "A40001",
    department: "Khoa Công nghệ Thông tin",
  });

  return (
    <div>
      <PageHeader title="Thông tin cá nhân" description={subtitle} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 text-center">
          <Avatar className="mx-auto h-24 w-24"><AvatarFallback className="bg-primary text-2xl text-primary-foreground">{initials}</AvatarFallback></Avatar>
          <div className="mt-4 text-lg font-semibold">{form.fullName}</div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{role}</div>
          <div className="mt-6 grid gap-2 text-left text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><IdCard className="h-4 w-4" />{form.code}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{form.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{form.phone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" />{form.department}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{form.address}</div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Cập nhật thông tin</h2>
          <p className="text-xs text-muted-foreground">Demo: dữ liệu chỉ lưu tạm trên trình duyệt.</p>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => { e.preventDefault(); toast.success("Đã lưu thông tin cá nhân"); }}
          >
            <div className="space-y-1.5"><Label>Họ và tên</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Mã số</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Số điện thoại</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Khoa / Đơn vị</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Địa chỉ</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="sm:col-span-2 flex justify-end"><Button type="submit">Lưu thay đổi</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/student/profile")({ component: () => <ProfileView subtitle="Thông tin sinh viên và liên hệ" /> });
