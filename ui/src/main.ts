import { app, BrowserWindow, ipcMain, dialog, globalShortcut, Tray, Menu, nativeImage } from "electron";
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

// Flag to track if app is quitting
let isQuitting = false;

function createWindow() {
  const preload = path.join(__dirname, "preload.js");

  const mainWindow = new BrowserWindow({
    // Make width and height values dynamic based on screen sizes and resolution
    width: 600,
    height: 400,
    show: false, // prevent from automatically showing
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
    // In Hyprland environment, resizable must be set to false to prevent auto-tiling
    resizable: !!inDevelopment, // During dev its difficult to work if it overlaps in center
    movable: false, // [darwin, win32]
    titleBarStyle: "hidden",
  });
  registerListeners(mainWindow);

  // Prevent window from closing, hide it instead (unless app is quitting)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide();
    }
  });


  
  // Only show when the browser has finished loading its contents.
  // Prevents white screen on launch
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.center();


  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  return mainWindow;
}

// Toggle window visibility
function toggleWindow(mainWindow: BrowserWindow) {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}




// Create system tray
let tray: Tray | null = null;

function createTray(mainWindow: BrowserWindow) {
  // Create tray icon using base64 for reliability across dev/prod
  // This is a simple AI/robot icon (16x16 for Windows tray)
  const iconDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0"+
  "IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsAAAA7AAWrWiQkAAAGHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3"+
  "hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG"+
  "9iZTpuczptZXRhLyI+PHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbn"+
  "MjIj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIH"+
  "htbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj48dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVud"+
  "GF0aW9uPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9J3cnPz4slJgLAAAC"+
  "EElEQVQ4T5WQT2hScQDHvz7d8+nWe2hLbW1p29CStaDmImRbsPa/IIpqMBp1GRVEl05B2KlLh0VE0SmCDhEdagc7SX8udlk1sa2"+
  "a89ncWqjvmaW+ns98HULQH7nqc/t9f9/vB34/YH2sgLmZDP8V0+jJS/Gh8YspAE3k5V+xug/fiywn1FdzH1Szc2iGvC9DkcFvHK"+
  "7BgX2TSjaDXEZEb4/nENDaRbZQS2C0u46eP30Eb5M5hAUZp04Mw9jSMk72UEuwp8u9V1FkTDxP48ILGepPBTu2t3aTPdQS0Hra"+
  "0uG0Y9JWxJj1GzbbNkLP6G1kD6TA5/NRaOp3Cqm0iWUbcHfqAKaP7QJ0eqQzWRb1HZ19fT5d5UZbeZgXLec2cJzf272zccDbiU"+
  "RSROjjMjRaCvHPiYZ48vvZL2K0KH+NvfyjQNLajl+9fMY7OtwLRZKQSolY5FeQlxV4drvhanfA//RZDD/WnpQ3VU9QS2qh3bEF"+
  "5kYz5t7zKJZKkJUC3i0sgTNxaNvWDGg0hcpNlaDOwFDRT2u4fvM+pu88RHRVQErM4tHjAG7cfoAlfgU0Q9f+g01tnp7g68j+2dk"+
  "wJLmIrawAPraK0GICofko3oQiYOq0wbwQ8Zc3VTbQ2ltSPhOpN9KUlFUtdmP4mtkkYyZHX2ENDC/JkmrQ6QNVm/UYPDgWGBnpD5"+
  "L5fzDBAlMcmVbyC/d5uOw+o7ULAAAAAElFTkSuQmCC"
  const icon = nativeImage.createFromDataURL(iconDataURL);

  // Resize for proper tray display on Windows
  const resizedIcon = icon.resize({ width: 16, height: 16 });

  tray = new Tray(resizedIcon);


  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('AI Launcher');
  tray.setContextMenu(contextMenu);

  // Click on tray icon to toggle window
  tray.on('click', () => {
    toggleWindow(mainWindow);
  });

  return tray;
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

//Prevent quit when window is closed (tray will remain)
// Similar to default behaviour on MacOS
app.on("window-all-closed", () => {
  // Don't quit the app when all windows are closed since we have a tray
  // The user can quit via the tray menu
});

// MacOS specific doc behaviour
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
): Promise<void> {
  let resolved = false; // Check if the promise has already been resolved to prevent race condtions
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(pythonExecutable, args, {
        env: env,
      });
      pythonProcess = child;

      child.on("error", (err) => {
        console.error("Failed to start python process:", err);
        pythonProcess = null;
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });

      // stdout/stderr can be null if the process fails to spawn.
      if (child.stdout) {
        child.stdout.on("data", (data) => {
          console.log(`Python stdout: ${data}`);
        });
      }

      if (child.stderr) {
        child.stderr.on("data", (data: string) => {
          if (data.includes("Uvicorn running on")) {
            console.log("Python server started successfully");
            resolved = true;
            resolve();
          }
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
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    }
  });
}

app.whenReady().then(async () => {
  ipcMain.handle("select-file", async function () {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile", "openDirectory"],
      title: "Select a file",
    });

    return canceled ? null : filePaths;
  });

  // Only spwan the python process if explictly PYTHON_PATH env is passed
  // or if the app is running as executable in production, else for development
  // run the backend server manually
  let python_path;
  if (!process.defaultApp) {
    console.log("Running packaged app");
    python_path = path.join(process.resourcesPath, "server/server");
  }
  // env variable takes precedence
  if (process.env.PYTHON_PATH) {
    python_path = process.env.PYTHON_PATH;
  }

  console.log("PYPATH", python_path);
  if (python_path) {
    try {
      await startPythonServer(python_path, [], {
        PYTHON_ENV: "production",
      });
    } catch (error) {
      console.error("Failed to start python srever", error);
      dialog.showErrorBox("Backend Error", error.message);
      app.quit();
    }
  }

  const win = createWindow();


  // Create system tray
  createTray(win);

  // Register global shortcut to toggle window
  const ret = globalShortcut.register("CommandOrControl+Shift+Space", () => {
    toggleWindow(win);
  });


  if (!ret) {
    console.log("Global shortcut registration failed");
  }

  if (inDevelopment) {
    installExtensions();
  }
});

app.on('before-quit', () => {
  console.log("about to quit")
  isQuitting = true;
});

app.on("will-quit", () => {
  console.log("will quit")
  // Unregister all shortcuts
  globalShortcut.unregisterAll();

  // Destroy tray
  if (tray) {
    tray.destroy();
  }

  if (pythonProcess) {
    pythonProcess.kill();
  }
});
