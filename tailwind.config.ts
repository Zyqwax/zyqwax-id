import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-bg-canvas)',
        surface: 'var(--color-bg-surface)',
        elevated: 'var(--color-bg-elevated)',
        'elevated-hover': 'var(--color-bg-elevated-hover)',
        'border-default': 'var(--color-border-default)',
        'border-subtle': 'var(--color-border-subtle)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-muted': 'var(--color-text-muted)',
        'text-faint': 'var(--color-text-faint)',
        'accent-danger-bg': 'var(--color-accent-danger-bg)',
        'accent-danger-text': 'var(--color-accent-danger-text)',
        'accent-success-text': 'var(--color-accent-success-text)',
      },
    },
  },
  plugins: [],
};

export default config;
