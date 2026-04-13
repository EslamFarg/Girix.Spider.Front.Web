import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { BaseComponent } from '@/components';
import {
  FixedFinancialAccountService,
  IFixedFinancialAccountRow,
} from '../../services/fixed-financial-account-service';
import {
  FinancialAccountSearchEnum,
  FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { IFinancialAccountSearchRow } from '@/features/accounts/types';

@Component({
  selector: 'app-default-accounts',
  imports: [SectionWrapper, InputErrorMessageHandler, Select, Button],
  templateUrl: './default-accounts.html',
  styleUrl: './default-accounts.css',
})
export class DefaultAccounts extends BaseComponent {
  fixedFinancialAccountService = inject(FixedFinancialAccountService);
  financialAccountService = inject(FinancialAccountService);

  defaultAccounts = signal<IFixedFinancialAccountRow[]>([]);
  allAccounts = signal<IFinancialAccountSearchRow[]>([]);
  /**
   *
   */
  constructor() {
    super();

    this.fixedFinancialAccountService.getAll().subscribe({
      next: (res) => {
        this.defaultAccounts.set(res.rows);
      },
    });

    this.financialAccountService
      .search({
        paginationInfo: {
          pageIndex: 0,
          pageSize: 0,
        },
        searchFilters: [
          {
            column: FinancialAccountSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          this.allAccounts.set(res.value.rows);
        },
      });
  }
}
