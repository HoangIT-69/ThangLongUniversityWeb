export type AcademicOpsModule =
  | "faculties"
  | "departments"
  | "curriculums"
  | "registration-periods"
  | "timetables"
  | "teaching-assignments"
  | "reports"
  | "notifications"
  | "workflow";

export type ModuleRow = Record<string, string | number | boolean>;

export interface ModuleConfig {
  title: string;
  description: string;
  sourceNote: string;
}
