import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { TreeModule } from 'primeng/tree';
import { MenuItem, TreeNode } from 'primeng/api';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import {
  FinancialAccountSearchEnum,
  FinancialAccountService,
 } from '../../services/financial-account-service';
import { Validators } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { ITreeFinancialAccountSearchRow } from '../../services/financial-account-types';

@Component({
  selector: 'app-accounts-tree',
  imports: [SectionWrapper, TreeModule, InputErrorMessageHandler, Select, Button, InputText],
  templateUrl: './accounts-tree.html',
  styleUrl: './accounts-tree.css',
})
export class AccountsTree extends BaseComponent {
  financialAccountService = inject(FinancialAccountService);

  financialAccountsNodes = signal<TreeNode[]>([
    {
      label: 'حسابات',
      children: [
        {
          label: 'حساب 1',
          children: [
            { label: 'حساب 1.1', children: [{ label: 'حساب 1.1.1', children: [{ label: 'حساب 1.1.1.1' }] }] },
            { label: 'حساب 1.2' },
            { label: 'حساب 1.3' },
            { label: 'حساب 1.4' },
          ],
        },
        { label: 'حساب 2' },
        { label: 'حساب 3' },
        { label: 'حساب 4' },
      ],
    },
    {
      label: 'فاتورات',
      children: [{ label: 'فاتورة 1' }, { label: 'فاتورة 2' }, { label: 'فاتورة 3' }, { label: 'فاتورة 4' }],
    },
    {
      label: 'تقارير',
      children: [{ label: 'تقرير 1' }, { label: 'تقرير 2' }, { label: 'تقرير 3' }, { label: 'تقرير 4' }],
    },
  ]);

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<FinancialAccountSearchEnum>(FinancialAccountSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.fg.patchValue({ searchEnum: FinancialAccountSearchEnum.Name }),
    },
    {
      label: 'FinNumber',
      command: (event) => this.fg.patchValue({ searchEnum: FinancialAccountSearchEnum.FinNumber }),
    },
  ]);

  constructor() {
    super();

    this.searchFinancialAccounts(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];

  financialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  financialAccountsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  searchFinancialAccounts(pageIndex: number) {
    this.financialAccountService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: this.fg.getRawValue().searchEnum,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          const mappedFinancialAccounts: TreeNode[] = res.value.rows.map((item) => ({
            label: item.name,
            data: item.id,
            children: item.children.map((child) => ({
              label: child.name,
              data: child.id,
              children: child.children.map((grandChild) => ({
                label: grandChild.name,
                data: grandChild.id,
              })),
            })),
          }));

          this.financialAccountsNodes.set(mappedFinancialAccounts);
          this.financialAccountsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchFinancialAccounts(1);

  onPageChange = (event: PaginatorState) => this.searchFinancialAccounts(event.page! + 1);

  deleteFinancialAccount(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف المنتج',
      header: 'حذف المنتج',
      icon: 'pi pi-info-circle',
      rejectLabel: 'الغاء',
      rejectButtonProps: {
        label: 'الغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'حذف',
        severity: 'danger',
      },

      accept: () => {
        this.financialAccountService.delete(id).subscribe({
          next: () => {
            this.searchFinancialAccounts(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
