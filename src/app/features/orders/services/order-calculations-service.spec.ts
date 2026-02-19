import { TestBed } from '@angular/core/testing';

import { OrderCalculationsService } from './order-calculations-service';

describe('OrderCalculationsService', () => {
  let service: OrderCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
