// electron/config.js
import fs from "fs";
import path from "path";
import { app } from "electron";

const configPath = path.join(app.getPath("userData"), "config.json");

// Default config
const defaultConfig = {
  printer: "",
  companyName: "",
  location: "",
  phoneNumber: "",
  description: ""
};

export const loadConfig = () => {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf8");
      return JSON.parse(data);
    } else {
      saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (err) {
    console.error("Error loading config:", err);
    return defaultConfig;
  }
};

export const saveConfig = (newConfig) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  } catch (err) {
    console.error("Error saving config:", err);
  }
};
