import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Menu.css';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Games', path: '/games' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Contact', path: '/contact' }
  ];

  const handleMenuClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="menu">
      <div className="menu-container">
        <div className="menu-logo">
          <Link to="/" onClick={handleMenuClick}>
            <span>Logo</span>
          </Link>
        </div>
        
        <div className={`menu-items ${isOpen ? 'menu-items-open' : ''}`}>
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={handleMenuClick}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button 
          className={`menu-toggle ${isOpen ? 'menu-toggle-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Menu;