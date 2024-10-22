import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/auth"]);

export default convexAuthNextjsMiddleware((res) => {
  if (!isPublicPage(res) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(res, "/auth");
  } else if (isPublicPage(res) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(res, "/");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
