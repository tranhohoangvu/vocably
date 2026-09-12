import { createFileRoute } from "@tanstack/react-router";
import { FillStudy } from "@/components/vocably/fill-study";

export const Route = createFileRoute("/_app/study/fill")({ component: FillStudy });
