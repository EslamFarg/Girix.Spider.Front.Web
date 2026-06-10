import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBetweenRepositry } from './transfer-between-repositry';

describe('TransferBetweenRepositry', () => {
  let component: TransferBetweenRepositry;
  let fixture: ComponentFixture<TransferBetweenRepositry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferBetweenRepositry],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferBetweenRepositry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
