import { IOrderBillReadResponse } from '@/features/orders';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, input, viewChild, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '../base-component/base-component';
import { DatePipe } from '@angular/common';
import { ImgFallback } from '@/directives/img-fallback';

@Component({
  selector: 'app-printable-order-invoice',
  imports: [DatePipe, ImgFallback],
  templateUrl: './printable-order-invoice.html',
  styleUrl: './printable-order-invoice.css',
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrintableOrderInvoice extends BaseComponent {
  data = input<IOrderBillReadResponse | null>();
  html = viewChild<ElementRef<HTMLElement>>('printableOrderInvoice');
  styles = `
  .inner-invoice-wrap {
  background-color: #fff;
      --print-text-gray: #889898;
      border: 1px solid var(--print-text-gray);
      padding: 6px;
      direction: rtl;
      min-width: 100%;
      & *{
        font-size: 14px;
      }
      & .upper-tables-wrapper {
        line-height: 1;
        text-wrap: nowrap;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }
      & table {
        border-collapse: collapse;
      }
      & td,
      & th {
        padding: 4px;
      }

      & .border-b {
        border-bottom: 1px solid var(--print-text-gray);
      }

      & .font-bold {
        font-weight: bold;
      }
 
      & .items-table {
        width: 100%;

        & th:nth-child(1),
        & td:nth-child(1) {
          text-align: right;
        }
        & th:nth-child(2),
        & td:nth-child(2) {
          text-align: center;
        }
        & th:nth-child(3),
        & td:nth-child(3) {
          text-align: left;
        }
      }
    }
  `;
  sanitizedStyles = this.sanitizer.bypassSecurityTrustHtml(this.styles);

  getDiscountAmount() {
    return this.data()?.summary?.discountAmount ?? 0;
  }

  getTotalSelectiveTax() {
    return this.data()?.summary?.totalSelectiveTax ?? 0;
  }

  getTotalAfterDiscount() {
    const totalUnitPrice = this.data()?.summary?.totalUnitPrice ?? 0;
    const discountAmount = this.data()?.summary?.discountAmount ?? 0;

    return totalUnitPrice - discountAmount;
  }

  getTotalBeforeTax() {
    const getTotalAfterDiscount = this.getTotalAfterDiscount();
    const feeAmount = this.data()?.summary?.serviceFee ?? 0;

    return getTotalAfterDiscount + feeAmount;
  }

  loaded=false;

  onLogoLoad(img: HTMLImageElement) {
    console.log("onLogoLoad");
    if (this.loaded) {
      return;
    }
    //convert src to base64
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx!.drawImage(img, 0, 0);

    const base64 = canvas.toDataURL('image/png');
    img.src = base64;

    this.loaded = true;
  }
}
