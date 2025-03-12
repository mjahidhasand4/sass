import { auth } from "@/auth";
import { findChannelsByBrandId, findUserById } from "@/repository";

export const GET = async () => {
  try {
    // ✅ Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // ✅ Retrieve user's active brand
    const user = await findUserById(userId);
    const brandId = user?.activeBrandId;
    if (!brandId) {
      return Response.json({ error: "No active brand found" }, { status: 404 });
    }

    // ✅ Find social media accounts for this brand
    const apps = await findChannelsByBrandId(brandId);

    // ✅ Check for a linked Facebook account
    const facebookApp = apps.find((app) => app.platform === "facebook");
    if (!facebookApp || !facebookApp.accessToken) {
      return Response.json(
        { error: "No linked Facebook account found", channels: apps },
        { status: 404 }
      );
    }

    const accessToken = facebookApp.accessToken;

    // ✅ Fetch pages from Facebook Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error: data.error?.message || "Failed to fetch pages",
          channels: apps,
        },
        { status: 400 }
      );
    }

    // ✅ Return social media channels with Facebook pages
    return Response.json(
      { channels: apps, facebookPages: data.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching channels & Facebook pages:", error);
    return Response.json(
      { error: "Failed to fetch channels & Facebook pages" },
      { status: 500 }
    );
  }
};
