import { Component } from '@angular/core';
import { CollectiveReceiptsNav } from "../../components/collective-receipts-nav/collective-receipts-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CollectiveReceiptForm } from "../../components/collective-receipt-form/collective-receipt-form";

@Component({
  selector: 'app-edit-collective-receipt',
  imports: [CollectiveReceiptsNav, SectionWrapper, CollectiveReceiptForm],
  templateUrl: './edit-collective-receipt.html',
  styleUrl: './edit-collective-receipt.css',
})
export class EditCollectiveReceipt {

}
