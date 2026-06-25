import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class UnitOfMeasure  extends BasehttpService{


  constructor(){
    super('',
      {
        "create":'api/unit',
        "getAll":'api/unit',
        "getById":'/api/unit',
        "update":'api/unit',
        "delete":'/api/unit',
        'search':'api/unit/Search'
      }
    )

  }
}
