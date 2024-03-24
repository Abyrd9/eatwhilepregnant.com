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
import { FiInfo } from "react-icons/fi";
import { cx } from "./utils/helpers/cx";
import logo from "~/images/logo.png";
import coffee from "~/images/coffee.png";
import pineapple from "~/images/pineapple.png";
import sushi from "~/images/sushi.png";

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
    <div className="h-dvh w-dvw flex flex-col items-center pt-[20dvh]">
      <div className="pb-12">
        <img src={logo} alt="logo" className="max-w-[240px]" />
      </div>
      <div className="max-w-[500px] w-full flex flex-col items-center relative">
        <img
          src={coffee}
          alt="coffee"
          className="absolute -top-[124px] -rotate-[14deg] -left-[52px] max-w-[100px]"
        />

        <img
          src={sushi}
          alt="sushi"
          className="absolute -top-[104px] right-0 rotate-[6deg]  max-w-[80px] z-20"
        />
        <img
          src={pineapple}
          alt="pineapple"
          className="absolute -top-[162px] -right-[52px] rotate-[8deg]  max-w-[70px] z-10"
        />

        <SearchForm />

        <div className="w-full max-w-[300px] h-px bg-gray-200 my-6" />

        <Outlet />

        <div
          className={cx(
            "p-2 rounded-md  space-x-2 w-full border text-blue-500 bg-blue-50 border-blue-200 text-sm grid grid-cols-[16px_1fr]"
          )}
        >
          <FiInfo className="text-base translate-y-px" />
          <span>
            This website does not provide medical advice. Consult your doctor
            regarding any food items you may have questions about.
          </span>
        </div>
      </div>
    </div>
  );
}
