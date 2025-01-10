import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getThreadMembers = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query("threadsMember")
        .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
        .collect();
    } catch (error) {
      console.error("Error in getThreadMember:", error);
      return [];
    }
  },
});
export const getThreadMember = query({
  args: {
    threadId: v.id("threads"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threadsMember")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .first();
  },
});
export const removeById = mutation({
  args: {
    threadMemberId: v.id("threadsMember"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.threadMemberId);
  },
});
export const removeAll = mutation({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const threadMembers = await ctx.db
      .query("threadsMember")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .collect();

    await Promise.all(threadMembers.map((member) => ctx.db.delete(member._id)));
  },
});
export const createThreadMember = mutation({
  args: {
    threadId: v.id("threads"),
    memberId: v.id("members"),
    role: v.union(
      v.literal("initiator"),
      v.literal("member"),
      v.literal("messageOwner")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("threadsMember", {
      role: args.role,
      threadId: args.threadId,
      memberId: args.memberId,
    });
  },
});
