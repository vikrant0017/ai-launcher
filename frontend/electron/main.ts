import { app, globalShortcut, BrowserWindow, screen, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import Storage from "./storage";

import {spawn, ChildProcess, execFile} from 'node:child_process'
// import process from "node:process";


function startProcess() {
  console.log('STARTING PROCESS******')
  const execPath = process.env.BACKEND_EXEC_PATH  // abs path to python path

  const childProcess = spawn(execPath, {
    env: {...process.env},
    stdio: ['pipe', 'pipe' , 'pipe'],
    shell: true,
    windowsHide: true
  });
  
  childProcess.stdout.on("data", (data) => {
    console.log(`stdout:${data}`)
  })

  childProcess.stderr.on("data", (data) => {
    console.log(`stderr:${data}`)
  })

   // Handle childProcess exit
  childProcess.on('close', (code) => {
    console.log(`Child childProcess exited with code ${code}`);
  });

  // Handle childProcess error
  childProcess.on('error', (error) => {
    console.error('Failed to start childProcess:', error);
  });
}

startProcess()

const contentStore = new Storage(
  (() => {
    let baseDir: string;
    switch (process.platform) {
      case "win32":
        baseDir =
          process.env.APPDATA ||
          path.join(
            process.env.USERPROFILE || "C:\\",
            "AppData",
            "Roaming",
            "AINotes",
          );
        break;
      case "darwin":
        baseDir = path.join(process.env.HOME || "~", "Library", "AINotes");
        break;
      case "linux":
        baseDir = path.join(process.env.HOME || "~", "AINotes");
        break;
      default:
        // Fallback for unknown platforms, though Electron typically targets these three.
        baseDir = path.join(process.env.HOME || "~", "AINotes");
    }
    // Append a directory specific to this application's storage.
    // Using a generic name as app.getName() is not available at this global scope.
    return baseDir;
  })(),
);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}
// Enable usage of Portal's globalShortcuts. This is essential for cases when
// the app runs in a Wayland session.
// app.commandLine.appendSwitch("enable-features", "GlobalShortcutsPortal");
const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  const initialWidth = 600;
  const initialHeight = 300;

  // Calculate center position
  const x = Math.round((screenWidth - initialWidth) / 2);
  const y = Math.round((screenHeight - initialHeight) / 2);

  // Create the browser window.
  // Most of the options have defaults and some options are specific to OS (Windows, Darwin, Linux)
  const mainWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    x: x,
    y: y,
    frame: false,
    show: false,
    alwaysOnTop: true,
    resizable: false, // Prevents auto window tiling in Display Managers like Hyprland
    closable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Comment out DevTools for production launcher
  // mainWindow.webContents.openDevTools();

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//
app.on("ready", () => {
  createWindow();
  // mainWindow.show();

  // Get application name for better logging
  const appName = app.getName();
  console.log(`Application name: ${appName}`);

  // Register a 'CommandOrControl+X' shortcut listener.
  // May not work on some systems
  const ret = globalShortcut.register("CommandOrControl+X", () => {
    console.log("CommandOrControl+X is pressed");
  });

  if (!ret) {
    console.log("registration failed");
  }

  // Check whether a shortcut is registered.
  console.log("Registered?", globalShortcut.isRegistered("CommandOrControl+X"));

  ipcMain.handle("save-content", async (event, content: string) => {
    try {
      console.log("Content", content);
      await contentStore.save(content);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
});

app.on("will-quit", () => {
  // No global shortcuts to unregister anymore, as we are not using them.
  globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
