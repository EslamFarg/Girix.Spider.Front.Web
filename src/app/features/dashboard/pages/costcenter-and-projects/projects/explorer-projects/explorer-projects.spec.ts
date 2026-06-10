import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerProjects } from './explorer-projects';

describe('ExplorerProjects', () => {
  let component: ExplorerProjects;
  let fixture: ComponentFixture<ExplorerProjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerProjects],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerProjects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
