import React, { createContext, useContext, useEffect, useState } from "react";

export interface Shortcut {
  accelerator: string;
  description: string;
  handler: (e: KeyboardEvent) => void;
}

export interface ShortcutContext {
  shortcuts: Shortcut[] | Shortcut;
  registerShortcut: (shortcut: Shortcut[] | Shortcut) => void;
  unregisterShortcut: (shortcut: Shortcut[] | Shortcut) => void;
}

const ShortcutContext = createContext<ShortcutContext | undefined>(undefined);

type ShortcutProviderProps = {
  children: React.ReactNode;
};

export default function ShortcutProvider({ children }: ShortcutProviderProps) {
  const [shortcuts, setShortcut] = useState<Set<Shortcut>>(new Set());

  const registerShortcut = (shortcut: Shortcut | Shortcut[]) => {
    const newShortcuts = !Array.isArray(shortcut) ? [shortcut] : shortcut;

    // Only add shortcuts not currently in the shortcuts array
    setShortcut((prevShortcuts) => prevShortcuts.union(new Set(newShortcuts)));
  };

  const unregisterShortcut = (shortcut: Shortcut | Shortcut[]) => {
    const oldShortcuts = !Array.isArray(shortcut) ? [shortcut] : shortcut;

    setShortcut((prevShortcuts) =>
      prevShortcuts.difference(new Set(oldShortcuts)),
    );
  };

  useEffect(() => {
    // console.log(shortcuts);
    const eventHandlers: ((e: KeyboardEvent) => void)[] = [];

    shortcuts.forEach((shortcut) => {
      const shortcutHandler = (e: KeyboardEvent) => {
        // TODO: Make handing accelerators more robust. This breaks if keys provided in differnt order
        const acc = `${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key.toUpperCase()}`;
        if (acc == shortcut.accelerator) {
          shortcut.handler(e);
        }
      };
      eventHandlers.push(shortcutHandler);
      window.addEventListener("keydown", shortcutHandler);
    });

    return () => {
      // console.log("Dismounting", eventHandlers);
      eventHandlers.forEach((handler) => {
        window.removeEventListener("keydown", handler);
      });
    };
  }, [shortcuts]);

  return (
    <ShortcutContext.Provider
      value={{
        shortcuts: Array.from(shortcuts),
        registerShortcut,
        unregisterShortcut,
      }}
    >
      {children}
    </ShortcutContext.Provider>
  );
}

export const useShortcutContext = () => {
  const context = useContext(ShortcutContext);
  if (context == null) {
    throw new Error("Component must be inside Shortcut Provider");
  }
  return context;
};
