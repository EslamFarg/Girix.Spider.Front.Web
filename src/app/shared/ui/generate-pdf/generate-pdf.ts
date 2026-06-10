import { Component, ElementRef, inject, Input, ViewChild, ViewContainerRef } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { PrintPageAccounts } from '../../../features/dashboard/pages/accounts-parent/accounts/components/print-page-accounts/print-page-accounts';
import { LoadingService } from '../loading/services/loading';
@Component({
  selector: 'app-generate-pdf',
  imports: [],
  templateUrl: './generate-pdf.html',
  styleUrl: './generate-pdf.scss',
})
export class GeneratePdf {

    @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
    @Input() componentType: any;
  @ViewChild('pdfFrame') pdfFrame!: ElementRef<HTMLIFrameElement>;
  _loading:LoadingService=inject(LoadingService);

  
// ngAfterViewInit(): void {

//   // BrowserPrintedOwnerComponent
//   const cmpRef = this.container.createComponent(this.componentType);

//   setTimeout(() => {

//     const element = cmpRef.location.nativeElement as HTMLElement;

//     this.generatePDF(element).then(() => {
//       cmpRef.destroy();
//     });

//   }, 50);

// }
//  generatePDF(element: HTMLElement): Promise<void> {
//   const iframe = this.pdfFrame.nativeElement;

//   const opt: any = {
//     margin: 0.3,
//     filename: 'invoice.pdf',
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { scale: 2 },
//     jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' }
//   };

//   return html2pdf()
//     .from(element)
//     .set(opt)
//     .toPdf()
//     .outputPdf('datauristring')
//     .then((pdfDataUri: string) => {
//       // iframe.src = pdfDataUri;

//         const newWindow = window.open();

//       if (newWindow) {
//         newWindow.document.write(`
//           <html>
//             <head>
//               <title>PDF Preview</title>
//               <style>
//                 body { margin: 0 }
//                 iframe { width: 100%; height: 100vh; border: none; }
//               </style>
//             </head>
//             <body>
//               <iframe src="${pdfDataUri}"></iframe>
//             </body>
//           </html>
//         `);
//       }
//     });
//  }

// generateFromComponent(component: any) {

//   const cmpRef = this.container.createComponent(component);

//   requestAnimationFrame(() => {
//     const element = cmpRef.location.nativeElement as HTMLElement;

//     this.generatePDF(element).then(() => {
//       cmpRef.destroy();
//     });
//   });
// }

// generateFromComponent(component: any, win?: Window) {

//   const cmpRef = this.container.createComponent(component);

//   requestAnimationFrame(() => {
//     const element = cmpRef.location.nativeElement as HTMLElement;

//     this.generatePDF(element, win).then(() => {
//       cmpRef.destroy();
//     });
//   });
// }

generateFromComponent(component: any,win?:any) {

  const iframe = this.pdfFrame.nativeElement;
  const doc = iframe.contentDocument || iframe.contentWindow?.document;

  if (!doc) return;

  // نفضي iframe
  doc.open();
  doc.write('<html><head></head><body></body></html>');
  doc.close();

  // نعمل host element جواه
  const host = doc.createElement('div');
  doc.body.appendChild(host);

  // نخلق component لكن نحطه جوه iframe
  const cmpRef = this.container.createComponent(component);

  requestAnimationFrame(() => {

    const element = cmpRef.location.nativeElement as HTMLElement;

    // ننقل العنصر جوه iframe
    host.appendChild(element);

    this.generatePDF(element).then(() => {
      cmpRef.destroy();
    });

  });
}



// generatePDF(element: HTMLElement, win?: Window): Promise<void> {

//   const opt:any = {
//     margin: 0.3,
//     html2canvas: { scale: 2 },
//     jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' }
//   };

//   return html2pdf()
//     .from(element)
//     .set(opt)
//     .toPdf()
//     .get('pdf')
//     .then((pdf: any) => {

//       const blob = pdf.output('blob');
//       const url = URL.createObjectURL(blob);

//       if (win) {
//         win.location.href = url; // 👈 هنا السحر
//       } else {
//         window.open(url, '_blank');
//       }
//     });
// }
// generatePDF(element: HTMLElement): Promise<void> {
//   const opt:any = {
//     margin: 0.3,
//     html2canvas: { scale: 2 },
//     jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' }
//   };

//   return html2pdf()
//     .from(element)
//     .set(opt)
//     .toPdf()
//     .get('pdf')
//     .then((pdf: any) => {
//       const blob = pdf.output('blob');
//       const url = URL.createObjectURL(blob);

//       window.open(url, '_blank');
//     });
// }

generatePDF(element: HTMLElement, win?: Window): Promise<void> {

  const opt:any = {
    margin: 0.3,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' }
  };


  
  return html2pdf()
    .from(element)
    .set(opt)
    .toPdf()
    .get('pdf')
    .then((pdf: any) => {

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);


      window.open(url, '_blank');
      this._loading.hide();
      

      // if (win) {
      //   // 👇 replace loading بـ PDF
      //   win.location.href = url;
      // } else {
      //   window.open(url, '_blank');
      // }
    });
}

}
