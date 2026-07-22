// import { Component, inject, input, output } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { NgSelectComponent } from "@ng-select/ng-select";
// import { RouterLink } from "@angular/router";
// import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { DatePicker } from "primeng/datepicker";
// import { ActiveFilterKey } from '../../services/active-filter-key';

// @Component({
//   selector: 'app-page-header-search',
//   imports: [NgSelectComponent, FormsModule, RouterLink, ButtonModule, DialogModule, InputTextModule, DatePicker],
//   templateUrl: './page-header-search.html',
//   styleUrl: './page-header-search.scss',
// })
// export class PageHeaderSearch {

//   // !!!!!!!!!!!!!! Services
//   titleHeading=input<string>()
//   addButton=input<{label:string,type?:string,action:string}>();
//   filteringData:any=input<{label:string,key?:string,type?:string,value:string,class:string,placeholder:string}[]>();
//   _activeFilterKey=inject(ActiveFilterKey)
//   clickSearch = output<any>();
//   searchValue:any;
//   objData:any


//   // !!!!!!!!!!!! Properties
//   sizePagination=[
//     {name:'25',id:1},
//     {name:'50',id:2},
//     {name:'100',id:3},
//     {name:'200',id:4},
//     {name:'250',id:5},
//   ]
//   selectedSize='25'
//   visible: boolean = false;

//   // !!!!!!!!!!!!!!!!!!! Methods
//     showDialog() {
//         this.visible = true;
//     }

  
//   //    onFilterChange(item: any, value: any) {
//   //   item.value = value;
//   //   if (value && value.toString().trim() !== '') {
//   //     this._activeFilterKey.set(item.key);
//   //     this.searchValue=item.value
//   //   } else {
//   //     const anyFilled = this.filteringData().some((x:any) =>
//   //       x.value?.toString().trim()
//   //     );

//   //     if (!anyFilled) {
//   //       this._activeFilterKey.set(null);
//   //     }
//   //   }

    

    
//   // }



// //  search() {
// //   const activeFilters = this.filteringData().filter((x:any) =>
// //     x.value?.trim()
// //   );

// //   if (!activeFilters.length) return;

// //   this.clickSearch.emit(activeFilters);
// //   this.visible = false;
// // }

// onFieldChange(changedItem: any, value: any) {
//   changedItem.value = value;
//   const obj:any={
//     key:changedItem.key,
//     value:changedItem.value
//   }

//   // this.objData=obj
//     this._activeFilterKey.set(obj);
 
//   this.searchValue=changedItem.value
//   this.filteringData().forEach((item: any) => {
//     if (item !== changedItem) {
//       item.value = null;
//     }
//   });

// }



// search() {
//   // this.clickSearch.emit(this.searchValue); // ✅ مهم جدًا
//   // this.visible = false;
//   // console.log(this._activeFilterKey.value());
//   //  this._activeFilterKey.set(this.objData);
//     // this.visible = false;
//     // this.clickSearch.emit(true);
//     this.clickSearch.emit(this._activeFilterKey.value());
// }

// }


import { ChangeDetectorRef, Component, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from "@ng-select/ng-select";
import { RouterLink } from "@angular/router";
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from "primeng/datepicker";
import { ActiveFilterKey } from '../../services/active-filter-key';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-page-header-search',
  standalone: true,
  imports: [
    NgSelectComponent,
    FormsModule,
    RouterLink,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DatePicker
  ],
  templateUrl: './page-header-search.html',
  styleUrl: './page-header-search.scss',
})  
export class PageHeaderSearch {

  titleHeading = input<string>('');
  addButton = input<any>(null);
  filteringData = input<any[]>([]);
  clickSearch = output<any>();
  showIconSearch = input<boolean>(true);
  multiFilter = input<boolean>(false);
  filterDialogWidth = input<string>('25rem');
  _messageService=inject(MessageService);
 

  private _activeFilterKey = inject(ActiveFilterKey);
  private cdr = inject(ChangeDetectorRef);

  visible = false;

  showDialog() {
    this.visible = true;
  }


 


  onFieldInput(currentItem: any) {
    currentItem.error = '';

      // اعمل Validation أثناء الكتابة
  this.validateField(currentItem);

    if (this.multiFilter()) {
      return;
    }

    if (this.hasFilterValue(currentItem.value)) {
      this.filteringData().forEach((item: any) => {
        if (item !== currentItem) {
          this.clearFilterValue(item);
        }
      });
    }
  }

  private hasFilterValue(value: unknown): boolean {
    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }

    return value != null && String(value).trim() !== '';
  }

  private formatFilterValue(value: unknown): string {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return String(value).trim();
  }

  private clearFilterValue(item: any): void {
    item.value = item.type === 'date' ? null : '';
  }

  search() {

    let isValid = true;

  this.filteringData().forEach(item => {
    if (!this.validateField(item)) {
      isValid = false;
    }
  });

  if (!isValid) {
    return;
  }
  
    if (this.multiFilter()) {
      const filters = this.filteringData().reduce(
        (acc: Record<string, string>, item: any) => {
          if (this.hasFilterValue(item.value)) {
            acc[item.key] = this.formatFilterValue(item.value);
          }
          return acc;
        },
        {}
      );

      this.visible = false;
      this.clickSearch.emit({ filters });
      this.cdr.detectChanges();
      return;
    }

    const active = this.filteringData().find((x: any) => this.hasFilterValue(x.value));
    // if (!active) return;

    if(!active){
      this.clickSearch.emit(null);
      this.visible = false;
      this.cdr.detectChanges();
      return;
    }

    this.visible = false;

    this.clickSearch.emit({
      key: active.key,
      value: this.formatFilterValue(active.value),
    });

    this.cdr.detectChanges();
    this.filteringData().forEach((item: any) => {
      this.clearFilterValue(item);
    });
  }


  // !! Validation
  // private validateField(item: any): string | null {

  //   const value = item.value?.toString().trim() ?? '';
  
  //   // لو الحقل فاضي متعملش Validation
  //   if (!value) {
  //     return null;
  //   }
  
  //   switch (item.key) {
  
  //     case 'phone':
  //       if (!/^01[0125]\d{8}$/.test(value)) {
  //         return 'رقم الجوال غير صحيح';
  //       }
  //       break;
  
  //     case 'email':
  //       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
  //         return 'البريد الإلكتروني غير صحيح';
  //       }
  //       break;
  
  //     case 'code':
  //       if (!/^[0-9]+$/.test(value)) {
  //         return 'الكود يجب أن يكون أرقام فقط';
  //       }
  //       break;
  
  //     case 'nationalId':
  //       if (!/^\d{14}$/.test(value)) {
  //         return 'الرقم القومي يجب أن يكون 14 رقم';
  //       }
  //       break;
  
  //     case 'taxNumber':
  //       if (!/^\d{9,15}$/.test(value)) {
  //         return 'الرقم الضريبي غير صحيح';
  //       }
  //       break;
  
  //     default:
  //       return null;
  //   }
  
  //   return null;
  // }


  private validateField(item: any): boolean {

    item.error = '';
  
    const value = item.value?.toString().trim() ?? '';
  
    if (!value) {
      return true;
    }
  
    switch (item.key) {
  
      case 'phone':
        if (!/^01[0125]\d{8}$/.test(value)) {
          item.error = 'رقم الجوال غير صحيح';
          return false;
        }
        break;
  
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          item.error = 'البريد الإلكتروني غير صحيح';
          return false;
        }
        break;
  
      case 'code':
        if (!/^[0-9]+$/.test(value)) {
          item.error = 'الكود يجب أن يكون أرقام فقط';
          return false;
        }
        break;
        case 'employeeNumber':
          if (!/^\d+$/.test(value)) {
            item.error = 'رقم الموظف يجب أن يكون أرقام فقط';
            return false;
          }
          break;   
        case 'id':
          if (!/^\d+$/.test(value)) {
            item.error = 'رقم المشروع يجب أن يكون أرقام فقط';
            return false;
          }
          break;
    }
  
    return true;
  }


}