import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { Customers } from '../services/customers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { customersModel } from '../models/customers';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { MessageService } from 'primeng/api';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { Router } from '@angular/router';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";

@Component({
  selector: 'app-explorer-customers',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-customers.html',
  styleUrl: './explorer-customers.scss',
})
export class ExplorerCustomers {
  // !!!!!! Services
  _customerServices: Customers = inject(Customers);
  _destroyRef: DestroyRef = inject(DestroyRef);
  cdr = inject(ChangeDetectorRef);
  _messageServices:MessageService=inject(MessageService)
  _sharedStateServices=inject(SharedStateServices)
  _router:Router=inject(Router)
  // !!!!!! Properties

  dataAddButton = {
    label: 'أضافة عميل ',
    action: '/customers/add',
  };
  first: number = 1;
  rows: number = 10;

  itemsTable: customersModel[] = [];
  totalRecords = 0;

  filteringData=[
  {label:'كود العميل',key:'code',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'كود العميل'},
  {label:'اسم العميل',key:'name',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'اسم العميل'},
      {label:'رقم الجوال',key:'phone',type:'text',value:'',class:'col-span-12 ',placeholder:'رقم الجوال'},
   ]

  deleteId: number = 0;
  showDeleteDialog: boolean = false;
  // !!!!!!!!!!! Method

  ngOnInit() {
    this.gellAllCustomers();
  }

  
  
  gellAllCustomers() {
     const page =Math.floor(this.first / this.rows) + 1;
    this._customerServices
      .getAllSendInQuery(page, this.rows)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        console.log(res);
        this.itemsTable = res.data.rows;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
      });
  }
  onPageChange(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.gellAllCustomers();
  }

  onSearch(value: any) {
   
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
  
    this._customerServices.searchWithoutSkipLoader(payload).subscribe((res: any) => {
      this.itemsTable = [...res.data.rows];
      this.totalRecords = res.data.paginationInfo.totalRowsCount;
          this.cdr.detectChanges();
    });
  }
  
  
  viewDeletePopup(id:number){
    this.deleteId=id;
    this.showDeleteDialog=true;
  }
  
  
  deleteDialog(){
    this._customerServices.delete(this.deleteId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الحذف بنجاح',
      })
      this.deleteId=0;
      this.gellAllCustomers();
      this.showDeleteDialog=false;
    })
  }
  
  
  sendIdToUpdateState(id:number){
    this._sharedStateServices.setSelectedId(id);
    this._router.navigate(['customers/add']);
  }
}
