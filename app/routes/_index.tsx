import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { LuCornerDownLeft, LuSearch } from "react-icons/lu";
import { InputComposer } from "~/primitives/input";
import { cx } from "~/utils/helpers/cx";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [search, setSearch] = useState<string>();

  return (
    <div className="h-dvh w-dvw flex flex-col justify-center items-center">
      <div className="w-full max-w-[400px]">
        <InputComposer className="w-full grid grid-cols-[24px_1fr_54px]">
          <div>
            <LuSearch className="text-slate-700" />
          </div>
          <InputComposer.Input
            className="w-full"
            placeholder="Watermelon, Deli Meat, fish, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div
            className={cx(
              "flex items-center space-x-1 justify-end text-gray-400",
              {
                "opacity-0": !search,
                "opacity-100": search,
              }
            )}
          >
            <span className="text-xs">Enter</span>
            <LuCornerDownLeft className="text-xs" />
          </div>
        </InputComposer>
      </div>
    </div>
  );
}
