import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { ChevronDown } from "lucide-react";
import PreferencesModal from "./preferences-modal";
import InviteModal from "./invite-modal";

interface WorkspaceHeader {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}

const WorkspaceHeader = ({ workspace, isAdmin }: WorkspaceHeader) => {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <>
      <InviteModal
        inviteOpen={inviteOpen}
        setInviteOpen={setInviteOpen}
        name={workspace.name}
        joinCode={workspace.joinCode}
      />
      <PreferencesModal
        open={preferencesOpen}
        setOpen={setPreferencesOpen}
        initialValue={workspace.name.substring(0, 30)}
      />
      <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size={"sm"}
              variant={"transparent"}
              className="font-semibold text-lg w-auto p-1.5 overflow-hidden"
            >
              <span className="truncate">{workspace.name}</span>
              <ChevronDown className="size-4 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-64">
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div className="size-9 relative overflow-hidden bg-[#616061] text-white font-semibold flex text-xl rounded-md items-center justify-center mr-2">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start ">
                <p className="font-bold truncate">
                  {workspace.name.substring(0, 25)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Active workspace
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className=" cursor-pointer py-2 "
                  onClick={() => {
                    setInviteOpen(true);
                  }}
                >
                  <p>
                    Invite people to{" "}
                    <span className="truncate"># {workspace.name}</span>
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className=" cursor-pointer py-2  "
                  onClick={() => {
                    setPreferencesOpen(true);
                  }}
                >
                  Preferences
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <div className="flex items-center gap-0.5">
          <Hint label="Filter conversations" side="bottom">
            <Button size={"iconSm"} variant={"transparent"}>
              <Filter className="size-4" />
            </Button>
          </Hint>
          <Hint label="New message" side="bottom">
            <Button size={"iconSm"} variant={"transparent"}>
              <SquarePen className="size-4" />
            </Button>
          </Hint>
        </div> */}
      </div>
    </>
  );
};

export default WorkspaceHeader;
