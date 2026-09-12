import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/components/vocably/login-page";

export const Route = createFileRoute("/login")({
    beforeLoad: () => {
        if (typeof window === "undefined") return;
        try {
            const raw = localStorage.getItem("vocably_auth_user");
            if (raw) {
                const user = JSON.parse(raw);
                // Đã đăng nhập thì không được vào trang đăng nhập nữa
                if (user) {
                    throw redirect({ to: "/dashboard" });
                }
            }
        } catch (e) {
            if (e && typeof e === "object" && "to" in (e as object)) throw e;
        }
    },
    component: LoginPage,
});