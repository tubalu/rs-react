import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - React Minesweeper',
  description: 'Get in touch with me for questions, collaborations, or project inquiries.',
};

export default function ContactPage() {
  return (
    <div className="content">
      <h1>Contact</h1>
      <p>Get in touch with me:</p>
      <div className="contact-info">
        <p>Email: hello@example.com</p>
        <p>GitHub: @username</p>
      </div>
    </div>
  );
}