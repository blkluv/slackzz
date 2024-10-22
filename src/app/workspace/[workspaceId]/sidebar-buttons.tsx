import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";

interface SideBarButtonProps {
  Icon: LucideIcon | IconType;
  label: string;
  isActive?: boolean;
}
const SideBarButton = ({ Icon, isActive, label }: SideBarButtonProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group">
      <Button
        className={cn(
          isActive && "bg-accent/20",
          "size-9 p-2 group-hover:bg-accent/20"
        )}
        variant="transparent"
      >
        <Icon className="size-5 text-white group-hover:scale-110 transition-all" />
      </Button>
      <span className="text-[11px] text-white group-hover:text-accent">
        {label}
      </span>
    </div>
  );
};

export default SideBarButton;
