import { Shortcut, useShortcutContext } from "@/components/ShortcutProvider";
import { useEffect } from "react";

export const useShortcut = (
  accelerator: string,
  description: string,
  handler: (e: KeyboardEvent) => void,
) => {
  const { registerShortcut } = useShortcutContext();
  useEffect(() => {
    console.log("register");
    registerShortcut({
      accelerator,
      description,
      handler,
    });
  }, []);
};
