import { createFileRoute } from "@tanstack/react-router";
import { WordEditor } from "@/components/vocably/word-editor";
import { requireRegisteredUser } from "@/lib/vocably/session";

export const Route = createFileRoute("/_app/words/edit/$id")({
  beforeLoad: () => {
    requireRegisteredUser();
  },
  component: EditWordPage,
});

function EditWordPage() {
  const { id } = Route.useParams();
  return <WordEditor wordId={Number(id)} />;
}
