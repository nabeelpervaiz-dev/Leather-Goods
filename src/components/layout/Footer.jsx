import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.jsx';

export default function Footer() {
  const { storeSettings } = useStore();
  const whatsappClean = String(storeSettings.whatsappNumber || '923001234567').replace(/[^\d]/g, '');

  return (
    <footer className="bg-[#F3F1ED] border-t border-[#E6E2DC] text-[#17130F]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-[#E6E2DC]">
          {/* Column 1: Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#17130F] mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm text-[#625D57]">
              <li>
                <Link to="/new-arrivals" className="hover:text-[#17130F] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/category/shoes" className="hover:text-[#17130F] transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/category/jackets" className="hover:text-[#17130F] transition-colors">
                  Jackets
                </Link>
              </li>
              <li>
                <Link to="/category/wallets" className="hover:text-[#17130F] transition-colors">
                  Wallets
                </Link>
              </li>
              <li>
                <Link to="/category/bags" className="hover:text-[#17130F] transition-colors">
                  Bags
                </Link>
              </li>
              <li>
                <Link to="/sale" className="hover:text-[#B42318] transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Help */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#17130F] mb-4">
              Help
            </h3>
            <ul className="space-y-2.5 text-sm text-[#625D57]">
              <li>
                <Link to="/help/contact" className="hover:text-[#17130F] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/help/delivery" className="hover:text-[#17130F] transition-colors">
                  Delivery
                </Link>
              </li>
              <li>
                <Link to="/help/returns" className="hover:text-[#17130F] transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/help/faqs" className="hover:text-[#17130F] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#17130F] mb-4">
              About
            </h3>
            <ul className="space-y-2.5 text-sm text-[#625D57]">
              <li>
                <Link to="/story" className="hover:text-[#17130F] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/story#craftsmanship" className="hover:text-[#17130F] transition-colors">
                  Craftsmanship
                </Link>
              </li>
              <li>
                <Link to="/help/privacy" className="hover:text-[#17130F] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/help/terms" className="hover:text-[#17130F] transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#17130F] transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow & Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#17130F] mb-4">
              Follow
            </h3>
            <ul className="space-y-2.5 text-sm text-[#625D57] mb-6">
              <li>
                <a
                  href={storeSettings.socialLinks?.instagram || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#17130F] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={storeSettings.socialLinks?.facebook || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#17130F] transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={storeSettings.socialLinks?.tiktok || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#17130F] transition-colors"
                >
                  TikTok
                </a>
              </li>
            </ul>

            <div className="space-y-1.5 text-sm text-[#625D57]">
              <p className="font-medium text-[#17130F]">Atelier & Orders</p>
              <p>{storeSettings.contactNumber}</p>
              <p>{storeSettings.email}</p>
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[#8C5A36] font-medium hover:underline pt-1"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-[#625D57]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="font-semibold text-[#17130F]">{storeSettings.storeName}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>{storeSettings.address}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span>Payment: Cash on Delivery (PKR)</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>© {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
