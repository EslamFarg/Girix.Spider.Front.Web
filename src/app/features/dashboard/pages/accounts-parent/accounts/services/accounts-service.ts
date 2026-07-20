import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class AccountsService extends BasehttpService{

  constructor() {
    super('',{
    
      "create":"api/ChartOfAccounts/Create",
      'update':'api/ChartOfAccounts/Update',
      'delete':'api/ChartOfAccounts',
      'getAll':'api/ChartOfAccounts/ChartOfAccounts',
      "getById":'api/ChartOfAccounts',
      'search':'api/ChartOfAccounts/Search'

    });
  }


  getAllParents(pageIndex:string,pageSize:string){
    return this.http.get(`${this.baseUrl}/api/ChartOfAccounts/parents?Pagination.PageIndex=${pageIndex}&Pagination.PageSize=${pageSize}`);
  }

  generateCode(code:string | null | undefined){
    return this.http.get(`${this.baseUrl}/api/ChartOfAccounts/generate-code?code=${code}`);
  }

  getAccountsByMethod(method: number, pageIndex?: number, pageSize?: number) {
    let url = `${this.baseUrl}/api/ChartOfAccounts/account-Code?Method=${method}`;

    if (pageIndex != null && pageSize != null) {
      url += `&Pagination.PageIndex=${pageIndex}&Pagination.PageSize=${pageSize}`;
    }

    return this.http.get(url, {
      headers: { 'skip-loading': 'true' },
    });
  }
}
