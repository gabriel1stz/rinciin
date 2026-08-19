import { undoTransaction } from "../../undo/undo.service.js";

export async function undoHandler(body, user) {
  return undoTransaction(user.id);
}