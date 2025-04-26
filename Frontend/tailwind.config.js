/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#E5E7EB",
          foreground: "#0F111A",
        },
        secondary: {
          DEFAULT: "#A1A1AA",
          foreground: "#E5E7EB",
        },
        muted: {
          DEFAULT: "#A1A1AA",
          foreground: "#71717A",
        },
        accent: {
          DEFAULT: "#6366F1",
          foreground: "#E5E7EB",
        },
        destructive: {
          DEFAULT: "#F43F5E",
          foreground: "#E5E7EB",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#E5E7EB",
        },
        button: {
          DEFAULT: "#E97957",
          foreground: "#E5E7EB",
        },
        border: "#71717A",
        input: "#71717A",
        ring: "#71717A",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
