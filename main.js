const path = require('path')
const { app, BrowserWindow } = require('electron')

let win

function createWindow () {
    win = new BrowserWindow({ width: 1280, height: 720, frame: false, webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: false,
        preload: path.join(__dirname, '/js/preload.js')
      }})
    win.setMenu(null)
    win.loadFile('html/index.html')

    // Uncomment for easy dev tool access
    // win.webContents.openDevTools()

    win.on('closed', () => {
            win = null
    })
}

app.on('ready', createWindow)