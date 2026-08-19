// LoginPage.tsx - Ultra Modern & Secure WhatsApp Auth
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Zap,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface LoginPageProps {
  isRegister?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isRegister = false }) => {
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Format clean Indonesian phone number
  const cleanPhoneInput = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('62')) {
      digits = digits.substring(2);
    } else if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = cleanPhoneInput(e.target.value);
    setPhone(cleaned);
  };

  const formattedDisplayPhone = () => {
    if (!phone) return '';
    return phone.replace(/(\d{3,4})(\d{3,4})(\d{3,4})?/, (_, p1, p2, p3) => {
      return p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`;
    });
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim() || phone.length < 8) {
      error('Nomor WhatsApp Tidak Valid', 'Masukkan minimal 8-13 digit nomor WhatsApp aktif.');
      return;
    }

    setIsLoading(true);
    const fullPhone = `0${phone}`;
    try {
      await sendOtp(fullPhone);
      success('Kode OTP Terkirim', `Kode verifikasi 6 digit telah dikirim ke WhatsApp +62 ${formattedDisplayPhone()}`);
      setStep('OTP');
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      error('Gagal Mengirim OTP', err.response?.data?.message || err.message || 'Silakan periksa nomor WhatsApp Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanChar = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto advance to next box if digit entered
    if (cleanChar && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto trigger verify if last digit entered
    const completeCode = newDigits.join('');
    if (completeCode.length === 6 && !newDigits.includes('')) {
      submitVerification(completeCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      if (pastedData.length === 6) {
        submitVerification(pastedData);
      } else {
        const nextIndex = Math.min(pastedData.length, 5);
        otpInputsRef.current[nextIndex]?.focus();
      }
    }
  };

  const submitVerification = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otpDigits.join('');
    if (finalOtp.length !== 6) {
      error('Kode OTP Belum Lengkap', 'Masukkan 6 digit kode OTP yang dikirimkan.');
      return;
    }

    setIsLoading(true);
    const fullPhone = `0${phone}`;
    try {
      await verifyOtp(fullPhone, finalOtp);
      success('Selamat Datang!', 'Verifikasi berhasil. Mengalihkan ke dashboard...');
      navigate(from, { replace: true });
    } catch (err: any) {
      error('Verifikasi Gagal', err.response?.data?.message || err.message || 'Kode OTP salah atau telah kadaluarsa.');
      // Clear OTP inputs on error to allow fast retry
      setOtpDigits(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVerification();
  };

  return (
    <div className="auth-page-wrapper">
      {/* Ambient Lighting Orbs */}
      <div className="auth-ambient-glow top-left" />
      <div className="auth-ambient-glow bottom-right" />
      <div className="auth-grid-overlay" />

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* HERO SHOWCASE PANEL (Desktop Left Side) */}
        <div className="auth-hero-pane">
          <div>
            <Link to="/" className="auth-hero-brand">
              <img
                src="/logo.png"
                alt="Rinci.in Logo"
                className="auth-brand-logo-img"
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="auth-brand-name">Rinci.in</span>
                  <span className="auth-brand-tag">AI Finansial</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  Asisten Pencatatan Keuangan Pintar
                </span>
              </div>
            </Link>

            <div className="auth-hero-content">
              <h1 className="auth-hero-title">
                Kelola Finansial Cerdas <span>Tanpa Ribet</span>
              </h1>
              <p className="auth-hero-desc">
                Cukup kirim foto struk atau voice note ke WhatsApp, seluruh pencatatan & analisa keuangan Anda selesai otomatis.
              </p>

              <div className="auth-feature-list">
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">
                    <Zap size={16} />
                  </div>
                  <span>Catat Cepat via WhatsApp Bot 24/7</span>
                </div>

                <div className="auth-feature-item">
                  <div className="auth-feature-icon">
                    <TrendingUp size={16} />
                  </div>
                  <span>Insight AI & Laporan Anggaran Real-time</span>
                </div>

                <div className="auth-feature-item">
                  <div className="auth-feature-icon">
                    <ShieldCheck size={16} />
                  </div>
                  <span>Enkripsi 256-Bit Standar Perbankan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <CheckCircle2 size={16} color="var(--primary-500)" />
            <span>Terintegrasi aman dengan WhatsApp Business API</span>
          </div>
        </div>

        {/* AUTH FORM PANE (Right Side) */}
        <div className="auth-form-pane">
          <div className="auth-form-logo-wrapper">
            <Link to="/" title="Kembali ke Beranda">
              <img
                src="/logo.png"
                alt="Rinci.in Logo"
                className="auth-form-logo-img"
              />
            </Link>
          </div>

          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {step === 'PHONE'
                ? isRegister
                  ? 'Daftar Akun Rinci.in'
                  : 'Masuk ke Dashboard'
                : 'Verifikasi Kode OTP'}
            </h2>
            <p className="auth-form-subtitle">
              {step === 'PHONE'
                ? 'Masukkan nomor WhatsApp Anda untuk menerima kode verifikasi instan.'
                : `Masukkan 6 digit kode OTP yang kami kirimkan ke nomor WhatsApp Anda.`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'PHONE' ? (
              <motion.form
                key="step-phone"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSendOtp}
              >
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Nomor WhatsApp
                  </label>

                  <div className="phone-input-group">
                    <div className="phone-prefix-badge">
                      <span style={{ fontSize: '1.1rem' }}>🇮🇩</span>
                      <span>+62</span>
                    </div>
                    <input
                      type="tel"
                      className="phone-number-field"
                      placeholder="812 3456 7890"
                      value={phone}
                      onChange={handlePhoneChange}
                      autoFocus
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '6px',
                    }}
                  >
                    Contoh: 81234567890 (tanpa angka 0 atau +62 di depan)
                  </span>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading || !phone}
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Mengirim Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} />
                      <span>Kirim Kode OTP WhatsApp</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="auth-trust-note">
                  <Lock size={13} />
                  <span>Login instan tanpa perlu mengingat password</span>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifySubmit}
              >
                <div style={{ textAlign: 'center' }}>
                  <div className="otp-target-pill">
                    <span>Terkirim ke:</span>
                    <strong>+62 {formattedDisplayPhone()}</strong>
                    <span>•</span>
                    <button
                      type="button"
                      className="otp-change-num-btn"
                      onClick={() => setStep('PHONE')}
                    >
                      Ubah Nomor
                    </button>
                  </div>
                </div>

                <div className="otp-container">
                  <div className="otp-boxes-wrapper" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`otp-box-digit ${digit ? 'is-filled' : ''}`}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        disabled={isLoading}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <div className="otp-actions-bar">
                    <button
                      type="button"
                      onClick={() => setStep('PHONE')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Ganti nomor</span>
                    </button>

                    <button
                      type="button"
                      className="otp-resend-btn"
                      onClick={() => handleSendOtp()}
                      disabled={countdown > 0 || isLoading}
                    >
                      <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                      <span>
                        {countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim Ulang OTP'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading || otpDigits.includes('')}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Memverifikasi Kode...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Verifikasi & Masuk Dashboard</span>
                    </>
                  )}
                </button>

                <div className="auth-trust-note">
                  <ShieldCheck size={13} />
                  <span>Kode verifikasi hanya berlaku 5 menit</span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="auth-bottom-nav">
            <span>
              Belum punya akun?{' '}
              <Link to="/#pricing">
                Daftar & Pilih Paket
              </Link>
            </span>
            <div style={{ marginTop: '10px' }}>
              <Link
                to="/"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ArrowLeft size={13} />
                <span>Kembali ke Halaman Utama</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
