import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio - React Minesweeper',
  description:
    'Explore my development projects and portfolio showcasing modern web development skills.',
};

export default function PortfolioPage() {
  return (
    <div className="content">
      <h1>Portfolio</h1>
      <p>My development projects and showcase.</p>
      <div className="portfolio-grid">
        <div className="project-card">
          <h3>React Minesweeper</h3>
          <p>
            A fully featured Minesweeper game built with React hooks and Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
