"use client";
import Icon from "../Icon";
import { useTheme } from "./ThemeProvider";
export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const nextTheme = theme === "dark" ? "light" : "dark";
    return (<button type="button" onClick={toggleTheme} className="site-border site-panel inline-flex h-8 w-8 items-center justify-center rounded-md border" aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}>
      <Icon name={theme === "dark" ? "sun" : "moon"}/>
    </button>);
}
