import { createFileRoute } from "@tanstack/react-router";
import { QuizStudy } from "@/components/vocably/quiz-study";

export const Route = createFileRoute("/_app/study/quiz")({ component: QuizStudy });
