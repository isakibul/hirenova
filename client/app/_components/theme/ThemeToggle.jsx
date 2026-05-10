"use client";
import Icon from "../Icon";
import { useTheme } from "./ThemeProvider";
export default function ThemeToggle({ variant = "icon" }) {
    const { theme, toggleTheme } = useTheme();
    const nextTheme = theme === "dark" ? "light" : "dark";
    const label = theme === "dark" ? "Dark Mode" : "Light Mode";
    if (variant === "menu") {
        return (<button type="button" onClick={toggleTheme} className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--site-panel)]" aria-label={`Switch to ${nextTheme} theme`} role="menuitem">
        <span className="site-border site-panel flex h-8 w-8 items-center justify-center rounded-md border">
          <Icon name={theme === "dark" ? "sun" : "moon"}/>
        </span>
        {label}
      </button>);
    }
    return (<button type="button" onClick={toggleTheme} className="site-border site-panel inline-flex h-8 w-8 items-center justify-center rounded-md border" aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}>
      <Icon name={theme === "dark" ? "sun" : "moon"}/>
    </button>);
}
