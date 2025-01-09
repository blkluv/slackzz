"use client";

import React, { useState } from "react";
import { useCurrentUser } from "../api/use-current-user";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader, LogOut } from "lucide-react";
import { GoDotFill } from "react-icons/go";
import { FaRegCalendarCheck, FaPencil } from "react-icons/fa6";
import { IoDiamondOutline } from "react-icons/io5";
import Typography from "./typography";
import { useSubscription } from "@/hooks/use-subscription";

function UserButton() {
  const { data, isLoading: isLoadingCurrentUser } = useCurrentUser();
  const [isAway, setIsAway] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { isLoading: isLoadingSubscription, isSubscribed } = useSubscription();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      console.error("Error during sign-out", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoadingSubscription || isLoadingCurrentUser) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!data) return null;
  const { image, name, email } = data;

  const avatarFallback =
    name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || "?";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Popover>
              <PopoverTrigger>
                <div className="h-10 w-10 relative cursor-pointer">
                  <div className="h-full w-full rounded-lg overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={image} alt={name || "user"} />
                      <AvatarFallback className="bg-sky-500">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute z-10 rounded-full -right-[20%] -bottom-1">
                      <GoDotFill
                        className={isAway ? "text-gray-400" : "text-green-600"}
                        size={17}
                      />
                    </div>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent side="right" className="w-64">
                <div className="flex flex-col space-y-4">
                  <div className="flex space-x-3">
                    <Avatar>
                      <AvatarImage src={image} alt={name || "user"} />
                      <AvatarFallback className="bg-sky-500">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Typography
                        text={name || email || "User"}
                        variant="p"
                        className="font-bold"
                      />
                      <div className="flex items-center space-x-1">
                        <GoDotFill
                          className={
                            isAway ? "text-gray-400" : "text-green-600"
                          }
                          size={17}
                        />
                        <span className="text-xs">
                          {isAway ? "Away" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border group cursor-pointer p-1 rounded flex items-center space-x-2">
                    <FaRegCalendarCheck className="group-hover:hidden" />
                    <FaPencil className="hidden group-hover:block" />
                    <Typography
                      text="Set status..."
                      variant="p"
                      className="text-xs text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => setIsAway(!isAway)}
                      className="text-left hover:bg-blue-700 hover:text-white px-2 py-1 rounded"
                    >
                      <Typography
                        variant="p"
                        text={isAway ? "Set as active" : "Set as away"}
                      />
                    </button>
                    {!isSubscribed && (
                      <div
                        onClick={() => {
                          router.replace("/subscription");
                        }}
                        className="flex gap-2 items-center hover:bg-blue-700 hover:text-white px-2 py-1 rounded cursor-pointer"
                      >
                        <IoDiamondOutline className="text-orange-400" />
                        <Typography
                          variant="p"
                          text="Upgrade workspace"
                          className="text-sm"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleSignOut}
                      disabled={isLoggingOut}
                      className="flex items-center space-x-2 text-left hover:bg-blue-700 hover:text-white px-2 py-1 rounded disabled:opacity-50"
                    >
                      <LogOut className="size-4" />
                      <Typography
                        variant="p"
                        text={isLoggingOut ? "Logging out..." : "Sign out"}
                      />
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="text-white bg-black border-black"
          side="right"
        >
          <Typography text={name || email || "User"} variant="p" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default UserButton;
