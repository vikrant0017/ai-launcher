import exposeContexts from "./helpers/ipc/context-exposer";

const { contextBridge, ipcRenderer } = window.require("electron");
contextBridge.exposeInMainWorld("widgets", {
  selectFile: () => {
    return ipcRenderer.invoke("select-file");
  },
});

exposeContexts();
