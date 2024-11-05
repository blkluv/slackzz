"use client";

import React, { ReactNode } from "react";
import Toolbar from "./toolbar";
import Sidebar from "./sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WorkspaceSideBar from "./workspace-sidebar";
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import Thread from "@/features/messages/component/thread";

interface WorkspaceIdLayoutProps {
  children: ReactNode;
}
function WorkspaceIdLayout({ children }: WorkspaceIdLayoutProps) {
  const { onCloseMessage, parentMessageId } = usePanel();

  const showPanel = !!parentMessageId;

  return (
    <div className="h-full ">
      <Toolbar />

      <div className="flex h-[calc(100vh-40px)] ">
        <Sidebar />

        <ResizablePanelGroup autoSave="workspace-layout" direction="horizontal">
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#5E2C5F]"
          >
            <WorkspaceSideBar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20}>{children}</ResizablePanel>
          {showPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={20} defaultSize={29}>
                {parentMessageId ? (
                  <Thread
                    messageId={parentMessageId as Id<"messages">}
                    onCloseMessage={onCloseMessage}
                  />
                ) : (
                  <div className="flex items-center h-full justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default WorkspaceIdLayout;
