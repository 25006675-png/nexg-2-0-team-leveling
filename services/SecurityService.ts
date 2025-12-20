import CryptoJS from 'crypto-js';

const DEMO_SECRET_KEY = "MYKAD_HACKATHON_2025";

export const encryptPayload = (data: any): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, DEMO_SECRET_KEY).toString();
};

export const decryptPayload = (ciphertext: string): any | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, DEMO_SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
