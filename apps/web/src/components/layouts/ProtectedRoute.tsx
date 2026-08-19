// ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Zap, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../ui/Loading';
import { Button } from '../ui/Button';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return <Loading fullPage text="Memeriksa sesi login..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin / Super Admin bypass
  const userTier = (user.tier || '').toUpperCase();
  const isAdmin = userTier === 'SUPER_ADMIN' || userTier === 'ADMIN';

  if (isAdmin) {
    return <>{children}</>;
  }

  // Check subscription active status
  const latestSub =
    user.subscription && user.subscription.length > 0
      ? [...user.subscription].sort(
          (a, b) =>
            new Date(b.expiresAt || 0).getTime() -
            new Date(a.expiresAt || 0).getTime()
        )[0]
      : null;

  const isExpired = latestSub?.expiresAt
    ? new Date(latestSub.expiresAt) < new Date()
    : false;

  const subPlan = (latestSub?.plan || userTier).toUpperCase();
  const isProOrFamily = (userTier === 'PRO' || userTier === 'FAMILY' || subPlan === 'PRO' || subPlan === 'FAMILY') && !isExpired;
  const isTrialActive = (userTier === 'TRIAL' || subPlan === 'TRIAL') && !isExpired;

  const hasAccess = isProOrFamily || isTrialActive;

  if (!hasAccess) {
    const expiredDateStr = latestSub?.expiresAt
      ? new Date(latestSub.expiresAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : null;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center" style={{ background: 'var(--bg-primary, #0f172a)' }}>
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--bg-card, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '20px',
            padding: '36px 28px',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', marginBottom: '8px' }}>
            Masa Uji Coba Berakhir
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.6, marginBottom: '24px' }}>
            {expiredDateStr ? (
              <>
                Masa Trial 7 Hari gratis kamu telah berakhir pada <strong>{expiredDateStr}</strong>.
              </>
            ) : (
              <>Kamu belum memiliki paket langganan aktif untuk mengakses dashboard ini.</>
            )}
            <br />
            Silakan upgrade ke paket <strong>PRO</strong> atau <strong>Family</strong> untuk melanjutkan akses pencatatan keuangan tanpa batas! 🚀
          </p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              leftIcon={<Zap size={18} />}
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/checkout?plan=pro')}
            >
              Upgrade ke Paket PRO (Rp1.000)
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                navigate('/#pricing');
              }}
            >
              Lihat Semua Pilihan Paket
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-muted"
              leftIcon={<LogOut size={16} />}
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Keluar Akun
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
