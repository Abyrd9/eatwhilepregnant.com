import * as RadixDialog from "@radix-ui/react-dialog";
import React from "react";
import { LuX } from "react-icons/lu";
import { cx } from "~/utils/helpers/client/cx";

const DialogRoot = RadixDialog.Root;
const DialogPortal = RadixDialog.Portal;

type DialogTrigger = React.ElementRef<typeof RadixDialog.Trigger>;
type DialogTriggerProps = React.ComponentPropsWithoutRef<
  typeof RadixDialog.Trigger
>;

const DialogTrigger = React.forwardRef<DialogTrigger, DialogTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <RadixDialog.Trigger ref={ref} className={cx("", className)} {...props}>
      {children}
    </RadixDialog.Trigger>
  )
);

type DialogOverlay = React.ElementRef<typeof RadixDialog.Overlay>;
type DialogOverlayProps = React.ComponentPropsWithoutRef<
  typeof RadixDialog.Overlay
>;

const DialogOverlay = React.forwardRef<DialogOverlay, DialogOverlayProps>(
  ({ className, children, ...props }, ref) => (
    <RadixDialog.Overlay
      ref={ref}
      className={cx(
        "fixed inset-0 flex min-h-dvh items-center justify-center bg-black/5 p-6 backdrop-blur-[2px] transition-all rdx-state-closed:animate-[opacity-out_150ms_cubic-bezier(0.33,1,0.68,1)] rdx-state-open:animate-[opacity-in_150ms_cubic-bezier(0.33,1,0.68,1)]",
        className
      )}
      {...props}
    >
      {children}
    </RadixDialog.Overlay>
  )
);

type DialogContent = React.ElementRef<typeof RadixDialog.Content>;
type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof RadixDialog.Content
> & {
  hideCloseIcon?: boolean;
};

const DialogContent = React.forwardRef<DialogContent, DialogContentProps>(
  ({ className, children, hideCloseIcon, ...props }, ref) => {
    const showCloseIcon = !hideCloseIcon;
    return (
      <RadixDialog.Content
        ref={ref}
        className={cx(
          "relative w-full max-w-md rounded-lg bg-slate-50 p-6 shadow-modal shadow-black/10 rdx-state-closed:animate-[dialog-out_150ms_cubic-bezier(0.33,1,0.68,1)] rdx-state-open:animate-[dialog-in_150ms_cubic-bezier(0.33,1,0.68,1)]",
          className
        )}
        {...props}
      >
        {showCloseIcon && (
          <DialogClose className="absolute right-3 top-3 text-foreground">
            <LuX />
          </DialogClose>
        )}
        {children}
      </RadixDialog.Content>
    );
  }
);

type DialogClose = React.ElementRef<typeof RadixDialog.Close>;
type DialogCloseProps = React.ComponentPropsWithoutRef<
  typeof RadixDialog.Close
>;

const DialogClose = React.forwardRef<DialogClose, DialogCloseProps>(
  ({ className, children, ...props }, ref) => (
    <RadixDialog.Close ref={ref} className={cx("", className)} {...props}>
      {children}
    </RadixDialog.Close>
  )
);

type DialogTitle = React.ElementRef<typeof RadixDialog.Title>;
type DialogTitleProps = React.ComponentPropsWithoutRef<
  typeof RadixDialog.Title
>;

const DialogTitle = React.forwardRef<DialogTitle, DialogTitleProps>(
  ({ className, children, ...props }, ref) => (
    <RadixDialog.Title
      ref={ref}
      className={cx("pb-1.5 text-2xl font-bold", className)}
      {...props}
    >
      {children}
    </RadixDialog.Title>
  )
);

type DialogDescription = React.ElementRef<typeof RadixDialog.Description>;
type DialogDescriptionProps = React.ComponentPropsWithoutRef<
  typeof RadixDialog.Description
>;

const DialogDescription = React.forwardRef<
  DialogDescription,
  DialogDescriptionProps
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={cx("text-sm leading-[20px] text-muted-foreground", className)}
    {...props}
  >
    {children}
  </RadixDialog.Description>
));

export const Dialog = Object.assign(DialogRoot, {
  Portal: DialogPortal,
  Trigger: DialogTrigger,
  Overlay: DialogOverlay,
  Close: DialogClose,
  Title: DialogTitle,
  Description: DialogDescription,
  Content: DialogContent,
});
