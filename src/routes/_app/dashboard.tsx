import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/vocably/dashboard-page";

export const Route = createFileRoute("/_app/dashboard")({ component: DashboardPage });
