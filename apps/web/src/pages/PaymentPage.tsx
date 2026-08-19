// PaymentPage.tsx - Realtime Pakasir Payment Screen with Polling, Real QRIS & VA Support
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  XCircle,
  Zap,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';

import { usePaymentPolling } from '../hooks/usePayment';
import { paymentService } from '../services/payment.service';
import { formatCurrency } from '../utils/currency';
import { formatDateId } from '../utils/date';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { loginWithOrder } = useAuth();

  const [isManualChecking, setIsManualChecking] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isOpeningDashboard, setIsOpeningDashboard] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60); // 15 minutes default timer


  const { payment, status, error, refetch } = usePaymentPolling({
    orderId: orderId || null,
    intervalMs: 3500,
    onSuccess: async (p) => {
      success('Pembayaran Berhasil!', `Paket ${p.plan || 'Pro'} kamu telah aktif.`);
      if (orderId) {
        try {
          await loginWithOrder(orderId);
        } catch (err) {
          console.warn('Auto login with orderId in background:', err);
        }
      }
    },
    onFailed: () => {
      toastError('Pembayaran Gagal', 'Silakan coba buat pesanan baru.');
    },
    onExpired: () => {
      toastError('Pembayaran Kedaluwarsa', 'Waktu pembayaran telah habis. Silakan buat pesanan baru.');
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (status !== 'PENDING') return;

    if (payment?.expiredAt) {
      const expTime = new Date(payment.expiredAt).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expTime - now) / 1000));
      if (diffSec > 0) {
        setTimeLeftSeconds(diffSec);
      }
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, payment?.expiredAt]);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleManualCheck = async () => {
    setIsManualChecking(true);
    try {
      await refetch();
    } finally {
      setIsManualChecking(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderId) return;
    setIsSimulating(true);
    try {
      await paymentService.simulatePayment(orderId);
      success('Simulasi Berhasil', 'Status pembayaran disimulasikan sukses.');
      await refetch();
    } catch (err: any) {
      toastError('Gagal Simulasi', err?.response?.data?.message || err?.message || 'Gagal simulasi');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!orderId || !window.confirm('Yakin ingin membatalkan transaksi ini?')) return;
    setIsCancelling(true);
    try {
      await paymentService.cancelPayment(orderId);
      success('Dibatalkan', 'Transaksi pembayaran berhasil dibatalkan.');
      await refetch();
    } catch (err: any) {
      toastError('Gagal Batalkan', err?.response?.data?.message || err?.message || 'Gagal membatalkan');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyPaymentNumber = () => {
    if (!payment?.paymentNumber) return;
    navigator.clipboard.writeText(payment.paymentNumber);
    setCopied(true);
    success('Disalin', 'Nomor pembayaran berhasil disalin ke clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const totalAmount = payment?.totalPayment
    ? Number(payment.totalPayment)
    : payment?.amount
    ? Number(payment.amount)
    : 1000;

  const planName = payment?.plan || 'PRO';
  const isVaMethod = payment?.method && payment.method.includes('_va');

  // Calculate validity expiration date (30 days from now)
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + 30);

  // Generate QR Code Source from QRIS raw payload if available
  const qrString = payment?.paymentNumber || payment?.paymentUrl || `RINCI-${orderId || 'ORDER'}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    qrString
  )}`;

  return (
    <div className="payment-page-root">
      {/* Mini Navbar */}
      <header className="checkout-navbar">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-logo" aria-label="Rinci.in Beranda">
            <img src="/logo.png" alt="Rinci.in Logo" className="landing-logo-img" />
            <span>Rinci.in</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck size={16} color="var(--primary-600)" />
            <span>Pakasir Payment Gateway</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="payment-main">
        <div className="payment-container">
          {/* ====================================================
              STATE: PAYMENT PAID (SUCCESS)
          ==================================================== */}
          {status === 'PAID' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="payment-card"
            >
              <div className="payment-success-icon">
                <CheckCircle2 size={36} />
              </div>

              <div className="payment-success-box">
                <h1 className="payment-success-title">Pembayaran Berhasil!</h1>
                <p className="payment-success-desc">
                  Terima kasih! Akun kamu sudah terverifikasi dan paket <strong>{planName}</strong> sudah aktif otomatis.
                </p>
              </div>

              <div className="payment-success-details">
                <div className="payment-success-row">
                  <span>Nomor Pesanan</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>#{orderId}</span>
                </div>
                <div className="payment-success-row">
                  <span>Paket Aktif</span>
                  <span style={{ color: 'var(--primary-600)' }}>Rinci.in {planName}</span>
                </div>
                <div className="payment-success-row">
                  <span>Nominal Terbayar</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="payment-success-row">
                  <span>Status Layanan</span>
                  <span style={{ color: 'var(--success-text)' }}>● Aktif</span>
                </div>
                <div className="payment-success-row">
                  <span>Masa Berlaku Sampai</span>
                  <span>{formatDateId(validityDate)}</span>
                </div>
              </div>

              <div className="payment-actions" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <a
                  href={`https://wa.me/6287848622365?text=${encodeURIComponent("menu")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn-primary btn-lg w-full"
                  style={{
                    justifyContent: "center",
                    backgroundColor: "#25D366",
                    borderColor: "#25D366",
                    color: "#FFFFFF"
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Mulai Chat di WhatsApp Bot</span>
                </a>


                <button
                  type="button"
                  onClick={async () => {
                    setIsOpeningDashboard(true);
                    try {
                      if (orderId) {
                        await loginWithOrder(orderId);
                      }
                    } catch (err) {
                      console.warn("Auto login via orderId skipped:", err);
                    } finally {
                      setIsOpeningDashboard(false);
                      navigate("/dashboard");
                    }
                  }}
                  disabled={isOpeningDashboard}
                  className="landing-btn-secondary btn-lg w-full"
                  style={{ justifyContent: "center" }}
                >
                  <LayoutDashboard size={18} />
                  <span>{isOpeningDashboard ? "Menyiapkan Dashboard..." : "Buka Dashboard Web"}</span>
                  <ArrowRight size={16} />
                </button>

                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", textAlign: "center", marginTop: "var(--space-2)" }}>
                  💡 Kamu dapat langsung chat bot atau login ke Dashboard menggunakan nomor WhatsApp yang terdaftar ({payment?.phone || "kamu"}).
                </p>
              </div>
            </motion.div>

          ) : status === 'EXPIRED' ? (
            /* ====================================================
                STATE: EXPIRED
            ==================================================== */
            <div className="payment-card">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={36} />
              </div>

              <div className="payment-header">
                <h1 className="payment-title">Pembayaran Kedaluwarsa</h1>
                <p className="checkout-subtitle">
                  Batas waktu pembayaran untuk pesanan ini telah habis.
                </p>
              </div>

              <div className="payment-actions">
                <Link to="/#pricing" className="landing-btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}>
                  <span>Pilih Paket Ulang</span>
                </Link>
              </div>
            </div>
          ) : status === 'FAILED' || status === 'CANCELLED' ? (
            /* ====================================================
                STATE: FAILED / CANCELLED
            ==================================================== */
            <div className="payment-card">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {status === 'CANCELLED' ? <XCircle size={36} /> : <AlertCircle size={36} />}
              </div>

              <div className="payment-header">
                <h1 className="payment-title">
                  {status === 'CANCELLED' ? 'Pembayaran Dibatalkan' : 'Pembayaran Gagal'}
                </h1>
                <p className="checkout-subtitle">
                  {error || (status === 'CANCELLED' ? 'Transaksi telah dibatalkan oleh pengguna.' : 'Transaksi tidak dapat diselesaikan. Silakan coba kembali.')}
                </p>
              </div>

              <div className="payment-actions">
                <Link to="/#pricing" className="landing-btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}>
                  <span>Pilih Paket Ulang</span>
                </Link>
              </div>
            </div>
          ) : (
            /* ====================================================
                STATE: PENDING (QRIS / VA PAYMENT)
            ==================================================== */
            <div className="payment-card">
              <div className="payment-header">
                <h1 className="payment-title">
                  {isVaMethod ? 'Transfer Virtual Account' : 'Scan QRIS untuk Membayar'}
                </h1>
                <span className="payment-order-tag">Order #{orderId}</span>
              </div>

              <div className="payment-amount-box">
                <span className="payment-amount-label">Total yang Harus Dibayar</span>
                <span className="payment-amount-val">{formatCurrency(totalAmount)}</span>
                {payment?.fee ? (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    (Termasuk kode unik / fee: {formatCurrency(Number(payment.fee))})
                  </span>
                ) : null}
              </div>

              {/* VA View or QRIS View */}
              {isVaMethod && payment?.paymentNumber ? (
                <div className="va-box flex flex-col items-center gap-3 p-4 my-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '100%' }}>
                  <span className="text-xs text-muted uppercase font-semibold">
                    Nomor Virtual Account ({payment.method?.replace('_va', '').toUpperCase()})
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>
                      {payment.paymentNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPaymentNumber}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Salin Nomor VA"
                    >
                      {copied ? <Check size={18} color="green" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              ) : (
                /* QR Image Box */
                <div className="payment-qr-wrapper">
                  <img
                    src={qrImageSrc}
                    alt="QRIS Pembayaran Rinci.in"
                    className="payment-qr-img"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Dapat discan dengan BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA, LinkAja, dll.
                  </span>
                </div>
              )}

              {/* Status Pill & Countdown */}
              <div className="flex flex-col items-center gap-2">
                <div className="payment-status-pill pending">
                  <span className="payment-pulse-dot" />
                  <span>Menunggu Pembayaran...</span>
                </div>

                <div className="payment-countdown flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>
                    Selesaikan sebelum{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {formatCountdown(timeLeftSeconds)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="payment-actions">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isManualChecking}
                  className="payment-check-btn"
                >
                  <RefreshCw size={16} className={isManualChecking ? 'animate-spin' : ''} />
                  <span>{isManualChecking ? 'Memeriksa...' : 'Saya Sudah Bayar'}</span>
                </button>

                {payment?.paymentUrl && (
                  <a
                    href={payment.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    <span>Buka Halaman Pembayaran Langsung</span>
                    <ExternalLink size={14} />
                  </a>
                )}

                {/* Sandbox / Dev Test Simulation Button */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="landing-btn-ghost text-xs"
                  style={{ justifyContent: 'center', opacity: 0.8 }}
                  title="Simulasi pembayaran berhasil (Sandbox / Testing)"
                >
                  <Zap size={13} />
                  <span>{isSimulating ? 'Memproses Simulasi...' : '⚡ Simulasi Bayar Sukses (Sandbox Test)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelPayment}
                  disabled={isCancelling}
                  className="text-xs text-muted hover:text-danger mt-1 underline"
                >
                  {isCancelling ? 'Membatalkan...' : 'Batalkan Pesanan Ini'}
                </button>

                <p className="payment-help-note">
                  Setelah transaksi berhasil di aplikasi bank/e-wallet kamu, sistem backend akan mendeteksi dan mengaktifkan paketmu secara instan dalam beberapa detik.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
