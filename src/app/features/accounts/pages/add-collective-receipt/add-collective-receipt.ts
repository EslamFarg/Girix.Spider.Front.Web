import { Component } from '@angular/core';
import { CollectiveReceiptsNav } from "../../components/collective-receipts-nav/collective-receipts-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CollectiveReceiptForm } from "../../components/collective-receipt-form/collective-receipt-form";

@Component({
  selector: 'app-add-collective-receipt',
  imports: [CollectiveReceiptsNav, SectionWrapper, CollectiveReceiptForm],
  templateUrl: './add-collective-receipt.html',
  styleUrl: './add-collective-receipt.css',
})
export class AddCollectiveReceipt {

}
