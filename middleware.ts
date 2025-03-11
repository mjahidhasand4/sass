import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/api/auth", "/signin", "/register"];
const PROTECTED_ROUTES = ["/api/v1", "/", "/social"];

export const middleware = async (req: NextRequest) => {
  // const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  // console.log("Token: ", token);
  // const { pathname } = req.nextUrl;

  // // Allow access to explicitly defined public routes
  // if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
  //   if (token && (pathname === "/signin" || pathname === "/register")) {
  //     return NextResponse.redirect(new URL("/", req.url));
  //   }
  //   return NextResponse.next();
  // }

  // // Restrict access to protected routes
  // if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
  //   if (!token) {
  //     return pathname.startsWith("/api/")
  //       ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //       : NextResponse.redirect(new URL("/signin", req.url));
  //   }
  // }

  return NextResponse.next();
};

// Middleware execution configuration
// export const config = {
//   matcher: ["/api/v1/:path*", "/signin", "/register", "/social/:path*"],
// };
