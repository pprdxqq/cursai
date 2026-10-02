const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cursai", {
  window: {
    toggle: () => ipcRenderer.invoke("window:toggle"),
    show: () => ipcRenderer.invoke("window:show"),
    hide: () => ipcRenderer.invoke("window:hide")
  },
  screen: {
    sources: () => ipcRenderer.invoke("screen:sources"),
    display: () => ipcRenderer.invoke("screen:display")
  },
  system: {
    open: (url) => ipcRenderer.invoke("system:open", url),
    cwd: () => ipcRenderer.invoke("system:cwd")
  },
  ai: {
    ask: (payload) => ipcRenderer.invoke("ai:ask", payload)
  }
});
