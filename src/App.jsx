import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Loader from './components/common/Loader.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <Loader />
              <AppRoutes />
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
