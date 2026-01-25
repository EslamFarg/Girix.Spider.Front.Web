import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesLayout } from './purchases-layout';

describe('PurchasesLayout', () => {
  let component: PurchasesLayout;
  let fixture: ComponentFixture<PurchasesLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
