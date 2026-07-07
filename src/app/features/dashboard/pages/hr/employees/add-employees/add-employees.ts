import { Component, DestroyRef, forwardRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Dialog } from 'primeng/dialog';
import { InputAttachment } from '../../../../../../shared/ui/input-attachment/input-attachment';
import { FormBuilder, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { entityNameValidator } from '../../../../../../shared/validations/entity-name-validator';
import { SectionsService } from '../../sections/services/sections-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-employees',
  imports: [
    RouterLink,
    DatePicker,
    NgSelectComponent,
    Dialog,
    InputAttachment,
    ReactiveFormsModule,
  ],
  templateUrl: './add-employees.html',
  styleUrl: './add-employees.scss',
})
export class AddEmployees extends FormComponentBase {
  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  formAttachment = this._fb.group({
    attachment: [''],
  });
  _sectionsService = inject(SectionsService);
  _destroyRef: DestroyRef = inject(DestroyRef);
  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
  visible: boolean = false;
  visibleReject: boolean = false;
  items = [];

  employeeForm = this._fb.group({
  employeeNumber: [
    '',
    [Validators.required, Validators.maxLength(40)]
  ],

  baseNember: [
    '',
    [Validators.required,Validators.maxLength(40)]
  ],

  allowances: [
    null,
    [Validators.required]
  ],

  salary: [
    null,
    [Validators.required]
  ],

  departmentId: [
    null,
    [Validators.required]
  ],

  nameAr: [
    '',
    [
      Validators.required,
      Validators.maxLength(200),
      entityNameValidator()
    ]
  ],

  nameEn: [
    '',
    [
      Validators.required,
      Validators.maxLength(200),
      entityNameValidator()
    ]
  ],

  phoneNember: [
    '',
    [
      Validators.required,
      Validators.maxLength(20)
    ]
  ],

  image: [
    null
  ],

  nationalIdOrIqamaNumber: [
    '',
    [Validators.required]
  ],

  nationalIdOrIqamaNumberFile: [
    null
  ],

  medicalInsuranceDate: [
    null
  ],

  medicalInsuranceFile: [
    null
  ],

  iban: [
    '',
    [Validators.required]
  ],

  bankAttachmentFile: [
    null
  ],

  passportNumber: [
    ''
  ],

  passportAttachment: [
    null
  ],

  borderNumber: [
    ''
  ],

  borderAttachment: [
    null
  ],

  nationality: [
    '',
    [Validators.required]
  ],

  jobTitle: [
    '',
    [Validators.required]
  ],

  dateOfBirth: [
    null,
    [Validators.required]
  ],

  workStartDate: [
    new Date(),
    [Validators.required]
  ],

  returnFromLeaveDate: [
    null
  ],

  contractEndDate: [
    null
  ],

  contractEndAttachmentFile: [
    null
  ],

  address: [
    '',
    [
      Validators.required,
      Validators.maxLength(500)
    ]
  ]
});

accountExlorer:any=[]
sectionsData:any[]=[]
pageSize = 20;
offset = 0;

loading = false;
hasMore = true;
  // !!!!!!!!!!!!!!! Methods
  ngOnInit() {
    this.getAllDataSections();
    this.refreshActions();
  }

  getAllDataSections(){
     if (this.loading || !this.hasMore) return;
    this.loading = true;
    this._sectionsService.getAllSendInQuery(this.offset,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      // this.sectionsData=res.data.rows
         const rows = res.data.rows;

        this.sectionsData = [...this.sectionsData, ...rows];

        // لو رجع أقل من 20 يبقى مفيش بيانات تاني
        if (rows.length < this.pageSize) {
          this.hasMore = false;
        }

        this.loading = false;
      console.log(this.sectionsData);
    })
  }

  loadMoreSections() {

  if (!this.hasMore) return;

  this.offset += this.pageSize;

  this.getAllDataSections();
}

  save() {
    console.log('Save action triggered');
  }

  reset() {
    console.log('Reset action triggered');
  }

  delete() {
    console.log('Delete action triggered');
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

  imagePreview: string | ArrayBuffer | null = null;

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
