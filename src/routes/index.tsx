import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "@/components/vocably/landing-page";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    try {
      // Kiểm tra trạng thái đăng nhập từ localStorage
      const raw = localStorage.getItem("vocably_auth_user");
      if (raw) {
        const user = JSON.parse(raw) as { isGuest?: boolean };
        // Nếu đã có phiên (user thường, admin, hoặc demo) -> Ép vào app
        if (user) {
          throw redirect({ to: "/dashboard" });
        }
      }
    } catch (e) {
      if (e && typeof e === "object" && "to" in (e as object)) throw e;
    }
  },
  component: LandingPage,
});