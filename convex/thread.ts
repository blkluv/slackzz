import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { getMember } from "./messages";

export type ThreadSummary = {
  id: Id<"messages">;
  body: string;
  author: string;
  authorImage: string | null;
  createdAt: number;
  replyCount: number;
  participantCount: number;
  context: string;
  lastReplyAt: number;
  lastReplyAuthorName: string;
  lastReplyAuthorImage: string | null;
};

export const getAllThreads = query({
  args: {
    workspaceId: v.id("workspaces"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) throw new Error("Unauthorized");

    // Find all messages in the workspace that have replies
    const result = await ctx.db
      .query("messages")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .filter((q) => q.eq(q.field("parentMessageId"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    const threadsWithDetails = await Promise.all(
      result.page.map(async (message) => {
        // Check if this message has any replies
        const replies = await ctx.db
          .query("messages")
          .withIndex("by_parent_message_id", (q) =>
            q.eq("parentMessageId", message._id)
          )
          .collect();

        // If there are no replies, skip this message
        if (replies.length === 0) return null;

        const messageMember = await ctx.db.get(message.memberId);
        if (!messageMember) return null;

        const user = await ctx.db.get(messageMember.userId);
        if (!user) return null;

        const participantIds = new Set<string>();
        participantIds.add(user._id);

        let lastReply = null;
        let lastReplyUser = null;

        for (const reply of replies) {
          const replyMember = await ctx.db.get(reply.memberId);
          if (replyMember) {
            const replyUser = await ctx.db.get(replyMember.userId);
            if (replyUser) {
              participantIds.add(replyUser._id);
              if (!lastReply || reply._creationTime > lastReply._creationTime) {
                lastReply = reply;
                lastReplyUser = replyUser;
              }
            }
          }
        }

        let context = "";
        if (message.channelId) {
          const channel = await ctx.db.get(message.channelId);
          context = channel ? `#${channel.name}` : "";
        } else if (message.conversationId) {
          context = "Direct Message";
        }

        return {
          id: message._id,
          body: message.body,
          author: user.name,
          authorImage: user.image ?? undefined,
          createdAt: message._creationTime,
          replyCount: replies.length,
          participantCount: participantIds.size,
          context,
          lastReplyAt: lastReply
            ? lastReply._creationTime
            : message._creationTime,
          lastReplyAuthorName: lastReplyUser ? lastReplyUser.name : user.name,
          lastReplyAuthorImage: lastReplyUser
            ? lastReplyUser.image ?? undefined
            : user.image ?? undefined,
        };
      })
    );

    const validThreads = threadsWithDetails.filter((t) => t !== null);

    return {
      ...result,
      page: validThreads,
    };
  },
});

export const hasReplies = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;

    const reply = await ctx.db
      .query("messages")
      .withIndex("by_parent_message_id", (q) =>
        q.eq("parentMessageId", args.messageId)
      )
      .first();

    return reply !== null;
  },
});

// Get reply count for a message
export const getReplyCount = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return 0;

    const replies = await ctx.db
      .query("messages")
      .withIndex("by_parent_message_id", (q) =>
        q.eq("parentMessageId", args.messageId)
      )
      .collect();

    return replies.length;
  },
});

// Get latest reply info for a message
export const getLatestReplyInfo = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const latestReply = await ctx.db
      .query("messages")
      .withIndex("by_parent_message_id", (q) =>
        q.eq("parentMessageId", args.messageId)
      )
      .order("desc")
      .first();

    if (!latestReply) return null;

    const member = await ctx.db.get(latestReply.memberId);
    if (!member) return null;

    const user = await ctx.db.get(member.userId);
    if (!user) return null;

    return {
      timestamp: latestReply._creationTime,
      userImage: user.image,
      userName: user.name,
    };
  },
});

export const getThreadMessages = query({
  args: {
    parentMessageId: v.id("messages"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const parentMessage = await ctx.db.get(args.parentMessageId);
    if (!parentMessage) throw new Error("Parent message not found");

    const member = await getMember(ctx, parentMessage.workspaceId, userId);
    if (!member) throw new Error("Unauthorized");

    const result = await ctx.db
      .query("messages")
      .withIndex("by_parent_message_id", (q) =>
        q.eq("parentMessageId", args.parentMessageId)
      )
      .order("asc")
      .paginate(args.paginationOpts);

    const messages = await Promise.all(
      result.page.map(async (message) => {
        const messageMember = await ctx.db.get(message.memberId);
        if (!messageMember) return null;

        const user = await ctx.db.get(messageMember.userId);
        if (!user) return null;

        const image = message.image
          ? await ctx.storage.getUrl(message.image)
          : undefined;

        return {
          id: message._id,
          body: message.body,
          image,
          createdAt: message._creationTime,
          updatedAt: message.updatedAt,
          user: {
            id: user._id,
            name: user.name,
            image: user.image,
          },
        };
      })
    );

    return {
      ...result,
      page: messages.filter((m): m is NonNullable<typeof m> => m !== null),
    };
  },
});

export const getThreadSummary = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member) throw new Error("Unauthorized");

    // Get original message author
    const originalMember = await ctx.db.get(message.memberId);
    const originalUser = originalMember
      ? await ctx.db.get(originalMember.userId)
      : null;

    const replies = await ctx.db
      .query("messages")
      .withIndex("by_parent_message_id", (q) =>
        q.eq("parentMessageId", args.messageId)
      )
      .collect();

    const participantIds = new Set<Id<"users">>();
    if (originalUser) participantIds.add(originalUser._id);

    await Promise.all(
      replies.map(async (reply) => {
        const replyMember = await ctx.db.get(reply.memberId);
        if (replyMember) {
          const replyUser = await ctx.db.get(replyMember.userId);
          if (replyUser) participantIds.add(replyUser._id);
        }
      })
    );

    let context = "";
    if (message.channelId) {
      const channel = await ctx.db.get(message.channelId);
      context = channel ? `#${channel.name}` : "";
    } else if (message.conversationId) {
      context = "Direct Message";
    }

    return {
      originalMessage: {
        body: message.body,
        author: originalUser ? originalUser.name : "Unknown",
        createdAt: message._creationTime,
      },
      replyCount: replies.length,
      participantCount: participantIds.size,
      context,
      lastReplyAt:
        replies.length > 0
          ? Math.max(...replies.map((r) => r._creationTime))
          : message._creationTime,
    };
  },
});
