import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ **Find all channels by brand ID**
export const findChannelsByBrandId = async (brandId: string) => {
  try {
    const channels = await prisma.app.findMany({
      where: { brandId },
    });

    return channels;
  } catch (error) {
    console.error("Error finding channels:", error);
    throw new Error("Failed to retrieve channels.");
  }
};

// ✅ **Create a new channel for a given brand**
export const createChannel = async (
  brandId: string,
  channel: { platform: string; accessToken: string },
  facebookUserId: string
) => {
  try {
    const newChannel = await prisma.app.create({
      data: {
        platform: channel.platform,
        accessToken: channel.accessToken,
        brandId: brandId,
        facebookUserId,
      },
    });

    return newChannel;
  } catch (error) {
    console.error("Error creating channel:", error);
    throw new Error("Failed to create channel.");
  }
};

// ✅ Find an Existing Facebook App Connection
export const findAppByFacebookUserId = (
  brandId: string,
  facebookUserId: string
) => {
  return prisma.app.findFirst({
    where: {
      brandId,
      facebookUserId,
    },
  });
};

// ✅ Update Existing App Data
export async function updateApp(appId: string, data: { accessToken: string }) {
  return prisma.app.update({
    where: { id: appId },
    data,
  });
}
