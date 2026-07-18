export { default } from "next-auth/middleware";

export const config = {
  // Protect every app route except the public ones.
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/budgets/:path*", "/analytics/:path*", "/accounts/:path*", "/goals/:path*", "/recurring/:path*", "/settings/:path*", "/onboarding/:path*"],
};
