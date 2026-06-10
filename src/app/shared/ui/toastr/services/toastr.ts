import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastrServices {
  
     message = '';
  type: 'success' | 'error' = 'success';
  isVisible = false;

  show(message: string, type: 'success' | 'error' = 'success') {
    this.message = message;
    this.type = type;
    this.isVisible = true;

    setTimeout(() => {
      this.isVisible = false;
    }, 3000); // اختفاء بعد 3 ثواني
  }
}
