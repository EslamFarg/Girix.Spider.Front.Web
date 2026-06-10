import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingTransferApprove } from './outgoing-transfer-approve';

describe('OutgoingTransferApprove', () => {
  let component: OutgoingTransferApprove;
  let fixture: ComponentFixture<OutgoingTransferApprove>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutgoingTransferApprove],
    }).compileComponents();

    fixture = TestBed.createComponent(OutgoingTransferApprove);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
