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
      <img src={logo} alt="logo" className="max-w-[160px] sm:max-w-[224px]" />

      <img
        src={coffee}
        alt="coffee"
        className="absolute sm:top-[150px] -rotate-[14deg] sm:-left-[120px] sm:max-w-[100px] max-w-[80px] top-[110px] -left-[90px]"
      />
      <img
        src={pineapple}
        alt="pineapple"
        className="absolute sm:top-[120px] sm:-right-[140px] rotate-[14deg]  sm:max-w-[70px] max-w-[60px] top-[80px] -right-[116px]"
      />
      <img
        src={sushi}
        alt="sushi"
        className="absolute sm:top-[180px] sm:-right-[90px] rotate-[6deg]  sm:max-w-[80px] top-[130px] max-w-[70px] -right-[74px] "
      />
    </div>
  );
};
