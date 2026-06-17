const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 350,
    height: 450,
    frame: false,
    resizable: false,
    x: 1230,
    y: 390
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})