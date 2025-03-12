import { prisma } from "@/lib";
import { IUser } from "@/types/repository";

class _User {
  // ✅ Create a new User
  async new(data: IUser) {
    const { phone, password, dateOfBirth, gender } = data;
    return await prisma.user.create({
      data: { phone, password, dateOfBirth, gender },
    });
  }

  // ✅ Get a User by ID
  async find(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  // ✅ Find a User by Phone Number
  async findByPhone(phone: string) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  }

  async findActiveBrand(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: { activeBrandId: true },
    });
  }

  // ✅ Get Users by Active Brand
  async byBrand(brandId: string) {
    return await prisma.user.findMany({
      where: { activeBrandId: brandId, deletedAt: null },
    });
  }

  // ✅ Update User details
  async updateUser(id: string, data: IUser) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // ✅ Soft Delete User (sets deletedAt)
  async softDelete(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ✅ Permanently Delete User
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

export const User = new _User();
