import { getOAuthUrl, handleMetaCallback } from "@/helpers";

export const GET = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") || searchParams.get("state"); // Try getting platform from state
  const code = searchParams.get("code"); // Facebook sends this after login

  // **If code is present, it's a callback request**
  if (code) {
    return handleMetaCallback(platform, code);
  }

  return getOAuthUrl(platform);
};
