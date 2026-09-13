import { createFileRoute } from "@tanstack/react-router";
import { WordEditor } from "@/components/vocably/word-editor";
import { requireRegisteredUser } from "@/lib/vocably/session";

export const Route = createFileRoute("/_app/words/add")({
  beforeLoad: () => {
    requireRegisteredUser();
  },
  component: AddWordPage,
});

function AddWordPage() {
  return <WordEditor />;
}
