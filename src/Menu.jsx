import { useState } from 'react';
import './Menu.css';

const Menu = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: 'Home', key: 'home' },
    { label: 'About', key: 'about' },
    { label: 'Games', key: 'games' },
    { label: 'Portfolio', key: 'portfolio' },
    { label: 'Contact', key: 'contact' }
  ];

  const handleMenuClick = (key) => {
    setIsOpen(false);
    onNavigate(key);
  };

  return (
    <nav className="menu">
      <div className="menu-container">
        <div className="menu-logo">
          <span>Logo</span>
        </div>
        
        <div className={`menu-items ${isOpen ? 'menu-items-open' : ''}`}>
          {menuItems.map((item, index) => (
            <button 
              key={index}
              className="menu-item"
              onClick={() => handleMenuClick(item.key)}
            >
              {item.label}
            </button>
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