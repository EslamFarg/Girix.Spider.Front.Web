import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerIncommingTransfer } from './explorer-incomming-transfer';

describe('ExplorerIncommingTransfer', () => {
  let component: ExplorerIncommingTransfer;
  let fixture: ComponentFixture<ExplorerIncommingTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerIncommingTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerIncommingTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
