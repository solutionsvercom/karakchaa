import React from "react";
import { Sun, Moon, Menu } from "lucide-react";
import { IconButton } from "@radix-ui/themes";
import { useThemeToggle } from "./../ThemeProvider";

type NavbarProps = {
  pageTitle: string;
  onMenuClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ pageTitle, onMenuClick }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = currentTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = currentTime.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const { isDark, toggle } = useThemeToggle();

  return (
    <header className="kb-navbar">
      <div className="kb-navbar-left">
        <IconButton
          className="kb-navbar-menu"
          variant="ghost"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </IconButton>
        <div className="kb-navbar-titles">
          <h1 className="kb-navbar-title">{pageTitle}</h1>
        </div>
      </div>

      <div
        className="kb-navbar-right"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        {/* DATE AND TIME */}
        <span className="kb-navbar-date-value">
          {date} • {time}
        </span>

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