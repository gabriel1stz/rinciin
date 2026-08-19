import prisma from "../../../lib/prisma.js";

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" }
  });
}

export async function findCategoryById(id) {
  return prisma.category.findUnique({
    where: { id }
  });
}

export async function findOrCreateCategory(name, type) {
  if (!name) return null;

  let category = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } }
  });

  if (!category) {
    category = await prisma.category.create({
      data: { name, type, icon: "\uD83D\uDCC1" }
    });
  }

  return category;
}