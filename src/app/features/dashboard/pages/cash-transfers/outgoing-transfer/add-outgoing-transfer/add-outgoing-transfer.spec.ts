import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOutgoingTransfer } from './add-outgoing-transfer';

describe('AddOutgoingTransfer', () => {
  let component: AddOutgoingTransfer;
  let fixture: ComponentFixture<AddOutgoingTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOutgoingTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(AddOutgoingTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
