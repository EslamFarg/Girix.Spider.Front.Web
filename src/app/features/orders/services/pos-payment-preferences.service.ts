import { Injectable } from '@angular/core';
import { AppPrinterType } from '@/features/printers';
import { OrderPaymentType } from '../types/api/enums';

const STORAGE_KEY = 'posPaymentPreferences';

export interface IPosPrinterPreference {
  id: number;
  appPrinterType: AppPrinterType;
}

/** Last invoice cash/network split (amounts are never persisted). */
export type PosPaymentSplit = 'cash' | 'network' | 'mixed';

export interface IPosPaymentPreferences {
  paymentType: OrderPaymentType;
  /** Derived at save time from cash/network split — not stored amounts. */
  lastPaymentSplit: PosPaymentSplit;
  cashAccountId: number | null;
  networkAccountId: number | null;
  cashierPrinter: IPosPrinterPreference | null;
  captainPrinter: IPosPrinterPreference | null;
  kitchenPrinter: IPosPrinterPreference | null;
}

@Injectable({
  providedIn: 'root',
})
export class PosPaymentPreferencesService {
  load(): IPosPaymentPreferences | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<IPosPaymentPreferences>;
      return {
        paymentType: parsed.paymentType ?? OrderPaymentType.Paid,
        lastPaymentSplit: parsed.lastPaymentSplit ?? 'cash',
        cashAccountId: parsed.cashAccountId ?? null,
        networkAccountId: parsed.networkAccountId ?? null,
        cashierPrinter: parsed.cashierPrinter ?? null,
        captainPrinter: parsed.captainPrinter ?? null,
        kitchenPrinter: parsed.kitchenPrinter ?? null,
      };
    } catch {
      return null;
    }
  }

  save(preferences: IPosPaymentPreferences) {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }
}
