"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Users, Hash, Calendar } from "lucide-react";
import { mockThreads, type Thread } from "@/lib/mock-data";
import { format } from "date-fns";

function ThreadPage() {
  const [filter, setFilter] = useState<"all" | "channel" | "dm">("all");
  const [sortBy, setSortBy] = useState<"new" | "old">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 4;

  const filterThreads = (threads: Thread[]) => {
    let filtered = [...threads];

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((thread) => thread.type === filter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (thread) =>
          thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.initialMessage
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "new" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredThreads = filterThreads(mockThreads);
  const totalPages = Math.ceil(filteredThreads.length / threadsPerPage);
  const currentThreads = filteredThreads.slice(
    (currentPage - 1) * threadsPerPage,
    currentPage * threadsPerPage
  );

  const groupThreadsByCategory = (threads: Thread[]) => {
    const grouped = threads.reduce(
      (acc, thread) => {
        const category =
          thread.type === "channel" ? "Channels" : "Direct Messages";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(thread);
        return acc;
      },
      {} as Record<string, Thread[]>
    );

    return grouped;
  };

  const groupedThreads =
    filter === "all"
      ? groupThreadsByCategory(currentThreads)
      : { All: currentThreads };

  return (
    <div className="min-h-screen bg-background p-6  overflow-visible  ">
      <div className="max-w-6xl mx-auto  space-y-6      ">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Threads</h1>
          <div className="flex gap-4">
            <Select
              value={filter}
              onValueChange={(value: "all" | "channel" | "dm") =>
                setFilter(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threads</SelectItem>
                <SelectItem value="channel">Channel Threads</SelectItem>
                <SelectItem value="dm">Direct Messages</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value: "new" | "old") => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest First</SelectItem>
                <SelectItem value="old">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[80vh] space-y-6 message-scrollbar ">
          {Object.entries(groupedThreads).map(([category, threads]) => (
            <div key={category} className="space-y-4">
              {filter === "all" && (
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {category === "Channels" ? (
                    <Hash className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                  {category}
                </h2>
              )}
              <div className="grid gap-4 ">
                {threads.map((thread) => (
                  <Card key={thread.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">
                            {thread.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{thread.participantsCount}</span>
                          <Calendar className="h-4 w-4 ml-2" />
                          <span>{format(thread.createdAt, "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        {thread.type === "channel" ? (
                          <Hash className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        {thread.channelName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {thread.initialMessage}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreadPage;
