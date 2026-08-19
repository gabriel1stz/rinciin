// PrivacyPolicyPage.tsx - Kebijakan Privasi Rinci.in
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, EyeOff, Server } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, #f8fafc)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--primary-500, #10b981)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '32px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header Title Card */}
        <div
          style={{
            background: 'var(--bg-card, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '20px',
            padding: '36px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={16} />
            <span>KOMITMEN KEAMANAN & PRIVASI</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 12px 0' }}>
            Kebijakan Privasi Rinci.in
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px', margin: 0 }}>
            Terakhir diperbarui: 19 Agustus 2026 • Berlaku untuk seluruh pengguna aplikasi dan bot WhatsApp Rinci.in
          </p>
        </div>

        {/* Security Highlights Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div style={{ background: 'var(--bg-card, #1e293b)', border: '1px solid var(--border-color, #334155)', padding: '20px', borderRadius: '14px' }}>
            <Lock size={22} color="#10b981" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Enkripsi Standar Industri</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
              Data transaksi dan profil disimpan dengan enkripsi aman di basis data PostgreSQL.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card, #1e293b)', border: '1px solid var(--border-color, #334155)', padding: '20px', borderRadius: '14px' }}>
            <EyeOff size={22} color="#3b82f6" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Tidak Menjual Data</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
              Kami tidak pernah dan tidak akan pernah menjual atau membagikan catatan keuanganmu ke pihak ketiga.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card, #1e293b)', border: '1px solid var(--border-color, #334155)', padding: '20px', borderRadius: '14px' }}>
            <Server size={22} color="#f59e0b" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Kontrol Penuh Pengguna</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
              Kamu bebas mengedit, mengekspor ke format CSV, atau menghapus data keuanganmu kapan saja.
            </div>
          </div>
        </div>

        {/* Content Clauses */}
        <div
          style={{
            background: 'var(--bg-card, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '20px',
            padding: '36px',
            fontSize: '14px',
            lineHeight: 1.8,
            color: 'var(--text-secondary, #cbd5e1)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', marginTop: 0 }}>
            1. Informasi yang Kami Kumpulkan
          </h2>
          <p>
            Rinci.in mengumpulkan informasi yang kamu berikan secara langsung saat berinteraksi dengan layanan kami, mencakup:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li><strong>Identitas Akun:</strong> Nomor telepon WhatsApp, nama tampilan, dan alamat email (opsional).</li>
            <li><strong>Data Transaksi:</strong> Nominal, kategori, nama dompet/rekening, tanggal, dan catatan pengeluaran/pemasukan yang kamu kirimkan via WhatsApp atau Dashboard.</li>
            <li><strong>Bukti Struk (OCR):</strong> Gambar nota atau struk yang kamu unggah untuk dianalisis oleh asisten AI kami.</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            2. Cara Kami Menggunakan Informasi Anda
          </h2>
          <p>
            Informasi yang dikumpulkan hanya digunakan untuk keperluan fungsional operasional:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li>Menyusun pembukuan otomatis dan menghitung saldo dompet serta sisa anggaran bulananmu.</li>
            <li>Memberikan insight dan analisis cerdas melalui AI Asisten Finansial.</li>
            <li>Mengirimkan konfirmasi status transaksi, pengingat pencatatan, dan notifikasi paket langganan via WhatsApp.</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            3. Keamanan Data & Kerahasiaan
          </h2>
          <p style={{ marginBottom: '24px' }}>
            Kami menerapkan protokol keamanan berlapis, termasuk pembatasan akses token sesi (JWT Session Validation), perlindungan rate limiting, dan penyimpanan data terisolasi untuk memastikan catatan keuanganmu tetap privat dan aman dari pihak luar.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            4. Hak dan Kontrol Pengguna
          </h2>
          <p style={{ marginBottom: '24px' }}>
            Kamu memiliki hak penuh untuk meminta salinan data (Export CSV) atau mengajukan penghapusan akun beserta seluruh riwayat transaksi secara permanen melalui menu Pengaturan akun atau dengan menghubungi tim kami.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            5. Kontak & Pertanyaan
          </h2>
          <p style={{ margin: 0 }}>
            Jika memiliki pertanyaan atau kendala seputar privasi data, silakan hubungi tim kami via email di{' '}
            <a href="mailto:halo@rinci.in" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
              halo@rinci.in
            </a>.
          </p>
        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', marginTop: '36px', color: 'var(--text-muted, #94a3b8)', fontSize: '12px' }}>
          © 2026 Rinci.in. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </div>
    </div>
  );
};
