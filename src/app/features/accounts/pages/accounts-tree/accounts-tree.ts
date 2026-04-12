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
import { IFinancialAccountSearchRow, IFinancialAccountTreeRow } from '../../types';
import { Select } from 'primeng/select';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Menu } from 'primeng/menu';

interface IOption<T> {
  label: string;
  value: T;
}

type AccountTreeRow = IFinancialAccountTreeRow;
type AccountOptionRow = IFinancialAccountSearchRow;
type AccountRow = AccountTreeRow | AccountOptionRow;

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
  selectedFinancialAccount = signal<AccountOptionRow | null>(null);
  allFinancialAccounts = signal<AccountTreeRow[]>([]);
  allFlatFinancialAccounts = signal<AccountOptionRow[]>([]);

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

  financialAccounts = signal<AccountTreeRow[]>([]);
  currentParentAccountId = signal<number | null>(null);
  currentAccountId = signal<number | null>(null);
  currentAccountOptions = computed(() =>
    this.allFlatFinancialAccounts().filter((item) => item.id !== this.currentParentAccountId()),
  );
  onParentAccountChange(parentAccountId: number | null) {
    if (!parentAccountId) return;
    this.currentParentAccountId.set(parentAccountId);
  }
  parentAccounts = computed(() => {
    const accountsWithoutCurrent = this.allFlatFinancialAccounts().filter(
      (item) => item.id !== this.currentAccountId(),
    );
    return accountsWithoutCurrent;
  });

  constructor() {
    super();
    this.getFullFinancialAccountsTree();
  }

  getFullFinancialAccountsTree() {
    this.financialAccountService.getFullTree().subscribe({
      next: (res) => {
        this.allFinancialAccounts.set(res.value.rows);
        const flatAccounts = this.financialAccountService.flattenTree(res.value.rows);
        console.log(flatAccounts);
        this.allFlatFinancialAccounts.set(flatAccounts);
        // this.parentAccountOptionsSource.set(flatAccounts);
        // this.currentAccountOptionsSource.set(flatAccounts);
        this.applyTreeFilter();
      },
    });
  }

  onSubmitSearch = () => this.searchFg.valid && this.applyTreeFilter();

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
              this.getFullFinancialAccountsTree();
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
              this.getFullFinancialAccountsTree();
            },
          });
        break;
    }
  }

  onResetAccount() {
    this.resetFormState();
  }

  bindFinancialAccount(account: AccountRow) {
    this.selectedFinancialAccount.set(this.toSelectableAccount(account));
    this.currentParentAccountId.set(account.parentId);
    this.currentAccountId.set(account.id);
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

  onCurrentAccountChange(account: IFinancialAccountSearchRow | null) {
    if (!account) {
      this.resetFormState();
      return;
    }

    this.currentParentAccountId.set(account.parentId);
    this.currentAccountId.set(account.id);
    const accountId = account.id;

    const selected =
      //   this.currentAccountOptionsSource().find((account) => account.id === accountId) ??
      this.allFlatFinancialAccounts().find((account) => account.id === accountId);
    //   this.findAccountById(this.allFinancialAccounts(), accountId) ??
    //   this.findAccountById(this.financialAccounts(), accountId);

    if (selected) {
      this.bindFinancialAccount(selected);
    }
  }

  onTreeNodeSelect(node: TreeNode) {
    const account = node.data as AccountTreeRow | undefined;
    if (!account) return;

    this.selectedTreeNode.set(node);
    this.bindFinancialAccount(account);
  }


  deleteFinancialAccount(event: Event) {
    const account = this.selectedFinancialAccount();
    
    if (!account) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'اختر حسابا اولا',
      });
      return;
    }

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
        this.financialAccountService.delete(account.id).subscribe({
          next: () => {
            this.resetFormState();
            this.getFullFinancialAccountsTree();
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

  private applyTreeFilter() {
    const { searchTerm, searchEnum } = this.searchFg.getRawValue();
    const filteredAccounts = this.filterAccountsTree(this.allFinancialAccounts(), searchTerm, searchEnum);
    this.financialAccountsNodes.set(this.mapTreeNodes(filteredAccounts));
  }

  private mapTreeNodes(accounts: AccountTreeRow[]): TreeNode[] {
    return accounts.map((account) => ({
      key: account.id.toString(),
      label: account.name,
      data: account,
      expanded: true,
      children: this.mapTreeNodes(account.children),
    }));
  }


  private filterAccountsTree(
    accounts: AccountTreeRow[],
    searchTerm: string,
    searchEnum: FinancialAccountSearchEnum,
  ): AccountTreeRow[] {
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
      .filter((account): account is AccountTreeRow => !!account);
  }

  private findAccountById(accounts: AccountTreeRow[], id: number): AccountTreeRow | null {
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

  private toSelectableAccount(account: AccountRow): AccountOptionRow {
    return {
      id: account.id,
      name: account.name,
      parentId: account.parentId,
      stage: account.stage,
      finNumber: account.finNumber,
      balanceNature: account.balanceNature,
      finalAccountType: account.finalAccountType,
      accountGroup: account.accountGroup,
      accountStatus: account.accountStatus,
    };
  }
}
