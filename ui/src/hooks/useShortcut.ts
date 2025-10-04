import { useEffect } from "react";

export const useShortcut = (
  accelerator: string,
  handler: (e: KeyboardEvent) => void,
) => {
  useEffect(() => {
    const shortcutHandler = (e: KeyboardEvent) => {
      const acc = `${e.ctrlKey ? "Ctrl-" : ""}${e.shiftKey ? "Shift-" : ""}${e.key.toUpperCase()}`;
      // console.log(accelerator);
      if (acc == accelerator) {
        handler(e);
      }
    };
    window.addEventListener("keydown", shortcutHandler);

    return () => {
      window.removeEventListener("keydown", shortcutHandler);
    };
  });
};
