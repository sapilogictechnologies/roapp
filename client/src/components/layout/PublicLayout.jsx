import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../features/auth/authSlice';
import { useGetPublicSettingsQuery } from '../../services/settingsApi';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/service-area', label: 'Service Area' },
  { to: '/event-booking', label: 'Events' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const cartCount = useSelector((s) => s.cart?.items?.reduce((a, i) => a + i.quantity, 0) || 0);
  const { data: settings } = useGetPublicSettingsQuery();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/customer/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm'
            : 'bg-white/90 backdrop-blur-xl border-slate-100'
        }`}
      >
        <div className="page-container h-20 flex items-center gap-5">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-800 to-blue-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path d="M12 2C10 5 5 10 5 15a7 7 0 0014 0c0-5-5-10-7-13z" />
              </svg>
            </div>

            <div className="leading-tight">
              <span className="block font-extrabold text-xl tracking-tight text-slate-950">
                Aqua<span className="text-blue-700">Flow</span>
              </span>
              <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Pure Water Delivery
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-1 flex-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2.5 rounded-2xl text-[15px] font-semibold transition-all ${
                  isActive(item.to)
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 ml-auto">
            {isAuth && (
              <Link
                to="/cart"
                className="relative w-11 h-11 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-600 text-white font-bold text-sm">
                    {isAdmin ? 'A' : 'C'}
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Account</p>
                    <p className="text-[11px] font-medium text-slate-500 capitalize">
                      {isAdmin ? 'Admin Panel' : 'Customer'}
                    </p>
                  </div>

                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${accountOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-fade-in">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-950">Account</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="p-2">
                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <span>📊</span>
                        {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                      </Link>

                      {!isAdmin && (
                        <>
                          <Link
                            to="/orders"
                            className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <span>📦</span>
                            My Orders
                          </Link>

                          <Link
                            to="/notifications"
                            className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <span>🔔</span>
                            Notifications
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <span>↪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Sign In
                </Link>

                <Link to="/register" className="btn-primary btn-sm rounded-2xl">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2 ml-auto">
            {isAuth && (
              <Link
                to="/cart"
                className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white shadow-lg animate-fade-in">
            <div className="page-container py-4 space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex px-4 py-3 rounded-2xl text-sm font-bold ${
                    isActive(item.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-slate-100">
                {isAuth ? (
                  <>
                    <Link
                      to={dashboardPath}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold"
                    >
                      <span className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center">
                        {isAdmin ? 'A' : 'C'}
                      </span>
                      Account
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 flex px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" className="btn-secondary btn-sm justify-center rounded-2xl">
                      Sign In
                    </Link>
                    <Link to="/register" className="btn-primary btn-sm justify-center rounded-2xl">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto" style={{ background: 'linear-gradient(180deg,#071B34 0%,#050F1E 100%)' }}>
        {/* Top accent line */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,#2563EB,#0EA5E9,#06B6D4,#2563EB)' }} />

        <div className="page-container py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                    <path d="M12 2C10 5 5 10 5 15a7 7 0 0014 0c0-5-5-10-7-13z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-extrabold text-white text-lg leading-tight">AquaFlow</span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: '#38BDF8' }}>Pure Water Delivery</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,195,255,0.65)' }}>
                Pure RO water delivered to homes, offices, and events with transparent pricing and professional operations.
              </p>
              <div className="flex items-center gap-2 mt-5">
                <span className="live-dot" />
                <span className="text-xs font-semibold" style={{ color: 'rgba(52,211,153,0.9)' }}>Accepting orders now</span>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-white font-black text-sm mb-5 uppercase tracking-wider">Navigate</h4>
              <ul className="space-y-3">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-sm font-medium transition-colors flex items-center gap-2 group" style={{ color: 'rgba(148,195,255,0.65)' }}
                      onMouseOver={e => e.currentTarget.style.color = '#38BDF8'}
                      onMouseOut={e => e.currentTarget.style.color = 'rgba(148,195,255,0.65)'}
                    >
                      <span className="h-0 w-0 group-hover:w-2 overflow-hidden transition-all duration-200 inline-block text-blue-400">→</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-black text-sm mb-5 uppercase tracking-wider">Products</h4>
              <ul className="space-y-3 text-sm">
                {[['20L Water Jar', '/products'], ['Bottled Water', '/products'], ['Bulk Cartons', '/products'], ['Event Supply', '/event-booking']].map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="font-medium transition-colors" style={{ color: 'rgba(148,195,255,0.65)' }}
                      onMouseOver={e => e.currentTarget.style.color = '#38BDF8'}
                      onMouseOut={e => e.currentTarget.style.color = 'rgba(148,195,255,0.65)'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-black text-sm mb-5 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm">
                {settings?.phone && (
                  <li>
                    <a href={`tel:${settings.phone}`} className="font-medium flex items-center gap-2 transition-colors" style={{ color: 'rgba(148,195,255,0.65)' }}
                      onMouseOver={e => e.currentTarget.style.color = '#38BDF8'}
                      onMouseOut={e => e.currentTarget.style.color = 'rgba(148,195,255,0.65)'}
                    >
                      <span>📞</span> {settings.phone}
                    </a>
                  </li>
                )}
                {settings?.whatsapp && (
                  <li>
                    <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                      className="font-medium flex items-center gap-2 transition-colors" style={{ color: 'rgba(148,195,255,0.65)' }}
                      onMouseOver={e => e.currentTarget.style.color = '#4ADE80'}
                      onMouseOut={e => e.currentTarget.style.color = 'rgba(148,195,255,0.65)'}
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </li>
                )}
                {settings?.address && <li className="flex items-start gap-2" style={{ color: 'rgba(148,195,255,0.55)' }}><span>📍</span><span>{settings.address}</span></li>}
                {settings?.workingHours && <li className="flex items-center gap-2" style={{ color: 'rgba(148,195,255,0.55)' }}><span>🕐</span>{settings.workingHours}</li>}
                {!settings?.phone && !settings?.whatsapp && (
                  <li style={{ color: 'rgba(148,195,255,0.55)' }}>📞 Contact via WhatsApp</li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-medium" style={{ color: 'rgba(148,195,255,0.4)' }}>
              © {new Date().getFullYear()} {settings?.businessName || 'AquaFlow'}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {[
                ['/privacy', 'Privacy'],
                ['/refund-policy', 'Refund Policy'],
                ['/delivery-policy', 'Delivery Policy'],
                ['/jar-return-policy', 'Jar Return'],
                ['/payment-help', 'Payment Help'],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="font-medium transition-colors" style={{ color: 'rgba(148,195,255,0.4)' }}
                  onMouseOver={e => e.currentTarget.style.color = '#38BDF8'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(148,195,255,0.4)'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
