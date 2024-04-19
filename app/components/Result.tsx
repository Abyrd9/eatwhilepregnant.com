import { cx } from "~/utils/helpers/cx";
import { FiAlertTriangle, FiCheckCircle, FiXOctagon } from "react-icons/fi";
import { useRef } from "react";
import { InferSelectModel } from "drizzle-orm";
import { documents } from "~/drizzle/schema";

type ResultProps = {
  className?: string;
  document: InferSelectModel<typeof documents>;
};

export const Result = ({ className, document }: ResultProps) => {
  const Ref = useRef<HTMLParagraphElement>(null);

  return (
    <div className={cx("w-full", className)}>
      {document.is_safe && (
        <div
          className={cx(
            "p-2 font-medium rounded-md tracking-wide uppercase flex items-center space-x-2 w-full border",
            {
              "text-green-500 bg-green-50 border-green-200":
                document.is_safe === "1",
              "text-teal-500 bg-teal-50 border-teal-200":
                document.is_safe === "2",
              "text-yellow-500 bg-yellow-50 border-yellow-200":
                document.is_safe === "3",
              "text-red-500 bg-red-50 border-red-200": document.is_safe === "4",
            }
          )}
        >
          <span>
            {document.is_safe === "1" ? (
              <FiCheckCircle className="text-lg" />
            ) : document.is_safe === "2" ? (
              <FiCheckCircle className="text-lg" />
            ) : document.is_safe === "3" ? (
              <FiAlertTriangle className="text-lg" />
            ) : document.is_safe === "4" ? (
              <FiXOctagon className="text-lg" />
            ) : null}
          </span>
          <span className="text-base">
            {document.is_safe === "1"
              ? "safe to eat"
              : document.is_safe === "2"
                ? "eat with caution"
                : document.is_safe === "3"
                  ? "eat with caution"
                  : document.is_safe === "4"
                    ? "do not eat"
                    : null}
          </span>
        </div>
      )}

      <h2 className="font-semibold text-xl text-zinc-700 pt-2.5 capitalize">
        {document.search}
      </h2>
      <p ref={Ref} className="font-lg text-base text-zinc-600">
        {document.content}
      </p>
    </div>
  );
};
