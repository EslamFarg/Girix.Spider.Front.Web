import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QRCodeComponent } from 'angularx-qrcode';
import { NgxBarcode6 } from 'ngx-barcode6';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { PrintPreview } from '../../../../../../shared/components/print-preview/print-preview';
import { GroupsServices } from '../../../products/groups/services/groups';
import { QrcodeServices } from '../services/qrcode-services';
import { DatePickerModule } from 'primeng/datepicker';

interface GroupLookupItem {
  id: number;
  name: string;
}

interface BarcodePrintRow {
  rowKey: string;
  productCardId: number;
  productCode: string;
  productName: string;
  unitName: string;
  bareCode1: string;
  bareCode2: string;
  manufactureDate: Date;
  expiryDate: Date;
  checked: boolean;
}

interface GeneratedPrintItem {
  productCardId: number;
  productName: string;
  unitName: string;
  barcodeValue: string;
  qrValue: string;
}

type PrintMode = 'barcode' | 'qr';

@Component({
  selector: 'app-explorer-qrcode-printer',
  imports: [
    RouterLink,
    NgSelectComponent,
    DatePickerModule,
    ReactiveFormsModule,
    FormsModule,
    FormError,
    ToggleSwitch,
    PrintPreview,
    NgxBarcode6,
    QRCodeComponent,
  ],
  templateUrl: './explorer-qrcode-printer.html',
  styleUrl: './explorer-qrcode-printer.scss',
})
export class ExplorerQrcodePrinter implements OnInit {
  @ViewChild('printArea') printArea!: ElementRef<HTMLElement>;

  private readonly _destroyRef = inject(DestroyRef);
  private readonly _fb = inject(FormBuilder);
  private readonly _groupsService = inject(GroupsServices);
  private readonly _qrcodeService = inject(QrcodeServices);
  private readonly _messageService = inject(MessageService);

  groupsList: GroupLookupItem[] = [];
  itemsTable: BarcodePrintRow[] = [];
  printItems: GeneratedPrintItem[] = [];
  printMode: PrintMode = 'barcode';
  showPrintPreview = false;
  isSearching = false;
  isPrinting = false;
  checked = true;

  searchForm = this._fb.group({
    groupId: [null as number | null, Validators.required],
    manufactureDate: [new Date(), Validators.required],
    expiryDate: [
      new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      Validators.required,
    ],
  });

  ngOnInit(): void {
    this.loadGroups();
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { groupId, manufactureDate, expiryDate } = this.searchForm.getRawValue();
    if (groupId == null || !manufactureDate || !expiryDate) {
      return;
    }

    this.isSearching = true;
    this.showPrintPreview = false;
    this.printItems = [];

    this._groupsService
      .getByIdWithProductAndUnits(groupId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.isSearching = false;
          const rows = this.mapGroupProducts(res?.data ?? res);
          this.itemsTable = rows.map((row) => ({
            ...row,
            manufactureDate: new Date(manufactureDate),
            expiryDate: new Date(expiryDate),
            checked: true,
          }));
          this.checked = this.itemsTable.length > 0;

          if (!this.itemsTable.length) {
            this._messageService.add({
              severity: 'warn',
              summary: 'تنبيه',
              detail: 'لا توجد أصناف في هذه المجموعة',
            });
          }
        },
        error: () => {
          this.isSearching = false;
          this.itemsTable = [];
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر تحميل أصناف المجموعة',
          });
        },
      });
  }

  removeRow(rowKey: string): void {
    this.itemsTable = this.itemsTable.filter((item) => item.rowKey !== rowKey);
    this.checked =
      this.itemsTable.length > 0 && this.itemsTable.every((item) => item.checked);
  }

  toggleAll(): void {
    this.itemsTable.forEach((item) => (item.checked = this.checked));
  }

  toggleRow(): void {
    this.checked =
      this.itemsTable.length > 0 && this.itemsTable.every((row) => row.checked);
  }

  printBarcode(): void {
    this.printSelected('barcode');
  }

  printQr(): void {
    this.printSelected('qr');
  }

  private loadGroups(): void {
    this._groupsService
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.groupsList = (res?.data?.rows ?? []).map(
            (item: { id: number; nameAr?: string; nameEn?: string }) => ({
              id: item.id,
              name: item.nameAr || item.nameEn || String(item.id),
            })
          );
        },
      });
  }

  private printSelected(mode: PrintMode): void {
    const selected = this.itemsTable.filter((item) => item.checked);

    if (!selected.length) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يجب اختيار صنف واحد على الأقل',
      });
      return;
    }

    const invalidDates = selected.some(
      (item) => !item.manufactureDate || !item.expiryDate
    );
    if (invalidDates) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب اختيار تاريخ الانتاج وتاريخ الانتهاء لكل الأصناف المحددة',
      });
      return;
    }

    const expiredItem = selected.find((item) => this.isExpired(item.expiryDate));
    if (expiredItem) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: `الصنف "${expiredItem.productName}" منتهي الصلاحية`,
      });
      return;
    }

    this.isPrinting = true;
    this.printMode = mode;

    forkJoin(
      selected.map((item) =>
        this._qrcodeService
          .generateQrCode({
            productCardId: item.productCardId,
            qrContent: '',
            qrPixelsPerModule: 0,
            manufactureDate: item.manufactureDate,
            expiryDate: item.expiryDate,
          })
          .pipe(
            map((res: any) => ({ item, res })),
            catchError(() => of({ item, res: null }))
          )
      )
    )
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (results) => {
          this.isPrinting = false;
          const generated: GeneratedPrintItem[] = [];

          results.forEach(({ item, res }) => {
            if (!res?.isSuccess || !res?.data) {
              return;
            }

            generated.push({
              productCardId: item.productCardId,
              productName: res.data.productName ?? item.productName,
              unitName: res.data.unitName ?? item.unitName,
              barcodeValue: res.data.qrContent ?? '',
              qrValue: JSON.stringify({
                productName: res.data.productName ?? item.productName,
                unitName: res.data.unitName ?? item.unitName,
                manufactureDate: this.formatDate(
                  res.data.manufactureDate ?? item.manufactureDate
                ),
                expiryDate: this.formatDate(res.data.expiryDate ?? item.expiryDate),
              }),
            });
          });

          if (!generated.length) {
            this._messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'تعذر إنشاء الباركود للأصناف المحددة',
            });
            return;
          }

          this.printItems = generated;
          this.showPrintPreview = true;
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: `تم إنشاء ${generated.length} ${mode === 'barcode' ? 'باركود' : 'QR Code'}`,
          });
        },
        error: () => {
          this.isPrinting = false;
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر إنشاء الباركود',
          });
        },
      });
  }

  private mapGroupProducts(data: any): Omit<
    BarcodePrintRow,
    'manufactureDate' | 'expiryDate' | 'checked'
  >[] {
    const products = data?.product ?? data?.products ?? [];

    const rows: Omit<BarcodePrintRow, 'manufactureDate' | 'expiryDate' | 'checked'>[] =
      [];

    products.forEach((product: any) => {
      const productCode = product.code ?? '';
      const productName = product.nameAr ?? product.nameEn ?? '';
      const units = product.productCard ?? [];

      units.forEach((unit: any) => {
        const productCardId = Number(unit.id);
        if (!productCardId) {
          return;
        }

        rows.push({
          rowKey: `${product.id}-${productCardId}`,
          productCardId,
          productCode,
          productName,
          unitName: unit.fromUnitName ?? '',
          bareCode1: unit.barcode1 ?? '',
          bareCode2: unit.barcode2 ?? '',
        });
      });
    });

    return rows;
  }

  private isExpired(expiryDate: Date): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return expiry.getTime() < today.getTime();
  }

  private formatDate(value: Date | string): string {
    if (typeof value === 'string') {
      return value.split('T')[0];
    }

    return value.toISOString().split('T')[0];
  }
}
