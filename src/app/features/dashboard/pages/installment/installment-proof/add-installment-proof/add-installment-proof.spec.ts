import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInstallmentProof } from './add-installment-proof';

describe('AddInstallmentProof', () => {
  let component: AddInstallmentProof;
  let fixture: ComponentFixture<AddInstallmentProof>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInstallmentProof],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInstallmentProof);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
