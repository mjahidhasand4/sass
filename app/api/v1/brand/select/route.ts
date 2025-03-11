import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { findBrandByUserId, updateUserActiveBrand } from "@/repository";

/**
 * Update the active brand for the authenticated user.
 */
export const PUT = async (req: NextRequest) => {
  try {
    // ✅ Authenticate the user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Parse request body
    const { brandId } = await req.json();
    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id as string;

    // ✅ Verify the brand belongs to the user
    const brand = await findBrandByUserId(userId, brandId);
    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found or unauthorized" },
        { status: 404 }
      );
    }

    // ✅ Update the active brand
    const updateResult = await updateUserActiveBrand(userId, brandId);
    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Brand selected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating active brand:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
