const { app, BrowserWindow } = require("electron");

app.whenReady().then(() => {
  const w = new BrowserWindow({
    width: 500,
    height: 300,
    alwaysOnTop: true,
    frame: false,
    transparent: true
  });

  w.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`
    <body style="margin:0;background:transparent;">
      <div style="
        position:fixed;
        left:100px;
        top:70px;
        width:100px;
        height:100px;
        border:5px solid red;
        border-radius:50%;
        box-shadow:0 0 40px red;
      "></div>
    </body>
  `));
});
