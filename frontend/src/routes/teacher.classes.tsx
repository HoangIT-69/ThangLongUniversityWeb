import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table/DataTable";
import { classSections, getCourse, getSemester, getRoom, dayLabels, semesters } from "@/data/mock";
import { StatusBadge } from "@/components/ui/status-badge";
import { SemesterSelect } from "@/components/forms/SemesterSelect";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/teacher/classes")({ component: () => {
  const [sem, setSem] = useState(semesters.find(s => s.status === "OPEN")?.id ?? semesters[0].id);
  const data = classSections.filter((c) => c.semesterId === sem);
  return (
    <div>
      <PageHeader title="Lớp đang dạy" description={`Học kỳ: ${getSemester(sem).name}`} />
      <DataTable data={data} rowKey={(c) => c.id}
        toolbar={<SemesterSelect value={sem} onChange={setSem} />}
        searchPlaceholder="Tìm mã lớp, môn…"
        columns={[
          { key: "code", header: "Mã lớp", render: (c) => <span className="font-mono text-xs font-medium">{c.code}</span> },
          { key: "course", header: "Môn học", accessor: (c) => getCourse(c.courseId).name, render: (c) => <span className="font-medium">{getCourse(c.courseId).name}</span> },
          { key: "schedule", header: "Lịch", render: (c) => <span className="text-xs">{c.schedule.map(s => `${dayLabels[s.dayOfWeek]} T${s.periods.join(",")}`).join(" · ")}</span> },
          { key: "room", header: "Phòng", render: (c) => <span className="text-xs font-mono">{c.schedule.map(s => getRoom(s.roomId).name).join(", ")}</span> },
          { key: "size", header: "Sĩ số", render: (c) => <span className="tabular-nums">{c.enrolled}/{c.capacity}</span> },
          { key: "status", header: "Điểm", render: (c) => <StatusBadge value={c.enrolled > 30 ? "PENDING" : "SUCCESS"} /> },
          { key: "act", header: "", searchable: false, render: (c) => (
            <Button asChild variant="outline" size="sm"><Link to="/teacher/classes/$classSectionId/students" params={{ classSectionId: c.id }}>Xem SV</Link></Button>
          )},
        ]}
      />
    </div>
  );
}});
