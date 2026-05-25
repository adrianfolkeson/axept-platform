import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(0 0% 100%)",
        ink: "hsl(220 13% 13%)",
        mute: "hsl(220 9% 46%)",
        panel: "hsl(220 14% 98%)",
        border: "hsl(220 13% 91%)",
        brand: {
          DEFAULT: "hsl(24 95% 50%)",
          fg: "hsl(0 0% 100%)"
        },
        accent: "hsl(220 70% 50%)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem"
      }
    }
  },
  plugins: []
};

export default config;
