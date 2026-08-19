import { parseDelete } from "../../../core/parser/delete.parser.js";
import { deleteTransactionService } from "../../delete/delete.service.js";

export async function deleteHandler(body, user) {
  const parsed = parseDelete(body.message);
  const isLatest = /terakhir/i.test(body.message);

  if (!parsed.code && !isLatest) {
    return {
      success: false,
      text: "💡 Contoh cara hapus transaksi:\n👉 *hapus RIN-123ABC* (berdasarkan ID)\n👉 *hapus transaksi terakhir*"
    };
  }

  return deleteTransactionService(
    user.id,
    parsed.code,
    isLatest
  );
}