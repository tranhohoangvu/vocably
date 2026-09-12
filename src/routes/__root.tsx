import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { VocablyBoot } from "@/components/vocably/boot";
import appCss from "../styles.css?url";

const APP_NAME = "Vocably";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Ôn từ vựng TOEIC với thuật toán FSRS. Offline, giao diện sáng sạch.",
      },
      { name: "theme-color", content: "#F4F2EC" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <VocablyBoot>
          <Outlet />
        </VocablyBoot>
        <Scripts />
      </body>
    </html>
  );
}
