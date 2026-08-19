// CheckoutPage.tsx - Clean, Trustworthy Plan Checkout Page with Duration Support
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getPlanById,
  calculatePlanPrice,
  BillingDuration,
  formatPlanDuration,
} from '../utils/plans';
import { paymentService } from '../services/payment.service';
import { formatCurrency } from '../utils/currency';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const planId = searchParams.get('plan') || 'pro';
  const rawDuration = (searchParams.get('duration') || '1m') as BillingDuration;
  const duration: BillingDuration = ['1m', '6m', '1y'].includes(rawDuration)
    ? rawDuration
    : '1m';

  const plan = getPlanById(planId);
  const priceInfo = calculatePlanPrice(plan, duration);

  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Prefill phone if user is already authenticated
  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  // Phone input normalizer
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d+]/g, '');
    setPhone(rawVal);
    setPhoneError(null);
    setApiError(null);
  };

  const validatePhone = (val: string): boolean => {
    let clean = val.replace(/\D/g, '');
    if (clean.startsWith('62')) {
      clean = '0' + clean.slice(2);
    }
    if (!clean) {
      setPhoneError('Nomor WhatsApp / HP wajib diisi.');
      return false;
    }
    if (!clean.startsWith('08')) {
      setPhoneError('Nomor HP harus berformat Indonesia diawali 08...');
      return false;
    }
    if (clean.length < 10 || clean.length > 14) {
      setPhoneError('Nomor HP tidak valid (10–14 digit).');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('62')) {
      cleanPhone = '0' + cleanPhone.slice(2);
    }

    if (!validatePhone(cleanPhone)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. TRIAL / FREE FLOW (No Payment Gateway)
      if (plan.id === 'trial' || priceInfo.totalPrice === 0) {
        const res = await paymentService.createPayment({
          phone: cleanPhone,
          plan: 'trial',
          amount: 0,
          method: 'qris',
        });

        success('Trial Berhasil Diaktifkan', 'Selamat menikmati fitur Rinci.in.');
        if (res?.orderId) {
          navigate(`/payment/${res.orderId}`);
        } else {
          navigate('/dashboard');
        }
        return;
      }


      // 2. PAID PLAN FLOW (Create Pakasir Invoice via apps/api)
      const invoice = await paymentService.createPayment({
        phone: cleanPhone,
        plan: plan.id,
        amount: priceInfo.totalPrice,
        method: 'qris',
      });

      if (!invoice || !invoice.orderId) {
        throw new Error('Gagal membuat invoice pembayaran. Silakan coba kembali.');
      }

      success('Invoice Siap', 'Silakan scan QRIS untuk menyelesaikan pembayaran.');
      navigate(`/payment/${invoice.orderId}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Terjadi kesalahan saat memproses pembayaran. Coba lagi.';
      setApiError(msg);
      toastError('Gagal Memproses', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-root">
      {/* Mini Navbar */}
      <header className="checkout-navbar">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-logo" aria-label="Rinci.in Beranda">
            <img src="/logo.png" alt="Rinci.in Logo" className="landing-logo-img" />
            <span>Rinci.in</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck size={16} color="var(--primary-600)" />
            <span>Pembayaran Aman Pakasir</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="checkout-main">
        <div className="checkout-container">
          <Link to="/#pricing" className="checkout-back-link">
            <ArrowLeft size={16} />
            <span>Kembali ke pilihan paket</span>
          </Link>

          <div className="checkout-heading-wrap">
            <h1 className="checkout-title">Konfirmasi & Checkout</h1>
            <p className="checkout-subtitle">
              Selesaikan pesanan kamu untuk mengaktifkan akses finansial Rinci.in
            </p>
          </div>

          {apiError && (
            <div className="alert alert-danger mb-6">
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          <div className="checkout-grid">
            {/* Left: Selected Plan Summary */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">Ringkasan Paket</h2>
              </div>

              <div className="checkout-selected-plan">
                <div>
                  <div className="checkout-plan-name">Paket {plan.name}</div>
                  <div className="checkout-plan-label">{plan.label}</div>
                  <div className="text-xs text-muted mt-1">
                    Durasi: <strong>{formatPlanDuration(duration)}</strong>
                    {priceInfo.discountPct ? (
                      <span className="badge badge-safe ml-2" style={{ fontSize: '10px' }}>
                        Hemat {priceInfo.discountPct}%
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="checkout-plan-price-box">
                  <div className="checkout-plan-price">
                    {priceInfo.totalPrice === 0 ? 'Gratis' : formatCurrency(priceInfo.totalPrice)}
                  </div>
                  <div className="checkout-plan-duration">
                    {priceInfo.months > 1
                      ? `(${formatCurrency(priceInfo.monthlyPrice)}/bln)`
                      : '/ 1 Bulan'}
                  </div>
                </div>
              </div>

              <ul className="checkout-features-list">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="checkout-feature-item">
                    <Check size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="checkout-method-box">
                <div className="checkout-method-info">
                  <span>Metode Pembayaran:</span>
                  <span className="checkout-qris-tag">QRIS (Semua E-Wallet & M-Banking)</span>
                </div>
              </div>
            </div>

            {/* Right: Payment & Identity Form */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">Identitas & Pembayaran</h2>
              </div>

              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="checkout-field">
                  <label htmlFor="phone" className="checkout-label">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="Contoh: 081234567890"
                    className={`checkout-input ${phoneError ? 'has-error' : ''}`}
                    disabled={isSubmitting}
                    autoComplete="tel"
                    required
                  />
                  {phoneError ? (
                    <span className="checkout-error-text">{phoneError}</span>
                  ) : (
                    <span className="checkout-helper">
                      Nomor ini digunakan untuk mengidentifikasi pembayaran dan akun Rinci.in kamu.
                    </span>
                  )}
                </div>

                {/* Summary Lines */}
                <div className="checkout-summary-lines">
                  <div className="checkout-summary-line">
                    <span>
                      Harga Paket ({plan.name} - {formatPlanDuration(duration)})
                    </span>
                    <span>
                      {priceInfo.totalPrice === 0
                        ? 'Rp0'
                        : formatCurrency(priceInfo.totalPrice)}
                    </span>
                  </div>
                  <div className="checkout-summary-line">
                    <span>Biaya Layanan Gateway</span>
                    <span style={{ color: 'var(--success-text)' }}>Gratis (Rp0)</span>
                  </div>
                  <div className="checkout-summary-line total">
                    <span>Total Pembayaran</span>
                    <span style={{ color: 'var(--primary-600)' }}>
                      {priceInfo.totalPrice === 0
                        ? 'Rp0'
                        : formatCurrency(priceInfo.totalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="checkout-submit-btn"
                >
                  {isSubmitting ? (
                    <span>Memproses...</span>
                  ) : priceInfo.totalPrice === 0 ? (
                    <>
                      <span>Mulai Trial Gratis</span>
                      <Zap size={16} />
                    </>
                  ) : (
                    <>
                      <span>Lanjut Bayar via QRIS</span>
                      <Zap size={16} />
                    </>
                  )}
                </button>

                <div className="text-center" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Didukung oleh Pakasir Payment Gateway. Transaksi terenkripsi & aman.
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
