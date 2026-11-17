import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart.js';
import { useStore } from '../../context/StoreContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Shoes', to: '/category/shoes' },
  { label: 'Jackets', to: '/category/jackets' },
  { label: 'Wallets', to: '/category/wallets' },
  { label: 'Bags', to: '/category/bags' },
  { label: 'Sale', to: '/sale' },
];

export default function Navbar() {
  const { itemCount, openDrawer } = useCart();
  const { storeSettings } = useStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : '/shop');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E6E2DC]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-8">
        {/* Mobile Left: Menu Icon */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-[#17130F] hover:text-[#8C5A36] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Zone 1: Brand Wordmark (centered on mobile, left on desktop) */}
        <Link
          to="/"
          className="text-base md:text-lg font-bold tracking-tight text-[#17130F] whitespace-nowrap truncate max-w-[190px] sm:max-w-none shrink-0"
        >
          {storeSettings.logoText || 'Creating Leather Goods'}
        </Link>

        {/* Zone 2: Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 lg:gap-8"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                  isActive
                    ? 'text-[#17130F] border-[#17130F]'
                    : 'text-[#625D57] border-transparent hover:text-[#17130F] hover:border-[#E6E2DC]'
                } ${item.label === 'Sale' ? 'text-[#B42318]' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Utility Icons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search products"
            className="p-2 text-[#17130F] hover:text-[#8C5A36] transition-colors hidden sm:inline-flex cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            to={isAuthenticated ? '/admin' : '/admin/login'}
            aria-label="Admin dashboard login"
            title={isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
            className="p-2 text-[#17130F] hover:text-[#8C5A36] transition-colors hidden sm:inline-flex"
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open shopping bag with ${itemCount} items`}
            className="relative p-2 -mr-2 text-[#17130F] hover:text-[#8C5A36] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-semibold tabular-nums min-w-[1.25rem] text-center">
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#E6E2DC] bg-[#F3F1ED] animate-toast-enter">
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center gap-3"
          >
            <Search className="w-4 h-4 text-[#625D57] shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leather shoes, jackets, wallets, bags..."
              autoFocus
              className="flex-1 bg-transparent text-base text-[#17130F] placeholder:text-[#625D57] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#241811] text-white text-sm font-medium hover:bg-[#3A281E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="p-1.5 text-[#625D57] hover:text-[#17130F] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-[#17130F]/50"
        />
        <aside
          style={{
            transform: mobileMenuOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
          }}
          className="fixed inset-y-0 left-0 w-[84%] max-w-xs bg-white border-r border-[#E6E2DC] flex flex-col justify-between z-10 transition-transform duration-200 ease-out"
        >
          <div>
            <div className="h-16 px-5 border-b border-[#E6E2DC] flex items-center justify-between">
              <span className="text-base font-bold text-[#17130F]">
                {storeSettings.logoText || 'Creating Leather Goods'}
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-[#625D57] hover:text-[#17130F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="p-5 border-b border-[#E6E2DC]">
              <div className="flex items-center border border-[#E6E2DC] bg-[#F3F1ED] px-3 py-2 gap-2">
                <Search className="w-4 h-4 text-[#625D57]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collection..."
                  className="w-full bg-transparent text-sm text-[#17130F] placeholder:text-[#625D57] focus:outline-none"
                />
              </div>
            </form>

            <nav className="p-5 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-3 px-2 text-base font-medium border-b border-[#F3F1ED] flex items-center justify-between ${
                      isActive ? 'text-[#17130F]' : 'text-[#625D57]'
                    } ${item.label === 'Sale' ? 'text-[#B42318]' : ''}`
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-2 text-base font-medium text-[#17130F] border-b border-[#F3F1ED]"
              >
                Shop All Leather Goods
              </Link>
            </nav>
          </div>

          <div className="p-5 border-t border-[#E6E2DC] bg-[#F3F1ED] flex flex-col gap-3">
            <Link
              to={isAuthenticated ? '/admin' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 text-sm font-medium text-[#17130F]"
            >
              <User className="w-4 h-4" />
              <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin Sign In'}</span>
            </Link>
            <p className="text-sm text-[#625D57]">
              Cash on Delivery across Pakistan
            </p>
          </div>
        </aside>
      </div>
    </header>
  );
}
