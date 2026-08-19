import { processMessage } from "./message.engine.js";

const samples = [
  "beli ayam 40rb cash sama bensin 60rb gopay",
  "saldo gua berapa",
  "laporan hari ini",
  "hapus transaksi terakhir",
  "halo"
];

for (const sample of samples) {
  console.log("\nINPUT:", sample);
  console.log(JSON.stringify(processMessage(sample), null, 2));
}