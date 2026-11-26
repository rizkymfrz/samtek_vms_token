const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

const DEV_URL = process.env.SAMTEK_DESKTOP_URL || "http://localhost:3000";
const READY_TIMEOUT_MS = 30_000;
let server = null;
let mainWindow = null;

const freePort = () =>
  new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

const waitForServer = async (url) => {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { redirect: "manual" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("The VMS server did not start");
};

const startServer = async () => {
  const root = path.join(process.resourcesPath, "app-server");
  const port = await freePort();
  server = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      COOKIE_SECURE: "false",
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
    },
    stdio: "inherit",
  });
  server.once("exit", () => {
    server = null;
    if (!app.isQuitting) app.quit();
  });
  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url);
  return url;
};

const sendState = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("window:fullscreen", mainWindow.isFullScreen());
};

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    frame: false,
    fullscreen: true,
    icon: path.join(__dirname, "icon.png"),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("enter-full-screen", sendState);
  mainWindow.on("leave-full-screen", sendState);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  const url = app.isPackaged ? await startServer() : DEV_URL;
  await mainWindow.loadURL(url);
};

ipcMain.on("window:minimize", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});
ipcMain.on("window:toggle-fullscreen", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.setFullScreen(!window.isFullScreen());
});
ipcMain.on("window:close", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});
ipcMain.handle("window:is-fullscreen", (event) => {
  return BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false;
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
  app.on("before-quit", () => {
    app.isQuitting = true;
    server?.kill();
  });
  app.on("window-all-closed", () => app.quit());
  app.whenReady().then(createWindow);
}
