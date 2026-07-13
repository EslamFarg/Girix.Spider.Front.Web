import { Component, DestroyRef, inject } from '@angular/core';
import { PageHeaderSearch } from "../../../../../shared/ui/page-header-search/page-header-search";
import { Paginator } from "primeng/paginator";
import { ToggleSwitchModule, ToggleSwitch } from 'primeng/toggleswitch';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from "@ng-select/ng-select";
import { SectionsService } from '../sections/services/sections-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExchangeOfSalariesService } from './services/exchange-of-salaries-service';
import { FormError } from "../../../../../shared/ui/form-error/form-error";
@Component({
  selector: 'app-exchange-of-salaries',
  imports: [PageHeaderSearch, Paginator, ToggleSwitch, FormsModule, NgSelectComponent, ReactiveFormsModule, FormError],
  templateUrl: './exchange-of-salaries.html',
  styleUrl: './exchange-of-salaries.scss',
})
export class ExchangeOfSalaries {
// !!!!!!!!! Services
_departmentsService = inject(SectionsService);
_destroyRef = inject(DestroyRef);
_fb:FormBuilder=inject(FormBuilder);
_exchangeOfSalariesService = inject(ExchangeOfSalariesService);
employeesList:any=[];
  //!!!!!!!!!! Property 
  dataAddButton = {
    label: 'اضافه سند صرف جديد',
    action: '/expenses/simple-payment-voucher/add'
  }


  searchForm:any=this._fb.group({
    departmentId: [null,[Validators.required]],
    // employeeId: [null,[Validators.required]],
    employeeIds: [[], Validators.required],    
    month: [null,[Validators.required]],
    year: [null,[Validators.required]],
  });

  visible: boolean = false;
  checked: boolean = true;
  departmentsList:any=[];


  
  monthsList = [
    { name: 'يناير', id: 1 },
    { name: 'فبراير', id: 2 },
    { name: 'مارس', id: 3 },
    { name: 'أبريل', id: 4 },
    { name: 'مايو', id: 5 },
    { name: 'يونيو', id: 6 },
    { name: 'يوليو', id: 7 },
    { name: 'أغسطس', id: 8 },
    { name: 'سبتمبر', id: 9 },
    { name: 'أكتوبر', id: 10 },
    { name: 'نوفمبر', id: 11 },
    { name: 'ديسمبر', id: 12 },
  ];

  yearsList = [
    { name: '2026', id: 2026 },
    { name: '2027', id: 2027 },
    { name: '2028', id: 2028 },
    { name: '2029', id: 2029 },
    { name: '2030', id: 2030 },
    { name: '2031', id: 2031 },
    { name: '2032', id: 2032 },
    { name: '2033', id: 2033 },
    { name: '2034', id: 2034 },
    { name: '2035', id: 2035 },
    { name: '2036', id: 2036 },
    { name: '2037', id: 2037 },
    { name: '2038', id: 2038 },
    { name: '2039', id: 2039 },
    { name: '2040', id: 2040 },
  ];


  filteringData = [
    { label: 'رقم الفاتورة', key: 'invoiceNumber', type: 'text', value: '', class: 'col-span-12 md:col-span-4', placeholder: 'رقم الفاتورة' },
    { label: 'رقم المرجع', key: 'returnsNumber', type: 'text', value: '', class: 'col-span-12 md:col-span-4', placeholder: 'رقم المرجع' },
    { label: 'رقم الجوال', key: 'phoneNumber', type: 'text', value: '', class: 'col-span-12 md:col-span-4', placeholder: 'رقم الجوال' },
    { label: 'المورد', key: 'supplier', type: 'text', value: '', class: 'col-span-12', placeholder: 'المورد' },
  ]
  first: number = 0;
  rows: number = 10;

  itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    invoiceNumber: `INV-${1000 + i}`,
    date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
    warehouse: ['المخزن الرئيسي', 'مخزن 1', 'مخزن 2'][i % 3],
    supplier: `مورد ${i + 1}`,
    paymentMethod: ['كاش', 'تحويل بنكي', 'آجل'][i % 3],
    qty: Math.floor(Math.random() * 100) + 1,
    totalAmount: Math.floor(Math.random() * 50000) + 1000
  }));


  // !!!!!!!!!!! Method




  ngOnInit():void{
    this.loadDepartmentsItems();
    this.changeGetEmployees();
    this.loadCheckedEmployees()
  }


  changeGetEmployees():void{
    this.searchForm.valueChanges
  .pipe(takeUntilDestroyed(this._destroyRef))
  .subscribe((value:any) => {
    if (value.departmentId && value.month && value.year) {
      this.loadEmployeesItems();
    }
  });

    // this.loadEmployeesItems();
  }
  



  loadEmployeesItems():void{
    const param=new URLSearchParams({
      departmentId: this.searchForm.value.departmentId?.toString(),
      month: this.searchForm.value.month?.toString(),
      year: this.searchForm.value.year?.toString(),
    });

    

    if(this.searchForm.value.departmentId && this.searchForm.value.month && this.searchForm.value.year){
      this._exchangeOfSalariesService.getDepartmentSalaryPostingEmployees(param).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next:(res:any)=>{
          this.employeesList = [
            { id: 0, name: 'الكل' },
            ...(res.data ?? [])
          ];
          console.log(this.employeesList);  
        }
      });
    }
 
  }



  loadDepartmentsItems(): void {

    this._departmentsService
      .getAllSendInQuery(0,0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next:(res:any)=>{
          this.departmentsList = [
            { id:0, name:'الكل' },
            ...(res.data?.rows ?? [])
          ];
        }
      });
  
  }


  onSubmit():void{
    
   if(this.searchForm.invalid){
    this.searchForm.markAllAsTouched();
    return;
   }
   const param=new URLSearchParams();
   param.append('departmentId', this.searchForm.value.departmentId?.toString());
  //  param.append('employeeId', this.searchForm.value.employeeId?.toString());
   param.append('month', this.searchForm.value.month?.toString());
   param.append('year', this.searchForm.value.year?.toString());
  const value = this.searchForm.getRawValue();
value.employeeIds.forEach((id: number) => {
  param.append('employeeIds', id.toString());
});
   this._exchangeOfSalariesService.GetEmployeeSalaryPosting(param).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      console.log(res);
    }
   });
  }
  onPageChange(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;

  }

  showDialog() {
    this.visible = true;
  }

  // !!!!!!!!!! checked
  selectedEmployees:any[]=[];
  toggleAll(event: any):void{
    
  this.loadCheckedEmployees();

   console.log(this.selectedEmployees);
  }


  loadCheckedEmployees():void{
    if(this.checked){
      this.selectedEmployees=[...this.itemsTable];
     }else{
      this.selectedEmployees=[];
     }

     console.log(this.selectedEmployees);
  
  }
  


}
