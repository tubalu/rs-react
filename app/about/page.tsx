import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - React Minesweeper',
  description: 'Learn about this React application built with Next.js, featuring games and interactive components.',
};

export default function AboutPage() {
  return (
    <div className="content">
      <h1>About</h1>
      <p>This is a React application built with Next.js, featuring games and interactive components.</p>
      <p>Built with modern web technologies including React 19, Next.js 15, and Biome for code quality.</p>
    </div>
  );
}