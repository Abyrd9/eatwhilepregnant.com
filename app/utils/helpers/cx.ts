import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["button", "input", "highlight"] }]
    }
  }
});

export function cx(...classes: ClassValue[]) {
  return customTwMerge(clsx(...classes));
}
