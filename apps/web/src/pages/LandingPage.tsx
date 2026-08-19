// LandingPage.tsx - Rinci.in Public Landing Page
// Complete with Demo Video Section, Fitur Unggulan, Beberapa Fitur Menarik, Coming Soon, 3-Card Dynamic Pricing, and Scroll Animations
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  Check,
  ChevronDown,
  Camera,
  Mic,
  MessageSquare,
  Play,
  Trash2,
  Edit3,
  BarChart3,
  Wallet,
  Users,
  Star,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import {
  PLANS_CATALOG,
  BillingDuration,
  calculatePlanPrice,
} from '../utils/plans';
import { containerStagger, itemFadeUp } from '../motion/variants';

// Smooth Animated Counter component (counts up from 'from' to 'to' when scrolled into view)
const AnimatedCounter: React.FC<{
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}> = ({ from = 1, to, duration = 2.2, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState<number>(from);
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Smooth cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const current = from + (to - from) * easeOut;

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(to);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [inView, from, to, duration]);

  const displayValue =
    decimals > 0
      ? count.toFixed(decimals)
      : Math.floor(count).toLocaleString('id-ID');

  return (
    <span ref={ref} style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums' }}>
      {displayValue}
      {suffix}
    </span>
  );
};

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<BillingDuration>('1m');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Framer Motion Scroll Progress for Navbar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle direct navigation to #pricing section
  useEffect(() => {
    if (window.location.hash === '#pricing' || window.location.search.includes('pricing=true')) {
      const scrollToPricing = () => {
        const el = document.getElementById('pricing');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      // Try immediate and with slight delay for full DOM mount
      scrollToPricing();
      const timer = setTimeout(scrollToPricing, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const faqs = [
    {
      q: 'Apa itu Rinci.in?',
      a: 'Rinci.in adalah platform manajemen keuangan pribadi modern yang dirancang khusus untuk masyarakat Indonesia. Membantu kamu mencatat pemasukan & pengeluaran, mengelola saldo bank serta e-wallet, menetapkan anggaran, hingga menganalisis tren finansial secara otomatis.',
    },
    {
      q: 'Apakah ada masa gratis / trial?',
      a: 'Ya, kamu bisa mencoba paket Free Trial selama 7 hari secara gratis tanpa perlu kartu kredit. Seluruh fitur pencatatan, bot WhatsApp, dan web dashboard dapat langsung kamu gunakan.',
    },
    {
      q: 'Bagaimana metode pembayaran QRIS Pakasir?',
      a: 'Pembayaran dilakukan secara instan melalui scan QRIS resmi dari Pakasir. Kamu bisa menggunakan seluruh mobile banking Indonesia (BCA, Mandiri, BRI, BNI, dll) serta e-wallet (GoPay, OVO, ShopeePay, DANA, LinkAja). Akun akan langsung aktif otomatis setelah pembayaran berhasil diverifikasi.',
    },
    {
      q: 'Bagaimana cara kerja paket Family?',
      a: 'Paket Family memungkinkan hingga 5 anggota keluarga memiliki akun masing-masing dengan opsi shared budget dan shared wallet, serta laporan arus kas keluarga terpadu. Cukup 1 langganan untuk satu keluarga.',
    },
    {
      q: 'Apakah data keuangan saya aman?',
      a: 'Sangat aman. Rinci.in menggunakan enkripsi data tingkat tinggi dan tidak pernah meminta PIN kartu, password m-banking, atau kredensial perbankan sensitif kamu.',
    },
    {
      q: 'Jika butuh bantuan, ke mana saya bisa menghubungi?',
      a: 'Tim support kami siap membantu melalui WhatsApp resmi dan email halo@rinci.in setiap hari kerja pukul 08:00 – 20:00 WIB.',
    },
  ];

  return (
    <div className="landing-page-root">
      {/* Scroll Progress Bar */}
      <motion.div className="landing-scroll-progress" style={{ scaleX }} />

      {/* ----------------------------------------------------
          NAVBAR
      ---------------------------------------------------- */}
      <header className={`landing-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-container landing-nav-inner">
          {/* Logo */}
          <Link to="/" className="landing-logo" aria-label="Rinci.in Beranda">
            <img src="/logo.png" alt="Rinci.in Logo" className="landing-logo-img" />
            <span>Rinci.in</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="landing-nav-links" aria-label="Navigasi Utama">
            <a href="#demo" className="landing-nav-link">Demo</a>
            <a href="#fitur" className="landing-nav-link">Fitur Unggulan</a>
            <a href="#fitur-menarik" className="landing-nav-link">Fitur Menarik</a>
            <a href="#coming-soon" className="landing-nav-link">Coming Soon</a>
            <a href="#pricing" className="landing-nav-link">Harga</a>
            <a href="#faq" className="landing-nav-link">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="landing-nav-actions">
            <a href="#pricing" className="landing-btn-primary">
              <span>Mulai Gratis Sekarang</span>
              <ArrowRight size={14} />
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="landing-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup Menu' : 'Buka Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="landing-mobile-drawer"
            >
              <a href="#demo" onClick={() => setMobileMenuOpen(false)}>Demo Video</a>
              <a href="#fitur" onClick={() => setMobileMenuOpen(false)}>Fitur Unggulan</a>
              <a href="#fitur-menarik" onClick={() => setMobileMenuOpen(false)}>Fitur Menarik</a>
              <a href="#coming-soon" onClick={() => setMobileMenuOpen(false)}>Coming Soon</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Harga</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="landing-mobile-drawer-actions">
                <a
                  href="#pricing"
                  className="landing-btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Mulai Gratis Sekarang
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* ----------------------------------------------------
          HERO SECTION (ASYMMETRICAL LAYOUT)
      ---------------------------------------------------- */}
      <section className="landing-hero">
        {/* Ambient Hero Glows */}
        <div className="landing-hero-ambient-glow glow-top-left" />
        <div className="landing-hero-ambient-glow glow-top-right" />

        <div className="landing-container">
          <div className="landing-hero-grid">
            {/* Left Hero Content */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="show"
              className="landing-hero-content"
            >
              <motion.div variants={itemFadeUp} className="landing-hero-badge-wrap">
                <span className="landing-trusted-pill">
                  <span className="trusted-pulse-dot" />
                  <span>Asisten Finansial Pintar Indonesia</span>
                </span>
              </motion.div>

              <motion.h1 variants={itemFadeUp} className="landing-hero-headline">
                Catat Keuanganmu<br />
                <span className="landing-trusted-highlight">Semudah Kirim Pesan</span> & Transaksi
              </motion.h1>

              <motion.p variants={itemFadeUp} className="landing-hero-copy">
                Nyatat keuangan cukup dari transaksi harian, voice note, hingga scan foto struk nota belanja. Semua tersusun rapi otomatis tanpa spreadsheet ribet.
              </motion.p>


              <motion.div variants={itemFadeUp} className="landing-hero-actions-wrap">
                <div className="landing-hero-actions">
                  <a href="#pricing" className="landing-btn-primary btn-lg">
                    <span>Mulai Gratis Sekarang</span>
                    <ArrowRight size={16} />
                  </a>

                  <a href="#demo" className="landing-btn-secondary btn-lg">
                    <Play size={16} />
                    <span>Tonton Demo</span>
                  </a>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-muted mt-2">
                  <span className="flex items-center gap-1">
                    <Check size={14} color="var(--primary-600)" /> Tanpa Biaya Setup
                  </span>
                  <span className="flex items-center gap-1">
                    <Check size={14} color="var(--primary-600)" /> Tanpa Kartu Kredit
                  </span>
                  <span className="flex items-center gap-1">
                    <Check size={14} color="var(--primary-600)" /> Akses Instan
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Hero Product Visual Preview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="landing-product-preview-wrapper"
            >
              <div className="landing-preview-card">
                {/* Preview Topbar */}
                <div className="landing-preview-header">
                  <div className="landing-preview-user">
                    <div className="landing-preview-avatar">R</div>
                    <div className="landing-preview-user-text">
                      <h4>Laporan Keuangan</h4>
                      <p>Periode: Agustus 2026</p>
                    </div>
                  </div>
                  <span className="landing-badge-status">● Realtime Sync</span>
                </div>

                {/* Preview 4-Stat Metric Row */}
                <div className="landing-preview-stats">
                  <div className="landing-preview-stat-box">
                    <span className="landing-preview-stat-label">Total Saldo</span>
                    <span className="landing-preview-stat-value">{formatCurrency(12450000)}</span>
                  </div>
                  <div className="landing-preview-stat-box">
                    <span className="landing-preview-stat-label">Pemasukan</span>
                    <span className="landing-preview-stat-value is-income">+{formatCurrency(8500000)}</span>
                  </div>
                  <div className="landing-preview-stat-box">
                    <span className="landing-preview-stat-label">Pengeluaran</span>
                    <span className="landing-preview-stat-value is-expense">-{formatCurrency(4200000)}</span>
                  </div>
                  <div className="landing-preview-stat-box">
                    <span className="landing-preview-stat-label">Tabungan</span>
                    <span className="landing-preview-stat-value is-savings">+{formatCurrency(4300000)}</span>
                  </div>
                </div>

                {/* Preview Mid Grid (Chart & Wallets) */}
                <div className="landing-preview-mid-grid">
                  {/* Cashflow Chart Mini */}
                  <div className="landing-preview-panel">
                    <div className="landing-preview-panel-title">
                      <span>Arus Kas 7 Hari</span>
                      <span style={{ fontSize: '10px', color: 'var(--primary-600)' }}>Minggu Ini</span>
                    </div>
                    <div className="landing-chart-bars">
                      {[
                        { day: 'Sen', inc: 32, exp: 18 },
                        { day: 'Sel', inc: 10, exp: 28 },
                        { day: 'Rab', inc: 48, exp: 20 },
                        { day: 'Kam', inc: 15, exp: 35 },
                        { day: 'Jum', inc: 25, exp: 22 },
                        { day: 'Sab', inc: 12, exp: 15 },
                        { day: 'Min', inc: 10, exp: 10 },
                      ].map((item) => (
                        <div key={item.day} className="landing-chart-col">
                          <div className="landing-chart-col-bars">
                            <div className="landing-bar bar-income" style={{ height: `${item.inc}px` }} />
                            <div className="landing-bar bar-expense" style={{ height: `${item.exp}px` }} />
                          </div>
                          <span className="landing-chart-day">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Wallets Mini */}
                  <div className="landing-preview-panel">
                    <div className="landing-preview-panel-title">
                      <span>Dompet</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>3 Sumber</span>
                    </div>
                    <div className="landing-mini-wallet-list">
                      <div className="landing-mini-wallet-item">
                        <span>🏦 BCA</span>
                        <span>{formatCurrency(7250000)}</span>
                      </div>
                      <div className="landing-mini-wallet-item">
                        <span>📱 GoPay</span>
                        <span>{formatCurrency(850000)}</span>
                      </div>
                      <div className="landing-mini-wallet-item">
                        <span>💵 Cash</span>
                        <span>{formatCurrency(1200000)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Recent Transactions Mini */}
                <div className="landing-preview-panel">
                  <div className="landing-preview-panel-title">
                    <span>Transaksi Terakhir</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hari ini</span>
                  </div>
                  <div className="landing-preview-tx-list">
                    <div className="landing-preview-tx-item">
                      <div className="landing-tx-left">
                        <div className="landing-tx-icon expense">
                          <ArrowDownRight size={12} />
                        </div>
                        <div>
                          <div className="landing-tx-name">Makan siang (GoPay)</div>
                          <div className="landing-tx-cat">Makanan & Minuman</div>
                        </div>
                      </div>
                      <div className="landing-tx-amount expense">
                        -{formatCurrency(35000)}
                      </div>
                    </div>

                    <div className="landing-preview-tx-item">
                      <div className="landing-tx-left">
                        <div className="landing-tx-icon income">
                          <ArrowUpRight size={12} />
                        </div>
                        <div>
                          <div className="landing-tx-name">Gaji Masuk (BCA)</div>
                          <div className="landing-tx-cat">Pendapatan Tetap</div>
                        </div>
                      </div>
                      <div className="landing-tx-amount income">
                        +{formatCurrency(8500000)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          STATS & SOCIAL PROOF STRIP (LUXURY GLASS CARD)
      ---------------------------------------------------- */}
      <section className="landing-trusted-wrapper">
        <div className="landing-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="landing-trusted-card"
          >
            {/* Ambient Background Glows */}
            <div className="landing-trusted-ambient-glow glow-left" />
            <div className="landing-trusted-ambient-glow glow-right" />

            {/* Pill Badge */}
            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>Dipercaya Pengguna</span>
              </span>
            </div>

            {/* Title */}
            <h2 className="landing-trusted-title">
              Ribuan Pengguna Telah <span className="landing-trusted-highlight">Mengelola Keuangan Lebih Cerdas</span>
            </h2>

            {/* Subtitle */}
            <p className="landing-trusted-subtitle">
              Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan pencatatan finansial otomatis lewat WhatsApp
            </p>

            {/* 3 Stat Columns (Luxury Glass Cards) */}
            <div className="landing-trusted-stats-grid">
              {/* Stat 1: Active Users */}
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="landing-stat-card-luxury"
              >
                <div className="landing-stat-icon-badge badge-users">
                  <Users size={26} strokeWidth={2.4} />
                </div>
                <div className="landing-trusted-number">
                  <AnimatedCounter from={1} to={50} duration={1.8} />
                </div>
                <div className="landing-trusted-label">Pengguna Aktif</div>
                <div className="landing-stat-subtag">
                  <span className="subtag-dot green" />
                  <span>Terverifikasi & Aktif</span>
                </div>
              </motion.div>

              {/* Stat 2: Messages Sent */}
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="landing-stat-card-luxury"
              >
                <div className="landing-stat-icon-badge badge-chat">
                  <MessageSquare size={26} strokeWidth={2.4} />
                </div>
                <div className="landing-trusted-number">
                  <AnimatedCounter from={100} to={1568} duration={2.2} />
                </div>
                <div className="landing-trusted-label">Pesan Terkirim</div>
                <div className="landing-stat-subtag">
                  <span className="subtag-dot blue" />
                  <span>Sinkronisasi Realtime</span>
                </div>
              </motion.div>

              {/* Stat 3: Customer Satisfaction */}
              <motion.div
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="landing-stat-card-luxury is-featured"
              >
                <div className="landing-stat-icon-badge badge-star">
                  <Star size={26} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1.8} />
                </div>
                <div className="landing-trusted-number is-highlight">
                  <AnimatedCounter from={1} to={98} suffix="%" duration={2} />
                </div>
                <div className="landing-trusted-label">Tingkat Kepuasan</div>
                <div className="landing-stat-subtag">
                  <span className="star-rating">★★★★★</span>
                  <span>Rating 4.9 / 5.0</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* ----------------------------------------------------
          SECTION — DEMO VIDEO SECTION
      ---------------------------------------------------- */}
      <section id="demo" className="landing-demo-section">
        <div className="landing-container">
          <div className="landing-section-header-center">
            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>Demo Interaktif</span>
              </span>
            </div>
            <h2 className="landing-statement-heading">
              Lihat Betapa Mudahnya <span className="landing-trusted-highlight">Menggunakan Rinci.in</span>
            </h2>
            <p className="landing-feature-copy" style={{ margin: '0.5rem auto 0', textAlign: 'center' }}>
              Tonton demonstrasi lengkap bagaimana transaksi harian dicatat, dianalisis, dan disusun otomatis.
            </p>
          </div>

          <div className="landing-video-frame">
            <div className="landing-video-topbar">
              <span className="landing-video-dot red" />
              <span className="landing-video-dot yellow" />
              <span className="landing-video-dot green" />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                rinci.in/demo-preview
              </span>
            </div>

            <div className="landing-video-content-area">
              <video
                ref={videoRef}
                controls={isVideoPlaying}
                className="landing-video-element"
                playsInline
                preload="metadata"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                <source src="/IMG_2594.MP4" type="video/mp4" />
                <source src="/video_sample.mp4" type="video/mp4" />
                Browser kamu tidak mendukung pemutaran video tag.
              </video>

              {!isVideoPlaying && (
                <div
                  className="landing-video-overlay-placeholder"
                  onClick={handlePlayVideo}
                  style={{ cursor: 'pointer' }}
                >
                  <button
                    type="button"
                    onClick={handlePlayVideo}
                    className="landing-video-play-btn"
                    aria-label="Putar Video Demo"
                  >
                    <Play size={28} style={{ marginLeft: '4px' }} />
                  </button>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '8px' }}>
                    Klik untuk Memutar Demo
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ----------------------------------------------------
          SECTION — FITUR UNGGULAN (TIGA CARA MUDAH CATAT KEUANGAN)
      ---------------------------------------------------- */}
      <section id="fitur" className="landing-product-section">
        <div className="landing-container">
          <div className="landing-pricing-header">
            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>3 Metode Pintar</span>
              </span>
            </div>
            <h2 className="landing-statement-heading">
              Tiga Cara Mudah <span className="landing-trusted-highlight">Catat Keuangan</span>
            </h2>
            <p className="landing-feature-copy" style={{ margin: '0.5rem auto 0', textAlign: 'center' }}>
              Pilih cara yang paling nyaman untukmu. Semua tercatat otomatis ke dashboard Rinci.in.
            </p>
          </div>

          <div className="landing-features-three-grid">
            {/* 1. Text */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="landing-feature-card-luxury"
            >
              <div className="landing-stat-icon-badge badge-users" style={{ marginBottom: '1rem' }}>
                <MessageSquare size={26} strokeWidth={2.4} />
              </div>
              <h3 className="landing-pricing-name" style={{ fontSize: '1.25rem' }}>1. Tinggal Chat Saja</h3>
              <p className="landing-feature-copy" style={{ fontSize: 'var(--font-size-sm)' }}>
                Ketik santai seperti chat dengan teman, asisten Rinci langsung memahami dan mencatat pengeluaranmu secara cerdas.
              </p>
              <div className="landing-feature-sample-box">
                <span className="sample-label">Contoh:</span>
                <span className="sample-text">"makan siang 35rb di gopay"</span>
              </div>
            </motion.div>

            {/* 2. Voice */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="landing-feature-card-luxury is-featured"
            >
              <div className="flex items-center justify-between" style={{ width: '100%', marginBottom: '1rem' }}>
                <div className="landing-stat-icon-badge badge-chat" style={{ marginBottom: 0 }}>
                  <Mic size={26} strokeWidth={2.4} />
                </div>
                {/* Live Soundwave Pulse */}
                <div className="landing-soundwave-box">
                  <span className="landing-sound-bar" />
                  <span className="landing-sound-bar" />
                  <span className="landing-sound-bar" />
                  <span className="landing-sound-bar" />
                  <span className="landing-sound-bar" />
                  <span className="landing-sound-bar" />
                </div>
              </div>
              <h3 className="landing-pricing-name" style={{ fontSize: '1.25rem' }}>2. Kirim Voice Note</h3>
              <p className="landing-feature-copy" style={{ fontSize: 'var(--font-size-sm)' }}>
                Lagi di jalan atau malas ngetik? Sebut nominal belanjamu lewat pesan suara, AI kami mentranskripsikannya otomatis.
              </p>
              <div className="landing-feature-sample-box voice-box">
                <span className="badge badge-safe" style={{ fontSize: '10px' }}>● 0:03</span>
                <span className="sample-text">"Beli bensin 50 ribu cash"</span>
              </div>
            </motion.div>

            {/* 3. OCR Struk */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="landing-feature-card-luxury"
            >
              <div className="landing-stat-icon-badge badge-star" style={{ marginBottom: '1rem' }}>
                <Camera size={26} strokeWidth={2.4} />
              </div>
              <h3 className="landing-pricing-name" style={{ fontSize: '1.25rem' }}>3. Foto Struk Belanja</h3>
              <p className="landing-feature-copy" style={{ fontSize: 'var(--font-size-sm)' }}>
                Punya struk belanjaan supermarket atau nota restoran panjang? Foto struknya dan biarkan OCR mencatat item per item.
              </p>
              <div className="landing-ocr-receipt-box">
                <div className="landing-ocr-scan-line" />
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  🧾 <strong>Indomaret</strong> • Susu, Roti, Kopi → <strong style={{ color: '#059669' }}>Rp48.500</strong>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          SECTION — BEBERAPA FITUR MENARIK
      ---------------------------------------------------- */}
      <section id="fitur-menarik" className="landing-product-section" style={{ backgroundColor: 'transparent' }}>
        <div className="landing-container">
          <div className="landing-pricing-header">
            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>Kontrol Penuh</span>
              </span>
            </div>
            <h2 className="landing-statement-heading">
              Beberapa <span className="landing-trusted-highlight">Fitur Menarik</span>
            </h2>
            <p className="landing-feature-copy" style={{ margin: '0.5rem auto 0', textAlign: 'center' }}>
              Fleksibilitas tinggi untuk mengatur, mengoreksi, dan mengekspor seluruh data keuanganmu.
            </p>
          </div>

          <div className="landing-features-four-grid">
            {/* Fitur 1 */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="landing-feature-card-luxury"
            >
              <div className="landing-stat-icon-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', width: '48px', height: '48px', marginBottom: '1rem' }}>
                <Trash2 size={22} />
              </div>
              <h3 className="landing-pricing-name" style={{ fontSize: '1.125rem' }}>Hapus Transaksi Seketika</h3>
              <p className="landing-feature-copy" style={{ fontSize: 'var(--font-size-xs)' }}>
                Salah catat? Cukup klik hapus atau ketik "hapus transaksi terakhir", saldo dan budgetmu langsung kembali seimbang.
              </p>
            </motion.div>

            {/* Fitur 2 */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="landing-feature-card-luxury"
            >
              <div className="landing-stat-icon-badge badge-users" style={{ width: '48px', height: '48px', marginBottom: '1rem' }}>
                <Edit3 size={22} />
              </div>
              <h3 className="landing-pricing-name" style={{ fontSize: '1.125rem' }}>Ubah Data & Kategori</h3>
              <p className="landing-feature-copy" style={{ fontSize: 'var(--font-size-xs)' }}>
                Koreksi nominal, ganti sumber dompet, atau pindahkan kategori pengeluaran kapan saja tanpa ribet.
              </p>
            </motion.div>

            {/* Fitur 3 */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="landing-feature-card-luxury"
            >
              <div className="landing-stat-icon-badge badge-chat" style={{ width: '48px', height: '48px', marginBottom: '1rem' }}>
                <BarChart3 size={22} />
              </div>
              <h3 className="landing-pricing-name" style={{ fontSize: '1.125rem' }}>Laporan & Grafik Realtime</h3>
              <p className="landing-feature-copy" style={{ fontSize: 'var(--font-size-xs)' }}>
                Melihat tren mingguan, bulanan, rasio tabungan, dan persentase pengeluaran terbesar dalam visual interaktif.
              </p>
            </motion.div>

            {/* Fitur 4 */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="landing-feature-card-luxury"
            >
              <div className="landing-stat-icon-badge badge-star" style={{ width: '48px', height: '48px', marginBottom: '1rem' }}>
                <Wallet size={22} />
              </div>
              <h3 className="landing-pricing-name" style={{ fontSize: '1.125rem' }}>Multi-Wallet Terpadu</h3>
              <p className="landing-feature-copy" style={{ fontSize: 'var(--font-size-xs)' }}>
                Kelola saldo BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, hingga uang tunai dalam satu pandangan jelas.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          SECTION — COMING SOON ROADMAP
      ---------------------------------------------------- */}
      <section id="coming-soon" className="landing-coming-soon-section">
        <div className="landing-container">
          <div className="landing-pricing-header">
            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>Roadmap Inovasi</span>
              </span>
            </div>
            <h2 className="landing-statement-heading">
              Fitur yang Segera Hadir <span className="landing-trusted-highlight">(Coming Soon)</span>
            </h2>
            <p className="landing-feature-copy" style={{ margin: '0.5rem auto 0', textAlign: 'center' }}>
              Kami terus mengembangkan inovasi teknologi untuk memudahkan pengelolaan finansialmu.
            </p>
          </div>

          <div className="landing-coming-soon-grid">
            <div className="landing-coming-card-luxury">
              <span className="landing-coming-tag-luxury">Segera Hadir</span>
              <h3 className="landing-coming-title">🏦 Integrasi Bank Otomatis</h3>
              <p className="landing-coming-desc">
                Sinkronisasi mutasi rekening bank secara langsung dan terenkripsi menggunakan Open Finance API.
              </p>
            </div>

            <div className="landing-coming-card-luxury">
              <span className="landing-coming-tag-luxury">Segera Hadir</span>
              <h3 className="landing-coming-title">🌐 Multi-Currency & Valas</h3>
              <p className="landing-coming-desc">
                Dukungan mata uang asing (USD, SGD, EUR, JPY) dengan konversi kurs realtime untuk kebutuhan traveling & investasi.
              </p>
            </div>

            <div className="landing-coming-card-luxury">
              <span className="landing-coming-tag-luxury">Segera Hadir</span>
              <h3 className="landing-coming-title">📞 AI Voice Call Advisor</h3>
              <p className="landing-coming-desc">
                Konsultasi evaluasi keuangan bulanan melalui panggilan suara langsung dengan asisten kecerdasan buatan Rinci.
              </p>
            </div>

            <div className="landing-coming-card-luxury">
              <span className="landing-coming-tag-luxury">Segera Hadir</span>
              <h3 className="landing-coming-title">👥 Split Bill QR Otomatis</h3>
              <p className="landing-coming-desc">
                Bagi tagihan makan atau nongkrong bareng teman dan generate QR pembayaran instan per orang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          SECTION 06 — PRICING (3 CORE PLANS + DURATION TOGGLE)
      ---------------------------------------------------- */}
      <section id="pricing" className="landing-pricing-section">
        <div className="landing-container">
          <div className="landing-pricing-header">
            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>Harga Transparan</span>
              </span>
            </div>
            <h2 className="landing-statement-heading" style={{ margin: '0 auto var(--space-3)' }}>
              Pilih Paket <span className="landing-trusted-highlight">Terbaik Untukmu</span>
            </h2>
            <p className="landing-feature-copy" style={{ margin: '0 auto', textAlign: 'center', maxWidth: '580px' }}>
              Mulai gratis, upgrade kapan saja saat kebutuhan finansialmu bertambah.
            </p>
          </div>

          {/* Duration Selector Toggle */}
          <div className="landing-duration-wrapper">
            <div className="landing-duration-pills">
              <button
                type="button"
                className={`landing-duration-btn ${selectedDuration === '1m' ? 'active' : ''}`}
                onClick={() => setSelectedDuration('1m')}
              >
                1 Bulan
              </button>
              <button
                type="button"
                className={`landing-duration-btn ${selectedDuration === '6m' ? 'active' : ''}`}
                onClick={() => setSelectedDuration('6m')}
              >
                <span>6 Bulan</span>
                <span className="landing-duration-discount">Hemat 20%</span>
              </button>
              <button
                type="button"
                className={`landing-duration-btn ${selectedDuration === '1y' ? 'active' : ''}`}
                onClick={() => setSelectedDuration('1y')}
              >
                <span>1 Tahun</span>
                <span className="landing-duration-discount">Hemat 35%</span>
              </button>
            </div>
          </div>

          {/* 3 Core Pricing Cards Grid */}
          <div className="landing-pricing-grid">
            {PLANS_CATALOG.map((plan) => {
              const isPopular = plan.id === 'pro';
              const priceInfo = calculatePlanPrice(plan, selectedDuration);

              const currentTier = (user?.tier || '').toUpperCase();
              const isCurrentPlan =
                (plan.id === 'pro' && (currentTier === 'PRO' || currentTier === 'PERSONAL')) ||
                (plan.id === 'family' && (currentTier === 'FAMILY' || currentTier === 'PREMIUM')) ||
                (plan.id === 'trial' && currentTier === 'TRIAL');

              let ctaLabel = plan.ctaText;
              let isCtaDisabled = false;

              if (isAuthenticated && isCurrentPlan) {
                ctaLabel = 'Plan Saat Ini';
                isCtaDisabled = true;
              } else if (isAuthenticated && (currentTier === 'PRO' || currentTier === 'PERSONAL') && plan.id === 'family') {
                ctaLabel = 'Upgrade ke Family';
              }

              const handlePlanClick = () => {
                if (isCtaDisabled) return;
                if (plan.id === 'trial') {
                  const token = Math.random().toString(36).substring(2, 8).toUpperCase();
                  const waUrl = `https://wa.me/6287848622365?text=${encodeURIComponent(`AKTIFKAN TRIAL-${token}`)}`;
                  window.open(waUrl, '_blank');
                } else {
                  navigate(`/checkout?plan=${plan.id}&duration=${selectedDuration}`);
                }
              };

              return (
                <div
                  key={plan.id}
                  className={`landing-pricing-card ${isPopular ? 'is-popular' : ''}`}
                >
                  {isPopular && (
                    <span className="landing-popular-badge">Paling Populer</span>
                  )}

                  <div>
                    <div className="landing-pricing-top">
                      <h3 className="landing-pricing-name">{plan.name}</h3>
                      <p className="landing-pricing-label">{plan.label}</p>

                      <div className="landing-pricing-price-box">
                        {priceInfo.originalMonthlyPrice && (
                          <span className="landing-pricing-strikethrough">
                            {formatCurrency(priceInfo.originalMonthlyPrice)}
                          </span>
                        )}
                        <div className="landing-pricing-price-row">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={priceInfo.monthlyPrice}
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.2 }}
                              className="landing-pricing-price"
                            >
                              {priceInfo.monthlyPrice === 0
                                ? 'GRATIS'
                                : formatCurrency(priceInfo.monthlyPrice)}
                            </motion.span>
                          </AnimatePresence>
                          <span className="landing-pricing-period">
                            {priceInfo.monthlyPrice === 0 ? '' : `/ ${priceInfo.periodLabel}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ul className="landing-pricing-features">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="landing-pricing-feature-item">
                          <Check size={14} className="landing-pricing-feature-icon" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="landing-pricing-cta-wrap">
                    <button
                      type="button"
                      onClick={handlePlanClick}
                      disabled={isCtaDisabled}
                      className={`landing-pricing-cta-btn ${
                        isPopular ? 'landing-btn-primary' : 'landing-btn-secondary'
                      } ${isCtaDisabled ? 'disabled' : ''}`}
                    >
                      {ctaLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          SECTION 07 — FAQ (PERTANYAAN YANG SERING DIAJUKAN)
      ---------------------------------------------------- */}
      <section id="faq" className="landing-faq-section">
        <div className="landing-container">
          <div className="landing-faq-header">
            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>Pusat Bantuan & FAQ</span>
              </span>
            </div>
            <h2 className="landing-statement-heading">
              Pertanyaan yang <span className="landing-trusted-highlight">Sering Diajukan</span>
            </h2>
          </div>

          <div className="landing-faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`landing-faq-item-luxury ${isOpen ? 'is-active' : ''}`}>
                  <button
                    type="button"
                    className="landing-faq-trigger-luxury"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={20} className={`landing-faq-icon ${isOpen ? 'open' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="landing-faq-body-luxury"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ----------------------------------------------------
          FINAL CTA SECTION (LUXURY BANNER)
      ---------------------------------------------------- */}
      <section className="landing-final-cta-section">
        <div className="landing-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="landing-cta-box-luxury"
          >
            {/* Ambient Glows */}
            <div className="landing-trusted-ambient-glow glow-left" />
            <div className="landing-trusted-ambient-glow glow-right" />

            <div className="landing-trusted-badge-wrap">
              <span className="landing-trusted-pill">
                <span className="trusted-pulse-dot" />
                <span>Mulai Langkah Pertamamu</span>
              </span>
            </div>

            <h2 className="landing-cta-headline">
              Mulai Rapikan Keuanganmu <span className="landing-trusted-highlight">Hari Ini</span>.
            </h2>
            <p className="landing-cta-copy">
              Mulai dari satu transaksi di WhatsApp. Pelan-pelan sampai semuanya lebih jelas, teratur, dan terkontrol.
            </p>

            <div className="landing-cta-action-group">
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <a href="#pricing" className="landing-btn-primary btn-lg">
                  <span>Mulai Sekarang</span>
                  <ArrowRight size={16} />
                </a>

                <a href="#pricing" className="landing-btn-secondary btn-lg">
                  <span>Lihat Pilihan Paket</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ----------------------------------------------------
          FOOTER
      ---------------------------------------------------- */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            {/* Brand Column */}
            <div className="landing-footer-brand">
              <Link to="/" className="landing-logo">
                <img src="/logo.png" alt="Rinci.in" className="landing-logo-img" />
                <span>Rinci.in</span>
              </Link>
              <p className="landing-footer-slogan">
                "Uangmu, akhirnya kelihatan jelas."
              </p>
            </div>

            {/* Links: Produk */}
            <div className="landing-footer-col">
              <span className="landing-footer-col-title">Produk</span>
              <ul className="landing-footer-link-list">
                <li><a href="#demo">Demo Video</a></li>
                <li><a href="#fitur">Fitur Unggulan</a></li>
                <li><a href="#fitur-menarik">Fitur Menarik</a></li>
                <li><a href="#coming-soon">Coming Soon</a></li>
                <li><a href="#pricing">Harga</a></li>
              </ul>
            </div>

            {/* Links: Bantuan */}
            <div className="landing-footer-col">
              <span className="landing-footer-col-title">Bantuan</span>
              <ul className="landing-footer-link-list">
                <li><a href="#faq">Pusat Bantuan</a></li>
                <li><a href="mailto:halo@rinci.in">Kontak Tim Rinci</a></li>
              </ul>
            </div>

            {/* Links: Legal */}
            <div className="landing-footer-col">
              <span className="landing-footer-col-title">Legal</span>
              <ul className="landing-footer-link-list">
                <li><Link to="/settings">Privasi Data</Link></li>
                <li><Link to="/settings">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="landing-footer-bottom">
            <span>© 2026 Rinci.in. Hak cipta dilindungi.</span>
            <span>Dibuat dengan bangga untuk Indonesia.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
