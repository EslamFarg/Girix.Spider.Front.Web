import { Injectable, signal } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';
import * as CryptoJS from 'crypto-js';
import { ApplicationSettingsModel } from '../../features/dashboard/pages/settings/models/application-settings';

@Injectable({
  providedIn: 'root',
})
export class ApplicationSettingsService {
  private settings = signal<ApplicationSettingsModel | null>(null);
  settingsSignal = this.settings.asReadonly();

  setSettings(): ApplicationSettingsModel | null {
    const encrypted = localStorage.getItem('applicationSettings');
    if (!encrypted) {
      return null;
    }

    try {
      const secret = APP_CONSTANTS.secretKey;
      const bytes = CryptoJS.AES.decrypt(encrypted, secret);
      const decryptedSettings = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      const applicationSettings = decryptedSettings.applicationSettings as ApplicationSettingsModel;
      this.settings.set(applicationSettings);
      return applicationSettings;
    } catch {
      return null;
    }
  }
}
