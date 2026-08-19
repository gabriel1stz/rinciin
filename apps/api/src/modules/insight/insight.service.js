export function generateInsight(report) {
  const insights = [];

  if (!report.categories.length) {
    insights.push("Belum ada cukup data untuk dianalisis.");
    return insights;
  }

  const topCategory = [...report.categories].sort((a, b) => b.total - a.total)[0];

  insights.push(`Kategori terbesar adalah ${topCategory.name} sebesar ${rupiah(topCategory.total)}.`);

  if (report.expense > report.income && report.income > 0) {
    insights.push("Pengeluaran lebih besar dari pemasukan. Perlu dikontrol.");
  }

  if (report.expense === 0) {
    insights.push("Belum ada pengeluaran pada periode ini.");
  }

  if (report.diff < 0) {
    insights.push("Selisih periode ini negatif.");
  } else {
    insights.push("Selisih periode ini masih positif.");
  }

  return insights;
}

function rupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}