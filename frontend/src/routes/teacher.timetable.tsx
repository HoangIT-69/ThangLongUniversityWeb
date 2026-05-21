import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, DoorOpen, GraduationCap } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDefaultTeacherSemesterId,
  teacherSemesterOptions,
} from "@/features/teacher/teacherData";
import {
  getTeacherTimetableSlots,
  getTodayDayOfWeek,
  type TeacherTimetableSlot,
} from "@/features/teacher/teacherTimetableData";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/timetable")({ component: TeacherTimetablePage });

const timetableDays = [1, 2, 3, 4, 5, 6];

function TeacherTimetablePage() {
  const [semesterId, setSemesterId] = useState(getDefaultTeacherSemesterId());

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    retry: false,
  });

  const slots = useMemo(
    () =>
      getTeacherTimetableSlots(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  const todayDayOfWeek = getTodayDayOfWeek();
  const todaySlots = slots.filter((slot) => slot.dayOfWeek === todayDayOfWeek);
  const roomCount = new Set(slots.map((slot) => slot.roomName)).size;
  const studentCount = slots.reduce((sum, slot) => sum + slot.currentSlots, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Thoi khoa bieu"
        description={
          classesQuery.isError
            ? "Chua co API timetable rieng, FE dang dung mock/class-sections de demo lich day"
            : "Lich day cua giang vien theo hoc ky, phong hoc va tiet hoc"
        }
        actions={<SemesterFilter value={semesterId} onValueChange={setSemesterId} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Buoi day" value={slots.length} icon={CalendarDays} tone="primary" />
        <StatCard label="Hom nay" value={todaySlots.length} icon={Clock} tone="success" />
        <StatCard label="Phong su dung" value={roomCount} icon={DoorOpen} tone="info" />
        <StatCard label="Tong si so" value={studentCount} icon={GraduationCap} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lich tuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-6">
            {timetableDays.map((day) => (
              <DayColumn
                key={day}
                day={day}
                slots={slots.filter((slot) => slot.dayOfWeek === day)}
                isToday={day === todayDayOfWeek}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={slots}
        rowKey={(row) => row.id}
        pageSize={10}
        searchPlaceholder="Tim lop, mon, phong..."
        emptyMessage="Chua co lich day trong hoc ky nay"
        columns={[
          {
            key: "classCode",
            header: "Lop",
            render: (row) => (
              <div>
                <div className="font-mono text-xs font-semibold">{row.classCode}</div>
                <Badge className="mt-1" variant={row.source === "API" ? "secondary" : "outline"}>
                  {row.source}
                </Badge>
              </div>
            ),
          },
          {
            key: "courseName",
            header: "Mon hoc",
            render: (row) => (
              <div className="min-w-56">
                <div className="font-medium">{row.courseName}</div>
                <div className="text-xs text-muted-foreground">{row.courseCode}</div>
              </div>
            ),
          },
          { key: "dayLabel", header: "Thu" },
          { key: "timeRange", header: "Tiet / Gio" },
          { key: "roomName", header: "Phong" },
          { key: "weekText", header: "Tuan hoc" },
          {
            key: "size",
            header: "Si so",
            accessor: (row) => `${row.currentSlots}/${row.maxSlots}`,
            render: (row) => (
              <span className="tabular-nums">
                {row.currentSlots}/{row.maxSlots}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            searchable: false,
            className: "w-24 text-right",
            render: (row) => (
              <Button asChild variant="outline" size="sm">
                <Link
                  to="/teacher/classes/$classSectionId/students"
                  params={{ classSectionId: row.classSectionId }}
                >
                  Roster
                </Link>
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

function DayColumn({
  day,
  slots,
  isToday,
}: {
  day: number;
  slots: TeacherTimetableSlot[];
  isToday: boolean;
}) {
  return (
    <div className="min-h-48 rounded-lg border bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">{day === 6 ? "Thu 7" : `Thu ${day + 1}`}</div>
        {isToday && <Badge>Hom nay</Badge>}
      </div>
      <div className="space-y-2">
        {slots.length === 0 ? (
          <div className="rounded-md border border-dashed bg-background/60 p-3 text-xs text-muted-foreground">
            Khong co lich
          </div>
        ) : (
          slots.map((slot) => (
            <div key={slot.id} className="rounded-md border bg-background p-3 text-xs shadow-sm">
              <div className="font-semibold">{slot.classCode}</div>
              <div className="mt-1 line-clamp-2 text-muted-foreground">{slot.courseName}</div>
              <div className="mt-2 font-mono">{slot.timeRange}</div>
              <div className="mt-1 text-muted-foreground">{slot.roomName}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SemesterFilter({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Chon hoc ky" />
      </SelectTrigger>
      <SelectContent>
        {teacherSemesterOptions.map((semester) => (
          <SelectItem key={semester.id} value={semester.id}>
            {semester.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
