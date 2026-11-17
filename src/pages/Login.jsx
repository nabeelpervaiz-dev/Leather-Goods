import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { DEMO_ADMIN_CREDENTIALS } from '../services/authService.js';
import Button from '../components/common/Button.jsx';

export default function Login() {
  const { isAuthenticated, authLoading, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleFillDemo = () => {
    setEmail(DEMO_ADMIN_CREDENTIALS.email);
    setPassword(DEMO_ADMIN_CREDENTIALS.password);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      await login(email.trim(), password);
      showToast('Signed in to Creating Leather Goods admin console.');
      navigate('/admin', { replace: true });
    } catch (err) {
      setErrorMsg(err?.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F1ED] flex flex-col justify-center px-4 py-10">
      <div className="max-w-md w-full mx-auto bg-white border border-[#E6E2DC] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#E6E2DC] pb-5">
          <Link
            to="/"
            className="text-sm font-medium text-[#8C5A36] hover:underline inline-block mb-3"
          >
            ← Back to Creating Leather Goods
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-5 h-5 text-[#17130F]" />
            <h1 className="text-2xl font-bold text-[#17130F]">Admin Sign In</h1>
          </div>
          <p className="text-sm text-[#625D57]">
            Sign in to preview and manage the catalog, orders, and inventory locally in your browser.
          </p>
        </div>

        {/* Visible Demo Credentials */}
        <div className="bg-[#F3F1ED] border border-[#E6E2DC] p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[#17130F]">Demo Admin Credentials</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-medium text-[#8C5A36] hover:underline cursor-pointer whitespace-nowrap"
            >
              Fill Credentials
            </button>
          </div>
          <p className="text-[#625D57] break-all">
            Email: <span className="text-[#17130F] font-medium">{DEMO_ADMIN_CREDENTIALS.email}</span>
          </p>
          <p className="text-[#625D57]">
            Password: <span className="text-[#17130F] font-medium">{DEMO_ADMIN_CREDENTIALS.password}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="border border-[#B42318] bg-[#FFF5F5] px-4 py-3 text-sm text-[#B42318]"
            >
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-[#17130F] mb-1.5">
              Admin Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={DEMO_ADMIN_CREDENTIALS.email}
              required
              className="w-full px-4 py-2.5 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-[#17130F] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-4 py-2.5 pr-11 bg-[#F3F1ED] border border-[#E6E2DC] text-base text-[#17130F] focus:outline-none focus:border-[#17130F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#625D57] hover:text-[#17130F] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={authLoading} className="w-full py-3 min-h-[44px]">
            {authLoading ? 'Signing In...' : 'Sign In to Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  );
}
