// AppLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Drawer } from '../ui/Drawer';
import { TransactionModal } from '../modals/TransactionModal';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <div className="app-sidebar-desktop">
        <Sidebar onOpenQuickTransaction={() => setIsQuickTxOpen(true)} />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        position="left"
        maxWidth="300px"
      >
        <div style={{ margin: '-1rem' }}>
          <Sidebar
            onOpenQuickTransaction={() => setIsQuickTxOpen(true)}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </Drawer>

      {/* Main Container */}
      <div className="app-main">
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickTransaction={() => setIsQuickTxOpen(true)}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Transaction Modal */}
      <TransactionModal
        isOpen={isQuickTxOpen}
        onClose={() => setIsQuickTxOpen(false)}
      />
    </div>
  );
};
