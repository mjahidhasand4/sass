const PLATFORM_CREDENTIALS = {
  facebook: {
    appId: process.env.META_APP_ID!,
    appSecret: process.env.META_APP_SECRET!,
    scopes: [
      "pages_show_list",
      "pages_manage_posts",
      "instagram_basic",
      "instagram_manage_comments",
    ],
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
  },
};
