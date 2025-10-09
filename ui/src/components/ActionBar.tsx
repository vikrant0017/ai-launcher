import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Circle, Settings } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  route: string;
  shortcut?: string;
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "./ui/label";
import { Kbd } from "./ui/kbd";
import { useShortcut } from "@/hooks";

interface ModelSelectionMenuProps {
  initialValue: string;
  menuItems: MenuItem[];
  onValueChange: (val: string) => void;
  label: string;
}

export function ModeSelectionMenu({
  initialValue,
  menuItems,
  onValueChange,
  label,
}: ModelSelectionMenuProps) {
  const [position, setPosition] = React.useState(initialValue);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useShortcut("Ctrl+M", "Open Select Mode Menu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (btnRef.current) {
      // Verfies if component is mounted before setting state
      setOpen(!open);
    }
  });

  const handleValueChange = (val: string) => {
    setPosition(val);
    onValueChange(val);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <Button variant="ghost" ref={btnRef}>
            {label} <Kbd>Ctrl + M</Kbd>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup
          value={position}
          onValueChange={handleValueChange}
        >
          {menuItems.map((item) => (
            <DropdownMenuRadioItem key={item.id} value={item.id}>
              {item.name}
              {item.shortcut && (
                <DropdownMenuShortcut>
                  <Kbd>{item.shortcut}</Kbd>
                </DropdownMenuShortcut>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ActionBarProps {
  navItems: MenuItem[];
  onNavItemChange: (val: string) => void;
  onButtonClick: () => void;
}

export default function ActionBar({
  navItems,
  onNavItemChange,
  onButtonClick,
}: ActionBarProps) {
  return (
    <div className="flex justify-between px-8 py-2">
      {/* Use this as a navigation menu*/}
      <ModeSelectionMenu
        initialValue={navItems[0].id}
        menuItems={navItems}
        onValueChange={onNavItemChange}
        label="Select Mode"
      />
      <Button variant="ghost" onClick={onButtonClick}>
        <Settings />
        Preferences <Kbd>Ctrl + P</Kbd>
      </Button>
    </div>
  );
}
