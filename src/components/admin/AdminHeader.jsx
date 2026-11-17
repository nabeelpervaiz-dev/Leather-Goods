import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminHeader({ title, subtitle, onOpenSidebar, action }) {
  const { adminUser } = useAuth();

  return (
    <header className="bg-white border-b border-[#E6E2DC] px-4 md:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open admin menu"
          className="lg:hidden p-2 -ml-2 text-[#17130F] hover:bg-[#F3F1ED] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-[#17130F] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#625D57] truncate">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {action}
        <div className="hidden md:block text-right border-l border-[#E6E2DC] pl-4">
          <p className="text-sm font-medium text-[#17130F]">
            {adminUser?.name || 'Administrator'}
          </p>
          <p className="text-sm text-[#625D57]">{adminUser?.email || 'Store Admin'}</p>
        </div>
      </div>
    </header>
  );
}
