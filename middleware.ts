import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const middleware = async (req: NextRequest) => {
  // ✅ Get token using default behavior (cookies are automatically included)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  console.log(
    "Middleware Token:",
    token,
    "Request Path:",
    req.nextUrl.pathname
  );

  // ✅ Allow Public Routes
  const PUBLIC_ROUTES = ["/api/auth", "/signin", "/register"];
  if (PUBLIC_ROUTES.includes(req.nextUrl.pathname)) {
    if (token && req.nextUrl.pathname === "/signin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ❌ Block Unauthorized Requests to Protected Routes
  if (!token && req.nextUrl.pathname.startsWith("/api/v1/")) {
    console.log("❌ Middleware Blocked Unauthorized Request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
};

// ✅ Correct Matcher Configuration
export const config = {
  matcher: ["/api/v1/:path*", "/social/:path*"],
};
