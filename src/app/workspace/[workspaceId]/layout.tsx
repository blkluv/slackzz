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

interface WorkspaceIdLayoutProps {
  children: ReactNode;
}
function WorkspaceIdLayout({ children }: WorkspaceIdLayoutProps) {
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
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default WorkspaceIdLayout;
