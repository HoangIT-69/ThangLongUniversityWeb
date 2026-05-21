import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  Contact,
  GraduationCap,
  Home,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export const Route = createFileRoute("/student/profile")({
  component: () => <ProfileView subtitle="Ho so sinh vien va thong tin lien he" />,
});

interface ProfileViewProps {
  subtitle: string;
}

interface DisplayField {
  label: string;
  value: string | number;
  source: "api" | "mock";
}

const mockStudentProfile = {
  gender: "Nam",
  dateOfBirth: "12/09/2004",
  age: 21,
  nationalId: "001204000789",
  placeOfBirth: "Ha Noi",
  hometown: "Thanh Tri, Ha Noi",
  permanentAddress: "So 12 ngo 45 Nguyen Trai, Thanh Xuan, Ha Noi",
  currentAddress: "KTX Dai hoc Thang Long, Nghiem Xuan Yem, Hoang Mai",
  phone: "0987 654 321",
  emergencyContact: "Le Van An - 0912 345 678",
  cohort: "K36",
  className: "CNTT-K36A",
  academicYear: "2022 - 2026",
  advisor: "ThS. Nguyen Minh Hoang",
  status: "Dang hoc",
  trainingType: "Dai hoc chinh quy",
  accumulatedCredits: 84,
  gpa: 3.42,
  scholarshipLevel: "Gioi",
};

export function ProfileView({ subtitle }: ProfileViewProps) {
  const { profile, name, role } = useAuth();
  const fullName = profile?.fullName ?? name ?? "Sinh vien";
  const studentCode = profile?.code ?? "SV001";
  const major = profile?.majorOrDegree ?? "Cong nghe thong tin";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const identityFields: DisplayField[] = [
    field("Ho va ten", fullName, Boolean(profile?.fullName || name)),
    field("Ten dang nhap", profile?.username, Boolean(profile?.username)),
    field("Ma sinh vien", studentCode, Boolean(profile?.code)),
    field("Vai tro", profile?.role ?? role ?? "STUDENT", Boolean(profile?.role || role)),
    field("Gioi tinh", mockStudentProfile.gender, false),
    field("Ngay sinh", mockStudentProfile.dateOfBirth, false),
    field("Tuoi", mockStudentProfile.age, false),
    field("CCCD", mockStudentProfile.nationalId, false),
  ];

  const contactFields: DisplayField[] = [
    field("Email", profile?.email, Boolean(profile?.email)),
    field("So dien thoai", mockStudentProfile.phone, false),
    field("Noi sinh", mockStudentProfile.placeOfBirth, false),
    field("Que quan", mockStudentProfile.hometown, false),
    field("Dia chi thuong tru", mockStudentProfile.permanentAddress, false),
    field("Noi o hien tai", mockStudentProfile.currentAddress, false),
    field("Lien he khan cap", mockStudentProfile.emergencyContact, false),
  ];

  const academicFields: DisplayField[] = [
    field("Nganh hoc", major, Boolean(profile?.majorOrDegree)),
    field("Khoa", mockStudentProfile.cohort, false),
    field("Lop hanh chinh", mockStudentProfile.className, false),
    field("Nien khoa", mockStudentProfile.academicYear, false),
    field("Co van hoc tap", mockStudentProfile.advisor, false),
    field("He dao tao", mockStudentProfile.trainingType, false),
    field("Trang thai", mockStudentProfile.status, false),
  ];

  return (
    <div>
      <PageHeader title="Thong tin ca nhan" description={subtitle} />

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="bg-primary px-6 py-8 text-primary-foreground">
            <Avatar className="mx-auto h-24 w-24 border-4 border-primary-foreground/40">
              {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={fullName} />}
              <AvatarFallback className="bg-primary-foreground text-2xl text-primary">
                {initials || "SV"}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 text-center">
              <div className="text-xl font-semibold">{fullName}</div>
              <div className="mt-1 font-mono text-sm opacity-85">{studentCode}</div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge>{mockStudentProfile.status}</Badge>
              <Badge variant="secondary">{major}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <MiniMetric label="GPA" value={mockStudentProfile.gpa.toFixed(2)} icon={Award} />
              <MiniMetric
                label="Tin chi"
                value={mockStudentProfile.accumulatedCredits}
                icon={BookOpen}
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Trang thai du lieu
              </div>
              <p className="mt-2 text-muted-foreground">
                Truong co API se hien thi du lieu that; truong con thieu dang dung placeholder de BE
                bo sung sau.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <InfoSection
            title="Thong tin dinh danh"
            description="Thong tin ho so ca nhan va giay to sinh vien"
            icon={IdCard}
            fields={identityFields}
          />
          <InfoSection
            title="Lien he va cu tru"
            description="Thong tin lien lac, que quan va dia chi hien tai"
            icon={MapPin}
            fields={contactFields}
          />
          <InfoSection
            title="Thong tin hoc tap"
            description="Thong tin chuong trinh dao tao va quan ly lop"
            icon={GraduationCap}
            fields={academicFields}
          />
        </div>
      </div>
    </div>
  );
}

function field(
  label: string,
  value: string | number | null | undefined,
  fromApi: boolean,
): DisplayField {
  return {
    label,
    value: value ?? "-",
    source: fromApi && value != null && value !== "" ? "api" : "mock",
  };
}

function InfoSection({
  title,
  description,
  icon: Icon,
  fields,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  fields: DisplayField[];
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Badge variant="outline">API + placeholder</Badge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {fields.map((item) => (
          <ProfileField key={item.label} field={item} icon={iconForLabel(item.label)} />
        ))}
      </div>
    </Card>
  );
}

function ProfileField({
  field: item,
  icon: Icon,
}: {
  field: DisplayField;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="min-h-24 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Icon className="h-4 w-4" />
          {item.label}
        </div>
        <span
          className={
            item.source === "api"
              ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
              : "rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
          }
        >
          {item.source === "api" ? "API" : "Can BE"}
        </span>
      </div>
      <div className="mt-3 break-words text-sm font-semibold leading-6">{item.value}</div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <div className="mt-2 text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function iconForLabel(label: string): ComponentType<{ className?: string }> {
  const map: Record<string, ComponentType<{ className?: string }>> = {
    "Ho va ten": UserRound,
    "Ten dang nhap": Contact,
    "Ma sinh vien": IdCard,
    "Vai tro": ShieldCheck,
    "Gioi tinh": Users,
    "Ngay sinh": CalendarDays,
    Tuoi: CalendarDays,
    CCCD: IdCard,
    Email: Mail,
    "So dien thoai": Phone,
    "Noi sinh": MapPin,
    "Que quan": Home,
    "Dia chi thuong tru": Home,
    "Noi o hien tai": MapPin,
    "Lien he khan cap": Phone,
    "Nganh hoc": Building2,
    Khoa: GraduationCap,
    "Lop hanh chinh": Users,
    "Nien khoa": CalendarDays,
    "Co van hoc tap": UserRound,
    "He dao tao": BookOpen,
    "Trang thai": ShieldCheck,
  };

  return map[label] ?? UserRound;
}
