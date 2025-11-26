// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    showConfirmDialog: (options) =>
        ipcRenderer.invoke("show-confirm-dialog", options),
    send: (channel, data) => ipcRenderer.send(channel, data),
});
