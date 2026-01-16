import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}", // include all your TSX/JSX files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
