import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { findChannelsByBrandId, findUserById } from "@/repository";

/**
 * GET: Fetch all social media channels for the user's active brand
 */
export const GET = async () => {
  try {
    // Authenticate user
    const session = await auth();
    console.log(session);
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Find user with active brand
    const user = await findUserById(userId);
    const brandId = user?.activeBrandId;
    if (!brandId) {
      return Response.json({ error: "No active brand found" }, { status: 404 });
    }

    const apps = await findChannelsByBrandId(brandId);
    console.log(`Apps: ${apps}`);

    return Response.json(user.activeBrand, { status: 200 });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return Response.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
};

/**
 * PUT: Update a channel's access token
 */
export const PUT = async (req: Request) => {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channelId, accessToken } = await req.json();

    // Validate input
    if (!channelId || !accessToken) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update channel
    const updatedChannel = await prisma.app.update({
      where: { id: channelId },
      data: { accessToken },
    });

    return Response.json(updatedChannel, { status: 200 });
  } catch (error) {
    console.error("Error updating channel:", error);
    return Response.json(
      { error: "Failed to update channel" },
      { status: 500 }
    );
  }
};

/**
 * DELETE: Remove a social media channel
 */
export const DELETE = async (req: Request) => {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channelId } = await req.json();

    // Validate input
    if (!channelId) {
      return Response.json({ error: "Missing channel ID" }, { status: 400 });
    }

    // Delete channel
    await prisma.app.delete({
      where: { id: channelId },
    });

    return Response.json(
      { message: "Channel deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting channel:", error);
    return Response.json(
      { error: "Failed to delete channel" },
      { status: 500 }
    );
  }
};
