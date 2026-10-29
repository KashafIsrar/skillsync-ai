import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      navy: "#16131F",       // Back in Black
      steel: "#4A3F4B",      // Funkie Friday
      terra: "#806C79",      // Moonscape: accessible for controls and white text
      decanting: "#C1A0AC",
      mist: "#F0D9E4",       // Mountain Heather
      paper: "#FBF7F9",
      ink: "#2D2630",
    },
    fontFamily: { serif: ["Palatino Linotype", "Book Antiqua", "Georgia", "serif"], sans: ["Inter", "Segoe UI", "Arial", "sans-serif"] },
    boxShadow: { card: "0 12px 36px -14px rgba(22,19,31,.28)" } } },
  plugins: [],
};
export default config;
