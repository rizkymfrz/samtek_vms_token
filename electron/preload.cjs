const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("samtekDesktop", {
  minimize: () => ipcRenderer.send("window:minimize"),
  toggleFullscreen: () => ipcRenderer.send("window:toggle-fullscreen"),
  close: () => ipcRenderer.send("window:close"),
  isFullscreen: () => ipcRenderer.invoke("window:is-fullscreen"),
  onFullscreenChange: (listener) => {
    const handler = (_event, value) => listener(value);
    ipcRenderer.on("window:fullscreen", handler);
    return () => ipcRenderer.removeListener("window:fullscreen", handler);
  },
});
