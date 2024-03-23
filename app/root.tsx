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
import { search } from "./utils/actions/search.server";
import { ActionFunction } from "@remix-run/node";
import { SearchForm } from "./components/SearchForm";

export const action: ActionFunction = search;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
    <div className="h-dvh w-dvw flex flex-col justify-center items-center">
      <div className="max-w-[400px] w-full flex flex-col items-center">
        <SearchForm />
        <Outlet />
      </div>
    </div>
  );
}
