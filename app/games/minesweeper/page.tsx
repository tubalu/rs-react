import type { Metadata } from 'next';
import Minesweeper from '../../../components/games/Minesweeper';

export const metadata: Metadata = {
  title: 'Minesweeper - React Games',
  description:
    'Play the classic Minesweeper game built with React. Features include chord clicking, mine flagging, and responsive design.',
};

export default function MinesweeperPage() {
  return (
    <div className="games-container">
      <Minesweeper />
    </div>
  );
}
