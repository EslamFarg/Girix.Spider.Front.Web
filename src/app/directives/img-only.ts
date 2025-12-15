import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appImgOnly]',
})
export class ImgOnly {
  @Input() allowedExtensions: string[] = ['jpg', 'jpeg', 'png'];

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  // @HostListener('input', ['$event'])
  onInput( event: Event) {
    const inputEvent= event as InputEvent;
    //check all files
    //filter out invalid ones
    const files: FileList | null = this.el.nativeElement.files;

    const validFiles = Array.from(files ?? []).filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return this.allowedExtensions.includes(extension ?? '');
    });

    const dataTransfer = new DataTransfer();
    validFiles.forEach((file) => dataTransfer.items.add(file));
    inputEvent.preventDefault();
    this.el.nativeElement.files = dataTransfer.files;
    return


  }
}
