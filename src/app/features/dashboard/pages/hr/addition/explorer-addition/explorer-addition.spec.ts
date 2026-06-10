import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerAddition } from './explorer-addition';

describe('ExplorerAddition', () => {
  let component: ExplorerAddition;
  let fixture: ComponentFixture<ExplorerAddition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerAddition],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerAddition);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
