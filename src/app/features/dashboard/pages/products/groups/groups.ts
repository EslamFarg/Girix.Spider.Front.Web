import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoComplete } from 'primeng/autocomplete';
import { FormError } from '../../../../../shared/ui/form-error/form-error';
import { OnlyStringDirective } from '../../../../../shared/directives/only-string';
import { UnitOfMeasure } from '../units-of-measurement/services/unit-of-measure';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { groupData } from './models/group';
import { GroupsServices } from './services/groups';
import { Paginator } from "primeng/paginator";
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { buildSearchPayload } from '../../../../../shared/config/search-config';
import { userNameValidation } from '../../../../../shared/validations/user-name';

@Component({
  selector: 'app-groups',
  imports: [NgClass, AutoComplete, ReactiveFormsModule, FormError, OnlyStringDirective, Paginator, SharedConfirmDialog],
  templateUrl: './groups.html',
  styleUrl: './groups.scss',
})
export class Groups {
  // !!!!!!!!! Services
  _messageServices: MessageService = inject(MessageService);
  _fb: FormBuilder = inject(FormBuilder);
  _groupService = inject(GroupsServices);
  _destroyRef = inject(DestroyRef);
  // !!!!!!!!! Property


  groupForm = this._fb.group({
    nameAr: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),userNameValidation()]],
    nameEn: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),userNameValidation()]],
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
  groupDataList: groupData | null = null;
  showDeleteDialog = false
  // !!!!!!!!!!! Method

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
   this.groupForm.get('nameAr')?.valueChanges.subscribe((value) => {
  this.groupForm.patchValue(
    { nameEn: value },
    { emitEvent: false } 
  );
});
    this.getAllData();
  }
  search(event: AutoCompleteCompleteEvent) {
     if (!event.query) {
    this.items = [];
    return;
  }

      const payload = buildSearchPayload(event.query,this.pageSize);
    
      this._groupService.search(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this.items = res.data.rows.map((item: any) => ({
              label: item.nameAr,
              value: item.id
            }));
    
          }
        });
  }

  onSelect(event: any) {
if (!event || !event.value) {
  this.idResultSearch = 0;
  this.getAllData();
  return;
}

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



  this._groupService.getByIdInQuery(this.idResultSearch)
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

  onSubmit() {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode == false) {
      this._groupService
        .create(this.groupForm.value)
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
        ...this.groupForm.value,
      };

      this._groupService
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
    this.groupForm.reset();
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
    this._groupService.getAllSendInQuery(pageNumber,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this.groupDataList=res;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
      }
    })
  }


  editData(id:number){
    this.isEditMode=true;
    this.idGroup=id;
    this._groupService.getByIdInQuery(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this.groupForm.patchValue({
          nameAr:res.data.nameAr,
          nameEn:res.data.nameEn
        })
      }
    })

  }


  showPopupDelete(id:number){
    this.showDeleteDialog=true;
    this.idGroup=id

    console.log('Id Group',this.idGroup);

  }

  deleteGroup(){
    this._groupService.delete(this.idGroup).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
