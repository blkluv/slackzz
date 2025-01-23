import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher([
  "/auth",
  "/api/presence*",
  "/api/uploadthing*",
]);
const isUnregisteredUserOnlyPlace = createRouteMatcher(["/auth"]);

export default convexAuthNextjsMiddleware((res) => {
  console.log("middleware hit ");

  if (!isPublicPage(res) && !isAuthenticatedNextjs()) {
    console.log("unauthorized");

    return nextjsMiddlewareRedirect(res, "/auth");
  } else if (isUnregisteredUserOnlyPlace(res) && isAuthenticatedNextjs()) {
    console.log("authorized, redirecting...");

    return nextjsMiddlewareRedirect(res, "/");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
