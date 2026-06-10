import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerDamagedDisbursementRequest } from './explorer-damaged-disbursement-request';

describe('ExplorerDamagedDisbursementRequest', () => {
  let component: ExplorerDamagedDisbursementRequest;
  let fixture: ComponentFixture<ExplorerDamagedDisbursementRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerDamagedDisbursementRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerDamagedDisbursementRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
