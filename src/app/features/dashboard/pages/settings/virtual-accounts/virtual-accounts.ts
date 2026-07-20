import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AccountsService } from '../../accounts-parent/accounts/services/accounts-service';
import { FixedAccountRow } from '../models/fixed-account';
import { FixedAccountService } from '../services/fixed-account-service';

interface LookupItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-virtual-accounts',
  imports: [NgSelectComponent, FormsModule],
  templateUrl: './virtual-accounts.html',
  styleUrl: './virtual-accounts.scss',
})
export class VirtualAccounts implements OnInit {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _fixedAccountService = inject(FixedAccountService);
  private readonly _accountsService = inject(AccountsService);
  private readonly _messageService = inject(MessageService);

  fixedAccounts: FixedAccountRow[] = [];
  chartOfAccounts: LookupItem[] = [];
  isSaving = false;
  isLoading = false;

  ngOnInit(): void {
    this.loadPageData();
  }

  save(): void {
    const payload = this.fixedAccounts
      .filter((item) => item.accountId != null)
      .map((item) => ({
        fixedAccountCode: item.fixedAccountCode,
        financialAccountId: item.accountId as number,
      }));

    if (!payload.length) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى اختيار حساب مقابل واحد على الأقل',
      });
      return;
    }

    this.isSaving = true;
    this._fixedAccountService
      .update(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم حفظ الحسابات الافتراضية بنجاح',
          });
        },
        error: () => {
          this.isSaving = false;
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر حفظ الحسابات الافتراضية',
          });
        },
      });
  }

  private loadPageData(): void {
    this.isLoading = true;

    forkJoin({
      fixedAccounts: this._fixedAccountService.getAll(),
      chartOfAccounts: this._accountsService.getAllWithoutPagination(),
    })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: ({ fixedAccounts, chartOfAccounts }: any) => {
          this.chartOfAccounts = this.flattenAccounts(
            chartOfAccounts?.data?.data ?? chartOfAccounts?.data ?? []
          );

          const rows = this.extractFixedAccountRows(fixedAccounts?.data);
          this.fixedAccounts = rows.map((item) => this.mapFixedAccountRow(item));
          this.fixedAccounts.forEach((item) =>
            this.ensureAccountOption(item.accountId, item.counterpartName)
          );
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر تحميل الحسابات الافتراضية',
          });
        },
      });
  }

  private extractFixedAccountRows(data: unknown): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    return (data as { rows?: any[] })?.rows ?? [];
  }

  private mapFixedAccountRow(item: any): FixedAccountRow {
    const accountId = item.accountId ?? item.financialAccountId ?? null;

    return {
      fixedAccountCode: item.fixedAccountCode ?? item.code ?? item.id,
      nameAr: item.nameAr ?? item.fixedAccountName ?? '',
      nameEn: item.nameEn ?? item.fixedAccountName ?? '',
      accountId: accountId != null ? Number(accountId) : null,
      counterpartName: item.financialAccountName ?? item.counterAccountName ?? null,
    };
  }

  private flattenAccounts(data: any[]): LookupItem[] {
    const result: LookupItem[] = [];

    const flatten = (items: any[]) => {
      items.forEach((item) => {
        const code = item.accountCode ?? item.code ?? '';
        const name = item.name ?? item.nameAr ?? item.nameEn ?? '';
        result.push({
          id: item.id,
          name: code && name ? `${code} - ${name}` : String(name || code || item.id),
        });

        if (item.children?.length) {
          flatten(item.children);
        }
      });
    };

    flatten(Array.isArray(data) ? data : []);
    return result;
  }

  private ensureAccountOption(id?: number | null, fallbackName?: string | null): void {
    if (id == null) {
      return;
    }

    if (!this.chartOfAccounts.some((item) => item.id === id)) {
      this.chartOfAccounts = [
        ...this.chartOfAccounts,
        { id, name: fallbackName?.trim() || String(id) },
      ];
    }
  }
}
