import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
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
}

export function ProfileView({ subtitle }: ProfileViewProps) {
  const { profile, name, role } = useAuth();
  const fullName = profile?.fullName ?? name ?? "Sinh vien";
  const studentCode = profile?.code ?? "-";
  const major = profile?.majorOrDegree ?? "-";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const val = (v: string | number | null | undefined) =>
    v != null && v !== "" ? v : "-";

  const identityFields: DisplayField[] = [
    { label: "Ho va ten", value: val(profile?.fullName ?? name) },
    { label: "Ten dang nhap", value: val(profile?.username) },
    { label: "Ma sinh vien", value: val(profile?.code) },
    { label: "Vai tro", value: val(profile?.role ?? role) },
    { label: "Gioi tinh", value: val(profile?.gender) },
    { label: "Ngay sinh", value: val(profile?.dateOfBirth) },
    { label: "Tuoi", value: val(profile?.age) },
    { label: "CCCD", value: val(profile?.nationalId) },
  ];

  const contactFields: DisplayField[] = [
    { label: "Email", value: val(profile?.email) },
    { label: "So dien thoai", value: val(profile?.phone) },
    { label: "Noi sinh", value: val(profile?.placeOfBirth) },
    { label: "Que quan", value: val(profile?.hometown) },
    { label: "Dia chi thuong tru", value: val(profile?.permanentAddress) },
    { label: "Noi o hien tai", value: val(profile?.currentAddress) },
    { label: "Lien he khan cap", value: val(profile?.emergencyContact) },
  ];

  const academicFields: DisplayField[] = [
    { label: "Nganh hoc", value: val(major) },
    { label: "Khoa", value: val(profile?.cohort) },
    { label: "Lop hanh chinh", value: val(profile?.className) },
    { label: "Nien khoa", value: val(profile?.academicYear) },
    { label: "Co van hoc tap", value: val(profile?.advisor) },
    { label: "He dao tao", value: val(profile?.trainingType) },
    { label: "Trang thai", value: val(profile?.status) },
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
              {profile?.status && <Badge>{profile.status}</Badge>}
              {major !== "-" && <Badge variant="secondary">{major}</Badge>}
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
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
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
    <div className="min-h-20 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {item.label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold leading-6">{item.value}</div>
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
