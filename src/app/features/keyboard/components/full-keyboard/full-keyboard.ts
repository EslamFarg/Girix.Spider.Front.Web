import { BaseComponent } from '@/components/base-component/base-component';
import { Component, effect, inject } from '@angular/core';
import { KeyboardService } from '../../services/keyboard-service';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-full-keyboard',
  imports: [Dialog],
  templateUrl: './full-keyboard.html',
  styleUrl: './full-keyboard.css',
})
export class FullKeyboard extends BaseComponent {
  keyboardService = inject(KeyboardService);

  isVisible = this.keyboardService.isFullKeyboardVisible;
  closeKeyboard = this.keyboardService.closeFullKeyboard;

  /**
   *
   */
  constructor() {
    super();
  }
}
