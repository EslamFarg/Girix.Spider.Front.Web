import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesRefunds } from './purchases-refunds';

describe('PurchasesRefunds', () => {
  let component: PurchasesRefunds;
  let fixture: ComponentFixture<PurchasesRefunds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesRefunds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesRefunds);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
