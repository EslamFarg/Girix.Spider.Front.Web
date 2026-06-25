import { TestBed } from '@angular/core/testing';

import { DelegateServices } from './delegate-services';

describe('DelegateServices', () => {
  let service: DelegateServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DelegateServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
