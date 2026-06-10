import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerTransferBetweenRepositry } from './explorer-transfer-between-repositry';

describe('ExplorerTransferBetweenRepositry', () => {
  let component: ExplorerTransferBetweenRepositry;
  let fixture: ComponentFixture<ExplorerTransferBetweenRepositry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerTransferBetweenRepositry],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerTransferBetweenRepositry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
