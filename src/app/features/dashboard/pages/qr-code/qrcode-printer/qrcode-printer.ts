import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
// import { QRCodeComponent } from 'primeng/qrcode';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qrcode-printer',
  imports: [RouterOutlet, QRCodeComponent],
  templateUrl: './qrcode-printer.html',
  styleUrl: './qrcode-printer.scss',
})
export class QrcodePrinter {

  
}
