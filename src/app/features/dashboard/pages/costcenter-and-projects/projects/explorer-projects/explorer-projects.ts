import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { FormBuilder } from '@angular/forms';
import { ProjectsService } from '../services/projects.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { projectsModel, RowProjectModel } from '../models/projects';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { MessageService } from 'primeng/api';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explorer-projects',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-projects.html',
  styleUrl: './explorer-projects.scss',
})
export class ExplorerProjects {
  // !!!!!! Services 
  _projectsSevice=inject(ProjectsService)
  _destroyRef=inject(DestroyRef);
  cdr = inject(ChangeDetectorRef);
  _messageServices=inject(MessageService);
  _sharedStateServices=inject(SharedStateServices)
  _router:Router=inject(Router);

    
   //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه مشروع جديد',
      action:'/costcenter-and-projects/projects/add'
   }

   totalRecords = 0;

   
filteringData=[
      {label:'رقم المشروع',key:'id',type:'text',error:'',value:'',class:'col-span-12 md:col-span-6',placeholder:'رقم المشروع'},
      {label:'اسم المشروع',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'اسم المشروع'},
    
   ]
     first: number = 0;
   rows: number = 10;

   itemsTable:any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  warehouse: ['المخزن الرئيسي', 'مخزن 1', 'مخزن 2'][i % 3],
  supplier: `مورد ${i + 1}`,
  paymentMethod: ['كاش', 'تحويل بنكي', 'آجل'][i % 3],
  qty: Math.floor(Math.random() * 100) + 1,
  totalAmount: Math.floor(Math.random() * 50000) + 1000
}));

ProjectData:RowProjectModel[]=[]
showDeleteDialog=false
idDelete=0

// !!!!!!!!!!! Method

ngOnInit(){
this.getAllData()
}


onSearch(value: any) {
  console.log(value);
      this.first = 0;
   const dataActive=value;
   console.log(dataActive);
   if (!dataActive?.key || !dataActive?.value) {
    this.getAllData()
    return;
   }; 
   let enumKey: SearchableColumnEnum;


   if(dataActive.key == 'id'){
    this._projectsSevice.getByIdInQuery(dataActive.value).subscribe((res: any) => {
      console.log(res);
      this.ProjectData = [res.data].map((item: any) => ({
        ...item,
        startDate: new Date(item.startDate).toISOString().split('T')[0],
        endDate: new Date(item.endDate).toISOString().split('T')[0],
      }));
      this.totalRecords = 1;
          this.cdr.detectChanges();
    })
   }else{

    const enumKey: SearchableColumnEnum=SearchableColumnEnum.Name;
     const payload = buildSearchPayload(dataActive.value, this.rows, enumKey);
     this._projectsSevice.searchWithoutSkipLoader(payload).subscribe((res: any) => {
     this.ProjectData = [...res.data.rows].map((item: any) => ({
       ...item,
       startDate: new Date(item.startDate).toISOString().split('T')[0],
       endDate: new Date(item.endDate).toISOString().split('T')[0],
     }));
     this.totalRecords = res.data.paginationInfo.totalRowsCount;
         this.cdr.detectChanges();
   });
   }
 
  //  switch (dataActive.key) {
  //    case 'id':
  //      enumKey = SearchableColumnEnum.Code;
      
  //     console.log(dataActive.value);
  //      break;
  //    case 'name':
  //      enumKey = SearchableColumnEnum.Name;
  //      break;
  //    case 'phone':
  //      enumKey = SearchableColumnEnum.Phone;
  //      break;
  //    default:
  //      return;
  //  }
 
  //  const payload = buildSearchPayload(dataActive.value, this.rows, enumKey);
 
  //  this._projectsSevice.searchWithoutSkipLoader(payload).subscribe((res: any) => {
  //    this.ProjectData = [...res.data.rows];
  //    this.totalRecords = res.data.paginationInfo.totalRowsCount;
  //        this.cdr.detectChanges();
  //  });
 }
getAllData(){
  const page=this.first/this.rows + 1
  this._projectsSevice.getAllSendInQuery(page,this.rows).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
    this.ProjectData=res.data.rows.map((item:any)=>{
      return {
        ...item,
        date:item.date.split('T')[0],
        startDate:item.startDate.split('T')[0],
        endDate:item.endDate.split('T')[0]

      }
    })
    // console.log(this.ProjectData);
    this.totalRecords=res.data.paginationInfo.totalRowsCount
    console.log(this.ProjectData);
  })
}
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
        this.getAllData()

}  


onEditProject(id:number){
  this._router.navigate([`costcenter-and-projects/projects/add`]);
  this._sharedStateServices.setSelectedId(id)

}
showPopupDelete(id:number){
  this.idDelete=id;
  this.showDeleteDialog=true

}

deleteDialog(){
  if(this.idDelete > 0){
    this._projectsSevice.delete(this.idDelete).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
}
