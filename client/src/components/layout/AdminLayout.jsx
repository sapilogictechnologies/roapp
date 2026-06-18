import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
import NotificationBell from '../common/NotificationBell';
import { useSocketNotifications } from '../../hooks/useSocketNotifications';

const GROUPS = [
  { label: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' }] },
  {
    label: 'Operations',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: 'box' },
      { to: '/admin/payments', label: 'Payments', icon: 'card' },
      { to: '/admin/jars', label: 'Jar Ledger', icon: 'jar' },
      { to: '/admin/subscriptions', label: 'Subscriptions', icon: 'repeat' },
      { to: '/admin/events', label: 'Events', icon: 'calendar' },
      { to: '/admin/messages', label: 'Messages', icon: 'message' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: 'drop' },
      { to: '/admin/categories', label: 'Categories', icon: 'folder' },
      { to: '/admin/coupons', label: 'Coupons', icon: 'tag' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: 'users' },
      { to: '/admin/bills', label: 'Bills', icon: 'bill' },
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/admin/pricing', label: 'Pricing', icon: 'settings' },
      { to: '/admin/service-areas', label: 'Service Areas', icon: 'map' },
      { to: '/admin/time-slots', label: 'Time Slots', icon: 'clock' },
      { to: '/admin/settings', label: 'Settings', icon: 'sliders' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: 'chart' },
      { to: '/admin/logs', label: 'Logs', icon: 'list' },
    ],
  },
];

function Icon({ name }) {
  const paths = {
    grid: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
    box: 'M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 8.2L12 13l8.7-4.8M12 22V13',
    card: 'M3 6h18v12H3V6zm0 4h18',
    jar: 'M8 3h8v4l2 3v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9l2-3V3zm1 4h6',
    repeat: 'M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4m14-2v2a4 4 0 01-4 4H3',
    calendar: 'M7 2v4m10-4v4M3 10h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
    message: 'M4 5h16v11H7l-3 3V5z',
    drop: 'M12 2C9 6 6 10 6 14a6 6 0 0012 0c0-4-3-8-6-12z',
    folder: 'M3 6h7l2 2h9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z',
    tag: 'M20 13l-7 7L4 11V4h7l9 9zM7.5 7.5h.01',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    bill: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2zm3 6h6m-6 4h6m-6 4h4',
    settings: 'M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83',
    map: 'M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3zm0 0V3m6 18V6',
    clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 5v5l3 3',
    sliders: 'M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4',
    chart: 'M4 19V5m5 14v-7m5 7V8m5 11V3',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    chevrons: 'M13 5l7 7-7 7M5 5l7 7-7 7',
    chevronsLeft: 'M11 19l-7-7 7-7m8 14l-7-7 7-7',
  };
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || paths.grid} />
    </svg>
  );
}

const SIDEBAR_BG = 'linear-gradient(180deg,#071B34 0%,#0F2747 100%)';

export default function AdminLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem('admin_notification_sound_muted') === 'true');
  const isActive = (path) => location.pathname === path;

  useSocketNotifications();

  const toggleSound = () => {
    setSoundMuted((value) => {
      localStorage.setItem('admin_notification_sound_muted', String(!value));
      return !value;
    });
  };

  const signOut = () => {
    dispatch(logout());
    navigate('/');
  };

  const SideContent = () => (
    <>
      {/* User card */}
      {!collapsed && user && (
        <div className="mx-3 mb-3 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
              {user.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user.name}</p>
              <p className="truncate text-xs" style={{ color: 'rgba(148,195,255,0.7)' }}>{user.email}</p>
            </div>
          </div>
        </div>
      )}
      {collapsed && user && (
        <div className="mx-2 mb-3 flex justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
            {user.name?.[0] || 'A'}
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-1">
        {GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: 'rgba(148,195,255,0.4)' }}>
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-2 my-2 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : ''}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${collapsed ? 'justify-center px-2' : ''}`}
                  style={
                    isActive(item.to)
                      ? { background: 'rgba(37,99,235,0.25)', color: 'white', borderLeft: '2px solid #2563EB', paddingLeft: collapsed ? '8px' : 'calc(12px - 2px)', fontWeight: 600 }
                      : { color: 'rgba(186,215,255,0.7)' }
                  }
                  onMouseOver={e => { if (!isActive(item.to)) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; } }}
                  onMouseOut={e => { if (!isActive(item.to)) { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(186,215,255,0.7)'; } }}
                >
                  <Icon name={item.icon} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          to="/"
          className={`mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${collapsed ? 'justify-center px-2' : ''}`}
          style={{ color: 'rgba(186,215,255,0.6)' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(186,215,255,1)'; }}
          onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(186,215,255,0.6)'; }}
        >
          <Icon name="drop" />
          {!collapsed && <span>View Site</span>}
        </Link>
        <button
          onClick={signOut}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${collapsed ? 'justify-center px-2' : ''}`}
          style={{ color: 'rgba(252,165,165,0.8)' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#FCA5A5'; }}
          onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(252,165,165,0.8)'; }}
        >
          <Icon name="logout" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar — dark navy */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} sticky top-0 hidden h-screen shrink-0 flex-col transition-all duration-200 md:flex`}
        style={{ background: SIDEBAR_BG, borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
                <Icon name="drop" />
              </div>
              <div>
                <p className="text-sm font-black text-white leading-tight">AquaFlow</p>
                <p className="text-[10px] font-bold" style={{ color: '#38BDF8' }}>Admin</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded-xl p-1.5 transition-colors ${collapsed ? 'mx-auto' : ''}`}
            style={{ color: 'rgba(148,195,255,0.6)' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(148,195,255,0.6)'; }}
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
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 z-50 flex h-full w-64 flex-col shadow-2xl" style={{ background: SIDEBAR_BG, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-black text-white">AquaFlow Admin</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg" style={{ color: 'rgba(148,195,255,0.7)' }}>
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 px-4 sm:px-6" style={{ background: 'white', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              {location.pathname.split('/').filter(Boolean).map((seg, i, arr) => (
                <React.Fragment key={i}>
                  <span className={`font-medium capitalize ${i === arr.length - 1 ? 'text-slate-700' : 'text-slate-400'}`}>{seg}</span>
                  {i < arr.length - 1 && <span className="text-slate-300">/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ color: soundMuted ? '#94A3B8' : '#2563EB', background: soundMuted ? '#F1F5F9' : '#EFF6FF' }}
            >
              {soundMuted ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              )}
              {soundMuted ? 'Muted' : 'Sound on'}
            </button>

            <NotificationBell enableSound soundMuted={soundMuted} />

            <div className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black text-white" style={{ background: 'linear-gradient(135deg,#2563EB,#0EA5E9)' }}>
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
