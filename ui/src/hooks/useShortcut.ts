import { Shortcut, useShortcutContext } from "@/components/ShortcutProvider";
import { useEffect } from "react";

export const useShortcut = (
  accelerator: string,
  description: string,
  handler: (e: KeyboardEvent) => void,
) => {
  const { registerShortcut, unregisterShortcut } = useShortcutContext();
  useEffect(() => {
    const shortcut = {
      accelerator,
      description,
      handler,
    };
    registerShortcut(shortcut);

    return () => {
      unregisterShortcut(shortcut);
    };
  }, []);
};
