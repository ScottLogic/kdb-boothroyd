import CryptoJS from "crypto-js";
import fs from "fs";
import Server from "./types/server";
import { Script } from "vm";

export function replaceAtIndex<T>(array: T[], item: T, index: number) {
  return Object.assign([], array, { [index]: item });
}

export function removeAtIndex<T>(array: T[], index: number) {
  return array.filter((_, i) => i !== index);
}

const KEY = "87EqHhoZB6aQau";
export function encryptWithAES(text: string): string {
  return CryptoJS.AES.encrypt(text, KEY).toString();
}

export function decryptWithAES(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}

export function applyCustomAuth(pluginPath: string, server: Server): Server {
  try {
    const plugin = fs.readFileSync(pluginPath, "utf-8");
    const context = { server };
    const script = new Script(plugin);
    script.runInNewContext(context);
    console.log("Context", context);
    return context.server;
  } catch (e) {
    console.log("e", e);
    return server;
  }
}
