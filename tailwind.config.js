/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#f7f9fb",
        "surface": "#f7f9fb",
        "surface-bright": "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "primary": "#004ac6",
        "primary-container": "#2563eb",
        "primary-fixed": "#dbe1ff",
        "primary-fixed-dim": "#b4c5ff",
        "on-primary": "#ffffff",
        "on-primary-container": "#eeefff",
        "secondary": "#505f76",
        "secondary-container": "#d0e1fb",
        "secondary-fixed": "#d3e4fe",
        "secondary-fixed-dim": "#b7c8e1",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#54647a",
        "tertiary": "#4d556b",
        "tertiary-container": "#656d84",
        "tertiary-fixed": "#dae2fd",
        "tertiary-fixed-dim": "#bec6e0",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#eef0ff",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "on-surface": "#191c1e",
        "on-surface-variant": "#434655",
        "outline": "#737686",
        "outline-variant": "#c3c6d7",
        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",
        "inverse-primary": "#b4c5ff"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "unit": "8px",
        "stack-sm": "4px",
        "stack-md": "12px",
        "stack-lg": "24px",
        "gutter": "16px",
        "touch-target-min": "44px",
        "container-padding-desktop": "24px",
        "container-padding-mobile": "12px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
