import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamagedDisbursementRequest } from './damaged-disbursement-request';

describe('DamagedDisbursementRequest', () => {
  let component: DamagedDisbursementRequest;
  let fixture: ComponentFixture<DamagedDisbursementRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DamagedDisbursementRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(DamagedDisbursementRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
