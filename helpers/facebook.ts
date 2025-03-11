import { auth } from "@/auth";
import { findActiveBrandByUserId, updateApp } from "@/repository";
import { createChannel, findAppByFacebookUserId } from "@/repository";
import { FacebookAdsApi, User } from "facebook-nodejs-business-sdk";

const REDIRECT_URI = process.env.META_REDIRECT_URI!;
const META_APP_ID = process.env.META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;

// ✅ Ensure Platform is Passed
export const getOAuthUrl = (platform: string | null) => {
  if (!platform) {
    return new Response(JSON.stringify({ error: "Platform is required" }), {
      status: 400,
    });
  }

  switch (platform.toLowerCase()) {
    case "facebook":
    case "instagram":
      return Response.json({ oauth_url: generateFacebookOAuthUrl(platform) });

    default:
      return Response.json({ error: "Unsupported platform" }, { status: 400 });
  }
};

// ✅ Generate Facebook OAuth URL
export const generateFacebookOAuthUrl = (platform: string) => {
  return (
    "https://www.facebook.com/v22.0/dialog/oauth?" +
    `client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(
      "pages_show_list,pages_manage_posts,instagram_basic,instagram_manage_comments"
    )}` +
    `&response_type=code` +
    `&state=${platform}`
  );
};

// ✅ Handle Facebook OAuth Callback
export const handleMetaCallback = async (
  platform: string | null,
  code: string
) => {
  if (!platform) {
    return new Response(
      JSON.stringify({ error: "Platform is required in callback" }),
      { status: 400 }
    );
  }

  return fetchOAuthToken(platform, code);
};

// ✅ Exchange Code for Access Token
export const fetchOAuthToken = async (platform: string, code: string) => {
  try {
    // ✅ Step 1: Exchange Code for Access Token
    const response = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?` +
        `client_id=${META_APP_ID}` +
        `&client_secret=${META_APP_SECRET}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&code=${code}`
    );

    const text = await response.text();

    if (text.startsWith("<")) {
      return new Response(
        JSON.stringify({
          error: "Facebook returned an HTML page instead of JSON.",
        }),
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    if (!response.ok || data.error) {
      console.error("Facebook API Error:", data.error);
      return Response.json(
        {
          error: data.error?.message || "Failed to retrieve access token",
        },
        { status: 400 }
      );
    }

    const accessToken = data.access_token;

    // ✅ Step 2: Initialize Facebook SDK with Access Token
    FacebookAdsApi.init(accessToken);

    // ✅ Step 3: Retrieve Facebook User ID
    const user = new User("me");
    const userData = await user.read(["id"]);

    if (!userData || !userData.id) {
      throw new Error("Failed to retrieve user ID");
    }

    const facebookUserId = userData.id;

    // ✅ Step 4: Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Step 5: Get Active Brand for the User
    const userId = session.user.id as string;
    const activeBrand = await findActiveBrandByUserId(userId);
    if (!activeBrand) {
      return Response.json(
        { error: "No active brand found for the user" },
        { status: 400 }
      );
    }

    // ✅ Step 6: Check if Existing Connection Exists
    const existingChannel = await findAppByFacebookUserId(
      activeBrand.id,
      facebookUserId
    );

    if (existingChannel) {
      // Update Existing Connection
      await updateApp(existingChannel.id, { accessToken });
    } else {
      // Create New Connection
      await createChannel(
        activeBrand.id,
        {
          platform: platform,
          accessToken: accessToken,
        },
        facebookUserId
      );
    }

    return Response.json({ success: true, facebookUserId }, { status: 201 });
  } catch (error) {
    console.error("OAuth Error:", error);
    return Response.json(
      { error: "Failed to exchange code for token" },
      { status: 500 }
    );
  }
};
