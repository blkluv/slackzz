/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as channels from "../channels.js";
import type * as conversations from "../conversations.js";
import type * as http from "../http.js";
import type * as members from "../members.js";
import type * as messages from "../messages.js";
import type * as notification from "../notification.js";
import type * as reaction from "../reaction.js";
import type * as status from "../status.js";
import type * as stripe from "../stripe.js";
import type * as suggestion from "../suggestion.js";
import type * as thread from "../thread.js";
import type * as user from "../user.js";
import type * as workspaces from "../workspaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  channels: typeof channels;
  conversations: typeof conversations;
  http: typeof http;
  members: typeof members;
  messages: typeof messages;
  notification: typeof notification;
  reaction: typeof reaction;
  status: typeof status;
  stripe: typeof stripe;
  suggestion: typeof suggestion;
  thread: typeof thread;
  user: typeof user;
  workspaces: typeof workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
