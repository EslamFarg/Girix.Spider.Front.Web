import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsNav } from './products-nav';

describe('ProductsNav', () => {
  let component: ProductsNav;
  let fixture: ComponentFixture<ProductsNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
