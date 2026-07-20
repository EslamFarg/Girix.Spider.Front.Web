import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class GroupsService extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/Groups/Create',
      update: 'api/Groups/Update',
      delete: 'api/Groups/Delete',
      getAll: 'api/Groups/GetAll',
      getById: 'api/Groups/GetById',
      search: 'api/Groups/Search',
    });
  }
}
