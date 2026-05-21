import type { AcademicOpsModule, ModuleConfig, ModuleRow } from "./types";

export const moduleConfigs: Record<AcademicOpsModule, ModuleConfig> = {
  faculties: {
    title: "Khoa",
    description: "Quan ly cap khoa, lien ket den bo mon, nganh hoc va giang vien.",
    sourceNote: "Mock vi BE chua co endpoint faculties.",
  },
  departments: {
    title: "Bo mon",
    description: "Quan ly bo mon thuoc khoa, phu trach nganh, mon hoc va giang vien.",
    sourceNote: "Mock vi BE chua co endpoint departments.",
  },
  curriculums: {
    title: "Chuong trinh dao tao",
    description: "Lien ket nganh, hoc ky, hoc phan bat buoc/tu chon va dieu kien tien quyet.",
    sourceNote: "Mock ket hop Major/Course API neu co.",
  },
  "registration-periods": {
    title: "Dot dang ky hoc phan",
    description: "Mo/khoa dot dang ky theo hoc ky, phuc vu workflow sinh vien dang ky.",
    sourceNote: "Mock vi BE chua co registration-periods CRUD day du.",
  },
  timetables: {
    title: "Thoi khoa bieu",
    description: "Lich hoc theo hoc ky, lop hoc phan, phong, tiet hoc va giang vien.",
    sourceNote: "Suy ra tu ClassSection API, fallback mock khi thieu.",
  },
  "teaching-assignments": {
    title: "Phan cong giang day",
    description: "Theo doi giang vien duoc gan vao lop hoc phan nao trong tung hoc ky.",
    sourceNote: "Suy ra tu ClassSection/Teacher API, fallback mock khi thieu.",
  },
  reports: {
    title: "Thong ke / Bao cao",
    description: "Chi so co ban ve mo lop, dang ky, si so, giang day va diem.",
    sourceNote: "Tinh tu API hien co, bo sung mock cho chi so BE chua tra.",
  },
  notifications: {
    title: "Thong bao",
    description: "Thong bao cho sinh vien/giang vien ve dang ky, lich hoc, diem va hoc vu.",
    sourceNote: "Mock vi BE chua co notification API cho admin.",
  },
  workflow: {
    title: "Workflow hoc vu tong the",
    description: "Demo luong mo dang ky, sinh vien dang ky, khoa dang ky, nhap diem, khoa diem.",
    sourceNote: "Demo ket hop API hien co va mock cho buoc BE chua ho tro.",
  },
};

export const facultyRows: ModuleRow[] = [
  {
    code: "F-CNTT",
    name: "Khoa Cong nghe thong tin",
    dean: "TS. Nguyen Van An",
    departments: 4,
    majors: 3,
    teachers: 42,
    status: "ACTIVE",
  },
  {
    code: "F-KTQL",
    name: "Khoa Kinh te va Quan ly",
    dean: "PGS. Tran Thu Ha",
    departments: 5,
    majors: 4,
    teachers: 58,
    status: "ACTIVE",
  },
  {
    code: "F-NN",
    name: "Khoa Ngoai ngu",
    dean: "TS. Le Minh Chau",
    departments: 3,
    majors: 2,
    teachers: 28,
    status: "ACTIVE",
  },
];

export const departmentRows: ModuleRow[] = [
  {
    code: "BM-CNPM",
    name: "Bo mon Cong nghe phan mem",
    faculty: "Khoa Cong nghe thong tin",
    head: "TS. Pham Minh Duc",
    teachers: 42,
    majors: 1,
    courses: 36,
    status: "ACTIVE",
  },
  {
    code: "BM-HTTT",
    name: "Bo mon He thong thong tin",
    faculty: "Khoa Cong nghe thong tin",
    head: "TS. Vu Anh Tuan",
    teachers: 24,
    majors: 1,
    courses: 32,
    status: "ACTIVE",
  },
  {
    code: "BM-MKT",
    name: "Bo mon Marketing",
    faculty: "Khoa Kinh te va Quan ly",
    head: "PGS. Tran Thu Ha",
    teachers: 35,
    majors: 1,
    courses: 52,
    status: "ACTIVE",
  },
];

export const curriculumRows: ModuleRow[] = [
  {
    code: "CTDT-CNTT-2026",
    major: "Cong nghe thong tin",
    effectiveYear: 2026,
    semesters: 8,
    totalCredits: 132,
    status: "ACTIVE",
  },
  {
    code: "CTDT-QTKD-2026",
    major: "Quan tri kinh doanh",
    effectiveYear: 2026,
    semesters: 8,
    totalCredits: 128,
    status: "DRAFT",
  },
];

export const registrationPeriodRows: ModuleRow[] = [
  {
    semester: "HK1 2026-2027",
    startTime: "2026-08-01 08:00",
    endTime: "2026-08-20 23:59",
    status: "OPEN",
    classSections: 124,
    enrollments: 3560,
  },
  {
    semester: "HK2 2026-2027",
    startTime: "2027-01-05 08:00",
    endTime: "2027-01-25 23:59",
    status: "DRAFT",
    classSections: 0,
    enrollments: 0,
  },
];

export const notificationRows: ModuleRow[] = [
  {
    title: "Mo dang ky hoc phan HK1 2026-2027",
    target: "STUDENT",
    channel: "IN_APP",
    sentAt: "2026-08-01 08:00",
    status: "SENT",
  },
  {
    title: "Nhac giang vien hoan thanh nhap diem",
    target: "TEACHER",
    channel: "EMAIL",
    sentAt: "Can BE: sentAt",
    status: "DRAFT",
  },
];

export const workflowSteps = [
  "Admin tao hoc ky va mo lop hoc phan",
  "Admin mo dot dang ky hoc phan cho hoc ky",
  "Student dang ky lop hoc phan trong thoi gian mo",
  "BE kiem tra trung lich, tien quyet, si so, gioi han tin chi",
  "Admin them sinh vien thu cong khi can dieu chinh hoc vu",
  "Admin khoa dang ky de chot danh sach lop",
  "Teacher diem danh, giang day va nhap diem",
  "Teacher gui bang diem",
  "Admin khoa diem va luu ket qua cuoi ky",
  "Student xem diem va ket qua hoc tap",
];

export const workflowMermaid = `flowchart TD
  A[Admin mo lop hoc phan] --> B[Admin mo dot dang ky]
  B --> C[Student dang ky lop]
  C --> D{BE kiem tra dieu kien}
  D -->|Hop le| E[Enrollment REGISTERED]
  D -->|Khong hop le| F[Tu choi va tra ly do]
  E --> G[Admin them sinh vien thu cong neu can]
  G --> H[Admin khoa dang ky]
  H --> I[Teacher day va nhap diem]
  I --> J[Teacher gui diem]
  J --> K[Admin khoa diem]
  K --> L[Student xem diem]`;

export const flowTestSteps = [
  "Dang nhap admin/password123, vao /admin/class-sections va mo lop hoc phan OPEN.",
  "Vao /admin/registration-periods, bam Mo dang ky cho hoc ky hien tai.",
  "Dang nhap sv001/password123, vao /student/course-registration va dang ky mot lop.",
  "Quay lai admin, vao /admin/enrollments va them sinh vien thu cong neu can.",
  "Admin vao /admin/registration-periods hoac /admin/enrollments va khoa dang ky.",
  "Dang nhap gv101/password123, vao /teacher/grades va nhap diem cho lop.",
  "Admin vao /admin/academic-results va khoa diem hoc ky.",
  "Dang nhap sv001, vao /student/academic-results de xem diem.",
];
