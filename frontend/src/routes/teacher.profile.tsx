import { createFileRoute } from "@tanstack/react-router";
import { ProfileView } from "./student.profile";

export const Route = createFileRoute("/teacher/profile")({ component: () => <ProfileView subtitle="Thông tin giảng viên và liên hệ" /> });
