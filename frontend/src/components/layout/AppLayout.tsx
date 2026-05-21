import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/api/types";
import {
  LayoutDashboard, Users, GraduationCap, UserCog, BookOpen, Library, CalendarDays, DoorOpen,
  Clock, Layers, ClipboardList, BarChart3, MessageSquare, LogOut,
  CalendarCheck, Receipt, Award, NotebookPen, BookCheck, User, Globe, Repeat, BookMarked,
  Bell, Menu, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  listNotifications,
  markNotificationRead,
  type StudentNotification,
} from "@/lib/api/notifications";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { heading: string; items: Item[] };

const adminNavGroups: NavGroup[] = [
  {
    heading: "Tổng quan",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/landing", label: "Landing Page", icon: Globe },
    ],
  },
  {
    heading: "Người dùng",
    items: [
      { to: "/admin/users", label: "Tài khoản", icon: Users },
      { to: "/admin/students", label: "Sinh viên", icon: GraduationCap },
      { to: "/admin/teachers", label: "Giảng viên", icon: UserCog },
    ],
  },
  {
    heading: "Học vụ",
    items: [
      { to: "/admin/majors", label: "Ngành học", icon: Library },
      { to: "/admin/courses", label: "Học phần", icon: BookOpen },
      { to: "/admin/semesters", label: "Học kỳ", icon: CalendarDays },
      { to: "/admin/rooms", label: "Phòng học", icon: DoorOpen },
      { to: "/admin/periods", label: "Tiết học", icon: Clock },
      { to: "/admin/class-sections", label: "Lớp học phần", icon: Layers },
      { to: "/admin/enrollments", label: "Đăng ký học", icon: ClipboardList },
      { to: "/admin/academic-results", label: "Kết quả học tập", icon: BarChart3 },
    ],
  },
  {
    heading: "Hệ thống",
    items: [
      { to: "/admin/profile", label: "Hồ sơ cá nhân", icon: User },
    ],
  },
];

const teacherNavGroups: NavGroup[] = [
  {
    heading: "Tổng quan",
    items: [
      { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/teacher/profile", label: "Hồ sơ cá nhân", icon: User },
    ],
  },
  {
    heading: "Giảng dạy",
    items: [
      { to: "/teacher/classes", label: "Lớp học phần", icon: Layers },
      { to: "/teacher/grades", label: "Quản lý điểm", icon: NotebookPen },
    ],
  },
];

const studentNavGroups: NavGroup[] = [
  {
    heading: "Tổng quan",
    items: [
      { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/student/profile", label: "Hồ sơ cá nhân", icon: User },
    ],
  },
  {
    heading: "Tra cứu",
    items: [
      { to: "/student/schedule", label: "Thời khóa biểu", icon: CalendarDays },
      { to: "/student/exams", label: "Lịch thi", icon: CalendarCheck },
      { to: "/student/academic-results", label: "Kết quả học tập", icon: Award },
      { to: "/student/curriculum", label: "Chương trình đào tạo", icon: BookMarked },
    ],
  },
  {
    heading: "Chức năng",
    items: [
      { to: "/student/course-registration", label: "Đăng ký học phần", icon: BookCheck },
      { to: "/student/retake-registration", label: "Đăng ký thi lại", icon: Repeat },
      { to: "/student/tuition", label: "Học phí", icon: Receipt },
    ],
  },
];

const chatByRole: Record<Role, string> = {
  ADMIN: "/admin/chat",
  TEACHER: "/teacher/chat",
  STUDENT: "/student/chat",
};

function notificationTarget(item: StudentNotification) {
  if (item.type === "CHAT") return "/student/chat";
  return item.link || "/student/notifications";
}

function NavItem({ item, pathname, onNavigate }: { item: Item; pathname: string; onNavigate?: () => void }) {
  const active = pathname === item.to || pathname.startsWith(item.to + "/");
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function GroupedNavList({ groups, pathname, onNavigate }: { groups: NavGroup[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-4 px-3 py-3">
      {groups.map((group) => (
        <div key={group.heading}>
          <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {group.heading}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.items.map((it) => <NavItem key={it.to} item={it} pathname={pathname} onNavigate={onNavigate} />)}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarInner({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { role } = useAuth();
  const navGroups = role === "ADMIN" ? adminNavGroups : role === "TEACHER" ? teacherNavGroups : studentNavGroups;
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-sidebar-primary font-bold text-sidebar-primary-foreground">TL</div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Thang Long</div>
          <div className="text-xs text-sidebar-foreground/60">University Portal</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {role ? <GroupedNavList groups={navGroups} pathname={pathname} onNavigate={onNavigate} /> : null}
      </div>
      <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-sidebar-foreground/50">
        © {new Date().getFullYear()} Thang Long University
      </div>
    </div>
  );
}

function RoleSwitcher() {
  const { role } = useAuth();
  return (
    <Button variant="outline" size="sm" className="gap-2" disabled>
      <span className="hidden sm:inline">Role:</span>
      <span className="font-semibold capitalize">{role?.toLowerCase()}</span>
    </Button>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);
  return (
    <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/40">/</span>}
          <span className={cn(i === parts.length - 1 && "font-medium text-foreground")}>
            {p.replace(/-/g, " ")}
          </span>
        </span>
      ))}
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { name, role, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const initials = (name ?? "?").split(" ").slice(-2).map((s) => s[0]).join("").toUpperCase();
  const notificationsQuery = useQuery({
    queryKey: ["student", "notifications"],
    queryFn: listNotifications,
    enabled: role === "STUDENT",
    refetchInterval: role === "STUDENT" ? 30000 : false,
  });
  const notificationItems = notificationsQuery.data ?? [];
  const unreadCount = notificationItems.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student", "notifications"] }),
  });

  const openNotification = async (item: StudentNotification) => {
    if (!item.read) {
      await markReadMutation.mutateAsync(item.id);
    }

    const target = notificationTarget(item);
    if (target.startsWith("/student/")) {
      navigate({ to: target as never });
      return;
    }

    window.location.href = target;
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className={cn("sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border lg:block", !desktopSidebarOpen && "lg:hidden")}>
        <SidebarInner pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarInner pathname={pathname} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 lg:inline-flex"
            onClick={() => setDesktopSidebarOpen((value) => !value)}
            title={desktopSidebarOpen ? "An sidebar" : "Hien sidebar"}
          >
            {desktopSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>

          <Breadcrumbs pathname={pathname} />

          <div className="ml-auto flex items-center gap-2">
            {role && (
              <Link to={chatByRole[role]}>
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Chat">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            )}
            {role === "STUDENT" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9" title="Thông báo">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Thong bao</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notificationsQuery.isLoading ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground">Dang tai thong bao...</div>
                  ) : notificationItems.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground">Khong co thong bao moi.</div>
                  ) : notificationItems.slice(0, 4).map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="flex cursor-pointer items-start gap-3 py-3"
                      onClick={() => void openNotification(item)}
                    >
                      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", item.read ? "bg-muted-foreground/30" : "bg-primary")} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.title}</span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">{item.body}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/student/notifications" })} className="cursor-pointer justify-center text-sm font-medium">
                    Xem chi tiet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <RoleSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback></Avatar>
                  <div className="hidden text-left leading-tight md:block">
                    <div className="text-xs font-medium">{name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{role?.toLowerCase()}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
