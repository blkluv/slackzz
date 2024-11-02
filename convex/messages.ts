import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

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

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
  return ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();
};

const populateThreads = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId)
    )
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  if (!lastMessageMember)
    return {
      count: messages.length,
      image: undefined,
      timestamp: 0,
    };

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
  };
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
    });
    return messageId;
  },
});

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("UnAuthorized");

    let conversationId = args.conversationId;

    if (args.parentMessageId && !args.conversationId && !args.channelId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new Error("Not found");
      conversationId = parentMessage.conversationId;
    }

    const result = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: (
        await Promise.all(
          result.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member.userId) : null;

            if (!user || !member) return null;

            const reactions = await populateReactions(ctx, message._id);
            const thread = await populateThreads(ctx, message._id);

            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            const reactionsWithCounts = reactions.map((rec) => {
              return {
                ...rec,
                count: reactions.filter((r) => r.value === rec.value).length,
              };
            });

            const dedupedReactions = reactionsWithCounts.reduce(
              (acc, rec) => {
                const existingReaction = acc.find((r) => r.value === rec.value);

                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, rec.memberId])
                  );
                } else {
                  acc.push({ ...rec, memberIds: [rec.memberId] });
                }
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[]
            );

            const reactionsWithoutMemberIdProperty = dedupedReactions.map(
              ({ memberId, ...rest }) => rest
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperty,
              threadCount: thread.count,
              threadImage: thread.image,
              threadTimestamp: thread.timestamp,
            };
          })
        )
      ).filter(
        (message): message is NonNullable<typeof message> => message != null
      ),
    };
  },
});
