import { Directive, ElementRef, Host, HostListener } from "@angular/core";

@Directive({
    selector: '[appOnlyNumber]'
})

export class onlyNumberDirective {
    constructor(private el:ElementRef) { }


    @HostListener('keypress',['$event'])
    onKeyPress(event:KeyboardEvent){
        const char=String.fromCharCode(event.keyCode);
        if(!/^[0-9]*$/.test(char)){
            event.preventDefault();
        }

    }

    @HostListener('paste', ['$event']) 
    onPaste(event: ClipboardEvent) {
        event.preventDefault();

        const text = event.clipboardData?.getData('text') || '';

          const isValidNumber = /^[0-9]+$/.test(text);

          if (!isValidNumber) {
           return;
          }

          this.el.nativeElement.value=text;
            // مهم عشان Reactive Forms يلتقط التغيير

        this.el.nativeElement.dispatchEvent(new Event('input'));
    }


    @HostListener('input', ['$event'])
  onInput(event: Event) {
    const value = this.el.nativeElement.value;
    const cleaned = value.replace(/[^0-9]/g, '');

    if (value !== cleaned) {
      this.el.nativeElement.value = cleaned;
      this.el.nativeElement.dispatchEvent(new Event('input'));
    }
  }
}