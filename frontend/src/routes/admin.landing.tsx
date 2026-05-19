import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/page-header";
import { useLanding, defaultContent, type LandingNews, type LandingProgram } from "@/lib/landing-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/landing")({ component: AdminLandingCMS });

function AdminLandingCMS() {
  const { content, update, reset } = useLanding();
  const [draft, setDraft] = useState(content);

  const save = () => { update(draft); toast.success("Đã lưu nội dung landing page"); };
  const doReset = () => { reset(); setDraft(defaultContent); toast.success("Đã khôi phục nội dung mặc định"); };

  const updateNews = (id: string, patch: Partial<LandingNews>) =>
    setDraft({ ...draft, news: draft.news.map((n) => n.id === id ? { ...n, ...patch } : n) });
  const deleteNews = (id: string) => setDraft({ ...draft, news: draft.news.filter((n) => n.id !== id) });
  const addNews = () => setDraft({ ...draft, news: [...draft.news, { id: `n${Date.now()}`, title: "Tin mới", date: new Date().toISOString().slice(0, 10), excerpt: "" }] });

  const updateProgram = (id: string, patch: Partial<LandingProgram>) =>
    setDraft({ ...draft, programs: draft.programs.map((p) => p.id === id ? { ...p, ...patch } : p) });
  const deleteProgram = (id: string) => setDraft({ ...draft, programs: draft.programs.filter((p) => p.id !== id) });
  const addProgram = () => setDraft({ ...draft, programs: [...draft.programs, { id: `p${Date.now()}`, name: "Chương trình mới", description: "", duration: "4 năm" }] });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Landing Page"
        description="Chỉnh sửa nội dung hiển thị tại trang chủ công khai (/, /about, /programs, /news, /admissions, /contact)."
        actions={
          <>
            <Button variant="outline" onClick={doReset} className="gap-2"><RotateCcw className="h-4 w-4" />Khôi phục mặc định</Button>
            <Button onClick={save} className="gap-2"><Save className="h-4 w-4" />Lưu thay đổi</Button>
          </>
        }
      />

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Hero</h2>
        <div className="mt-4 grid gap-3">
          <div className="space-y-1.5"><Label>Tiêu đề chính</Label><Input value={draft.heroTitle} onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Mô tả</Label><Textarea rows={3} value={draft.heroSubtitle} onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>CTA chính</Label><Input value={draft.heroCtaPrimary} onChange={(e) => setDraft({ ...draft, heroCtaPrimary: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>CTA phụ</Label><Input value={draft.heroCtaSecondary} onChange={(e) => setDraft({ ...draft, heroCtaSecondary: e.target.value })} /></div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Giới thiệu</h2>
        <div className="mt-4 grid gap-3">
          <div className="space-y-1.5"><Label>Tiêu đề</Label><Input value={draft.aboutTitle} onChange={(e) => setDraft({ ...draft, aboutTitle: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Nội dung</Label><Textarea rows={5} value={draft.aboutBody} onChange={(e) => setDraft({ ...draft, aboutBody: e.target.value })} /></div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Số liệu nổi bật</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {draft.stats.map((s, i) => (
            <div key={i} className="rounded-lg border p-3">
              <Input className="font-semibold" value={s.value} onChange={(e) => { const n = [...draft.stats]; n[i] = { ...n[i], value: e.target.value }; setDraft({ ...draft, stats: n }); }} />
              <Input className="mt-2 text-xs" value={s.label} onChange={(e) => { const n = [...draft.stats]; n[i] = { ...n[i], label: e.target.value }; setDraft({ ...draft, stats: n }); }} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chương trình đào tạo</h2>
          <Button size="sm" variant="outline" onClick={addProgram} className="gap-1"><Plus className="h-3 w-3" />Thêm</Button>
        </div>
        <div className="mt-4 space-y-3">
          {draft.programs.map((p) => (
            <div key={p.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_120px_auto]">
              <Input placeholder="Tên" value={p.name} onChange={(e) => updateProgram(p.id, { name: e.target.value })} />
              <Input placeholder="Mô tả" value={p.description} onChange={(e) => updateProgram(p.id, { description: e.target.value })} />
              <Input placeholder="Thời lượng" value={p.duration} onChange={(e) => updateProgram(p.id, { duration: e.target.value })} />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProgram(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tin tức</h2>
          <Button size="sm" variant="outline" onClick={addNews} className="gap-1"><Plus className="h-3 w-3" />Thêm</Button>
        </div>
        <div className="mt-4 space-y-3">
          {draft.news.map((n) => (
            <div key={n.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[2fr_140px_auto]">
              <Input placeholder="Tiêu đề" value={n.title} onChange={(e) => updateNews(n.id, { title: e.target.value })} />
              <Input type="date" value={n.date} onChange={(e) => updateNews(n.id, { date: e.target.value })} />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteNews(n.id)}><Trash2 className="h-4 w-4" /></Button>
              <Textarea className="sm:col-span-3" rows={2} placeholder="Tóm tắt" value={n.excerpt} onChange={(e) => updateNews(n.id, { excerpt: e.target.value })} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Liên hệ & Tuyển sinh</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Địa chỉ</Label><Input value={draft.contactAddress} onChange={(e) => setDraft({ ...draft, contactAddress: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Điện thoại</Label><Input value={draft.contactPhone} onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={draft.contactEmail} onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Hotline tuyển sinh</Label><Input value={draft.admissionsHotline} onChange={(e) => setDraft({ ...draft, admissionsHotline: e.target.value })} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Hạn nộp hồ sơ</Label><Input value={draft.admissionsDeadline} onChange={(e) => setDraft({ ...draft, admissionsDeadline: e.target.value })} /></div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={doReset} className="gap-2"><RotateCcw className="h-4 w-4" />Khôi phục</Button>
        <Button onClick={save} className="gap-2"><Save className="h-4 w-4" />Lưu thay đổi</Button>
      </div>
    </div>
  );
}
