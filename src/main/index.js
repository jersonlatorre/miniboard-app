import { app } from 'electron'
import { ipcMain } from 'electron'
import BrowserWinHandler from './BrowserWinHandler'

const winHandler = new BrowserWinHandler({
  width: 500,
  height: 800
  // resizable: false,
  // maximizable: false
})

winHandler.onCreated((browserWindow) => {
  winHandler.loadPage('/')
  // Or load custom url
  // _browserWindow.loadURL('https://google.com')
})

app.on('window-all-closed', function() {
  app.quit()
})
