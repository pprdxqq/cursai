require("dotenv").config();`n`nconst { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer } = require("electron");
const path = require("path");
const OpenAI = require("openai");

let win;
let client = null;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return client;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL("http://localhost:5173");
}

ipcMain.handle("get-sources", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 1920, height: 1080 }
  });

  return sources.map(source => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL()
  }));
});

ipcMain.handle("ask-ai", async (_, message) => {
  const openai = getOpenAI();

  if (!openai) {
    return {
      success: false,
      error: "OPENAI_API_KEY fehlt."
    };
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: message
    });

    return {
      success: true,
      text: response.output_text
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "OpenAI API Fehler."
    };
  }
});

ipcMain.on("show-window", () => {
  win?.show();
  win?.focus();
});

ipcMain.on("hide-window", () => {
  win?.hide();
});

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("CommandOrControl+Space", () => {
    if (win?.isVisible()) {
      win.hide();
    } else {
      win?.show();
      win?.focus();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

