export type Role = "ADMIN" | "TEACHER" | "STUDENT";

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
}

export interface MajorResponse {
  id: number;
  majorCode: string;
  name: string;
  description?: string | null;
}

export interface RoomResponse {
  id: number;
  name: string;
  capacity: number;
}

export interface PeriodResponse {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface ClassSectionScheduleResponse {
  id: number;
  dayOfWeek: number;
  startPeriodId: number;
  startPeriod: number;
  endPeriodId: number;
  endPeriod: number;
  roomId?: number | null;
  roomName?: string | null;
}

export interface ClassSectionResponse {
  id: number;
  classCode: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  semesterId: number;
  semesterName: string;
  teacherId?: number | null;
  teacherName?: string | null;
  room?: string | null;
  roomId?: number | null;
  roomCapacity?: number | null;
  schedules: ClassSectionScheduleResponse[];
  maxSlots?: number | null;
  currentSlots?: number | null;
  closed?: boolean;
}

export interface StudentSemesterResponse {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  registrationOpen: boolean;
  locked: boolean;
}

export interface EnrollmentRequestResponse {
  requestId: string;
  message: string;
}

export interface EnrollmentRequestStatusResponse {
  requestId: string;
  status: string;
  message?: string | null;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  classSectionId: number;
  classCode: string;
  courseName: string;
  credits: number;
  room?: string | null;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  teacherName?: string | null;
  midTermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  status?: string | null;
}

export interface StudentExamResponse {
  classCode: string;
  courseName: string;
  credits: number;
  examAt?: string | null;
  examRoom?: string | null;
}

export interface StudentGradeItemResponse {
  enrollmentId: number;
  semesterId: number;
  semesterName: string;
  classCode: string;
  courseName: string;
  credits: number;
  participationScore?: number | null;
  midtermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  gradePoint?: number | null;
}

export interface StudentGradesSummaryResponse {
  semesterId?: number | null;
  semesterGpa: number;
  cumulativeGpa: number;
  items: StudentGradeItemResponse[];
}

export interface TuitionItemResponse {
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

export interface RetakeEligibleCourseResponse {
  gradeId: number;
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  previousTotalScore: number;
  previousAttemptNumber?: number | null;
  registrationType: "RETAKE" | "IMPROVE";
  retakeFee: number;
}

export interface RetakeRegisteredItemResponse {
  courseId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  registrationType: string;
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
  enrollmentType?: "RETAKE" | "IMPROVE" | string | null;
  attemptNumber?: number | null;
  totalScore?: number | null;
}

export interface SemesterGpaSummary {
  semesterId: number;
  semesterName: string;
  semesterGpa: number;
  cumulativeGpa: number;
  totalCredits: number;
  cumulativeCredits: number;
}

export interface LearningResultsResponse {
  semesterId?: number | null;
  semesterName?: string | null;
  semesterGpa?: number | null;
  cumulativeGpa?: number | null;
  semesterCredits?: number | null;
  cumulativeCredits?: number | null;
  grades: StudentGradeItemResponse[];
  semesterSummaries: SemesterGpaSummary[];
}

export interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credits: number;
  description?: string | null;
  courseType?: "REQUIRED" | "ELECTIVE" | null;
  courseTypeLabel?: string | null;
  majorId?: number | null;
  majorName?: string | null;
  prerequisiteIds?: number[];
  prerequisiteNames?: string[];
}
