import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerReceiptCustody } from './explorer-receipt-custody';

describe('ExplorerReceiptCustody', () => {
  let component: ExplorerReceiptCustody;
  let fixture: ComponentFixture<ExplorerReceiptCustody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerReceiptCustody],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerReceiptCustody);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
