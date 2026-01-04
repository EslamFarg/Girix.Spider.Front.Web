import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { IOrderRowResponse, OrderSearchEnum, OrderService } from '../../services/order-service';
import { DatePipe } from '@angular/common';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-orders',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    SectionWrapper,
    DatePipe,
    Menu,
    Button,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders extends BaseComponent<IOrderRowResponse> {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  orderService = inject(OrderService);
  filterMenuItems: MenuItem[] = [
    {
      label: 'اسم العميل',
      command: (event) => (this.orderService.searchRequestModel.orderSearchEnum = OrderSearchEnum.CustomerName),
    },
    {
      label: 'رقم الطلب',
      command: (event) => (this.orderService.searchRequestModel.orderSearchEnum = OrderSearchEnum.OrderNumber),
    },
    {
      label: 'موقع الطلب',
      command: (event) => (this.orderService.searchRequestModel.orderSearchEnum = OrderSearchEnum.OrderPlace),
    },
    {
      label: 'نوع الطلب',
      command: (event) => (this.orderService.searchRequestModel.orderSearchEnum = OrderSearchEnum.OrderType),
    },
  ];
  constructor() {
    super();

    this.orderService.resetSearchRequestModel();

    //get page 1 of 10 orders
    this.orderService.search().subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  onSubmit() {
    if (this.fg.valid) {
      this.orderService
        .search(
          {
            pageIndex: 1,
          },
          undefined,
          [this.fg.getRawValue().text]
        )
        .subscribe({
          next: (res) => {
            this.items.set(res.value.rows);
          },
        });
    }
  }

  first = 0;
  rows = 10;
  onPageChange(event: PaginatorState) {
    console.log(event);
    this.orderService.search({ pageIndex: event.page! + 1 }).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }
}
