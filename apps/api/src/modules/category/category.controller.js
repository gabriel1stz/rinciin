import { listCategories } from "./category.service.js";
import { success, fail } from "../../utils/response.js";

export async function getCategories(req, res) {
  try {
    const categories = await listCategories();
    return success(res, "Kategori ditemukan", categories);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}