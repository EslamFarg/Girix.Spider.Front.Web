import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostcenterAndProjects } from './costcenter-and-projects';

describe('CostcenterAndProjects', () => {
  let component: CostcenterAndProjects;
  let fixture: ComponentFixture<CostcenterAndProjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostcenterAndProjects],
    }).compileComponents();

    fixture = TestBed.createComponent(CostcenterAndProjects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
