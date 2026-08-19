import React from 'react';
import { Menu, Sun, Moon, Plus, Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenQuickTransaction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenQuickTransaction,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isInstallable, installApp } = usePwaInstall();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Buka Menu Navigasi"
        >
          <Menu size={20} />
        </button>

        <div className="header-brand-mobile">
          <img
            src="/logo.png"
            alt="Rinci.in Logo"
            className="header-brand-mobile-logo-img"
          />
          <span>rinci<span style={{ color: 'var(--primary-600)' }}>.in</span></span>
        </div>
      </div>

      <div className="header-right">
        {isInstallable && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={installApp}
            className="hidden sm:inline-flex"
            style={{ fontSize: '11px', padding: '4px 8px', height: '32px' }}
          >
            <span>Install App</span>
          </Button>
        )}

        {onOpenQuickTransaction && (
          <Button
            variant="primary"
            size="sm"
            className="header-tx-btn"
            leftIcon={<Plus size={14} />}
            onClick={onOpenQuickTransaction}
          >
            <span className="btn-label-text">+ Transaksi</span>
          </Button>
        )}

        {/* Theme Toggle Button */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          aria-label={`Ganti ke tema ${theme === 'light' ? 'gelap' : 'terang'}`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <Avatar src={user?.avatar} name={user?.name || user?.phone} size="sm" />
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              display: 'none',
            }}
            className="md:inline-block"
          >
            {user?.name?.split(' ')[0] || user?.phone}
          </span>
        </div>
      </div>
    </header>
  );
};
