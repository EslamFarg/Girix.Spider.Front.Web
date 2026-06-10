import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerOutgoingTransferApprove } from './explorer-outgoing-transfer-approve';

describe('ExplorerOutgoingTransferApprove', () => {
  let component: ExplorerOutgoingTransferApprove;
  let fixture: ComponentFixture<ExplorerOutgoingTransferApprove>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerOutgoingTransferApprove],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerOutgoingTransferApprove);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
