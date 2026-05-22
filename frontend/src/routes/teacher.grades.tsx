import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { classSections, enrollments, getStudent, getCourse } from "@/data/mock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/grades")({ component: GradesPage });

function GradesPage() {
  const [csId, setCsId] = useState(classSections[0].id);
  const enrs = enrollments.filter((e) => e.classSectionId === csId && e.status === "SUCCESS");
  const [rows, setRows] = useState<Record<string, { att: number; mid: number; fin: number; retake: number }>>(() =>
    Object.fromEntries(enrs.map((e, i) => [e.id, { att: 8, mid: 6 + (i % 3), fin: 7 + (i % 3), retake: 0 }])));

  const calc = (r: { att: number; mid: number; fin: number }) => +(r.att * 0.1 + r.mid * 0.3 + r.fin * 0.6).toFixed(2);
  const letter = (t: number) => t >= 8.5 ? "A" : t >= 7 ? "B" : t >= 5.5 ? "C" : t >= 4 ? "D" : "F";
  const gpa4 = (t: number) => t >= 8.5 ? 4 : t >= 7 ? 3 : t >= 5.5 ? 2 : t >= 4 ? 1 : 0;

  const update = (id: string, key: "att" | "mid" | "fin" | "retake", v: string) => {
    const n = Number(v);
    if (n < 0 || n > 10 || Number.isNaN(n)) { toast.error("Điểm phải trong khoảng 0–10"); return; }
    setRows((r) => ({ ...r, [id]: { ...r[id], [key]: n } }));
  };

  return (
    <div>
      <PageHeader title="Nhập điểm" description="Bảng điểm dạng spreadsheet" actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Đã lưu thay đổi")}><Save className="h-4 w-4" />Lưu</Button>
          <Button className="gap-2" onClick={() => toast.success("Đã khóa điểm lớp này")}><Lock className="h-4 w-4" />Khóa điểm</Button>
        </div>
      } />

      <div className="mb-4">
        <Select value={csId} onValueChange={(v) => { setCsId(v); }}>
          <SelectTrigger className="w-[400px]"><SelectValue /></SelectTrigger>
          <SelectContent>{classSections.map((cs) => <SelectItem key={cs.id} value={cs.id}>{cs.code} — {getCourse(cs.courseId).name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader><TableRow className="bg-muted/40">
            <TableHead>Sinh viên</TableHead><TableHead className="w-24">Chuyên cần</TableHead><TableHead className="w-24">Giữa kỳ</TableHead><TableHead className="w-24">Cuối kỳ</TableHead><TableHead className="w-24">Thi lại</TableHead><TableHead>Tổng</TableHead><TableHead>Chữ</TableHead><TableHead>GPA4</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {enrs.length === 0 ? <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Không có sinh viên đăng ký lớp này.</TableCell></TableRow>
              : enrs.map((e) => {
                const s = getStudent(e.studentId);
                const r = rows[e.id];
                const t = calc(r);
                return (
                  <TableRow key={e.id}>
                    <TableCell><div className="font-medium text-sm">{s.fullName}</div><div className="text-xs text-muted-foreground font-mono">{s.code}</div></TableCell>
                    {(["att","mid","fin","retake"] as const).map((k) => (
                      <TableCell key={k}><Input type="number" min={0} max={10} step={0.1} value={r[k]} onChange={(ev) => update(e.id, k, ev.target.value)} className={cn("h-8 w-20 tabular-nums", (r[k] < 0 || r[k] > 10) && "border-destructive")} /></TableCell>
                    ))}
                    <TableCell className="tabular-nums font-semibold">{t}</TableCell>
                    <TableCell><span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{letter(t)}</span></TableCell>
                    <TableCell className="tabular-nums">{gpa4(t).toFixed(1)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
