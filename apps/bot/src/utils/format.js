export function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

export function greeting() {
  const h = new Date().getHours();

  if (h < 11) return "🌤️ Selamat Pagi";
  if (h < 15) return "☀️ Selamat Siang";
  if (h < 18) return "🌇 Selamat Sore";

  return "🌙 Selamat Malam";
}