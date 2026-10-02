const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cursai", {
  window:{toggle:()=>ipcRenderer.invoke("window:toggle"),show:()=>ipcRenderer.invoke("window:show"),hide:()=>ipcRenderer.invoke("window:hide")},
  screen:{sources:()=>ipcRenderer.invoke("screen:sources"),capture:()=>ipcRenderer.invoke("screen:capture"),display:()=>ipcRenderer.invoke("screen:display")},
  system:{open:(url)=>ipcRenderer.invoke("system:open",url),cwd:()=>ipcRenderer.invoke("system:cwd")},
  settings:{get:()=>ipcRenderer.invoke("settings:get"),set:(patch)=>ipcRenderer.invoke("settings:set",patch)},
  pc:{position:()=>ipcRenderer.invoke("pc:position"),move:(x,y)=>ipcRenderer.invoke("pc:move",x,y),click:(button)=>ipcRenderer.invoke("pc:click",button),scroll:(amount)=>ipcRenderer.invoke("pc:scroll",amount),type:(text)=>ipcRenderer.invoke("pc:type",text),press:(key)=>ipcRenderer.invoke("pc:press",key),hotkey:(keys)=>ipcRenderer.invoke("pc:hotkey",keys)},
  ai:{ask:(payload)=>ipcRenderer.invoke("ai:ask",payload),vision:(payload)=>ipcRenderer.invoke("ai:vision",payload),transcribe:(audio)=>ipcRenderer.invoke("ai:transcribe",audio)}
});
