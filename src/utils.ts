import CryptoJS from "crypto-js";

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
