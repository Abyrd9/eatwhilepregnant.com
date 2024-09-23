import { useRouteLoaderData } from "@remix-run/react";
import { Disclaimer } from "~/components/Disclaimer";
import { Footer } from "~/components/Footer";
import { ImageHeadings } from "~/components/ImageHeadings";
import { SearchForm } from "~/components/SearchForm";
import type { RootLoaderData } from "~/root";

export default function Index() {
  const { documents } = useRouteLoaderData("root") as RootLoaderData;

  return (
    <div className="h-dvh w-dvw flex flex-col items-center sm:pt-[10dvh] p-4 pt-8">
      <ImageHeadings className="pb-10" />
      <div className="max-w-[500px] w-full flex flex-col items-center relative">
        <SearchForm className="pb-0" documents={documents} />

        <div className="w-full max-w-[300px] h-px bg-gray-200 my-5" />

        <Disclaimer />
      </div>

      <div className="mt-auto pt-8">
        <Footer />
      </div>
    </div>
  );
}
