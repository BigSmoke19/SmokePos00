import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig, saveConfig } from "../renderer/config.js";
import pdfPrinter from "pdf-to-printer";
const { print, getPrinters } = pdfPrinter;
import os from 'os';
import { spawn} from "child_process";
import waitOn from "wait-on";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !!process.env.VITE_DEV_SERVER_URL;


let mariaProcess = null;

import net from "net";


function waitForPort(port, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const socket = net.connect(port, "127.0.0.1", () => {
        socket.end();
        resolve(true);
      });

      socket.on("error", () => {
        if (Date.now() - start >= timeout) {
          reject(new Error("Timed out waiting for MariaDB port"));
        } else {
          setTimeout(check, 500);
        }
      });
    };

    check();
  });
}

const startMariaDB = () => {
  return new Promise((resolve, reject) => {
    const basePath = app.isPackaged
      ? path.join(process.resourcesPath, "mariadb")
      : path.join(process.cwd(), "resources", "mariadb");

    const mysqldPath = path.join(basePath, "bin", "mysqld.exe");
    const dataPath = path.join(basePath, "data");
    const iniPath = path.join(basePath, "my.ini");

    console.log("Starting MariaDB...");

    mariaProcess = spawn(
      mysqldPath,
      [
        `--defaults-file=${iniPath}`,
        `--datadir=${dataPath}`,
        "--console"
      ],
      {
        cwd: path.join(basePath, "bin"),
        windowsHide: true
      }
    );

    mariaProcess.stderr.on("data", d => console.log("[MariaDB ERR]", d.toString()));
    mariaProcess.stdout.on("data", d => console.log("[MariaDB OUT]", d.toString()));

    waitForPort(3306)
      .then(() => {
        console.log("✔ MariaDB is ready.");
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};


/*const startMariaDB = () => {
  return new Promise((resolve,reject) => {
     const basePath = app.isPackaged
    ? path.join(process.resourcesPath, "mariadb")
    : path.join(process.cwd(), "resources", "mariadb");

  const mysqldPath = path.join(basePath, "bin", "mysqld.exe");
  const dataPath = path.join(basePath, "data");
  const iniPath = path.join(basePath, "my.ini");

  console.log("mysqldPath:", mysqldPath);
  console.log("iniPath:", iniPath);
  console.log("cwd:", basePath);

  mariaProcess = spawn(mysqldPath, [
    `--defaults-file=${iniPath}`,
    `--datadir=${dataPath}`,
    "--console"
  ], {
    cwd: basePath,     // ⭐ CRITICAL
    windowsHide: true
  });
 // --- Handle errors ---
    mariaProcess.on("error", (err) => {
      console.error("MariaDB failed to start:", err);
      reject(err);
    });

    // --- Detect startup completion ---
    mariaProcess.stdout.on("data", (data) => {
      const text = data.toString();

      console.log("MariaDB:", text);

      if (text.includes("ready for connections")) {
        console.log("MariaDB is ready ✔");
        resolve();
      }
    });

    mariaProcess.stderr.on("data", (data) => {
      console.error("MariaDB ERROR:", data.toString());
    });

    // --- Safety timeout ---
    setTimeout(() => {
      reject(new Error("MariaDB startup timeout after 15s"));
    }, 15000);
  });
};*/
let mainWindow;

async function createWindow() {
  try{
    console.log("Starting MariaDB...");
    await startMariaDB();

    console.log("✔ MariaDB started.");

    console.log("Waiting for API...");
    await waitOn({ resources: ["http://localhost:8000/api/Users"] });

    console.log("✔ API ready. Launching UI...");

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL("http://localhost:5173");

    } catch (err) {
    console.error("❌ Failed to start DB:", err);

    // Show error window instead of crashing silently
    const errorWin = new BrowserWindow({
      width: 500,
      height: 300,
      icon: path.join(__dirname,'logo.ico')
    });

    errorWin.loadURL(
      `data:text/html,<h2>Database failed to start 😢</h2><pre>${err}</pre>`
    );
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("show-confirm-dialog", async (event, options) => {
    const response = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["Yes", "Cancel"],
      defaultId: 1,
      title: options.title || "Confirm",
      message: options.message || "Are you sure you want to proceed?",
      noLink: true,
    });


    return response.response;
  });

    ipcMain.on("reload-window", () => {
      if (mainWindow) mainWindow.reload();
    });

      ipcMain.handle("get-printers", async () => {
    try {
      return await getPrinters();
    } catch (err) {
      console.error("Error fetching printers:", err);
      return [];
    }
  });

  ipcMain.handle("print-pdf", async (event, { filePath, printerName }) => {
    try {
      await print(filePath, { printer: printerName });
      return { success: true };
    } catch (err) {
      console.error("Printing failed:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("get-config", () => loadConfig());
  ipcMain.handle("set-config", (event, newConfig) => {
    saveConfig(newConfig);
    return newConfig;
  });
});


ipcMain.handle("print-html", async (event, { html }) => {
  try {
    // Load saved printer from config
    const config = loadConfig();
    const printerName = config?.printer || "";

    const printWin = new BrowserWindow({ show: false });
    printWin.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

    // Wait for content to finish loading
    await new Promise((resolve) => printWin.webContents.once("did-finish-load", resolve));

    printWin.webContents.print(
      { deviceName: printerName },
      (success, errorType) => {
        if (!success) console.error("Print failed:", errorType);
        printWin.close();
      }
    );

    return { success: true };
  } catch (err) {
    console.error("print-html error:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("get-mac-address", () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.mac;
      }
    }
  }
  return null;
});

app.on("before-quit", () => {
  if (mariaProcess) {
    mariaProcess.kill("SIGINT");
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});