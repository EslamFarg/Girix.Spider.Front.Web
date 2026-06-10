import { Component, input, output } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-shared-confirm-dialog',
  imports: [NgClass],
  templateUrl: './shared-confirm-dialog.html',
  styleUrl: './shared-confirm-dialog.scss',
})
export class SharedConfirmDialog {

  show=input<boolean>(false);
  title=input<string>('');
  message=input<string>('');
  confirm=output<void>();
  cancel=output<void>();

  onConfirm(){
    this.confirm.emit();
  }

  onCancel(){
    this.cancel.emit();
  }
}
