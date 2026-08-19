// export.ts - Financial Reports Exporter (CSV and Print/PDF layout)
import { Transaction } from '../types/transaction';
import { formatDateId } from './date';

export function exportTransactionsToCsv(transactions: Transaction[], filename = 'laporan-keuangan.csv') {
  if (!transactions || transactions.length === 0) {
    throw new Error('Tidak ada data transaksi untuk diekspor.');
  }

  const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Dompet', 'Nominal (IDR)', 'Catatan', 'Deskripsi'];
  const rows = transactions.map((t) => [
    `"${t.id || ''}"`,
    `"${t.date ? new Date(t.date).toISOString().slice(0, 10) : ''}"`,
    `"${t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}"`,
    `"${t.category?.name || 'Umum'}"`,
    `"${t.wallet?.name || 'Cash'}"`,
    `"${Number(t.amount || 0)}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printFinancialReport(
  transactions: Transaction[],
  summary: { totalIncome: number; totalExpense: number; net: number },
  title = 'Laporan Arus Kas & Keuangan'
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Gagal membuka jendela cetak. Pastikan pop-up diizinkan.');
  }

  const dateStr = formatDateId(new Date());

  const rowsHtml = transactions
    .map(
      (t) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 8px 10px;">${t.date ? new Date(t.date).toLocaleDateString('id-ID') : '-'}</td>
        <td style="padding: 8px 10px; font-weight: 600;">${t.note || t.description || 'Transaksi'}</td>
        <td style="padding: 8px 10px;">${t.category?.name || '-'}</td>
        <td style="padding: 8px 10px;">${t.wallet?.name || 'Cash'}</td>
        <td style="padding: 8px 10px; font-weight: 700; text-align: right; color: ${t.type === 'INCOME' ? '#16a34a' : '#dc2626'};">
          ${t.type === 'INCOME' ? '+' : '-'} Rp${Number(t.amount || 0).toLocaleString('id-ID')}
        </td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Rinci.in</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 800; color: #0f172a; }
        .logo span { color: #059669; }
        .summary-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 24px; }
        .card { padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .card-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .card-val { font-size: 18px; font-weight: 800; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; }
        .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">rinci<span>.in</span></div>
          <div style="font-size: 13px; color: #64748b; margin-top: 2px;">${title}</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          Dicetak: <strong>${dateStr}</strong>
        </div>
      </div>

      <div class="summary-cards">
        <div class="card">
          <div class="card-label">Total Pemasukan</div>
          <div class="card-val" style="color: #16a34a;">Rp${summary.totalIncome.toLocaleString('id-ID')}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Pengeluaran</div>
          <div class="card-val" style="color: #dc2626;">Rp${summary.totalExpense.toLocaleString('id-ID')}</div>
        </div>
        <div class="card">
          <div class="card-label">Arus Kas Bersih (Net)</div>
          <div class="card-val" style="color: ${summary.net >= 0 ? '#16a34a' : '#dc2626'};">
            ${summary.net >= 0 ? '+' : ''}Rp${summary.net.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Daftar Rincian Transaksi (${transactions.length} Item)</h3>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Catatan</th>
            <th>Kategori</th>
            <th>Dompet</th>
            <th style="text-align: right;">Nominal</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        Dokumen ini dibuat otomatis oleh Rinci.in — Solusi Cerdas Manajemen Keuangan Pribadi & Usaha.
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
