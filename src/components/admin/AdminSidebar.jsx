import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Store,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const ADMIN_LINKS = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
  { label: 'Sales', to: '/admin/sales', icon: Percent },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E6E2DC] w-64">
      <div className="h-16 px-5 border-b border-[#E6E2DC] flex items-center justify-between shrink-0">
        <div>
          <span className="text-base font-bold text-[#17130F] block leading-tight">
            Creating Leather Goods
          </span>
          <span className="text-sm text-[#625D57]">Admin Console</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin sidebar"
            className="lg:hidden p-1.5 text-[#625D57] hover:text-[#17130F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav aria-label="Admin navigation" className="flex-1 p-4 space-y-1 overflow-y-auto">
        {ADMIN_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#241811] text-white'
                    : 'text-[#625D57] hover:bg-[#F3F1ED] hover:text-[#17130F]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E6E2DC] space-y-2 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-[#17130F] border border-[#E6E2DC] hover:bg-[#F3F1ED] transition-colors"
        >
          <Store className="w-4 h-4 shrink-0" />
          <span>View Storefront</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-[#B42318] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{navContent}</aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onClose}
            className="fixed inset-0 bg-[#17130F]/50"
          />
          <aside className="relative z-10 h-full">{navContent}</aside>
        </div>
      )}
    </>
  );
}
