import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class GroupsServices extends BasehttpService {
  constructor() {
    super('',{
      'create':'api/Category',
      'update':'api/Category',
      'getAll':'api/Category',
      'getById':'api/Category',
      'delete':'api/Category',
      'search':'api/Category/Search'
    });
  }
  
}
