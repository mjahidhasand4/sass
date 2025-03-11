import { auth } from "@/auth";
import {
  findBrandByName,
  createBrand,
  updateBrand,
  deleteBrand,
  findBrandsByUserId,
} from "@/repository/brand";
import { prisma } from "@/lib";
import { updateUser } from "@/repository";

export const GET = async () => {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Fetch brands belonging to the user
    const brands = await prisma.brand.findMany({
      where: { userId },
    });

    return Response.json({ brands }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    return Response.json(
      { error: error.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const { name } = await req.json();

    // Validate input
    if (!name || typeof name !== "string") {
      return Response.json(
        { error: "Brand name is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id as string;

    // Check if brand with the same name already exists
    const existingBrand = await findBrandByName(name);
    if (existingBrand) {
      return Response.json(
        { error: "Brand with this name already exists" },
        { status: 409 }
      );
    }

    const brands = await findBrandsByUserId(userId);

    // Create the brand
    const brand = await createBrand(name, userId);
    if (brands.length === 0) {
      await updateUser(userId, { activeBrandId: brand.id });
    }

    return Response.json(
      { message: "Brand created successfully", brand },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating brand:", error);
    return Response.json(
      { error: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: Request) => {
  try {
    const { id, name } = await req.json();

    // Validate input
    if (!id || !name || typeof name !== "string") {
      return Response.json(
        { error: "Brand ID and new name are required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the brand
    const updatedBrand = await updateBrand(id, name);
    if (!updatedBrand) {
      return Response.json({ error: "Brand not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Brand updated successfully", brand: updatedBrand },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating brand:", error);
    return Response.json(
      { error: error.message || "Failed to update brand" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();

    // Validate input
    if (!id) {
      return Response.json({ error: "Brand ID is required" }, { status: 400 });
    }

    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the brand
    const deletedBrand = await deleteBrand(id);
    if (!deletedBrand) {
      return Response.json({ error: "Brand not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Brand deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    return Response.json(
      { error: error.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
};
