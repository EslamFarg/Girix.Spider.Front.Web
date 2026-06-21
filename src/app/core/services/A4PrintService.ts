import { Injectable } from '@angular/core';

/**
 * A4 Print Engine â€” accounting documents only.
 *
 * Opens a new window containing the supplied HTML, waits for render,
 * then triggers the OS/browser native print dialog (supports any
 * installed printer including "Microsoft Print to PDF").
 *
 * Usage:
 *   inject(A4PrintService).print(html)
 *
 * The caller is responsible for supplying a complete, self-contained
 * HTML body fragment. All styles must be inline or in a <style> block
 * embedded in the fragment (no external stylesheets).
 */
@Injectable({ providedIn: 'root' })
export class A4PrintService {

  /** Open a new window, write the A4 document, and trigger print dialog */
  print(bodyFragment: string): void {
    const win = window.open('', '_blank', 'width=850,height=1200,scrollbars=yes,resizable=yes');
    if (!win) {
      alert('لم يتمكن المتصفح من فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
      return;
    }

    win.document.open();
    win.document.write(this.buildFullDocument(bodyFragment));
    win.document.close();
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Private helpers
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private buildFullDocument(bodyFragment: string): string {
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>طباعة</title>
  <style>
    /* â”€â”€ Reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* â”€â”€ Base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    html, body {
      font-family: 'Arial', 'Tahoma', 'Segoe UI', sans-serif;
      font-size: 10pt;
      color: #000;
      background: #fff;
      direction: rtl;
    }

    /* â”€â”€ Screen preview wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    @media screen {
      body { background: #e8e8e8; padding: 20px; }
      .a4-page {
        background: #fff;
        width: 794px;
        min-height: 1123px;
        margin: 0 auto;
        padding: 15mm;
        box-shadow: 0 2px 16px rgba(0,0,0,.25);
      }
      .print-actions {
        width: 794px;
        margin: 0 auto 12px;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .btn-print {
        background: #375652;
        color: #fff;
        border: none;
        padding: 8px 24px;
        border-radius: 6px;
        font-size: 11pt;
        cursor: pointer;
        font-family: inherit;
      }
      .btn-print:hover { background: #333; }
    }

    /* â”€â”€ Print page setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    @page {
      size: A4 portrait;
      margin: 15mm;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .a4-page { box-shadow: none; width: 100%; padding: 0; min-height: unset; }
      .print-actions { display: none !important; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      tr    { page-break-inside: avoid; }
    }

    /* â”€â”€ Document header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px double #000;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .doc-logo {
      width: 70px;
      height: 70px;
      border: 2px solid #ccc;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28pt;
      color: #888;
    }
    .doc-company { text-align: center; flex: 1; }
    .doc-company-name  { font-size: 16pt; font-weight: bold; }
    .doc-company-sub   { font-size: 9pt;  color: #555;  margin-top: 2px; }
    .doc-title-box {
      border: 2px solid #375652;
      padding: 6px 20px;
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      color: #375652;
      border-radius: 4px;
      min-width: 140px;
    }

    /* â”€â”€ Meta fields grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: #fafafa;
    }
    .meta-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
    .meta-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
    .meta-field { display: flex; gap: 4px; align-items: baseline; }
    .meta-label { font-weight: bold; font-size: 9pt; white-space: nowrap; color: #333; }
    .meta-value { font-size: 9pt; border-bottom: 1px dotted #999; flex: 1; min-width: 0; padding-bottom: 1px; }

    /* â”€â”€ Statement banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .statement-banner {
      border: 1px solid #375652;
      background: #f0f4ff;
      padding: 8px 14px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-size: 10pt;
    }
    .statement-banner .amount-words {
      font-size: 11pt;
      font-weight: bold;
      color: #1a1a2e;
    }

    /* â”€â”€ Lines table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .lines-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      font-size: 9pt;
    }
    .lines-table thead tr th {
      background: #375652;
      color: #fff;
      font-size: 9pt;
      font-weight: bold;
      padding: 6px 8px;
      text-align: center;
      border: 1px solid #375652;
    }
    .lines-table tbody tr td {
      border: 1px solid #bbb;
      padding: 5px 8px;
      text-align: right;
      vertical-align: middle;
    }
    .lines-table tbody tr:nth-child(even) td { background: #f8f8f8; }
    .lines-table tfoot tr td {
      border: 1px solid #888;
      padding: 5px 8px;
      font-weight: bold;
      background: #f0f0f0;
    }
    .num { text-align: center !important; font-variant-numeric: tabular-nums; }
    .bold { font-weight: bold; }

    /* â”€â”€ Totals summary row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .totals-box {
      border: 1px solid #375652;
      border-radius: 4px;
      padding: 8px 14px;
      margin-bottom: 14px;
      background: #f9f9f9;
      display: flex;
      justify-content: flex-end;
      gap: 32px;
    }
    .total-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .total-label { font-size: 8pt; color: #555; }
    .total-value { font-size: 13pt; font-weight: bold; color: #1a1a2e; }
    .balance-ok  { color: #16a34a; font-size: 8pt; font-weight: bold; }
    .balance-err { color: #dc2626; font-size: 8pt; font-weight: bold; }

    /* â”€â”€ Signature footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .sig-footer {
      margin-top: 36px;
      border-top: 1px solid #888;
      padding-top: 12px;
    }
    .sig-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .sig-box {
      flex: 1;
      text-align: center;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px 6px 6px;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sig-title { font-size: 9pt; font-weight: bold; color: #333; }
    .sig-line  { border-top: 1px solid #555; margin: 0 8px; margin-top: 28px; }
    .sig-name  { font-size: 8pt; color: #777; }

    /* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .mb-2  { margin-bottom: 8px; }
    .mb-4  { margin-bottom: 16px; }
    .mt-2  { margin-top: 8px; }
    .mt-4  { margin-top: 16px; }
    .text-center { text-align: center; }
    .text-sm     { font-size: 8pt; }
  </style>
</head>
<body>

  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">ðŸ–¨ï¸ طباعة</button>
    <button class="btn-print" style="background:#555" onclick="window.close()">âœ• إغلاق</button>
  </div>

  <div class="a4-page">
    ${bodyFragment}
  </div>

  <script>
    window.addEventListener('load', function () {
      setTimeout(function () {
        window.print();
        window.addEventListener('afterprint', function () { window.close(); });
      }, 400);
    });
  </script>

</body>
</html>`;
  }
}
