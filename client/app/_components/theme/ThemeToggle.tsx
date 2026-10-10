"use client";
import Icon from "../Icon";
import { useTheme } from "./ThemeProvider";
export default function ThemeToggle({ variant = "icon" }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const nextTheme = theme === "dark" ? "light" : "dark";
    const nextThemeLabel = nextTheme === "dark" ? "night" : "light";
    const label = theme === "dark" ? "Night Mode" : "Light Mode";
    if (variant === "menu") {
        return (<button type="button" onClick={toggleTheme} className="group mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--site-panel)] hover:text-[var(--site-accent)]" aria-label={`Switch to ${nextThemeLabel} theme`} aria-checked={isDark} role="switch">
        <span className="site-border site-panel flex h-8 w-8 items-center justify-center rounded-md border transition group-hover:border-[var(--site-accent)]">
          <Icon name={isDark ? "sun" : "moon"}/>
        </span>
        <span className="flex-1">{label}</span>
        <span className={`flex h-6 w-11 items-center rounded-full border border-[var(--site-border)] p-0.5 transition ${isDark ? "bg-[var(--site-button-bg)]" : "site-panel"}`}>
          <span className={`h-4 w-4 rounded-full bg-[var(--site-card)] shadow-sm transition ${isDark ? "translate-x-5" : "translate-x-0"}`}/>
        </span>
      </button>);
    }
    return (<button type="button" onClick={toggleTheme} className="site-border site-panel inline-flex h-8 w-8 items-center justify-center rounded-md border transition hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]" aria-label={`Switch to ${nextThemeLabel} theme`} title={`Switch to ${nextThemeLabel} theme`}>
      <Icon name={isDark ? "sun" : "moon"}/>
    </button>);
}
