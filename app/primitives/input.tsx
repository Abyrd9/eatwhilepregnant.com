import React from "react";
import { cx } from "~/utils/helpers/cx";

export type InputProps = React.ComponentPropsWithoutRef<"input">;

type InputComposerProps = React.ComponentPropsWithoutRef<"label">;

const Composer = React.forwardRef<HTMLLabelElement, InputComposerProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={props.htmlFor}
        className={cx(
          "relative flex w-full items-center overflow-clip rounded-md border border-black/10 px-3 py-2 text-foreground shadow-input shadow-black/[8%] ring-foreground/10 ring-offset-2 after:pointer-events-none after:absolute after:-inset-y-[0.25px] after:left-0 after:h-[calc(100%_+_4px)] after:w-full after:rounded-md focus-within:border-black/10 dark:bg-stone-900 dark:shadow-black/10 dark:ring-muted-foreground/10 dark:after:shadow-highlight dark:after:shadow-white/[2%] [&:has(:focus-visible)]:ring-2 [&:has(input:is(:disabled))]:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

const Field = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cx(
          "placeholder:text-foreground-muted block w-full bg-transparent text-sm text-foreground outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

const Error = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cx("text-xs text-red-500", className)}
    {...props}
  />
));

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <Composer>
        <Field ref={ref} {...props} />
      </Composer>
    );
  }
);

export const InputComposer = Object.assign(Composer, {
  Input: Field,
  Error: Error,
});
