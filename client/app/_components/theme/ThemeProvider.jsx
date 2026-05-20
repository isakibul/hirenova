"use client";
import { createContext, useContext, useEffect, useMemo, useState, } from "react";
import { getStorageItem, setStorageItem } from "@lib/storage";
const STORAGE_KEY = "hirenova-theme";
const ThemeContext = createContext(null);
function getPreferredTheme() {
    const documentTheme = document.documentElement.dataset.theme;
    if (documentTheme === "light" || documentTheme === "dark") {
        return documentTheme;
    }
    const storedTheme = getStorageItem(STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}
function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
}
export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(null);
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setTheme(getPreferredTheme());
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, []);
    useEffect(() => {
        if (!theme) {
            return;
        }
        applyTheme(theme);
        setStorageItem(STORAGE_KEY, theme);
    }, [theme]);
    const currentTheme = theme ?? "light";
    const value = useMemo(() => ({
        theme: currentTheme,
        setTheme: (nextTheme) => setTheme(nextTheme),
        toggleTheme: () => setTheme((previousTheme) => {
            const activeTheme = previousTheme ?? getPreferredTheme();
            return activeTheme === "dark" ? "light" : "dark";
        }),
    }), [currentTheme]);
    return (<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
