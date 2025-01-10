import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { paginationOptsValidator } from "convex/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

const validateWorkspaceAccess = async (
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">
) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentMember = await ctx.runQuery(api.members.current, {
    workspaceId,
  });

  if (!currentMember) {
    throw new Error("User not in workspace");
  }

  return { userId, currentMemberId: currentMember._id };
};

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    parentMessageId: v.id("messages"),
    threadTitle: v.optional(v.string()),
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    const { currentMemberId } = await validateWorkspaceAccess(
      ctx,
      args.workspaceId
    );

    let threadTitle = args.threadTitle;

    if (args.channelId) {
      const channel = await ctx.db.get(args.channelId);
      if (!channel) {
        throw new Error("Channel not found");
      }
      threadTitle = channel.name;
    }
    const parentMessage = await ctx.db.get(args.parentMessageId);
    if (!parentMessage) {
      throw new Error("Message not found");
    }
    const newThread = await ctx.db.insert("threads", {
      parentMessageId: args.parentMessageId,
      threadLastActivityAt: Date.now(),
      threadTitle,
      threadType: args.channelId ? "channel" : "dm",
      workspaceId: args.workspaceId,
    });
    if (args.channelId) {
      await Promise.all([
        ctx.runMutation(api.threadMembers.createThreadMember, {
          role: "initiator",
          memberId: currentMemberId as Id<"members">,
          threadId: newThread,
        }),
        ctx.runMutation(api.threadMembers.createThreadMember, {
          role: "messageOwner",
          memberId: parentMessage.memberId as Id<"members">,
          threadId: newThread,
        }),
      ]);
    } else {
      const conversationId = await ctx.runMutation(
        api.conversations.createOrGet,
        {
          memberId: currentMemberId,
          workspaceId: args.workspaceId,
        }
      );
      const conversation = await ctx.db.get(conversationId);
      if (!conversation)
        throw new Error(
          "no conversation found, tho this shouldne be happening"
        );
      Promise.all([
        ctx.runMutation(api.threadMembers.createThreadMember, {
          role: "messageOwner",
          memberId: conversation.memberOneId as Id<"members">,
          threadId: newThread,
        }),
        ctx.runMutation(api.threadMembers.createThreadMember, {
          role: "messageOwner",
          memberId: conversation.memberTwoId as Id<"members">,
          threadId: newThread,
        }),
      ]);
    }

    return newThread;
  },
});

export const updateById = mutation({
  args: {
    threadId: v.id("threads"),
    threadLastActivityAt: v.number(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Only update fields that changed
    const updates: Partial<Doc<"threads">> = {
      threadLastActivityAt: args.threadLastActivityAt,
    };

    if (args.title) {
      updates.threadTitle = args.title;
    }

    await ctx.db.patch(args.threadId, updates);
    return thread;
  },
});

export const getAll = query({
  args: {
    workspaceId: v.id("workspaces"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const paginatedThreads = await ctx.db
      .query("threads")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginatedThreads,
      page: await Promise.all(
        paginatedThreads.page.map(async (thread) => {
          const threadMembers = await ctx.db
            .query("threadsMember")
            .withIndex("by_thread_id", (q) => q.eq("threadId", thread._id))
            .collect();

          // Populate members with their user data
          const membersWithUsers = await Promise.all(
            threadMembers.map(async (threadMember) => {
              const member = await ctx.db.get(threadMember.memberId);
              if (!member) {
                throw new Error(`member is not found`);
              }
              const user = await ctx.db.get(member.userId);
              if (!user) {
                throw new Error(`user is not found`);
              }

              return {
                ...threadMember,
                member,
                user,
              };
            })
          );

          return {
            ...thread,
            members: membersWithUsers.filter(
              (m): m is NonNullable<typeof m> => m != null
            ),
          };
        })
      ),
    };
  },
});

// export const getAll = query({
//   args: {
//     workspaceId: v.id("workspaces"),
//     paginateOptions: paginationOptsValidator,
//   },
//   handler: async (ctx, args) => {
//     await validateWorkspaceAccess(ctx, args.workspaceId);

//     const paginatedThreads = await ctx.db
//       .query("threads")
//       .withIndex("by_workspace_id", (q) =>
//         q.eq("workspaceId", args.workspaceId)
//       )
//       .order("desc")
//       .paginate(args.paginateOptions);

//     const threadsWithMembers: {
//       page: ThreadWithMembers[];
//       isDone: boolean;
//       continueCursor?: string;
//     } = {
//       page: await Promise.all(
//         paginatedThreads.page.map(async (thread) => {
//           const threadMembers = await ctx.runQuery(
//             api.threads.getThreadMember,
//             {
//               threadId: thread._id,
//             }
//           );
//           return {
//             thread,
//             threadMembers,
//           };
//         })
//       ),
//       isDone: paginatedThreads.isDone,
//       continueCursor: paginatedThreads.continueCursor,
//     };

//     return threadsWithMembers;
//   },
// });

export const getById = query({
  args: {
    workspaceId: v.id("workspaces"),
    parentMessageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    try {
      await validateWorkspaceAccess(ctx, args.workspaceId);

      const thread = await ctx.db
        .query("threads")
        .withIndex("by_workspace_id_parent_message_id", (q) =>
          q
            .eq("workspaceId", args.workspaceId)
            .eq("parentMessageId", args.parentMessageId)
        )
        .unique();

      if (!thread) {
        return null;
      }

      const threadMembers: Doc<"threadsMember">[] = await ctx.runQuery(
        api.threadMembers.getThreadMembers,
        {
          threadId: thread._id,
        }
      );

      return { thread, threadMembers };
    } catch (error) {
      console.error("Error in getById:", error);
      return null;
    }
  },
});

export const remove = mutation({
  args: {
    threadId: v.id("threads"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const { userId, currentMemberId } = await validateWorkspaceAccess(
      ctx,
      args.workspaceId
    );
    if (!userId) throw new Error("UnAuthorized");

    const [currentThreadMember, currentMemberRoleWorkspace] = await Promise.all(
      [
        ctx.runQuery(api.threadMembers.getThreadMember, {
          threadId: args.threadId,
          memberId: currentMemberId,
        }),
        ctx.runQuery(api.members.current, {
          workspaceId: args.workspaceId,
        }),
      ]
    );

    if (!currentThreadMember || !currentMemberRoleWorkspace)
      throw new Error("UnAuthorized");
    if (
      currentThreadMember.role == "member" &&
      currentMemberRoleWorkspace.role == "member"
    )
      throw new Error("UnAuthorized as for do not have access");
    await ctx.runMutation(api.threadMembers.removeAll, {
      threadId: args.threadId,
    });
    return await ctx.db.delete(args.threadId);
  },
});
