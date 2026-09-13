import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/vocably/admin-page";
import { requireAdmin } from "@/lib/vocably/session";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: () => {
    requireAdmin();
  },
  component: AdminPage,
});
