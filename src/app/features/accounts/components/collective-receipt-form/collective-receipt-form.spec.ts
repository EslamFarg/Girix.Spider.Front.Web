import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveReceiptForm } from './collective-receipt-form';

describe('CollectiveReceiptForm', () => {
  let component: CollectiveReceiptForm;
  let fixture: ComponentFixture<CollectiveReceiptForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveReceiptForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectiveReceiptForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
