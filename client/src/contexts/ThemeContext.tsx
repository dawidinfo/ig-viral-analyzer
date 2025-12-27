import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type DesignStyle = "modern" | "soft-dark" | "clean-pro";

// Modern = Original schwarz mit Neon-Gradients
// Soft Dark = Leichtes Dunkelgrau, gedämpfte Farben, besser lesbar
// Clean Pro = Helles Design wie Stripe/Apple

interface ThemeContextType {
  theme: Theme;
  designStyle: DesignStyle;
  toggleTheme?: () => void;
  setDesignStyle: (style: DesignStyle) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultDesignStyle?: DesignStyle;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  defaultDesignStyle = "modern",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [designStyle, setDesignStyleState] = useState<DesignStyle>(() => {
    const stored = localStorage.getItem("designStyle");
    return (stored as DesignStyle) || defaultDesignStyle;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all design style classes
    root.classList.remove("design-modern", "design-soft-dark", "design-clean-pro");
    // Add current design style class
    root.classList.add(`design-${designStyle}`);
    localStorage.setItem("designStyle", designStyle);
    
    // Clean Pro Theme erzwingt Light Mode für sauberes, helles Design
    if (designStyle === "clean-pro") {
      root.classList.remove("dark");
    } else {
      // Modern und Soft Dark sind beide Dark Mode
      root.classList.add("dark");
    }
  }, [designStyle, theme]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  const setDesignStyle = (style: DesignStyle) => {
    setDesignStyleState(style);
  };

  return (
    <ThemeContext.Provider value={{ theme, designStyle, toggleTheme, setDesignStyle, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
