import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class SectionsService extends BasehttpService {

  // /api/Department
  // /api/Department/GetById/{id}
  // GetById
  // /api/Department/GetAll
  
  constructor() {
    super('',{
      'create':'api/Department/Create',
      'update':'api/Department/Update',
      'getAll':'api/Department/GetAll',
      'getById':'api/Department/GetById',
      'delete':'api/Department/Delete',
      'search':'api/Department/Search'
    });
  }
}
