export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type CourseType = "REQUIRED" | "ELECTIVE";
export type EnrollmentStatus = "PENDING" | "REGISTERED" | "CANCELED" | "PASSED" | "FAILED";
export type EnrollmentType = "ORDINARY" | "RETAKE" | "IMPROVE";
export type RetakeRegistrationType = "RETAKE" | "IMPROVE";
export type EnrollmentRequestStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
export type NotificationType = "SCHOOL" | "CHAT";

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export interface UserProfile {
  username: string;
  email: string;
  role: Role;
  fullName: string;
  code?: string;
  majorOrDegree?: string | null;
  avatarUrl?: string | null;
  // Personal info
  gender?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  nationalId?: string | null;
  placeOfBirth?: string | null;
  hometown?: string | null;
  permanentAddress?: string | null;
  currentAddress?: string | null;
  phone?: string | null;
  emergencyContact?: string | null;
  // Academic info (Student)
  cohort?: string | null;
  className?: string | null;
  academicYear?: string | null;
  advisor?: string | null;
  status?: string | null;
  trainingType?: string | null;
  // Professional info (Teacher)
  department?: string | null;
}

// ─── Spring Page ──────────────────────────────────────────────────────────────

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  sort?: unknown;
  pageable?: unknown;
}

// ─── Admin: Users ─────────────────────────────────────────────────────────────

export interface AdminUserResponse {
  id: number;
  username: string;
  passwordHash?: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
  email: string;
}

// ─── Admin: Students ──────────────────────────────────────────────────────────

export interface StudentRequest {
  username: string;
  password: string;
  email: string;
  studentCode: string;
  fullName: string;
  dob?: string | null;
  gender?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  placeOfBirth?: string | null;
  hometown?: string | null;
  permanentAddress?: string | null;
  currentAddress?: string | null;
  emergencyContact?: string | null;
  majorId: number;
  academicYear?: number | null;
  cohort?: string | null;
  className?: string | null;
  advisor?: string | null;
  status?: string | null;
  trainingType?: string | null;
  address?: string | null;
}

export interface AdminStudentResponse {
  id: number;
  username: string | null;
  email: string | null;
  studentCode: string;
  fullName: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  nationalId: string | null;
  placeOfBirth: string | null;
  hometown: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  emergencyContact: string | null;
  address: string | null;
  academicYear: number | null;
  cohort: string | null;
  className: string | null;
  advisor: string | null;
  status: string | null;
  trainingType: string | null;
  majorId: number | null;
  majorName: string | null;
  majorCode: string | null;
}

// ─── Admin: Teachers ──────────────────────────────────────────────────────────

export interface TeacherRequest {
  username: string;
  password: string;
  email: string;
  teacherCode: string;
  fullName: string;
  dob?: string | null;
  gender?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  placeOfBirth?: string | null;
  hometown?: string | null;
  permanentAddress?: string | null;
  currentAddress?: string | null;
  emergencyContact?: string | null;
  department?: string | null;
  degree?: string | null;
  address?: string | null;
}

export interface AdminTeacherResponse {
  id: number;
  teacherCode: string;
  fullName: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  nationalId: string | null;
  placeOfBirth: string | null;
  hometown: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  emergencyContact: string | null;
  department: string | null;
  degree: string | null;
  address: string | null;
}

// ─── Admin: Majors ────────────────────────────────────────────────────────────

export interface MajorRequest {
  majorCode: string;
  name: string;
  description?: string | null;
}

export interface MajorResponse {
  id: number;
  majorCode: string;
  name: string;
  description: string | null;
}

// ─── Admin: Courses ───────────────────────────────────────────────────────────

export interface CourseRequest {
  code: string;
  name: string;
  credits: number;
  description?: string | null;
  courseType?: CourseType;
  majorId: number;
  prerequisiteCourseIds?: number[] | null;
}

export interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  courseType: CourseType | null;
  courseTypeLabel: string | null;
  majorName: string | null;
  prerequisiteNames: string[];
}

// ─── Admin: Semesters ─────────────────────────────────────────────────────────

export interface SemesterRequest {
  name: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
}

export interface SemesterResponse {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  registrationOpen: boolean;
  locked: boolean;
}

// Legacy alias (used in student module)
export type StudentSemesterResponse = SemesterResponse;

// ─── Admin: Rooms ─────────────────────────────────────────────────────────────

export interface RoomRequest {
  name: string;
  capacity: number;
}

export interface RoomResponse {
  id: number;
  name: string;
  capacity: number;
}

// ─── Admin: Periods ───────────────────────────────────────────────────────────

export interface PeriodRequest {
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface PeriodResponse {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

// ─── Admin: Class Sections ────────────────────────────────────────────────────

export interface ClassSectionScheduleRequest {
  dayOfWeek: number;
  startPeriodId: number;
  endPeriodId: number;
  roomId: number;
}

export interface ClassSectionRequest {
  classCode: string;
  courseId: number;
  semesterId: number;
  teacherId?: number | null;
  schedules: ClassSectionScheduleRequest[];
  maxSlots: number;
}

export interface ClassSectionScheduleResponse {
  id: number;
  dayOfWeek: number;
  startPeriodId: number | null;
  startPeriod: number | null;
  endPeriodId: number | null;
  endPeriod: number | null;
  lessonCount: number | null;
  periodRange: string | null;
  startTime: string | null;
  endTime: string | null;
  roomId: number | null;
  roomName: string | null;
}

export type AdminClassSectionStatus = "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED";

export interface ClassSectionResponse {
  id: number;
  classCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  courseType: CourseType | null;
  courseTypeLabel: string | null;
  credits: number;
  semesterId: number;
  semesterName: string;
  teacherId: number | null;
  teacherName: string | null;
  room: string | null;
  roomId: number | null;
  roomCapacity: number | null;
  schedules: ClassSectionScheduleResponse[];
  maxSlots: number | null;
  currentSlots: number | null;
  closed: boolean;
  gradeLocked: boolean;
}

export interface AdminClassSectionStudentResponse {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  fullName: string;
  email?: string | null;
  majorId?: number | null;
  majorCode?: string | null;
  majorName?: string | null;
  cohort?: string | null;
  academicYear?: number | string | null;
  enrolledAt?: string | null;
  status?: string | null;
}

// ─── Admin: Enrollments ───────────────────────────────────────────────────────

export interface AdminEnrollmentSearchQuery {
  semesterId?: number;
  classSectionId?: number;
  status?: EnrollmentStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminOverrideEnrollmentRequest {
  studentId: number;
  classSectionId: number;
  note?: string | null;
}

export interface AdminEnrollmentResponse {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  classSectionId: number;
  classCode: string;
  semesterId: number;
  courseName: string;
  status: EnrollmentStatus | string | null;
}

// ─── Admin: Academic Results ──────────────────────────────────────────────────

export interface AcademicResultStudentRef {
  id: number;
  studentCode: string;
  fullName: string | null;
  dob?: string | null;
  gender?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  placeOfBirth?: string | null;
  hometown?: string | null;
  permanentAddress?: string | null;
  currentAddress?: string | null;
  emergencyContact?: string | null;
  address?: string | null;
  academicYear?: number | null;
  cohort?: string | null;
  className?: string | null;
  advisor?: string | null;
  status?: string | null;
  trainingType?: string | null;
}

export interface AcademicResultSemesterRef {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  registrationOpen?: boolean;
  locked?: boolean;
}

export interface AcademicResultResponse {
  id: number;
  student?: AcademicResultStudentRef | null;
  semester?: AcademicResultSemesterRef | null;
  semesterGpa?: number | null;
  cumulativeGpa?: number | null;
  totalCredits?: number | null;
  cumulativeCredits?: number | null;
  calculatedAt?: string | null;
}

// ─── Admin: Settings ──────────────────────────────────────────────────────────

export interface RetakeFeeRequest {
  feePerCourse: number;
}

export interface RetakeFeeResponse {
  feePerCourse: number;
}

export interface UpdateRetakeFeeResponse {
  feePerCourse: number;
  message: string;
}

// ─── Student: Grades ──────────────────────────────────────────────────────────

export type CourseStudyStatus =
  | "IN_PROGRESS"
  | "PASSED"
  | "BANNED_FROM_EXAM"
  | "REPEAT_COURSE"
  | "RETAKE_EXAM";

export interface StudentGradeItemResponse {
  enrollmentId: number;
  semesterId: number;
  semesterName: string;
  classCode: string;
  courseName: string;
  credits: number;
  totalScore?: number | null;
  gradePoint?: number | null;
}

export interface StudentGradesSummaryResponse {
  semesterId?: number | null;
  semesterGpa: number;
  cumulativeGpa: number;
  items: StudentGradeItemResponse[];
}

export interface SemesterGpaSummary {
  semesterId: number;
  semesterName: string;
  semesterGpa: number;
  cumulativeGpa: number;
  totalCredits: number;
  cumulativeCredits: number;
}

export interface GradeResponse {
  id: number;
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  courseId: number;
  courseCode: string;
  classCode: string;
  courseName: string;
  credits: number;
  semesterId: number;
  semesterName: string;
  participationScore?: number | null;
  midtermScore?: number | null;
  finalScore?: number | null;
  retestScore?: number | null;
  attemptNumber?: number | null;
  enrollmentType?: EnrollmentType | string | null;
  totalScore?: number | null;
  letterGrade?: string | null;
  gpa4?: number | null;
  gradePoint?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  courseStatus?: CourseStudyStatus | string | null;
  absenceCount?: number | null;
}

export interface LearningResultsResponse {
  semesterId?: number | null;
  semesterName?: string | null;
  semesterGpa?: number | null;
  cumulativeGpa?: number | null;
  semesterCredits?: number | null;
  cumulativeCredits?: number | null;
  grades: GradeResponse[];
  semesterSummaries: SemesterGpaSummary[];
}

// ─── Student: Schedule / Enrollment ──────────────────────────────────────────

export interface EnrollmentRequestResponse {
  requestId?: string | null;
  message: string;
}

export interface EnrollmentRequestStatusResponse {
  requestId: string;
  status: EnrollmentRequestStatus | string;
  message?: string | null;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  classSectionId?: number | null;
  courseCode?: string | null;
  classCode: string;
  courseName: string;
  credits: number;
  room?: string | null;
  schedules?: ClassSectionScheduleResponse[] | null;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  teacherName?: string | null;
  teacherCode?: string | null;
  teacherEmail?: string | null;
  midTermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  status?: EnrollmentStatus | string | null;
}

// ─── Student: Exams ───────────────────────────────────────────────────────────

export interface StudentExamResponse {
  classCode: string;
  courseName: string;
  credits: number;
  examAt?: string | null;
  examRoom?: string | null;
}

// ─── Student: Tuition ─────────────────────────────────────────────────────────

export interface TuitionItemResponse {
  feeType?: "COURSE" | "RETAKE" | string | null;
  courseCode: string;
  courseName: string;
  credits: number;
  pricePerCredit: number;
  subtotal: number;
}

export interface TuitionResponse {
  semesterName: string;
  totalCredits: number;
  totalAmount: number;
  pricePerCredit: number;
  paid: boolean;
  items: TuitionItemResponse[];
}

// ─── Student: Retakes ─────────────────────────────────────────────────────────

export interface RetakeEligibleCourseResponse {
  gradeId: number;
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  previousTotalScore: number;
  previousAttemptNumber?: number | null;
  registrationType: RetakeRegistrationType | string;
  retakeFee: number;
}

export interface RetakeRegistrationRequest {
  semesterId?: number | null;
  courseIds: number[];
}

export interface RetakeRegisteredItemResponse {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  registrationType: RetakeRegistrationType | string;
  attemptNumber: number;
  feeCharged: number;
  examAt?: string | null;
  examRoom?: string | null;
}

export interface RetakeRegistrationResponse {
  registeredCourses: RetakeRegisteredItemResponse[];
  totalFee: number;
  registeredCount: number;
}

export interface RetakeRequestResponse {
  enrollmentId: number;
  classSectionId: number;
  classCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  semesterId: number;
  semesterName: string;
  status?: string | null;
  enrollmentType?: EnrollmentType | string | null;
  attemptNumber?: number | null;
  totalScore?: number | null;
}

// ─── Student: Dashboard ───────────────────────────────────────────────────────

export interface StudentDashboardResponse {
  profile: UserProfile;
  currentSemester?: SemesterResponse | null;
  learningResults?: LearningResultsResponse | null;
  grades?: StudentGradesSummaryResponse | null;
  tuition?: TuitionResponse | null;
  schedule?: EnrollmentResponse[];
  todaySchedule?: EnrollmentResponse[];
  exams?: StudentExamResponse[];
  upcomingExams?: StudentExamResponse[];
  semesterGpa: number;
  cumulativeGpa: number;
  registeredCredits: number;
  earnedCredits: number;
  gradedCourseCount: number;
  activeCourseCount: number;
  upcomingExamCount: number;
  tuitionRemaining: number;
  tuitionStatus: string;
  registrationStatus: string;
}

// ─── Teacher ──────────────────────────────────────────────────────────────────

export interface TeacherGradeRequest {
  enrollmentId: number;
  participationScore?: number | null;
  midTermScore?: number | null;
  finalScore?: number | null;
  retestScore?: number | null;
}

export interface TeacherStudentGradeResponse {
  enrollmentId: number;
  studentCode: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  className?: string | null;
  advisorName?: string | null;
  majorName?: string | null;
  facultyName?: string | null;
  midTermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  status: "REGISTERED" | "PASSED" | "FAILED" | "CANCELED" | string;
  courseStatus?: CourseStudyStatus | null;
  absenceCount?: number | null;
}

export type TeacherGradeResponse = GradeResponse;

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT";

export interface AttendanceRecordRequest {
  enrollmentId: number;
  status: AttendanceStatus;
  note?: string | null;
}

export interface AttendanceRecordResponse {
  id: number;
  enrollmentId: number;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string | null;
}

export interface AttendanceSessionResponse {
  id: number;
  classSectionId: number;
  sessionNumber: number;
  weekNumber?: number | null;
  meetingIndex?: number | null;
  sessionDate?: string | null;
  locked: boolean;
  records: AttendanceRecordResponse[];
}

// Legacy aliases kept for backward compatibility
export type AdminMajorRequest = MajorRequest;
export type AdminRoomRequest = RoomRequest;
export type AdminPeriodRequest = PeriodRequest;
export type AdminSemesterRequest = SemesterRequest;
export type AdminSemesterResponse = SemesterResponse;
export type AdminStudentRequest = StudentRequest;
export type AdminTeacherRequest = TeacherRequest;
export type AdminCourseRequest = CourseRequest;
export type AdminClassSectionRequest = ClassSectionRequest;
