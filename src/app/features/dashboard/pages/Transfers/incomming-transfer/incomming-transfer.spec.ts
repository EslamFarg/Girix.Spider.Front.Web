import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncommingTransfer } from './incomming-transfer';

describe('IncommingTransfer', () => {
  let component: IncommingTransfer;
  let fixture: ComponentFixture<IncommingTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncommingTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(IncommingTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
