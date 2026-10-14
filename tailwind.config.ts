import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { navy: "#1d3054", steel: "#305C71", terra: "#A66C46", mist: "#D8DDDF", paper: "#F4F5F6", ink: "#273545" },
    fontFamily: { serif: ["var(--font-playfair)", "serif"], sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
    boxShadow: { card: "0 10px 40px -12px rgba(29,48,84,.28)" } } },
  plugins: [],
};
export default config;
