import { TestBed } from '@angular/core/testing';

import { ProductsAndMealsService } from './products-and-meals-service';

describe('ProductsAndMealsService', () => {
  let service: ProductsAndMealsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsAndMealsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
