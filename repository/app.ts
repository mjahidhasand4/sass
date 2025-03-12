import { prisma } from "@/lib";
import { IAPP } from "@/types/repository";

class _App {
  // Create a new App
  async new(data: IAPP) {
    const { appId, type, platform, accessToken, brandId } = data;
    return await prisma.app.create({
      data: {
        appId: appId,
        type: type ?? "APP",
        platform: platform,
        accessToken: accessToken,
        brandId: brandId,
      },
    });
  }

  // Get an App by ID
  async find(id: string) {
    return await prisma.app.findUnique({
      where: { id },
    });
  }

  // Get all Apps
  async all() {
    return await prisma.app.findMany();
  }

  // Get Apps by Brand ID
  async findByBrand(brandId: string) {
    return await prisma.app.findMany({
      where: { brandId },
    });
  }

  // Get Child Apps for a given App
  async findChilds(parentAppId: string) {
    return await prisma.app.findMany({
      where: { appId: parentAppId },
    });
  }

  // Update an App
  async update(id: string, data: IAPP) {
    return await prisma.app.update({
      where: { id },
      data,
    });
  }

  // Delete an App (Soft Delete by setting deletedAt)
  async softDelete(id: string) {
    return await prisma.app.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Delete an App (Permanent Deletion)
  async delete(id: string) {
    return await prisma.app.delete({
      where: { id },
    });
  }
}

export const App = new _App();