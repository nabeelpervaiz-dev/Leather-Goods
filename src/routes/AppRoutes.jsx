import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useCart } from '../hooks/useCart.js';
import Home from '../pages/Home.jsx';

const CartDrawer = lazy(() => import('../components/cart/CartDrawer.jsx'));
const CategoryPage = lazy(() => import('../pages/CategoryPage.jsx'));
const ProductDetails = lazy(() => import('../pages/ProductDetails.jsx'));
const Cart = lazy(() => import('../pages/Cart.jsx'));
const Checkout = lazy(() => import('../pages/Checkout.jsx'));
const InfoPage = lazy(() => import('../pages/InfoPage.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminProducts = lazy(() => import('../pages/admin/Products.jsx'));
const AdminCategories = lazy(() => import('../pages/admin/Categories.jsx'));
const AdminOrders = lazy(() => import('../pages/admin/Orders.jsx'));
const AdminInventory = lazy(() => import('../pages/admin/Inventory.jsx'));
const AdminSales = lazy(() => import('../pages/admin/Sales.jsx'));
const AdminSettings = lazy(() => import('../pages/admin/Settings.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StorefrontLayout() {
  const { isDrawerOpen } = useCart();
  const [hasOpenedDrawer, setHasOpenedDrawer] = useState(false);

  useEffect(() => {
    if (isDrawerOpen && !hasOpenedDrawer) {
      setHasOpenedDrawer(true);
    }
  }, [isDrawerOpen, hasOpenedDrawer]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#17130F]">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {hasOpenedDrawer && (
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      )}
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <p className="text-sm font-medium text-[#625D57] tracking-wide">
        Loading Creating Leather Goods...
      </p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Storefront Routes */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<CategoryPage mode="all" />} />
            <Route path="/new-arrivals" element={<CategoryPage mode="new-arrivals" />} />
            <Route path="/sale" element={<CategoryPage mode="sale" />} />
            <Route path="/category/:slug" element={<CategoryPage mode="category" />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/story" element={<InfoPage section="story" />} />
            <Route path="/help/:topic" element={<InfoPage section="help" />} />
          </Route>

          {/* Admin Auth & Protected Dashboard */}
          <Route path="/admin/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/sales" element={<AdminSales />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
