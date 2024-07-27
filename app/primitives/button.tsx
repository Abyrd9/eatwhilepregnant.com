import { cva } from "class-variance-authority";
import React, { forwardRef } from "react";
import { LuLoader } from "react-icons/lu";
import { cx } from "~/utils/helpers/cx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  size?: "default" | "small" | "large";
  variant?: "default" | "outline" | "ghost";
  color?: "default" | "primary" | "secondary" | "destructive";
};

const ButtonLoadingContext = React.createContext({ isLoading: false });

const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, color, size, isLoading, ...props }, ref) => {
    return (
      <ButtonLoadingContext.Provider value={{ isLoading: Boolean(isLoading) }}>
        <button
          className={cx(
            cva(
              "relative flex h-fit items-center justify-center overflow-hidden whitespace-nowrap rounded-md py-1 outline-none ring-offset-1 transition-all duration-200 focus-visible:ring-2 disabled:pointer-events-none",
              {
                variants: {
                  color: {
                    default: "",
                    primary: "",
                    secondary: "",
                    destructive: "",
                  },
                  variant: {
                    default:
                      "dark:after:shadow-highlight/75 border font-semibold shadow-button after:pointer-events-none after:absolute after:-inset-y-[0.25px] after:h-[calc(100%_+_4px)] after:w-full after:rounded-md disabled:opacity-50 disabled:shadow-none",
                    outline:
                      "border-2 bg-transparent font-semibold shadow-none disabled:opacity-50",
                    ghost: "border-none shadow-none disabled:opacity-50",
                  },
                  size: {
                    default: "px-3.5 py-1.5 text-sm",
                    small: "px-2.5 py-1.5 text-xs",
                    large: "px-4 py-1.5 text-base",
                  },
                },
                compoundVariants: [
                  {
                    variant: "outline",
                    className: "ring-offset-2",
                  },
                  {
                    variant: ["default", "outline", "ghost"],
                    color: "default",
                    className: "ring-foreground",
                  },
                  {
                    variant: ["default", "outline", "ghost"],
                    color: "primary",
                    className: "ring-primary-500",
                  },
                  {
                    variant: ["default", "outline", "ghost"],
                    color: "secondary",
                    className: "ring-secondary-500",
                  },
                  {
                    variant: ["default", "outline", "ghost"],
                    color: "destructive",
                    className: "ring-red-500",
                  },
                  {
                    variant: "default",
                    color: "default",
                    className:
                      "border-black/[8%] bg-white font-medium text-foreground shadow-black/5 hover:bg-gray-50 active:bg-gray-50 dark:bg-stone-900 dark:shadow-black/10 dark:after:shadow-white/[2%] dark:hover:bg-stone-800 dark:active:bg-stone-800",
                  },
                  {
                    variant: "default",
                    color: "primary",
                    className:
                      "border-primary-900/10 bg-primary-500 text-primary-50 shadow-primary-900/40 hover:bg-primary-600 active:bg-primary-600 dark:bg-primary-700 dark:shadow-black/50 dark:after:shadow-primary-100/[8%] dark:hover:bg-primary-600 dark:active:bg-secondary-600",
                  },
                  {
                    variant: "default",
                    color: "secondary",
                    className:
                      "border-secondary-900/10 bg-secondary-500 text-secondary-50 shadow-secondary-900/40 hover:bg-secondary-600 active:bg-secondary-600 dark:bg-secondary-800 dark:shadow-black/50 dark:after:shadow-secondary-100/[8%] dark:hover:bg-secondary-600 dark:active:bg-secondary-600",
                  },
                  {
                    variant: "default",
                    color: "destructive",
                    className:
                      "border-red-900/10 bg-red-500 text-red-50 shadow-red-900/40 hover:bg-red-600 active:bg-red-600 dark:bg-red-700 dark:shadow-black/50 dark:after:shadow-red-100/[8%] dark:hover:bg-red-600 dark:active:bg-red-600",
                  },
                  {
                    variant: "outline",
                    color: "default",
                    className:
                      "border-foreground text-foreground hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-stone-900 dark:active:bg-stone-900",
                  },
                  {
                    variant: "outline",
                    color: "primary",
                    className:
                      "border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-50 dark:hover:bg-primary-900/20 dark:active:bg-primary-900/20",
                  },
                  {
                    variant: "outline",
                    color: "secondary",
                    className:
                      "border-secondary-600 text-secondary-600 hover:bg-secondary-50 active:bg-secondary-50 dark:hover:bg-secondary-900/20 dark:active:bg-secondary-900/20",
                  },
                  {
                    variant: "outline",
                    color: "destructive",
                    className:
                      "border-red-600 text-red-600 hover:bg-red-50 active:bg-red-50 dark:hover:bg-red-900/20 dark:active:bg-red-900/20",
                  },
                  {
                    variant: "ghost",
                    color: "default",
                    className:
                      "bg-gray-100 text-foreground hover:bg-gray-200 active:bg-gray-200 dark:bg-stone-900/80 dark:hover:bg-stone-800/50 dark:active:bg-stone-800/50",
                  },
                  {
                    variant: "ghost",
                    color: "primary",
                    className:
                      "bg-primary-100 text-primary-950 hover:bg-primary-200 active:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-100 dark:hover:bg-primary-600/30 dark:active:bg-primary-600/30",
                  },
                  {
                    variant: "ghost",
                    color: "secondary",
                    className:
                      "bg-secondary-100 text-secondary-950 hover:bg-secondary-200 active:bg-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-100 dark:hover:bg-secondary-600/30 dark:active:bg-secondary-600/30",
                  },
                  {
                    variant: "ghost",
                    color: "destructive",
                    className:
                      "bg-red-100 text-red-950 hover:bg-red-200 active:bg-red-200 dark:bg-red-900/30 dark:text-red-100 dark:hover:bg-red-600/30 dark:active:bg-red-600/30",
                  },
                ],
                defaultVariants: {
                  color: "default",
                  variant: "default",
                  size: "default",
                },
              }
            )({
              variant,
              size,
              color,
              className,
            }),
            isLoading && "pointer-events-none"
          )}
          ref={ref}
          {...props}
        />
      </ButtonLoadingContext.Provider>
    );
  }
);

type ButtonLoaderProps = React.ComponentPropsWithoutRef<"div">;
const ButtonLoader = React.forwardRef<HTMLDivElement, ButtonLoaderProps>(
  ({ className, children, ...props }, ref) => {
    const { isLoading } = React.useContext(ButtonLoadingContext);

    return (
      <>
        <div
          ref={ref}
          className={cx(
            "absolute inset-0 size-full items-center justify-center overflow-hidden rounded-md",
            isLoading ? "flex opacity-100" : "hidden opacity-0",
            className
          )}
          {...props}
        >
          <LuLoader className="animate-spin" />
        </div>
        <div
          className={cx(
            isLoading ? "opacity-0" : "opacity-100",
            "flex items-center justify-center",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

export const Button = Object.assign(ButtonRoot, {
  Loader: ButtonLoader,
});
