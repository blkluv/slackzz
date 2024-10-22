"use client";
import UserButton from "@/features/auth/components/user-button";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-get-workspace-modal";

export default function Home() {
  const [open, setOpen] = useCreateWorkspaceModal();
  const router = useRouter();
  const { data, isLoading } = useGetWorkspaces();
  const workspaceId = useMemo(() => {
    return data?.[0]?._id;
  }, [data]);

  useEffect(() => {
    if (isLoading) return;

    if (workspaceId) {
      router.replace(`/workspace/${workspaceId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [isLoading, workspaceId, open, setOpen, router]);
  return (
    <div>
      <UserButton />
    </div>
  );
}
