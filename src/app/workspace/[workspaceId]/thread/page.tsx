"use client";

import { usePaginatedQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useWorkSpaceId } from "@/hooks/use-workspace-id";
import ThreadCard from "./_component/thread-card";
import { api } from "../../../../../convex/_generated/api";
import { ThreadSummary } from "../../../../../convex/thread";

export default function ThreadsPage() {
  const workspaceId = useWorkSpaceId();

  const {
    results: threads,
    isLoading,
    loadMore,
    status,
  } = usePaginatedQuery(
    api.thread.getAllThreads,
    {
      workspaceId,
    },
    { initialNumItems: 3 }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">All Threads</h1>
      <div className="grid gap-4 max-h-[80vh] overflow-y-auto message-scrollbar">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread as ThreadSummary} />
        ))}
      </div>
      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(10)}
          className="text-sm text-muted-foreground hover:text-primary transition"
        >
          Load more threads
        </button>
      )}
    </div>
  );
}
