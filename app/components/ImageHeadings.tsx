import { ComponentPropsWithoutRef } from "react";
import { cx } from "~/utils/helpers/cx";
import logo from "~/images/logo.png";
import coffee from "~/images/coffee.png";
import pineapple from "~/images/pineapple.png";
import sushi from "~/images/sushi.png";

type ImageHeadingsProps = ComponentPropsWithoutRef<"div">;

export const ImageHeadings = ({ className, ...props }: ImageHeadingsProps) => {
  return (
    <div {...props} className={cx("relative", className)}>
      <img src={logo} alt="logo" className="max-w-[224px]" />

      <img
        src={coffee}
        alt="coffee"
        className="absolute top-[150px] -rotate-[14deg] -left-[120px] max-w-[100px]"
      />

      <img
        src={sushi}
        alt="sushi"
        className="absolute top-[180px] -right-[90px] rotate-[6deg]  max-w-[80px] z-20"
      />
      <img
        src={pineapple}
        alt="pineapple"
        className="absolute top-[120px] -right-[140px] rotate-[14deg]  max-w-[70px] z-10"
      />
    </div>
  );
};
