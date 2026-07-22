import { Component, DestroyRef, HostListener, inject, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TreeProject } from '../../../../../shared/ui/tree-project/tree-project';
import { CostCenterService } from './services/cost-center';
import { FormComponentBase } from '../../../../../shared/base/form-component-base';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { userNameValidation } from '../../../../../shared/validations/user-name';
import { FormError } from '../../../../../shared/ui/form-error/form-error';
import { entityNameValidator } from '../../../../../shared/validations/entity-name-validator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { CostCenterModel } from './models/cost-center';
import { NgClass } from "@angular/common";
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { SearchableColumnEnum } from '../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../shared/config/search-config';

@Component({
  selector: 'app-cost-center',
  imports: [NgSelectComponent, TreeProject, ReactiveFormsModule, FormError, NgClass, SharedConfirmDialog,AutoCompleteModule,AutoComplete],
  templateUrl: './cost-center.html',
  styleUrl: './cost-center.scss',
})
export class CostCenter extends FormComponentBase {
  // !!!!!!!!!!1 Services
  _costCenterService: CostCenterService = inject(CostCenterService);
  _fb: FormBuilder = inject(FormBuilder);
  _destroyRef = inject(DestroyRef);
  _messageService:MessageService=inject(MessageService)

  // !!!!!!!!!!! properties
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  costCenterForm: FormGroup = this._fb.group({
    code: [''],
    nameAr: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
        entityNameValidator(),
      ],
    ],
    nameEn: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
        entityNameValidator(),
      ],
    ],
    parentId: [null] as any,
    isCheckAccount: [true],
  });

  isChangeStateParentId = true;

  treeCost: any[] = [];

  getDatabySelect:CostCenterModel[]=[]
  showDeleteDialog=false;
  deleteId:any;

  // !!!!!!!!!!!! Methods



  ngOnInit() {
    this.costCenterForm
      .get('nameAr')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => {
        this.costCenterForm.patchValue(
          {
            nameEn: value,
          },
          {
            emitEvent: false,
          },
        );
      });

    const parentId = this.costCenterForm.get('parentId');

    if (this.costCenterForm.get('isCheckAccount')?.value) {
      parentId?.setValidators(Validators.required);
      parentId?.enable();
    } else {
      parentId?.clearValidators();
      parentId?.disable();
    }

    parentId?.updateValueAndValidity();

    this.costCenterForm
      .get('isCheckAccount')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => {
        if (value) {
          parentId?.setValidators(Validators.required);
          parentId?.enable();
        } else {
          parentId?.clearValidators();
          parentId?.disable();
        }

        parentId?.updateValueAndValidity();
      });
      this.getAllData();
      this.refreshActions();
  }


  flattenCostCenters(data: any[]): any[] {
  const result: any[] = [];

  const flatten = (items: any[]) => {
    items.forEach(item => {
      const { children, ...rest } = item;
      result.push(rest);
      if (children && children.length > 0) {
        flatten(children);
      }
    });
  };
  flatten(data);
  return result;
}

mapToTree(data: any[]): any[] {
  return data.map(item => ({
    label: item.nameAr,
    expanded: false,
    isLeaf: !item.children || item.children.length === 0,

    // احتفظ بكل البيانات لو احتجتها عند الضغط على الـ Node
    data: {
      id: item.id,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      parentId: item.parentId
    },

    children: this.mapToTree(item.children || [])
  }));
}

  getAllData() {
    this._costCenterService.getAllSendInQuery().pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        const data = Array.isArray(res?.data) ? res.data : [];
        this.treeCost = this.mapToTree(data);
        this.getDatabySelect = this.flattenCostCenters(data);
      }
    })
  }

  save() {
    if(this.costCenterForm.invalid){
      this.costCenterForm.markAllAsTouched();
      return;
    }
    let payload:CostCenterModel={
      nameAr: this.costCenterForm.value.nameAr,
      nameEn: this.costCenterForm.value.nameEn,
      parentId: this.costCenterForm.value.parentId
    }
    if(this.isEditMode == false){

      this._costCenterService.create(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next:(res :any)=>{
          // this._toastr.show('تم الاضافة بنجاح','success');
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الاضافة بنجاح',
          })
          this.changeButtonState(res.data,true);
          this.refreshActions();
          this.getAllData();
        },
        
      })
    }else{
      const payload={
        id: this.idUpdate,
        nameAr: this.costCenterForm.value.nameAr,
        nameEn: this.costCenterForm.value.nameEn,
        parentId: this.costCenterForm.value.parentId
      }
      // console.log(payload);
      // return;
      this._costCenterService.updateWithOutPathParameter(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next:(res :any)=>{
          // this._toastr.show('تم التعديل بنجاح','success');
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم التعديل بنجاح',
          })
          this.getAllData();
          this.refreshActions();
        }
      })


    }
  }
  reset() {
    this.costCenterForm.reset({
      isCheckAccount: true,
    });
    this.deleteId=0
    this.changeButtonState(0, false);
    this.refreshActions();
  }
  delete() {
    this.showDeleteDialog = true;
    this.deleteId = this.idUpdate;
    
  }
  print() {}

  onStateDeleteOrUpdate(e:any){
    const id=e.parent.data.id
    console.log(e.event);


    if(e.event==="edit"){
      console.log('True Edit');
      this._costCenterService.getByIdInQuery(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next:(res:any)=>{
          this.costCenterForm.patchValue({
            nameAr: res.data.nameAr,
            nameEn: res.data.nameEn,
            parentId: res.data.parentId
          });
          // console.log(res);
          if(res.data.parentId == null){
            this.costCenterForm.get('isCheckAccount')?.patchValue(false);
          }
          this.changeButtonState(res.data.id,true);
          this.refreshActions();
        }
      })
    }else if( e.event==="delete"){
      console.log('True Delete');
      this.showDeleteDialog = true;
      this.deleteId=id
      }
    // this.changeButtonState(id,e.isEditMode);
    // this.refreshActions();
  }


  deleteDialog(){
    this._costCenterService.delete(this.deleteId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this._messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم الحذف بنجاح',
        })
        this.showDeleteDialog=false;
        this.reset();
        this.getAllData();
        this.refreshActions();
      }
    })
  }


  // !!! Search
  searchControl = new FormControl('');
  items: { label: string; value: number }[] = [];
  pageSize = 10;
  showSearchBox = false;
  showTreeSearchBox = false;
  selectedSearchType: 'code' | 'name' = 'code';
  selectedSearch = 'كود مركز التكلفة';
  SearchValEnum = SearchableColumnEnum.Code;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement).closest('.search_input');
    if (!target) {
      this.showSearchBox = false;
      this.showTreeSearchBox = false;
    }
  }

  selectFilterSearch(type: 'code' | 'name'): void {
    this.selectedSearchType = type;
    if (type === 'code') {
      this.selectedSearch = 'كود مركز التكلفة';
      this.SearchValEnum = SearchableColumnEnum.Code;
    } else {
      this.selectedSearch = 'اسم مركز التكلفة';
      this.SearchValEnum = SearchableColumnEnum.NameAr;
    }
    this.showSearchBox = false;
    this.showTreeSearchBox = false;
  }

  private extractSearchTreeData(res: any): any[] {
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    if (Array.isArray(res?.data?.rows)) {
      return res.data.rows;
    }
    return [];
  }

  search(event: AutoCompleteCompleteEvent): void {
    const query = (event.query ?? '').trim();
    if (!query) {
      this.items = [];
      return;
    }

    const payload = buildSearchPayload(query, this.pageSize, this.SearchValEnum);

    this._costCenterService
      .search(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const data = this.extractSearchTreeData(res);
          this.items = this.flattenCostCenters(data).map((item: any) => ({
            label:
              this.selectedSearchType === 'code'
                ? String(item.id)
                : (item.nameAr ?? item.nameEn ?? ''),
                
            value: item.id,
          }));
         


          setTimeout(() => {
            this.autoComplete?.show();
          });
        },
      });
  }

  onSelectDelegate(event: { value: { label: string; value: number } }): void {
    const id = event.value?.value;
    if (!id) {
      return;
    }

    this.loadCostCenterById(id);
  }

  private loadCostCenterById(id: number): void {
    this._costCenterService
      .getByIdInQuery(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        if (res.data.parentId == null) {
          this.costCenterForm.get('isCheckAccount')?.patchValue(false);
        } else {
          this.costCenterForm.get('isCheckAccount')?.patchValue(true);
        }

        this.costCenterForm.patchValue({
          ...res.data,
        });

        this.changeButtonState(res.data.id, true);
        this.searchControl.reset();
        this.items = [];
      });
  }


searchInTree(value: any): void {
  const query = (value ?? '').trim();
  if (!query) {
    this.getAllData();
    return;
  }

  const payload = buildSearchPayload(query, this.pageSize, this.SearchValEnum);
  this._costCenterService
    .search(payload)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (res: any) => {
        const data = this.extractSearchTreeData(res);
        this.treeCost = this.mapToTree(data);
        this.getDatabySelect = this.flattenCostCenters(data);
      },
    });
}

}
