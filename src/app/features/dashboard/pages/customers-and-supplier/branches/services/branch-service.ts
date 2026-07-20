import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class BranchService extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/Branch/Create',
      update: 'api/Branch/Update',
      delete: 'api/Branch/Delete',
      getAll: 'api/Branch/GetAll',
      getById: 'api/Branch/GetById',
      search: 'api/Branch/Search',
    });
  }
}
