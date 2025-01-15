import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetUserStatusProps {
  id: Id<"users">;
}

export const useGetUserStatus = ({ id }: useGetUserStatusProps) => {
  const data = useQuery(api.status.getUserStatus, { userId: id });
  const isLoading = data === undefined;
  return { data, isLoading };
};
