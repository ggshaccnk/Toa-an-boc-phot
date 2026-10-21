import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TÒA ÁN BÓC PHỐT ⚖️ (The Blame Court) - Web Party Game',
  description: 'Web Party Game kết nối bạn bè, cãi cùn bằng thẻ bài meme và chĩa ngón tay tìm thủ phạm!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased selection:bg-yellow-300 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
