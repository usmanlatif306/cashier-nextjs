const publicPaths = ["/"];
export { default } from "next-auth/middleware";
// import { withAuth } from "next-auth/middleware";

export const config = {
  matcher: ["/rental/:path*", "/owner/:path*", "/vendor/:path*"],
};
