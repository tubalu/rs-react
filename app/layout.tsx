import type { Metadata } from 'next';
import Menu from '../components/layout/Menu';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'React Minesweeper - Games & Portfolio',
  description: 'A modern React application featuring Minesweeper game and portfolio showcase built with Next.js',
  keywords: ['React', 'Next.js', 'Minesweeper', 'Games', 'Portfolio'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Menu />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}