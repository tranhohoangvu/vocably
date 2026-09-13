import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/vocably/landing-page";
import { bounceAuthedToApp } from "@/lib/vocably/session";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    bounceAuthedToApp();
  },
  component: LandingPage,
});
