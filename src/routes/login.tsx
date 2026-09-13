import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/vocably/login-page";
import { bounceAuthedToApp } from "@/lib/vocably/session";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    bounceAuthedToApp();
  },
  component: LoginPage,
});
