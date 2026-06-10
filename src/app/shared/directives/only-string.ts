import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
    selector: '[appOnlyString]',
    standalone:true
})

export class OnlyStringDirective {




    constructor (private el:ElementRef) { }
 
// @HostListener('paste', ['$event'])
// onPaste(event: ClipboardEvent) {
//   event.preventDefault();

//   const value = event.clipboardData?.getData('text') || '';

//   if (!/^[a-zA-Z\u0600-\u06FF]*$/.test(value)) {
//     event.preventDefault();
//   }

//   this.el.nativeElement.value = value;
//   this.el.nativeElement.dispatchEvent(new Event('input'));
// }

// @HostListener('input', ['$event'])
// onInput(event: Event) {
//   const value = this.el.nativeElement.value;

//   const cleaned = value.replace(/[^a-zA-Z\u0600-\u06FF]/g, '');

//   if (value !== cleaned) {
//     this.el.nativeElement.value = cleaned;
//     this.el.nativeElement.dispatchEvent(new Event('input'));
//   }
// }



@HostListener('paste', ['$event'])
onPaste(event: ClipboardEvent) {
  event.preventDefault();

  const value = event.clipboardData?.getData('text') || '';

  // السماح بالحروف + المسافات
  if (!/^[a-zA-Z\u0600-\u06FF\s]*$/.test(value)) {
    return;
  }

  this.el.nativeElement.value = value;
  this.el.nativeElement.dispatchEvent(new Event('input'));
}

@HostListener('input', ['$event'])
onInput(event: Event) {
  const value = this.el.nativeElement.value;

  // السماح بالحروف + المسافات
  const cleaned = value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '');

  if (value !== cleaned) {
    this.el.nativeElement.value = cleaned;
    this.el.nativeElement.dispatchEvent(new Event('input'));
  }
}
}