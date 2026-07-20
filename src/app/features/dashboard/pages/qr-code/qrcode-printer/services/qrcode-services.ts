import { inject, Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import { environment } from '../../../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class QrcodeServices{
  http = inject(HttpClient);


  searchByCodeOrBarcode(request: string) {
    return this.http.get(
      `${environment.baseUrl}/api/Purchase/SearchProductCartByBarCode?request=${encodeURIComponent(request)}`,
    );
  }

  searchByProductName(pageIndex: number, pageSize: number, productName: string) {
    return this.http.get(
      `${environment.baseUrl}/api/Purchase/SearchProductByName?PaginationInfo.PageIndex=${pageIndex}&PaginationInfo.PageSize=${pageSize}&ProductName=${encodeURIComponent(productName)}`,
    );
  }

  getProductCartByProductId(id: number) {
    return this.http.get(`${environment.baseUrl}/api/Purchase/GetProductCartByProductId/${id}`);
  }


  generateQrCode(data: any){
    return this.http.post(`${environment.baseUrl}/api/BarcodePrinting/GenerateQr`, data);
  }
}
