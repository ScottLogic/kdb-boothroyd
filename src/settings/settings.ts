import path from "path";
import fs from "fs/promises";

interface SettingsData {
  customAuthPlugin?: string[];
  autoUpdate: boolean;
  splitterSizes: number[];
}

export default class Settings {
  data: SettingsData = {
    autoUpdate: true,
    splitterSizes: [40, 60],
  };
  filePath: string = "";
  loaded: boolean = false;
  private static instance: Settings;

  constructor(userData: string) {
    if (!Settings.instance) {
      this.filePath = path.join(userData, "settings.json");
      Settings.instance = this;
    }
    return Settings.instance;
  }

  static getInstance() {
    return this.instance;
  }

  static async init(userData: string): Promise<Settings> {
    const settings = new Settings(userData);

    if (!settings.loaded) {
      await settings.loadData();
    }

    return new Promise((resolve) => resolve(settings));
  }

  set(key: keyof SettingsData, value: any, persist: boolean = true) {
    this.data[key] = value;
    if (persist) this.save();
  }

  get(key: keyof SettingsData): any {
    return this.data[key];
  }

  async loadData() {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      this.data = JSON.parse(raw);
      console.log("DATA", this.data);
    } catch (e) {
      console.log("E", e);
      if (e === "ENOENT") this.save();
    }
    this.loaded = true;
  }

  async save() {
    await fs.writeFile(this.filePath, JSON.stringify(this.data), "utf-8");
  }
}
