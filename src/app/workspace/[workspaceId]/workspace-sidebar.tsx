import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
} from "lucide-react";

import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkSpaceId } from "@/hooks/use-workspace-id";
import WorkspaceHeader from "./workspace-header";
import SidebarItem from "./sidebar-item";
import { UseGetChannels } from "@/features/channels/api/use-get-channels";
import WorkspaceSection from "./workspace-section";
import { useGetMembers } from "@/features/members/api/use-get-member";
import UserItem from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-get-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";

const WorkspaceSideBar = () => {
  const memberId = useMemberId();
  const channelId = useChannelId();

  const workspaceId = useWorkSpaceId();
  const [, setOpen] = useCreateChannelModal();
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  const { data: channels, isLoading: channelsLoading } = UseGetChannels({
    workspaceId,
  });

  if (workspaceLoading || memberLoading || membersLoading || channelsLoading)
    return (
      <div className="flex flex-col bg-[#5E2C4F] h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  if (!member || !workspace)
    return (
      <div className="flex flex-col gap-y-2 bg-[#5E2C4F] h-full items-center justify-center">
        <AlertTriangle className="size-5   text-white" />
        <p className="text-white">Workspace not found</p>
      </div>
    );
  return (
    <div className="flex flex-col bg-[#5E2C4F] h-full">
      <WorkspaceHeader
        isAdmin={member.role === "admin"}
        workspace={workspace}
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" Icon={MessageSquareText} id={channelId} />
      </div>

      <WorkspaceSection
        label="Channels"
        hint="New channel"
        onNew={
          member.role === "admin"
            ? () => {
                setOpen(true);
              }
            : undefined
        }
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            Icon={HashIcon}
            label={item.name}
            id={item._id}
            variant={channelId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection label="Direct messages">
        {members?.map((item) => (
          <UserItem
            variant={item._id === memberId ? "active" : "default"}
            id={item._id}
            image={item.user.image}
            label={item.user.name}
            key={item._id}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};

export default WorkspaceSideBar;
