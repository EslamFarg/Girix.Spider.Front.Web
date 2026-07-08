import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import { environment } from '../../../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Purchase extends BasehttpService {

  // /api/Purchase
   constructor() {
    super('',{
      'create':'api/Purchase',
      'update':'api/Purchase',
      'getAll':'api/Purchase',
      'getById':'api/Purchase/GetById',
      'delete':'api/Purchase',
      'search':'api/Purchase/Search'
    });
  }


  getAllAccountsCash(){
    return this.http.get(environment.baseUrl + '/api/Purchase/CashAccounts');
  }

  getAllNetAccounts(){
    return this.http.get(environment.baseUrl + '/api/Purchase/NetAccounts');
  }

  searchByProductName(PageIndex:number,PageSize:number,productName:string){
    return this.http.get(environment.baseUrl + `/api/Purchase/SearchProductByName?PaginationInfo.PageIndex=${PageIndex}&PaginationInfo.PageSize=${PageSize}&ProductName=${productName}`);
  }

  getProductCartByProductId(id:number){
    return this.http.get(environment.baseUrl + '/api/Purchase/GetProductCartByProductId/'+id);
  }


  getUnitById(id:number){
    return this.http.get(environment.baseUrl + '/api/Unit/'+id,{
      headers: {
        'skip-loading': 'true'
      }
    });
  }



  searchByCode(code:any){
    return this.http.get(environment.baseUrl + '/api/Purchase/SearchProductCartByBarCode?request='+code);
  }
  }