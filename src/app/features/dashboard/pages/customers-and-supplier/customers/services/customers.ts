import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class Customers extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/Customer/Create',
      update: 'api/Customer/Update',
      delete: 'api/Customer/delete',
      getAll: 'api/Customer/GetAll',
      getById: 'api/Customer/GetById',
      search: 'api/Customer/Search',
    });
  }
}
