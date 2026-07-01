import { TestBed } from '@angular/core/testing';

import { ProductCard } from './product-card';

describe('ProductCard', () => {
  let service: ProductCard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductCard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
