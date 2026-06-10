import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class Customers extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/Customer',
      update: 'api/Customer',
      delete: 'api/Customer',
      getAll: 'api/Customers/Customer',
      getById: 'api/Customers',
      search: 'api/Customer/Search',
    });
  }
}
