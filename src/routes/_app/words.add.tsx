import { createFileRoute } from "@tanstack/react-router";
import { WordEditor } from "@/components/vocably/word-editor";

export const Route = createFileRoute("/_app/words/add")({
  component: AddWordPage,
});

function AddWordPage() {
  return <WordEditor />;
}
