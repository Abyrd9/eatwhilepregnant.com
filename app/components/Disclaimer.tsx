import { FiInfo } from "react-icons/fi";
import { cx } from "~/utils/helpers/cx";

export const Disclaimer = () => {
  return (
    <div
      className={cx(
        "p-2 rounded-md  space-x-1 w-full border text-blue-500 bg-blue-50 border-blue-200 text-xs grid grid-cols-[16px_1fr] max-w-[400px] -z-10"
      )}
    >
      <FiInfo className="text-sm translate-y-px" />
      <span>
        The information on this website is not medical advice. Please read our
        full <button className="underline cursor-pointer">disclaimer</button>{" "}
        before proceeding.
      </span>
    </div>
  );
};
