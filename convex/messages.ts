import { v } from "convex/values";
import { mutation, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  user: Id<"users">
) => {
  return await ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("userId", user).eq("workspaceId", workspaceId)
    )
    .unique();
};

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("UnAuthorized");
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) throw new Error("UnAuthorized");

    let conversationId = args.conversationId;

    if (args.parentMessageId && !args.conversationId && !args.channelId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new Error("Not found");
      conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert("messages", {
      body: args.body,
      memberId: member._id,
      channelId: args.channelId,
      workspaceId: args.workspaceId,
      image: args.image,
      conversationId,
      parentMessageId: args.parentMessageId,
      updatedAt: Date.now(),
    });
    return messageId;
  },
});
