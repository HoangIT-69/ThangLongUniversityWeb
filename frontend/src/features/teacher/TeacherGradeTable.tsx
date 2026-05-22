import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  calculateTotal,
  getGpa4,
  getLetterGrade,
  type TeacherGradeRow,
} from "./teacherData";

interface TeacherGradeTableProps {
  rows: TeacherGradeRow[];
  disabled?: boolean;
  onChange: (row: TeacherGradeRow) => void;
  onSave?: (row: TeacherGradeRow) => void;
}

export function TeacherGradeTable({
  rows,
  disabled,
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                Chua co sinh vien trong bang diem lop nay
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <GradeRow
                key={row.enrollmentId}
                row={row}
                disabled={disabled ?? (!row.canEdit)}
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
  disabled,
  onChange,
  onSave,
}: {
  row: TeacherGradeRow;
  disabled: boolean;
  onChange: (row: TeacherGradeRow) => void;
  onSave?: (row: TeacherGradeRow) => void;
}) {
  // Track the latest computed row so blur handler can save the correct value
  const pendingRow = useRef<TeacherGradeRow | null>(null);

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
    const nextRow = {
      ...next,
      totalScore,
      letterGrade: getLetterGrade(totalScore),
      gpa4: getGpa4(totalScore),
    };
    onChange(nextRow);
    pendingRow.current = nextRow;
  };

  const handleBlur = () => {
    if (pendingRow.current) {
      onSave?.(pendingRow.current);
      pendingRow.current = null;
    }
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
        disabled={disabled}
        onChange={(value) => updateScore("participationScore", value)}
        onBlur={handleBlur}
      />
      <ScoreInput
        value={row.midtermScore}
        disabled={disabled}
        onChange={(value) => updateScore("midtermScore", value)}
        onBlur={handleBlur}
      />
      <ScoreInput
        value={row.finalScore}
        disabled={disabled}
        onChange={(value) => updateScore("finalScore", value)}
        onBlur={handleBlur}
      />
      <ScoreInput
        value={row.retestScore}
        disabled={disabled}
        onChange={(value) => updateScore("retestScore", value)}
        onBlur={handleBlur}
      />
      <TableCell className="font-semibold tabular-nums">{row.totalScore.toFixed(2)}</TableCell>
      <TableCell>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
          {row.letterGrade}
        </span>
      </TableCell>
      <TableCell className="tabular-nums">{row.gpa4.toFixed(1)}</TableCell>
    </TableRow>
  );
}

function ScoreInput({
  value,
  disabled,
  onChange,
  onBlur,
}: {
  value: number;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  const [local, setLocal] = useState(value === 0 ? "" : String(value));

  // Sync local state when the parent value changes (e.g. after save/reset)
  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    prevValue.current = value;
    const next = value === 0 ? "" : String(value);
    if (local !== next) setLocal(next);
  }

  return (
    <TableCell>
      <Input
        type="number"
        min={0}
        max={10}
        step={0.1}
        value={local}
        disabled={disabled}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          onChange(local || "0");
          onBlur?.();
        }}
        className="h-8 w-20 tabular-nums"
      />
    </TableCell>
  );
}
