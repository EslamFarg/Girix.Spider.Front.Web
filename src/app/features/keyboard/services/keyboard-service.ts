import { Injectable, signal } from '@angular/core';
import Keyboard from 'simple-keyboard';

@Injectable({
  providedIn: 'root',
})
export class KeyboardService {
  //
  //
  //
  //
  //
  //
  //numbers
  //

  isNumbersKeyboardVisible = signal(false);

  openNumbersKeyboard() {
    this.isNumbersKeyboardVisible.set(true);
  }
  closeNumbersKeyboard() {
    this.isNumbersKeyboardVisible.set(false);
  }

  //
  //
  //
  //
  //
  //
  //
  //full
  //

  isFullKeyboardVisible = signal(false);

  openFullKeyboard() {
    this.isFullKeyboardVisible.set(true);
  }

  closeFullKeyboard=()=> {
    this.isFullKeyboardVisible.set(false);
    this.keyboard?.destroy();
    console.log('keyboard destroyed');
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  currentInput: HTMLInputElement | null = null;
  keyboard: Keyboard | null = null;


  triggerKeyboard(inputSelector: string, selectorClass: string) {
    this.keyboard?.destroy();

    const input = document.querySelector<HTMLInputElement>(inputSelector);
    if (!input) {
      return;
    }
    console.log('init keyboard');
    this.currentInput = input;
    input.focus();
    this.keyboard = new Keyboard(selectorClass, {
      onChange: (input) => {
        if (this.currentInput) {
          this.currentInput.value = input;
        }
      },
      onKeyPress: (button) => {
        console.log('Button pressed', button);
      },
    });

    
    
    this.openFullKeyboard();
    input.addEventListener('blur', () => {
      // if(this.keyboard?.keyboardDOM)
    });
  }

  // dispatchKeyboardEvent(event: KeyboardEvent) {
  //   if (this.currentInput) {
  //     this.currentInput.dispatchEvent(event);
  //   }
  // }
}
