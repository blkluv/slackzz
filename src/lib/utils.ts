import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { ImagesRouter } from "@/app/api/uploadthing/core";
import { ThreadSummary } from "../../convex/thread";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const UploadButton = generateUploadButton<ImagesRouter>();
export const UploadDropzone = generateUploadDropzone<ImagesRouter>();

export const filterThreads = (threads: ThreadSummary[], searchTerm: string) => {
  if (searchTerm.length == 0) return threads;
  return threads.filter(
    (thread) =>
      thread.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const sortThreads = (
  threads: ThreadSummary[],
  sortBy: string,
  sortOrder: "asc" | "desc"
) => {
  return [...threads].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "lastReplyAt":
        comparison = a.lastReplyAt - b.lastReplyAt;
        break;
      case "participantCount":
        comparison = a.participantCount - b.participantCount;
        break;
      case "replyCount":
        comparison = a.replyCount - b.replyCount;
        break;
      default:
        return 0;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });
};
