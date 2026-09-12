import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/vocably/admin-page";

export const Route = createFileRoute("/_app/admin")({ component: AdminPage });
