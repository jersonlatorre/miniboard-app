import { app } from 'electron'
import BrowserWinHandler from './BrowserWinHandler'

const winHandler = new BrowserWinHandler({
	width: 800,
	height: 600,
	autoHideMenuBar: true,
  backgroundColor: '#000'
})

winHandler.onCreated((browserWindow) => {
	winHandler.loadPage('/')
	// Or load custom url
	// _browserWindow.loadURL('https://google.com')
})

app.on('window-all-closed', function() {
	app.quit()
})
