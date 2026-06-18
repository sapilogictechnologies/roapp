import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import { useGetNotificationsQuery } from '../../services/notificationApi';
import NotificationBell from '../common/NotificationBell';
import { useSocketNotifications } from '../../hooks/useSocketNotifications';

const STORE = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/products', label: 'Shop Products', icon: 'drop' },
  { to: '/cart', label: 'Cart', icon: 'bag' },
];

const ACCOUNT = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/orders', label: 'My Orders', icon: 'box' },
  { to: '/bills', label: 'Bills', icon: 'bill' },
  { to: '/payments', label: 'Payments', icon: 'card' },
  { to: '/payments/submit', label: 'Submit Payment', icon: 'upload' },
  { to: '/jars', label: 'Jar Status', icon: 'jar' },
  { to: '/subscriptions', label: 'Subscriptions', icon: 'repeat' },
  { to: '/events', label: 'Events', icon: 'calendar' },
  { to: '/messages', label: 'Messages', icon: 'message' },
  { to: '/addresses', label: 'Addresses', icon: 'map' },
  { to: '/notifications', label: 'Notifications', icon: 'bell' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

function Icon({ name }) {
  const paths = {
    home: 'M3 11l9-8 9 8v10h-6v-6H9v6H3V11z',
    drop: 'M12 2C9 6 6 10 6 14a6 6 0 0012 0c0-4-3-8-6-12z',
    bag: 'M6 8h12l1 13H5L6 8zm3 0a3 3 0 016 0',
    grid: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
    box: 'M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 8.2L12 13l8.7-4.8M12 22V13',
    bill: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2zm3 6h6m-6 4h6m-6 4h4',
    card: 'M3 6h18v12H3V6zm0 4h18',
    upload: 'M12 16V4m0 0l-4 4m4-4l4 4M4 20h16',
    jar: 'M8 3h8v4l2 3v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9l2-3V3zm1 4h6',
    repeat: 'M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4m14-2v2a4 4 0 01-4 4H3',
    calendar: 'M7 2v4m10-4v4M3 10h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
    message: 'M4 5h16v11H7l-3 3V5z',
    map: 'M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zm0 0V3m6 18V6',
    bell: 'M15 17h5l-2-2v-4a6 6 0 10-12 0v4l-2 2h11zm0 0a3 3 0 01-6 0',
    user: 'M20 21a8 8 0 10-16 0m8-10a4 4 0 100-8 4 4 0 000 8z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  };
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || paths.grid} />
    </svg>
  );
}

export default function CustomerLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const cartCount = useSelector((state) => state.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
  const { data: notifications } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  useSocketNotifications();

  const signOut = () => {
    dispatch(logout());
    navigate('/');
  };

  const NavLink = ({ item }) => {
    const active = isActive(item.to);
    return (
      <Link
        to={item.to}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? item.label : ''}
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${collapsed ? 'justify-center px-2' : ''}`}
        style={active
          ? { background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', color: '#1D4ED8', fontWeight: 600, borderLeft: '2px solid #2563EB', paddingLeft: collapsed ? '8px' : 'calc(12px - 2px)' }
          : { color: '#64748B' }
        }
        onMouseOver={e => { if (!active) { e.currentTarget.style.background = '#F8FAFF'; e.currentTarget.style.color = '#1e40af'; } }}
        onMouseOut={e => { if (!active) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#64748B'; } }}
      >
        <Icon name={item.icon} />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.to === '/cart' && cartCount > 0 && (
              <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-black text-white">{cartCount}</span>
            )}
            {item.to === '/notifications' && notifications?.unread > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">{notifications.unread}</span>
            )}
          </>
        )}
        {collapsed && item.to === '/notifications' && notifications?.unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">{notifications.unread}</span>
        )}
      </Link>
    );
  };

  const SideContent = () => (
    <>
      {/* User card */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-2xl overflow-hidden">
          <div className="p-3.5" style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '1px solid #BFDBFE' }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
                {user?.name?.[0] || 'C'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="truncate text-xs text-blue-500 font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2">
        {!collapsed && (
          <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Store</p>
        )}
        {STORE.map((item) => <NavLink key={item.to} item={item} />)}

        {!collapsed && (
          <p className="mt-3 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">My Account</p>
        )}
        {collapsed && <div className="mx-1 my-2 border-t border-slate-100" />}
        {ACCOUNT.map((item) => <NavLink key={item.to} item={item} />)}
      </nav>

      <div className="p-2 border-t border-slate-100">
        <button
          onClick={signOut}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all ${collapsed ? 'justify-center px-2' : ''}`}
          onMouseOver={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
          onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
        >
          <Icon name="logout" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-100 bg-white shadow-sm transition-all duration-200 md:flex`}>
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
                <Icon name="drop" />
              </div>
              <span className="text-sm font-black text-slate-900">AquaFlow</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors ${collapsed ? 'mx-auto' : ''}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
            </svg>
          </button>
        </div>
        <SideContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <Link to="/" className="text-sm font-black text-slate-900">AquaFlow</Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SideContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-100 bg-white px-4 sm:px-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs flex-1 min-w-0">
            {location.pathname.split('/').filter(Boolean).map((seg, i, arr) => (
              <React.Fragment key={i}>
                <span className={`font-medium capitalize ${i === arr.length - 1 ? 'text-slate-700' : 'text-slate-400'}`}>{seg}</span>
                {i < arr.length - 1 && <span className="text-slate-300">/</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex-1 sm:hidden" />

          <div className="flex items-center gap-1.5">
            <Link to="/cart" className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 transition-colors">
              <Icon name="bag" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
