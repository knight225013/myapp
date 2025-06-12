import Sidebar from '@/components/ui/Sidebar';
import '@/styles/globals.css';
import LayoutClient from './LayoutClient';

export const metadata = {
  title: '大货运单系统',
  description: '物流运单管理系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f6f6f6] font-['Poppins',sans-serif] overflow-hidden">
        <div className="flex h-screen">
          <Sidebar />
          <LayoutClient>{children}</LayoutClient>
        </div>
      </body>
    </html>
  );
}
