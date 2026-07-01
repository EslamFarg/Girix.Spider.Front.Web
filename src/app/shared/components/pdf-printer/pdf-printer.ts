// import { Component, input } from '@angular/core';
// // import * as pdfMake from 'pdfmake/build/pdfmake';
// // import * as pdfFonts from 'pdfmake/build/vfs_fonts';


// // 1. الاستيراد بالطريقة المتوافقة مع الـ Bundlers الحديثة
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// const ArabicReshaper = require('arabic-persian-reshaper') as any;
// // 2. ربط الخطوط بـ pdfMake بالشكل الصحيح
// // (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
// const fontsModule = pdfFonts as { pdfMake: { vfs: any } } | any;
// (pdfMake as any).vfs = fontsModule['pdfMake'] ? fontsModule['pdfMake'].vfs : fontsModule.vfs;
// // (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

// (pdfMake as any).fonts = {
//   Roboto: {
//     normal: 'Roboto-Regular.ttf',
//     bold: 'Roboto-Medium.ttf'
//   },
//   // إضافة خط عربي (هنا نستخدم خط تجريبي أو يمكنك رفع الخط الخاص بك)
//  Cairo: {
//     // استخدام الـ Origin الخاص بالمتصفح لضمان تحميل الملف عبر HTTP بنجاح من مجلد public
//     normal: `${window.location.origin}/fonts/Cairo-Regular.ttf`,
//     bold: `${window.location.origin}/fonts/Cairo-Bold.ttf`
//   }
// };
// @Component({
//   selector: 'app-pdf-printer',
//   standalone: true,
//   imports: [],
//   template: '', // المكون ده معندوش واجهة HTML لأنه بيشتغل برمجياً فقط عند الاستدعاء
// })
// export class PdfPrinterComponent {
  
//   // الـ Inputs اللي المكون هيستقبلها من أي صفحة
//   title = input<string>('تقرير');
//   headers = input<string[]>([]); // عناوين الجدول مثل: ['كود المندوب', 'الاسم']
//   keys = input<string[]>([]);    // مفاتيح البيانات المقابلة للفورم مثل: ['code', 'name']
//   data = input<any>({});         // قيم الـ Form الحالية

//   // الدالة الرئيسية للطباعة الفورية
//   public print() {
//     const formValues = this.data();
//     const tableBody: any[] = [];

//     // بناء صفوف الجدول ديناميكياً بناءً على الـ headers والـ keys المبعوثة
//     this.headers().forEach((header, index) => {
//       const key = this.keys()[index];
//       let value = formValues[key] || 'غير محدد';

//       // معالجة خاصة بنوع العمولات لو المفتاح هو commissionType
//       if (key === 'commissionType') {
//         value = value === 1 ? 'قيمة الأرباح' : 'قيمة المبيعات';
//       }

//       // إضافة الصف للجدول (البيانات على اليمين، والعنوان على اليسار)
//       tableBody.push([
//         { text: value.toString(), alignment: 'right', style: 'cellValue' },
//         { text: header, style: 'cellLabel' }
//       ]);
//     });

//     const docDefinition: any = {
//       content: [
//         { text: this.title(), style: 'mainHeader' },
//         { text: `تاريخ المستند: ${new Date().toLocaleDateString('ar-EG')}`, alignment: 'left', fontSize: 10, color: '#666666' },
//         { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, lineColor: '#1791c8' }] },
//         { text: '', margin: [0, 15] },

//         {
//           style: 'dataTable',
//           table: {
//             widths: ['*', 130],
//             body: tableBody // الجدول الديناميكي هنا
//           },
//           textDirection: 'rtl',
//           layout: {
//             hLineWidth: () => 1,
//             vLineWidth: () => 1,
//             hLineColor: () => '#e2e8f0',
//             vLineColor: () => '#e2e8f0',
//             paddingTop: () => 12,
//             paddingBottom: () => 12,
//             paddingLeft: () => 12,
//             paddingRight: () => 12
//           }
//         },
//         { text: '', margin: [0, 30] },
//         { text: 'التوقيع المعتمد: ............................', alignment: 'right', fontSize: 11, color: '#4a5568' }
//       ],
//       defaultStyle: {
//     font: 'Cairo',
//     alignment: 'right'
//   },
//       styles: {
//         mainHeader: { fontSize: 20, bold: true, color: '#1791c8', alignment: 'right', margin: [0, 0, 0, 5] },
//         cellLabel: { fontSize: 11, bold: true, color: '#2d3748', fillColor: '#f8fafc', alignment: 'right' },
//         cellValue: { fontSize: 11, color: '#4a5568', alignment: 'left' },
//       },
//       pageOrientation: 'portrait',
//       pageSize: 'A4'
//     };

//     // pdfMake.createPdf(docDefinition).print({}, window);
//     pdfMake.createPdf(docDefinition).print();
//   }
// }

// import { Component, input } from '@angular/core';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';

// // ✨ الحل القاضي: استيراد المكتبة كـ any مباشرة لإسكات TypeScript تماماً مع الحفاظ على توافق Vite
// // @ts-ignore
// import ArabicReshaper from 'arabic-persian-reshaper';

// const fontsModule = pdfFonts as any;
// (pdfMake as any).vfs = fontsModule['pdfMake'] ? fontsModule['pdfMake'].vfs : fontsModule.vfs;

// (pdfMake as any).fonts = {
//   Roboto: { normal: 'Roboto-Regular.ttf', bold: 'Roboto-Medium.ttf' },
//   Cairo: {
//     normal: `${window.location.origin}/fonts/Cairo-Regular.ttf`,
//     bold: `${window.location.origin}/fonts/Cairo-Bold.ttf`
//   }
// };

// @Component({
//   selector: 'app-pdf-printer',
//   standalone: true,
//   imports: [],
//   template: '',
// })
// export class PdfPrinterComponent {
  
//   title = input<string>('تقرير');
//   headers = input<string[]>([]); 
//   keys = input<string[]>([]);    
//   data = input<any>({});         

//   private fixArabicText(text: string): string {
//     if (!text) return '';
    
//     // تأمين الاستدعاء من الـ default export الخاص بـ Vite
//     const reshaper = (ArabicReshaper as any).default || (ArabicReshaper as any);
//     const reshaped = reshaper.reshape(text);
    
//     return reshaped.split('').reverse().join('');
//   }

//   public print() {
//     const formValues = this.data();
//     const tableBody: any[] = [];

//     this.headers().forEach((header, index) => {
//       const key = this.keys()[index];
//       let value = formValues[key] || 'غير محدد';

//       if (key === 'commissionType') {
//         value = value === 1 ? 'قيمة الأرباح' : 'قيمة المبيعات';
//       }

//       tableBody.push([
//         { text: this.fixArabicText(value.toString()), style: 'cellValue' },
//         { text: this.fixArabicText(header), style: 'cellLabel' }
//       ]);
//     });

//     const docDefinition: any = {
//       content: [
//         { text: this.fixArabicText(this.title()), style: 'mainHeader' },
//         { text: this.fixArabicText(`تاريخ المستند: ${new Date().toLocaleDateString('ar-EG')}`), alignment: 'left', fontSize: 10, color: '#666666' },
//         { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, lineColor: '#1791c8' }] },
//         { text: '', margin: [0, 15] },
//         {
//           style: 'dataTable',
//           table: {
//             widths: ['*', 130], 
//             body: tableBody 
//           },
//           layout: {
//             hLineWidth: () => 1,
//             vLineWidth: () => 1,
//             hLineColor: () => '#e2e8f0',
//             vLineColor: () => '#e2e8f0',
//             paddingTop: () => 12,
//             paddingBottom: () => 12,
//             paddingLeft: () => 12,
//             paddingRight: () => 12
//           }
//         },
//         { text: '', margin: [0, 30] },
//         { text: this.fixArabicText('التوقيع المعتمد: ............................'), alignment: 'right', fontSize: 11, color: '#4a5568' }
//       ],
//       defaultStyle: { font: 'Cairo', alignment: 'right' },
//       styles: {
//         mainHeader: { fontSize: 20, bold: true, color: '#1791c8', margin: [0, 0, 0, 5] },
//         cellLabel: { fontSize: 11, bold: true, color: '#2d3748', fillColor: '#f8fafc', alignment: 'right' },
//         cellValue: { fontSize: 11, color: '#4a5568', alignment: 'right' }
//       },
//       pageOrientation: 'portrait',
//       pageSize: 'A4'
//     };

//     pdfMake.createPdf(docDefinition).print();
//   }
// }

import { Component, input } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const fontsModule = pdfFonts as any;
(pdfMake as any).vfs = fontsModule['pdfMake'] ? fontsModule['pdfMake'].vfs : fontsModule.vfs;

(pdfMake as any).fonts = {
  Roboto: { normal: 'Roboto-Regular.ttf', bold: 'Roboto-Medium.ttf' },
  Cairo: {
    normal: `${window.location.origin}/fonts/Cairo-Regular.ttf`,
    bold: `${window.location.origin}/fonts/Cairo-Bold.ttf`
  }
};

@Component({
  selector: 'app-pdf-printer',
  standalone: true,
  imports: [],
  template: '',
})
export class PdfPrinterComponent {
  
  title = input<string>('تقرير');
  headers = input<string[]>([]); 
  keys = input<string[]>([]);    
  data = input<any>({});         

  public print() {
    const formValues = this.data();
    const tableBody: any[] = [];

    this.headers().forEach((header, index) => {
      const key = this.keys()[index];
      let value = formValues[key] || 'غير محدد';

      if (key === 'commissionType') {
        value = value === 1 ? 'قيمة الأرباح' : 'قيمة المبيعات';
      }

      // ✨ التعديل الأول: وضعنا القيمة (Value) كعنصر أول لتظهر على اليمين، والهيدر كعنصر ثاني لتظهر على اليسار
      tableBody.push([
        { text: value.toString(), style: 'cellValue' },
        { text: header, style: 'cellLabel' }
      ]);
    });

    const docDefinition: any = {
      textDirection: 'rtl', // الاتجاه العام عربي سليم
      
      content: [
        { text: this.title(), style: 'mainHeader' },
        { text: ` ${new Date().toLocaleDateString('ar-EG')}   المستند تاريخ`, alignment: 'left', fontSize: 10, color: '#666666' },
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, lineColor: '#1791c8' }] },
        { text: '', margin: [0, 15] },
        {
          style: 'dataTable',
          table: {
            // ✨ التعديل الثاني: عكسنا المقاسات لتتوافق مع الترتيب الجديد
            // العمود الأول (اليمين - القيمة) يأخذ المساحة المرنة '*'
            // العمود الثاني (اليسار - العنوان) يأخذ المساحة الثابتة 130
            widths: ['*', 130], 
            body: tableBody 
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#e2e8f0',
            vLineColor: () => '#e2e8f0',
            paddingTop: () => 12,
            paddingBottom: () => 12,
            paddingLeft: () => 12,
            paddingRight: () => 12
          }
        },
        { text: '', margin: [0, 30] },
        { text: ' ............................ : المعتمد  التوقيع ', alignment: 'right', fontSize: 11, color: '#4a5568' }
      ],
      defaultStyle: { 
        font: 'Cairo', 
        alignment: 'right' 
      },
      styles: {
        mainHeader: { fontSize: 20, bold: true, color: '#1791c8', margin: [0, 0, 0, 5] },
        // ضبط محاذاة العناوين لتلتصق باليمين داخل مربعها الرمادي على اليسار
        cellLabel: { fontSize: 11, bold: true, color: '#2d3748', fillColor: '#f8fafc', alignment: 'right' },
        // ضبط محاذاة القيم لتظهر متناسقة ومحاذية لليمين في العمود الأيمن
        cellValue: { fontSize: 11, color: '#4a5568', alignment: 'right' } 
      },
      pageOrientation: 'portrait',
      pageSize: 'A4'
    };

    pdfMake.createPdf(docDefinition).print();
  }
}