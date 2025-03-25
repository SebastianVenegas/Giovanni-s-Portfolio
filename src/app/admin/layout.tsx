import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NextGio Admin Dashboard',
  description: 'Admin dashboard for managing NextGio chat logs and users',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
} 