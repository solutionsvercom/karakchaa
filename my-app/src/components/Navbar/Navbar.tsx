import React from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton } from "@radix-ui/themes";
import { useThemeToggle } from "./../ThemeProvider";

type NavbarProps = {
  pageTitle: string;
};

const Navbar: React.FC<NavbarProps> = ({ pageTitle }) => {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const { isDark, toggle } = useThemeToggle();

  return (
    <header className="kb-navbar">
      <div className="kb-navbar-left">
        <h1 className="kb-navbar-title">{pageTitle}</h1>
      </div>

      <div
className="kb-navbar-right"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
         {/* DATE */}
        <span className="kb-navbar-date-value">{today}</span>

        
        {/* THEME TOGGLE BUTTON */}
        <IconButton
          variant="ghost"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>

       
      </div>
    </header>
  );
};

export default Navbar;
