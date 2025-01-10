import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const BATCH_SIZE = 2;

interface UseGetThreadsProps {
  workspaceId: Id<"workspaces">;
}

export type GetThreadsReturnType =
  (typeof api.threads.getAll._returnType)["page"];

export const useGetThreads = ({ workspaceId }: UseGetThreadsProps) => {
  const { loadMore, results, status } = usePaginatedQuery(
    api.threads.getAll,
    {
      workspaceId,
    },
    {
      initialNumItems: BATCH_SIZE,
    }
  );
  return {
    results,
    status,
    loadMore: () => loadMore(BATCH_SIZE),
  };
};
