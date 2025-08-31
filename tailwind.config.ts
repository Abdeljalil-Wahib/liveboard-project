import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./packages/web/src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0D1117",
        foreground: "#C9D1D9",
        accent: "#58A6FF",
        "accent-hover": "#80B9FF",
      },
    },
  },
  plugins: [],
};
export default config;
