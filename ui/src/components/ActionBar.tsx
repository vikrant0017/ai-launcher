import React from "react";
import { Button } from "./ui/button";
import { Circle, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "./ui/label";

interface ModelSelectionMenuProps {
  initialValue: string;
  menuItems: Record<string, string>;
  onValueChange: (val: string) => void;
}

export function ModeSelectionMenu({
  initialValue,
  menuItems,
  onValueChange,
}: ModelSelectionMenuProps) {
  const [position, setPosition] = React.useState(initialValue);

  const handleValueChange = (val: string) => {
    setPosition(val);
    onValueChange(val);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Button variant="ghost">
            <Circle /> {menuItems[position]}
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup
          value={position}
          onValueChange={handleValueChange}
        >
          {Object.entries(menuItems).map(([key, value]) => (
            <DropdownMenuRadioItem key={key} value={key}>
              {value}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ActionBar({
  navItems,
  onNavItemChange,
  onButtonClick,
}) {
  return (
    <div className="flex justify-between px-8 py-2">
      {/* Use this as a navigation menu*/}
      <ModeSelectionMenu
        initialValue={Object.keys(navItems)[0]}
        menuItems={navItems}
        onValueChange={onNavItemChange}
      />
      <Button variant="ghost" onClick={onButtonClick}>
        <Settings />
        Preferences
      </Button>
    </div>
  );
}
