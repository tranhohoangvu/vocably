import { createFileRoute } from "@tanstack/react-router";
import { StudyHubPage } from "@/components/vocably/study-hub";

export const Route = createFileRoute("/_app/study/")({ component: StudyHubPage });
