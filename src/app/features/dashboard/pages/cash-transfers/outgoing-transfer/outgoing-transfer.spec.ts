import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingTransfer } from './outgoing-transfer';

describe('OutgoingTransfer', () => {
  let component: OutgoingTransfer;
  let fixture: ComponentFixture<OutgoingTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutgoingTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(OutgoingTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
