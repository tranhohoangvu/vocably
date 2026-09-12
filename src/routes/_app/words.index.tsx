import { createFileRoute } from "@tanstack/react-router";
import { WordListPage } from "@/components/vocably/word-list";

export const Route = createFileRoute("/_app/words/")({ component: WordListPage });
