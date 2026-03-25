import { BaseCrudService } from '@/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JournalEntryService extends BaseCrudService<any, any, any> {
  ///v1/JournalEntry/Create
  override apiRoute = 'JournalEntry';

  /*
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      put: 'update',
    })
  }
 
}
