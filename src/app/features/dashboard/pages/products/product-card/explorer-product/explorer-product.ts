import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { ProductCardService } from '../services/product-card';
import { Paginator } from "primeng/paginator";
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { productModel } from '../models/product-card';
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-explorer-product',
  imports: [PageHeaderSearch, Paginator, SharedConfirmDialog, Dialog],
  templateUrl: './explorer-product.html',
  styleUrl: './explorer-product.scss',
})
export class ExplorerProduct {
  // !!!!!!!!! Services
   private cdr = inject(ChangeDetectorRef); // 2. حقن الخدمة هنا
   _productServices=inject(ProductCardService)
   _messageServices:MessageService=inject(MessageService)
  _destroyRef:DestroyRef = inject(DestroyRef)
  _router:Router=inject(Router)
  // _shared
    _sharedStateServices:SharedStateServices=inject(SharedStateServices);
  
  // !!!!!!!!!!! Properties
   dataAddButton={
      label:'أضافة صنف جديد ',
      action:'/products/product-card/add'
   }

   itemsTable: productModel[] = [];
   units: any[] = [];
     first: number = 0;
   rows: number = 10;

showDeleteDialog = false;
idDelete:number=0;

totalRecords = 0;

filteringData=[
  {label:'كود الصنف',key:'code',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'كود الصنف'},
  {label:'اسم الصنف',key:'name',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'اسم الصنف'},
   ]
  EnumSearch: any;

  showUnitsDialog = false;
 

  // !!!!!!!!!!!!!!!! Methods

  ngOnInit() {
    this.getAllData();
  }
 onSearch(value: any) {
      this.first = 0;
   const dataActive=value;
   console.log(dataActive);
   if (!dataActive.key || !dataActive.value) return;
 
 
 
 
   let enumKey: SearchableColumnEnum;
 
   switch (dataActive.key) {
     case 'code':
       enumKey = SearchableColumnEnum.Code;
       break;
     case 'name':
       enumKey = SearchableColumnEnum.Name;
       break;
     case 'phone':
       enumKey = SearchableColumnEnum.Phone;
       break;
     default:
       return;
   }
 
   const payload = buildSearchPayload(dataActive.value, this.rows, enumKey);
 
   this._productServices.searchWithoutSkipLoader(payload).subscribe((res: any) => {
     this.itemsTable = [...res.data.rows];
     this.totalRecords = res.data.paginationInfo.totalRowsCount;
         this.cdr.detectChanges();
   });
 }

 getAllData(){
  const page = this.first / this.rows + 1;
  this._productServices.getAllSendInQuery(page,this.rows).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.itemsTable = res.data.rows
      this.totalRecords = res.data.paginationInfo.totalRowsCount
      this.cdr.detectChanges(); // 3. تحديث الواجهة فوراً
  });
 }
 deleteProduct(id:any){
  this.showDeleteDialog=true;
  this.idDelete=id;
 }

 deleteDialog(){
  if(this.idDelete > 0){
    this._productServices.delete(this.idDelete).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this._messageServices.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم الحذف بنجاح',
        })
        this.showDeleteDialog=false;
        this.idDelete = 0;
        this.getAllData();
        
      }
    })
  }
 }

 onPageChange(event:any){
  this.first = event.first ?? 0;
  this.rows = event.rows ?? 10;
  this.getAllData();
}

editProduct(id:any){
  this._sharedStateServices.setSelectedId(id);
  this._router.navigate(['products/product-card/add']);
}

showUnits(item:any){
   this._productServices.getById(item.id).subscribe((res: any) => {
    this.units = res.data.productCardDetails;
    this.showUnitsDialog = true;
  });
}


}
