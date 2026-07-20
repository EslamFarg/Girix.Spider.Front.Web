import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from "primeng/autocomplete";
import { Paginator } from "primeng/paginator";
import { FormError } from "../../../../../shared/ui/form-error/form-error";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { userNameValidation } from '../../../../../shared/validations/user-name';
import { MessageService } from 'primeng/api';
import { GroupsServices } from '../groups/services/groups';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { groupData } from '../groups/models/group';
import { buildSearchPayload } from '../../../../../shared/config/search-config';
import { entityNameValidator } from '../../../../../shared/validations/entity-name-validator';
import { NgClass } from '@angular/common';
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { CategoriesServices } from './services/categories-services';

@Component({
  selector: 'app-categories',
  imports: [AutoComplete, Paginator, ReactiveFormsModule, FormError, NgClass, SharedConfirmDialog],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
    // !!!!!!!!! Services
  _messageServices: MessageService = inject(MessageService);
  _fb: FormBuilder = inject(FormBuilder);
  _categoryService = inject(CategoriesServices);
  _destroyRef = inject(DestroyRef);
  // !!!!!!!!! Property


  @ViewChild('ac') autoComplete!: AutoComplete;
  categoryForm = this._fb.group({
    nameAr: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),entityNameValidator()]],
    nameEn: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),entityNameValidator()]],
  });

  items: any[] = [];
  value: any;
  selectedSearch: string = 'بحث';
  idResultSearch: number = 0;
  idGroup: number = 0;
  required: any;

  isEditMode: boolean = false;
  buttonConfig = BUTTON_CONFIG;
  pageIndex=0;
  pageSize=10;
  totalRecords = 0
  groupDataList: any | null = null;
  showDeleteDialog = false
  ignoreNextFocus = false;

  // !!!!!!!!!!! Method

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
   this.categoryForm.get('nameAr')?.valueChanges.subscribe((value) => {
  this.categoryForm.patchValue(
    { nameEn: value },
    { emitEvent: false } 
  );
});
    this.getAllData();
  }


  search(event: AutoCompleteCompleteEvent) {

    const query = event.query?.trim();
     if (!query) {
    this.items = [];
    return;
  }

  

      const payload = buildSearchPayload(query,this.pageSize);
    
      this._categoryService.search(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this.items = res.data.rows.map((item: any) => ({
              label: item.name,
              value: item.id
            }));
            setTimeout(() => {
              this.autoComplete.show();
            });
          }
        });
  }

  onSelect(event: any) {
if (!event || !event.value) {
  this.idResultSearch = 0;
  this.getAllData();
  return;
}
this.ignoreNextFocus = true;
setTimeout(() => {
  this.autoComplete.hide();
}, 0);

  this.idResultSearch = event.value.value;

     if (this.idResultSearch == 0) {
      // this.getAll();
      this._messageServices.add({
        severity: 'error',
        summary: 'خطاء في البيانات',
        detail: 'الرجاء اختيار قيمة',
      });
      return;
    }



  this._categoryService.getById(this.idResultSearch)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (res: any) => {
        this.groupDataList = {
          isSuccess: true,
          data: {
            rows: [res.data],
            paginationInfo: {
              totalRowsCount: 1,
              totalPagesCount: 1
            }
          }
        };

        this.totalRecords = 1;
      }
    });
  }
 
  clearSearch() {
  this.idResultSearch = 0;
  this.items = [];
  this.getAllData();
}

onFocusSearch(event: any) {

  if (this.ignoreNextFocus) {
    this.ignoreNextFocus = false;
    return;
  }
  const value = event.target?.value?.trim();
  console.log(value);

  const query={
    query: value
  }

  
  
  if (!value) {
    return;
    
  }
  
  // لو الاقتراحات موجودة بالفعل، متبحثش تاني
  setTimeout(() => {
  this.autoComplete.show();
  }, 100);
  if (this.items.length > 0) return;
  this.search(query as AutoCompleteCompleteEvent);
  

}

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode == false) {
      this._categoryService
        .create(this.categoryForm.value)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            // this._toastr.show('تم الاضافة بنجاح','success');
            this._messageServices.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم الاضافة بنجاح',
            });
            // console.log(res);
            this.idGroup = res.data;
            this.isEditMode = true;
            this.getAllData();
          },
        });
    } else {
      // update

      let payload = {
        id: this.idGroup,
        ...this.categoryForm.value,
      };

      this._categoryService
        .updateWithOutPathParameter(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم التعديل بنجاح',
            });
            this.isEditMode = true;
            this.getAllData();
          },
        });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.idGroup = 0;
    this.categoryForm.reset();
    this.idResultSearch=0
  }
  

  get buttonLabel(): string {
    return this.isEditMode ? this.buttonConfig.edit.label : this.buttonConfig.create.label;
  }

  get buttonClass(): string {
    return this.isEditMode ? this.buttonConfig.edit.class : this.buttonConfig.create.class;
  }



  getAllData(){

    const pageNumber = Math.floor(this.pageIndex / this.pageSize) + 1;
    this._categoryService.getAllSendInQuery(pageNumber,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this.groupDataList=res;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
      }
    })
  }


  editData(id:number){
    this.isEditMode=true;
    this.idGroup=id;
    this._categoryService.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this.categoryForm.patchValue({
          nameAr:res.data.name,
          nameEn:res.data.name
        })
      }
    })

  }


  showPopupDelete(id:number){
    this.showDeleteDialog=true;
    this.idGroup=id

  }

  deleteGroup(){
    this._categoryService.delete(this.idGroup).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        // this._toastr.show('تم الحذف بنجاح','success');
        this._messageServices.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم الحذف بنجاح',
        })
        this.showDeleteDialog=false;
        this.resetForm();
        this.getAllData();
      }
    })
  }
  onPageChange(event:any){
   this.pageIndex = event.first ?? 0;
   this.pageSize = event.rows ?? 10;
   this.getAllData();
}

}
