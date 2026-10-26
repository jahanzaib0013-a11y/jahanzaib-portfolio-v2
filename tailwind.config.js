export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        paper: "#f7f6f9",
        surface: "#ffffff",
        ink: "#14131a",
        graphite: "#5a5766",
        mute: "#6e6b7b",
        rule: "#e4e1ec",
        blueprint: "#1f3a93",
        "blueprint-soft": "#eaeefb",
        flare: "#e4572e",
        ok: "#3f7d6e",
        // Theater palette — the dark moments. Values come from the hero's
        // house-dark CSS so the interlude, gallery and finale read as the
        // same room the film plays in.
        night: "#09080d",
        "night-surface": "#121118",
        "night-rule": "rgba(255,255,255,0.12)",
        "night-ink": "#f6f4fa",
        "night-soft": "rgba(238,236,245,0.7)",
        "night-accent": "#ff9a73",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "sans-serif"],
        sans: ['"IBM Plex Sans"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.16em", fontWeight: "500" }],
        label: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        caption: ["0.875rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.75" }],
        lead: ["1.1875rem", { lineHeight: "1.7", letterSpacing: "-0.005em" }],
        // The hero's subtitle under its display heading: an independent, readable
        // size on phones rather than a fraction of the h1 clamp (Hero.jsx switches
        // back to 0.42em of the h1 from lg up).
        subtitle: ["clamp(1.0625rem, 0.95rem + 0.8vw, 1.5rem)", { lineHeight: "1.45" }],
        h3: ["clamp(1.125rem, 1rem + 0.5vw, 1.375rem)", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        h2: ["clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        h1: ["clamp(2.75rem, 1.8rem + 4.6vw, 5.25rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        stat: ["clamp(1.5rem, 1.2rem + 1.2vw, 2rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        card: "6px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,19,26,0.04), 0 12px 28px -22px rgba(20,19,26,0.28)",
        lift: "0 2px 4px rgba(20,19,26,0.05), 0 22px 44px -28px rgba(20,19,26,0.32)",
        none: "none",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      screens: {
        xs: "480px",
        "custom-range": { min: "1280px", max: "1613px" },
        "custom-range2": { min: "730px", max: "1613px" },
      },
      maxWidth: {
        shell: "1180px",
        measure: "68ch",
      },
    },
  },
  plugins: [],
};
