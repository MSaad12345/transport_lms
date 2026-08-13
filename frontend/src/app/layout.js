import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'LMS — Logistics Management System',
  description:
    'Enterprise logistics SaaS for orders, warehouse, fleet, drivers, GPS tracking, finance and AI route optimization.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
