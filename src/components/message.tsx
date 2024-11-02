import React, { useEffect, useState } from "react";
import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ThumbNail from "./thumbnail";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<
      Doc<"reactions">,
      "memberId" & {
        count: number;
        memberIds: Id<"members">[];
      }
    >
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
}

const Message = ({
  id,
  memberId,
  body,
  image,
  authorName = "Member",
  authorImage,
  isAuthor,
  reactions,
  createdAt,
  hideThreadButton,
  setEditingId,
  updatedAt,
  isCompact,
  isEditing,
  threadCount,
  threadImage,
  threadTimestamp,
}: MessageProps) => {
  const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
  };
  const fallback = authorName.charAt(0).toUpperCase();

  if (isCompact)
    return (
      <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-red-100/60 group relative">
        <div className=" flex items-start gap-2 ">
          <Hint label={formatFullTime(new Date(createdAt))}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {format(new Date(createdAt), "hh:mm")}
            </button>
          </Hint>
          <div className="flex flex-col w-full ">
            <Renderer value={body} />
            <ThumbNail url={image} />
            {updatedAt ? (
              <span className="text-xs text-muted-foreground">(edited)</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  return (
    <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-red-100/60 group relative">
      <div className="flex items-start gap-2">
        <button>
          <Avatar>
            <AvatarImage src={authorImage} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex flex-col w-full overflow-hidden ">
          <div className="text-sm">
            <button
              className="font-bold text-primary hover:underline "
              onClick={() => {}}
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
        </div>
      </div>
    </div>
  );
};

export default Message;
