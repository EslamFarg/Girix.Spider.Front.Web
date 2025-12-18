import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPurchasesRefunds } from './add-purchases-refunds';

describe('AddPurchasesRefunds', () => {
  let component: AddPurchasesRefunds;
  let fixture: ComponentFixture<AddPurchasesRefunds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPurchasesRefunds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPurchasesRefunds);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
