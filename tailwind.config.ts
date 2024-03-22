import type { Config } from "tailwindcss";
import theme from "tailwindcss/defaultTheme";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Rubik Variable", ...theme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;
