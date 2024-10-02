const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "src", "assets", "icon.ico"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile(path.join(__dirname, "src", "index.html"));
}

app.whenReady().then(createWindow);

ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.filePaths[0];
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
