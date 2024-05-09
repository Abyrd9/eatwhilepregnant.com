import { ComponentPropsWithoutRef } from "react";
import { cx } from "~/utils/helpers/client/cx";
import logo from "~/images/logo.png";

type ImageHeadingsProps = ComponentPropsWithoutRef<"div">;

export const ImageHeadings = ({ className, ...props }: ImageHeadingsProps) => {
  return (
    <div {...props} className={cx("relative", className)}>
      <img src={logo} alt="logo" className="max-w-[160px] sm:max-w-[180px]" />
    </div>
  );
};
