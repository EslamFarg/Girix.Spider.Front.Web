import { Component, forwardRef, inject, input, output } from '@angular/core';
import { ToastrServices } from '../toastr/services/toastr';
import { NgClass } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-attachment',
  imports: [NgClass],
  templateUrl: './input-attachment.html',
  styleUrl: './input-attachment.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputAttachment),
      multi: true
    }
  ]
})
export class InputAttachment {


  _toastr:ToastrServices=inject(ToastrServices);
  label=input<string>();
  fileSelected=output<File>();

  id = 'attch-' + Math.random().toString(36).substring(2, 9);

  // fileName: string = '';
  // fileUrl: string | null = null;
  // file!: File;



  // onFileChange(event:any){
  //   const file=event.target.files[0];
  //   if(!file) return;
  //   this.file=file;
  //   this.fileName=file.name;
  //   this.fileUrl=URL.createObjectURL(file);
  //   this.fileSelected.emit(file);
  // }


  // openFile(){
  //   console.log(this.fileUrl)
  //   if(this.fileUrl){
  //     window.open(this.fileUrl,'_blank');
  //   }else{
  //     this._toastr.show('لم يتم اختيار ملف','error');

  //   }

  // }

    file!: File;
  fileName = '';
  fileUrl: string | null = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.file = value;
    if (value) {
      this.fileName = value.name;
      this.fileUrl = URL.createObjectURL(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.file = file;
    this.fileName = file.name;
    this.fileUrl = URL.createObjectURL(file);

    this.onChange(file); // 🔥 أهم سطر
    this.onTouched();
  }

  openFile() {
    if (this.fileUrl) {
      window.open(this.fileUrl, '_blank');
    }
  }
}
