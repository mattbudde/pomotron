const {app, BrowserWindow, ipcMain, Tray, nativeImage, autoUpdater, systemPreferences} = require('electron');
const path = require('path');
const assetsDir = path.join(__dirname, 'assets');
const {appUpdater} = require('./assets/js/autoupdater');
const isDev = require('electron-is-dev');

let tray = undefined;
let window = undefined;

function isWindowsOrmacOS() {
  return process.platform === 'darwin' || process.platform === 'win32';
}
// This method is called once Electron is ready to run our code
// It is effectively the main method of our Electron app
app.on('ready', () => {
  // Setup the menubar with an icon
  if(systemPreferences.isDarkMode(true)) {
    var icon = `assets/img/icon-dark.png`
  } else {
    var icon = `assets/img/icon.png`
  };
  tray = new Tray(icon)

  app.once('did-frame-finish-load', () => {
    const checkOS = isWindowsOrmacOS();
    if (checkOS && !isDev) {
      appUpdater();
    };
  });
  // Add a click handler so that when the user clicks on the menubar icon, it shows
  // our popup window
  tray.on('click', function(event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })

  // Make the popup window for the menubar
  window = new BrowserWindow({
    width: 305,
    height: 200,
    show: false,
    frame: false,
    resizable: false,
  })

  // Tell the popup window to load our index.html file
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Only close the window on blur if dev tools isn't opened
  window.on('blur', () => {
    if(!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
})

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds()
  const windowPos = window.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }

  window.setPosition(x, y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})