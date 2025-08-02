import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - React Minesweeper',
  description: 'Welcome to the React Minesweeper application built with Next.js and modern web technologies.',
};

export default function HomePage() {
  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild..</p>
    </div>
  );
}