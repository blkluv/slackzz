import { useGetMemberById } from "@/features/members/api/use-get-member-by-id";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useMemberId } from "@/hooks/use-member-id";
import { useGetMessages } from "@/features/messages/api/use-get-message";
import { Loader } from "lucide-react";
import Header from "./header";
import ChatInput from "./chat-input";
import MessageList from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";

interface ConversationProps {
  id: Id<"conversations">;
}

const Conversation = ({ id }: ConversationProps) => {
  const { onOpenProfile } = usePanel();

  const memberId = useMemberId();

  const { data: member, isLoading: memberLoading } = useGetMemberById({
    id: memberId,
  });

  const { loadMore, results, status } = useGetMessages({
    conversationId: id,
  });
  if (memberLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => onOpenProfile(memberId)}
      />
      <MessageList
        memberImage={member?.user.image}
        memberName={member?.user.name}
        canLoadMore={status === "CanLoadMore"}
        isLoadingMore={status === "LoadingMore"}
        loadMore={loadMore}
        data={results}
        variant="conversation"
      />
      <ChatInput
        conversationId={id}
        placeholder={`Message ${member?.user.name}`}
      />
    </div>
  );
};

export default Conversation;
