import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/layout/Menu';
import Home from './pages/Home';
import About from './pages/About';
import Games from './pages/Games';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import MinesweeperGame from './pages/MinesweeperGame';
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Menu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/minesweeper" element={<MinesweeperGame />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
