import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { KeyboardService } from '../../services/keyboard-service';
import { label } from '@primeuix/themes/aura/metergroup';
import { ButtonDirective } from "primeng/button";

@Component({
  selector: 'app-numbers-keyboard',
  imports: [Dialog, ButtonDirective],
  templateUrl: './numbers-keyboard.html',
  styleUrl: './numbers-keyboard.css',
})
export class NumbersKeyboard extends BaseComponent {
  keyboardService = inject(KeyboardService);

  isVisible = this.keyboardService.isNumbersKeyboardVisible;
  closeKeyboard = this.keyboardService.closeNumbersKeyboard;

  btns = this.keyboardService.btns;
  bypass=this.sanitizer.bypassSecurityTrustHtml

  triggerNumbersBtn=this.keyboardService.triggerNumbersBtn;
  /**
   *
   */
  constructor() {
    super();
  }
}
