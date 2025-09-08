import { SAVE_TEXT } from "./file-channels";

export function exposeFileContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("file", {
    save: (text: string) => {
      ipcRenderer.invoke(SAVE_TEXT, text);
    },
  });
}
