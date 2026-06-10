import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOutgoingTransferApprove } from './add-outgoing-transfer-approve';

describe('AddOutgoingTransferApprove', () => {
  let component: AddOutgoingTransferApprove;
  let fixture: ComponentFixture<AddOutgoingTransferApprove>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOutgoingTransferApprove],
    }).compileComponents();

    fixture = TestBed.createComponent(AddOutgoingTransferApprove);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
