import { GetMessagesReturnType } from "@/features/messages/api/use-get-message";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import React from "react";
import Message from "./message";
import ChannelHero from "./channel-hero";

interface MessageListProps {
  channelName?: string;
  channelCreationTime?: number;
  data: GetMessagesReturnType | undefined;
  loadMore: () => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  memberName?: string;
  memberImage?: string;
  variant?: "channel" | "thread" | "conversation";
}

const TIME_THRESHOLD = 5; //5 mins

const MessageList = ({
  canLoadMore,
  data,
  isLoadingMore,
  loadMore,
  channelCreationTime,
  channelName,
  memberImage,
  memberName,
  variant,
}: MessageListProps) => {
  const groupedMessages = data?.reduce(
    (groups, message) => {
      if (!message) return groups;
      const date = new Date(message._creationTime);

      const roundedMinutes = Math.floor(date.getMinutes() / 10) * 10;
      const roundedTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        roundedMinutes
      );

      const timeKey = format(roundedTime, "yyyy-MM-dd HH:mm");

      if (!groups[timeKey]) groups[timeKey] = [];

      groups[timeKey].unshift(message);

      return groups;
    },
    {} as Record<string, typeof data>
  );

  console.log(groupedMessages);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);

    if (isToday(date)) {
      return `Today around ${format(date, "HH:mm")}`;
    } else if (isYesterday(date)) {
      return `Yesterday around  ${format(date, "HH:mm")}`;
    }

    return format(date, "EEEE, MMMM d"); // Fallback for other dates
  };

  return (
    <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto  message-scrollbar">
      {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => {
        return (
          <div key={dateKey}>
            <div className="text-center my-2 relative">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm ">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const prevMsg = messages[index - 1];
              const isCompact =
                prevMsg &&
                prevMsg.user?._id === message.user?._id &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(prevMsg._creationTime)
                ) < TIME_THRESHOLD;
              console.log(message.image);

              return (
                <Message
                  key={message._id}
                  id={message._id}
                  memberId={message.memberId}
                  authorImage={message.user.image}
                  authorName={message.user.name}
                  isAuthor={false}
                  body={message.body}
                  image={message.image}
                  reactions={message.reactions}
                  updatedAt={message.updatedAt}
                  createdAt={message._creationTime}
                  threadCount={message.threadCount}
                  threadTimestamp={message.threadTimestamp}
                  threadImage={message.threadImage}
                  isEditing={false}
                  setEditingId={() => {}}
                  isCompact={isCompact}
                  hideThreadButton={false}
                />
              );
            })}
          </div>
        );
      })}
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero name={channelName} creationTime={channelCreationTime} />
      )}
    </div>
  );
};

export default MessageList;
