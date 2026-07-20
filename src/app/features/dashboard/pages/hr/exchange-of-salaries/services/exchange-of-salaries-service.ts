import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import { environment } from '../../../../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExchangeOfSalariesService{

  constructor(private http:HttpClient){}

  getDepartmentSalaryPostingEmployees(param:any){
    return this.http.get(`${environment.baseUrl}/api/SalaryPayments/GetDepartmentSalaryPostingEmployees?${param.toString()}`,{
      headers: {
        'skip-loading': 'true'
      }
    });
  }

  GetEmployeeSalaryPosting(param:any){
    return this.http.get(`${environment.baseUrl}/api/SalaryPayments/GetSalaryPostingDetailEmployees?${param.toString()}`);
  }


  createSalaryPayment(data:any){
    return this.http.post(`${environment.baseUrl}/api/SalaryPayments`,data);
  }

  updateSalaryPayment(data:any){
    return this.http.put(`${environment.baseUrl}/api/SalaryPayments`,data);
  }
}
