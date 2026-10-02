require("dotenv").config();
const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");

let win = null;
let client = null;
let tray = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 620,
    minWidth: 360,
    minHeight: 480,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.setAlwaysOnTop(true, "floating");
  win.loadURL("http://localhost:5173");
  win.on("closed", () => { win = null; });
}

function toggleWindow() {
  if (!win) createWindow();
  if (win.isVisible()) win.hide();
  else { win.show(); win.focus(); }
}

ipcMain.handle("window:toggle", () => { toggleWindow(); return true; });
ipcMain.handle("window:show", () => { win?.show(); win?.focus(); return true; });
ipcMain.handle("window:hide", () => { win?.hide(); return true; });

ipcMain.handle("screen:sources", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 1280, height: 720 }
  });
  return sources.map(s => ({
    id: s.id,
    name: s.name,
    thumbnail: s.thumbnail.toDataURL()
  }));
});

ipcMain.handle("screen:display", () => {
  const point = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(point);
  return {
    cursor: point,
    bounds: display.bounds,
    workArea: display.workArea,
    scaleFactor: display.scaleFactor
  };
});

ipcMain.handle("system:open", async (_, target) => {
  if (typeof target !== "string") return false;
  await shell.openExternal(target);
  return true;
});

ipcMain.handle("system:cwd", () => process.cwd());

ipcMain.handle("ai:ask", async (_, payload) => {
  const openai = getOpenAI();
  if (!openai) return { success: false, error: "OPENAI_API_KEY fehlt." };
  const message = typeof payload === "string" ? payload : payload?.message;
  if (!message?.trim()) return { success: false, error: "Keine Nachricht." };

  try {
    const response = await openai.responses.create({
      model: process.env.CURSAI_MODEL || "gpt-5.6-luna",
      input: message
    });
    return { success: true, text: response.output_text || "" };
  } catch (error) {
    return { success: false, error: error?.message || "OpenAI API Fehler." };
  }
});

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("CommandOrControl+Space", toggleWindow);

  app.on("browser-window-created", (_, window) => {
    window.setMenuBarVisibility(false);
  });
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("before-quit", () => {
  if (win && !win.isDestroyed()) win.destroy();
});
