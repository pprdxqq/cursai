require("dotenv").config();
const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");
const { execFile } = require("child_process");
const { mouse, keyboard, Button, Key, Point } = require("@nut-tree-fork/nut-js");

let win = null;
let client = null;
const settingsFile = () => path.join(app.getPath("userData"), "settings.json");

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}
function createWindow() {
  win = new BrowserWindow({ width:440,height:720,minWidth:380,minHeight:520,frame:false,transparent:true,resizable:true,alwaysOnTop:true,skipTaskbar:false,show:false,
    webPreferences:{preload:path.join(__dirname,"preload.cjs"),contextIsolation:true,nodeIntegration:false,sandbox:false} });
  win.setAlwaysOnTop(true,"floating"); if(app.isPackaged) win.loadFile(path.join(__dirname,"../dist/index.html")); else win.loadURL("http://localhost:5173"); win.on("closed",()=>{win=null;});
}
function toggleWindow(){ if(!win)createWindow(); if(win.isVisible())win.hide();else{win.show();win.focus();} }
function apiError(e){return e?.error?.message||e?.message||"Unbekannter Fehler.";}

ipcMain.handle("window:toggle",()=>{toggleWindow();return true;});
ipcMain.handle("window:show",()=>{win?.show();win?.focus();return true;});
ipcMain.handle("window:hide",()=>{win?.hide();return true;});
ipcMain.handle("screen:sources",async()=>{const s=await desktopCapturer.getSources({types:["screen","window"],thumbnailSize:{width:1600,height:900}});return s.map(x=>({id:x.id,name:x.name,thumbnail:x.thumbnail.toDataURL()}));});
ipcMain.handle("screen:capture",async()=>{const s=await desktopCapturer.getSources({types:["screen"],thumbnailSize:{width:1920,height:1080}});if(!s[0])throw new Error("Kein Bildschirm gefunden.");return s[0].thumbnail.toDataURL();});
ipcMain.handle("screen:display",()=>{const p=screen.getCursorScreenPoint(),d=screen.getDisplayNearestPoint(p);return{cursor:p,bounds:d.bounds,workArea:d.workArea,scaleFactor:d.scaleFactor};});
ipcMain.handle("system:open",async(_,u)=>{if(typeof u!=="string"||!/^https?:\/\//i.test(u))return false;await shell.openExternal(u);return true;});
ipcMain.handle("system:cwd",()=>process.cwd());

ipcMain.handle("settings:get",()=>{try{return JSON.parse(fs.readFileSync(settingsFile(),"utf8"));}catch{return{voice:true,alwaysOnTop:true,launchOnStartup:false};}});
ipcMain.handle("settings:set",(_,patch)=>{let c={};try{c=JSON.parse(fs.readFileSync(settingsFile(),"utf8"));}catch{}const n={...c,...(patch||{})};fs.mkdirSync(path.dirname(settingsFile()),{recursive:true});fs.writeFileSync(settingsFile(),JSON.stringify(n,null,2));if(typeof n.alwaysOnTop==="boolean")win?.setAlwaysOnTop(n.alwaysOnTop,"floating");if(typeof n.launchOnStartup==="boolean")app.setLoginItemSettings({openAtLogin:n.launchOnStartup});return n;});
ipcMain.handle("agents:status", () => new Promise(resolve => {
  if (process.platform !== "win32") {
    resolve([]);
    return;
  }
  execFile("tasklist", ["/FO", "CSV", "/NH"], { windowsHide: true, maxBuffer: 2e6 }, (err, stdout) => {
    if (err) {
      resolve([]);
      return;
    }
    const names = ["claude", "codex", "cursor", "gemini", "antigravity", "windsurf"];
    const rows = String(stdout).toLowerCase().split(/\\r?\\n/);
    resolve(names.map(name => ({ name, running: rows.some(row => row.includes(name)) })));
  });
}));

ipcMain.handle("pc:position",async()=>{const p=await mouse.getPosition();return{x:p.x,y:p.y};});
ipcMain.handle("pc:move",async(_,x,y)=>{await mouse.setPosition(new Point(Math.round(Number(x)),Math.round(Number(y))));return{success:true};});
ipcMain.handle("pc:click",async(_,b="left")=>{await mouse.click(b==="right"?Button.RIGHT:Button.LEFT);return{success:true};});
ipcMain.handle("pc:scroll",async(_,a)=>{await mouse.scroll(Number(a)||0);return{success:true};});
ipcMain.handle("pc:type",async(_,t)=>{if(typeof t!=="string")throw new Error("Ungültiger Text.");await keyboard.type(t.slice(0,4000));return{success:true};});
ipcMain.handle("pc:press",async(_,name)=>{const m={enter:Key.ENTER,escape:Key.ESC,tab:Key.TAB,space:Key.SPACE,backspace:Key.BACKSPACE,up:Key.UP,down:Key.DOWN,left:Key.LEFT,right:Key.RIGHT,home:Key.HOME,end:Key.END};const k=m[String(name).toLowerCase()];if(!k)throw new Error("Taste nicht erlaubt.");await keyboard.pressKey(k);await keyboard.releaseKey(k);return{success:true};});
ipcMain.handle("pc:hotkey",async(_,keys)=>{if(!Array.isArray(keys)||keys.length<1||keys.length>4)throw new Error("Ungültige Tastenkombination.");const m={ctrl:Key.CTRL,control:Key.CTRL,shift:Key.SHIFT,alt:Key.ALT,win:Key.LEFT_WIN,enter:Key.ENTER,escape:Key.ESC,tab:Key.TAB,space:Key.SPACE,c:Key.C,v:Key.V,x:Key.X,a:Key.A,z:Key.Z,s:Key.S,f:Key.F};const r=keys.map(k=>m[String(k).toLowerCase()]);if(r.some(k=>!k))throw new Error("Tastenkombination enthält nicht erlaubte Tasten.");await keyboard.pressKey(...r);await keyboard.releaseKey(...r);return{success:true};});

ipcMain.handle("ai:ask",async(_,p)=>{const o=getOpenAI();if(!o)return{success:false,error:"OPENAI_API_KEY fehlt."};const msg=typeof p==="string"?p:p?.message;if(!msg?.trim())return{success:false,error:"Keine Nachricht."};try{const r=await o.responses.create({model:process.env.CURSAI_MODEL||"gpt-6-luna",instructions:"You are Cursai, a concise Windows desktop AI companion. Be practical. Never claim a PC action happened unless the app reports success.",input:msg});return{success:true,text:r.output_text||""};}catch(e){return{success:false,error:apiError(e)};}});
ipcMain.handle("ai:vision",async(_,p)=>{const o=getOpenAI();if(!o)return{success:false,error:"OPENAI_API_KEY fehlt."};try{const r=await o.responses.create({model:process.env.CURSAI_VISION_MODEL||"gpt-6-luna",input:[{role:"user",content:[{type:"input_text",text:p?.question||"Analysiere meinen Bildschirm kurz und sage mir, was relevant ist."},{type:"input_image",image_url:p.image,detail:"high"}]}]});return{success:true,text:r.output_text||""};}catch(e){return{success:false,error:apiError(e)};}});
ipcMain.handle("ai:transcribe",async(_,audio)=>{const o=getOpenAI();if(!o)return{success:false,error:"OPENAI_API_KEY fehlt."};try{const file=new File([Buffer.from(audio)],"cursai.webm",{type:"audio/webm"});const r=await o.audio.transcriptions.create({file,model:"gpt-4o-mini-transcribe"});return{success:true,text:r.text||""};}catch(e){return{success:false,error:apiError(e)};}});

app.whenReady().then(()=>{createWindow();globalShortcut.register("CommandOrControl+Space",toggleWindow);app.on("browser-window-created",(_,w)=>w.setMenuBarVisibility(false));});
app.on("window-all-closed",e=>e.preventDefault());app.on("will-quit",()=>globalShortcut.unregisterAll());app.on("before-quit",()=>{if(win&&!win.isDestroyed())win.destroy();});
