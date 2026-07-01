import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class Suppliers extends BasehttpService {

  constructor() { 
      super('', {
      create: 'api/Supplier/Create',
      update: 'api/Supplier/Update',
      delete: 'api/Supplier/delete',
      getAll: 'api/Supplier/GetAll',
      getById: 'api/Supplier/GetById',
      search: 'api/Supplier/Search',
    });
  }
}
