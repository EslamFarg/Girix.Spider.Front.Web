import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerIncommingChecks } from './explorer-incomming-checks';

describe('ExplorerIncommingChecks', () => {
  let component: ExplorerIncommingChecks;
  let fixture: ComponentFixture<ExplorerIncommingChecks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerIncommingChecks],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerIncommingChecks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
