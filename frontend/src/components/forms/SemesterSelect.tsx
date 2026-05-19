import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { semesters } from "@/data/mock";

export function SemesterSelect({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? "w-[260px]"}>
        <SelectValue placeholder="Chọn học kỳ" />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((s) => (
          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
