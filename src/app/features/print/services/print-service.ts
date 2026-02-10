import BaseService from '@/core/services/BaseService';
import { IOrderReadItem, IOrderReadResponse } from '@/features/invoices/services/order-service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrintService extends BaseService {
  printOrder(order: IOrderReadResponse) {
    this.loadingService.addLoading();

    const orderItems = order.items.map((e) => {
      const item = this.getOrderItem(e);
      return `
        <tr class="border-b">
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.net}</td>
        </tr>
      `;
    });

    window.electronAPI
      .print(
        `
        <style>
 
          table {
            border-collapse: collapse;
          }
          th,td{
            text-align: start;
            padding: 4px;
          }
          .border-b{
            border-bottom: 1px solid black;
          }
        </style>
        <table dir="rtl" style="width: calc(80mm - 8px);margin: 0 auto">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.join('')}
            <tr class="border-b">
              <td>المجموع</td>
              <td></td>
              <td>${order.totalPriceForItems}</td>
            </tr>
            <tr class="border-b">
              <td>الخصم</td>
              <td></td>
              <td>${order.discountValue}</td>
            </tr>
            <tr class="border-b">
              <td>المحموع بعد الخصم</td>
              <td></td>
              <td>${order.totalTaxForItems - order.discountValue}</td>
            </tr>
            <tr class="border-b">
              <td>الضريبة الانتقائية</td>
              <td></td>
              <td>${order.totalSelectiveTax}</td>
            </tr>
            <tr class="border-b">
              <td>الخدمة</td>
              <td></td>
              <td>${order.serviceFee + order.serviceFeeTax}</td>
            </tr>
            <tr class="border-b">
              <td>الضريبة</td>
              <td></td>
              <td>${order.totalTax}</td>
            </tr>
            <tr class="border-b">
              <td>الاجمالي بالضريبة (الصافي)</td>
              <td></td>
              <td>${order.netOrder}</td>
            </tr>
            <tr class="border-b">
              <td>مدفوع كاش</td>
              <td></td>
              <td>${order.payingCash}</td>
            </tr>
            <tr class="border-b">
              <td>مدفوع شبكة</td>
              <td></td>
              <td>${order.payingNetwork}</td>
            </tr>
          </tbody>
        </table>
        `,
      )
      .then((e) => {
        console.log(e);
      })
      .catch((e) => console.log(e))
      .finally(() => this.loadingService.removeLoading());
  }

  getOrderItem(item: IOrderReadItem) {
    if (item.mealId) {
      return {
        name: item.mealName,
        quantity: item.quantity,
        net: item.totalWithSelectiveTaxAndTaxAfterDiscount,
      };
    } else {
      return {
        name: item.menuItemName,
        quantity: item.quantity,
        net: item.totalWithSelectiveTaxAndTaxAfterDiscount,
      };
    }
  }
}
