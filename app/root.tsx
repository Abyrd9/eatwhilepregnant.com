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
import { SearchForm } from "./components/SearchForm";
import { ImageHeadings } from "./components/ImageHeadings";
import { Disclaimer } from "./components/Disclaimer";
import { Footer } from "./components/Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6846086051700160"
          crossOrigin="anonymous"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  return (
    <div className="h-dvh w-dvw flex flex-col items-center sm:pt-[10dvh] p-4 pt-8">
      <ImageHeadings className="pb-12" />
      <div className="max-w-[500px] w-full flex flex-col items-center relative">
        <SearchForm className="pb-3" documents={[]} />

        <div className="w-full max-w-[300px] h-px bg-gray-200 my-6" />

        <Outlet />
        <Disclaimer />
      </div>

      <div className="pt-8">
        <Footer />
      </div>
    </div>
  );
}
