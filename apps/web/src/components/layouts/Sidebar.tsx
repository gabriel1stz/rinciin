// Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';

interface SidebarProps {
  onOpenQuickTransaction?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenQuickTransaction,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'UTAMA',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Dompet', path: '/wallet', icon: <Wallet size={18} /> },
        { label: 'Transaksi', path: '/transactions', icon: <ArrowLeftRight size={18} /> },
      ],
    },
    {
      title: 'KEUANGAN',
      items: [
        { label: 'Anggaran', path: '/budget', icon: <PieChart size={18} /> },
        { label: 'Analisis', path: '/reports', icon: <BarChart3 size={18} /> },
      ],
    },
    {
      title: 'LAINNYA',
      items: [
        { label: 'AI Keuangan', path: '/ai', icon: <Sparkles size={18} />, badge: 'PRO' },
        { label: 'Pengaturan', path: '/settings', icon: <Settings size={18} /> },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand */}
        <NavLink
          to="/dashboard"
          className="sidebar-brand"
          style={{ textDecoration: 'none' }}
          onClick={onCloseMobile}
        >
          <img
            src="/logo.png"
            alt="Rinci.in Logo"
            className="sidebar-brand-logo-img"
          />
          <span className="sidebar-title">
            rinci<span style={{ color: 'var(--primary-600)' }}>.in</span>
          </span>
        </NavLink>

        {/* Quick CTA */}
        {onOpenQuickTransaction && (
          <div style={{ padding: 'var(--space-4) 0 var(--space-2)' }}>
            <Button
              variant="primary"
              className="w-full justify-center shadow-sm"
              leftIcon={<Plus size={16} />}
              onClick={() => {
                onOpenQuickTransaction();
                if (onCloseMobile) onCloseMobile();
              }}
            >
              + Transaksi Baru
            </Button>
          </div>
        )}

        {/* Navigation Group List */}
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.title} className="sidebar-nav-group">
              <div className="sidebar-group-label">{group.title}</div>
              <div className="flex flex-col gap-1">
                {group.items.map((item: any) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn('sidebar-nav-item', isActive && 'active')
                    }
                    onClick={onCloseMobile}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <Avatar src={user?.avatar} name={user?.name || user?.phone} size="sm" />
          <div className="user-info">
            <div className="flex items-center gap-1.5">
              <span className="user-name">{user?.name || 'Pengguna'}</span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  background:
                    (user?.tier || '').toUpperCase() === 'PRO' ||
                    (user?.tier || '').toUpperCase() === 'FAMILY' ||
                    (user?.tier || '').toUpperCase() === 'SUPER_ADMIN'
                      ? 'var(--primary-100, #dbeafe)'
                      : 'var(--bg-secondary, #f1f5f9)',
                  color:
                    (user?.tier || '').toUpperCase() === 'PRO' ||
                    (user?.tier || '').toUpperCase() === 'FAMILY' ||
                    (user?.tier || '').toUpperCase() === 'SUPER_ADMIN'
                      ? 'var(--primary-700, #1d4ed8)'
                      : 'var(--text-muted, #64748b)',
                }}
              >
                {user?.tier || 'FREE'}
              </span>
            </div>
            <div className="user-phone">{user?.phone || 'Akun Aktif'}</div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-danger"
          leftIcon={<LogOut size={16} />}
          onClick={handleLogout}
        >
          Keluar
        </Button>
      </div>
    </aside>
  );
};
