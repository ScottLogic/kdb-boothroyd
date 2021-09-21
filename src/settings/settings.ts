import path from "path";
import fs from "fs/promises";

interface SettingsData {
  customAuthPlugin?: string;
}

export default class Settings {
  data: SettingsData = {};
  filePath: string = "";
  private static instance: Settings;

  constructor(userData: string) {
    if (!Settings.instance) {
      this.filePath = path.join(userData, "settings.json");
      this.loadData(userData);
      Settings.instance = this;
    }
    return Settings.instance;
  }

  static getInstance() {
    return this.instance;
  }

  static init(userData: string): Settings {
    Settings.instance = new Settings(userData);

    return Settings.instance;
  }

  set(key: keyof SettingsData, value: any) {
    this.data[key] = value;
  }

  get(key: keyof SettingsData): any {
    return this.data[key] || null;
  }

  async loadData(userData: string) {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      this.data = JSON.parse(raw);
    } catch (e) {
      if (e === "ENOENT") {
        this.data = {};
        this.save();
      }
    }
  }

  async save() {
    await fs.writeFile(this.filePath, JSON.stringify(this.data), "utf-8");
  }
}
