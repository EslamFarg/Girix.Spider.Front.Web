import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerOutgoingTransfer } from './explorer-outgoing-transfer';

describe('ExplorerOutgoingTransfer', () => {
  let component: ExplorerOutgoingTransfer;
  let fixture: ComponentFixture<ExplorerOutgoingTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerOutgoingTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerOutgoingTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
