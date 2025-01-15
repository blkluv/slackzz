import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ThumbNail from "./thumbnail";
import ToolBar from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import useConfirm from "@/hooks/use-confirm-tsx";
import { useCreateReactions } from "@/features/reactions/api/use-create-reactions";
import Reactions from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import ThreadBar from "./thread-bar";
import { useGetUserStatus } from "@/features/status/api/use-get-user-status";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isCompact?: boolean;
  isEditing?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  threadName?: string;
  authorId: Id<"users">;
}

const Message = ({
  id,
  memberId,
  body,
  image,
  authorName = "Member",
  authorImage,
  isAuthor,
  authorId,
  reactions,
  createdAt,
  hideThreadButton,
  setEditingId,
  updatedAt,
  isCompact,
  isEditing,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: MessageProps) => {
  const { onOpenMessage, onCloseMessage, parentMessageId, onOpenProfile } =
    usePanel();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete message",
    "Are you sure you want to delete this message? This cannot be undone"
  );
  const { data: userStatus } = useGetUserStatus({ id: authorId });
  const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
  };
  const fallback = authorName.charAt(0).toUpperCase();

  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useRemoveMessage();
  const { mutate: reactMessage, isPending: isReactingMessage } =
    useCreateReactions();

  const isPending = isUpdatingMessage || isReactingMessage;

  const handleReaction = (value: string) => {
    reactMessage(
      { messageId: id, value },
      {
        onError: () => {
          toast.error("Failed to toggle reaction");
        },
      }
    );
  };

  const handleDeleteMessage = async () => {
    const ok = await confirm();

    if (!ok) return;
    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Message deleted");
          if (parentMessageId === id) {
            onCloseMessage();
          }
        },
        onError: () => {
          toast.success("Message Delete failed");
        },
      }
    );
  };

  const handleUpdateMessage = ({ body }: { body: string }) => {
    updateMessage(
      { body, id },
      {
        onSuccess: () => {
          toast.success("Message updated");
          setEditingId(null);
        },
        onError: () => {
          toast.success("Message Update failed");
        },
      }
    );
  };

  if (isCompact)
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-red-100/60 group relative",
            isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]/80",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className=" flex items-start gap-2 ">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdateMessage}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => {
                    setEditingId(null);
                  }}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full ">
                <Renderer value={body} />
                <ThumbNail url={image} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}
                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  onClick={() => onOpenMessage(id)}
                  image={threadImage}
                  timestamp={threadTimestamp}
                  name={threadName}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <ToolBar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id)}
              handleReaction={handleReaction}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleDeleteMessage}
              hideThreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    );
  /* Main  */
  return (
    <>
      <ConfirmDialog />

      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-red-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]/80",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={() => onOpenProfile(memberId)}
            className="relative inline-flex items-center"
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={authorImage} alt={fallback} />
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                  userStatus?.currentStatus == "online"
                    ? "bg-green-400"
                    : "bg-gray-400"
                }`}
                aria-hidden="true"
              />
            </div>
          </button>

          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdateMessage}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => {
                  setEditingId(null);
                }}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden ">
              <div className="text-sm">
                <button
                  className="font-bold text-primary hover:underline "
                  onClick={() => onOpenProfile(memberId)}
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} />
              <ThumbNail url={image} />

              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <ToolBar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleReaction={handleReaction}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleDeleteMessage}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  );
};

export default Message;
