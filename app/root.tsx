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
    <div className="h-dvh w-dvw flex flex-col items-center sm:pt-[10dvh] p-4 pt-8">
      <ImageHeadings className="pb-12" />
      <div className="max-w-[500px] w-full flex flex-col items-center relative">
        <SearchForm className="pb-3" documents={[]} />

        <div className="w-full max-w-[300px] h-px bg-gray-200 my-6" />

        <Outlet />
        <Disclaimer />
      </div>

      <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800 mt-auto">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between md:space-x-16">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © {new Date().getFullYear()}{" "}
            <a href="https://flowbite.com/" className="hover:underline">
              eatwhilepregnant.com™
            </a>
            . All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <li>
              <a href="/#" className="hover:underline me-4 md:me-6">
                About
              </a>
            </li>
            <li>
              <a href="/#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
