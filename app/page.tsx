import Sidebar from '@/components/Sidebar';
import '@/styles/globals.css';

export const metadata = {
  title: '大板运单系统',
  description: '物流运单管理系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-100">
        <div className="flex">
          <Sidebar />
          <main className="ml-[250px] p-8 min-h-screen w-full">{children}</main>
        </div>
        <footer className="glass text-gray-700 text-center p-8 text-sm shadow-md rounded-t-3xl">
          © 2025 Supported by PARCEL(OSV93)
        </footer>
      </body>
    </html>
  );
}
