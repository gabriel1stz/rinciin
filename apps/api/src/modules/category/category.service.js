import { getAllCategories, findCategoryById } from "./repositories/category.repository.js";

export async function listCategories() {
  return getAllCategories();
}

export async function getCategory(id) {
  return findCategoryById(id);
}