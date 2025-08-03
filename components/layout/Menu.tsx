'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import './Menu.css';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Games', path: '/games' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleMenuClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="menu">
      <div className="menu-container">
        <div className="menu-logo">
          <Link href="/" onClick={handleMenuClick}>
            <span>Logo</span>
          </Link>
        </div>

        <div className={`menu-items ${isOpen ? 'menu-items-open' : ''}`}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`menu-item ${pathname === item.path ? 'active' : ''}`}
              onClick={handleMenuClick}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className={`menu-toggle ${isOpen ? 'menu-toggle-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
};

export default Menu;
