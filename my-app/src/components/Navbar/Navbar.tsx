import React from 'react';

type NavbarProps = {
  pageTitle: string;
};

const Navbar: React.FC<NavbarProps> = ({ pageTitle }) => {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="kb-navbar">
      <div className="kb-navbar-left">
      <h1 className="kb-navbar-title">{pageTitle}</h1>
      </div>

      <div className="kb-navbar-right">
        <span className="kb-navbar-date-value">{today}</span>
      </div>
    </header>
  );
};

export default Navbar;