import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        edu: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#36a4f6",
          500: "#0c87eb",
          600: "#0069c9",
          700: "#0154a3",
          800: "#064786",
          900: "#0b3c6f",
          950: "#07264a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
