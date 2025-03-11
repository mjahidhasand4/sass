import { prisma } from "@/lib";

/**
 * Find brand by user ID.
 */
export const findBrandByUserId = async (userId: string, brandId: string) => {
  return prisma.brand.findMany({
    where: { id: brandId, userId },
    include: { apps: true },
  });
};

/**
 * Find brands by user ID.
 */
export const findBrandsByUserId = async (userId: string) => {
  return prisma.brand.findMany({
    where: { userId },
    include: { apps: true },
  });
};

/**
 * Find a brand by ID.
 */
export const findBrandById = async (id: string) => {
  return prisma.brand.findUnique({
    where: { id },
    include: { apps: true },
  });
};

/**
 * Find a brand by name.
 */
export const findBrandByName = async (name: string) => {
  return prisma.brand.findFirst({
    where: { name },
  });
};

/**
 * Find the active brand for a user.
 */
export const findActiveBrandByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeBrand: true }, // Fetch only the active brand
  });

  if (!user || !user.activeBrand) {
    return null; // No active brand found
  }

  return user.activeBrand;
};

/**
 * Create a new brand.
 */
export const createBrand = async (name: string, userId: string) => {
  return prisma.brand.create({
    data: {
      name,
      User: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

/**
 * Update an existing brand.
 */
export const updateBrand = async (id: string, name: string) => {
  return prisma.brand.update({
    where: { id },
    data: {
      name,
    },
  });
};

/**
 * Delete a brand by ID.
 */
export const deleteBrand = async (id: string) => {
  return prisma.brand.delete({
    where: { id },
  });
};
