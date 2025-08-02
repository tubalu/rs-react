import { Link } from 'react-router-dom';

const Games = () => {
  return (
    <div className="content">
      <h1>Games</h1>
      <p>Choose a game to play:</p>
      <div className="games-list">
        <Link to="/games/minesweeper" className="game-card">
          <h3>Minesweeper</h3>
          <p>Classic mine detection game</p>
        </Link>
      </div>
    </div>
  );
};

export default Games;