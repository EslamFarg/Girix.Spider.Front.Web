import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class CryptoJsService {
   encrypt(plainText: string, password: string='SNBKHT_FIYALA'): string {
    const salt = CryptoJS.lib.WordArray.random(8);

    const keyIv = this.evpBytesToKey(password, salt, 32, 16);

    const key = CryptoJS.lib.WordArray.create(keyIv.words.slice(0, 8), 32);
    const iv = CryptoJS.lib.WordArray.create(keyIv.words.slice(8, 12), 16);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const result = CryptoJS.enc.Utf8.parse('Salted__').concat(salt).concat(encrypted.ciphertext);

    return CryptoJS.enc.Base64.stringify(result);
  }

   decrypt(encryptedBase64: string, password: string='SNBKHT_FIYALA'): string {
    const data = CryptoJS.enc.Base64.parse(encryptedBase64);

    // "Salted__" = first 8 bytes → skip
    const salt = CryptoJS.lib.WordArray.create(data.words.slice(2, 4), 8);
    const ciphertext = CryptoJS.lib.WordArray.create(data.words.slice(4), data.sigBytes - 16);

    const keyIv = this.evpBytesToKey(password, salt, 32, 16);

    const key = CryptoJS.lib.WordArray.create(keyIv.words.slice(0, 8), 32);
    const iv = CryptoJS.lib.WordArray.create(keyIv.words.slice(8, 12), 16);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext } as any, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  private  evpBytesToKey(
    password: string,
    salt: CryptoJS.lib.WordArray,
    keyLength: number,
    ivLength: number,
  ): CryptoJS.lib.WordArray {
    const passwordWA = CryptoJS.enc.Utf8.parse(password);
    const totalLength = keyLength + ivLength;

    let derived = CryptoJS.lib.WordArray.create();
    let block: CryptoJS.lib.WordArray | null = null;

    while (derived.sigBytes < totalLength) {
      const md5 = CryptoJS.algo.MD5.create();

      if (block) md5.update(block);
      md5.update(passwordWA);
      md5.update(salt);

      block = md5.finalize();
      derived.concat(block);
    }

    return CryptoJS.lib.WordArray.create(derived.words, totalLength);
  }
}
