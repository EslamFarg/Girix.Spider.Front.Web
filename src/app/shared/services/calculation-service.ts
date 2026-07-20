import { inject, Injectable } from '@angular/core';
import { ApplicationSettingsModel } from '../../features/dashboard/pages/settings/models/application-settings';
import { ApplicationSettingsService } from './application-settings-service';

export type DiscountSource = 'percent' | 'amount' | 'none';

export interface LineCalculationInput {
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  discountSource?: DiscountSource;
  vatRate?: number;
  selectiveTaxRate?: number;
  /** Proportional share of invoice-level discount applied before VAT */
  invoiceDiscountShare?: number;
}

export interface LineCalculationResult {
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountPercent: number;
  discountAmount: number;
  amountAfterDiscount: number;
  vatAmount: number;
  selectiveTaxAmount: number;
  totalDiscount: number;
  netLineTotal: number;
}

export interface InvoiceLineTotalsInput {
  quantity?: number;
  total?: number;
  discountAmount?: number;
  totalDiscount?: number;
  vat?: number;
  vatDiscount?: number;
  net?: number;
}

export interface InvoiceTotalsResult {
  totalQuantities: number;
  subtotal: number;
  totalDiscounts: number;
  totalVat: number;
  totalSelectiveTax: number;
  invoiceNetTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalculationService {
  private settingsService = inject(ApplicationSettingsService);

  getSettings(): ApplicationSettingsModel | null {
    return this.settingsService.settingsSignal() as ApplicationSettingsModel | null;
  }

  isTaxInclusive(): boolean {
    return (this.getSettings()?.discountMethod ?? 2) === 1;
  }

  round(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
  }

  roundQuantity(value: number): number {
    const decimals = this.getSettings()?.decimalQuantity ?? 0;
    return this.round(value, decimals);
  }

  roundPrice(value: number): number {
    const decimals = this.getSettings()?.decimalPrice ?? 0;
    return this.round(value, decimals);
  }

  calculateDiscount(
    lineTotal: number,
    discountPercent: number,
    discountAmount: number,
    discountSource: DiscountSource = 'none',
  ): { discountPercent: number; discountAmount: number } {
    const safeLineTotal = this.roundPrice(lineTotal);
    let percent = Number(discountPercent) || 0;
    let amount = this.roundPrice(Number(discountAmount) || 0);

    if (discountSource === 'percent') {
      amount = this.roundPrice(safeLineTotal * (percent / 100));
    } else if (discountSource === 'amount') {
      percent = safeLineTotal > 0 ? (amount / safeLineTotal) * 100 : 0;
    } else if (percent > 0) {
      amount = this.roundPrice(safeLineTotal * (percent / 100));
    }

    return { discountPercent: percent, discountAmount: amount };
  }

  calculateVAT(taxableAmount: number, vatRate: number, taxInclusive?: boolean): number {
    const amount = this.roundPrice(taxableAmount);
    const rate = Number(vatRate) || 0;
    if (amount <= 0 || rate <= 0) {
      return 0;
    }

    const inclusive = taxInclusive ?? this.isTaxInclusive();
    if (inclusive) {
      return this.roundPrice((amount * rate) / (100 + rate));
    }

    return this.roundPrice(amount * (rate / 100));
  }

  calculateSelectiveTax(amountAfterDiscount: number, selectiveTaxRate: number): number {
    const amount = this.roundPrice(amountAfterDiscount);
    const rate = Number(selectiveTaxRate) || 0;
    const minimum = Number(this.getSettings()?.minimumSelectiveTax) || 0;

    if (amount <= 0 || rate <= 0 || amount < minimum) {
      return 0;
    }

    return this.roundPrice(amount * (rate / 100));
  }

  calculateLine(input: LineCalculationInput): LineCalculationResult {
    const quantity = this.roundQuantity(Number(input.quantity) || 0);
    const unitPrice = this.roundPrice(Number(input.unitPrice) || 0);
    const lineTotal = this.roundPrice(quantity * unitPrice);

    const discount = this.calculateDiscount(
      lineTotal,
      input.discountPercent ?? 0,
      input.discountAmount ?? 0,
      input.discountSource ?? 'none',
    );

    const invoiceShare = this.roundPrice(Number(input.invoiceDiscountShare) || 0);
    const totalLineDiscount = this.roundPrice(discount.discountAmount + invoiceShare);
    const amountAfterDiscount = this.roundPrice(Math.max(0, lineTotal - totalLineDiscount));

    const vatAmount = this.calculateVAT(amountAfterDiscount, input.vatRate ?? 0);
    const selectiveTaxAmount = this.calculateSelectiveTax(amountAfterDiscount, input.selectiveTaxRate ?? 0);

    const taxInclusive = this.isTaxInclusive();
    const netLineTotal = taxInclusive
      ? this.roundPrice(amountAfterDiscount + selectiveTaxAmount)
      : this.roundPrice(amountAfterDiscount + vatAmount + selectiveTaxAmount);

    return {
      quantity,
      unitPrice,
      lineTotal,
      discountPercent: discount.discountPercent,
      discountAmount: discount.discountAmount,
      amountAfterDiscount,
      vatAmount,
      selectiveTaxAmount,
      totalDiscount: totalLineDiscount,
      netLineTotal,
    };
  }

  /**
   * Distributes invoice-level discount proportionally by line total (before line discount).
   */
  distributeInvoiceDiscount(
    lineTotals: number[],
    invoiceDiscountPercent = 0,
    invoiceDiscountAmount = 0,
  ): number[] {
    if (!lineTotals.length) {
      return [];
    }

    const subtotal = lineTotals.reduce((sum, value) => sum + value, 0);
    let totalInvoiceDiscount = this.roundPrice(Number(invoiceDiscountAmount) || 0);

    if (Number(invoiceDiscountPercent) > 0) {
      totalInvoiceDiscount = this.roundPrice(subtotal * (Number(invoiceDiscountPercent) / 100));
    }

    if (subtotal <= 0 || totalInvoiceDiscount <= 0) {
      return lineTotals.map(() => 0);
    }

    const shares = lineTotals.map((lineTotal) =>
      this.roundPrice(totalInvoiceDiscount * (lineTotal / subtotal)),
    );

    const distributed = shares.reduce((sum, value) => sum + value, 0);
    const remainder = this.roundPrice(totalInvoiceDiscount - distributed);
    if (remainder !== 0 && shares.length > 0) {
      shares[shares.length - 1] = this.roundPrice(shares[shares.length - 1] + remainder);
    }

    return shares;
  }

  calculateInvoiceTotals(lines: InvoiceLineTotalsInput[]): InvoiceTotalsResult {
    let totalQuantities = 0;
    let subtotal = 0;
    let totalDiscounts = 0;
    let totalVat = 0;
    let totalSelectiveTax = 0;
    let invoiceNetTotal = 0;

    lines.forEach((line) => {
      totalQuantities += Number(line.quantity) || 0;
      subtotal += Number(line.total) || 0;
      totalDiscounts += Number(line.totalDiscount) || Number(line.discountAmount) || 0;
      totalVat += Number(line.vat) || 0;
      totalSelectiveTax += Number(line.vatDiscount) || 0;
      invoiceNetTotal += Number(line.net) || 0;
    });

    return {
      totalQuantities: this.roundQuantity(totalQuantities),
      subtotal: this.roundPrice(subtotal),
      totalDiscounts: this.roundPrice(totalDiscounts),
      totalVat: this.roundPrice(totalVat),
      totalSelectiveTax: this.roundPrice(totalSelectiveTax),
      invoiceNetTotal: this.roundPrice(invoiceNetTotal),
    };
  }

  inferVatRate(
    vatAmount: number,
    quantity: number,
    unitPrice: number,
    discountAmount: number,
  ): number {
    const lineTotal = this.roundPrice(this.roundQuantity(quantity) * this.roundPrice(unitPrice));
    const amountAfterDiscount = this.roundPrice(Math.max(0, lineTotal - (Number(discountAmount) || 0)));
    const vat = Number(vatAmount) || 0;

    if (amountAfterDiscount <= 0 || vat <= 0) {
      return 0;
    }

    if (this.isTaxInclusive()) {
      return (vat / (amountAfterDiscount - vat)) * 100;
    }

    return (vat / amountAfterDiscount) * 100;
  }

  inferSelectiveTaxRate(
    selectiveTaxAmount: number,
    quantity: number,
    unitPrice: number,
    discountAmount: number,
  ): number {
    const lineTotal = this.roundPrice(this.roundQuantity(quantity) * this.roundPrice(unitPrice));
    const amountAfterDiscount = this.roundPrice(Math.max(0, lineTotal - (Number(discountAmount) || 0)));
    const selectiveTax = Number(selectiveTaxAmount) || 0;

    if (amountAfterDiscount <= 0 || selectiveTax <= 0) {
      return 0;
    }

    return (selectiveTax / amountAfterDiscount) * 100;
  }
}
