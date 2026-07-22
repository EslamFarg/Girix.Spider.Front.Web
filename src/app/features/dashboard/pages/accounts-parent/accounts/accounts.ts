import { ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TreeModule } from 'primeng/tree';

import { TreeNode } from "../../../../../shared/ui/tree-node/tree-node";
import { DomSanitizer } from '@angular/platform-browser';
import { AccountsService } from './services/accounts-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { parentsData } from './models/accounts';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormError } from "../../../../../shared/ui/form-error/form-error";
import { MessageService } from 'primeng/api';
import { OnlyStringDirective } from "../../../../../shared/directives/only-string";
import { onlyNumberDirective } from "../../../../../shared/directives/only-number";
import { egyptSaudiPhoneValidator } from '../../../../../shared/validations/phoneNumber';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { NgClass } from '@angular/common';
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { jsPDF } from 'jspdf';
import { GeneratePdf } from "../../../../../shared/ui/generate-pdf/generate-pdf";
import { PrintPageAccounts } from './components/print-page-accounts/print-page-accounts';
import { LoadingService } from '../../../../../shared/ui/loading/services/loading';
import { AutoComplete, AutoCompleteCompleteEvent } from "primeng/autocomplete";
import { SearchableColumnEnum } from '../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../shared/config/search-config';
// import { NodeService } from '@/service/nodeservice';
@Component({
  selector: 'app-accounts',
  imports: [NgSelectComponent, TreeModule, TreeNode, ReactiveFormsModule, FormError, NgClass, OnlyStringDirective, onlyNumberDirective, SharedConfirmDialog, GeneratePdf, AutoComplete, PrintPageAccounts],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
  // providers: [NodeService]
})
export class Accounts {
// !!!!!!! Services
_sanitizer:DomSanitizer=inject(DomSanitizer);
_accountsService=inject(AccountsService);
_destroyRef=inject(DestroyRef);
_fb:FormBuilder=inject(FormBuilder);
_messageServices=inject(MessageService)
_loadingService=inject(LoadingService);
_cdr=inject(ChangeDetectorRef);

showPdfGenerate=false;
// !!!!!!!!!!!!! Properties
printPageAccounts=PrintPageAccounts
parentsPage=1;
parentsPageSize=10;
parentsLoading=false;
parentsHasMore=true;
searchPageSize=10;
parentsList:parentsData[]=[];
accountsList:any[]=[];
selectedAccountParent=null;
isEditMode=false;
buttonConfig=BUTTON_CONFIG;
idAccountForm=0;
// accountsComponentRef=inject(ElementRef);
// namespace Erp.Domain.Enums.Accounts
// {
//     public enum AccountNature
//     {
//         Debit = 1,
//         Credit = 2,
//         DebitCredit = 3
//     }
// }
accountNature:any[]=[
  {
    id:1,
    name:"Debit"
  },
  {
    id:2,
    name:'Credit'
  },
  {
    id:3,
    name:'DebitCredit'
  }
]



// namespace Erp.Domain.Enums.Accounts
// {
//     public enum AccountStatus
//     {
//         Active = 1,
//         Inactive,
//         Closed
//     }
// }


accountStatus:any[]=[
  {
    id:1,
    name:"Active"
  },
  {
    id:2,
    name:'Inactive'
  },
  {
    id:3,
    name:'Closed'
  }
]



//     public enum ClosingType
//     {
//         None = 0,                 // بدون
//         BalanceSheet = 1,         // الميزانية العمومية
//         IncomeStatement = 2,      // قائمة الدخل
//     }


closedType:any[]=[
  // {
  //   id:0,
  //   name:"None"
  // },
  {
    id:1,
    name:'BalanceSheet'
  },
  {
    id:2,
    name:'IncomeStatement'
  }
]

// {
//     public enum AccountGroup
//     {
//         Assets = 1,
//         Liabilities = 2,
//         Equity = 3,
//         Revenue = 4,
//         Expense = 5
//     }
// }

accountGroup:any[]=[
  {
    id:1,
    name:"Assets"
  },
  {
    id:2,
    name:'Liabilities'
  },
  {
    id:3,
    name:'Equity'
  },
  {
    id:4,
    name:'Revenue'
  },
  {
    id:5,
    name:'Expense'
  }
]


branchDataList:any[]=[
  {
    id:0,
    name:"All"
  },
  {
    id:1,
    name:'Branch 1'
  },
  {
    id:2,
    name:'Branch 2'
  }
]

accountsForm=this._fb.group({
  code:[null,[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
  nameAr:[null,[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
  nameEn:[null,[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
  parentId:[null,[Validators.required]],
  branchId:[null,[Validators.required]],
  accountGroup:[null,[Validators.required]],
  accountStatus:[null,[Validators.required]],
  accountNature:[null,[Validators.required]],
  closingType:[null,[Validators.required]],
  mobileNumber:[null,[Validators.required,egyptSaudiPhoneValidator]],
  fax:[null,[Validators.required,Validators.minLength(6),Validators.maxLength(20),Validators.pattern(/^\+?[0-9\s\-()]{6,20}$/)]],
  description:[null,[Validators.minLength(2),Validators.maxLength(255)]],


})












  treeNode:any[]=[

  ]

  showDeleteDialog=false
  items: any[] = [];
      value: any;
showSearchBox: boolean = false;
selectedSearch = 'رقم الحساب';
selectedSearchType: 'number' | 'name' = 'number';
SearchValEnum = SearchableColumnEnum.Code;
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  // !!!!!!!!!!!!!!!!!!!!!! Methods
  
  
@HostListener('document:click', ['$event'])

onClick(event: any) {
  const targetElement = event.target.closest('.search_input') as HTMLElement;
  if(!targetElement){
    this.showSearchBox = false
  }

}

    search(event: AutoCompleteCompleteEvent): void {
      if (this.selectedSearchType === 'number') {
        this.items = [];
        return;
      }

      const query = (event.query ?? '').trim();

      if (!query) {
        this.items = [];
        return;
      }

      const payload = buildSearchPayload(query, this.searchPageSize, this.SearchValEnum);

      this._accountsService
        .search(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            const rows = this.extractSearchRows(res);
            this.items = rows.map((item: any) => ({
              label: item.name ?? item.nameAr ?? item.nameEn ?? '',
              value: item.id,
            }));
          },
        });
    }

    onSearchEnter(event: Event): void {
      if (this.selectedSearchType !== 'number') {
        return;
      }
      const value = (event.target as HTMLInputElement)?.value ?? '';
      this.searchByAccountNumber(value);
    }

    onSearchButtonClick(): void {
      if (this.selectedSearchType !== 'number') {
        return;
      }
      const value = this.autoComplete?.inputEL?.nativeElement?.value ?? '';
      this.searchByAccountNumber(value);
    }

    searchByAccountNumber(value: string): void {
      const query = (value ?? '').trim();
      if (!query) {
        return;
      }

      const payload = buildSearchPayload(query, this.searchPageSize, SearchableColumnEnum.Code);

      this._accountsService
        .search(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            const rows = this.extractSearchRows(res);
            if (!rows.length) {
              this._messageServices.add({
                severity: 'warn',
                summary: 'تنبيه',
                detail: 'لم يتم العثور على حساب بهذا الرقم',
              });
              return;
            }

            const match =
              rows.find(
                (item) => (item.accountCode ?? item.code ?? '') === query,
              ) ?? rows[0];

            this.getDataFromTreeById(match.id);
            this.clearSearchInput();
          },
        });
    }

    private clearSearchInput(): void {
      if (this.autoComplete?.inputEL?.nativeElement) {
        this.autoComplete.inputEL.nativeElement.value = '';
      }
      this.items = [];
    }

    onSelectAccount(event: { value: { label: string; value: number } }): void {
      const id = event.value?.value;
      if (!id) {
        return;
      }
      this.getDataFromTreeById(id);
      this.items = [];
    }

    private extractSearchRows(res: any): any[] {
      if (Array.isArray(res?.data?.rows)) {
        return res.data.rows;
      }

      const result: any[] = [];
      const flatten = (items: any[]) => {
        items.forEach((item) => {
          result.push(item);
          if (item.children?.length) {
            flatten(item.children);
          }
        });
      };

      if (Array.isArray(res?.data)) {
        flatten(res.data);
      } else if (Array.isArray(res?.data?.data)) {
        flatten(res.data.data);
      }

      return result;
    }

    selectFilterSearch(type: 'number' | 'name'): void {
      this.selectedSearchType = type;
      this.items = [];
      if (type === 'number') {
        this.selectedSearch = 'رقم الحساب';
        this.SearchValEnum = SearchableColumnEnum.Code;
      } else {
        this.selectedSearch = 'اسم الحساب';
        this.SearchValEnum = SearchableColumnEnum.NameAr;
      }
      this.showSearchBox = false;
    }
    

  //  visible: boolean = false;

  //   showDialog() {
  //       this.visible = true;
  //   }

  ngOnInit(): void {
    this.loadParents(true);
    this.accountsForm.get('nameAr')?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      this.accountsForm.patchValue({
        nameEn: value
      },
    { emitEvent: false })
    })
    this.getAll();
  }

  loadMoreParents(): void {
    this.loadParents(false);
  }

  private loadParents(reset = false): void {
    if (this.parentsLoading) {
      return;
    }

    if (!reset && !this.parentsHasMore) {
      return;
    }

    if (reset) {
      this.parentsPage = 1;
      this.parentsHasMore = true;
      this.parentsList = [];
    }

    this.parentsLoading = true;

    this._accountsService
      .getAllParents(this.parentsPage, this.parentsPageSize)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const rows = this.mapParentRows(res);

          if (!rows.length) {
            this.parentsHasMore = false;
            this.parentsLoading = false;
            this._cdr.detectChanges();
            return;
          }

          this.parentsList = reset
            ? rows
            : this.mergeParents(this.parentsList, rows);

          this.parentsPage += 1;
          this.parentsHasMore = rows.length >= this.parentsPageSize;
          this.parentsLoading = false;
          this._cdr.detectChanges();
        },
        error: () => {
          this.parentsLoading = false;
          this._cdr.detectChanges();
        },
      });
  }

  private mapParentRows(res: any): parentsData[] {
    const rawRows = res?.data?.rows ?? res?.data ?? [];
    if (!Array.isArray(rawRows)) {
      return [];
    }

    return rawRows.map((item: any) => ({
      id: item.id,
      code: item.code ?? item.accountCode ?? '',
      name: item.name ?? item.nameAr ?? item.nameEn ?? '',
      group: item.group ?? item.accountGroup ?? 0,
    }));
  }

  private mergeParents(
    current: parentsData[],
    incoming: parentsData[],
  ): parentsData[] {
    const merged = new Map<number, parentsData>();
    [...current, ...incoming].forEach((item) => merged.set(item.id, item));
    return Array.from(merged.values());
  }

  private ensureParentOption(
    id?: number | null,
    name?: string | null,
    code?: string | null,
    group?: number | null,
  ): void {
    if (id == null) {
      return;
    }

    if (!this.parentsList.some((item) => item.id === id)) {
      this.parentsList = [
        ...this.parentsList,
        {
          id,
          name: name?.trim() || code || String(id),
          code: code ?? '',
          group: group ?? 0,
        },
      ];
    }
  }
  onSelectParent(e:any){

    this.selectedAccountParent=e?.code;
    this.accountsForm.patchValue({
      accountGroup:e?.group,
      code:null
    })

  
  }

  onClearParent(){
    this.selectedAccountParent=null;
    this.accountsForm.patchValue({
      code:null,
      accountGroup:null
    })
  }




  generateCode(){
    if(this.selectedAccountParent == null || this.selectedAccountParent  == undefined){
      this._messageServices.add({
        severity: 'error',
        summary: 'خطاء في البيانات',
        detail: 'رجاء تحديد حساب الأب اولا',
      })
      return
    }
    this._accountsService.generateCode(this.selectedAccountParent).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.accountsForm.patchValue({
        code:res?.data?.code
      })
     
    })
  }

  onSubmit(){
   
   if(this.accountsForm.invalid){
     this.accountsForm.markAllAsTouched();
     return;
   } 
   const payload={
    
  code: this.accountsForm.value.code,
  nameAr: this.accountsForm.value.nameAr,
  nameEn: this.accountsForm.value.nameEn,
  parentId: this.accountsForm.value.parentId,
  branchId: this.accountsForm.value.branchId,
  accountGroup: this.accountsForm.value.accountGroup,
  accountNature: this.accountsForm.value.accountNature,
  accountStatus: this.accountsForm.value.accountStatus,
  closingType: this.accountsForm.value.closingType,
  contactInfoData: {
    mobileNumber: this.accountsForm.value.mobileNumber,
    fax: this.accountsForm.value.fax,
    description: this.accountsForm.value.description
  }

   }
   if(this.isEditMode){
      const payloadUpdate={
      id:this.idAccountForm,
      ...payload
    }
    this._accountsService.updateWithOutPathParameter(payloadUpdate).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this._messageServices.add({
        severity: 'success',
        summary: 'تم التحديث بنجاح',
        detail: 'تم التحديث بنجاح',
      })
      this.isEditMode=true;
      this.idAccountForm=res.data;
      this.getAll();
     
    })
   }else{
  
  
   this._accountsService.create(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
    this._messageServices.add({
      severity: 'success',
      summary: 'نجاح',
      detail: 'تم الاضافة بنجاح',
    })
    this.isEditMode=true;
    this.idAccountForm=res.data;
    this.getAll();
   })
   }
  }


  get ButtonLabel(){
    return this.isEditMode ? this.buttonConfig.edit.label : this.buttonConfig.create.label
  }


  get ButtonClass(){
    return this.isEditMode ? this.buttonConfig.edit.class : this.buttonConfig.create.class
  }


  resetForm(){
    this.accountsForm.reset();
    this.isEditMode=false;
    this.idAccountForm=0
    this.selectedAccountParent = null;

  }


  showPopupDelete(){
    this.showDeleteDialog=true
  }

  deleteAccount(){
    this._accountsService.delete(this.idAccountForm).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الحذف بنجاح',
      })
      this.showDeleteDialog=false;
      this.resetForm();
      this.getAll();
    })
  }


  mapAccountsToTree(data: any[]): any[] {
  return data.map(item => ({
    id: item.id,
    label: item.name,
    expanded: false,

    // لو عايز أيقونة ثابتة
    icon: this._sanitizer.bypassSecurityTrustHtml(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="..." fill="#3CA3D1"/>
      </svg>
    `),

    children: item.children && item.children.length > 0
      ? this.mapAccountsToTree(item.children)
      : []
  }));
}
  
  getAll(){
    this._accountsService.getAllWithoutPagination().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.treeNode = this.mapAccountsToTree(res?.data?.data || res?.data);
    })
  }


  refreshTree(){
    this.getAll();
  }

  getDataFromTreeById(id:number){
  
    this.idAccountForm=id;
    this._accountsService.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
  
      // this.accountsForm.patchValue({
      //   code:res?.data?.accountCode,
      //   parentId:res?.data?.parentId,
      //   nameAr:res?.data?.name,
      //   nameEn:res?.data?.name,
      //   branchId:res?.data?.branchId,
      //   accountStatus:res?.data?.accountStatus,
      //   accountNature:res?.data?.accountNature,
      //   mobileNumber:res?.data?.contactInfo?.mobileNumber,
      //   fax:res?.data?.contactInfo?.fax,
      //   description:res?.data?.contactInfo?.description,

      // })
      this.accountsForm.patchValue({
  code: res.data.accountCode,
  parentId: res.data.parentId,
  nameAr: res.data.name,
  nameEn: res.data.name,
  branchId: res.data.branchId,

  accountGroup: res.data.group,
  closingType: res.data.closingType,

  accountStatus: res.data.accountStatus,
  accountNature: res.data.accountNature,

  mobileNumber: res.data.contactInfo?.mobileNumber,
  fax: res.data.contactInfo?.fax,
  description: res.data.contactInfo?.description,
});
      this.ensureParentOption(
        res.data.parentId,
        res.data.parentName ?? res.data.parentNameAr,
        res.data.parentCode,
        res.data.group,
      );
      this.isEditMode=true
    this.selectedAccountParent = res.data.parentCode;
    })
    

  }


@ViewChild('pdf') pdfComponent!: GeneratePdf;

openPdf() {
      this._loadingService.show();
  this.pdfComponent.generateFromComponent(
    this.printPageAccounts,
    // win
  );
}
}
