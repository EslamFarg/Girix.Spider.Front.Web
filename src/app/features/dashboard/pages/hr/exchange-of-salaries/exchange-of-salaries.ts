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
import { exchangeSalariesModel } from './models/exchange-salaries';
import { MessageService } from 'primeng/api';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-exchange-of-salaries',
  imports: [PageHeaderSearch, Paginator, NgClass,ToggleSwitch, FormsModule, NgSelectComponent, ReactiveFormsModule, FormError],
  templateUrl: './exchange-of-salaries.html',
  styleUrl: './exchange-of-salaries.scss',
})
export class ExchangeOfSalaries {
// !!!!!!!!! Services
_departmentsService = inject(SectionsService);
_destroyRef = inject(DestroyRef);
_fb:FormBuilder=inject(FormBuilder);
_exchangeOfSalariesService = inject(ExchangeOfSalariesService);
_messageService=inject(MessageService);
employeesList:any=[];
private lastEmployeesLoadKey = '';
  //!!!!!!!!!! Property 
  dataAddButton = {
    label: 'اضافه سند صرف جديد',
    action: '/expenses/simple-payment-voucher/add'
  }

  totalRecords: number = 0;

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

  // itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  //   id: i + 1,
  //   invoiceNumber: `INV-${1000 + i}`,
  //   date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  //   warehouse: ['المخزن الرئيسي', 'مخزن 1', 'مخزن 2'][i % 3],
  //   supplier: `مورد ${i + 1}`,
  //   paymentMethod: ['كاش', 'تحويل بنكي', 'آجل'][i % 3],
  //   qty: Math.floor(Math.random() * 100) + 1,
  //   totalAmount: Math.floor(Math.random() * 50000) + 1000
  // }));

  exchangeSalariesList:exchangeSalariesModel[]=[];

  // !!!!!!!!!!! Method




  ngOnInit():void{
    this.loadDepartmentsItems();
    this.changeGetEmployees();
    this.loadCheckedEmployees()
  }


  changeGetEmployees(): void {
    this.searchForm.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value: any) => {
        if (!this.canLoadEmployees(value)) {
          return;
        }

        const loadKey = `${value.departmentId}-${value.month}-${value.year}`;
        if (loadKey === this.lastEmployeesLoadKey) {
          return;
        }

        this.lastEmployeesLoadKey = loadKey;
        this.loadEmployeesItems();
      });
  }

  private canLoadEmployees(value: {
    departmentId?: number | null;
    month?: number | null;
    year?: number | null;
  }): boolean {
    return value.departmentId != null && value.month != null && value.year != null;
  }

  private buildPeriodParams(): URLSearchParams {
    const { departmentId, month, year } = this.searchForm.getRawValue();
    const param = new URLSearchParams({
      month: month?.toString() ?? '',
      year: year?.toString() ?? '',
    });

    if (departmentId != null) {
      param.set('departmentId', departmentId.toString());
    }

    return param;
  }

  loadEmployeesItems(): void {
    const value = this.searchForm.getRawValue();

    if (!this.canLoadEmployees(value)) {
      return;
    }

    this._exchangeOfSalariesService
      .getDepartmentSalaryPostingEmployees(this.buildPeriodParams())
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.employeesList = [{ id: 0, name: 'الكل' }, ...(res.data ?? [])];
          this.searchForm.patchValue({ employeeIds: [] }, { emitEvent: false });
        },
      });
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


  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const param = this.buildPeriodParams();
    const employeeIds = this.resolveEmployeeIds(this.searchForm.getRawValue().employeeIds);

    employeeIds.forEach((id: number) => {
      param.append('employeeIds', id.toString());
    });

    this._exchangeOfSalariesService
      .GetEmployeeSalaryPosting(param)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.exchangeSalariesList = res.data.map((item: any) => ({
            ...item,
            checked: true,
          }));
          this.checked = true;
          console.log(res);
          this.selectedEmployees = [...this.exchangeSalariesList];
        },
      });
  }

  private resolveEmployeeIds(selectedIds: number[]): number[] {
    if (!selectedIds?.length) {
      return [];
    }

    if (selectedIds.includes(0)) {
      return this.employeesList
        .filter((item: { id: number }) => item.id !== 0)
        .map((item: { id: number }) => item.id);
    }

    return selectedIds;
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
 

      // this.exchangeSalariesList.forEach(item => {
      //   item.checked = this.checked;
      // });
    
      // this.selectedEmployees = this.checked
      //   ? [...this.exchangeSalariesList]
      //   : [];
      
      this.exchangeSalariesList.forEach(item => item.checked = this.checked);
  
      this.selectedEmployees = this.checked
        ? [...this.exchangeSalariesList]
        : [];
    
  }
  
  toggleEmployee(item: any): void {
    if (item.checked) {
      if (!this.selectedEmployees.some(x => x.employeeId === item.employeeId)) {
        this.selectedEmployees.push(item);
      }
    } else {
      this.selectedEmployees = this.selectedEmployees.filter(
        x => x.employeeId !== item.employeeId
      );
    }
  
    this.checked = this.exchangeSalariesList.every(x => x.checked);
  }


  isEditMode: boolean = false;
  salaryPaymentId: number | null = null;
  salaryPayment() {
  
    // if (this.selectedEmployees.length === 0) {
    //   this._messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب عليك اختيار موظف واحد على الاقل' });
    //   return;
    // }
    const payload: any = {
      paymentDate: new Date(),
      salaryPostingId: 0,
      notes: "string",
      payAllEmployees: false,
      details: this.selectedEmployees.map((item: any) => ({
        salaryPostingDetailId: item.salaryPostingDetailId,
        employeeId: item.employeeId,
        amount: item.netSalary,
      }))
    };

    if (this.isEditMode) {
      payload.id = this.salaryPaymentId;
      this._exchangeOfSalariesService.updateSalaryPayment(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next: (res: any) => {
          console.log(res);
         
          console.log(this.salaryPaymentId);
          this._messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تعديل صرف الرواتب بنجاح' });
        }
      });
    } else {
      this._exchangeOfSalariesService.createSalaryPayment(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next: (res: any) => {
          console.log(res);
          this.salaryPaymentId = res.data;
          this._messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم صرف الرواتب بنجاح' });
          this.isEditMode = true;
        }
      });
    }
    console.log(this.selectedEmployees);
  }

}
