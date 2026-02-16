import { Component, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { KeyboardService } from '../../services/keyboard-service';
import { BaseComponent } from '@/components/base-component/base-component';
import { NumbersKeyboard } from '../numbers-keyboard/numbers-keyboard';

@Component({
  selector: 'app-numbers-keyboard-dialog',
  imports: [Dialog, NumbersKeyboard],
  templateUrl: './numbers-keyboard-dialog.html',
  styleUrl: './numbers-keyboard-dialog.css',
})
export class NumbersKeyboardDialog extends BaseComponent {
  keyboardService = inject(KeyboardService);

  closeKeyboard = this.keyboardService.closeNumbersKeyboard;
}
