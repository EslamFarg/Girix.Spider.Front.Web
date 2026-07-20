import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/Users/Create',
      update: 'api/Users/Update',
      delete: 'api/Users/Delete',
      getAll: 'api/Users/GetAll',
      getById: 'api/Users/GetById',
      search: 'api/Users/Search',
    });
  }
}
