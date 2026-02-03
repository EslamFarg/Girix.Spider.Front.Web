import { Component, input } from '@angular/core';
import { DeliveryManForm } from '../../components/delivery-man-form/delivery-man-form';
import { DeliveriesNav } from '../../components/deliveries-nav/deliveries-nav';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-edit-delivery-man',
  imports: [DeliveryManForm, DeliveriesNav, SectionWrapper],
  templateUrl: './edit-delivery-man.html',
  styleUrl: './edit-delivery-man.css',
})
export class EditDeliveryMan extends BaseComponent {
  id = input.required<number>();
}
