import { app, BrowserWindow, ipcMain, dialog } from "electron";
import dotenv from "dotenv";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { spawn, ChildProcess } from "child_process";

dotenv.config();
const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,

      preload: preload,
    },
    titleBarStyle: "hidden",
  });
  registerListeners(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

// main.js
async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Run a python server in the background when electron starts before the window is opened
let pythonProcess: ChildProcess | null = null;

function startPythonServer(
  pythonExecutable: string,
  args: string[] = [],
  env = {},
) {
  try {
    const child = spawn(pythonExecutable, args, {
      env: env,
    });
    pythonProcess = child;

    child.on("error", (err) => {
      console.error("Failed to start python process:", err);
      pythonProcess = null;
    });

    // stdout/stderr can be null if the process fails to spawn.
    if (child.stdout) {
      child.stdout.on("data", (data) => {
        console.log(`Python stdout: ${data}`);
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        console.error(`Python stderr: ${data}`);
      });
    }

    child.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      pythonProcess = null;
    });
  } catch (err) {
    console.error("Error spawning python process:", err);
    pythonProcess = null;
  }
}

app.whenReady().then(() => {
  ipcMain.handle("select-file", async function () {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile", "openDirectory"],
      title: "Select a file",
    });

    console.log("hello", filePaths);
    return canceled ? null : filePaths;
  });

  // Only spwan the python process if explictly PYTHON_PATH env is passed
  if (process.env.PYTHON_PATH) {
    startPythonServer(process.env.PYTHON_PATH, [], {
      WATCH_DIR: process.env.WATCH_DIR,
      TRACK_FILEPATH: process.env.TRACK_FILEPATH,
      STORE_PATH: process.env.STORE_PATH,
    });
  }
  createWindow();
  installExtensions();
});

app.on("will-quit", () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
