import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        paper: "#f7f4ed",
        moss: "#4d6f5a",
        rust: "#b45f3a",
        signal: "#1f6feb"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(23, 33, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
