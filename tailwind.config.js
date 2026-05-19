/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.jsx", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dp: {
          bg:      "#060b16",
          surface: "#0a1220",
          card:    "rgba(16,26,46,0.92)",
          border:  "rgba(201,168,76,0.18)",
          accent:  "#c9a84c",
          gold2:   "#f0d080",
          gold3:   "#b8932a",
          violet:  "#8B5CF6",
          emerald: "#10B981",
          danger:  "#EF4444",
          warn:    "#F59E0B",
          text:    "#e8edf5",
          muted:   "#4a6080",
          navy2:   "#0d1628",
          navy3:   "#111e38",
          navy4:   "#162244",
        },
      },
      fontFamily: {
        display: ["'Cinzel'", "serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #b8932a, #c9a84c 40%, #f0d080 70%, #c9a84c)",
        "grad-gold":    "linear-gradient(135deg, #a07820, #c9a84c, #e8c66a)",
        "grad-card":    "linear-gradient(145deg, rgba(16,26,46,0.92), rgba(10,18,32,0.95))",
        "grad-hero":    "radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.1) 0%, transparent 70%)",
        "grad-navy":    "linear-gradient(160deg, #060b16 0%, #0a1428 50%, #060b16 100%)",
      },
      animation: {
        "spin-slow":  "spin 20s linear infinite",
        "bounce-dot": "bounceDot 1.2s ease-in-out infinite",
        "fade-up":    "fadeUp 0.4s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float-y":    "floatY 3s ease-in-out infinite",
      },
      keyframes: {
        bounceDot: {
          "0%,80%,100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 20px rgba(201,168,76,0.3)" },
          "50%":     { boxShadow: "0 0 35px rgba(201,168,76,0.7)" },
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-5px)" },
        },
      },
      boxShadow: {
        "glow-accent":  "0 0 24px rgba(201,168,76,0.25)",
        "glow-gold":    "0 0 30px rgba(201,168,76,0.3), 0 8px 24px rgba(0,0,0,0.5)",
        "card-hover":   "0 8px 32px rgba(0,0,0,0.5), 0 0 12px rgba(201,168,76,0.08)",
        "btn-gold":     "0 4px 16px rgba(201,168,76,0.4)",
      },
    },
  },
  plugins: [],
}
