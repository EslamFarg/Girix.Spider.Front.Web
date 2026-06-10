import { Component } from '@angular/core';
import { PageHeader } from "../../../../../shared/ui/page-header/page-header";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-outgoing-transfer',
  imports: [PageHeader,RouterOutlet],
  templateUrl: './outgoing-transfer.html',
  styleUrl: './outgoing-transfer.scss',
})
export class OutgoingTransfer {}
