import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Props {
  semesterId: number;
}

export function RetakeRegistrationsTab({ semesterId }: Props) {
  const [status, setStatus] = useState("");


  const listQuery = useQuery({
    queryKey: ["admin", "exam-registrations", semesterId, status],
    queryFn: () => adminApi.listExamRegistrations(semesterId, status || undefined),
  });


  const items = listQuery.data ?? [];

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả</SelectItem>
            <SelectItem value="PENDING">Chờ xử lý</SelectItem>
            <SelectItem value="REGISTERED">Đã xác nhận</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void adminApi
              .exportRetakes(semesterId)
              .catch((error) =>
                toast.error(error instanceof Error ? error.message : "Không xuất được Excel"),
              )
          }
        >
          <Download className="h-4 w-4 mr-1" />
          Xuất Excel
        </Button>
      </div>

      {listQuery.isLoading && <Skeleton className="h-64 w-full" />}

      {!listQuery.isLoading && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">MSSV</th>
                <th className="text-left p-3 font-medium">Tên sinh viên</th>
                <th className="text-left p-3 font-medium">Môn học</th>
                <th className="text-left p-3 font-medium">Loại đăng ký</th>
                <th className="text-left p-3 font-medium">Thời gian thi</th>
                <th className="text-left p-3 font-medium">Phòng thi</th>
                <th className="text-left p-3 font-medium">Phí</th>
                <th className="text-left p-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{r.studentCode}</td>
                  <td className="p-3">{r.studentName}</td>
                  <td className="p-3">
                    {r.courseName}{" "}
                    <span className="text-xs text-muted-foreground">({r.courseCode})</span>
                  </td>
                  <td className="p-3">
                    <RegistrationTypeBadge type={r.registrationType} />
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {r.examAt
                      ? new Intl.DateTimeFormat("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(r.examAt))
                      : "—"}
                  </td>
                  <td className="p-3">{r.examRoom ?? "—"}</td>
                  <td className="p-3 text-xs">
                    {r.feeCharged != null ? `${r.feeCharged.toLocaleString("vi-VN")}₫` : "—"}
                  </td>
                  <td className="p-3">
                    <RetakeStatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function RegistrationTypeBadge({ type }: { type?: string | null }) {
  if (type === "RETAKE")
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Thi lại</Badge>;
  if (type === "IMPROVE")
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">Nâng điểm</Badge>;
  return (
    <Badge variant="outline" className="text-xs">
      {type ?? "—"}
    </Badge>
  );
}

function RetakeStatusBadge({ status }: { status: string }) {
  if (status === "REGISTERED")
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đã xác nhận</Badge>;
  if (status === "PENDING")
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ xử lý</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}
