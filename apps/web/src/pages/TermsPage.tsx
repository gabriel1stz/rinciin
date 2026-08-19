// TermsPage.tsx - Syarat & Ketentuan Rinci.in
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            <FileText size={16} />
            <span>SYARAT & KETENTUAN PENGGUNAAN</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 12px 0' }}>
            Syarat & Ketentuan Layanan Rinci.in
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '14px', margin: 0 }}>
            Terakhir diperbarui: 19 Agustus 2026 • Harap baca dengan saksama sebelum menggunakan layanan kami
          </p>
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
            1. Ketentuan Umum
          </h2>
          <p>
            Dengan mengakses web dashboard atau menggunakan bot WhatsApp Rinci.in, kamu menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Layanan ini ditujukan untuk membantu individu dan pemilik usaha mikro dalam pencatatan dan pengelolaan keuangan secara mandiri.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            2. Akun & Keamanan Akses
          </h2>
          <p>
            Akun Rinci.in terikat pada nomor WhatsApp yang kamu gunakan. Kamu bertanggung jawab penuh untuk menjaga keamanan akses nomor teleponmu dan tidak membagikan kode OTP atau link login kepada pihak lain.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            3. Paket Langganan & Pembayaran
          </h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            <li><strong>Masa Trial Gratis:</strong> Diberikan selama 7 hari untuk nomor baru. Satu nomor hanya berhak atas 1 kali masa trial.</li>
            <li><strong>Paket PRO / Family:</strong> Pembayaran diproses secara instan melalui gateway QRIS resmi. Paket akan langsung aktif otomatis setelah pembayaran terkonfirmasi.</li>
            <li><strong>Kebijakan Pengembalian Dana:</strong> Pembayaran yang telah berhasil diproses bersifat final dan tidak dapat di-refund, kecuali terjadi kesalahan sistem penagihan ganda.</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            4. Batasan Tanggung Jawab
          </h2>
          <p style={{ marginBottom: '24px' }}>
            Rinci.in adalah alat bantu pencatatan dan analisis manajemen keuangan. Kami bukan lembaga keuangan atau penasihat investasi berlisensi. Segala keputusan finansial yang kamu ambil sepenuhnya merupakan tanggung jawab pribadimu.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
            5. Perubahan Ketentuan
          </h2>
          <p style={{ margin: 0 }}>
            Rinci.in berhak memperbarui Syarat dan Ketentuan ini sewaktu-waktu demi peningkatan mutu layanan. Perubahan akan diumumkan melalui dashboard atau pesan WhatsApp resmi.
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
