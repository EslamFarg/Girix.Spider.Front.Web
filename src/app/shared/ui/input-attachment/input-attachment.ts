import { Component, ElementRef, forwardRef, inject, input, output, ViewChild } from '@angular/core';
import { ToastrServices } from '../toastr/services/toastr';
import { NgClass } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { environment } from '../../../../environments/environment.development';

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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>


  _toastr:ToastrServices=inject(ToastrServices);
  label=input<string>();
  fileSelected=output<File>();

  accept="image/*";
  id = 'attch-' + Math.random().toString(36).substring(2, 9);

    file!: File;
  fileName = '';
  fileUrl: string | null = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  // writeValue(value: any): void {

  //   if (this.fileUrl) {
  //     URL.revokeObjectURL(this.fileUrl);
  //   }
  //   if (value) {
  //     this.file = value;
  //     this.fileName = value.name;
  //     this.fileUrl = URL.createObjectURL(value);
  //   }else{
  //     // this.reset.set(true); this.file = null as any;
  //   this.fileName = '';
  //   this.fileUrl = null;

  //   if (this.fileInput) {
  //     this.fileInput.nativeElement.value = '';
  //   }
      
  //   }
  // }

  writeValue(value: any): void {

    if (this.fileUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.fileUrl);
    }
  
    if (!value) {
      this.file = null as any;
      this.fileName = '';
      this.fileUrl = null;
  
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
  
      return;
    }
  
    // لو File جديد
    if (value instanceof File) {
      this.file = value;
      this.fileName = value.name;
      this.fileUrl = URL.createObjectURL(value);
      return;
    }
  
    // لو String راجع من السيرفر
    if (typeof value === 'string') {
      this.fileName = value.split('/').pop() ?? 'File';
      this.fileUrl = environment.baseUrl + '/' + value;
      return;
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
