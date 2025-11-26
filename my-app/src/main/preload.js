const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  showConfirmDialog: (options) => ipcRenderer.invoke("show-confirm-dialog", options),
  reload: () => ipcRenderer.send("reload-window"),
  getConfig: () => ipcRenderer.invoke("get-config"),
  setConfig: (config) => ipcRenderer.invoke("set-config", config),
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  printHtml: (html) => ipcRenderer.invoke("print-html", { html }),
    getMacAddress: () => ipcRenderer.invoke("get-mac-address"),
});
