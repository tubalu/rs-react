import { useState } from 'react';
import Menu from './Menu';
import Minesweeper from './Minesweeper';
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('home');

  const renderContent = () => {
    switch (currentView) {
      case 'games':
        return (
          <div className="games-container">
            <Minesweeper />
          </div>
        );
      default:
        return (
          <div className="content">
            <h1>Rsbuild with React</h1>
            <p>Start building amazing things with Rsbuild..</p>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Menu onNavigate={setCurrentView} />
      {renderContent()}
    </div>
  );
};

export default App;
