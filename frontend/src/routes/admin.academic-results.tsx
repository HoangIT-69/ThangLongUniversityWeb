import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { students, semesters, enrollments, grades, getClassSection, getCourse } from "@/data/mock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/academic-results")({ component: AcademicResults });

function AcademicResults() {
  const [studentId, setStudentId] = useState(students[0].id);
  const [semesterId, setSemesterId] = useState(semesters[0].id);

  const enrs = enrollments.filter((e) => e.studentId === studentId && e.semesterId === semesterId && e.status === "SUCCESS");
  const rows = enrs.map((e) => {
    const g = grades.find((gr) => gr.enrollmentId === e.id);
    const cs = getClassSection(e.classSectionId);
    const c = getCourse(cs.courseId);
    return { e, g, cs, c };
  });
  const credits = rows.reduce((s, r) => s + (r.g ? r.c.credits : 0), 0);
  const gpa = credits === 0 ? 0 : +(rows.reduce((s, r) => s + (r.g ? r.g.gpa4 * r.c.credits : 0), 0) / credits).toFixed(2);

  return (
    <div>
      <PageHeader title="Kết quả học tập" description="Xem & tính toán GPA / CPA cho sinh viên" actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Đã tính lại GPA (demo)")}><Calculator className="h-4 w-4" />Calculate GPA</Button>
          <Button className="gap-2" onClick={() => toast.success("Đã khóa điểm học kỳ (demo)")}><Lock className="h-4 w-4" />Lock Semester</Button>
        </div>
      } />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.fullName}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={semesterId} onValueChange={setSemesterId}>
          <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
          <SelectContent>{semesters.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4"><div className="text-xs text-muted-foreground">GPA học kỳ</div><div className="mt-1 text-2xl font-semibold tabular-nums">{gpa.toFixed(2)}</div></div>
        <div className="rounded-xl border bg-card p-4"><div className="text-xs text-muted-foreground">CPA tích lũy</div><div className="mt-1 text-2xl font-semibold tabular-nums">{(students.find(s => s.id === studentId)?.cpa ?? 0).toFixed(2)}</div></div>
        <div className="rounded-xl border bg-card p-4"><div className="text-xs text-muted-foreground">Tín chỉ kỳ này</div><div className="mt-1 text-2xl font-semibold tabular-nums">{credits}</div></div>
        <div className="rounded-xl border bg-card p-4"><div className="text-xs text-muted-foreground">Tổng tín chỉ</div><div className="mt-1 text-2xl font-semibold tabular-nums">{students.find(s => s.id === studentId)?.credits ?? 0}</div></div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow className="bg-muted/40">
            <TableHead>Môn học</TableHead><TableHead>TC</TableHead><TableHead>Chuyên cần</TableHead><TableHead>Giữa kỳ</TableHead><TableHead>Cuối kỳ</TableHead><TableHead>Tổng</TableHead><TableHead>Chữ</TableHead><TableHead>GPA4</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Không có môn nào trong học kỳ này.</TableCell></TableRow>
              : rows.map((r) => (
                <TableRow key={r.e.id}>
                  <TableCell><div className="font-medium">{r.c.name}</div><div className="text-xs text-muted-foreground font-mono">{r.c.code}</div></TableCell>
                  <TableCell className="tabular-nums">{r.c.credits}</TableCell>
                  <TableCell className="tabular-nums">{r.g?.attendance ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{r.g?.midterm ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{r.g?.final ?? "—"}</TableCell>
                  <TableCell className="tabular-nums font-semibold">{r.g?.total ?? "—"}</TableCell>
                  <TableCell><span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{r.g?.letter ?? "—"}</span></TableCell>
                  <TableCell className="tabular-nums">{r.g?.gpa4.toFixed(1) ?? "—"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
