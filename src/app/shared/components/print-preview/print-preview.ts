import { ChangeDetectorRef, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dialog } from "primeng/dialog";
@Component({
  selector: 'app-print-preview',
  imports: [Dialog,FormsModule],
  templateUrl: './print-preview.html',
  styleUrl: './print-preview.scss',
})
export class PrintPreview {

  @Input() target!: HTMLElement
  isExportingPdf = false;
isExportingImage = false;
private cdr = inject(ChangeDetectorRef);

// Print Dialog
visiblePrintDialog = false;

printCopies = 1;

paperSize = 'A4';

orientation: 'portrait' | 'landscape' = 'portrait';
  
isPrinting = false;

//   async print(copies: number = 1) {

//     const canvas = await html2canvas(this.target);

//     const img = canvas.toDataURL('image/png');

//     const win = window.open('', '_blank');

//     if (!win) return;

//     let images = '';

//     for (let i = 0; i < copies; i++) {

//         images += `
//             <img src="${img}" class="page">

//             ${i < copies - 1 ? '<div class="page-break"></div>' : ''}
//         `;
//     }

//     win.document.write(`
//         <html>

//         <head>

//         <style>

//         body{
//             margin:0;
//             text-align:center;
//         }

//         .page{
//             width:100%;
//         }

//         .page-break{
//             page-break-after:always;
//         }

//         </style>

//         </head>

//         <body>

//         ${images}

//         </body>

//         </html>
//     `);

//     win.document.close();

//     win.onload = () => {
//         win.print();
//         win.close();
//     };

//     this.visiblePrintDialog = false;
// }


  // async print() {
  //   const canvas = await html2canvas(this.target, {
  //     scale: 3
  //   });
  
  //   const img = canvas.toDataURL('image/png');
  
  //   const win = window.open('', '_blank');
  //   if (!win) return;
  
  //   win.document.write(`
  //   <html>
  //   <head>
  //       <style>
  //           body{
  //               margin:0;
  //               display:flex;
  //               justify-content:center;
  //               align-items:center;
  //           }
  
  //           img{
  //               width:100%;
  //           }
  //       </style>
  //   </head>
  //   <body>
  //       <img src="${img}">
  //   </body>
  //   </html>
  //   `);
  
  //   win.document.close();
  
  //   win.onload = () => {
  //       win.print();
  //       win.close();
  //   };
  // }

  async print(copies: number = 1) {
    // debugger;
    this.isPrinting = true;
  
    try {
  
      const canvas = await html2canvas(this.target, {
        scale: 2
      });
  
      const img = canvas.toDataURL('image/png');
  
      const win = window.open('', '_blank');
  
      if (!win) {
        this.isPrinting = false;
        return;
      }
  
      let html = '';
  
      for (let i = 0; i < copies; i++) {
        html += `
          <img src="${img}" style="width:100%">
          ${i < copies - 1 ? '<div style="page-break-after:always"></div>' : ''}
        `;
      }
  
      win.document.write(`
        <html>
        <head>
          <style>
            body{
              margin:0;
              text-align:center;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `);
  
      win.document.close();
  
      win.onload = () => {
        this.isPrinting = false;
        this.visiblePrintDialog = false;
        this.cdr.detectChanges();
  
        win.focus();
        win.print();
        win.close();
      };
  
    } catch (e) {
      this.isPrinting = false;
      this.cdr.detectChanges();
      console.error(e);
    }
  }

  async exportImage() {

    const canvas =
        await html2canvas(
            this.target
        );

    const link =
        document.createElement('a');

    link.download = 'barcode.png';

    link.href =
        canvas.toDataURL('image/png');

    link.click();

}

//   async exportPdf() {

//     const canvas = await html2canvas(this.target);

// const img = canvas.toDataURL('image/png');

// const pdf = new jsPDF({
//     unit: 'px',
//     format: [canvas.width, canvas.height]
// });

// pdf.addImage(
//     img,
//     'PNG',
//     0,
//     0,
//     canvas.width,
//     canvas.height
// );

// pdf.save('barcode.pdf');

//   }


// async exportPdf() {
//   if (this.isExportingPdf) return;

//   this.isExportingPdf = true;

//   try {
//     const canvas = await html2canvas(this.target, {
//       scale: 2
//     });

//     const img = canvas.toDataURL('image/png');

//     const pdf = new jsPDF({
//       unit: 'px',
//       format: [canvas.width, canvas.height]
//     });

//     pdf.addImage(
//       img,
//       'PNG',
//       0,
//       0,
//       canvas.width,
//       canvas.height
//     );

//     pdf.save('barcode.pdf');

//   } finally {
//     this.isExportingPdf = false;
//   }
// }

// async exportPdf() {
//   this.isExportingPdf = true;

//   await new Promise(resolve => setTimeout(resolve, 3000));

//   const canvas = await html2canvas(this.target);

//   const img = canvas.toDataURL('image/png');

//   const pdf = new jsPDF({
//     unit: 'px',
//     format: [canvas.width, canvas.height]
//   });

//   pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);

//   pdf.save('barcode.pdf');

//   this.isExportingPdf = false;
// }


// async exportPdf() {
//   this.isExportingPdf = true;

//   try {
//     const canvas = await html2canvas(this.target);

//     const img = canvas.toDataURL('image/png');

//     const pdf = new jsPDF({
//       unit: 'px',
//       format: [canvas.width, canvas.height]
//     });

//     pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);

//     pdf.save('barcode.pdf');

//     // اسمح للمتصفح ينهي عملية الـ save ويحدث الواجهة
//     setTimeout(() => {
//       this.isExportingPdf = false;
//     }, 100);
//     this.cdr.detectChanges();

//   } catch (error) {
//     console.error(error);
//     this.isExportingPdf = false;
//   }
// }

async exportPdf() {
  this.isExportingPdf = true;

  console.log('Start');

  try {
    console.log('Before html2canvas');

    const canvas = await html2canvas(this.target);

    console.log('After html2canvas');

    const img = canvas.toDataURL('image/png');

    console.log('After toDataURL');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      // format: [canvas.width, canvas.height]
      // format: "a4"
      format: [400, 300]
    });

    pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);

    console.log('Before save');

    pdf.save('barcode.pdf');

    console.log('After save');

  } catch (e) {
    console.error(e);
  } finally {
    console.log('Finally');

    this.isExportingPdf = false;
    this.cdr.detectChanges();
  }
}

}
