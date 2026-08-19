// Header.tsx
import React from 'react';
import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
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

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Buka Menu Navigasi"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="header-right">
        {onOpenQuickTransaction && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={onOpenQuickTransaction}
          >
            + Transaksi
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
