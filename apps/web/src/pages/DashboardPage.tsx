// DashboardPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useBudgets } from '../hooks/useBudgets';
import { Button } from '../components/ui/Button';
import { TransactionModal } from '../components/modals/TransactionModal';

// Modular Dashboard Components
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { FinancialSummary } from '../components/dashboard/FinancialSummary';
import { CashflowSection } from '../components/dashboard/CashflowSection';
import { WalletOverview } from '../components/dashboard/WalletOverview';
import { BudgetOverview } from '../components/dashboard/BudgetOverview';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AIInsight } from '../components/dashboard/AIInsight';
import { QuickActions } from '../components/dashboard/QuickActions';

import { containerStagger, itemFadeUp } from '../motion/variants';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { dashboard, isLoading, isError, refetch } = useDashboard();
  const { budgets } = useBudgets();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const userName = user?.name || user?.phone || 'Dhika';

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={40} color="var(--danger-500)" style={{ marginBottom: 'var(--space-4)' }} />
        <h3 className="card-title">Gagal memuat data</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 'var(--space-2) 0 var(--space-6)' }}>
          Terjadi kendala saat menyinkronkan data dengan server. Coba lagi beberapa saat.
        </p>
        <Button variant="primary" onClick={() => refetch()}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  const totalBalance = dashboard?.totalBalance || 0;
  const totalIncome = dashboard?.totalIncome || 0;
  const totalExpense = dashboard?.totalExpense || 0;
  const wallets = dashboard?.wallets || [];
  const recentTransactions = dashboard?.recentTransactions || [];
  const budgetSummary = dashboard?.budget || null;

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="dashboard-page-container"
    >
      {/* 1. Greeting & Header */}
      <motion.div variants={itemFadeUp}>
        <DashboardHeader
          userName={userName}
          onOpenTransactionModal={() => setIsTxModalOpen(true)}
        />
      </motion.div>

      {/* 2. Financial Summary (4 Premium Cards) */}
      <motion.div variants={itemFadeUp}>
        <FinancialSummary
          isLoading={isLoading}
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />
      </motion.div>

      {/* 3. AI Financial Insight Banner */}
      <motion.div variants={itemFadeUp}>
        <AIInsight
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />
      </motion.div>

      {/* 4. Cashflow Section */}
      <motion.div variants={itemFadeUp}>
        <CashflowSection
          transactions={recentTransactions}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />
      </motion.div>

      {/* 5. Wallets & Budget Overview Row */}
      <div className="dashboard-grid-split">
        <motion.div variants={itemFadeUp}>
          <WalletOverview
            wallets={wallets}
            isLoading={isLoading}
            onOpenCreateWallet={() => setIsTxModalOpen(true)}
          />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <BudgetOverview
            budgets={budgets}
            budgetSummary={budgetSummary}
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* 6. Recent Transactions */}
      <motion.div variants={itemFadeUp}>
        <RecentTransactions
          transactions={recentTransactions}
          isLoading={isLoading}
          onOpenCreateModal={() => setIsTxModalOpen(true)}
        />
      </motion.div>

      {/* 7. Quick Actions */}
      <motion.div variants={itemFadeUp}>
        <QuickActions
          onOpenTransactionModal={() => setIsTxModalOpen(true)}
        />
      </motion.div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
    </motion.div>
  );
};
