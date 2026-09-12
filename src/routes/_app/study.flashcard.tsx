import { createFileRoute } from "@tanstack/react-router";
import { FlashcardStudy } from "@/components/vocably/flashcard-study";

export const Route = createFileRoute("/_app/study/flashcard")({ component: FlashcardStudy });
