import { ipcMain } from "electron";
import { SAVE_TEXT } from "./file-channels";
import { writeFile } from "node:fs/promises";

export function addFileListeners() {
  ipcMain.handle(SAVE_TEXT, async (event, text) => {
    await writeFile("./message.txt", text);
    return { success: true };
  });
}
