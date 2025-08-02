import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Games - React Minesweeper',
  description: 'Explore our collection of games including the classic Minesweeper built with React.',
};

export default function GamesPage() {
  return (
    <div className="content">
      <h1>Games</h1>
      <p>Choose a game to play:</p>
      <div className="games-list">
        <Link href="/games/minesweeper" className="game-card">
          <h3>Minesweeper</h3>
          <p>Classic mine detection game</p>
        </Link>
      </div>
    </div>
  );
}