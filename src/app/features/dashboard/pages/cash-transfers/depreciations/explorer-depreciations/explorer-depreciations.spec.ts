import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerDepreciations } from './explorer-depreciations';

describe('ExplorerDepreciations', () => {
  let component: ExplorerDepreciations;
  let fixture: ComponentFixture<ExplorerDepreciations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerDepreciations],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerDepreciations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
