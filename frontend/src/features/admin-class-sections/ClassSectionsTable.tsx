import { Pencil, RotateCcw, Trash2, Users } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatClassDay } from "./classSectionMappers";
import type { ClassSectionRow } from "./types";

interface ClassSectionsTableProps {
  rows: ClassSectionRow[];
  title?: string;
  onEdit: (row: ClassSectionRow) => void;
  onDelete: (row: ClassSectionRow) => void;
  onStatusChange: (row: ClassSectionRow) => void;
  onViewStudents: (row: ClassSectionRow) => void;
}

export function ClassSectionsTable({
  rows,
  title,
  onEdit,
  onDelete,
  onStatusChange,
  onViewStudents,
}: ClassSectionsTableProps) {
  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <Badge variant="outline">{rows.length} lop</Badge>
        </div>
      )}
      <DataTable
        data={rows}
        rowKey={(section) => section.id}
        pageSize={10}
        searchPlaceholder="Tim theo ma lop, mon hoc, nganh, hoc ky, giang vien..."
        emptyMessage="Chua co lop hoc phan"
        columns={[
          {
            key: "classCode",
            header: "Ma lop",
            render: (section) => (
              <div className="space-y-1">
                <span className="font-mono text-xs font-medium">{section.classCode}</span>
                <Badge variant={section.source === "API" ? "secondary" : "outline"}>
                  {section.source}
                </Badge>
              </div>
            ),
          },
          {
            key: "courseName",
            header: "Mon hoc",
            render: (section) => <span className="font-medium">{section.courseName}</span>,
          },
          {
            key: "majorName",
            header: "Nganh",
            render: (section) => (
              <span className="text-xs text-muted-foreground">{section.majorName}</span>
            ),
          },
          {
            key: "semesterName",
            header: "Hoc ky",
            render: (section) => (
              <span className="text-xs text-muted-foreground">{section.semesterName}</span>
            ),
          },
          {
            key: "teacherName",
            header: "Giang vien",
            render: (section) => <span className="text-sm">{section.teacherName}</span>,
          },
          {
            key: "roomName",
            header: "Phong",
            render: (section) => <span className="text-sm">{section.roomName}</span>,
          },
          {
            key: "schedule",
            header: "Lich hoc",
            accessor: (section) =>
              `${formatClassDay(section.dayOfWeek)} T${section.startPeriod}-${section.endPeriod}`,
            render: (section) => (
              <div className="text-xs text-muted-foreground">
                <div>{formatClassDay(section.dayOfWeek)}</div>
                <div>
                  Tiet {section.startPeriod}-{section.endPeriod}
                </div>
              </div>
            ),
          },
          {
            key: "size",
            header: "Si so",
            accessor: (section) => `${section.currentSlots}/${section.maxSlots}`,
            render: (section) => (
              <span className="tabular-nums">
                {section.currentSlots}/{section.maxSlots}
              </span>
            ),
          },
          {
            key: "status",
            header: "Trang thai",
            render: (section) => <StatusBadge value={section.status} />,
          },
          {
            key: "actions",
            header: "",
            className: "w-40 text-right",
            searchable: false,
            render: (section) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Xem sinh vien ${section.classCode}`}
                  onClick={() => onViewStudents(section)}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Doi trang thai ${section.classCode}`}
                  onClick={() => onStatusChange(section)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Sua ${section.classCode}`}
                  onClick={() => onEdit(section)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  aria-label={`Xoa ${section.classCode}`}
                  onClick={() => onDelete(section)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

