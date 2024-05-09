import * as RadixLabel from "@radix-ui/react-label";
import React from "react";
import { cx } from "~/utils/helpers/client/cx";

type LabelProps = React.ComponentPropsWithRef<"label">;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (props, ref) => {
    return (
      <RadixLabel.Label
        ref={ref}
        {...props}
        className={cx(
          "mb-2 block text-sm font-medium leading-none text-foreground",
          props.className
        )}
      />
    );
  }
);
