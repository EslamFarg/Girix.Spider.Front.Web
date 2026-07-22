import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';

@Injectable({
  providedIn: 'root',
})
export class DirectTransferService extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/DirectTransfers',
      update: 'api/DirectTransfers',
      getById: 'api/DirectTransfers',
      delete: 'api/DirectTransfers',
      search: 'api/DirectTransfers/search',
      getAll: 'api/DirectTransfers/list',
    });
  }
}
