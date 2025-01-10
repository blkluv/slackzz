import { createRouteHandler } from "uploadthing/next";

import { imagesRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: imagesRouter,
});
