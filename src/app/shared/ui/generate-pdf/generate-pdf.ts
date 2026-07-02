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
generateFromComponent(component: any,win?:any) {
  const iframe = this.pdfFrame.nativeElement;
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write('<html><head></head><body></body></html>');
  doc.close();
  const host = doc.createElement('div');
  doc.body.appendChild(host);
  const cmpRef = this.container.createComponent(component);
  requestAnimationFrame(() => {
    const element = cmpRef.location.nativeElement as HTMLElement;
    host.appendChild(element);
    this.generatePDF(element).then(() => {
      cmpRef.destroy();
    });
  });
}

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
    });
}

}
