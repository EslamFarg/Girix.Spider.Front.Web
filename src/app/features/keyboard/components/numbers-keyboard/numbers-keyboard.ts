import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { Dialog } from "primeng/dialog";
import { KeyboardService } from '../../services/keyboard-service';

@Component({
  selector: 'app-numbers-keyboard',
  imports: [Dialog],
  templateUrl: './numbers-keyboard.html',
  styleUrl: './numbers-keyboard.css',
})
export class NumbersKeyboard extends BaseComponent {

  keyboardService=inject(KeyboardService);

  isVisible=this.keyboardService.isNumbersKeyboardVisible;
  closeKeyboard=this.keyboardService.closeNumbersKeyboard;
}
