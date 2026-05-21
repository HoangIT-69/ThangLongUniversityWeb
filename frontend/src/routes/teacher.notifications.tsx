import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Megaphone, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getDefaultTeacherSemesterId,
  getTeacherClassRows,
  teacherSemesterOptions,
} from "@/features/teacher/teacherData";
import {
  createInitialNotices,
  formatDateTime,
  noticeSchema,
  type NoticeFormData,
  type TeacherNoticeRow,
} from "@/features/teacher/teacherNotificationData";
import { teacherApi } from "@/lib/api/teacher";

export const Route = createFileRoute("/teacher/notifications")({
  component: TeacherNotificationsPage,
});

function TeacherNotificationsPage() {
  const [semesterId, setSemesterId] = useState(getDefaultTeacherSemesterId());

  const classesQuery = useQuery({
    queryKey: ["teacher", "classes", semesterId],
    queryFn: () => teacherApi.listMyClasses(semesterId),
    retry: false,
  });

  const classRows = useMemo(
    () => getTeacherClassRows(classesQuery.isError ? undefined : classesQuery.data, semesterId),
    [classesQuery.data, classesQuery.isError, semesterId],
  );

  const [notices, setNotices] = useState<TeacherNoticeRow[]>(() => createInitialNotices());

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      classSectionId: "",
      type: "GENERAL",
      title: "",
      body: "",
    },
  });

  const onSubmit = (values: NoticeFormData) => {
    const selectedClass = classRows.find((row) => row.id === values.classSectionId);
    const nextNotice: TeacherNoticeRow = {
      id: `local-${Date.now()}`,
      classSectionId: values.classSectionId,
      classCode: selectedClass?.classCode ?? "Can BE: classCode",
      title: values.title,
      body: values.body,
      type: values.type,
      targetCount: selectedClass?.currentSlots ?? 0,
      sentAt: new Date().toISOString(),
      source: "Local demo",
    };
    setNotices((current) => [nextNotice, ...current]);
    form.reset({ classSectionId: values.classSectionId, type: "GENERAL", title: "", body: "" });
    toast.success("Da tao thong bao demo. BE can API de gui that.");
  };

  const totalTargets = notices.reduce((sum, notice) => sum + notice.targetCount, 0);
  const scheduleChangeCount = notices.filter((notice) => notice.type === "SCHEDULE_CHANGE").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Thong bao lop hoc"
        description={
          classesQuery.isError
            ? "Chua co API thong bao cho teacher, FE dang demo bang mock/local state"
            : "Gui thong bao ve lich hoc, nghi hoc, bai tap va ghi chu cho sinh vien"
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Thong bao" value={notices.length} icon={Bell} tone="primary" />
        <StatCard label="Lop phu trach" value={classRows.length} icon={Users} tone="info" />
        <StatCard label="Luot nhan" value={totalTargets} icon={Megaphone} tone="success" />
        <StatCard label="Doi lich" value={scheduleChangeCount} icon={Send} tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tao thong bao</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-3">
                  <Select value={semesterId} onValueChange={setSemesterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hoc ky" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherSemesterOptions.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormField
                    control={form.control}
                    name="classSectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lop hoc phan</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chon lop" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classRows.map((row) => (
                              <SelectItem key={row.id} value={row.id}>
                                {row.classCode} - {row.courseName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loai thong bao</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Loai thong bao" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GENERAL">Chung</SelectItem>
                            <SelectItem value="SCHEDULE_CHANGE">Doi lich</SelectItem>
                            <SelectItem value="ABSENCE">Nghi hoc</SelectItem>
                            <SelectItem value="ASSIGNMENT">Bai tap</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tieu de</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Doi phong hoc buoi thu 4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Noi dung</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="Nhap noi dung gui cho sinh vien..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Gui thong bao demo
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <DataTable
          data={notices}
          rowKey={(row) => row.id}
          pageSize={8}
          searchPlaceholder="Tim thong bao, lop..."
          emptyMessage="Chua co thong bao nao"
          columns={[
            {
              key: "classCode",
              header: "Lop",
              render: (row) => (
                <div>
                  <div className="font-mono text-xs font-semibold">{row.classCode}</div>
                  <Badge
                    className="mt-1"
                    variant={row.source === "Local demo" ? "outline" : "secondary"}
                  >
                    {row.source}
                  </Badge>
                </div>
              ),
            },
            {
              key: "title",
              header: "Thong bao",
              render: (row) => (
                <div className="min-w-72">
                  <div className="font-medium">{row.title}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">{row.body}</div>
                </div>
              ),
            },
            {
              key: "type",
              header: "Loai",
              render: (row) => <Badge variant="outline">{row.type}</Badge>,
            },
            {
              key: "targetCount",
              header: "Nguoi nhan",
              render: (row) => <span className="tabular-nums">{row.targetCount}</span>,
            },
            {
              key: "sentAt",
              header: "Thoi gian",
              render: (row) => (
                <span className="text-xs text-muted-foreground">{formatDateTime(row.sentAt)}</span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
