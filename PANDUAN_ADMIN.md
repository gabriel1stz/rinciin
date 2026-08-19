# 🛡️ PANDUAN LENGKAP ADMINISTRATOR & OWNER — RINCI.IN
> **Panel Kontrol & Manajemen Server Rinci.in**  
> **Link Portal Admin:** [https://rinciin.my.id/admin/login](https://rinciin.my.id/admin/login)

---

## 1. 🔑 Akses Portal Admin
- **URL Admin:** **[https://rinciin.my.id/admin/login](https://rinciin.my.id/admin/login)**
- Masuk menggunakan nomor admin terdaftar dan password admin master.

---

## 2. 👥 Manajemen Pengguna & Paket Langganan
- **Mencari Pengguna:** Masukkan nomor WhatsApp atau nama di kolom pencarian.
- **Ubah Tier Pengguna Secara Manual:**
  1. Klik ikon **Edit (Pensil)** pada baris pengguna.
  2. Pilih Tier: `FREE`, `TRIAL`, `PRO`, atau `FAMILY`.
  3. Beri tanda centang pada **`Lifetime Access`** jika ingin memberikan akses seumur hidup tanpa batas masa aktif (misal akun owner atau tester VIP).
  4. Klik **Simpan**.

---

## 3. 🌐 Live Monitoring IP Pengguna & Kontrol Keamanan (Anti-Abuse)
- Buka tab **Keamanan & Sesi (Security)** di Admin Dashboard.
- Sistem menampilkan:
  - **Alamat IP Asli Pengguna (*Real Client IP*)**
  - **Browser & Sistem Operasi Pengguna**
  - **Waktu Login & Token Sesi Aktif**
- **Fitur Kick / Putus Sesi Sekali Klik:**
  - Jika ada pengguna yang dicurigai melakukan aktivitas abnormal / spam / pembajakan, klik tombol merah **`Kick / Putus Sesi`**.
  - Sesi login pengguna tersebut akan langsung hangus dan ditendang dari sistem seketika.

---

## 4. 💳 Integrasi Pembayaran Otomatis QRIS & Anti-Fraud (Pakasir Gateway)
- Pembayaran langganan terhubung otomatis ke gateway **Pakasir** dengan QRIS Dinamis.
- **Durasi Langganan Fleksibel:**
  - `1 Bulan` $\rightarrow$ Menambah masa aktif +30 hari
  - `6 Bulan` $\rightarrow$ Menambah masa aktif +180 hari
  - `12 Bulan` $\rightarrow$ Menambah masa aktif +365 hari
  - `Lifetime` $\rightarrow$ Masa aktif tak terbatas (Tahun 2099)
- **Anti-Fraud Verification:** Setiap webhook pembayaran masuk akan diverifikasi silang langsung ke server gateway untuk mencegah injeksi pembayaran palsu.

---

## 5. 🤖 Maintenance Bot WhatsApp
- Layanan bot berjalan 24 jam nonstop via Railway.
- Jika bot sewaktu-waktu terputus dari WhatsApp:
  1. Buka Admin Portal $\rightarrow$ Menu Bot Health / WhatsApp Status.
  2. Scan ulang QR Code jika status koneksi meminta pairing ulang.

---

## 6. ⚙️ Konfigurasi Environment Variables Produksi (Railway & Vercel)
Berikut konfigurasi standar server produksi:

```env
# Domain & URL Resmi
WEB_URL=https://rinciin.my.id
FRONTEND_URL=https://rinciin.my.id
WEB_LOGIN_URL=https://rinciin.my.id/login
PRICING_URL=https://rinciin.my.id/#pricing

# Keamanan Token
JWT_SECRET=rinciin-super-secret-key-2026
JWT_INTERNAL_SECRET=rinciin-internal-super-secret-key-2026

# Gateway Pembayaran Pakasir
PAKASIR_SLUG=rinci-in
PAKASIR_BASE_URL=https://app.pakasir.com
```
