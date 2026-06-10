import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInstallmentPayment } from './explorer-installment-payment';

describe('ExplorerInstallmentPayment', () => {
  let component: ExplorerInstallmentPayment;
  let fixture: ComponentFixture<ExplorerInstallmentPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInstallmentPayment],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInstallmentPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
