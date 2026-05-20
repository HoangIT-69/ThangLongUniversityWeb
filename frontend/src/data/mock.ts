// Centralized mock data for the University Management System prototype.
// Replace these with real API calls when wiring up the backend.

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type EnrollmentStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  code: string;
  fullName: string;
  email: string;
  majorId: string;
  cohort: string; // e.g. K2024
  status: "ACTIVE" | "SUSPENDED" | "GRADUATED";
  gpa: number;
  cpa: number;
  credits: number;
}

export interface Teacher {
  id: string;
  code: string;
  fullName: string;
  email: string;
  department: string;
  activeClasses: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface Major {
  id: string;
  code: string;
  name: string;
  students: number;
  courses: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  majorId: string;
  feePerCredit: number;
  prerequisites: string[];
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regStart: string;
  regEnd: string;
  status: "OPEN" | "CLOSED" | "UPCOMING";
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: "LECTURE" | "LAB" | "AUDITORIUM";
  status: "AVAILABLE" | "MAINTENANCE";
}

export interface Period {
  id: string;
  index: number;
  start: string;
  end: string;
}

export interface ScheduleSlot {
  dayOfWeek: number; // 1 Mon .. 7 Sun
  periods: number[]; // e.g. [1,2,3]
  roomId: string;
}

export interface ClassSection {
  id: string;
  code: string;
  courseId: string;
  teacherId: string;
  semesterId: string;
  schedule: ScheduleSlot[];
  capacity: number;
  enrolled: number;
  status: "OPEN" | "FULL" | "CLOSED";
}

export interface Enrollment {
  id: string;
  studentId: string;
  classSectionId: string;
  semesterId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
}

export interface Grade {
  enrollmentId: string;
  attendance: number;
  midterm: number;
  final: number;
  retake?: number;
  total: number;
  letter: string;
  gpa4: number;
  locked: boolean;
}

export interface Exam {
  id: string;
  courseId: string;
  date: string;
  time: string;
  roomId: string;
  format: "OFFLINE" | "ONLINE" | "PROJECT";
}

export interface TuitionInvoice {
  id: string;
  studentId: string;
  semesterId: string;
  total: number;
  paid: number;
  dueDate: string;
  status: "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
}

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  members: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  content: string;
  at: string;
  mine?: boolean;
}

// ----------------- DATA -----------------

export const majors: Major[] = [
  { id: "m1", code: "CS", name: "Khoa học Máy tính", students: 320, courses: 42 },
  { id: "m2", code: "SE", name: "Kỹ thuật Phần mềm", students: 280, courses: 40 },
  { id: "m3", code: "IS", name: "Hệ thống Thông tin", students: 180, courses: 36 },
  { id: "m4", code: "AI", name: "Trí tuệ Nhân tạo", students: 140, courses: 32 },
  { id: "m5", code: "CYB", name: "An toàn Thông tin", students: 120, courses: 30 },
  { id: "m6", code: "DS", name: "Khoa học Dữ liệu", students: 110, courses: 28 },
  { id: "m7", code: "ECON", name: "Kinh tế", students: 260, courses: 38 },
  { id: "m8", code: "ENG", name: "Ngôn ngữ Anh", students: 220, courses: 34 },
];

const firstNames = ["An", "Bình", "Châu", "Dũng", "Em", "Phong", "Giang", "Hà", "Khoa", "Linh", "Minh", "Nam", "Oanh", "Phúc", "Quân", "Sơn", "Trang", "Uyên", "Việt", "Yến"];
const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

export const students: Student[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `s${i + 1}`,
  code: `A${(40000 + i + 1).toString()}`,
  fullName: `${pick(lastNames, i)} ${pick(firstNames, i)} ${pick(firstNames, i + 3)}`,
  email: `student${i + 1}@tlu.edu.vn`,
  majorId: pick(majors, i).id,
  cohort: `K${2021 + (i % 4)}`,
  status: i % 9 === 0 ? "SUSPENDED" : "ACTIVE",
  gpa: +(2.5 + ((i * 13) % 150) / 100).toFixed(2),
  cpa: +(2.6 + ((i * 7) % 140) / 100).toFixed(2),
  credits: 30 + (i % 5) * 12,
}));

export const teachers: Teacher[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `t${i + 1}`,
  code: `GV${(100 + i + 1).toString()}`,
  fullName: `TS. ${pick(lastNames, i + 2)} ${pick(firstNames, i + 1)} ${pick(firstNames, i + 4)}`,
  email: `teacher${i + 1}@tlu.edu.vn`,
  department: pick(majors, i).name,
  activeClasses: 1 + (i % 4),
  status: i === 7 ? "INACTIVE" : "ACTIVE",
}));

export const courses: Course[] = [
  { id: "c1", code: "INT2208", name: "Lập trình Web", credits: 3, majorId: "m2", feePerCredit: 850000, prerequisites: [] },
  { id: "c2", code: "INT2207", name: "Cơ sở dữ liệu", credits: 3, majorId: "m1", feePerCredit: 850000, prerequisites: [] },
  { id: "c3", code: "INT2210", name: "Cấu trúc dữ liệu và Giải thuật", credits: 4, majorId: "m1", feePerCredit: 850000, prerequisites: [] },
  { id: "c4", code: "INT2209", name: "Mạng máy tính", credits: 3, majorId: "m1", feePerCredit: 850000, prerequisites: [] },
  { id: "c5", code: "INT3401", name: "Trí tuệ Nhân tạo", credits: 3, majorId: "m4", feePerCredit: 950000, prerequisites: ["c3"] },
  { id: "c6", code: "INT3505", name: "Công nghệ Phần mềm", credits: 3, majorId: "m2", feePerCredit: 850000, prerequisites: [] },
  { id: "c7", code: "INT3306", name: "Phân tích Thiết kế Hệ thống", credits: 3, majorId: "m3", feePerCredit: 850000, prerequisites: ["c2"] },
  { id: "c8", code: "INT3607", name: "An toàn Thông tin", credits: 3, majorId: "m5", feePerCredit: 900000, prerequisites: ["c4"] },
  { id: "c9", code: "INT2202", name: "Lập trình Hướng đối tượng", credits: 3, majorId: "m1", feePerCredit: 850000, prerequisites: [] },
  { id: "c10", code: "INT3508", name: "DevOps Cơ bản", credits: 2, majorId: "m2", feePerCredit: 900000, prerequisites: [] },
  { id: "c11", code: "INT3601", name: "Học máy", credits: 3, majorId: "m4", feePerCredit: 950000, prerequisites: ["c5"] },
  { id: "c12", code: "INT3211", name: "Hệ điều hành", credits: 3, majorId: "m1", feePerCredit: 850000, prerequisites: [] },
  { id: "c13", code: "INT2103", name: "Toán rời rạc", credits: 3, majorId: "m1", feePerCredit: 750000, prerequisites: [] },
  { id: "c14", code: "INT2104", name: "Xác suất Thống kê", credits: 3, majorId: "m6", feePerCredit: 750000, prerequisites: [] },
  { id: "c15", code: "INT3309", name: "Kho dữ liệu", credits: 3, majorId: "m6", feePerCredit: 900000, prerequisites: ["c2"] },
  { id: "c16", code: "INT3110", name: "Phát triển Mobile", credits: 3, majorId: "m2", feePerCredit: 900000, prerequisites: ["c1"] },
  { id: "c17", code: "ENG2201", name: "Tiếng Anh chuyên ngành", credits: 2, majorId: "m8", feePerCredit: 650000, prerequisites: [] },
  { id: "c18", code: "ECON1101", name: "Kinh tế vi mô", credits: 3, majorId: "m7", feePerCredit: 700000, prerequisites: [] },
  { id: "c19", code: "INT3702", name: "Blockchain", credits: 2, majorId: "m5", feePerCredit: 950000, prerequisites: [] },
  { id: "c20", code: "INT3811", name: "Đồ án Tốt nghiệp", credits: 6, majorId: "m2", feePerCredit: 1000000, prerequisites: ["c6"] },
];

export const semesters: Semester[] = [
  { id: "sem1", name: "Học kỳ 1 — 2023-2024", startDate: "2023-09-04", endDate: "2024-01-15", regStart: "2023-08-01", regEnd: "2023-08-25", status: "CLOSED" },
  { id: "sem2", name: "Học kỳ 2 — 2023-2024", startDate: "2024-02-05", endDate: "2024-06-15", regStart: "2024-01-10", regEnd: "2024-01-30", status: "CLOSED" },
  { id: "sem3", name: "Học kỳ Hè — 2024", startDate: "2024-07-01", endDate: "2024-08-20", regStart: "2024-06-15", regEnd: "2024-06-25", status: "CLOSED" },
  { id: "sem4", name: "Học kỳ 1 — 2024-2025", startDate: "2024-09-02", endDate: "2025-01-15", regStart: "2024-08-01", regEnd: "2024-08-25", status: "OPEN" },
  { id: "sem5", name: "Học kỳ 2 — 2024-2025", startDate: "2025-02-03", endDate: "2025-06-15", regStart: "2025-01-05", regEnd: "2025-01-25", status: "UPCOMING" },
];

export const rooms: Room[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `r${i + 1}`,
  name: `${["A", "B", "C"][i % 3]}${1 + i}.${i + 2}`,
  capacity: [40, 60, 80, 120, 30][i % 5],
  type: i % 4 === 0 ? "LAB" : i === 9 ? "AUDITORIUM" : "LECTURE",
  status: i === 6 ? "MAINTENANCE" : "AVAILABLE",
}));

export const periods: Period[] = [
  { id: "p1", index: 1, start: "07:00", end: "07:50" },
  { id: "p2", index: 2, start: "08:00", end: "08:50" },
  { id: "p3", index: 3, start: "09:00", end: "09:50" },
  { id: "p4", index: 4, start: "10:00", end: "10:50" },
  { id: "p5", index: 5, start: "13:00", end: "13:50" },
  { id: "p6", index: 6, start: "14:00", end: "14:50" },
  { id: "p7", index: 7, start: "15:00", end: "15:50" },
  { id: "p8", index: 8, start: "16:00", end: "16:50" },
];

export const classSections: ClassSection[] = Array.from({ length: 20 }).map((_, i) => {
  const course = pick(courses, i);
  const teacher = pick(teachers, i);
  const cap = [40, 50, 60, 35][i % 4];
  const enrolled = Math.min(cap, 10 + ((i * 7) % cap));
  return {
    id: `cs${i + 1}`,
    code: `${course.code}-${String(i + 1).padStart(2, "0")}`,
    courseId: course.id,
    teacherId: teacher.id,
    semesterId: i % 3 === 0 ? "sem4" : pick(semesters, i).id,
    schedule: [
      { dayOfWeek: 1 + (i % 5), periods: [1 + (i % 4), 2 + (i % 4), 3 + (i % 4)], roomId: pick(rooms, i).id },
      ...(i % 3 === 0 ? [{ dayOfWeek: 1 + ((i + 2) % 5), periods: [5, 6, 7], roomId: pick(rooms, i + 1).id }] : []),
    ],
    capacity: cap,
    enrolled,
    status: enrolled >= cap ? "FULL" : i === 11 ? "CLOSED" : "OPEN",
  };
});

const statuses: EnrollmentStatus[] = ["PENDING", "SUCCESS", "SUCCESS", "SUCCESS", "FAILED", "CANCELLED"];
export const enrollments: Enrollment[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `en${i + 1}`,
  studentId: pick(students, i).id,
  classSectionId: pick(classSections, i).id,
  semesterId: pick(classSections, i).semesterId,
  enrolledAt: new Date(2024, 7, 1 + (i % 25), 8 + (i % 12), 15 + (i % 45)).toISOString(),
  status: pick(statuses, i),
}));

export const grades: Grade[] = enrollments
  .filter((e) => e.status === "SUCCESS")
  .map((e, i) => {
    const att = 7 + (i % 3);
    const mid = 5 + ((i * 7) % 5) + Math.random() * 0.5;
    const fin = 5 + ((i * 11) % 5) + Math.random() * 0.5;
    const total = +(att * 0.1 + mid * 0.3 + fin * 0.6).toFixed(2);
    const letter = total >= 8.5 ? "A" : total >= 7 ? "B" : total >= 5.5 ? "C" : total >= 4 ? "D" : "F";
    const gpa4 = total >= 8.5 ? 4 : total >= 7 ? 3 : total >= 5.5 ? 2 : total >= 4 ? 1 : 0;
    return { enrollmentId: e.id, attendance: att, midterm: +mid.toFixed(2), final: +fin.toFixed(2), total, letter, gpa4, locked: i % 4 === 0 };
  });

export const exams: Exam[] = courses.slice(0, 10).map((c, i) => ({
  id: `ex${i + 1}`,
  courseId: c.id,
  date: `2025-01-${String(6 + i).padStart(2, "0")}`,
  time: `${8 + (i % 4) * 2}:00`,
  roomId: pick(rooms, i).id,
  format: i % 3 === 0 ? "ONLINE" : i === 7 ? "PROJECT" : "OFFLINE",
}));

export const tuitionInvoices: TuitionInvoice[] = Array.from({ length: 10 }).map((_, i) => {
  const total = (15 + (i % 6)) * 850000;
  const paid = i % 3 === 0 ? 0 : i % 3 === 1 ? total : Math.round(total * 0.5);
  const status: TuitionInvoice["status"] = paid === 0 ? "UNPAID" : paid >= total ? "PAID" : "PARTIAL";
  return {
    id: `inv${i + 1}`,
    studentId: pick(students, i).id,
    semesterId: pick(semesters, i).id,
    total,
    paid,
    dueDate: `2024-09-${String(15 + i).padStart(2, "0")}`,
    status,
  };
});

export const users: User[] = [
  { id: "u1", username: "admin", email: "admin@tlu.edu.vn", fullName: "Quản trị Hệ thống", role: "ADMIN", active: true, createdAt: "2023-01-01" },
  ...teachers.map<User>((t, i) => ({ id: `tu${i + 1}`, username: t.code.toLowerCase(), email: t.email, fullName: t.fullName, role: "TEACHER", active: t.status === "ACTIVE", createdAt: "2023-05-10" })),
  ...students.slice(0, 8).map<User>((s, i) => ({ id: `su${i + 1}`, username: s.code.toLowerCase(), email: s.email, fullName: s.fullName, role: "STUDENT", active: s.status === "ACTIVE", createdAt: "2023-09-01" })),
];

export const chatRooms: ChatRoom[] = [
  { id: "room1", name: "Lớp Lập trình Web", lastMessage: "Mọi người nhớ deadline tối nay nhé!", unread: 2, members: 42 },
  { id: "room2", name: "Cố vấn học tập K2022", lastMessage: "Thầy gửi kế hoạch học kỳ tới…", unread: 0, members: 28 },
  { id: "room3", name: "Phòng Công tác sinh viên", lastMessage: "Thông báo học bổng đợt 2", unread: 5, members: 320 },
  { id: "room4", name: "Nhóm học Cơ sở dữ liệu", lastMessage: "Câu 5 đáp án là gì các bạn?", unread: 1, members: 8 },
];

const sampleMessages = [
  "Chào mọi người, có ai làm xong bài tập chưa?",
  "Mình vừa nộp xong, không khó lắm.",
  "Thầy ơi cho em xin slide buổi hôm qua với ạ.",
  "OK mình sẽ gửi link lên drive chung.",
  "Nhớ đọc tài liệu chương 4 trước buổi sau.",
  "Có ai đi học nhóm tối nay không?",
  "Mình muốn join nhé, 8h ở thư viện được không?",
  "Deal! Mang theo laptop nha.",
  "Bài lab tuần này deadline lúc nào vậy?",
  "Chủ nhật 23:59 nhé bạn.",
  "Cảm ơn thầy ạ.",
  "Chúc cả nhóm cuối tuần vui vẻ!",
];

export const chatMessages: ChatMessage[] = chatRooms.flatMap((r, ri) =>
  Array.from({ length: 10 + ri }).map((_, i) => ({
    id: `${r.id}-msg${i}`,
    roomId: r.id,
    authorId: i % 3 === 0 ? "me" : `u${i}`,
    authorName: i % 3 === 0 ? "Bạn" : pick(students, i).fullName,
    content: pick(sampleMessages, i + ri),
    at: new Date(Date.now() - (10 + ri * 5 - i) * 1000 * 60 * 7).toISOString(),
    mine: i % 3 === 0,
  })),
);

// Helpers
export const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export const formatDateTime = (s: string) =>
  new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const dayLabels = ["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export const getCourse = (id: string) => courses.find((c) => c.id === id)!;
export const getTeacher = (id: string) => teachers.find((t) => t.id === id)!;
export const getRoom = (id: string) => rooms.find((r) => r.id === id)!;
export const getSemester = (id: string) => semesters.find((s) => s.id === id)!;
export const getMajor = (id: string) => majors.find((m) => m.id === id)!;
export const getStudent = (id: string) => students.find((s) => s.id === id)!;
export const getClassSection = (id: string) => classSections.find((c) => c.id === id)!;
