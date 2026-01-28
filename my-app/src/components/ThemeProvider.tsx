import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme } from "@radix-ui/themes";

type ThemeContextType = {
  isDark: boolean;
  toggle: () => void;
};

const ThemeToggleContext = createContext<ThemeContextType | null>(null);

export const useThemeToggle = () => {
  const ctx = useContext(ThemeToggleContext);
  if (!ctx) {
    throw new Error("useThemeToggle must be used inside ThemeProvider");
  }
  return ctx;
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => {setIsDark((s) => !s);};

  return (
  <Theme
    appearance={isDark ? "dark" : "light"}
    accentColor={isDark ? "pink" : "violet"}
    grayColor="slate"
    radius="large"
    scaling="100%"
    panelBackground="solid"
  >
    <ThemeToggleContext.Provider value={{ isDark, toggle }}>
        {children}
    </ThemeToggleContext.Provider>
  </Theme>
);
}
