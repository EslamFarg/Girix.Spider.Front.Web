import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService extends BasehttpService {

   constructor() {
    super('',{
      'create':'api/Employee',
      'update':'api/Employee',
      'getAll':'api/Employee',
      'getById':'api/Employee',
      'delete':'api/Employee',
      'search':'api/Employee'
    });
  }

}
