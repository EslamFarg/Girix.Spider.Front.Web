import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesNav } from './purchases-nav';

describe('PurchasesNav', () => {
  let component: PurchasesNav;
  let fixture: ComponentFixture<PurchasesNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
