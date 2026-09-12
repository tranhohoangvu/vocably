import { createFileRoute } from "@tanstack/react-router";
import { WordEditor } from "@/components/vocably/word-editor";

export const Route = createFileRoute("/_app/words/edit/$id")({
  component: EditWordPage,
});

function EditWordPage() {
  const { id } = Route.useParams();
  return <WordEditor wordId={Number(id)} />;
}
