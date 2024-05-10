import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useParams,
} from "@remix-run/react";
import "./tailwind.css";
import "@fontsource-variable/rubik/wght.css";
import "@fontsource-variable/rubik/wght-italic.css";
import { SearchForm } from "./components/SearchForm";
import { ImageHeadings } from "./components/ImageHeadings";
import { Disclaimer } from "./components/Disclaimer";
import { Footer } from "./components/Footer";
import { ManifestLink } from "@remix-pwa/sw";
import { PwaProvider, usePWA } from "./utils/helpers/client/pwa";
import { LoaderFunction } from "@remix-run/node";
import { getPwaBannerSession } from "./utils/cookies/pwa-banner-cookie.server";
import { useEffect } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getPwaBannerSession(request.headers.get("Cookie"));
  const status = session.get("status") as "accepted" | "dismissed";

  return { status };
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-adsense-account" content="ca-pub-6846086051700160" />
        <Meta />
        <ManifestLink />
        <Links />
      </head>
      <body>
        <PwaProvider>{children}</PwaProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { status } = useLoaderData<typeof loader>();
  const { event } = usePWA();

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", () => {
      console.log("IS CALLED");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {
        console.log("IS REMOVED");
      });
    };
  }, []);

  const params = useParams();
  const navigation = useNavigation();
  console.log(navigation.location);

  return (
    <div className="h-dvh w-dvw flex flex-col items-center sm:pt-[10dvh] p-4 pt-8">
      <ImageHeadings className="pb-10" />
      <div className="max-w-[500px] w-full flex flex-col items-center relative">
        <SearchForm key={params.search} className="pb-0" documents={[]} />

        <div className="w-full max-w-[300px] h-px bg-gray-200 my-5" />

        <Outlet />
        <Disclaimer />
      </div>

      <div className="mt-auto pt-8">
        <Footer />
      </div>
    </div>
  );
}
