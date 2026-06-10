import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerEmployees } from './explorer-employees';

describe('ExplorerEmployees', () => {
  let component: ExplorerEmployees;
  let fixture: ComponentFixture<ExplorerEmployees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerEmployees],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerEmployees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
