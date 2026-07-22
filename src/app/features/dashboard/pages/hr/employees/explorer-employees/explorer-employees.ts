import { Component, DestroyRef, inject } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { EmployeeService } from '../services/employee-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeModel } from '../model/employee';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { MessageService } from 'primeng/api';
import { Route, Router } from '@angular/router';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';

@Component({
  selector: 'app-explorer-employees',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-employees.html',
  styleUrl: './explorer-employees.scss',
})
export class ExplorerEmployees {
  // !!!!!!!! Services
  _employeeService:EmployeeService=inject(EmployeeService);
  _destroyRef:DestroyRef=inject(DestroyRef)
  _messageService=inject(MessageService);
  _router:Router=inject(Router);
  _sharedStateService=inject(SharedStateServices);
    //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه موظف جديد',
      action:'/hr/employees/add'
   }

   
filteringData=[
      {label:'رقم الموظف',key:'employeeNumber',error:'',type:'text',value:'',class:'col-span-12',placeholder:'رقم الموظف'},
      // {label:'اسم الموظف',key:'employeeName',error:'',type:'text',value:'',class:'col-span-12',placeholder:'اسم الموظف'},
      
   ]
     first: number = 0;
   rows: number = 10;

 


employeeData:EmployeeModel[]=[];
totalRecords=0
idDelete:number=0
showDeleteDialog=false;
// !!!!!!!!!!! Method

ngOnInit(){
  this.getAllData();
}
getAllData(){
  const page=Math.floor(this.first/this.rows)+1
  this._employeeService.getAllSendInQuery(page,this.rows).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
    this.employeeData=res.data.rows;
    this.totalRecords=res.data.paginationInfo.totalRowsCount;
  })
  
}
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    this.getAllData()
} 


search(e:any){

  // console.log(e);
  if(!e?.value?.trim()){
    this.first=0;
    this.getAllData();
    return;
  }
  console.log(e);

  
  this._employeeService.getById(e.value).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{


    
    if(!res?.data){
      this.getAllData();
      return;
    }
    this.employeeData=[res.data];
    this.totalRecords=res.data.paginationInfo.totalRowsCount;
  },(err:any)=>{
    this.getAllData();
  })
}

updateEmployee(id:number){

  this._sharedStateService.setSelectedId(id);
  this._router.navigate(['/hr/employees/add'])
}

deleteEmployee(id:number){
  // this._employeeService.delete(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
  //   next:(res:any)=>{
  //     this.getAllData();
  //   }
  // })
  this.showDeleteDialog=true
  this.idDelete=id
}

deleteDialog(){
  this._employeeService.delete(this.idDelete).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this._messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'تم الحذف بنجاح',
      });
      this.showDeleteDialog=false
      this.idDelete=0
      this.getAllData();
    }
  })

}


}
