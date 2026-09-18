"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("legongNative", {
  isElectron: true,
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),
  getFullscreen: () => ipcRenderer.invoke("get-fullscreen"),
  onFullscreenChange: (callback) => {
    ipcRenderer.on("fullscreen-changed", (event, value) => callback(value));
  }
});
