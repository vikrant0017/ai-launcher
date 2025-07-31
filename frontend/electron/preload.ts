import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  save: (content: string) => ipcRenderer.invoke("save-content", content),
});

// Type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      save: (content: string) => Promise<{ success: boolean; error?: string }>;
    };
  }
}
