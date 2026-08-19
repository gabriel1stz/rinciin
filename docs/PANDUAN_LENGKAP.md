# 📖 PANDUAN LENGKAP PENGGUNAAN RINCI.IN

Selamat datang di **Rinci.in** — Platform Asisten Manajemen Finansial Pribadi Modern berbasis **WhatsApp Bot** & **Web Dashboard Realtime**.

---

## 📑 DAFTAR ISI
1. [Mulai Cepat & Aktivasi Trial 7 Hari](#1-mulai-cepat--aktivasi-trial-7-hari)
2. [Panduan WhatsApp Bot](#2-panduan-whatsapp-bot)
   - [A. Format Pencatatan Pengeluaran & Pemasukan](#a-format-pencatatan-pengeluaran--pemasukan)
   - [B. Multi-Transaksi Sekaligus](#b-multi-transaksi-sekaligus)
   - [C. Kelola Dompet, Rekening Bank & E-Wallet (Termasuk ShopeePay)](#c-kelola-dompet-rekening-bank--e-wallet-termasuk-shopeepay)
   - [D. Top Up Saldo & Tarik Tunai](#d-top-up-saldo--tarik-tunai)
   - [E. Transfer Antar Dompet / Rekening](#e-transfer-antar-dompet--rekening)
   - [F. Scan Foto Struk Belanja (OCR Otomatis)](#f-scan-foto-struk-belanja-ocr-otomatis)
   - [G. Catat via Voice Note (Pesan Suara)](#g-catat-via-voice-note-pesan-suara)
   - [H. Atur & Pantau Anggaran (Budgeting)](#h-atur--pantau-anggaran-budgeting)
   - [I. Laporan & Riwayat Keuangan](#i-laporan--riwayat-keuangan)
   - [J. Ekspor Data ke Excel / CSV](#j-ekspor-data-ke-excel--csv)
   - [K. Konsultasi Finansial dengan Asisten AI](#k-konsultasi-finansial-dengan-asisten-ai)
   - [L. Koreksi & Hapus Transaksi](#l-koreksi--hapus-transaksi)
3. [Panduan Akses Web Dashboard](#3-panduan-akses-web-dashboard)
   - [A. Cara Login via OTP WhatsApp](#a-cara-login-via-otp-whatsapp)
   - [B. Fitur-Fitur Utama Dashboard](#b-fitur-fitur-utama-dashboard)
4. [Masa Trial 7 Hari & Sistem Berlangganan](#4-masa-trial-7-hari--sistem-berlangganan)
5. [Tanya Jawab & Troubleshooting (FAQ)](#5-tanya-jawab--troubleshooting-faq)

---

## 1. Mulai Cepat & Aktivasi Trial 7 Hari

### Cara Mengaktifkan Trial Gratis:
1. **Lewat WhatsApp Bot:**
   - Kirim pesan: `aktifkan trial` atau `klaim trial` ke nomor WhatsApp Bot Rinci.in.
   - Bot akan langsung mengaktifkan masa **Trial 7 Hari** gratis dengan akses penuh ke bot WhatsApp dan Web Dashboard.
   - Kamu akan menerima link login dashboard: `https://rinci.in/login`.

2. **Lewat Website:**
   - Kunjungi [https://rinci.in](https://rinci.in).
   - Klik tombol **Mulai Gratis Sekarang** pada paket **Trial 7 Hari**.
   - Masukkan nomor WhatsApp aktifmu.

---

## 2. Panduan WhatsApp Bot

WhatsApp Bot Rinci.in dirancang menggunakan pemrosesan bahasa alami (Natural Language Processing). Kamu bisa mengetik santai seperti sedang chatting biasa!

### A. Format Pencatatan Pengeluaran & Pemasukan

Cukup ketik **kegiatan/barang**, **nominal**, dan opsional **nama dompet**:

| Kategori | Contoh Pesan Chat | Penjelasan Hasil |
| :--- | :--- | :--- |
| **Pengeluaran (Default Cash)** | `makan siang 25rb` | Kategori: Makan, Nominal: Rp25.000, Dompet: Cash |
| **Pengeluaran E-Wallet** | `kopi 35rb shopeepay` | Kategori: Makan, Nominal: Rp35.000, Dompet: Shopeepay |
| **Pengeluaran E-Wallet** | `bensin 50rb gopay` | Kategori: Transportasi, Nominal: Rp50.000, Dompet: Gopay |
| **Pengeluaran Bank** | `bayar wifi 350rb bca` | Kategori: Tagihan, Nominal: Rp350.000, Dompet: BCA |
| **Pemasukan** | `gaji 7.5jt bca` | Kategori: Pemasukan, Nominal: Rp7.500.000, Dompet: BCA |
| **Pemasukan Tambahan** | `bonus project 1.2jt mandiri` | Kategori: Pemasukan, Nominal: Rp1.200.000, Dompet: Mandiri |

> **Format Nominal yang Didukung:**
> - Singkatan: `25k`, `50rb`, `1.5jt`, `2.5m`
> - Angka penuh: `25000`, `1500000`, `50.000`, `7,500,000`

---

### B. Multi-Transaksi Sekaligus

Kamu bisa mencatat beberapa transaksi dalam satu pesan dengan pemisah tanda koma (`,`), kata `sama`, `dan`, atau baris baru (enter):

```text
makan siang 35rb gopay, parkir 5rb cash, beli obat 40rb bca
```
*atau:*
```text
nasi padang 25rb sama es teh 5rb dan bensin 30rb
```

---

### C. Kelola Dompet, Rekening Bank & E-Wallet (Termasuk ShopeePay)

Rinci.in mendukung berbagai dompet digital & bank Indonesia:
- **E-Wallets:** `Shopeepay` / `spay` / `shopee pay`, `Dana`, `Gopay`, `OVO`, `LinkAja`
- **Bank:** `BCA`, `Mandiri`, `BRI`, `BNI`, `Seabank`, `Bank Jago`, `Jenius`, `BSI`, `CIMB`, `Permata`
- **Tunai:** `Cash` / `Tunai`

#### 1. Atur Saldo Awal Dompet:
- `shopeepay 500rb`
- `saldo bca 5jt`
- `cash 300rb`
- `dana 250k`

#### 2. Cek Saldo Semua Dompet:
Ketik:
- `saldo`
- `dompet`
- `lihat saldo`

#### 3. Cek Saldo 1 Dompet Spesifik:
- `saldo shopeepay`
- `cek bca`
- `lihat gopay`

---

### D. Top Up Saldo & Tarik Tunai

Perintah top up mendukung berbagai gaya penulisan santai, baik menggunakan kata **`top up`**, **`topup`**, **`tambah`**, **`isi`**, maupun **`saldo` langsung**:

#### 1. Menambah Saldo (Top Up):
- `top up shopeepay 100rb`
- `topup gopay 50rb`
- `saldo gopay 50rb` *(otomatis menambah saldo ke Gopay)*
- `saldo dana 100k` *(otomatis menambah saldo ke Dana)*
- `isi saldo bca 500rb`
- `tambah dana 200rb`
- `isi bca 1jt`

#### 2. Mengurangi Saldo / Tarik Tunai:
- `tarik bca 500rb`
- `kurangi cash 50rb`
- `ambil dana 100rb`

---

### E. Transfer Antar Dompet / Rekening

Pindahkan saldo antar rekening atau dari bank ke e-wallet secara instan:
- `transfer bca ke shopeepay 200rb`
- `transfer mandiri ke dana 100rb`
- `pindah gopay ke cash 50rb`

Saldo pengirim akan berkurang otomatis dan saldo penerima akan bertambah secara realtime.

---

### F. Scan Foto Struk Belanja (OCR Otomatis)

Kamu tidak perlu mengetik panjang nota belanja minimarket / supermarket:
1. Ambil foto struk belanjaan (Indomaret, Alfamart, restoran, dll).
2. Kirim foto langsung ke bot WhatsApp.
3. Bot akan memindai total nominal, nama merchant, dan item belanjaan secara otomatis.

---

### G. Catat via Voice Note (Pesan Suara)

Sedang di jalan atau menyetir?
1. Tekan tombol rekam pesan suara (Voice Note) di WhatsApp.
2. Ucapkan pengeluaranmu, contoh: *"Beli bensin 50 ribu pakai GoPay"*.
3. Kirim ke bot, sistem AI akan mentranskripsikan dan mencatatnya seketika.

---

### H. Atur & Pantau Anggaran (Budgeting)

Batasi pengeluaran per kategori agar tidak boros:

#### 1. Menetapkan Budget:
- `budget makan 1.5jt`
- `budget bensin 500rb`
- `budget belanja 2jt`

#### 2. Melihat Pemakaian Budget:
- `lihat budget`
- `cek budget`

---

### I. Laporan & Riwayat Keuangan

Dapatkan ringkasan keuangan harian, mingguan, atau bulanan kapan saja:
- `laporan hari ini` (Ringkasan hari ini)
- `laporan minggu ini` (Ringkasan 7 hari terakhir)
- `laporan bulan ini` (Ringkasan bulan berjalan)
- `history` / `riwayat` (Menampilkan 10 transaksi terakhir)

---

### J. Ekspor Data ke Excel / CSV

Butuh data mentah untuk rekonsiliasi atau arsip?
- Kirim pesan: `ekspor` / `export` / `download data`.
- Bot akan langsung mengirimkan file dokumen **`.csv`** yang bisa dibuka di Microsoft Excel, Google Sheets, atau Numbers.

---

### K. Konsultasi Finansial dengan Asisten AI

Tanyakan insight seputar kondisi keuanganmu:
- `tanya apakah saya boros bulan ini?`
- `saran cara menabung untuk beli laptop`
- `analisis pengeluaran terbesar saya`

---

### L. Koreksi & Hapus Transaksi

- `undo` atau `batal`: Membatalkan dan menghapus transaksi paling terakhir.
- `edit transaksi`: Membuka panduan pengubahan data transaksi.

---

## 3. Panduan Akses Web Dashboard

Web Dashboard Rinci.in beralamat di: **https://rinci.in/login**

### A. Cara Login via OTP WhatsApp:
1. Buka [https://rinci.in/login](https://rinci.in/login).
2. Masukkan nomor WhatsApp yang sudah kamu daftarkan (contoh: `081234567890`).
3. Klik **Kirim Kode OTP**.
4. Bot WhatsApp Rinci.in akan mengirimkan 6 digit kode verifikasi resmi ke nomor WhatsApp-mu.
5. Masukkan 6 digit kode tersebut di website untuk masuk ke Dashboard.

### B. Fitur-Fitur Utama Dashboard:
1. **Overview 4 Metrik Finansial:** Total Saldo Keseluruhan, Total Pemasukan, Total Pengeluaran, dan Estimasi Tabungan.
2. **Grafik Arus Kas Interaktif:** Visualisasi perbandingan pemasukan vs pengeluaran mingguan/bulanan.
3. **Multi-Wallet Cards:** Pantau rincian saldo per rekening bank & e-wallet.
4. **Budget Progress Bar:** Visualisasi persentase sisa anggaran dengan indikator warna (Aman / Waspada / Overbudget).
5. **Daftar Transaksi Lengkap:** Filter pencarian, sortir kategori, edit nominal/kategori, dan hapus transaksi.
6. **Ekspor Laporan:** Unduh riwayat pembukuan format CSV.

---

## 4. Masa Trial 7 Hari & Sistem Berlangganan

| Paket | Durasi & Harga | Fitur Akses |
| :--- | :--- | :--- |
| **Trial 7 Hari** | **7 Hari Gratis** (Rp0) | Akses Penuh Bot WhatsApp, OCR Foto Struk, Voice Note & Web Dashboard selama 7 Hari |
| **PRO** | Rp1.000 / bln *(Promo)* | Unlimited Transaksi, Multi-Wallet Tanpa Batas, OCR Struk, Voice Note, AI Advisor & Ekspor CSV |
| **Family** | Rp59.000 / bln | Seluruh Fitur PRO + Multi-User hingga 5 Anggota Keluarga & Shared Budget |

> ⚠️ **Catatan Penting Setelah Masa Trial 7 Hari Habis:**
> - Jika masa trial 7 hari berakhir dan kamu belum melakukan upgrade ke paket PRO/Family, akses chat bot WhatsApp dan login Web Dashboard akan otomatis terkunci.
> - Data riwayat keuangan kamu tetap tersimpan aman di database dan dapat diakses kembali setelah akun diupgrade.
> - Upgrade dapat dilakukan kapan saja melalui: [https://rinci.in/#pricing](https://rinci.in/#pricing).

---

## 5. Tanya Jawab & Troubleshooting (FAQ)

#### Q: Mengapa ShopeePay saya sempat masuk ke dompet Cash?
> **A:** Pada pembaruan terbaru, alias `shopeepay`, `shopee pay`, `spay`, `shopee`, dan `spay later` telah didaftarkan secara penuh. Semua transaksi ShopeePay kini otomatis masuk ke dompet **Shopeepay**.

#### Q: Mengapa ketik `top up` dengan spasi sebelumnya gagal?
> **A:** Sistem parser kini telah mendukung variasi `top up` (dengan spasi) dan `topup` (tanpa spasi), serta `tambah` dan `isi`.

#### Q: Bagaimana cara cek masa aktif trial saya?
> **A:** Kirim pesan `aktifkan trial` atau `menu` ke bot WhatsApp, bot akan menampilkan tanggal berakhir masa trial kamu.

---

*© 2026 Rinci.in — Solusi Cerdas Pencatatan Finansial Indonesia.*
