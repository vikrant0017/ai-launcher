import React, { createContext, useContext, useEffect, useState } from "react";

export interface Shortcut {
  accelerator: string;
  description: string;
  handler: (e: KeyboardEvent) => void;
}

export interface ShortcutContext {
  shortcuts: Shortcut[] | [];
  registerShortcut: (shortcut: Shortcut) => void;
}

const ShortcutContext = createContext<ShortcutContext | undefined>(undefined);

type ShortcutProviderProps = {
  children: React.ReactNode;
};

export default function ShortcutProvider({ children }: ShortcutProviderProps) {
  const [shortcuts, setShortcut] = useState<Shortcut[] | []>([]);

  const registerShortcut = (shortcut: Shortcut | Shortcut[]) => {
    const newShortcuts = !Array.isArray(shortcut) ? [shortcut] : shortcut;

    setShortcut((prevShortcuts) => [...prevShortcuts, ...newShortcuts]);
  };

  useEffect(() => {
    console.log(shortcuts);
    const eventHandlers: ((e: KeyboardEvent) => void)[] = [];

    shortcuts.forEach((shortcut) => {
      const shortcutHandler = (e: KeyboardEvent) => {
        const acc = `${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key.toUpperCase()}`;
        if (acc == shortcut.accelerator) {
          shortcut.handler(e);
        }
      };
      eventHandlers.push(shortcutHandler);
      window.addEventListener("keydown", shortcutHandler);
    });

    return () => {
      eventHandlers.forEach((handler) => {
        window.removeEventListener("keydown", handler);
      });
    };
  }, [shortcuts]);

  return (
    <ShortcutContext.Provider value={{ shortcuts, registerShortcut }}>
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
