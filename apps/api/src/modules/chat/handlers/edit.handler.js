import { editTransaction } from "../../edit/edit.service.js";

export async function editHandler(body, user) {

  return editTransaction(
    user.id,
    body.message
  );

}