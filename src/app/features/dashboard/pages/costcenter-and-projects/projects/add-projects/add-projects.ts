import { Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DatePicker } from 'primeng/datepicker';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { NgClass } from '@angular/common';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { entityNameValidator } from '../../../../../../shared/validations/entity-name-validator';
import { CostCenterService } from '../../cost-center/services/cost-center';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import { AttachmentManagerComponent } from "../../../../../../shared/ui/attachment-manager/attachment-manager";
import { ProjectsService } from '../services/projects.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaxPercentageDirective } from '../../../../../../shared/directives/percentage-max';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { MessageService } from 'primeng/api';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { environment } from '../../../../../../../environments/environment.development';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';


@Component({
  selector: 'app-add-projects',
  imports: [Dialog, NgSelectComponent,onlyNumberDirective, DatePicker, RouterLink, AutoCompleteModule, MaxPercentageDirective, NgClass, ReactiveFormsModule, FormError, onlyNumberDirective, AttachmentManagerComponent, SharedConfirmDialog],
  templateUrl: './add-projects.html',
  styleUrl: './add-projects.scss',
})
export class AddProjects  extends FormComponentBase{
  // !!!!!!!!!!!!!!!!! Services
  _fb:FormBuilder=inject(FormBuilder);
  _constCenterServices:CostCenterService=inject(CostCenterService);
  _projectServices = inject(ProjectsService);
  _destroyRef = inject(DestroyRef);
  _messageService:MessageService=inject(MessageService)
  _sharedStateServices=inject(SharedStateServices)
  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('inputVal') inputVal!:ElementRef
  showSearchBox = false;
  selectedSearchType: 'id' | 'reference' | 'name'= 'id';
  constCenterList: any[] = [];
  showDeleteDialog = false;

  projectForm:any = this._fb.group({
    projectNumber:[
      null
    ],
  referenceNumber: [
    '',
    [
      Validators.required,
      Validators.maxLength(50)
    ]
  ],

  nameAr: [
    '',
    [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(200),
      entityNameValidator()
    ]
  ],

  nameEn: [
    '',
    [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(200),
      entityNameValidator()
    ]
  ],

  projectValue: [
    null,
    [
      Validators.required,
      Validators.minLength(0),
      Validators.maxLength(10)
    ]
  ],

  projectTax: [
    null,
    [
      Validators.required,
      Validators.maxLength(10)
    ]
  ],

  insuranceValue: [
    null,
    [Validators.required]
 
  ],

  insurancePercentage: [
    null,
    [
      Validators.required
    ]
  ],

  date: [
    new Date(),
    Validators.required
  ],

  startDate: [
    new Date(),
    [Validators.required,]
  ],

  endDate: [
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    Validators.required
  ],

  statement: [
    '',
    [
      Validators.maxLength(1000)
    ]
  ],

  costCenterIds: this._fb.control<number[]>([], Validators.required),

  technicalSpecsAttachment: [
    null
  ],

  legalDocsAttachment: [
    null
  ]
});

  date2: Date | undefined;
 

  visible: boolean = false;
  visibleReject: boolean = false;


  addValueBool = false;


  items = [
   
  ];

  



  selectedSearch = 'كود الصنف';
  searchControl = new FormControl('', [Validators.required]);
  // !!!!!!!!!!!!!!! Methods
  ngOnInit(): void {
    this.getAllCostCenters();
    this.loadNameEn();
    this.loadProjectsCommingFromExplorer();
    this.refreshActions();
  }



  loadProjectsCommingFromExplorer(){
    const id = this._sharedStateServices.selectedId$();
    if(id){
      console.log(id);
      this.getProjectById(id)
      // this.loadProject(id)
    }
  }

  getAllCostCenters() {
    this._constCenterServices.getAllWithoutPagination().subscribe({
      next: (res: any) => {
        // this.costCenters = res;
        // console.log(res);
        const result=this.flattenCostCenters(res.data)
        console.log(result);
        // console.log(res);
        this.constCenterList = result;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }


  loadNameEn(){
    this.projectForm.get('nameAr')?.valueChanges?.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value: any) => {
      this.projectForm.patchValue(
        {
          nameEn: value,
        },
        {
          emitEvent: false,
        },
      );
    })
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


searchById(value: any) {
const id= value;
// if(typeof id !== 'number'){
//   this._messageService.add({
//     severity: 'warn',
//     summary: 'تنبيه',
//     detail: 'الرقم يجب ان يكون رقم'
//   })
//   return
// } 
if (id) {
  this.getProjectById(id);
  this.inputVal.nativeElement.value = '';

}
}


prevProject() {
  const currentId = Number(this.projectForm.get('projectNumber')?.value);

  if (!currentId || currentId <= 1) {
    return;
  }

  this.getProjectById(currentId - 1);
}

nextProject() {
  const currentId = Number(this.projectForm.get('projectNumber')?.value);

  if (!currentId) {
    return;
  }

  this.getProjectById(currentId + 1);
}
  getProjectById(id: number) {

  this._projectServices
    .getByIdInQuery(id)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe((res:any)=>{
        if (!res?.data) {

          this._messageService.add({
            severity: 'warn',
            summary: 'تنبيه',
            detail: 'لا يوجد مشروع بهذا الرقم'
          });

          return;
        }

        this.isEditMode=true;
        const project = res.data;
        this.loadProject(project);
        
    });

}

// loadProject(project: any) {

//   this.projectForm.patchValue({
//     projectNumber: project.projectNumber,
//     referenceNumber: project.referenceNumber,
//     nameAr: project.nameAr,
//     nameEn: project.nameEn,
//     projectValue: project.projectValue,
//     projectTax: project.projectTax,
//     insuranceValue: project.insuranceValue,
//     insurancePercentage: project.insurancePercentage,
//     date: project.date ? new Date(project.date) : null,
//     startDate: project.startDate ? new Date(project.startDate) : null,
//     endDate: project.endDate ? new Date(project.endDate) : null,
//     statement: project.statement,
//     costCenterIds: project.costCenterIds
//   });

//   // لو فيه مرفقات من السيرفر
//   this.selectedFiles = project.technicalSpecsAttachment
//     ? [{
//         name: project.technicalSpecsAttachmentName,
//         url: project.technicalSpecsAttachment
//       }]
//     : [];

//   this.selectedFiles2 = project.legalDocsAttachment
//     ? [{
//         name: project.legalDocsAttachmentName,
//         url: project.legalDocsAttachment
//       }]
//     : [];

// }

loadProject(project: any) { 
  this.idUpdate=project.id

  this.projectForm.patchValue({
    projectNumber: project.id, // أو project.projectNumber لو الـ API بيرجعه
    referenceNumber: project.referenceNumber,
    nameAr: project.nameAr,
    nameEn: project.nameEn,

    projectValue: project.projectValue,
    projectTax: project.projectTax,
    insuranceValue: project.insuranceValue,
    insurancePercentage: project.insurancePercentage,

    date: project.date ? new Date(project.date) : null,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,

    statement: project.statement,

    costCenterIds: project.costCenters?.map(
      (x: any) => x.costCenterId
    ) ?? []
  });

  //   this.selectedFiles = project.technicalSpecsAttachment
  //   ? [{
  //       name: project.technicalSpecsAttachmentName,
  //       url: project.technicalSpecsAttachment
  //     }]
  //   : [];

  // this.selectedFiles2 = project.legalDocsAttachment
  //   ? [{
  //       name: project.legalDocsAttachmentName,
  //       url: project.legalDocsAttachment
  //     }]
  //   : [];

const baseUrl = environment.baseUrl.replace('/api', '');

const nameSelectedFiles = project?.technicalSpecsAttachment?.split('/')?.pop();
const nameSelectedFiles2 = project?.legalDocsAttachment?.split('/')?.pop();

this.selectedFiles = [{
  name: nameSelectedFiles,
  url: `${baseUrl}/${project.technicalSpecsAttachment}`
}];

this.selectedFiles2 = [{
  name: nameSelectedFiles2,
  url: `${baseUrl}/${project.legalDocsAttachment}`
}];

}
    



  save() {  

    if(this.projectForm.invalid){
      this.projectForm.markAllAsTouched();
      return;
    }

  const value = this.projectForm.getRawValue();

  const formData = new FormData();

  formData.append('ReferenceNumber', value.referenceNumber!);
  formData.append('NameAr', value.nameAr!);
  formData.append('NameEn', value.nameEn!);

  formData.append('ProjectValue', String(value.projectValue));
  formData.append('ProjectTax', String(value.projectTax));
  formData.append('InsuranceValue', String(value.insuranceValue));
  formData.append('InsurancePercentage', String(value.insurancePercentage));

  formData.append('Date', value.date!.toISOString());
  formData.append('StartDate', value.startDate!.toISOString());
  formData.append('EndDate', value.endDate!.toISOString());

  formData.append('Statement', value.statement ?? '');

  // Cost Centers
   value.costCenterIds?.forEach((id:any) => {
    formData.append('CostCenterIds', String(id));
   });

  // Technical Attachment
  if (this.selectedFiles.length > 0) {
    // formData.append(
    //   'technicalSpecsAttachment',
    //   this.selectedFiles[0].file
    // );

    this.selectedFiles.forEach(file => {
      formData.append(
        'technicalSpecsAttachment',
        file.file
      );
    })
  }

  // Legal Attachment
  if (this.selectedFiles2.length > 0) {
    // formData.append(
    //   'legalDocsAttachment',
    //   this.selectedFiles2[0].file
    // );

    this.selectedFiles2.forEach(file => {
      formData.append(
        'legalDocsAttachment',
        file.file
      );
    })
  }

  // console.log(formData);
  for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

 if(this.isEditMode == false){
   this._projectServices.create(formData).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next: (res:any) => {
      console.log(res);
      this.projectForm.patchValue({
        projectNumber: res.data
      })
      // this.is
      this._messageService.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الاضافة بنجاح',
      })
      this.changeButtonState(res.data,true);
    }
  });
 }else{
  formData.append('Id', String(this.idUpdate));
  this._projectServices.updateWithOutPathParameter(formData).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next: (res:any) => {
      this._messageService.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم التعديل بنجاح',
      })
    }
  });
 }
  }

  reset() {
    this.projectForm.reset({
      date: new Date(),
      startDate: new Date(),
      endDate: new Date().setFullYear(new Date().getFullYear() + 1),
    });
    this.selectedFiles = [];
    this.selectedFiles2 = [];
    // this.productCards.clear();
    this.idUpdate = 0;
    this.isEditMode = false;
    this.inputVal.nativeElement.value = '';
      // this._sharedStateServices.clearSelectedId();

    this.refreshActions();
  }

  deleteGroup() {
    // console.log('Delete group action triggered');
    this._projectServices.delete(this.idUpdate).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this._messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم الحذف بنجاح',
        })
        this.showDeleteDialog=false;
        this.reset();
      }
    })
  }
  delete() {
    this.showDeleteDialog = true;
  }

  print() {
    console.log('Print action triggered');
  }

  showDialogReject() {
    this.visibleReject = true;
  }

  showDialog() {
    this.visible = true;
  }

  popupAddValue() {
    this.addValueBool = !this.addValueBool;
  }

  // !!!! Attchments
  previewDialog = false;
  previewDialog2 = false;

selectedFiles: any[] = [];
selectedFiles2: any[] = [];


removeFile(index:number){

    this.selectedFiles.splice(index,1);

}
removeFile2(index:number){

    this.selectedFiles.splice(index,1);

}

onFilesSelected(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  Array.from(input.files).forEach(file => {

    const exists = this.selectedFiles.some(f =>
      f.name === file.name &&
      f.size === file.size
    );

    if (!exists) {
      this.selectedFiles.push({
        name: file.name,
        file,
        size: file.size,
        extension: file.name.split('.').pop()?.toLowerCase()
      });
    }

  });

  input.value = '';
}
onFilesSelected2(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  Array.from(input.files).forEach(file => {

    const exists = this.selectedFiles2.some(f =>
      f.name === file.name &&
      f.size === file.size
    );

    if (!exists) {
      this.selectedFiles2.push({
        name: file.name,
        file,
        size: file.size,
        extension: file.name.split('.').pop()?.toLowerCase()
      });
    }

  });

  input.value = '';
}
previewFile(file:AttachmentFile){

   const url =
   file.url ??
   URL.createObjectURL(file.file!);

   window.open(url,'_blank');

}
previewFile2(file:AttachmentFile){

   const url =
   file.url ??
   URL.createObjectURL(file.file!);

   window.open(url,'_blank');

}

showPopupPreview() {
  this.previewDialog = true;
}
showPopupPreview2() {
  this.previewDialog2 = true;
}


ngOnDestroy(): void {
  this._sharedStateServices.clearSelectedId();
}
}
