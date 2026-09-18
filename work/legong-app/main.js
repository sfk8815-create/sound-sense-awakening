"use strict";

const { app, BrowserWindow, ipcMain, session, shell, Menu } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const APP_ROOT = path.join(__dirname, "app");
const ICON_PATH = path.join(__dirname, "build", "icon.ico");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2"
};

let mainWindow = null;

function startLocalServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      let pathname = "/home.html";
      try {
        pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
      } catch (error) {
        pathname = "/home.html";
      }
      if (pathname === "/" || pathname === "") pathname = "/home.html";

      const filePath = path.join(APP_ROOT, pathname.replace(/^\/+/, ""));
      if (!filePath.startsWith(APP_ROOT)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
          response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("404 Not Found");
          return;
        }
        response.writeHead(200, {
          "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
          "Cache-Control": "no-cache"
        });
        fs.createReadStream(filePath).pipe(response);
      });
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

async function createWindow() {
  const port = await startLocalServer();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: "音感觉醒",
    icon: ICON_PATH,
    backgroundColor: "#0b0f14",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadURL(`http://127.0.0.1:${port}/home.html`);

  mainWindow.on("enter-full-screen", () => {
    if (mainWindow) mainWindow.webContents.send("fullscreen-changed", true);
  });
  mainWindow.on("leave-full-screen", () => {
    if (mainWindow) mainWindow.webContents.send("fullscreen-changed", false);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://127.0.0.1")) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.on("toggle-fullscreen", () => {
  if (!mainWindow) return;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

ipcMain.handle("get-fullscreen", () => (mainWindow ? mainWindow.isFullScreen() : false));

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (
      permission === "media" ||
      permission === "audioCapture" ||
      permission === "microphone" ||
      permission === "midi" ||
      permission === "midiSysex"
    ) {
      callback(true);
      return;
    }
    callback(false);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return (
      permission === "media" ||
      permission === "audioCapture" ||
      permission === "microphone" ||
      permission === "midi" ||
      permission === "midiSysex"
    );
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
