import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import "@fontsource-variable/rubik/wght.css";
import "@fontsource-variable/rubik/wght-italic.css";
import { useEffect } from "react";
import { PwaProvider } from "./utils/helpers/pwa";

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      console.log("beforeinstallprompt event captured", event);
    };

    if ("serviceWorker" in navigator) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("Service worker registered"))
        .catch((error) =>
          console.error("Service worker registration failed:", error)
        );
    } else {
      console.log("Service workers are not supported");
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
