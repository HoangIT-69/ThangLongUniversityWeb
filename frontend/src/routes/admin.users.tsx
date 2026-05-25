import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/api/admin";
import type { AdminUserResponse } from "@/lib/api/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

const createAdminSchema = z.object({
  username: z.string().min(3, "Username tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
type CreateAdminForm = z.infer<typeof createAdminSchema>;

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị hệ thống",
  TEACHER: "Giảng viên",
  STUDENT: "Sinh viên",
};

function UsersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.listUsers,
  });

  const form = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Đã tạo tài khoản admin");
      form.reset();
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Đã cập nhật trạng thái tài khoản");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isPending) return <UsersSkeleton />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );

  const users = data ?? [];

  return (
    <div>
      <PageHeader
        title="Quản lý tài khoản"
        description={`${users.length} tài khoản trong hệ thống`}
        actions={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm tài khoản
          </Button>
        }
      />

      <DataTable
        data={users}
        rowKey={(user) => String(user.id)}
        searchPlaceholder="Tìm theo username, email, vai trò..."
        columns={[
          {
            key: "username",
            header: "Username",
            render: (user) => (
              <span className="font-mono text-xs">{user.username}</span>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (user) => (
              <span className="text-sm text-muted-foreground">{user.email}</span>
            ),
          },
          {
            key: "role",
            header: "Vai trò",
            accessor: (user) => `${user.role} ${roleLabels[user.role] ?? user.role}`,
            render: (user) => (
              <div className="space-y-1">
                <StatusBadge value={user.role} />
                <div className="text-xs text-muted-foreground">
                  {roleLabels[user.role] ?? user.role}
                </div>
              </div>
            ),
          },
          {
            key: "active",
            header: "Trạng thái",
            render: (user) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={user.active}
                  disabled={toggleMutation.isPending}
                  onCheckedChange={() => toggleMutation.mutate(user.id)}
                />
                <span className="text-xs text-muted-foreground">
                  {user.active ? "Hoạt động" : "Khóa"}
                </span>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo tài khoản Admin</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Đang tạo..." : "Tạo tài khoản"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

// Type-only export for columns typing
export type { AdminUserResponse };
