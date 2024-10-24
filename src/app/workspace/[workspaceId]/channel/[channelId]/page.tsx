"use client";
import { useChannelId } from "@/hooks/use-channel-id";
import React from "react";

const ChannelIdPage = () => {
  const channelId = useChannelId();
  return <div>{channelId}</div>;
};

export default ChannelIdPage;
