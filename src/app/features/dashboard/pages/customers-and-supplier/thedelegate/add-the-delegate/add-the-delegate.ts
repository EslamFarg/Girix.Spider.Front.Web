import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import IntlTelInput from '@intl-tel-input/angular';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { Accounts } from '../../../accounts-parent/accounts/accounts';
import { entityNameValidator } from '../../../../../../shared/validations/entity-name-validator';
import { MaxPercentageDirective } from '../../../../../../shared/directives/percentage-max';
import { CommissionType } from '../../../../../../shared/Enums/delegate-commetion-type';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { DelegateServices } from '../services/delegate-services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { NgClass } from '@angular/common';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { PdfPrinterComponent } from '../../../../../../shared/components/pdf-printer/pdf-printer';

@Component({
  selector: 'app-add-the-delegate',
  imports: [
    PageHeader,
    NgSelectComponent,
    IntlTelInput,
    FormError,
    ReactiveFormsModule,
    Accounts,
    MaxPercentageDirective,
    AutoCompleteModule, FormsModule,
    NgClass,
    SharedConfirmDialog,
    PdfPrinterComponent
],
  templateUrl: './add-the-delegate.html',
  styleUrl: './add-the-delegate.scss',
})
export class AddTheDelegate extends FormComponentBase{
  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _delegateServices = inject(DelegateServices);
  _destroyRef = inject(DestroyRef);
  _messageServices:MessageService=inject(MessageService)
  _sharedStateServices:SharedStateServices=inject(SharedStateServices)
  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('codeElement') codeElement: any;
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  @ViewChild('printer') printer!: PdfPrinterComponent;
  CommissionTypeProfit = CommissionType.ProfitValue;
  CommissionTypeSales = CommissionType.SalesValue;
  delegateForm = this._fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        entityNameValidator(),
      ],
    ],
    phone: ['', [Validators.required, egyptSaudiPhoneValidator]],
    // area: [
    //   '',
    //   [
    //     Validators.required,
    //     Validators.minLength(2),
    //     Validators.maxLength(100),
    //     entityNameValidator(),
    //   ],
    // ],
    commissionPercent: ['', [Validators.required]],
    commissionType: [this.CommissionTypeSales, [Validators.required]],
  });
  searchControl = new FormControl('',Validators.required);
  loadUtils = () => import('intl-tel-input/utils');
  date2: Date | undefined;
  showSearchBox = false;
  selectedSearch = 'بالكود';
  pageSize = 10;
  

  explorerBtn = {
    label: 'مستكشف المناديب    ',
    link: '/the-delegate/explorer',
  };
  SearchValEnum:any=SearchableColumnEnum.Code;
  showDeleteDialog = false;
  // !!!!!!!!!!!! Methods

  
  

  ngOnInit() {
    // this.idUpdate = 1;
    this.refreshActions();
    this.loadDelegate();
  }


  loadDelegate() {
   const id:any=this._sharedStateServices.selectedId$();
   if(id){
    this._delegateServices.getByIdInQuery(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.delegateForm.patchValue({
        name: res.data.name,
        phone: res.data.phone,
        // area: res.data.area,
        commissionPercent: res.data.commissionPercent,
        commissionType: res.data.commissionType,
      });
      this.codeElement.nativeElement.value = res.data.id;
      // this.isEditMode=this._sharedStateServices.isEditMode$();
      this.changeButtonState(res.data.id,true);
      this.refreshActions();

    })
   }
    
  }

  onPhoneChange(event: any) {
    const number = event?.target?.value;
    if (!number) return;
    this.delegateForm.get('phone')?.setValue(number, {
      emitEvent: false,
    });
  }

  // !!! Search
   items: any[] = [];
    value: any;


        selectFilterSearch(type: 'mobile' | 'name' | 'code') {
    if (type == 'name') {
      this.selectedSearch = 'اسم المندوب';
      this.SearchValEnum=SearchableColumnEnum.Name
    } else if (type == 'mobile') {
      this.selectedSearch = 'رقم الجوال';
      this.SearchValEnum=SearchableColumnEnum.Phone
    } else if (type == 'code') {
      this.selectedSearch = 'الكود';
      this.SearchValEnum=SearchableColumnEnum.Code
    } 
    this.showSearchBox = false;
  }

    onEnter(event: any) {
  if (this.searchControl.invalid) {
    this._messageServices.add({
      severity: 'error',
      summary: 'خطأ',
      detail: `يجب ادخال قيمه بحث ${this.selectedSearch}`,
    })
    return;
  }
  // نفذ البحث هنا
}


    search(event: AutoCompleteCompleteEvent) {
      console.log('event', this.searchControl.value);
      const query = (event.query ?? '').trim();
      if(!query){
        this.items = [];
        return;
      }

        const payload = buildSearchPayload(query, this.pageSize, this.SearchValEnum);

        this._delegateServices
          .search(payload)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: (res: any) => {
              this.items = res.data.rows.map((item: any) => ({
                label: item.name,
                value: item.id,
              }));
               setTimeout(() => {
    this.autoComplete.show();
  });
            },
          });
    }



  onSelectDelegate(event: any) {
  const delegateId = event.value.value;


  this._delegateServices
    .getByIdInQuery(delegateId)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(res => {
      // console.log(res);
      // this.idUpdate = res.data.id;
      this.delegateForm.patchValue({
        name: res.data.name,
        phone: res.data.phone,
        // area: res.data.area,
        commissionPercent: res.data.commissionPercent,
        commissionType: res.data.commissionType,
      });
      this.changeButtonState(res.data.id,true);
      this.codeElement.nativeElement.value = res.data.id;
         this.searchControl.reset();
      this.items = [];
    });
}

// !!!!!!!!! Actions
  save() {
    if (this.delegateForm.invalid) {
      this.delegateForm.markAllAsTouched();
      return;
    }
    if(this.isEditMode == false){
    this._delegateServices.create(this.delegateForm.value).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الاضافة بنجاح',
      })
      this.changeButtonState(res.data,true);
      this.codeElement.nativeElement.value = res.data;
    })
    }else{
      const data = {
        id: this.idUpdate,
        ...this.delegateForm.value
      }
      this._delegateServices.updateWithOutPathParameter(data).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
        this._messageServices.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم التعديل بنجاح',
        })
        this.changeButtonState(res.data,true);
        // this.codeElement.nativeElement.textContent = res.data;
      })
    }
  }

  reset() {
    this.delegateForm.reset({
      commissionType: this.CommissionTypeSales,
    });
    this.idUpdate = 0;
    this.isEditMode = false;
    this.codeElement.nativeElement.value = '0';
    this.refreshActions();
  }

  delete() {
    this.showDeleteDialog = true;
  }

  
  deleteDialog(){
    this._delegateServices.delete(this.idUpdate).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this._messageServices.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم الحذف بنجاح',
        })
        this.showDeleteDialog=false;
        this.reset();
      }
    })
  }


  getCombinedData() {
    return {
      ...this.delegateForm.value,
      code: this.codeElement?.nativeElement?.value || '0' // دمج الكود اللي بره الـ form group
    };
  }
  print() {
this.printer.print();
  }
}
