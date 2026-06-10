import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIncommingTransfer } from './add-incomming-transfer';

describe('AddIncommingTransfer', () => {
  let component: AddIncommingTransfer;
  let fixture: ComponentFixture<AddIncommingTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIncommingTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(AddIncommingTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
