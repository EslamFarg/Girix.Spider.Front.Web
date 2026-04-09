import { Component, computed, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { TreeModule } from 'primeng/tree';
import { MenuItem, TreeNode } from 'primeng/api';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import {
  AccountGroup,
  AccountStatus,
  BalanceNature,
  FinalAccountType,
  FinancialAccountSearchEnum,
  FinancialAccountService,
} from '../../services/financial-account-service';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { ITreeFinancialAccountSearchRow } from '../../types';
import { Select } from 'primeng/select';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Menu } from 'primeng/menu';

interface IOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-accounts-tree',
  imports: [
    SectionWrapper,
    TreeModule,
    InputErrorMessageHandler,
    Select,
    Button,
    InputText,
    ReactiveFormsModule,
    Debounce,
    NgSelectComponent,
    InputGroupAddon,
    Menu,
  ],
  templateUrl: './accounts-tree.html',
  styleUrl: './accounts-tree.css',
})
export class AccountsTree extends BaseComponent {
  financialAccountService = inject(FinancialAccountService);

  FinancialAccountSearchEnum = FinancialAccountSearchEnum;
  override FormMode = FormMode;

  financialAccountsNodes = signal<TreeNode[]>([]);
  selectedTreeNode = signal<TreeNode | null>(null);
  selectedFinancialAccount = signal<ITreeFinancialAccountSearchRow | null>(null);
  allFinancialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);

  formMode = computed(() => (this.selectedFinancialAccount() ? FormMode.Update : FormMode.Create));

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<FinancialAccountSearchEnum>(FinancialAccountSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  searchFg = this.fb.group(this.initialSearchFormValue);

  initialFormValue = {
    id: this.fb.control<number | null>({ value: null, disabled: true }, []),
    parentId: this.fb.control<number | null>(null, [Validators.required]),
    currentAccountId: this.fb.control<number | null>(null, []),
    finNumber: this.fb.control<string>({ value: '', disabled: true }, []),
    nameAr: this.fb.control<string>('', [Validators.required, Validators.maxLength(200)]),
    accountGroup: this.fb.control<AccountGroup>(AccountGroup.Assets, [Validators.required]),
    balanceNature: this.fb.control<BalanceNature>(BalanceNature.Debit, [Validators.required]),
    accountStatus: this.fb.control<AccountStatus>(AccountStatus.Active, [Validators.required]),
    finalAccountType: this.fb.control<FinalAccountType>(FinalAccountType.None, [Validators.required]),
  };
  fg = this.fb.group(this.initialFormValue);

  filterOptions: MenuItem[] = [
    {
      label: 'الاسم',
      command: () => this.searchFg.patchValue({ searchEnum: FinancialAccountSearchEnum.Name }),
    },
    {
      label: 'رقم الحساب',
      command: () => {
        this.searchFg.patchValue({ searchEnum: FinancialAccountSearchEnum.FinNumber });
      },
    },
  ];

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  accountGroupOptions: IOption<AccountGroup>[] = [
    { label: 'الاصول', value: AccountGroup.Assets },
    { label: 'الخصوم', value: AccountGroup.Liabilities },
    { label: 'حقوق الملكية', value: AccountGroup.Equity },
    { label: 'الايرادات', value: AccountGroup.Revenues },
    { label: 'المصروفات', value: AccountGroup.Expenses },
  ];

  balanceNatureOptions: IOption<BalanceNature>[] = [
    { label: 'مدين', value: BalanceNature.Debit },
    { label: 'دائن', value: BalanceNature.Credit },
  ];

  accountStatusOptions: IOption<AccountStatus>[] = [
    { label: 'نشط', value: AccountStatus.Active },
    { label: 'غير نشط', value: AccountStatus.Inactive },
    { label: 'مغلق', value: AccountStatus.Closed },
  ];

  finalAccountTypeOptions: IOption<FinalAccountType>[] = [
    { label: 'بدون', value: FinalAccountType.None },
    { label: 'قائمة الدخل', value: FinalAccountType.IncomeStatement },
    { label: 'الميزانية', value: FinalAccountType.BalanceSheet },
  ];

  financialAccounts = signal<ITreeFinancialAccountSearchRow[]>([]);
  parentAccountSearchResults = signal<ITreeFinancialAccountSearchRow[]>([]);
  currentAccountSearchResults = signal<ITreeFinancialAccountSearchRow[]>([]);
  flatFinancialAccounts = computed(() => this.flattenAccounts(this.financialAccounts()));
  currentAccountOptions = computed(() => {
    const selectedAccount = this.selectedFinancialAccount();
    const options = this.currentAccountSearchResults();

    if (!selectedAccount) {
      return options;
    }

    return this.mergeSelectedAccount(options, selectedAccount);
  });
  parentAccounts = computed(() => {
    const currentAccountId = this.fg.controls.currentAccountId.value;
    const selectedParentAccount = this.getSelectedParentAccount();
    const options = this.mergeSelectedAccount(this.parentAccountSearchResults(), selectedParentAccount)
      .filter((item) => item.id !== currentAccountId)
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));

    if (this.formMode() === FormMode.Update && this.fg.controls.parentId.value === -1) {
      return [{ id: -1, name: 'بدون' }, ...options];
    }

    return options;
  });

  financialAccountsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };
  parentAccountsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };
  currentAccountsPaginationInfo: IPaginationInfo = {
    pageIndex: 0,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  constructor() {
    super();
    this.searchFinancialAccounts(1);
    this.searchSelectableAccounts('parent', 1);
    this.searchSelectableAccounts('current', 1);
  }

  searchFinancialAccounts(pageIndex: number, selectedAccountId?: number | null) {
    this.financialAccountService
      .getFinancialAccountTree({
        paginationInfo: {
          pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: this.searchFg.getRawValue().searchEnum,
            values: [this.searchFg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.searchFg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.allFinancialAccounts.set(res.value.rows);
          this.applyTreeFilter();
          this.financialAccountsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };

          if (selectedAccountId) {
            const selected = this.findAccountById(res.value.rows, selectedAccountId);
            if (selected) {
              this.bindFinancialAccount(selected);
            }
          }
        },
      });
  }

  onSubmitSearch = () => this.searchFg.valid && this.applyTreeFilter();

  onPageChange = (event: PaginatorState) => this.searchFinancialAccounts(event.page! + 1);

  onSubmitAccount() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const formValue = this.fg.getRawValue();
    const dto = {
      nameAr: formValue.nameAr,
      nameEn: formValue.nameAr,
      parentId: formValue.parentId!,
      balanceNature: formValue.balanceNature,
      finalAccountType: formValue.finalAccountType,
      accountGroup: formValue.accountGroup,
      accountStatus: formValue.accountStatus,
    };

    switch (this.formMode()) {
      case FormMode.Create:
        this.financialAccountService
          .create({
            createFinancialAccountDto: dto,
          })
          .subscribe({
            next: (createdId) => {
              this.searchFinancialAccounts(1, createdId);
              this.resetFormState();
            },
          });
        break;
      case FormMode.Update:
        this.financialAccountService
          .put({
            createFinancialAccountDto: {
              id: formValue.id!,
              ...dto,
            },
          })
          .subscribe({
            next: (updatedId) => {
              this.searchFinancialAccounts(this.financialAccountsPaginationInfo.pageIndex, updatedId || formValue.id);
            },
          });
        break;
    }
  }

  onResetAccount() {
    this.resetFormState();
  }

  bindFinancialAccount(account: ITreeFinancialAccountSearchRow) {
    this.selectedFinancialAccount.set(account);
    this.fg.patchValue({
      id: account.id,
      parentId: account.parentId ?? -1,
      currentAccountId: account.id,
      finNumber: account.finNumber,
      nameAr: account.name,
      accountGroup: account.accountGroup,
      balanceNature: account.balanceNature as BalanceNature,
      accountStatus: account.accountStatus as AccountStatus,
      finalAccountType: account.finalAccountType as unknown as FinalAccountType,
    });
  }

  onCurrentAccountChange(accountId: number | null) {
    if (!accountId) {
      this.resetFormState();
      return;
    }

    const selected =
      this.currentAccountSearchResults().find((account) => account.id === accountId) ??
      this.findAccountById(this.allFinancialAccounts(), accountId) ??
      this.findAccountById(this.financialAccounts(), accountId);

    if (selected) {
      this.bindFinancialAccount(selected);
    }
  }

  onTreeNodeSelect(node: TreeNode) {
     const account = node.data as ITreeFinancialAccountSearchRow | undefined;
    if (!account) return;

    this.selectedTreeNode.set( node);
    this.bindFinancialAccount(account);
  }

  deleteSelectedFinancialAccount(event: Event) {
    const account = this.selectedFinancialAccount();
    if (!account) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'اختر حسابا اولا',
      });
      return;
    }

    this.deleteFinancialAccount(account.id, event);
  }

  deleteFinancialAccount(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الحساب',
      header: 'حذف الحساب',
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
            this.resetFormState();
            this.searchFinancialAccounts(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'تم الغاء الحذف' });
      },
    });
  }

  private resetFormState() {
    this.selectedFinancialAccount.set(null);
    this.selectedTreeNode.set(null);
    this.fg.reset({
      id: null,
      parentId: null,
      currentAccountId: null,
      finNumber: '',
      nameAr: '',
      accountGroup: AccountGroup.Assets,
      balanceNature: BalanceNature.Debit,
      accountStatus: AccountStatus.Active,
      finalAccountType: FinalAccountType.None,
    });
  }

  debouncedSelectableAccountsSearch(
    target: 'parent' | 'current',
    event: IDebounceEvent,
    searchValue: string = '',
  ) {
    const paginationInfo =
      target === 'parent' ? this.parentAccountsPaginationInfo : this.currentAccountsPaginationInfo;

    if (event.type === 'scrollToEnd') {
      if (paginationInfo.pageIndex < paginationInfo.totalPagesCount) {
        this.searchSelectableAccounts(target, paginationInfo.pageIndex + 1, searchValue);
      }

      return;
    }

    this.searchSelectableAccounts(target, 1, searchValue);
  }

  private applyTreeFilter() {
    const { searchTerm, searchEnum } = this.searchFg.getRawValue();
    const filteredAccounts = this.filterAccountsTree(this.allFinancialAccounts(), searchTerm, searchEnum);
    this.financialAccounts.set(filteredAccounts);
    this.financialAccountsNodes.set(this.mapTreeNodes(filteredAccounts));
  }

  private mapTreeNodes(accounts: ITreeFinancialAccountSearchRow[]): TreeNode[] {
    return accounts.map((account) => ({
      key: account.id.toString(),
      label: account.name,
      data: account,
      expanded: true,
      children: this.mapTreeNodes(account.children),
    }));
  }

  private flattenAccounts(accounts: ITreeFinancialAccountSearchRow[]): ITreeFinancialAccountSearchRow[] {
    return accounts.flatMap((account) => [account, ...this.flattenAccounts(account.children)]);
  }

  private searchSelectableAccounts(target: 'parent' | 'current', pageIndex: number, searchValue: string = '') {
    this.financialAccountService
      .search({
        paginationInfo: {
          pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: FinancialAccountSearchEnum.Name,
            values: [searchValue],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          const targetSignal = target === 'parent' ? this.parentAccountSearchResults : this.currentAccountSearchResults;

          if (pageIndex === 1) {
            targetSignal.set(res.value.rows);
          } else {
            targetSignal.update((previous) => [...previous, ...res.value.rows]);
          }

          const paginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };

          if (target === 'parent') {
            this.parentAccountsPaginationInfo = paginationInfo;
          } else {
            this.currentAccountsPaginationInfo = paginationInfo;
          }
        },
      });
  }

  private mergeSelectedAccount(
    accounts: ITreeFinancialAccountSearchRow[],
    selectedAccount: ITreeFinancialAccountSearchRow | null,
  ) {
    if (!selectedAccount) {
      return accounts;
    }

    return accounts.some((account) => account.id === selectedAccount.id) ? accounts : [selectedAccount, ...accounts];
  }

  private getSelectedParentAccount(): ITreeFinancialAccountSearchRow | null {
    const parentId = this.fg.controls.parentId.value;

    if (!parentId || parentId === -1) {
      return null;
    }

    return (
      this.parentAccountSearchResults().find((account) => account.id === parentId) ??
      this.findAccountById(this.allFinancialAccounts(), parentId)
    );
  }

  private filterAccountsTree(
    accounts: ITreeFinancialAccountSearchRow[],
    searchTerm: string,
    searchEnum: FinancialAccountSearchEnum,
  ): ITreeFinancialAccountSearchRow[] {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return accounts;
    }

    return accounts
      .map((account) => {
        const filteredChildren = this.filterAccountsTree(account.children, searchTerm, searchEnum);
        const searchableValue = searchEnum === FinancialAccountSearchEnum.FinNumber ? account.finNumber : account.name;
        const isMatch = searchableValue?.toLowerCase().includes(normalizedTerm);

        if (!isMatch && filteredChildren.length === 0) {
          return null;
        }

        return {
          ...account,
          children: filteredChildren,
        };
      })
      .filter((account): account is ITreeFinancialAccountSearchRow => !!account);
  }

  private findAccountById(
    accounts: ITreeFinancialAccountSearchRow[],
    id: number,
  ): ITreeFinancialAccountSearchRow | null {
    for (const account of accounts) {
      if (account.id === id) {
        return account;
      }

      const childMatch = this.findAccountById(account.children, id);
      if (childMatch) {
        return childMatch;
      }
    }

    return null;
  }
}
