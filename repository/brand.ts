import { prisma } from "@/lib";
import { IBrand } from "@/types/repository";

class _Brand {
  // ✅ Create a new Brand
  static async new(data: IBrand) {
    const { name, userId } = data;
    return await prisma.brand.create({
      data: { name, userId },
    });
  }

  // ✅ Get a Brand by ID
  static async find(id: string) {
    return await prisma.brand.findUnique({
      where: { id },
    });
  }

  // ✅ Get all Brands (excluding soft-deleted ones)
  static async all() {
    return await prisma.brand.findMany({
      where: { deletedAt: null },
    });
  }

  // ✅ Get Brands by User ID
  static async byUser(userId: string) {
    return await prisma.brand.findMany({
      where: { userId, deletedAt: null },
    });
  }

  // ✅ Update Brand details
  static async update(id: string, data: IBrand) {
    return await prisma.brand.update({
      where: { id },
      data,
    });
  }

  // ✅ Soft Delete Brand (sets deletedAt)
  static async softDelete(id: string) {
    return await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ✅ Permanently Delete Brand
  static async delete(id: string) {
    return await prisma.brand.delete({
      where: { id },
    });
  }
}

export const Brand = new _Brand();
