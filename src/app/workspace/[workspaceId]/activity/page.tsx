"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Bell,
  Calendar,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  Circle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useWorkSpaceId } from "@/hooks/use-workspace-id";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

type NotificationType = "info" | "success" | "warning" | "error" | "system";
type NotificationSource =
  | "mention"
  | "subscription"
  | "system"
  | "workspace"
  | "channel"
  | "direct_message";

type FilterType = NotificationType | "undefined" | undefined;
type FilterSource = NotificationSource | "undefined" | undefined;

export default function NotificationsPage() {
  const workspaceId = useWorkSpaceId();
  const [type, setType] = useState<FilterType>(undefined);
  const [source, setSource] = useState<FilterSource>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const notifications = useQuery(api.notification.getWorkspaceNotifications, {
    workspaceId,
    type: type === "undefined" ? undefined : type,
    source: source === "undefined" ? undefined : source,
    startDate: startDate?.getTime(),
    endDate: endDate?.getTime(),
    unreadOnly,
  });

  const markAsRead = useMutation(api.notification.markNotificationAsReadOnView);

  // Setup intersection observer for viewport tracking
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5, // 50% of the element needs to be visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const notificationId = entry.target.getAttribute(
            "data-notification-id"
          );
          if (notificationId) {
            markAsRead({
              notificationId: notificationId as Id<"notifications">,
            });
          }
        }
      });
    }, options);

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [markAsRead]);

  // Observe new notification elements
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    const elements = document.querySelectorAll(".notification-item");
    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [notifications]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "system":
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <Select
            value={type}
            onValueChange={(value) => setType(value as FilterType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undefined">All types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={source}
            onValueChange={(value) => setSource(value as FilterSource)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undefined">All sources</SelectItem>
              <SelectItem value="mention">Mentions</SelectItem>
              <SelectItem value="subscription">Subscriptions</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="workspace">Workspace</SelectItem>
              <SelectItem value="channel">Channel</SelectItem>
              <SelectItem value="direct_message">Direct Messages</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px]">
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PP") : "Pick date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={{ from: startDate, to: endDate }}
                onSelect={({ from, to }: any) => {
                  setStartDate(from);
                  setEndDate(to);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            Unread only
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-h-[90vh] message-scrollbar overflow-y-scroll pb-20  ">
        {notifications?.map((notification) => (
          <div
            key={notification._id}
            data-notification-id={notification._id}
            className={`notification-item p-4 rounded-lg border transition-colors ${
              notification.isRead ? "bg-gray-50" : "bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex flex-col items-center gap-2">
                {getNotificationIcon(notification.type)}
                {notification.isRead ? (
                  <CheckCircle className="h-3 w-3 text-gray-400" />
                ) : (
                  <Circle className="h-3 w-3 text-blue-500 fill-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {format(notification.createdAt, "PP p")}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                {notification.metadata?.url && (
                  <a
                    href={notification.metadata.url}
                    className="text-blue-500 hover:text-blue-600 text-sm mt-2 inline-block"
                  >
                    View details
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {notifications?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );
}
