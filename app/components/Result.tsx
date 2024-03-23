import { cx } from "~/utils/helpers/cx";
import { Database } from "~/utils/types/supabase";

type ResultProps = {
  document: Database["public"]["Tables"]["documents"]["Row"];
};

export const Result = ({ document }: ResultProps) => {
  <div className="w-full">
    {document.is_safe && (
      <div
        className={cx(
          "px-2 py-1 rounded-md w-fit font-semibold text-sm uppercase flex items-center space-x-1.5",
          {
            "text-yellow-500 bg-yellow-100": document.is_safe === "yellow",
            "text-red-500 bg-red-100": document.is_safe === "red",
            "text-green-500 bg-green-100": document.is_safe === "green",
          }
        )}
      >
        <div
          className={cx("w-3 h-3  rounded-full", {
            "bg-yellow-500": document.is_safe === "yellow",
            "bg-red-500": document.is_safe === "red",
            "bg-green-500": document.is_safe === "green",
          })}
        />
        <span className="translate-y-px">
          {document.is_safe === "green"
            ? "safe to eat"
            : document.is_safe === "red"
              ? "unsafe to eat"
              : document.is_safe === "yellow"
                ? "proceed with caution"
                : null}
        </span>
      </div>
    )}

    <h2 className="font-semibold text-xl text-zinc-700 pt-2 capitalize">
      {document.search}
    </h2>
    <p className="font-lg text-base text-zinc-600">{document.content}</p>
  </div>;
};
