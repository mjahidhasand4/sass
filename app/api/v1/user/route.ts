import { auth } from "@/auth";
import { prisma } from "@/lib";
import { findUserById } from "@/repository/user";

/**
 * GET: Fetch user profile
 */
export const GET = async () => {
  try {
    // Authenticate User
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Fetch User
    const user = await findUserById(userId!);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive fields (like password)
    const { password, ...userData } = user;

    return Response.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return Response.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
};

/**
 * PUT: Update user profile
 */
export const PUT = async (req: Request) => {
  try {
    // Authenticate User
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { phone, gender, dateOfBirth } = body;

    // Validate input
    if (!phone && !gender && !dateOfBirth) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { phone, gender, dateOfBirth },
    });

    // Remove sensitive data
    const { password, ...userData } = updatedUser;

    return Response.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
};

/**
 * DELETE: Remove user account
 */
export const DELETE = async () => {
  try {
    // Authenticate User
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user and cascade delete brands/channels if needed
    await prisma.user.delete({
      where: { id: userId },
    });

    return Response.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
};
