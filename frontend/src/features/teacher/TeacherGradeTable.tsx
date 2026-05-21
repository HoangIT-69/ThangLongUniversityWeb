import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  calculateTotal,
  getGpa4,
  getLetterGrade,
  type TeacherGradeRow,
} from "./teacherData";

interface TeacherGradeTableProps {
  rows: TeacherGradeRow[];
  savingEnrollmentId?: string;
  onChange: (row: TeacherGradeRow) => void;
  onSave: (row: TeacherGradeRow) => void;
}

export function TeacherGradeTable({
  rows,
  savingEnrollmentId,
  onChange,
  onSave,
}: TeacherGradeTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Sinh vien</TableHead>
            <TableHead className="w-28">Chuyen can</TableHead>
            <TableHead className="w-28">Giua ky</TableHead>
            <TableHead className="w-28">Cuoi ky</TableHead>
            <TableHead className="w-28">Thi lai</TableHead>
            <TableHead>Tong</TableHead>
            <TableHead>Chu</TableHead>
            <TableHead>GPA4</TableHead>
            <TableHead>Trang thai</TableHead>
            <TableHead className="text-right">Luu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                Chua co sinh vien trong bang diem lop nay
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <GradeRow
                key={row.enrollmentId}
                row={row}
                isSaving={savingEnrollmentId === row.enrollmentId}
                onChange={onChange}
                onSave={onSave}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function GradeRow({
  row,
  isSaving,
  onChange,
  onSave,
}: {
  row: TeacherGradeRow;
  isSaving: boolean;
  onChange: (row: TeacherGradeRow) => void;
  onSave: (row: TeacherGradeRow) => void;
}) {
  const updateScore = (
    key: "participationScore" | "midtermScore" | "finalScore" | "retestScore",
    rawValue: string,
  ) => {
    const value = Number(rawValue);
    if (Number.isNaN(value) || value < 0 || value > 10) {
      toast.error("Diem phai trong khoang 0-10");
      return;
    }
    const next = { ...row, [key]: value };
    const totalScore = calculateTotal(next.participationScore, next.midtermScore, next.finalScore);
    onChange({
      ...next,
      totalScore,
      letterGrade: getLetterGrade(totalScore),
      gpa4: getGpa4(totalScore),
    });
  };

  return (
    <TableRow>
      <TableCell>
        <div className="min-w-52">
          <div className="font-medium">{row.studentName}</div>
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">{row.studentCode}</span> - {row.source}
          </div>
        </div>
      </TableCell>
      <ScoreInput
        value={row.participationScore}
        disabled={!row.canEdit}
        onChange={(value) => updateScore("participationScore", value)}
      />
      <ScoreInput
        value={row.midtermScore}
        disabled={!row.canEdit}
        onChange={(value) => updateScore("midtermScore", value)}
      />
      <ScoreInput
        value={row.finalScore}
        disabled={!row.canEdit}
        onChange={(value) => updateScore("finalScore", value)}
      />
      <ScoreInput
        value={row.retestScore}
        disabled={!row.canEdit}
        onChange={(value) => updateScore("retestScore", value)}
      />
      <TableCell className="font-semibold tabular-nums">{row.totalScore.toFixed(2)}</TableCell>
      <TableCell>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
          {row.letterGrade}
        </span>
      </TableCell>
      <TableCell className="tabular-nums">{row.gpa4.toFixed(1)}</TableCell>
      <TableCell>
        <StatusBadge value={row.gradeStatus} />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!row.canEdit || isSaving}
          onClick={() => onSave(row)}
        >
          <Save className="h-4 w-4" />
          Luu
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ScoreInput({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <TableCell>
      <Input
        type="number"
        min={0}
        max={10}
        step={0.1}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-20 tabular-nums"
      />
    </TableCell>
  );
}
