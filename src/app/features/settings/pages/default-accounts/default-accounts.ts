import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { BaseComponent } from '@/components';
import {
  FixedFinancialAccountService,
  IFixedFinancialAccountPatchRow,
  IFixedFinancialAccountRow,
} from '../../services/fixed-financial-account-service';
import {
  FinancialAccountSearchEnum,
  FinancialAccountService,
} from '@/features/accounts/services/financial-account-service';
import { IFinancialAccountSearchRow } from '@/features/accounts/types';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

type IAppDefaultAccountItemControls = ControlsOf<IFixedFinancialAccountPatchRow>;
interface IDefaultAccountRow {
  account: IFixedFinancialAccountRow;
  formGroup: FormGroup<IAppDefaultAccountItemControls>;
}

@Component({
  selector: 'app-default-accounts',
  imports: [SectionWrapper, InputErrorMessageHandler, Select, Button, ReactiveFormsModule, InputText, TranslatePipe, LoadingDisabledDirective],
  templateUrl: './default-accounts.html',
  styleUrl: './default-accounts.css',
})
export class DefaultAccounts extends BaseComponent {
  fixedFinancialAccountService = inject(FixedFinancialAccountService);
  financialAccountService = inject(FinancialAccountService);

  defaultAccountRows = signal<IDefaultAccountRow[]>([]);
  allAccounts = signal<IFinancialAccountSearchRow[]>([]);

  changedDefaultAccounts: IFixedFinancialAccountPatchRow[] = [];

  ngOnInit() {
    this.fixedFinancialAccountService.getAll().subscribe({
      next: (res) => {
        this.defaultAccountRows.set(
          res.rows.map((item) => ({
            account: item,
            formGroup: this.fb.group<IAppDefaultAccountItemControls>({
              id: this.fb.control(item.id, [Validators.required]),
              refFinancalId: this.fb.control(item.refFinancalId, [Validators.required]),
            }),
          })),
        );
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

  onFgChange(fg: FormGroup<IAppDefaultAccountItemControls>) {
    //check if fixed account exists
    const existingChangedDefaultAccount = this.changedDefaultAccounts.find((item) => item.id === fg.value.id);

    if (fg.invalid) return;

    if (existingChangedDefaultAccount) {
      existingChangedDefaultAccount.refFinancalId = fg.value.refFinancalId!;
    } else {
      this.changedDefaultAccounts.push(fg.value as IFixedFinancialAccountPatchRow);
    }
  }

  onSave() {
    if (this.changedDefaultAccounts.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لم تتم تغييرات للحفظ' });
      return;
    }
    this.fixedFinancialAccountService.patchAccouts(this.changedDefaultAccounts);
  }
}
