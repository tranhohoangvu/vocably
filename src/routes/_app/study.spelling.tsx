import { createFileRoute } from "@tanstack/react-router";
import { SpellingStudy } from "@/components/vocably/spelling-study";

export const Route = createFileRoute("/_app/study/spelling")({ component: SpellingStudy });
