import UserButton from "@/features/auth/components/user-button";
import React from "react";
import WorkspaceSwitcher from "./workspace-switcher";
import SideBarButton from "./sidebar-buttons";
import { Bell, Home } from "lucide-react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathName = usePathname();
  return (
    <aside className="w-[70px] h-full  bg-[#481349] flex flex-col gap-y-4  items-center pt-[9px] pb-4">
      <WorkspaceSwitcher />
      <SideBarButton
        Icon={Home}
        label="Home"
        isActive={pathName.includes("/workspace")}
      />
      {/* <SideBarButton
        Icon={MessagesSquare}
        label="DMs"
        isActive={pathName.includes("/dms")}
      /> */}
      <SideBarButton
        Icon={Bell}
        label="Activity"
        isActive={pathName.includes("/activity")}
      />
      {/* <SideBarButton
        Icon={MoreHorizontal}
        label="More"
        isActive={pathName.includes("/more")}
      /> */}
      <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
        <UserButton />
      </div>
    </aside>
  );
};

export default Sidebar;
