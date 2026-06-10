import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDamagedDisbursementRequest } from './add-damaged-disbursement-request';

describe('AddDamagedDisbursementRequest', () => {
  let component: AddDamagedDisbursementRequest;
  let fixture: ComponentFixture<AddDamagedDisbursementRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDamagedDisbursementRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDamagedDisbursementRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
