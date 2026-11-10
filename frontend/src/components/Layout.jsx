import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiDatabase, FiFileText, FiMessageSquare,
  FiBarChart2, FiSettings, FiUser, FiLogOut,
  FiMenu, FiX, FiBell, FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/dashboard',      icon: FiHome,         label: 'Dashboard'     },
  { path: '/knowledge-base', icon: FiDatabase,     label: 'Knowledge Base'},
  { path: '/documents',      icon: FiFileText,     label: 'Documents'     },
  { path: '/chat',           icon: FiMessageSquare,label: 'AI Chat'       },
  { path: '/analytics',      icon: FiBarChart2,    label: 'Analytics'     },
  { path: '/settings',       icon: FiSettings,     label: 'Settings'      },
  { path: '/profile',        icon: FiUser,         label: 'Profile'       },
];

function Avatar({ user, size = 36 }) {
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover' }} />;
  }
  const initials = user?.initials || user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, color: 'white', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sideW = collapsed ? 68 : 240;

  const notifications = [
    { id: 1, text: 'New document uploaded by Sarah Chen', time: '2 min ago', unread: true },
    { id: 2, text: 'AI query limit 80% reached', time: '1 hr ago', unread: true },
    { id: 3, text: 'Weekly digest is ready to view', time: '3 hrs ago', unread: false },
    { id: 4, text: 'Emma Wilson shared a new article', time: 'Yesterday', unread: false },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sideW,
        background: 'rgba(8, 15, 35, 0.97)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 200,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '18px 14px' : '20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 12,
          minHeight: 68,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: 'white', flexShrink: 0,
          }}>AI</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>Enterprise AI</div>
              <div style={{ color: '#475569', fontSize: 11, whiteSpace: 'nowrap' }}>Platform</div>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                color: isActive ? '#60a5fa' : '#64748b',
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'all 0.15s',
                background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <Icon size={19} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 14 }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }} ref={menuRef}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer', color: 'white',
                overflow: 'hidden',
              }}
            >
              <Avatar user={user} size={32} />
              {!collapsed && (
                <>
                  <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                    <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.role || 'Member'}</div>
                  </div>
                  <FiChevronDown size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                </>
              )}
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 6,
                boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
                zIndex: 300,
              }}>
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, textAlign: 'left' }}
                >
                  <FiUser size={15} /> My Profile
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, textAlign: 'left' }}
                >
                  <FiSettings size={15} /> Settings
                </button>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, textAlign: 'left' }}
                >
                  <FiLogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, marginLeft: sideW, transition: 'margin-left 0.25s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Top header */}
        <header style={{
          height: 64,
          padding: '0 28px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(2,6,23,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
          >
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Plan badge */}
            <div style={{ padding: '5px 14px', background: 'rgba(37,99,235,0.1)', borderRadius: 20, border: '1px solid rgba(37,99,235,0.2)', fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>
              {user?.plan || 'Enterprise'} Plan
            </div>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
              >
                <FiBell size={17} />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #020617' }} />
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 300, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.4)', zIndex: 300 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', padding: '4px 8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>Notifications</div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '10px 8px', borderRadius: 8, background: n.unread ? 'rgba(37,99,235,0.06)' : 'transparent', marginBottom: 2, cursor: 'pointer' }}>
                      <div style={{ fontSize: 13, color: n.unread ? '#e2e8f0' : '#94a3b8', lineHeight: 1.4, marginBottom: 3 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
