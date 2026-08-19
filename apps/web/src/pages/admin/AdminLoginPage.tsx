// AdminLoginPage.tsx - Portal Login Khusus Internal Administrator
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Email dan password administrator wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await adminService.login(email.trim(), password);
      success('Login Admin Berhasil', `Selamat datang kembali, ${res.user.name || 'Super Admin'}!`);
      navigate('/admin/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Kredensial tidak valid. Akses ditolak oleh sistem keamanan.';
      setErrorMsg(msg);
      toastError('Akses Ditolak', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      {/* Ambient Cyber Lighting Orbs */}
      <div className="admin-ambient-glow" />
      <div className="admin-ambient-glow cyan" />
      <div className="admin-ambient-glow purple" />
      <div className="admin-grid-pattern" />

      {/* Top Telemetry Status Ribbon */}
      <div className="admin-top-telemetry">
        <div className="admin-telemetry-item active">
          <span>GATEWAY ONLINE</span>
        </div>
        <span>•</span>
        <div className="admin-telemetry-item">
          <Server size={12} />
          <span>AP-SOUTHEAST-1</span>
        </div>
        <span>•</span>
        <div className="admin-telemetry-item">
          <Lock size={12} />
          <span>TLS 1.3 / AES-256</span>
        </div>
      </div>

      <motion.div
        className="admin-auth-card"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="admin-brand-logo-wrapper">
            <Link to="/" title="Kembali ke Beranda" className="admin-logo-glass-frame">
              <img
                src="/logo.png"
                alt="Rinci.in Logo"
                className="admin-brand-logo-img"
              />
            </Link>
          </div>

          <div className="admin-header-badge">
            <ShieldCheck size={13} />
            <span>Restricted Internal Gateway</span>
          </div>

          <h1 className="admin-auth-title">Portal Administrator</h1>
          <p className="admin-auth-subtitle">
            Sistem Manajemen & Kontrol Sentral Rinci.in
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.825rem',
              fontWeight: 500,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#ef4444' }} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label className="admin-input-label">
              <span>Email Administrator</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>REQUIRED</span>
            </label>
            <div className="admin-input-control">
              <div className="admin-input-icon">
                <Mail size={16} />
              </div>
              <input
                type="email"
                className="admin-input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rinci.in"
                autoComplete="email"
                autoFocus
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">
              <span>Kunci Akses / Password</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>ENCRYPTED</span>
            </label>
            <div className="admin-input-control">
              <div className="admin-input-icon">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <KeyRound size={17} />
                <span>Autentikasi & Masuk Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Live Security Checklist Chips */}
        <div className="admin-security-chips">
          <div className="admin-security-chip">
            <ShieldCheck size={16} />
            <span>256-Bit SSL</span>
          </div>
          <div className="admin-security-chip">
            <Zap size={16} />
            <span>Rate-Limited</span>
          </div>
          <div className="admin-security-chip">
            <Server size={16} />
            <span>IP Audited</span>
          </div>
        </div>

        <div className="admin-security-footer">
          <span>Seluruh percobaan akses dicatat secara otomatis ke Security Audit Log</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#94a3b8',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Login Pengguna</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
