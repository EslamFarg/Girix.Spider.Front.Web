import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerOpeningBalance } from './explorer-opening-balance';

describe('ExplorerOpeningBalance', () => {
  let component: ExplorerOpeningBalance;
  let fixture: ComponentFixture<ExplorerOpeningBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerOpeningBalance],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerOpeningBalance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
