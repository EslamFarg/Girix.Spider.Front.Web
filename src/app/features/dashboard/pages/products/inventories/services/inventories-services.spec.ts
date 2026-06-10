import { TestBed } from '@angular/core/testing';

import { InventoriesServices } from './inventories-services';

describe('InventoriesServices', () => {
  let service: InventoriesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoriesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
