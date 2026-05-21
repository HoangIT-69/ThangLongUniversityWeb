import { z } from "zod";

export type NoticeType = "GENERAL" | "SCHEDULE_CHANGE" | "ABSENCE" | "ASSIGNMENT";

export interface TeacherNoticeRow {
  id: string;
  classSectionId: string;
  classCode: string;
  title: string;
  body: string;
  type: NoticeType;
  targetCount: number;
  sentAt: string;
  source: "Mock" | "Local demo";
}

export const noticeSchema = z.object({
  classSectionId: z.string().min(1, "Chon lop hoc phan"),
  type: z.enum(["GENERAL", "SCHEDULE_CHANGE", "ABSENCE", "ASSIGNMENT"]),
  title: z.string().min(3, "Nhap tieu de thong bao"),
  body: z.string().min(10, "Noi dung thong bao can ro hon"),
});

export type NoticeFormData = z.infer<typeof noticeSchema>;

export function createInitialNotices(): TeacherNoticeRow[] {
  return [
    {
      id: "notice-1",
      classSectionId: "api-demo",
      classCode: "JAVA101-01",
      title: "On tap truoc buoi thuc hanh",
      body: "Sinh vien doc chuong 3 va chuan bi laptop ca nhan cho buoi thuc hanh tiep theo.",
      type: "ASSIGNMENT",
      targetCount: 58,
      sentAt: "2026-05-20T08:30:00",
      source: "Mock",
    },
    {
      id: "notice-2",
      classSectionId: "api-demo",
      classCode: "DBS201-02",
      title: "Doi phong hoc sang A301",
      body: "Buoi hoc thu 5 tuan nay chuyen sang phong A301 do phong cu bao tri.",
      type: "SCHEDULE_CHANGE",
      targetCount: 42,
      sentAt: "2026-05-19T14:00:00",
      source: "Mock",
    },
  ];
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
