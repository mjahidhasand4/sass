import { prisma } from "@/lib";

/**
 * Find user by ID.
 */
export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: { brands: true, activeBrand: true },
  });
};

/**
 * Find user by phone number.
 */
export const findUserByPhone = async (phone: string) => {
  return prisma.user.findUnique({
    where: { phone },
    include: { brands: true, activeBrand: true },
  });
};

/**
 * Check if a phone number is already registered.
 */
export const isPhoneRegistered = async (phone: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true }, // Select minimal fields for efficiency
  });
  return user !== null;
};

/**
 * Create a new user in the database.
 */
export const createUser = async (
  phone: string,
  hashedPassword: string,
  dateOfBirth: Date,
  gender: "male" | "female"
) => {
  return prisma.user.create({
    data: {
      phone,
      password: hashedPassword,
      dateOfBirth,
      gender,
    },
  });
};

/**
 * Update a user dynamically with any fields provided.
 */
export const updateUser = async (id: string, data: Record<string, any>) => {
  // Remove `id` from the data object to prevent overwriting primary key
  delete data.id;

  return prisma.user.update({
    where: { id },
    data, // Accepts any fields dynamically
  });
};

/**
 * Update the active brand for a user.
 *
 * @param userId - The ID of the user
 * @param brandId - The ID of the brand to set as active
 * @returns The updated user or an error
 */
export const updateUserActiveBrand = async (
  userId: string,
  brandId: string
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { activeBrandId: brandId },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating active brand:", error);
    return { success: false, message: "Failed to update active brand" };
  }
};
