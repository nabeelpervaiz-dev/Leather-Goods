import { useState } from 'react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

export default function AdminLayout({ title, subtitle, action, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F1ED] flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader
          title={title}
          subtitle={subtitle}
          action={action}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 max-w-[1440px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
