import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type WordStatus } from "@/lib/vocably/types";

const TONE: Record<WordStatus, "new" | "learning" | "review" | "known"> = {
  new: "new",
  learning: "learning",
  review: "review",
  known: "known",
};

export function StatusBadge({ status }: { status: WordStatus }) {
  return <Badge tone={TONE[status] ?? "new"}>{STATUS_LABELS[status]}</Badge>;
}
